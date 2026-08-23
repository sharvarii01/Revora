# NPCI UPI AutoPay & RBI e-Mandate Regulatory Specifications

> **"Recover Revenue. Respect the Rules."**  
> Complete regulatory compliance mapping for Vasooli AI Revenue Recovery Agent.

---

## 1. Regulatory Context

In India, recurring automated debits on UPI, Debit Cards, Credit Cards, and Netbanking are strictly regulated by:
1. **Reserve Bank of India (RBI) Circular on Processing of e-Mandates for Recurring Transactions** (RBI/2019-20/47 & updates).
2. **National Payments Corporation of India (NPCI) UPI AutoPay Operating Guidelines & Circulars** (NPCI/UPI/OC-136, OC-141, and AutoPay 2.0 specs).

### Why Compliance Matters
Non-compliant merchants and aggregators face severe repercussions:
- **Mandate Revocation**: Banks automatically cancel recurring mandates if excessive failed debits occur without proper cooldowns.
- **Customer Bank Penalties**: Banks levy bounce charges (₹25–₹250 + GST) on customers for failed auto-debits, causing severe customer dissatisfaction and brand churn.
- **Sponsor Bank & Gateway Throttle**: Payment aggregators like Razorpay throttle or suspend merchant AutoPay privileges for failure rates violating NPCI thresholds (> 20% bounce rate).

---

## 2. Core NPCI UPI AutoPay Retry Regulations

| Rule Category | NPCI / RBI Mandate Requirement | Vasooli AI Enforcement Mechanism |
| :--- | :--- | :--- |
| **Max Retry Limit** | Maximum **3 presentation attempts** per billing cycle for non-fatal errors (e.g. Insufficient Funds). | Hard attempt counter in database. Attempt 4 is mathematically impossible; transitions to `NPCI_LIMIT_REACHED`. |
| **Cooldown Interval** | Minimum **24 hours spacing** between subsequent debit presentations on the same mandate. | BullMQ delayed queue scheduler ensures $T_{\text{next}} \ge T_{\text{prev}} + 86,400\text{s}$. |
| **Presentation Window** | Mandate execution must occur between **T+0 and T+3 business days** of due date. | Auto-retry window calculator bounds retries strictly within the compliant presentation cycle. |
| **Pre-Debit Notification** | Pre-debit SMS/Notification required **$\ge$ 24 hours to 48 hours prior** to auto-debit execution. | Automatically tracks pre-debit webhook status before scheduling debit execution. |
| **Terminal Error Stops** | Immediate cessation of retries on account closure, VPA revocation, or risk block. | Immediate transition to `STOP_STATE: TERMINAL_FAILURE` on codes `ZG`, `U16`, `M4`, `U28`. |
| **Alternative Channel Rule** | After AutoPay retry exhaustion, merchant may only provide non-intrusive one-time payment link. | Seamless fallback: Converts recurring subscription invoice to single-click Razorpay Payment Link. |
| **Customer Opt-Out** | Customer must be able to cancel mandate or opt out from recovery communications at any time. | 1-click opt-out in WhatsApp/SMS links that instantly marks `CUSTOMER_OPTED_OUT` and stops all jobs. |

---

## 3. Failure Code Classification Matrix

NPCI and Issuing Banks return standardized error codes during UPI AutoPay execution. Vasooli classifies them into 4 actionable buckets:

### Bucket 1: Transient Failures (Eligible for Intelligent Scheduled Retry)
*Eligible for max 3 attempts with $\ge$ 24h cooldown.*

| Code | Reason | Bank Message | AI Recovery Strategy |
| :--- | :--- | :--- | :--- |
| `U30` | Insufficient Balance | Debit failed: Insufficient funds in customer account | Predict salary credit date / peak banking hours (9:15 AM - 11:30 AM), schedule retry after 24h cooldown, send courteous notification. |
| `UT` | Transaction Timeout | Remitter / Beneficiary bank server timed out | Schedule retry in next banking window (T+24h) during low network congestion hours. |
| `U54` | Daily Amount Limit Exceeded | Customer UPI daily transaction limit reached | Schedule retry for next calendar day (T+24h) at 09:00 AM. |
| `U69` | Limit on Mandate Exceeded | Cumulative per-mandate monthly cap reached | Alert merchant; check if tier upgrade or partial split billing required via payment link. |
| `ZA` | Transaction Denied by Remitter Bank | Periodic risk check or bank core downtime | Schedule retry at T+24h with recommendation to switch to alternate VPA. |

### Bucket 2: Action-Required Failures (Customer Intervention Needed)
*Do not retry automated debit immediately; send Smart Payment Link & guidance.*

