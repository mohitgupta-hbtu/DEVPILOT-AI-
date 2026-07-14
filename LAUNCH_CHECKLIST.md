# 🚀 DevPilot AI — Production Flight Checklist

> This checklist ensures your DevPilot AI instance is fully secured, performant, and ready for end-users before you launch it publicly (on ProductHunt, LinkedIn, or your Portfolio).

A single missing environment variable can break your application. **Do not skip this checklist.**

---

## 🛠️ 1. CI / CD & Build Pipeline

- [ ] **GitHub Actions Pass:** Verify that the `CI` workflow is green. The frontend and backend jobs must both display `✅ 2/2` or `✅ 3/3` in your Pull Requests.
- [ ] **Frontend Build:** Run `npm run build` locally. Verify that the output sizes are minimal and there are no TypeScript/Linting errors.
- [ ] **Backend Compile:** Run `python -m pytest` and `python -m compileall app`. Ensure there are 0 warnings and 0 failures.

---

## 🔐 2. Security & Secrets (Crucial)

If you miss any of these, your application will be instantly vulnerable to exploits.

- [ ] **JWT Secret Strength:** Ensure `JWT_SECRET` in your hosting provider (Render/Heroku/Docker) is a long, highly secure string. Never use "test" in production.
- [ ] **GitHub OAuth Secrets:** `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` must be correctly copied from your GitHub Developer Settings.
- [ ] **OAuth Redirect URIs:** Ensure your GitHub OAuth App's "Authorization callback URL" points to your Production backend (e.g., `https://api.yourdomain.com/auth/callback` instead of `localhost`).
- [ ] **Environment Protection:** Ensure `ENVIRONMENT=production`. This automatically disables Swagger UI `/docs` and prevents data leakage in crash logs.
- [ ] **CORS Origins:** Ensure `CORS_ORIGINS` strictly contains your frontend URL (e.g. `https://devpilot.yourdomain.com`). No trailing slashes.

---

## 💽 3. Database & Connectivity

- [ ] **Primary Database Hookup:** Ensure `DATABASE_URL` is pointing to a managed PostgreSQL cluster (e.g., Supabase / Neon / AWS RDS).
- [ ] **Database Migrations:** Ensure startup logic or migration scripts (`alembic` / SQL commands) have correctly initialized the production tables (`users`, `user_settings`, `saved_analyses`, `favorites`).
- [ ] **Gemini API Scope:** Ensure your `GEMINI_API_KEY` is fully provisioned and has valid request quotas left to power the Mentor Engine.

---

## 🚀 4. Performance & UX

- [ ] **Cold Start Checks:** Load the domain on a fresh Incognito tab. Validate it loads within 1–2 seconds.
- [ ] **Responsive Design:** Verify the Code Tree and Interactive Health components stack beautifully on mobile viewports.
- [ ] **Branding:** Verify `favicon.svg` (the green 'D') appears properly in the browser tab.

---

## 🔍 5. End-to-End Smoke Test (The Final Run)

Before driving traffic to the app, manually execute the Happy Path:

1. [ ] Log out of DevPilot AI.
2. [ ] Click "Sign In via GitHub" and ensure it successfully routes back to the `/dashboard`.
3. [ ] Fetch a new unique repository (e.g., `mohitgupta-hbtu/DEVPILOT-AI-`).
4. [ ] Verify the architecture map generation finishes successfully.
5. [ ] **Save Analysis:** Pin the analysis. Verify it appears in the _History_ tab.
6. [ ] **Mentor Chat:** Ask the AI Mentor a specific question about the repo. Verify it streams the JSON response and parses it properly into markdown answers.

---

### 🎉 Ready for Launch

If all the boxes above are checked, **DevPilot AI** is officially cleared for take-off! You can safely tag a production release on GitHub and deploy.
