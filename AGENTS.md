# 🤖 DevPilot AI — Intelligence & Agent Architecture

Unlike traditional AI software that wraps simple wrappers around ChatGPT, DevPilot AI employs a custom **Agentic Data Pipeline** utilizing specific system roles to generate extremely accurate, non-hallucinated results regarding physical codebases. 

This document explains the behavioral agents present in our Python backend.

---

## 1. The Extraction Agent (`GitHubService`)
**Role:** Data Gatherer  
**Location:** `backend/app/api/services/github/service.py`

This agent is purely programmatic and doesn't rely on LLMs. Its job is to recursively crawl a target GitHub repository using the GitHub REST API.
* **Smart Filtering:** It automatically disregards irrelevant asset folders (`.git`, `node_modules`, `dist`, `.devpilot`) to prevent context overflow.
* **Byte Analytics:** It calculates tech stack distributions (e.g., 65% TypeScript, 35% Python) purely based on repository metadata before the LLM ever sees it.

## 2. The Context Builder (`RepositoryContextBuilder`)
**Role:** Summarizer & Token Optimizer  
**Location:** `backend/app/ai/context.py`

When an LLM receives 50,000 lines of code, it naturally "forgets" instructions in the middle (Lost in the Middle phenomena). The Context Builder Agent solves this context-window exhaustion by constructing a hyper-condensed manifest format:
* It reads the raw `README.md`.
* It structures the recursive File Tree into a mapped nested dictionary.
* It injects dependency lists.
Only this stripped-down blueprint is sent to the LLM.

## 3. The Analytics Agent (`RepositoryAnalyzer`)
**Role:** Passive Logic Processor  
**Location:** `backend/app/ai/engines.py`

This is the system prompt that generates the initial Dashboard data when a user types in a repository URL. 
* It is configured with `response_mime_type="application/json"`.
* It uses prompt-injection to strictly return a deeply nested JSON schema matching our Pydantic `AnalyzeResponse` model.
* **Capabilities:** It maps entry points, identifies API layers, lists critical files, and generates a subjective Health Score.

## 4. The Interactive Mentor Agent (`RepositoryMentor`)
**Role:** Active Conversational Interface  
**Location:** `backend/app/ai/mentor.py`

This agent handles active user messages from the frontend UI.
* It dynamically binds the user's chat input directly to the previously generated repository blueprint (stored in server memory/cache).
* **Guiderails:** The Mentor Agent is strictly instructed to ***only*** answer questions pertaining to the active repository. If a user asks "How do I bake a cake?", the Agent is instructed to politely refuse, maintaining professional system immersion.
* **Structured Fallback:** Responses are issued in a structured JSON payload determining `summary`, `explanation`, `evidence`, and intelligent `followUpQuestions` based on context. Wait states tolerate loose JSON and parse standard markdown efficiently.
