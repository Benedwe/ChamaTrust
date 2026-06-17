import { nanoid } from "nanoid";

const providerConfig = {
  "M-Pesa": { country: "TZ", settlementMinutes: 2 },
  "Airtel Money": { country: "TZ", settlementMinutes: 3 },
  "Tigo Pesa": { country: "TZ", settlementMinutes: 4 },
  "HaloPesa": { country: "TZ", settlementMinutes: 4 }
};

export function listProviders() {
  return Object.keys(providerConfig).map((name) => ({ name, ...providerConfig[name] }));
}

export async function initiateCollection({ provider, phone, amount }) {
  if (!providerConfig[provider]) {
    const error = new Error("Unsupported Mobile Money provider");
    error.status = 400;
    throw error;
  }

  return {
    reference: `CT-${nanoid(12).toUpperCase()}`,
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

  return {
    reference: `WD-${nanoid(12).toUpperCase()}`,
    provider,
    phone,
    amount,
    status: "initiated"
  };
}
