# Security Model

## Authentication

- Wallet signature authentication proves control of a Web3 wallet.
- API sessions are issued as short-lived JWTs.
- MFA can be layered on top of phone ownership and wallet signatures.

## API Security

- Helmet security headers.
- CORS allowlist.
- JSON request size limits.
- Rate limiting.
- Zod request validation.
- Fraud flags for large amounts, daily limits, and phone format anomalies.

## Smart Contract Security

- Solidity `^0.8.24` overflow checks.
- OpenZeppelin `AccessControl`.
- OpenZeppelin `ReentrancyGuard`.
- ERC20 transfers are isolated behind non-reentrant methods.
- Indexed events for auditability and off-chain indexing.
- Operator withdrawals are role-gated and should be assigned to a multisig.

## Audit Checklist

- Test quorum edge cases.
- Test non-member restrictions.
- Test duplicate votes.
- Test insufficient treasury.
- Test failed token transfers with non-standard ERC20s.
- Add invariant tests for treasury balance accounting.
- Run Slither and Mythril before mainnet deployment.

## Secrets

- Never commit `.env`.
- Use a cloud secret manager for provider keys and deployer credentials.
- Use separate wallets for deployment, operations, and treasury custody.
