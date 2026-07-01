# ChamaTrust

> **A decentralised savings, lending & governance platform for African Vicoba, Chama, SACCO, and community savings groups.**
> Combines Mobile Money simplicity with Avalanche blockchain transparency — keeping on-chain complexity invisible to everyday members.

---

## Demo Video

<video src="./Media/Screencast%20from%202026-06-21%2001-25-29.webm" controls width="100%">
  Watch the ChamaTrust demo video.
</video>

[▶ Watch the ChamaTrust demo video](./Media/Screencast%20from%202026-06-21%2001-25-29.webm)

---

## 🚀 Demo Quick Start (Presentation Guide)

Follow these steps **in order** to launch ChamaTrust for a live demo.
You need **three terminal windows** (or tabs).

### Prerequisites

| Tool        | Version   | Check with           |
|-------------|-----------|----------------------|
| Node.js     | ≥ 18      | `node -v`            |
| npm         | ≥ 9       | `npm -v`             |
| MongoDB     | ≥ 7       | `mongod --version`   |

### Step 1 — Install Dependencies (one-time)

```bash
npm install
```

### Step 2 — Start MongoDB  *(Terminal 1)*

```bash
mongod --dbpath .local/mongodb/data \
       --logpath .local/mongodb/logs/mongod.log \
       --port 27017 --fork
```

> If the data directory doesn't exist yet:
> ```bash
> mkdir -p .local/mongodb/data .local/mongodb/logs
> ```

Verify it's running:

```bash
npm run db:status
```

You should see:
```
✅ Connected to MongoDB 8.0.26
📦 Database: chamatrustdb
```

### Step 3 — Seed the Database  *(Terminal 1)*

```bash
npm run db:seed
```

This populates `chamatrustdb` with **6 users, 2 chamas, 11 transactions, 3 loans, and 3 meetings** — all with realistic East African demo data.

> To reset and reseed from scratch:
> ```bash
> npm run db:seed:force
> ```

### Step 4 — Start the API Server  *(Terminal 2)*

```bash
npm run dev:api
```

The API starts at **http://localhost:8080**.

> If port 8080 is occupied, start on another port:
> ```bash
> PORT=8081 npm run dev:api
> ```

You should see:
```
ChamaTrust API connected to MongoDB
ChamaTrust API listening on 8080
```

### Step 5 — Start the Web App  *(Terminal 3)*

```bash
npm run dev:web
```

The frontend starts at **http://localhost:5173**. Open this URL in your browser to begin the demo.

---

## 🔐 Demo Login Credentials

| Role     | Email                         | Password     |
|----------|-------------------------------|--------------|
| **Admin**   | `amina@chamatrust.demo`    | `Demo@1234`  |
| **Member**  | `joseph@chamatrust.demo`   | `Demo@1234`  |
| **Member**  | `grace@chamatrust.demo`    | `Demo@1234`  |
| **Auditor** | `david@chamatrust.demo`    | `Demo@1234`  |
| **Member**  | `fatuma@chamatrust.demo`   | `Demo@1234`  |
| **Member**  | `peter@chamatrust.demo`    | `Demo@1234`  |

> **Recommended for the demo:** Log in as **Amina Mwangi** (admin) — she has full access to both chamas, governance, loans, and meetings.

---

## 🗂️ Demo Data Overview

### Chamas (Savings Groups)

| Name                     | Country   | Currency | Members | Min. Contribution |
|--------------------------|-----------|----------|---------|-------------------|
| Umoja Savings Circle     | Kenya 🇰🇪  | KES      | 4       | 5,000             |
| Jamii Prosperity Fund    | Tanzania 🇹🇿 | TZS   | 3       | 10,000            |

### Loans

| Borrower         | Amount    | Purpose                        | Status     |
|------------------|-----------|--------------------------------|------------|
| Joseph Ochieng   | KES 25,000 | Small business — poultry supplies | Approved  |
| Grace Njeri      | KES 15,000 | School fees — Term 2           | Pending    |
| Fatuma Hassan    | TZS 50,000 | Market stall expansion         | Disbursed  |

