# Vasooli – System Architecture & Technical Design

> **"Recover Revenue. Respect the Rules."**

---

## 1. High-Level Architecture Overview

Vasooli is an autonomous, event-driven Revenue Recovery Agent designed specifically for the Indian payments landscape (UPI AutoPay, e-Mandates, Cards, and Netbanking via Razorpay).

The architecture consists of five core tiers:
1. **Ingestion & Event Gateway**: Listens to Razorpay webhooks, merchant checkout events, and manual simulation triggers with HMAC-SHA256 signature verification and idempotency caching.
2. **Regulatory & Compliance Guardian**: Validates every incoming failure against NPCI UPI AutoPay and RBI Recurring Mandate regulations (attempt caps, presentation windows, cooldown timers, pre-debit notification rules).
3. **AI Decision Engine**: Ingests failure codes, customer behavioral attributes, billing cycles, and risk signals to generate an explainable recovery plan (Recovery Score, Risk Score, Optimal Window, Channel Strategy).
4. **Execution & Orchestration Engine**: BullMQ delayed queue workers that schedule debit presentations, generate Razorpay smart payment links, apply margin-controlled dynamic offers, and dispatch notifications across WhatsApp, SMS, and Email.
5. **Merchant Command Center & Telemetry**: Next.js 14 real-time interactive UI for tracking recovered revenue, money leakage, regulatory compliance health, live recovery pipelines, and explainable AI audit trails.

---

## 2. Component Diagram

```
+-----------------------------------------------------------------------------------+
|                                 RAZORPAY GATEWAY                                  |
|   - Subscriptions API    - Payment Links API    - Orders API    - Webhooks        |
+------------------------------------------+----------------------------------------+
                                           |
                                           | Webhooks (JSON + HMAC)
                                           v
+-----------------------------------------------------------------------------------+
|                             INGRESS & SECURITY LAYER                              |
|   - Webhook Signature Verifier (HMAC-SHA256)                                      |
|   - Redis Idempotency Filter (Prevents duplicate processing)                      |
|   - Event Router (Subscription Failure vs Checkout Abandonment)                   |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        NPCI & REGULATORY COMPLIANCE ENGINE                        |
|   - Attempt Counter (Cycle-bounded: max 3 attempts for U30)                       |
|   - Cooldown Evaluator (Enforces >= 24h spacing)                                  |
|   - Failure Code Classifier (Transient vs Terminal / Fraud)                       |
|   - Hard Stop Trigger (Halts automated retry on terminal codes or limit breach)   |
+--------------------+-------------------------------------+------------------------+
                     |                                     |
    [Allowed: Within Limits]                      [Halted: Stop State Reached]
                     |                                     |
                     v                                     v
+------------------------------------------+   +------------------------------------+
|            AI DECISION ENGINE            |   |             STOP STATE             |
|   - Gemini 2.5 / Fallback Heuristic      |   |   - Mark: NPCI_LIMIT_REACHED       |
|   - Multi-vector Scoring Model           |   |   - No further automated debits    |
|   - Optimal Retry Window Predictor       |   |   - Switch to non-intrusive link   |
|   - Explainability & Audit Generator     |   |   - Audit Log Entry                |
+--------------------+---------------------+   +-----------------+------------------+
                     |                                           |
                     v                                           v
+-----------------------------------------------------------------------------------+
|                            EXECUTION & QUEUE WORKERS                              |
|   - BullMQ Retry Queue (Delayed debit presentation at optimal window)             |
|   - Razorpay Payment Link Generator (Custom expiry, auto-reconciliation)          |
|   - Dynamic Margin-Controlled Incentive Engine (5% -> 10% ceiling)                |
|   - Multi-Channel Notification Dispatcher (WhatsApp / Email / SMS)                |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                             DATA & TELEMETRY LAYER                                |
|   - PostgreSQL / Prisma ORM (State, Audit Logs, Recovery Sessions, Mandates)      |
|   - Realtime WebSockets / SSE Updates to Merchant Command Center                  |
+-----------------------------------------------------------------------------------+
```

---

## 3. End-to-End Event Pipelines

### Pipeline A: Subscription Renewal Failure (UPI AutoPay)

1. **Failure Ingestion**:
   - Razorpay triggers `subscription.charged.failed` or `payment.failed`.
   - Event contains: `subscription_id`, `payment_id`, `error_code` (e.g. `BAD_REQUEST_ERROR`), `error_description`, `error_source` (bank/gateway), `error_step` (payment_authorization), `error_reason` (e.g. `debit_failed_due_to_insufficient_balance`).

