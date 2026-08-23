import crypto from 'crypto';

/**
 * Verifies HMAC-SHA256 signature for Razorpay webhooks
 */
export function verifyRazorpaySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}

/**
 * Generates cryptographic compliance proof hash for NPCI audit logs
 */
export function generateComplianceHash(data: Record<string, unknown>): string {
  const serialized = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(serialized).digest('hex');
}
