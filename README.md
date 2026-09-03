 🚀 Revora

<div align="center">Repository-Aware AI Code Reviews for GitHub

Review smarter. Ship faster. Build with confidence.

🌐 Live Demo: https://revora-drab.vercel.app/
</div>---

📖 Overview

Revora is an open-source AI-powered code review platform that understands your entire repository, not just the pull request diff.

Instead of generating generic feedback, Revora analyzes your project's architecture, dependencies, coding conventions, configuration, and repository relationships before producing intelligent, context-aware code reviews.

Whether you're an individual developer or part of a large engineering team, Revora helps catch bugs, improve maintainability, detect security issues, and enforce best practices directly inside GitHub Pull Requests.

---

✨ Features

- 🧠 Repository Intelligence
- 🔍 Context-Aware AI Code Reviews
- 🔗 GitHub App & Webhook Integration
- ⚡ Real-Time Review Streaming (SSE)
- 🤖 Multi-LLM Support via LiteLLM
- 🔑 Bring Your Own API Keys (BYOK)
- ✅ Verification Engine to Reduce AI Hallucinations
- 📊 Review History & Analytics
- 🔒 Encrypted API Key Storage
- 🐳 Docker Deployment
- 🌍 Open Source (MIT License)

---

🏗️ Architecture

GitHub Pull Request
        │
        ▼
 GitHub Webhook
        │
        ▼
 FastAPI Backend
        │
 ┌──────┴────────┐
 │               │
 ▼               ▼
Redis Queue   PostgreSQL
 │
 ▼
AI Review Worker
 │
 ▼
Repository Intelligence
 │
 ▼
Context Retrieval
 │
 ▼
Prompt Builder
 │
 ▼
LiteLLM
 │
 ▼
Verification Engine
 │
 ▼
GitHub PR Comments

---

🛠 Tech Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend

- FastAPI
- Python
- PostgreSQL
- Redis
- Docker

AI Providers

- Google Gemini
- NVIDIA NIM
- OpenRouter
- Cohere
- Ollama Cloud
- OpenAI (Coming Soon)
- Anthropic (Coming Soon)
- Groq (Coming Soon)

---

📂 Project Structure

Revora/
├── backend/
│   ├── app/
│   ├── pipeline/
│   ├── retrieval/
│   ├── verification/
│   └── tests/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── components/
│
├── docs/
├── docker-compose.yml
└── README.md

---

🚀 Getting Started

Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL
- Redis
- Docker (Recommended)
- GitHub App Credentials
- AI Provider API Key

Clone Repository

git clone https://github.com/sharvarii01/Revora.git
cd Revora

Configure Environment

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

Fill in:

- Database credentials
- Redis configuration
- GitHub App secrets
- JWT secrets
- AI Provider API Key

---

🐳 Run with Docker

docker-compose up --build

Frontend:

http://localhost:3000

Backend API:

http://localhost:8000/docs

---

🔄 Workflow

1. Developer opens a Pull Request.
2. GitHub triggers a webhook.
3. Revora clones and indexes the repository.
4. Repository Intelligence gathers project context.
5. Context Retrieval builds an optimized prompt.
6. AI generates review suggestions.
7. Verification Engine validates findings.
8. Review comments are posted back to GitHub.

---

🎯 Why Revora?

Unlike traditional AI reviewers that only inspect changed files, Revora understands:

- Project architecture
- Dependency relationships
- Existing code patterns
- Coding standards
- Repository context

This leads to more accurate, actionable, and trustworthy AI-generated code reviews.

---

🤝 Contributing

Contributions are always welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

📜 License

Licensed under the MIT License.

---

⭐ Support

If you like Revora, consider giving the repository a ⭐ on GitHub.

Every star helps the project grow and motivates future development.

---

<div align="center">Built with ❤️ for developers.

</div>
