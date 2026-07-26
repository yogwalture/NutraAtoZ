import Razorpay from "razorpay";

/**
 * Server-side Razorpay client (Route-enabled account).
 * Requires: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 */
const keyId = process.env.RAZORPAY_KEY_ID ?? "";
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

export const isRazorpayConfigured = Boolean(keyId && keySecret);

export const razorpay = new Razorpay({
  key_id: keyId || "rzp_test_placeholder",
  key_secret: keySecret || "placeholder_secret",
});

/**
 * The platform's "admin" linked account that receives commission.
 * Set this to enable an explicit commission transfer; leave blank and the
 * primary account simply retains the commission.
 */
export const RAZORPAY_ADMIN_ACCOUNT_ID =
  process.env.RAZORPAY_ADMIN_ACCOUNT_ID ?? "";

export const RAZORPAY_KEY_ID = keyId;
export const RAZORPAY_KEY_SECRET = keySecret;
