# Mobile Money Integration Guide

## Supported Providers

ChamaTrust is designed for:

- M-Pesa
- Airtel Money
- Tigo Pesa
- HaloPesa
- Pesapal

Provider-specific credentials live in environment variables and are consumed by adapter modules under `apps/api/src/services`.

For Pesapal, add checkout key and secret to `.env` and configure a callback URL for webhook notifications.

> Note: If you are deploying with Pesapal only, the M-Pesa/Airtel/Tigo/Halo credentials are optional and can remain empty.

## Deposit Flow

```text
M-Pesa -> Blockchain Wallet -> Chama Treasury
```

1. Member chooses provider and enters phone number.
2. API validates phone, amount, limits, and Chama membership.
3. Provider adapter sends STK push or payment prompt.
4. Webhook confirms provider settlement.
5. Backend records transaction and triggers stablecoin credit.
6. Smart contract records savings deposit.
7. Frontend updates dashboard, rankings, heatmap, and treasury charts.

## Withdrawal Flow

```text
Chama Treasury -> Blockchain Wallet -> Mobile Money
```

1. Member requests withdrawal or loan disbursement.
2. Smart contract validates approval and releases funds.
3. Backend receives or indexes transaction event.
4. Provider adapter initiates Mobile Money payout.
5. API stores payout reference and status.
6. Member receives funds in mobile wallet.

## Webhooks

Production integrations should expose signed webhook endpoints:

- `/mobile-money/webhooks/mpesa`
- `/mobile-money/webhooks/airtel`
- `/mobile-money/webhooks/tigo-pesa`
- `/mobile-money/webhooks/halopesa`
- `/mobile-money/webhooks/pesapal`

Pesapal webhooks should be verified with the merchant secret to confirm origin and update transaction status reliably.

Each webhook should verify provider signatures, idempotency keys, amount, currency, reference, and expected account.

## Settlement Controls

- Daily member limits.
- Group treasury limits.
- Manual review for large transactions.
- Provider reconciliation reports.
- Contract event reconciliation.
- Two-person approval for payout retries.
