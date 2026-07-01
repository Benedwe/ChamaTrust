import crypto from "crypto";

const { PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET } = process.env;

function encodeRFC3986(value) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function normalizeParams(params) {
  return Object.keys(params)
    .sort()
    .flatMap((key) => {
      const value = params[key];
      if (Array.isArray(value)) {
        return value
          .map((item) => `${encodeRFC3986(key)}=${encodeRFC3986(item)}`)
          .sort();
      }
      return `${encodeRFC3986(key)}=${encodeRFC3986(value)}`;
    })
    .join("&");
}

function buildSignatureBaseString(method, baseUrl, params) {
  const encodedUrl = encodeRFC3986(baseUrl);
  const encodedParams = encodeRFC3986(normalizeParams(params));
  return [method.toUpperCase(), encodedUrl, encodedParams].join("&");
}

export function createPesapalCheckoutUrl(reference, amount, phone) {
  const merchant = PESAPAL_CONSUMER_KEY || "demo";
  const phoneParam = phone ? `&phone=${encodeURIComponent(phone)}` : "";
  return `https://demo.pesapal.com/checkout?merchant=${encodeURIComponent(merchant)}&amount=${encodeURIComponent(amount)}&reference=${encodeURIComponent(reference)}${phoneParam}`;
}

export function verifyPesapalCallback(req) {
  if (!PESAPAL_CONSUMER_SECRET) {
    return false;
  }

  const data = { ...req.query, ...req.body };
  const signature = data.oauth_signature;
  if (!signature) {
    return false;
  }

  const params = { ...data };
  delete params.oauth_signature;

  const host = req.get("host");
  const baseUrl = `${req.protocol}://${host}${req.path}`;
  const baseString = buildSignatureBaseString(req.method, baseUrl, params);
  const signingKey = `${PESAPAL_CONSUMER_SECRET}&`;
  const expected = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");

  return expected === signature;
}

export function mapPesapalStatus(status) {
  if (!status) return undefined;
  const lower = status.toString().toLowerCase();
  if (lower.includes("complete") || lower.includes("paid") || lower.includes("successful")) return "confirmed";
  if (lower.includes("failed") || lower.includes("decline") || lower.includes("cancel")) return "failed";
  if (lower.includes("pending") || lower.includes("new") || lower.includes("open")) return "initiated";
  return undefined;
}

export function getPesapalMerchantReference(req) {
  return req.body?.pesapal_merchant_reference || req.query?.pesapal_merchant_reference || req.body?.merchant_reference || req.query?.merchant_reference;
}

export function getPesapalStatus(req) {
  return req.body?.pesapal_status || req.query?.pesapal_status || req.body?.pesapal_payment_status || req.query?.pesapal_payment_status || req.body?.status || req.query?.status;
}
