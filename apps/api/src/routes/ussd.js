import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = "";

  // USSD text format from Africa's Talking: "1*2*1"
  const textArray = text.split("*");
  const lastInteraction = textArray[textArray.length - 1];

  if (text === "") {
    // Main Menu
    response = `CON Welcome to ChamaTrust
1. Check Balance
2. Agricultural Financing
3. Community Pools
4. Governance Voting`;
  } else if (text === "1") {
    // Check Balance
    // Mock user balance
    response = `END Your Chama balance is KES 45,000.
Stablecoin value: $350 cUSD`;
  } else if (text === "2") {
    // Agricultural Financing Menu
    response = `CON Agricultural Financing
1. Apply for Seed Loan
2. Equipment Financing
3. My Active Loans`;
  } else if (text === "2*1") {
    response = `END Seed loan application submitted for review.
You will receive an SMS confirmation shortly.`;
  } else if (text === "2*2") {
    response = `END Equipment financing request received.
Our agents will contact you at ${phoneNumber}.`;
  } else if (text === "2*3") {
    response = `END Active Loans:
- Fertilizer Loan: KES 10,000 (Due in 30 days)
Status: Good Standing`;
  } else if (text === "3") {
    // Community Pools
    response = `CON Community Investment Pools
1. Maize Farm Yield Pool (12% APY)
2. Dairy Co-op Fund (10% APY)
3. My Investments`;
  } else if (text === "3*1") {
    response = `CON Maize Farm Yield Pool
Min Investment: KES 5,000
Enter amount to invest:`;
  } else if (text.startsWith("3*1*")) {
    const amount = text.split("*")[2];
    response = `END You have initiated an investment of KES ${amount} to the Maize Farm Yield Pool. You will receive an M-Pesa prompt.`;
  } else if (text === "3*2") {
    response = `CON Dairy Co-op Fund
Min Investment: KES 2,000
Enter amount to invest:`;
  } else if (text.startsWith("3*2*")) {
    const amount = text.split("*")[2];
    response = `END You have initiated an investment of KES ${amount} to the Dairy Co-op Fund. You will receive an M-Pesa prompt.`;
  } else if (text === "3*3") {
    response = `END My Investments:
- Maize Farm: KES 15,000
- Total Yield: KES 1,800`;
  } else if (text === "4") {
    response = `CON Active Governance Proposals
1. Approve Tractor Loan for John
2. Increase Monthly Contribution
Enter proposal number to vote:`;
  } else if (text === "4*1") {
    response = `END You voted YES on "Approve Tractor Loan for John".
Thank you for participating.`;
  } else if (text === "4*2") {
    response = `END You voted YES on "Increase Monthly Contribution".
Thank you for participating.`;
  } else {
    response = `END Invalid input. Please try again.`;
  }

  // Send response in the format expected by Africa's Talking
  res.set("Content-Type", "text/plain");
  res.send(response);
});

export default router;
