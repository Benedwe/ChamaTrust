# API Reference

Base URL in development: `http://localhost:8080`

## Health

`GET /health`

Returns API health.

## Wallet Authentication

`POST /auth/wallet`

Body:

```json
{
  "address": "0x...",
  "message": "Sign in to ChamaTrust...",
  "signature": "0x..."
}
```

## Chamas

`GET /chamas`

`POST /chamas`

Creates a Chama and makes the authenticated wallet the admin.

`POST /chamas/:id/join`

Adds the authenticated wallet as a member.

## Mobile Money

`GET /mobile-money/providers`

`POST /mobile-money/deposit`

Starts a Mobile Money collection and returns:

```text
Provider -> Blockchain Wallet -> Chama Treasury
```

`POST /mobile-money/withdraw`

Starts a payout after contract approval and returns:

```text
Chama Treasury -> Blockchain Wallet -> Mobile Money
```

## Loans And Governance

`GET /loans`

`POST /loans`

Creates a loan proposal with AI-style risk guidance.

`POST /governance/loans/:id/vote`

Records a member vote.

## Transactions

`GET /transactions`

`GET /transactions/:reference`
