# API Specification & Webhook Contracts

> **"Recover Revenue. Respect the Rules."**  
> Complete REST API and Webhook interfaces for Vasooli.

---

## 1. Razorpay Webhook Ingestion

### `POST /api/webhooks/razorpay`
Accepts standard Razorpay webhooks, verifies HMAC signature with `X-Razorpay-Signature`, and enqueues event processing.

#### Supported Razorpay Webhook Events:
1. `subscription.charged.failed`: Recurring UPI AutoPay / Card billing debit failure.
2. `payment.failed`: One-time or mandate debit failure with bank error codes (`U30`, `ZM`, `ZG`, `U16`).
3. `payment.captured`: User completed recovery payment (via AutoPay retry or Payment Link).
4. `order.paid`: Checkout order completed.
5. `subscription.halted`: Razorpay marked subscription halted (Vasooli takes over graceful recovery).
6. `subscription.cancelled`: User cancelled subscription (Vasooli stops all recovery actions).

---

## 2. Recovery Management Endpoints

### `GET /api/recoveries`
List recovery sessions with filtering, pagination, and sorting.

**Query Parameters:**
- `status`: `ALL` | `ACTIVE` | `RECOVERED` | `STOPPED`
- `type`: `SUBSCRIPTION_AUTOPAY` | `CHECKOUT_ABANDONMENT`
- `limit`: `number` (default: 50)
- `offset`: `number` (default: 0)

**Response:**
```json
{
  "total": 142,
  "data": [
    {
      "id": "rec_clx99238a",
      "customerName": "Aman Verma",
      "customerEmail": "aman@example.com",
      "type": "SUBSCRIPTION_AUTOPAY",
      "planName": "Pro Annual Plan",
      "amount": 2499.0,
      "recoveredAmount": 2499.0,
      "status": "RECOVERED_VIA_LINK",
      "failureCode": "U30",
      "failureReason": "Insufficient Funds",
      "npciAttemptCount": 2,
      "maxNpciAttempts": 3,
      "aiRecoveryScore": 88,
      "aiAction": "SCHEDULE_RETRY_AND_NOTIFY",
      "stopReason": null,
      "createdAt": "2026-08-20T14:30:00Z",
      "updatedAt": "2026-08-21T07:15:00Z"
    }
  ]
}
```

---

### `GET /api/recoveries/:id`
Fetch single recovery session with complete AI Decision tree, retry attempts timeline, and notification logs.

**Response:**
```json
{
  "id": "rec_clx99238a",
  "customer": {
    "name": "Aman Verma",
    "email": "aman@example.com",
    "phone": "+919876543210"
  },
  "type": "SUBSCRIPTION_AUTOPAY",
  "amount": 2499.0,
  "status": "SCHEDULED_RETRY",
  "failureCode": "U30",
  "failureDescription": "Debit failed due to insufficient funds in customer account",
  "npciCompliance": {
    "attemptCount": 1,
    "maxAllowed": 3,
    "cooldownHours": 24,
    "nextAllowedPresentation": "2026-08-22T09:15:00+05:30",
    "isTerminal": false
  },
  "aiDecision": {
    "model": "gemini-2.5-flash",
    "action": "SCHEDULE_RETRY",
    "recoveryScore": 88,
    "riskScore": 12,
    "confidence": 0.94,
    "rationale": "U30 transient liquidity shortage. Optimal window scheduled for tomorrow 9:15 AM following 24h NPCI cooldown and salary cycle clearance.",
    "customerMessagePreview": "Hi Aman, your Pro Annual payment of ₹2,499 could not be processed due to low balance..."
  },
  "retryTimeline": [
    {
      "attempt": 1,
      "executedAt": "2026-08-21T08:15:00Z",
      "status": "failed",
      "code": "U30"
    },
    {
      "attempt": 2,
      "scheduledFor": "2026-08-22T09:15:00Z",
      "status": "scheduled"
    }
  ],
  "notifications": [
    {
      "channel": "WHATSAPP",
      "recipient": "+919876543210",
      "status": "DELIVERED",
      "sentAt": "2026-08-21T08:16:00Z"
    }
  ]
}
```

---

### `POST /api/recoveries/:id/stop`
Manually halt a recovery session (e.g. merchant preference or customer request).

**Request Body:**
```json
{
  "reason": "MERCHANT_MANUAL_CANCELLATION",
  "notes": "Customer called support to cancel service."
}
```

---

## 3. Metrics & Revenue Analytics Endpoints

### `GET /api/analytics/summary`
Returns high-level summary KPIs for the Merchant Dashboard.

**Response:**
```json
{
  "totalLostRevenue": 148500.0,
  "totalRecoveredRevenue": 102400.0,
  "overallRecoveryRate": 68.96,
  "activeRecoveringAmount": 34100.0,
  "npciComplianceRate": 100.0,
  "npciViolationsPrevented": 47,
  "averageRetriesToSuccess": 1.42,
  "leakageReport": {
    "todayFailed": 42500.0,
    "todayRecovered": 28900.0,
    "todayClosedStop": 12,
    "todaySuccessCount": 37
  }
}
```

### `GET /api/analytics/charts`
Returns 30-day time-series data for Lost vs Recovered revenue, recovery channel distribution (AutoPay vs Payment Link), and failure reason breakdown.

---

## 4. Simulator / Demo Control API (For Hackathon Showcase)

### `POST /api/simulator/trigger-event`
Allows the merchant / hackathon judge to fire instant simulated events to watch the AI Agent react in real time.

**Request Body Options:**
```json
{
  "scenario": "AUTOPAY_INSUFFICIENT_FUNDS_U30",
  "customerName": "Rohan Sharma",
  "amount": 1499.0,
  "attemptNumber": 1
}
```
*Supported Scenarios:*
1. `AUTOPAY_INSUFFICIENT_FUNDS_U30`: AI evaluates cycle & schedules compliant retry at 9:15 AM tomorrow.
2. `AUTOPAY_NPCI_LIMIT_BREACH`: Fires 3rd failure -> AI immediately halts automated debit, locks `STOP_STATE: NPCI_LIMIT_REACHED`, and falls back to Payment Link.
3. `AUTOPAY_TERMINAL_VPA_REVOKED_ZG`: AI immediately closes recovery without retry.
4. `CHECKOUT_ABANDONED_TIER1`: Cart drop-off -> AI generates stage-1 smart payment link.
5. `CHECKOUT_ABANDONED_DYNAMIC_DISCOUNT`: Inactive cart -> AI applies 5% then 10% dynamic discount.
6. `SIMULATE_CUSTOMER_PAYMENT`: Marks payment completed and updates recovery KPIs live.