2. **NPCI Compliance Check**:
   - Looks up the active `Mandate` and `RecoverySession` in the database.
   - Calculates total presentation attempts in the current billing cycle.
   - If attempts == 3: Transitions immediately to `STOP_STATE: NPCI_LIMIT_REACHED`.
   - If error is terminal (e.g. `VPA_INACTIVE` or `MANDATE_REVOKED`): Transitions immediately to `STOP_STATE: TERMINAL_FAILURE`.
   - If error is transient (`INSUFFICIENT_FUNDS`): Passes to AI Decision Engine.

3. **AI Decision Evaluation**:
   - Analyzes customer history, salary cycle proximity (1st, 5th, 10th of month), previous payment hours, and ticket size.
   - Predicts optimal presentation time $T_{optimal} \ge T_{failed} + 24\text{ hours}$.
   - Generates confidence score, risk score, and human-readable audit reason.

4. **Orchestration**:
   - Enqueues a delayed BullMQ job for $T_{optimal}$.
   - Generates a pre-retry customer courtesy notification via WhatsApp / Email with option to switch payment mode or pay now via instant link.

5. **Resolution**:
   - If user pays via link: BullMQ job cancelled, recovery session marked `RECOVERED_VIA_LINK`.
   - When BullMQ timer fires: AutoPay retry triggered via Razorpay Subscriptions API.
   - If successful: Marked `RECOVERED_AUTO_DEBIT`.
   - If failed again: Attempt counter incremented, loop repeats if attempts < 3.

---

### Pipeline B: Abandoned Checkout Recovery

1. **Inactivity Detection**:
   - Merchant website or Razorpay Standard Checkout triggers `order.created` or cart session.
   - If no `payment.captured` event is received within 15 minutes, recovery session initiated.

2. **AI Dynamic Nudge Strategy**:
   - **Stage 1 (T+15m)**: Friendly cart reminder with direct link to Razorpay checkout.
   - **Stage 2 (T+3h)**: If unopened/unpaid, AI generates dynamic 5% retention discount link with 6-hour expiry.
   - **Stage 3 (T+24h)**: If still unpaid, AI evaluates product margin floor. If margin allows, applies final 10% discount.
   - **Stage 4 (T+48h)**: No response -> Mark `CLOSED_MAX_NUDGES_REACHED`. System ceases all communication to prevent customer fatigue and brand spam.

---

## 4. State Machine Definition

Every recovery workflow is governed by a strict finite state machine:

```
[INITIATED]
    │
    ├─────────► [ANALYZING_AI]
    │                 │
    │                 ├─────────► [STOP_STATE: TERMINAL_FAILURE] (e.g., ZG, U16)
    │                 │
    │                 ├─────────► [STOP_STATE: NPCI_LIMIT_REACHED] (Attempt >= 3)
    │                 │
    │                 └─────────► [SCHEDULED_RETRY] (Delayed Queue)
    │                                   │
    │                                   ├─────────► [RETRY_IN_PROGRESS]
    │                                   │                 │
    │                                   │                 ├─────────► [RECOVERED_AUTO_DEBIT] (Terminal Success)
    │                                   │                 │
    │                                   │                 └─────────► [RETRY_FAILED] (Re-evaluates NPCI limits)
    │                                   │
    │                                   └─────────► [PAYMENT_LINK_DISPATCHED]
    │                                                     │
    │                                                     ├─────────► [RECOVERED_VIA_LINK] (Terminal Success)
    │                                                     │
    │                                                     ├─────────► [CUSTOMER_OPTED_OUT] (Terminal Stop)
    │                                                     │
    │                                                     └─────────► [STOP_STATE: EXPIRED] (Terminal Stop)
```

---

## 5. Security, Idempotency & Resiliency

1. **Webhook HMAC Signature Verification**:
   - Every inbound webhook payload is validated against `X-Razorpay-Signature` using `crypto.createHmac('sha256', secret)`.
2. **Idempotency Keying**:
   - Webhook events are keyed in Redis by `rzp_event_id` + `event_type`. Duplicate events within 24 hours return instant `200 OK` without triggering redundant recovery jobs.
3. **Audit Immutability**:
   - Every AI prompt, decision output, NPCI rule evaluation, and notification timestamp is written to an append-only `AuditLog` table.
4. **Fallback AI Mode**:
   - If Gemini API encounters rate limits or network issues, the system seamlessly falls back to the deterministic Heuristic Decision Engine with zero downtime.
