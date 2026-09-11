# CivicSolve V2 — Free Staging: Automated vs Manual Breakdown

This document clearly distinguishes what **Antigravity has already prepared and automated in the repository** from the **external dashboard actions you must perform manually**.

---

## 🤖 WHAT ANTIGRAVITY DOES AUTOMATICALLY (Repository & Build Side)

All internal technical setup, code compatibility, configuration files, and build pipelines have been 100% prepared by Antigravity:

| Area | What Was Automated | Status in Repo |
| :--- | :--- | :--- |
| **Unified Web Architecture** | Modified `backend/src/server.ts` to automatically detect and serve the compiled React SPA from `frontend/dist` with client-side SPA routing fallback (`/* -> index.html`) while keeping all REST APIs on `/api/v1/*`. Eliminates cross-origin cookie blockers. | ✅ Done |
| **Cloud PostgreSQL SSL Compatibility** | Updated `backend/src/database/index.ts` to automatically detect cloud PostgreSQL databases (such as Neon, Supabase, and Render Postgres) and enforce SSL encryption (`rejectUnauthorized: false`) even during initial migrations. | ✅ Done |
| **Automated Migrations & Schema Fallback** | Updated `backend/src/database/migrate.ts` with multi-path resolution for `schema.sql` so database migrations run seamlessly in both development and compiled production (`dist/`) environments. Added `npm run db:migrate` and `npm run db:seed` to root scripts. | ✅ Done |
| **Build Pipeline Automation** | Updated root `package.json` and `backend/package.json` build scripts to compile shared types, backend TypeScript, frontend Vite bundles, and copy the SQL schema cross-platform with a single command: `npm run build`. | ✅ Done |
| **Render Blueprint Configuration** | Created `render.yaml` declaring the web service, build command, startup migration sequence, auto-deployment on git push, health check path (`/api/v1/health`), and environment variable specs. | ✅ Done |
| **Docker Container Support** | Updated `Dockerfile` (multi-stage non-root build) with automatic pre-boot database migrations (`migrate.js && server.js`) and unthrottled healthcheck probe. Added `.dockerignore`. | ✅ Done |
| **Reverse Proxy & Cookie Security** | Configured `TRUST_PROXY=true` and dynamic `COOKIE_SAME_SITE` (`lax` for unified hosting, `none` for decoupled) with HTTPS-only enforcement (`COOKIE_SECURE=true`) in `backend/src/config/index.ts` and `backend/src/controllers/auth.controller.ts`. | ✅ Done |
| **Environment Variable Templates** | Updated `.env.example`, `backend/.env.example`, and `frontend/.env.example` documenting every staging and production configuration key without leaking secrets. | ✅ Done |
| **Decoupled Fallback (Vercel)** | Created `frontend/vercel.json` with single-page routing rewrite rules in case you ever choose to host the frontend separately on Vercel Edge. | ✅ Done |
| **Testing & Release Verification** | Verified that all 73 automated tests continue to pass with 0 errors across 9 test suites (`health`, `taxonomy`, `auth`, `provider`, `search`, `request`, `review`, `admin`, `security`). | ✅ Done (73/73 Passing) |

---

## 👤 WHAT YOU MUST DO MANUALLY (External Accounts & Dashboards Only)

Because Antigravity cannot access your personal external accounts, credit cards, or private passwords, you only need to perform these 4 external steps:

### Action 1: Create a Private GitHub Repository & Push Code
- **Why it is manual:** Requires your private GitHub login and git credentials.
- **Where:** [https://github.com/new](https://github.com/new)
- **What to do:** Create a repository named `CivicSolve`, then run the 4 git push commands from your terminal (detailed in `FREE_STAGING_DEPLOYMENT.md` Step 1).

### Action 2: Create a Free Database on Neon
- **Why it is manual:** External cloud service creation.
- **Where:** [https://console.neon.tech](https://console.neon.tech)
- **What to do:** Click "Create Project", name it `civicsolve-staging`, and copy the provided `postgresql://...` connection string.

### Action 3: Create a Free Web Service on Render
- **Why it is manual:** External cloud dashboard configuration.
- **Where:** [https://dashboard.render.com](https://dashboard.render.com)
- **What to do:**
  - Click "New +" -> "Web Service".
  - Link your `CivicSolve` GitHub repository.
  - Paste the Neon connection string into `DATABASE_URL`.
  - Enter `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (at least 32 characters each).
  - Click "Create Web Service".

### Action 4: Test from Your Mobile Phone / Browser
- **Why it is manual:** Requires testing real user experience on physical devices.
- **Where:** Open your phone's browser (Chrome/Safari) and navigate to `https://civicsolve-staging.onrender.com`.
- **What to do:** Perform search queries, request a service, test login/register, and verify responsive mobile UI.
