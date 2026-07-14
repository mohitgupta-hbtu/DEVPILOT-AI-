# 🚀 DevPilot AI — Next-Gen AI Repository Auditor & Developer Workspace

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind-F59E0B?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

DevPilot AI is a premium, developer-first workspace designed to automate static repository analysis, structure audits, and interactive codebase onboarding. Instead of manual code walkthroughs or blind AI queries, DevPilot recursive-scans repository AST structures, evaluates configuration file health, streams real-time code, and compiles interactive walkthrough roadmaps.

---

## 🌟 Key Features

### 🛠️ 1. Dynamic Health Breakdown & Repository Auditor

- **Rule-Rule Auditing Engine**: Evaluates repository structures for common configuration gaps, security files (missing `.gitignore`, `.env.example`), and compiler metrics (`tsconfig.json`).
- **Aesthetics circular gauge**: Highlights overall codebase health scores with an animated SVG radial dial and coded metrics.
- **Code Bloat & Hotfile Alerts**: Traverses files to detect bloated components (>60KB) and directory nesting warnings.
- **Interactive Remediation Cards**: Renders copy-to-clipboard terminal scripts (e.g. `npx tsc --init`, adding configs) for instant resolution.

### 🔍 2. Live Code-Tree Explorer & Analytics

- **0-Token Code Browser**: Streams real-time code structures natively from GitHub's API, preserving LLM context window limits.
- **GitHub Raw CDN Integration**: Instantly streams actual file code from public/master branches, degrading gracefully back to simulated blueprints on mock runs.
- **Multi-Faceted Developer Filters**: Search and isolate files by format (.tsx, .py, .css), complexity (High, Medium, Low), or review status.
- **File Progress Tracker**: Check off audited scripts to track repository onboarding milestones, showing a progress dial with exportable Markdown reports.

### 💬 3. Codebase Architect & Mentor

- **Context-Enriched Conversations**: Engages in multi-turn discussions backed by truncated file structures, primary dependencies, and README context.
- **Dynamic Response Cards**: Renders structured code blocks, system explanations, and follow-up prompts to simplify developer queries.
- **Local History Sync**: Retains chat histories inside local sandboxes for fast reloading.

### 🗺️ 4. Stack-Aware Roadmap & Good First Issues

- **Stack-Tailored Pathways**: Scans package configurations to draft custom learning steps (e.g., matching React patterns, FastAPI middleware paths).
- **Issue Autodetector**: Flags missing Prettier, ESLint, or testing rules to automatically output "Good First Issues" for onboarding developers.

### 🔑 5. Secure Auth & Workspace

- **GitHub OAuth integration**: Synchronize accounts, save analyzed repository links, configure custom AI Studio keys, or add GitHub Personal Access Tokens (boosting API rate limits to 5,000 requests/hour).

---

## 📂 Project Architecture

```
devpilot-ai/
├── backend/
│   ├── app/
│   │   ├── ai/                 # Gemini/OpenRouter prompt configuration & context builders
│   │   ├── api/
│   │   │   ├── routers/        # Analysis, authentication, and mentor endpoints
│   │   │   ├── services/       # GitHub API integration & Python audit engine
│   │   │   └── schemas/        # Type-safe Pydantic request/response layers
│   │   └── main.py             # FastAPI bootstrap application
│   └── Dockerfile              # Production containerization
└── src/
    ├── components/
    │   └── dashboard/          # Interactive Health, Code Tree, and Mentor UI decks
    ├── services/               # REST client bindings to local FastAPI backend
    ├── types/                  # Shared TypeScript data models
    └── main.tsx                # Vite app entry point
```

---

## ⚡ Quickstart Setup

### 1. Prerequisites

- Node.js (v18+)
- Python (3.9+)
- Git

### 2. Backend Set up

```bash
# Navigate to backend path
cd backend

# Create virtual environment
python -m venv .venv
# Activate: Windows: .venv\Scripts\Activate.ps1 | Unix: source .venv/bin/activate
.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Create environment template
copy .env.example .env

# Configure .env with your keys:
# DATABASE_URL=sqlite+aiosqlite:///./devpilot.db
# GEMINI_API_KEY=your_key_here
# GITHUB_CLIENT_ID=your_id
# GITHUB_CLIENT_SECRET=your_secret
# JWT_SECRET=your_jwt_signing_secret

# Start application server
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Set up

```bash
# Install dependencies
npm install

# Run Vite dev server (Proxies local API calls to backend on port 8000)
npm run dev
```

Open `http://localhost:8080` in your web browser.

---

## 🔒 Security & Compliance (OWASP Guardrails)

> [!WARNING]
> **Git History Warning & Secret Rotation**: If any production API keys, database connection strings, or OAuth client secrets were previously hardcoded in the codebase, they may still exist in the Git history. You must rotate any compromised credentials immediately. Use tools like `git-filter-repo` or BGF to scrub old sensitive strings from the repository history.

- **HttpOnly Cookie Authentication**: Exclusively uses short-lived JWT tokens (15m) and secure refresh tokens (7d) signed on the server.
- **CSRF Prevention**: Utilizes cryptographically secure state parameters during the GitHub OAuth handshake.
- **Clickjacking Protection**: Implements `DENY` frame-security options across the dashboard using native middleware.
- **Query Sanitation**: Normalizes and sanitizes repository urls prior to database queries.

## ♿ Accessibility & SEO

- **Responsive Dark Palette**: Optimized contrast following green-morphic dark mode rules.
- **Keyboard Navigation**: Strict `:focus-visible` outlines, skip links, and semantic tags (`<nav>`, `<main>`) throughout.
- **SEO Optimization**: Automatic robots, sitemap, meta tags, and descriptive title structures.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

_Created with 💙 by DevPilot AI Team. Professional Codebase walkthroughs, automated._
