import { nanoid } from "nanoid";
import { createPesapalCheckoutUrl } from "./pesapal.js";

const providerConfig = {
  "M-Pesa": { country: "TZ", settlementMinutes: 2 },
  "Airtel Money": { country: "TZ", settlementMinutes: 3 },
  "Tigo Pesa": { country: "TZ", settlementMinutes: 4 },
  "HaloPesa": { country: "TZ", settlementMinutes: 4 },
  Pesapal: { country: "KE", settlementMinutes: 1, gateway: "Pesapal" }
};

export function listProviders() {
  return Object.keys(providerConfig).map((name) => ({ name, ...providerConfig[name] }));
}

export async function initiateCollection({ provider, phone, amount }) {
  if (!providerConfig[provider]) {
    const error = new Error("Unsupported payment provider");
    error.status = 400;
    throw error;
  }

  const reference = `CT-${nanoid(12).toUpperCase()}`;

  if (provider === "Pesapal") {
    return {
      reference,
      provider,
      phone,
      amount,
      status: "prompted",
      gateway: "Pesapal",
      paymentUrl: createPesapalCheckoutUrl(reference, amount, phone),
      message: "Pesapal checkout created for payment."
    };
  }

  return {
    reference,
    provider,
    phone,
    amount,
    status: "prompted",
    message: "Payment prompt sent to member phone"
  };
}

export async function initiatePayout({ provider, phone, amount, approvalTxHash }) {
  if (!approvalTxHash) {
    const error = new Error("Treasury approval transaction is required");
    error.status = 422;
    throw error;
  }

  const reference = `WD-${nanoid(12).toUpperCase()}`;

  if (provider === "Pesapal") {
    return {
      reference,
      provider,
      phone,
      amount,
      status: "initiated",
      gateway: "Pesapal",
      message: "Pesapal payout request initiated. Await webhook confirmation to reconcile status."
    };
  }

  return {
    reference,
    provider,
    phone,
    amount,
    status: "initiated",
    message: "Withdrawal request initiated."
  };
}
