# 🏆 Revora – AI Revenue Recovery Platform

### *"Recover Revenue. Respect the Rules."*
**Tagline: AI Revenue Recovery Platform**

---

## 🌟 Overview

**Revora** is an AI-powered autonomous revenue recovery platform that helps merchants recover failed subscription payments and abandoned checkouts while strictly complying with NPCI's UPI AutoPay and RBI Recurring Mandate regulations.

Unlike traditional recovery tools that retry blindly or spam customers, Revora **knows when to retry, how to retry, and when to stop.**

---

## 🚀 Core Features

- **🛡️ NPCI UPI AutoPay Compliance Guardian**: Automatically enforces 3-attempt cycle caps, 24-hour mandatory cooldowns, pre-debit notifications, and hard stops on terminal failure codes (`ZG`, `U16`, `M4`).
- **🧠 Explainable AI Decision Engine**: Leverages Google Gemini 2.5 and deterministic heuristic engines to score recovery probability, risk, optimal banking clearing hours (09:15 AM - 11:30 AM), and salary cycle dates.
- **🛑 Stop State Architecture**: Clear, compliant stopping conditions that prevent bank penalty fees, mandate revocations, and customer spam.
- **⚡ Abandoned Checkout Dynamic Recovery**: Margin-aware multi-stage nudges (Stage 1 direct link -> Stage 2 5% offer -> Stage 3 10% floor -> Hard stop).
- **📊 Real-time Merchant Command Center**: High-density analytics, Money Leakage Reports, Live Recovery Feed, Explainable AI Inspector, and Interactive Event Simulator for hackathon demonstrations.

---

## 📚 Detailed Documentation

All comprehensive design and technical documentation are available in the [`docs/`](file:///c:/PROJECT''s/Vasooli/docs) folder:
1. **[System Architecture](file:///c:/PROJECT''s/Vasooli/docs/ARCHITECTURE.md)**: End-to-end event flow, BullMQ workers, and state machine.
2. **[NPCI Regulations & Error Code Mapping](file:///c:/PROJECT''s/Vasooli/docs/NPCI_REGULATIONS.md)**: UPI AutoPay circulars, attempt limits, cooldown algorithms, and bank error codes.
3. **[AI Decision Engine Design](file:///c:/PROJECT''s/Vasooli/docs/AI_ENGINE_DESIGN.md)**: Prompt architecture, scoring models, and fallback heuristic logic.
4. **[Database Schema](file:///c:/PROJECT''s/Vasooli/docs/DATABASE_SCHEMA.md)**: Prisma models, entity relationships, and audit log schemas.
5. **[API Specification](file:///c:/PROJECT''s/Vasooli/docs/API_SPECIFICATION.md)**: REST endpoints, Razorpay webhook schemas, and simulation controls.
6. **[Demo Script & Judges' Guide](file:///c:/PROJECT''s/Vasooli/docs/DEMO_SCRIPT_AND_JUDGES_GUIDE.md)**: 60-second elevator pitch, live walkthrough steps, and FAQ.

---

## 🏗️ Project Structure

```
Vasooli/
├── docs/                                  # Comprehensive architecture & compliance docs
│   ├── ARCHITECTURE.md
│   ├── NPCI_REGULATIONS.md
│   ├── AI_ENGINE_DESIGN.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPECIFICATION.md
│   └── DEMO_SCRIPT_AND_JUDGES_GUIDE.md
│
├── server/                                # Node.js + TypeScript + Prisma + BullMQ Backend
│   ├── src/
│   │   ├── config/                        # Config & Environment
│   │   ├── controllers/                   # REST API Controllers
│   │   ├── services/                      # AI Engine, NPCI Compliance, Razorpay, Recovery Orchestrator
│   │   ├── queues/                        # BullMQ delayed queues & workers
│   │   ├── routes/                        # API route declarations
│   │   ├── middleware/                    # HMAC Webhook validation & security
│   │   └── prisma/                        # Prisma schema & seed data
│   ├── package.json
│   └── tsconfig.json
│
├── client/                                # Next.js 14 + React + TailwindCSS + Framer Motion
│   ├── src/
│   │   ├── app/                           # App router pages (Dashboard, Recoveries, Simulator, Settings)
│   │   ├── components/                    # UI Components, AI Inspector, Metrics, Compliance Panels
│   │   ├── lib/                           # API utilities & helpers
│   │   └── styles/                        # Design tokens & glassmorphism theme
│   ├── package.json
│   └── tailwind.config.ts
│
└── README.md
```

---

## 👥 Hackathon Team & Track

- **Track**: AI Revenue Recovery (Track 3)
- **Tagline**: *"Recover Revenue. Respect the Rules."*
