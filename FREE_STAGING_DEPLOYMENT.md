# CivicSolve V2 — Free Staging Deployment Guide

> **Cost:** Exactly **$0.00 / month**  
> **Infrastructure:** 100% Free Tiers (No credit card required for Neon or Render)  
> **Target Audience:** Non-technical / beginner-friendly guide with exact step-by-step instructions.

---

## 1. Overview of the Free Architecture

To let real users test CivicSolve from Android phones, iPhones, and computers over public HTTPS without paying anything, we use a battle-tested 2-service architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Your Users (Mobile / Web)            │
│                 https://civicsolve-staging.onrender.com │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Render (Free Web Service)                  │
│  - Serves React Frontend (Vite Single Page App)         │
│  - Runs Node.js / Express Backend REST API (/api/v1)    │
│  - Same-origin domain (eliminates mobile cookie blocks) │
│  - Free Let's Encrypt SSL certificate                   │
└────────────────────────────┬────────────────────────────┘
                             │ SSL (Encrypted Postgres Connection)
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Neon Serverless PostgreSQL (Free)             │
│  - 0.5 GB Free Database Storage                         │
│  - Never expires (unlike Render DB which dies in 30 d)  │
│  - Automated backups and serverless scale-to-zero       │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites (Free Accounts)

You only need accounts on two free platforms. You can sign up using your existing GitHub account:

1. **GitHub** ([github.com](https://github.com)): To store your code repository.
2. **Neon** ([neon.tech](https://neon.tech)): For your free PostgreSQL database.
3. **Render** ([render.com](https://render.com)): For your free web application hosting.

---

## 3. Step-by-Step Deployment Instructions

### STEP 1: Push Code to GitHub

Before deploying, push your local `CivicSolve` code to a private GitHub repository.

1. **Website to open:** [https://github.com/new](https://github.com/new)
2. **Account to create / log in:** Your GitHub account.
3. **Setting to select:**
   - **Repository name:** `CivicSolve`
   - **Visibility:** Select **Private**
   - Do **NOT** check "Add a README file" or "Add .gitignore" (the project already has them).
4. **Button to click:** Click the green **"Create repository"** button.
5. **Commands to run in your local terminal:**
   Open a terminal in `D:\CivicSolve` and run:
   ```bash
   git add .
   git commit -m "feat: prepare repository for free staging deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/CivicSolve.git
   git push -u origin main
   ```
   *(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username).*
6. **Expected result:** All code files appear on your GitHub repository page.

---

### STEP 2: Create Free PostgreSQL Database on Neon

Neon provides a permanently free serverless PostgreSQL database with zero maintenance and no 30-day expiration clock.

1. **Website to open:** [https://console.neon.tech/signup](https://console.neon.tech/signup)
2. **Account to create:** Click **"Continue with GitHub"** and authorize Neon.
3. **Button to click:** Click **"Create Project"**.
4. **Settings to select:**
   - **Project Name:** Type `civicsolve-staging`
   - **Postgres version:** Keep default (`16`)
   - **Region:** Pick the region closest to you or your target users (e.g., `US East (Ohio)` or `Europe (Frankfurt)`).
5. **Button to click:** Click **"Create Project"**.
6. **Value to copy:**
   - You will see a box titled **"Connection Details"**.
   - Ensure the dropdown shows **"Connection string"** and the checkbox **"Pooled connection"** is **CHECKED** (recommended for serverless) or standard.
   - Click the **"Copy"** icon next to the connection string.
   - It will look like:
     ```text
     postgresql://neondb_owner:npg_AbCd123XyZ@ep-cool-fog-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
7. **Where to save it:** Temporarily paste this string into a Notepad file. You will paste it into Render in Step 3.
8. **Expected result:** You have a live PostgreSQL database ready on Neon.

---

### STEP 3: Create Free Web Service on Render

Render will build and host both your frontend and backend on a free sub-domain with automated HTTPS.

1. **Website to open:** [https://dashboard.render.com](https://dashboard.render.com)
2. **Account to create:** Click **"GitHub"** to sign up / log in with your GitHub account.
3. **Button to click:** In the top right corner of the dashboard, click the blue **"New +"** button, then select **"Web Service"**.
4. **Connect Repository:**
   - Find `CivicSolve` in the list of repositories.
   - Click the **"Connect"** button next to `CivicSolve`.
   *(If you don't see it, click "Configure GitHub App" to give Render access to your new repository).*
5. **Fill in Web Service Settings:**
   - **Name:** Enter `civicsolve-staging` (or any unique name you like).
   - **Region:** Select the same region (or nearest) to your Neon database.
   - **Branch:** `main`
   - **Root Directory:** Leave **blank** (root of repo).
   - **Runtime:** Select **Node**.
   - **Build Command:** Enter:
     ```bash
     npm install && npm run build
     ```
   - **Start Command:**
     - *For First-Time Deploy with Sample Data (categories, services, problem solvers):*
       ```bash
       npm run db:seed && npm start
       ```
     - *For Normal Production Start (runs migrations only):*
       ```bash
       npm run db:migrate && npm start
       ```
     *(You can safely use `npm run db:seed && npm start` on first deploy so your staging site starts pre-loaded with categories, services, and realistic problem solvers).*
   - **Instance Type:** Click the **"Free"** card ($0 / month).

6. **Add Environment Variables:**
   Scroll down to the **"Environment Variables"** section. Click **"Add Environment Variable"** for each row below:

   | Key | Value to Enter | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations & security guards |
   | `PORT` | `10000` | Port Render routes web traffic to |
   | `DATABASE_URL` | *[Paste your Neon connection string from Step 2]* | Full PostgreSQL connection string |
   | `JWT_ACCESS_SECRET` | `c1v1cs0lv3_acc3ss_s3cr3t_st4g1ng_k3y_99281` | Any random string at least 32 characters |
   | `JWT_REFRESH_SECRET` | `c1v1cs0lv3_r3fr3sh_s3cr3t_st4g1ng_k3y_77182` | Any different random string at least 32 characters |
   | `COOKIE_SECURE` | `true` | Enforces HTTPS-only secure cookies |
   | `COOKIE_SAME_SITE` | `lax` | Enables reliable mobile authentication on same origin |
   | `TRUST_PROXY` | `true` | Allows Express to trust Render's HTTPS reverse proxy |
   | `ALLOW_PROD_SEED` | `true` | *(Optional)* Allows `npm run db:seed` to populate staging data |

7. **Button to click:** Click the blue **"Create Web Service"** button at the bottom.
8. **Expected result:**
   - Render starts building your project.
   - You will see live build logs:
     1. Dependencies installed (`npm install`)
     2. TypeScript shared types compiled
     3. Backend compiled to `backend/dist`
     4. Frontend compiled and bundled via Vite to `frontend/dist`
     5. Database migrations / seeds executed
     6. `🚀 CivicSolve V2 Server running on http://localhost:10000`
   - Within 2–4 minutes, the status indicator will turn green: **"Live"**.
   - Your public URL will appear at the top left under the service name, for example:  
     `https://civicsolve-staging.onrender.com`

---

## 4. How to Test CivicSolve from Your Phone (Android / iPhone)

1. Open **Chrome** or **Safari** on your mobile phone.
2. Type in your public Render URL (e.g. `https://civicsolve-staging.onrender.com`).
3. **Verify the Public User Experience:**
   - **Homepage:** Browse the landing page, notice responsive layout and category cards.
   - **Natural Language Search:** Tap the search bar and type:  
     `"pipe burst under kitchen sink water leaking everywhere"`  
     Verify that the engine detects **Plumbing Repairs** and displays ranked problem solvers.
   - **Service Needer Flow:**
     - Click "Request Service" on a provider.
     - Register a new account (e.g., `tester@civicsolve.local`).
     - Fill in problem details and submit.
   - **Mobile Verification:**
     - Tap the mobile hamburger menu.
     - Switch between dark/light theme.
     - View "My Requests" and verify request status transitions.
   - **Provider Flow:**
     - Log in or register as a provider.
     - Accept service requests, mark in-progress, and complete request.
     - Leave a verified review as the requester.

---

## 5. Free-Tier Limitations You Must Know

Because this staging environment is 100% free with $0 budget, cloud providers apply standard free-tier policies:

| Limitation | Detail | Practical Impact |
| :--- | :--- | :--- |
| **Inactivity Sleep (Cold Start)** | Render spins down the free web service after **15 minutes of zero traffic**. | When someone visits the site after it has been idle, the **first page load takes ~45–60 seconds** to wake up. Once awake, it responds instantly (<100ms). |
| **Render Monthly Free Hours** | Render provides **750 free instance hours per month**. | Running 1 unified web service uses 720–744 hours per month, meaning it **remains free all month long**. |
| **Neon Compute Suspension** | Neon pauses serverless compute after 5 minutes of idle database queries. | Auto-wakes on the next query within ~1 second. Completely transparent to users. |
| **Database Storage Limit** | Neon free tier provides **0.5 GB (500 MB)** of PostgreSQL storage. | CivicSolve database with hundreds of users, providers, requests, and reviews uses < 5 MB. You will use < 1% of the free quota. |
| **Bandwidth Limit** | Render free tier includes **100 GB/month** outbound data. | More than enough for thousands of staging visits and testing sessions. |
| **Custom Domain** | You receive a free `onrender.com` HTTPS subdomain. | You can attach a free or purchased custom domain later at any time for $0 additional hosting cost. |

---

## 6. How to Migrate from Free Staging to Production Later

When you are ready to launch CivicSolve V2 commercially and want 0-second cold starts, custom domains, and production scaling:

1. **Keep the Database or Upgrade:**
   - Upgrade Neon to the Launch Plan ($19/mo) for autoscaling storage and dedicated compute, or keep Neon Free if your traffic is modest.
2. **Upgrade Web Service on Render:**
   - In the Render dashboard, click your service -> **"Settings"** -> change instance type from **"Free"** to **"Starter" ($7/month)**.
   - This keeps the server awake 24/7 with zero cold starts, 512 MB RAM, and dedicated CPU.
3. **Add Custom Domain:**
   - In Render -> **"Settings"** -> **"Custom Domains"** -> enter your purchased domain (e.g. `civicsolve.org`).
   - Add the CNAME record in your domain registrar (GoDaddy, Namecheap, Cloudflare). Render automatically issues a free SSL certificate.
4. **No Code Changes Needed:**
   - The entire CivicSolve V2 codebase is already architected for production PostgreSQL, secure cookies, and proxy headers. Zero code refactoring is required.
