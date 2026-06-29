# ChamaTrust Pitch Deck

## 1. Title

### ChamaTrust

**M-Pesa-simple community banking with transparent treasury controls for African savings groups.**

ChamaTrust helps Chama, Vicoba, SACCO, and community savings groups collect contributions, govern loans, track trust, and move money through familiar Mobile Money rails while recording treasury activity on Avalanche.

**Ask:** Pilot partners, regulated fintech/Mobile Money partners, and seed funding to move from demo to live pilots.

---

## 2. Problem

Community finance groups already work, but their tools are fragile.

- Contributions are often tracked through chat, spreadsheets, paper ledgers, or one treasurer's phone.
- Members have limited real-time visibility into balances, loan approvals, repayments, and withdrawals.
- Fraud, late repayments, informal governance, and missing records can damage trust.
- Formal lenders and SACCO partners lack reliable group-level data for responsible credit decisions.

The result: groups with strong social trust still struggle to scale financial trust.

---

## 3. Why Now

The infrastructure is finally ready.

- Mobile Money is already trusted behavior across African markets.
- GSMA reports **2.3 billion registered mobile money accounts**, **593 million active 30-day accounts**, and **$2.1 trillion** in annual transaction value in 2025.
- The World Bank Global Findex 2025 reports that **79% of adults globally now have an account**, and **84% of adults in low- and middle-income countries own a mobile phone**.
- Stablecoins, tokenized deposits, and fast settlement networks create a new treasury layer for community finance.

ChamaTrust does not ask users to learn crypto. It uses blockchain as trust infrastructure behind familiar payment flows.

---

## 4. Solution

ChamaTrust is a mobile-first operating system for savings groups.

Members can:

- Join a group.
- Deposit through M-Pesa, Airtel Money, Tigo Pesa, or HaloPesa.
- Vote on loans.
- Track savings, treasury activity, repayments, rankings, and trust scores.
- Withdraw or receive loan disbursements through Mobile Money after approval.

Group leaders get a cleaner ledger, stronger governance, fraud flags, member reputation, and partner-ready records.

---

## 5. Product

ChamaTrust combines four product layers:

- **Mobile dashboard:** treasury, contributions, rankings, loan performance, governance, advisor insights, and transaction explorer.
- **Secure API:** wallet authentication, group records, deposits, withdrawals, fraud checks, loan risk, and provider adapters.
- **Smart contracts:** group creation, membership, savings deposits, loan proposals, voting, execution, repayment, reputation, and treasury controls.
- **Provider adapters:** Mobile Money collection and payout flow designed for M-Pesa, Airtel Money, Tigo Pesa, and HaloPesa.

The user sees "deposit", "vote", "borrow", and "repay". The system handles settlement, auditability, and reconciliation.

---

## 6. Demo Flow

The current demo shows the complete member journey.

1. Open the dashboard and show treasury balance, savings growth, health score, member rankings, and loan performance.
2. Trigger a Mobile Money deposit flow.
3. Open a loan proposal and review risk guidance.
4. Vote and show quorum progress.
5. Inspect provider and Avalanche transaction activity.
6. Highlight ChamaTrust Advisor recommendations and trust badges.

This positions the product as a practical financial tool, not a crypto app looking for a use case.

---

## 7. Business Model

ChamaTrust can monetize through multiple aligned channels.

- **Transaction fees:** small fee on deposits, withdrawals, and loan disbursements.
- **SaaS subscriptions:** admin dashboards for SACCOs, NGOs, cooperatives, and community finance operators.
- **Loan origination fees:** partner lenders pay for qualified, consent-based group credit opportunities.
- **Risk and analytics tooling:** fraud monitoring, repayment trends, and group health reporting.
- **White-label infrastructure:** community finance stack for fintechs, MFIs, and regulated institutions.

The wedge is savings group operations. The upside is trusted community financial infrastructure.

---

## 8. Go-To-Market

Start with high-trust pilots, then expand through institutions.