### Transactions
11 transactions across **M-Pesa**, **Airtel Money**, **Tigo Pesa**, **HaloPesa**, and **Avalanche** — including confirmed deposits, a settled repayment, a failed timeout, and an initiated withdrawal.

### Meetings
3 AI-summarised meetings with full transcripts, decisions, and action items — including a monthly review, Q2 planning session, and an emergency loan discussion.

---

## 🧰 Available Scripts

| Command                  | Description                                   |
|--------------------------|-----------------------------------------------|
| `npm run dev:web`        | Start the React frontend (Vite, port 5173)    |
| `npm run dev:api`        | Start the Express API server (port 8080)      |
| `npm run start:web`      | Start the built frontend for production preview |
| `npm run start:api`      | Start the Express API server in production mode |
| `npm run db:seed`        | Seed MongoDB with demo data (skips if exists) |
| `npm run db:seed:force`  | Drop all data and reseed from scratch         |
| `npm run db:status`      | Show DB connection health and document counts |
| `npm run build`          | Production build of the web app               |
| `npm run test:contracts` | Run Hardhat smart contract tests              |
| `npm run deploy:fuji`    | Deploy contracts to Avalanche Fuji testnet    |

---

## 🏗️ Project Structure

```
ChamaTrust/
├── apps/
│   ├── web/                 # React + Vite frontend
│   │   └── src/
│   │       ├── components/  # AuthScreen, Dashboard, AI Insights, Meetings…
│   │       ├── lib/         # Auth helpers, API client
│   │       └── styles/      # CSS stylesheets
│   └── api/                 # Express + MongoDB backend
│       └── src/
│           ├── models/      # User, Chama, Transaction, Loan, Meeting
│           ├── routes/      # Auth, Chamas, Governance, Loans, Mobile Money…
│           ├── middleware/   # Auth guard, error handler
│           └── services/    # Fraud detection, reputation, analytics
├── contracts/               # Solidity smart contracts
├── scripts/                 # Deploy, seed-db, db-status
├── docs/                    # Architecture, API, Security docs
├── .env                     # Environment variables (local)
└── hardhat.config.js        # Avalanche Fuji deployment config
```

---

## ⚙️ Environment

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable                    | Purpose                              |
|-----------------------------|--------------------------------------|
| `MONGODB_URI`               | MongoDB connection string            |
| `JWT_SECRET`                | JWT signing secret                   |
| `FUJI_RPC_URL`              | Avalanche Fuji RPC endpoint          |
| `PRIVATE_KEY`               | Deployer wallet private key          |
| `TREASURY_SETTLEMENT_WALLET`| On-chain treasury address            |
| `MPESA_CONSUMER_KEY`        | M-Pesa API key                       |
| `MPESA_CONSUMER_SECRET`     | M-Pesa API secret                    |
| `AIRTEL_CLIENT_ID`          | Airtel Money client ID               |
| `AIRTEL_CLIENT_SECRET`      | Airtel Money client secret           |
| `TIGO_PESA_CLIENT_ID`       | Tigo Pesa client ID                  |
| `HALOPESA_CLIENT_ID`        | HaloPesa client ID                   |
| `HALOPESA_CLIENT_SECRET`     | HaloPesa client secret               |
| `PESAPAL_CONSUMER_KEY`      | Pesapal merchant consumer key        |
| `PESAPAL_CONSUMER_SECRET`   | Pesapal merchant consumer secret     |
| `PESAPAL_CALLBACK_URL`      | Pesapal webhook/return callback URL  |

> If you use Pesapal as your primary payment gateway, the legacy Mobile Money provider keys are optional and can remain blank for a minimum viable deployment.
---

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Mobile Money Integration](./docs/MOBILE_MONEY_INTEGRATION.md)
- [Avalanche Deployment](./docs/AVALANCHE_DEPLOYMENT.md)
- [Security](./docs/SECURITY.md)
- [Roadmap](./docs/ROADMAP.md)

---

## 💡 Product Promise

Members see familiar actions: **join → deposit → vote → borrow → repay → withdraw**.  
Under the hood, ChamaTrust records transparent treasury state on Avalanche and coordinates Mobile Money settlement through secure backend provider adapters.

---

<p align="center"><strong>ChamaTrust</strong> — Community finance, powered by trust and transparency.</p>
