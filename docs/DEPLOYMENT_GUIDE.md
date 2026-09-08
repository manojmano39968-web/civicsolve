# CivicSolve — Free Public Deployment & Production Guide

## Overview

CivicSolve is architected for zero-cost ($0 / ₹0) public cloud hosting, specifically optimized for free-tier platforms like **Render**, **Railway**, or **Vercel/Render**.

The repository includes a production-ready **Render Blueprint** (`render.yaml`) that configures:
1. **Frontend**: React 18 + Vite + Tailwind CSS (Static Site, free tier)
2. **Backend**: Node.js + Express REST API (Web Service, free tier)
3. **AI Service**: Python FastAPI + Spacy/Scikit-learn NLP (Web Service, free tier)
4. **Database**: Managed PostgreSQL (Free tier) with zero-config SQLite local fallback

---

## Architecture & Communication Diagram

```
[ Mobile Phone / Laptop Browser ]
                │
                ▼ (HTTPS)
   ┌───────────────────────────┐
   │    civicsolve-frontend    │  (Render Static Site)
   │  React 18 + Vite + CSS    │
   └─────────────┬─────────────┘
                 │
                 ▼ (REST API calls / HTTPS)
   ┌───────────────────────────┐
   │    civicsolve-backend     │  (Render Web Service - Node.js)
   │     Express.js API        │
   └───┬───────────────────┬───┘
       │                   │
       ▼ (PostgreSQL SSL)  ▼ (Internal / Public HTTP)
┌──────────────┐   ┌──────────────────────────┐
│ civicsolve-  │   │      civicsolve-ai       │  (Render Web Service)
│   db (Post-  │   │  FastAPI NLP Microservice│
│   greSQL)    │   └──────────────────────────┘
└──────────────┘
```

---

## Free Hosting Constraints & Cold Starts (Important Notice)

Render's free tier provides full functionality at **zero cost ($0)**, with the following runtime behaviors:

1. **Inactivity Sleep (Spin-Down)**:
   - Free web services automatically spin down after 15 minutes of inactivity.
   - When a team member opens the link for the first time after it has been idle, the service takes **30 to 50 seconds** to wake up.
   - **Tip for Demo Day**: Open the public URL 2–3 minutes before presenting to the judges to ensure all three services are warm and respond instantly!

2. **Automated Schema & Seeding**:
   - The backend server automatically detects whether the database is empty on boot.
   - If empty, it automatically runs `db.initSchema()` and `seedDatabase()`, populating the 8 challenges, candidates, hero team, tasks, and impact metrics.

3. **Deterministic Reset**:
   - The `POST /api/demo/reset` endpoint can be triggered at any time via the "Reset Demo" button in the navigation or admin dashboard to return the database to pristine SIH demo state.

---

## Step-by-Step Deployment Instructions

### Step 1: Push Code to Your GitHub Account

1. Open a terminal in this directory:
   ```bash
   git add .
   git commit -m "CivicSolve: Mobile-first responsive UI upgrade and Render deployment config"
   ```
2. Create a new repository on [GitHub](https://github.com/new) named `civicsolve`.
3. Push your repository:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/civicsolve.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy with Render Blueprint (1-Click Setup)

1. Go to [Render.com](https://render.com) and sign in (or sign up for free using your GitHub account).
2. On your Render Dashboard, click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your `civicsolve` GitHub repository.
4. Render will automatically read `render.yaml` and show the resources it will create:
   - `civicsolve-db` (PostgreSQL Database - Free)
   - `civicsolve-ai` (Web Service - Python - Free)
   - `civicsolve-backend` (Web Service - Node.js - Free)
   - `civicsolve-frontend` (Static Site - Free)
5. Click **Apply**.
6. Render will automatically provision the database, build the Python AI service, deploy the Node backend, and build the React frontend.

---

### Step 3: Verify Environment Variables

Render's blueprint automatically links the internal database and services, but verify the following values in your service settings:

#### Backend (`civicsolve-backend`):
| Variable | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Set automatically |
| `PORT` | `5000` (or injected by Render) | Set automatically |
| `DATABASE_URL` | Selected from `civicsolve-db` connection string | Set automatically by Blueprint |
| `AI_SERVICE_URL` | `https://civicsolve-ai.onrender.com` | If internal, Render links host directly |
| `CORS_ORIGIN` | `*` | Permits requests from frontend |

#### Frontend (`civicsolve-frontend`):
| Variable | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://civicsolve-backend.onrender.com/api` | Point to your deployed backend URL |

*Note: If you change `VITE_API_BASE_URL`, trigger a "Clear build cache & deploy" on the frontend service so Vite bakes in the new URL during its static build.*

---

## Health Check Endpoints

Once deployed, verify that the services are online by testing these endpoints in your browser:

1. **Frontend**: `https://<your-frontend>.onrender.com` (Loads CivicSolve landing page)
2. **Backend Health**: `https://<your-backend>.onrender.com/api/health`
   - Expected response: `{"status":"ok","service":"civicsolve-backend", ...}`
3. **AI Health**: `https://<your-ai>.onrender.com/health`
   - Expected response: `{"status":"ok","service":"civicsolve-ai-service"}`
4. **Initial Demo Reset**: `POST https://<your-backend>.onrender.com/api/demo/reset`
   - Expected response: `{"success":true,"message":"CivicSolve demo state has been successfully reset..."}`

---

## Mobile Phone Testing Checklist (Before the Presentation)

Open `https://<your-frontend>.onrender.com` on an **iPhone (Safari)** or **Android (Chrome)**:

- [ ] **Landing Page**: Viewport is 100% contained, no horizontal scroll, hero card displays Chennai Urban Flooding.
- [ ] **Mobile Bottom Navigation**: Bottom bar is visible with 5 icons (`Home`, `Problems`, `Workspace`, `Progress`, `Dashboard`).
- [ ] **Role Switcher**: Tapping the top-right persona pill opens the bottom sheet drawer; switching role transitions immediately.
- [ ] **Challenge Detail**: Shows problem description, AI category badge, required skills list, and "Why these skills?" explainable AI card.
- [ ] **Matching Page**: Displays top 5 matched contributors with 4 visual progress bars (Skill, Domain, Location, Readiness) and AI reasoning.
- [ ] **Team Workspace**: 6 tasks with 44px+ touch targets; tapping a checkbox toggles between `completed` and `pending`.
- [ ] **Progress Timeline**: Vertical mobile timeline shows `DONE`, `CURRENT`, `NEXT`, and `FUTURE` badges cleanly.
- [ ] **Impact Page**: Prominent `DEMO / PILOT DATA` banner is visible, baseline vs target vs current comparison table is scrollable/readable, and 3 progress bar cards render without overflow.
- [ ] **Reset Demo**: Tapping "Reset Demo" resets state back to initial benchmarks.
