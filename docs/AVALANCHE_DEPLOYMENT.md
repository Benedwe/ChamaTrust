# Avalanche Fuji Deployment Guide

## Prerequisites

- Node.js 20 or newer.
- Fuji AVAX for gas.
- A deployer wallet private key.
- RPC URL for Avalanche Fuji.

## Configure Environment

Copy `.env.example` to `.env` and set:

```bash
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_deployer_private_key
```

## Compile And Test

```bash
npm install
npm run test:contracts
```

## Deploy

```bash
npm run deploy:fuji
```

The script deploys:

- `MockStablecoin` for demos and hackathon testing.
- `ChamaTrust` governance and treasury contract.

For production, replace `MockStablecoin` with an audited stablecoin or regulated settlement token.

## Post-Deployment Checklist

- Verify contract addresses on Snowtrace.
- Store deployment addresses in backend configuration.
- Assign `OPERATOR_ROLE` only to a multisig or operations safe.
- Run a deposit, proposal, vote, execute, repay, and withdrawal simulation before demoing.
- Document treasury operating policy for off-chain Mobile Money settlement.
