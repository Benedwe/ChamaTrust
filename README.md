# ChamaTrust

ChamaTrust is a decentralized savings, lending, and governance platform for African Vicoba, Chama, SACCO, and community savings groups. It combines Mobile Money simplicity with Avalanche transparency, keeping blockchain complexity mostly invisible to everyday members.

## What Is Included

- Mobile-first fintech dashboard built with React, Vite, Tailwind CSS, Framer Motion, React Query, Ethers.js, and Recharts.
- Express and MongoDB API architecture for members, groups, contributions, loans, governance, wallet auth, and Mobile Money rails.
- Solidity smart contract for savings groups, loan proposals, voting, repayments, reputation, and treasury controls.
- Hardhat deployment and unit test scaffolding for Avalanche Fuji.
- Documentation for architecture, Mobile Money integration, Avalanche deployment, security, and investor demo data.

## Quick Start

```bash
npm install
npm run dev:web
```

Run the API:

```bash
npm run dev:api
```

Run contracts:

```bash
npm run test:contracts
```

## Environment

Copy `.env.example` to `.env` and fill in values for MongoDB, JWT signing, Avalanche Fuji RPC, deployer key, and Mobile Money provider credentials.

## Product Promise

Members see familiar actions: join, deposit, vote, borrow, repay, withdraw. Under the hood, ChamaTrust records transparent treasury state on Avalanche and coordinates Mobile Money settlement through secure backend provider adapters.
# ChamaTrust
