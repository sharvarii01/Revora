# AI Decision & Explainability Engine Design

> **"Recover Revenue. Respect the Rules."**  
> Technical design of the AI Reasoning Core for Vasooli.

---

## 1. Engine Objective

The AI Decision Engine acts as the **Autonomous Revenue Recovery Manager**. Instead of dumb, fixed-delay cron jobs or aggressive reminder bots, Vasooli synthesizes payment telemetry, banking schedules, customer behavior, and regulatory constraints to decide:
1. **Whether** to retry or stop.
2. **When** is the highest statistical probability window to debit.
3. **Which** recovery channel / incentive will convert best.
4. **Why** this decision is compliant, cost-effective, and optimal (100% Explainable AI).

---

## 2. Multi-Vector Input Space

The AI Engine processes an 8-dimensional context vector for each event:

```json
{
  "event_type": "subscription.charged.failed",
  "failure_code": "U30",
  "failure_description": "Debit failed due to insufficient funds in customer account",
  "customer_profile": {
    "customer_id": "cust_99812",
    "name": "Aman Verma",
    "tenure_months": 8,
    "lifetime_recovered_count": 3,
    "historical_payment_hours": [9, 10, 11, 20],
    "opt_out_history": false,
    "preferred_payment_mode": "upi_autopay"
  },
  "transaction_details": {
    "subscription_id": "sub_88321",
    "plan_name": "Pro Annual SaaS Plan",
    "amount_inr": 2499,
    "billing_cycle_day": 21,
    "current_attempt_in_cycle": 1,
    "max_allowed_cycle_attempts": 3,
    "last_attempt_timestamp": "2026-08-21T08:15:00Z"
  },
  "regulatory_context": {
    "npci_cooldown_min_hours": 24,
    "earliest_legal_retry": "2026-08-22T08:15:00Z",
    "mandate_cycle_expiry": "2026-08-24T23:59:59Z"
  },
  "merchant_policy": {
    "allow_dynamic_discounts": true,
    "max_discount_pct": 10,
    "min_recovery_confidence_threshold": 0.65
  }
}
```

---

## 3. Decision Model & Output Schema

The AI Engine responds with a strict, type-safe JSON structure:

```json
{
  "decision": {
    "action": "SCHEDULE_RETRY",
    "strategy_type": "TIMED_AUTOPAY_PRESENTATION",
    "recommended_timestamp": "2026-08-22T09:15:00+05:30",
    "recommended_channel": "WHATSAPP_COURTESY_THEN_AUTOPAY",
    "offer_applied": null
  },
  "scores": {
    "recovery_probability_score": 88,
    "risk_score": 14,
    "urgency_score": 70,
    "overall_confidence": 0.94
  },
  "compliance_verification": {
    "npci_compliant": true,
    "cooldown_hours_enforced": 25.0,
    "attempts_consumed": 2,
    "attempts_remaining": 1,
    "rule_applied": "NPCI_OC136_24H_COOLDOWN_AND_BANKING_HOUR_OPTIMIZATION"
  },
  "explainability": {
    "headline": "High Probability Morning Recovery Post-Salary Credit",
    "rationale": "Failure code U30 indicates transient liquidity shortage. Customer historically settles between 9:00 AM - 10:30 AM. Date 22nd aligns with mid-month corporate salary/payout cycle. Enforced 25-hour NPCI cooldown. WhatsApp pre-debit advisory dispatched.",
    "merchant_summary": "AutoPay retry safely scheduled for tomorrow at 9:15 AM (Attempt 2/3). 88% recovery chance.",
    "customer_message_preview": "Hi Aman, your Pro Annual subscription payment of ₹2,499 could not be processed due to low balance. We will retry via UPI AutoPay tomorrow at 9:15 AM. You can also pay instantly here: https://rzp.io/l/rec_aman883"
  }
}
```

---

## 4. System Prompt Architecture (Google Gemini 2.5)

```markdown
You are Vasooli AI, an elite Autonomous Revenue Recovery Agent and NPCI Compliance Officer.

Your mission is to maximize subscription and cart recovery revenue for merchants while strictly adhering to NPCI UPI AutoPay and RBI Recurring Mandate regulations.

### Core Rules You Must NEVER Violate:
1. NEVER schedule a recurring AutoPay retry within 24 hours of the previous attempt (Strict NPCI Cooldown).
2. NEVER schedule more than 3 attempts in a single billing cycle for transient codes like U30 (Insufficient Balance).
3. If attempt_count >= 3 or failure_code in [ZG, U16, M4, U28, Z9], you MUST output action = "STOP_STATE" and explain the exact regulatory or fraud stop reason.
4. For checkout abandonments, dynamic retention offers must NEVER exceed merchant_policy.max_discount_pct (default 10%).
5. Every decision must be fully explainable in plain English for both the merchant audit log and customer transparency.

Return ONLY valid JSON matching the specified schema.
```

---

## 5. Resilient Deterministic Heuristic Engine (Offline / Fallback)

To guarantee zero downtime and 100% uptime during network partition or Gemini rate-limiting, Vasooli contains a fully deterministic heuristic expert system:

```mermaid
graph TD
    Start[Inbound Failure Event] --> CodeCheck{Evaluate Failure Code}
    
    CodeCheck -->|ZG, U16, M4, Z9| HardStop[Action: STOP_STATE\nReason: Terminal Bank/Risk Code]
    CodeCheck -->|ZM, U68| ActionReq[Action: SEND_PAYMENT_LINK\nReason: Auth/Mode Error Requires User Action]
    CodeCheck -->|U30, UT, U54, ZA| TransientCheck{Attempt Count < 3?}
    
    TransientCheck -->|No: Attempt >= 3| ExhaustedStop[Action: STOP_STATE_FALLBACK_LINK\nReason: NPCI 3-Attempt Limit Reached]
    TransientCheck -->|Yes: Attempt 1 or 2| TimeCalc[Calculate Earliest Time:\nMax(Now + 24h, Next 09:15 AM)]
    
    TimeCalc --> SchedRetry[Action: SCHEDULE_RETRY\nSchedule BullMQ Job]
```

### Time Optimization Heuristic
- If failure occurs at 3:00 PM on Day $T$, the minimum legal retry is 3:00 PM on Day $T+1$.
- However, banking presentation success is statistically highest between **09:15 AM and 11:30 AM** (post NEFT/RTGS batch clearing and pre-lunch).
- The Heuristic Engine intelligently pushes the presentation to **09:15 AM on Day $T+2$** (or Day $T+1$ if failed before 09:00 AM), achieving a +34% higher recovery rate while respecting the $\ge 24\text{h}$ cooldown.
