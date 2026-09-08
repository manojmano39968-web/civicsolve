# CivicSolve: Technical & Architectural Notes

This document provides architectural, algorithmic, and engineering details for the CivicSolve MVP.

---

## 1. System Architecture & Separation of Concerns

```
[ React + Vite Frontend (Port 5173) ]
               │
          REST │ (JSON / HTTP)
               ▼
   [ Node.js Express API (Port 5000) ]
       │                         │
       │ Internal HTTP           │ SQL / Parameterized Queries
       ▼                         ▼
[ Python FastAPI AI (Port 8000) ]   [ Dual-Mode Relational DB ]
(NLP & Weighted Matching)           (SQLite fallback / PostgreSQL)
```

### Why Separate Node.js Backend and Python AI Service?
1. **Specialized Strengths**:
   - **Node.js (Express)** excels at I/O-intensive web traffic, asynchronous connection pooling, authentication, task state persistence, and serving RESTful APIs with minimal latency.
   - **Python (FastAPI)** is the industry standard for NLP tokenization, scientific numerical operations, vector mathematics, and machine learning pipelines.
2. **Independent Scalability**: In a production deployment, the AI matching microservice can be autoscaled independently on GPU/compute-optimized instances without burdening the transactional application server.
3. **Resilience & Fallback**: The Node.js service implements an intelligent resilience circuit: if the Python service is offline or restarting, the backend gracefully provides rule-based NLP and algorithmic ranking so user operations never crash.

---

## 2. Multi-Factor Explainable Matching Algorithm

CivicSolve rejects opaque "black box" matching. Candidate scores are calculated through a four-component weighted formula:

$$\text{Final Score} = (0.40 \times S) + (0.25 \times D) + (0.15 \times L) + (0.20 \times E)$$

### Factor Breakdown:
1. **Skill Match Score ($S$ — 40%)**:
   - Calculates direct and synonym-expanded overlap between challenge required skills ($R$) and candidate skills ($C$):
   - Direct skill matches are weighted by certified proficiency tier:
     - `Expert`: $1.0\times$
     - `Advanced`: $0.85\times$
     - `Intermediate`: $0.70\times$
     - `Beginner`: $0.50\times$
   - Related/allied skills (e.g. AutoCAD for GIS, Urban Drainage for Drainage Design) receive $0.60\times$ partial credit.
   - Normalized across interdisciplinary team coverage.
2. **Domain Alignment Score ($D$ — 25%)**:
   - Assesses broad contextual compatibility based on user biography, faculty center affiliation, or institutional background (e.g. Water Resources Research Centre = 96%).
3. **Geographic Proximity Score ($L$ — 15%)**:
   - Same municipality / district (e.g. Chennai resident addressing Chennai urban flooding) receives 95%.
   - Same regional state receives 80%; outside state receives 60%.
4. **Experience Readiness Score ($E$ — 20%)**:
   - Evaluates implementation track record:
     - Faculty research authorities: 95%
     - Licensed municipal contractors: 90%
     - Senior engineering students with portfolio projects: 85–88%

### Transparency & Explainability:
Every matching output returns both the composite percentage and individual factor scores (`skill_score`, `domain_score`, `location_score`, `experience_score`) accompanied by natural-language justifications.

---

## 3. Database Architecture & Dual-Mode Adapter

### Dual-Mode Database Adapter (`backend/src/db/index.js`):
- **PostgreSQL Mode**: If an active connection string is supplied via `DATABASE_URL`, CivicSolve connects through `pg.Pool` with SSL handling.
- **SQLite Fallback Mode**: If PostgreSQL is not configured, the backend automatically initializes an embedded file-backed SQLite database (`database/civicsolve.db`) using `better-sqlite3`.
- **Query Interoperability**: The adapter transparently translates standard ANSI parameter placeholders (`$1, $2, ...` to `?`) while enforcing foreign keys (`PRAGMA foreign_keys = ON`) and Write-Ahead Logging (`WAL`).

### Relational Schema Design:
- `users`: Stakeholder profiles with roles (`citizen`, `student`, `expert`, `industry`, `admin`).
- `skills` & `user_skills`: Standardized taxonomy with proficiency tiers.
- `challenges` & `challenge_skills`: Community issues linked to required technical competencies.
- `matches`: Computed algorithmic ranking records with explainable factors.
- `teams` & `team_members`: Collaborative multi-role rosters.
- `tasks`: Actionable milestone checklists with interactive status tracking.
- `solutions`: Engineering intervention dossiers.
- `progress_updates`: Time-stamped lifecycle audit log.
- `impact_metrics`: Baseline, target, and current measured values.
- `comments`: Discussion threads within workspaces.

---

## 4. Impact Measurement Methodology

CivicSolve implements a three-tier quantitative baseline-to-target tracking framework:
1. **Baseline ($V_{\text{baseline}}$)**: Measured or documented pre-intervention status (e.g. $5.0\text{ hours}$ average waterlogging duration; $2.4\text{ km}^2$ flooded area).
2. **Target Benchmark ($V_{\text{target}}$)**: Technical engineering objective under pilot conditions ($2.0\text{ hours}$; $1.2\text{ km}^2$).
3. **Current Measured ($V_{\text{current}}$)**: Verified post-pilot outcome ($3.0\text{ hours}$; $1.5\text{ km}^2$).

$$\text{Improvement Delta} = \frac{|V_{\text{current}} - V_{\text{baseline}}|}{|V_{\text{target}} - V_{\text{baseline}}|} \times 100\%$$

All metrics are clearly labeled as **"Demo / Pilot Data"** to maintain hackathon scientific integrity.
