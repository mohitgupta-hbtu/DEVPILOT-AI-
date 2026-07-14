# 🧪 DevPilot AI — Testing Strategy & Protocol

Maintaining green CI checks guarantees that frontend redesigns or backend logic optimizations do not break the core GitHub Engine interactions. Our test pipeline runs on **Python `pytest`** and **Node `Playwright`**.

---

## 1. Backend API & Unit Tests (`pytest`)

The backend test suite verifies that authentication flows, network exceptions, and environmental constraints behave predictably.

* **Stateless Operations:** `test_production.py` ensures strict security headers are injected into API responses and validates GitHub URL sanitization functions. 
* **Database & Workflow Lifecycle:** `test_auth.py` and `test_e2e.py` boot a fully contained ephemeral **SQLite Database** (`aiosqlite`) locally. This allows you to rapidly verify database transactions (like saving an analysis or reading settings) entirely offline without requiring a managed Postgres instance!

### Running the Python Suite Locally:

We explicitly invoke the module to automatically append the namespace context:

```bash
cd backend
python -m pytest -q
```
*Tip: Ensure you run `python -m compileall app` prior if executing against modified syntax.*

---

## 2. Environment Falsification & Mocking

Due to stringent secrets management (`.env`), tests are designed to mock missing credentials safely to test expected behavioral failures without halting the execution pipeline.
* **OAuth Mocks:** In `test_e2e.py`, we heavily monkey-patch the `exchange_code_for_token` callbacks to return `fake-token` objects. This allows the test client to execute a successful End-to-End simulation of a user logging into GitHub natively, verifying the JWT signature algorithm offline.

---

## 3. Frontend End-to-End (E2E) Testing

Playwright interacts with the application as if the user is clicking through a browser.

* These tests rely on `playwright.config.ts` located in the **root** of the workspace.
* It is highly recommended to only run Frontend Playwright Tests locally **after** the development server is actively running (`npm run dev`) and connected to your backend port (`8000`).

### Running UI Smoke Tests:

```bash
npx playwright install --with-deps chromium    # First time only
npx playwright test
```

---

## 4. CI Workflow Integration (`ci.yml`)

When you push code, GitHub Actions executes these tasks identically.
* **Frontend:** Executes `npm install --no-audit` strictly bypassing version conflicts, followed by `npm run typecheck` and `npm run build` directly from the `tanstack_start_ts` root structure.
* **Backend:** Leverages Ubuntu servers, executing `pytest` headless.

If a test fails locally, it will fail in CI. Always run tests locally before pushing to `.devpilot` managed branches!
