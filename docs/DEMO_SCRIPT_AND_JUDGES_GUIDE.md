# Vasooli – Hackathon Demo Script & Judges' Guide

> **Track:** AI Revenue Recovery (Track 3)  
> **Tagline:** *"Recover Revenue. Respect the Rules."*  
> **Core Principle:** *"Every failed payment gets its legal opportunity to recover—not one retry less, not one retry more."*

---

## 1. 60-Second Elevator Pitch

> *"Every subscription merchant in India loses 20% to 35% of their recurring revenue to failed UPI AutoPay debits and card renewals. But here's the dirty secret: most existing systems either retry blindly—triggering bank penalty fees and violating strict NPCI regulations—or spam customers with reminders.*
>
> *Meet **Vasooli**—the first Autonomous AI Revenue Recovery Manager built specifically for Razorpay and NPCI UPI AutoPay. Vasooli doesn't just retry. It **thinks before every retry**. It analyzes bank failure codes, predicts optimal salary clearing windows, enforces mandatory 24-hour NPCI cooldowns, and most importantly, **knows exactly when to stop**. With Vasooli, merchants recover up to 68% of lost revenue with zero regulatory violations."*

---

## 2. Live Demo Script (Step-by-Step for Judges)

### Act 1: The Money Leakage Problem (30s)
1. **Open Merchant Dashboard**: Point to the **Money Leakage Report**.
   - *"Today alone, ₹42,500 was at risk of churn. But look at our live recovery pipeline."*
   - Show KPIs: ₹1,02,400 Recovered, 68.9% Recovery Rate, **100% NPCI Compliance Score**, 0 Regulatory Penalties.

### Act 2: UPI AutoPay Recovery & NPCI Intelligence (60s)
1. **Open the Live Simulator**: Click **"Simulate UPI AutoPay Failure (U30 Insufficient Funds)"**.
2. **Watch the AI Agent React Live**:
   - The event flows into the pipeline.
   - The status updates to `ANALYZING_AI` -> `SCHEDULED_RETRY`.
3. **Open the AI Explainability Drawer**:
   - Show the judge the AI Rationale:
     > *"AI identified code U30 (Low Balance). Detected corporate salary date (22nd). Calculated 24-hour NPCI cooldown. Scheduled presentation for tomorrow at 09:15 AM (peak bank clearing window). WhatsApp pre-debit advisory generated."*
   - Highlight the **NPCI Compliance Meter**: Attempt 1 of 3 consumed. Next presentation legally compliant.

### Act 3: The "Stop State" – The Game-Changing Feature (60s)
1. **Simulate Repeated Failure (Attempt 3/3)**:
   - Click **"Simulate NPCI Limit Breach (Attempt 3 Failed)"**.
2. **Watch the AI Agent Refuse Blind Retrying**:
   - Instead of hammering the bank or getting the mandate revoked, the AI transitions immediately to:
     `STOP_STATE: NPCI_LIMIT_REACHED`.
   - The AI logs: *"NPCI 3-attempt cycle limit reached. Automated debits halted to protect merchant from regulatory penalty. Gracefully generated one-time Razorpay Payment Link."*
3. **Point out to Judges**:
   - *"This is what separates Vasooli from dumb cron scripts. We respect the law and protect the merchant's reputation."*

### Act 4: Abandoned Checkout with Margin-Aware Dynamic Offers (45s)
1. **Simulate Abandoned Cart Drop-off**:
   - Show Stage 1: Friendly reminder link.
   - Show Stage 2: AI calculates 5% incentive.
   - Show Stage 3: Margin floor protection (never exceeds merchant 10% ceiling).
   - Show customer converting via Razorpay Payment Link -> Dashboard updates instantly in real-time.

---

## 3. Why Judges Will Score This High

| Criteria | How Vasooli Excels |
| :--- | :--- |
| **Domain Depth & Realism** | We didn't make up generic retry logic. We built on actual NPCI UPI AutoPay Circulars (OC-136/141) and bank failure error codes (`U30`, `ZM`, `ZG`, `U16`). |
| **Razorpay API Integration** | Deep native usage of Razorpay Subscriptions, Orders, Payment Links, Invoices, and Webhook signatures. |
| **Explainable AI** | Every decision is transparent with clear probability scores, risk scores, and plain-English audit trails. |
| **Business ROI** | Direct bottom-line metric: Recovered Revenue vs Churn, with clear Money Leakage analytics. |
| **UX & Visual Wow-Factor** | Ultra-sleek dark mode dashboard, glassmorphic UI, live animated pipeline, and interactive simulator. |

---

## 4. Judges' Frequently Asked Questions (FAQ)

### Q1: *"What happens if Gemini AI is down or slow?"*
> **Answer**: Vasooli is engineered with an enterprise-grade **Deterministic Heuristic Fallback Engine**. If Gemini is unavailable, the rule-based expert system enforces NPCI rules and banking hours with 0ms latency and 100% uptime.

### Q2: *"How do you prevent spamming customers?"*
> **Answer**: Vasooli has strict stop states and cooldown rules:
> 1. Max 3 AutoPay attempts with 24h+ spacing.
> 2. Max 3 checkout nudges over 48h.
> 3. Instant 1-click customer opt-out that kills all pending background tasks.

### Q3: *"Can merchants customize their discount limits?"*
> **Answer**: Yes. Merchants can configure their dynamic discount ceiling (e.g. 5%, 10%, or 0% for fixed-price SaaS) in the settings panel. The AI is strictly bounded by the merchant's margin floor.
