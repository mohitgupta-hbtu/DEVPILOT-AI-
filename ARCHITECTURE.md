# DevPilot AI — Workspace & System Architecture

> **DevPilot AI** is an intelligent developer workspace designed to instantly analyze any GitHub repository, generating comprehensive architecture maps, tech-stack blueprints, and conversational AI mentorship without requiring you to clone the repo locally.

This document outlines the architectural decisions and system design of DevPilot AI. It is intended for both **end-users** (to understand data privacy and capabilities) and **developers** (to understand the application scaffolding).

---

## 1. High-Level Concepts & Privacy Guarantees

DevPilot AI is built around a strict **privacy-first data pipeline**.

- **We DO NOT clone or store your code:** DevPilot streams context directly from GitHub's REST API into the AI Engine. The code vanishes from our memory immediately after the analysis is compiled.
- **We DO NOT train AI models on your private data:** Any intelligence generated is strictly deterministic or passed securely to the context window of our Language Learning Model (LLM) strictly for runtime output.
- **Separation of Concerns:** Our React frontend and FastAPI backend are entirely decoupled. Your browser directly receives compiled artifacts without exposing application secrets.

---

## 2. Infrastructure & Tooling Stack

The application uses a separated Monorepo structure containing two distinct applications communicating over a typed REST contract.

### Frontend App (Client)

- **Framework:** React 19 + TypeScript + Vite.
- **Routing:** `@tanstack/react-router` enables high-speed, declarative, and type-safe routing.
- **Styling:** TailWind CSS. Global tokens and dynamic dark modes are controlled globally via `index.css`.
- **State Management:** `@tanstack/react-query` is utilized for robust data fetching and request caching.

### Backend App (Server)

- **Framework:** FastAPI (Python 3.11).
- **Database:** SQLite (local usage via `aiosqlite`) or PostgreSQL (Production deployment) wrapped utilizing **SQLModel** (SQLAlchemy + Pydantic).
- **Design Pattern:** Data flows through a strict pipeline: _Route → Security/Middleware Check → Database Session → Service Logic → Pydantic Validator_.
- **Authentication:** A custom stateless, HTTP-Only JWT signature logic backed by GitHub OAuth. Supabase Auth is intentionally avoided in favor of raw session mastery.

---

## 3. Data & Security Posture

Our security posture focuses on zero cross-site vulnerabilities.

1. **Authentication Token Flow:**
   - Browser requests `/auth/github`. Backend redirects to GitHub securely appending a CSRF `state_cookie`.
   - GitHub returns to `/auth/callback` with a payload.
   - Backend issues an encrypted **HTTP-Only Access Token** (Valid 15m) and a **Refresh Token** (Valid 7d). These tokens are invisible to client-side scripts.
2. **Access Control:** Every modification request checks `user_id` strictly from the decrypted server JWT, permanently preventing IDOR (Insecure Direct Object Reference).
3. **Defense Layers:** We apply `nosniff`, strict `Content-Security-Policy`, and Rate Limiting automatically blocking massive concurrent bot abuse queries via the `SecurityHeadersMiddleware`.

---

## 4. Analytical Intelligence System

The true power of DevPilot relies on a combination of _Heuristic Analytics_ interacting with _LLM Pipelines_.

### Phase A: The Data Aggregator (`GitHubService`)

When you submit a GitHub URL, DevPilot does not clone the directory. Instead, it hits GitHub's `git/trees` endpoints recursively. It extracts the raw File Hierarchy, package manager `.json`/`.yaml` files, and language byte percentages.

### Phase B: The AI Context Injector (`RepositoryAnalyzer`)

Rather than sending thousands of raw files to an LLM, DevPilot parses configurations locally to extract dependencies and build a 'Skeleton' structure.

### Phase C: Contextual Guidance (`Mentor Engine`)

The parsed intelligence is cached into the user's current session memory. When a user asks a question to the **DevPilot Mentor**, the model answers strictly informed by the context cache—grounded deeply in the repository's rules logic rather than hallucinating global advice.

---

## 5. File Layout & Module Responsibility

Below is a breakdown of precisely where logic is mapped, helping contributors debug rapidly:

```
DEVPILOT-AI/
├── backend/                       # Server-side environment
│   ├── app/
│   │   ├── ai/                    # Custom prompts & LLM bindings
│   │   ├── api/                   # (Routers, Schemas, external Service Connectors)
│   │   ├── middleware/            # Global Rate Limiting, HTTP headers
│   │   ├── config.py              # Single source of truth for ENV vars
│   │   └── main.py                # FastAPI bootstrapper
│   └── tests/                     # Secure workflow tests
│
└── src/                           # Client-side environment
    ├── components/
    │   ├── common/                # Reusable loaders, buttons, wrappers
    │   └── dashboard/             # Charting, Tree views, Data Tables
    ├── contexts/                  # AuthProviders, ThemeProviders
    ├── routes/                    # File-system-based TanStack routing components
    ├── services/api/              # Client fetch bindings mapped explicitly to backend
    └── styles.css                 # Master Tailwind and token variables
```

---

## 6. Extending DevPilot AI (Future Integration Maps)

If you intend on contributing to this OSS platform, we have paved paths for easy feature injections:

- **Session Histories:** The database schema inherently possesses `ai_sessions`, ready to store chronological chat memory paths in future feature rollouts.
- **Vector Store Integrations:** Currently, large files are excluded to prevent context exhaustion. A logical upgrade maps large `.py` / `.js` files to an embedded Vector Database via an extension of the `Mentor` engine blocks.