| Code | Reason | Bank Message | AI Recovery Strategy |
| :--- | :--- | :--- | :--- |
| `ZM` | Invalid MPIN / Auth Error | Customer entered incorrect MPIN or auth expired | Dispatch instant Razorpay Payment Link allowing one-time PIN authentication or alternate UPI app. |
| `U19` | Daily Frequency Limit Exceeded | Max transaction frequency for account reached | Prompt customer to use Netbanking/Card link or schedule retry at 00:01 AM next day. |
| `U68` | Payment Mode Not Supported | Mandate execution unsupported on this bank rail | Provide Razorpay multi-mode payment link (Credit Card, Debit Card, Netbanking). |

### Bucket 3: Hard Stop / Terminal Failures (Zero Retry Allowed)
*Immediate transition to `STOP_STATE`. Never schedule retry.*

| Code | Reason | Bank Message | Action |
| :--- | :--- | :--- | :--- |
| `ZG` | VPA Inactive / Revoked | Virtual Payment Address deleted or blocked by PSP | Close automated recovery immediately. Notify merchant. |
| `U16` | Risk Threshold Exceeded | Account flagged for fraud or high-risk activity | Hard stop. Blacklist mandate ID from automated queues. |
| `M4` | Mandate Revoked by Customer | Customer cancelled mandate through bank/UPI app | Immediate halt. Trigger customer churn survey or subscription cancellation flow. |
| `U28` | PSP Not Available / Blacklisted | PSP handling remitter has been suspended by NPCI | Halt AutoPay attempts. Send standard Razorpay web link. |
| `Z9` | Account Closed | Customer bank account closed or frozen | Mark mandate permanently inactive. |

---

## 4. NPCI Retry Window & Cooldown Algorithm

```typescript
interface NpciValidationResult {
  isAllowed: boolean;
  stopReason?: string;
  nextAllowedRetryTime?: Date;
  attemptIndex: number;
  maxAttempts: number;
}

export function evaluateNpciCompliance(
  failureCode: string,
  currentAttempts: number,
  lastAttemptTime: Date,
  mandateCycleDueDate: Date
): NpciValidationResult {
  const MAX_ALLOWED_ATTEMPTS = 3;
  const MIN_COOLDOWN_HOURS = 24;

  // 1. Check Terminal Failure Codes
  const terminalCodes = ['ZG', 'U16', 'M4', 'U28', 'Z9'];
  if (terminalCodes.includes(failureCode)) {
    return {
      isAllowed: false,
      stopReason: `NPCI_HARD_STOP_TERMINAL_CODE_${failureCode}`,
      attemptIndex: currentAttempts,
      maxAttempts: MAX_ALLOWED_ATTEMPTS,
    };
  }

  // 2. Check Max Presentation Attempts
  if (currentAttempts >= MAX_ALLOWED_ATTEMPTS) {
    return {
      isAllowed: false,
      stopReason: 'NPCI_MAX_CYCLE_ATTEMPTS_EXHAUSTED_LIMIT_3',
      attemptIndex: currentAttempts,
      maxAttempts: MAX_ALLOWED_ATTEMPTS,
    };
  }

  // 3. Compute Earliest Compliant Retry Time (Cooldown Enforcement)
  const earliestRetryTime = new Date(lastAttemptTime.getTime() + MIN_COOLDOWN_HOURS * 3600 * 1000);
  
  // 4. Ensure retry falls within presentation cycle window (T+3 max)
  const maxCycleWindow = new Date(mandateCycleDueDate.getTime() + 3 * 24 * 3600 * 1000);
  if (earliestRetryTime > maxCycleWindow) {
    return {
      isAllowed: false,
      stopReason: 'NPCI_PRESENTATION_WINDOW_EXPIRED_T_PLUS_3',
      attemptIndex: currentAttempts,
      maxAttempts: MAX_ALLOWED_ATTEMPTS,
    };
  }

  return {
    isAllowed: true,
    nextAllowedRetryTime: earliestRetryTime,
    attemptIndex: currentAttempts + 1,
    maxAttempts: MAX_ALLOWED_ATTEMPTS,
  };
}
```

---

## 5. Auditability & Compliance Proofs

For every transaction handled by Vasooli, the system records:
1. `npci_rule_checked_at`: Timestamp of validation.
2. `npci_attempt_number`: Cycle attempt ordinal (1, 2, or 3).
3. `npci_cooldown_duration_seconds`: Verified spacing (always $\ge 86,400$).
4. `regulatory_verdict`: `COMPLIANT_PROCEED` or `COMPLIANT_HALT`.
5. `compliance_hash`: Cryptographic proof of adherence stored in the merchant audit ledger.
