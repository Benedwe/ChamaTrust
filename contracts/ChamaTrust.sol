// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ChamaTrust is AccessControl, ReentrancyGuard {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    enum ProposalStatus {
        Pending,
        Approved,
        Rejected,
        Executed,
        Repaid
    }

    struct Chama {
        string name;
        address token;
        uint256 treasuryBalance;
        uint256 quorum;
        bool active;
        address[] members;
    }

    struct MemberScore {
        uint256 totalContributed;
        uint256 totalRepaid;
        uint256 votesCast;
        uint256 loansCompleted;
        uint256 joinedAt;
    }

    struct LoanProposal {
        uint256 chamaId;
        address borrower;
        uint256 amount;
        string purpose;
        uint256 approvals;
        uint256 rejections;
        uint256 createdAt;
        ProposalStatus status;
    }

    uint256 public nextChamaId = 1;
    uint256 public nextProposalId = 1;

    mapping(uint256 => Chama) public chamas;
    mapping(uint256 => mapping(address => bool)) public isMember;
    mapping(uint256 => mapping(address => MemberScore)) public memberScores;
    mapping(uint256 => LoanProposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ChamaCreated(uint256 indexed chamaId, string name, address indexed creator, address indexed token);
    event MemberJoined(uint256 indexed chamaId, address indexed member);
    event SavingsDeposited(uint256 indexed chamaId, address indexed member, uint256 amount);
    event LoanRequested(uint256 indexed proposalId, uint256 indexed chamaId, address indexed borrower, uint256 amount, string purpose);
    event ProposalVoted(uint256 indexed proposalId, address indexed voter, bool support, uint256 approvals, uint256 rejections);
    event ProposalExecuted(uint256 indexed proposalId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed proposalId, address indexed borrower, uint256 amount);
    event TreasuryWithdrawn(uint256 indexed chamaId, address indexed recipient, uint256 amount);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
    }

    function createChama(string calldata name, address token, uint256 quorum) external returns (uint256 chamaId) {
        require(bytes(name).length > 2, "name too short");
        require(token != address(0), "token required");
        require(quorum > 0, "quorum required");

        chamaId = nextChamaId++;
        Chama storage chama = chamas[chamaId];
        chama.name = name;
        chama.token = token;
        chama.quorum = quorum;
        chama.active = true;
        chama.members.push(msg.sender);
        isMember[chamaId][msg.sender] = true;
        memberScores[chamaId][msg.sender].joinedAt = block.timestamp;

        emit ChamaCreated(chamaId, name, msg.sender, token);
        emit MemberJoined(chamaId, msg.sender);
    }

    function joinChama(uint256 chamaId) external {
        Chama storage chama = _activeChama(chamaId);
        require(!isMember[chamaId][msg.sender], "already member");

        chama.members.push(msg.sender);
        isMember[chamaId][msg.sender] = true;
        memberScores[chamaId][msg.sender].joinedAt = block.timestamp;

        emit MemberJoined(chamaId, msg.sender);
    }

    function depositSavings(uint256 chamaId, uint256 amount) external nonReentrant {
        Chama storage chama = _activeChama(chamaId);
        require(isMember[chamaId][msg.sender], "not member");
        require(amount > 0, "amount required");

        IERC20(chama.token).transferFrom(msg.sender, address(this), amount);
        chama.treasuryBalance += amount;
        memberScores[chamaId][msg.sender].totalContributed += amount;

        emit SavingsDeposited(chamaId, msg.sender, amount);
    }

    function submitLoanRequest(uint256 chamaId, uint256 amount, string calldata purpose) external returns (uint256 proposalId) {
        Chama storage chama = _activeChama(chamaId);
        require(isMember[chamaId][msg.sender], "not member");
        require(amount > 0 && amount <= chama.treasuryBalance, "invalid amount");

        proposalId = nextProposalId++;
        proposals[proposalId] = LoanProposal({
            chamaId: chamaId,
            borrower: msg.sender,
            amount: amount,
            purpose: purpose,
            approvals: 0,
            rejections: 0,
            createdAt: block.timestamp,
            status: ProposalStatus.Pending
        });

        emit LoanRequested(proposalId, chamaId, msg.sender, amount, purpose);
    }

    function voteOnProposal(uint256 proposalId, bool support) external {
        LoanProposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Pending, "proposal closed");
        require(isMember[proposal.chamaId][msg.sender], "not member");
        require(!hasVoted[proposalId][msg.sender], "already voted");

        hasVoted[proposalId][msg.sender] = true;
        memberScores[proposal.chamaId][msg.sender].votesCast += 1;

        if (support) {
            proposal.approvals += 1;
            if (proposal.approvals >= chamas[proposal.chamaId].quorum) {
                proposal.status = ProposalStatus.Approved;
            }
        } else {
            proposal.rejections += 1;
            if (proposal.rejections >= chamas[proposal.chamaId].quorum) {
                proposal.status = ProposalStatus.Rejected;
            }
        }

        emit ProposalVoted(proposalId, msg.sender, support, proposal.approvals, proposal.rejections);
    }

    function executeApprovedProposal(uint256 proposalId) external nonReentrant {
        LoanProposal storage proposal = proposals[proposalId];
        Chama storage chama = _activeChama(proposal.chamaId);
        require(proposal.status == ProposalStatus.Approved, "not approved");
        require(chama.treasuryBalance >= proposal.amount, "insufficient treasury");

        proposal.status = ProposalStatus.Executed;
        chama.treasuryBalance -= proposal.amount;
        IERC20(chama.token).transfer(proposal.borrower, proposal.amount);

        emit ProposalExecuted(proposalId, proposal.borrower, proposal.amount);
    }

    function repayLoan(uint256 proposalId, uint256 amount) external nonReentrant {
        LoanProposal storage proposal = proposals[proposalId];
        Chama storage chama = _activeChama(proposal.chamaId);
        require(proposal.status == ProposalStatus.Executed, "loan not active");
        require(msg.sender == proposal.borrower, "not borrower");
        require(amount >= proposal.amount, "full repayment required");

        IERC20(chama.token).transferFrom(msg.sender, address(this), amount);
        proposal.status = ProposalStatus.Repaid;
        chama.treasuryBalance += amount;
        MemberScore storage score = memberScores[proposal.chamaId][msg.sender];
        score.totalRepaid += amount;
        score.loansCompleted += 1;

        emit LoanRepaid(proposalId, msg.sender, amount);
    }

    function withdrawTreasury(uint256 chamaId, address recipient, uint256 amount) external onlyRole(OPERATOR_ROLE) nonReentrant {
        Chama storage chama = _activeChama(chamaId);
        require(recipient != address(0), "recipient required");
        require(amount <= chama.treasuryBalance, "insufficient treasury");

        chama.treasuryBalance -= amount;
        IERC20(chama.token).transfer(recipient, amount);

        emit TreasuryWithdrawn(chamaId, recipient, amount);
    }

    function calculateReputationScore(uint256 chamaId, address member) external view returns (uint256) {
        MemberScore memory score = memberScores[chamaId][member];
        uint256 contribution = _cap(score.totalContributed / 1e18, 35);
        uint256 repayment = _cap(score.totalRepaid / 1e18, 35);
        uint256 governance = _cap(score.votesCast * 5, 20);
        uint256 reliability = _cap(score.loansCompleted * 5, 10);
        return contribution + repayment + governance + reliability;
    }

    function getMembers(uint256 chamaId) external view returns (address[] memory) {
        return chamas[chamaId].members;
    }

    function _activeChama(uint256 chamaId) private view returns (Chama storage chama) {
        chama = chamas[chamaId];
        require(chama.active, "chama inactive");
    }

    function _cap(uint256 value, uint256 maxValue) private pure returns (uint256) {
        return value > maxValue ? maxValue : value;
    }
}
