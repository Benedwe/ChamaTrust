export function flagTransaction({ amount, phone, memberDailyTotal = 0 }) {
  const flags = [];

  if (amount > 5_000_000) {
    flags.push("large_amount");
  }

  if (memberDailyTotal + amount > 10_000_000) {
    flags.push("daily_limit_review");
  }

  if (!/^\+?[0-9]{9,15}$/.test(phone || "")) {
    flags.push("phone_format_review");
  }

  return flags;
}
