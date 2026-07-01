# ChamaTrust Architecture

## Product Layers

ChamaTrust is split into four layers:

1. Mobile-first member experience in `apps/web`.
2. Secure orchestration API in `apps/api`.
3. Avalanche smart contracts in `contracts`.
4. Provider and analytics adapters for Mobile Money, AI insights, and future IPFS storage.

## User Journey

Members interact with familiar actions:

- Join a savings group.
- Deposit with M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, or Pesapal.
- Vote on a loan request.
- Track savings, treasury activity, loan performance, and trust score.
- Withdraw through Mobile Money after contract approval.

Blockchain language is intentionally minimized in the UI. Wallet and contract activity appears as "secure wallet", "transparent treasury", and "verified transaction" unless the user opens the transaction explorer.

## Data Flow

Deposit:

```text
Mobile Money Provider -> ChamaTrust API -> Fraud Checks -> Stablecoin Mint/Transfer -> ChamaTrust Contract -> Treasury Record
```

Withdrawal:

```text
Governance Approval -> Contract Validation -> Treasury Transfer -> ChamaTrust API -> Provider Payout -> Member Mobile Wallet
```

## Frontend

`apps/web` contains:

- Reusable glass cards, metrics, animated flow rails, and chart components.
- Dashboard views for treasury, growth, governance, rankings, heatmaps, transaction explorer, and advisor insights.
- Wallet signature login helper using Ethers.
- Demo data shaped like real production API responses.

## Backend

`apps/api` contains:

- Wallet signature authentication.
- MongoDB models for Chamas, Loans, and Transactions.
- Mobile Money provider abstraction.
- Fraud monitoring and transaction flags.
- Loan risk and reputation services.
- REST routes for groups, loans, votes, transactions, deposits, and withdrawals.

## Smart Contracts

`contracts/ChamaTrust.sol` provides:

- Chama creation and membership.
- ERC20 savings deposits.
- Loan proposal creation.
- Democratic voting with quorum.
- Approved proposal execution.
- Repayment tracking.
- Reputation score calculation.
- Operator-gated treasury withdrawals for approved off-ramp flows.

## Future Expansion

The architecture leaves room for:

- Avalanche Subnets for regulated SACCO ecosystems.
- Stablecoin issuer integrations.
- USSD and offline agent flows.
- IPFS proposal attachments.
- AI credit scoring and agricultural finance products.
- National digital identity and KYC provider hooks.