- **Pilot users:** Chama, Vicoba, and SACCO groups with active Mobile Money behavior.
- **Channel partners:** SACCO networks, NGOs, churches/mosques, women-led savings networks, and local fintech agents.
- **Integration partners:** Mobile Money providers, regulated stablecoin/tokenized deposit issuers, KYC providers, and lenders.
- **Launch market focus:** East Africa first, where Mobile Money behavior and savings group culture are already strong.

Pilot success should be measured by contribution reliability, active members, loan repayment visibility, treasury reconciliation, and repeat group usage.

---

## 9. Moat

ChamaTrust compounds trust data and workflow depth.

- Community-specific UX built around real savings group behavior.
- Transparent treasury history without exposing members to blockchain complexity.
- Reputation built from contributions, voting, repayment, and group participation.
- Provider reconciliation across Mobile Money and on-chain records.
- Governance primitives that become harder to replace once a group depends on them.
- Future readiness for USSD, WhatsApp reminders, identity/KYC, compliance reporting, and regulated settlement rails.

The strongest moat is becoming the trusted operating record for groups before credit and insurance partners arrive.

---

## 10. Roadmap

### Phase 1: Demo and Validation

- Mobile dashboard.
- Demo Mobile Money adapters.
- Avalanche Fuji contract deployment.
- Loan voting and execution.
- Deterministic advisor insights.

### Phase 2: Pilot

- Real M-Pesa sandbox integration.
- Webhook reconciliation.
- Admin portal.
- Member KYC.
- Multisig treasury operations.
- SMS and WhatsApp contribution reminders.

### Phase 3: Production

- Regulated stablecoin or tokenized deposit support.
- SACCO compliance reporting.
- Fraud analytics.
- AI credit scoring.
- USSD flows.
- Avalanche Subnet readiness.

---

## 11. Funding Use

Seed capital should reduce the largest execution risks.

- Mobile Money sandbox-to-production integrations.
- Security review for API, custody assumptions, and smart contracts.
- Pilot onboarding, training, support, and field operations.
- Compliance work for KYC, data protection, and regulated payment partners.
- Product engineering for admin tools, reconciliation, USSD, WhatsApp, and analytics.
- Partnership development with SACCOs, lenders, NGOs, and Mobile Money providers.

Recommended first milestone: 3-5 pilots with live payment reconciliation, active governance, and measurable repayment visibility.

---

## 12. Closing

ChamaTrust turns trusted community savings behavior into trusted digital financial infrastructure.

It meets users where they already are: Mobile Money, group governance, and practical credit needs.

Underneath, it adds the missing layer: transparent treasury records, programmable controls, auditable voting, and reputation that can unlock better financial services.

**ChamaTrust: community finance that members can use, leaders can trust, and partners can underwrite.**

---

## Appendix: Key Risks And Mitigations

- **Regulatory risk:** partner with licensed Mobile Money, KYC, and settlement providers before production money movement.
- **Smart contract risk:** use audited libraries, complete test coverage, external audit, bug bounty, and conservative upgrade/permission design.
- **User adoption risk:** keep blockchain language hidden, support Mobile Money-first onboarding, and train group admins.
- **Fraud and disputes:** signed webhooks, idempotency, transaction limits, reconciliation, manual review, and clear role-based approvals.
- **Liquidity and credit risk:** start with group-funded loans before expanding into partner lending.

---

## Appendix: Proof Points In The Repository

- Web app: `apps/web`
- API service: `apps/api`
- Smart contract: `contracts/ChamaTrust.sol`
- Demo notes: `presentation/INVESTOR_DEMO.md`
- Architecture: `docs/ARCHITECTURE.md`
- Mobile Money plan: `docs/MOBILE_MONEY_INTEGRATION.md`
- Security model: `docs/SECURITY.md`
- Roadmap: `docs/ROADMAP.md`

---

## Sources

- GSMA, **The State of the Industry Report on Mobile Money 2026**: https://www.gsma.com/sotir/
- World Bank, **The Global Findex Database 2025**: https://www.worldbank.org/en/publication/globalfindex

---

## Open Items Before External Fundraising

- Add founder/team bios.
- Add pilot letters of intent or customer discovery evidence.
- Add a financial model with pricing, CAC assumptions, gross margin, and pilot economics.
- Add production compliance posture by target country.
- Add screenshots from the current dashboard or export from the demo video.
