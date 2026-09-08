# CivicSolve
> **Connect People | Solve Problems | Create Impact**  
> *Smart India Hackathon Working MVP Prototype*

---

## 1. What is CivicSolve?
**CivicSolve** is a collaborative platform designed to bridge the disconnect between communities experiencing real-world civic challenges and the multidisciplinary students, academic researchers, and industry contractors capable of solving them.

> [!NOTE]
> **MVP Demonstration Notice**: This repository is a student-built MVP created for demonstration at the Smart India Hackathon. It is designed to prove the complete problem-to-impact lifecycle in a 5–7 minute live evaluation. It is not yet deployed as a municipal production system.

---

## 2. The Problem Being Solved
Across Indian municipalities, localized challenges exist everywhere—such as recurring monsoon waterlogging in low-lying neighborhoods, unsegregated waste clogging landfills, or hazardous blind turns near schools. 

Citizens report these issues, but traditional grievance portals function merely as static ticketing queues. Simultaneously, engineering students seek real-world capstone projects and faculty experts possess hydrological or civil expertise that is never effectively applied to neighborhood problems. CivicSolve connects these stakeholders around actionable civic interventions.

---

## 3. How CivicSolve Works
1. **Intake**: Citizens report localized problems with context and coordinates.
2. **AI Categorization**: Transparent NLP analyzes problem text, extracts engineering domains, and identifies required technical skills.
3. **Smart Matching**: Explainable weighted algorithms rank candidates (students, faculty researchers, implementation contractors).
4. **Team Formation**: Collaborative teams unite around a shared objective.
5. **Team Workspace**: Living milestone tasks, file sharing, and discussion threads.
6. **Solution Development**: Multidisciplinary technical proposal formulated for municipal review.
7. **Impact Verification**: Quantitative baseline-to-target tracking measures verified community relief.

---

## 4. Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide React icons.
- **Backend API**: Node.js, Express.js, RESTful APIs, Parameterized SQL queries.
- **AI Service**: Python 3.12, FastAPI, Pydantic, Rule-and-Taxonomy NLP, Multi-factor Weighted Candidate Ranking.
- **Database**: Dual-Mode Relational Adapter:
  - **PostgreSQL**: Production-ready support via `pg.Pool` & `docker-compose.yml`.
  - **SQLite**: Local zero-friction fallback (`database/civicsolve.db`) using `better-sqlite3`.

---

## 5. Project Structure

```
civicsolve/
├── frontend/                 # React + Vite Application (Port 5173)
│   ├── src/
│   │   ├── components/      # Navbar, DemoResetModal, Reusable UI
│   │   ├── context/         # AuthContext with 1-click Demo Switcher
│   │   ├── pages/           # 13 Dedicated Views & Dashboards
│   │   ├── services/        # API Client Module
│   │   ├── App.jsx          # Router & Layout
│   │   └── main.jsx
│   └── package.json
│
├── backend/                  # Node.js Express Server (Port 5000)
│   ├── src/
│   │   ├── controllers/     # Challenges, Teams, Tasks, Impact, Demo
│   │   ├── db/              # Dual-Mode Adapter & Seeding Script
│   │   ├── routes/          # API Route Definitions
│   │   ├── services/        # AI Service Client Bridge
│   │   └── server.js        # Entry Point
│   └── package.json
│
├── ai-service/               # Python FastAPI Service (Port 8000)
│   ├── app/
│   │   ├── analyzers/       # Civic Domain NLP & Skill Extraction
│   │   ├── matching/        # 40-25-15-20 Weighted Candidate Matcher
│   │   ├── schemas/         # Pydantic Request/Response Models
│   │   └── main.py          # FastAPI Server
│   └── requirements.txt
│
├── database/                 # Relational Schemas & Seed Data
│   ├── migrations/schema.sql# PostgreSQL DDL
│   └── seed/seed.sql        # Realistic Hero Demo Seed SQL
│
├── docs/                     # Documentation for Judges
│   ├── DEMO_GUIDE.md        # 5-7 Minute Step-by-Step Presentation Script
│   └── TECHNICAL_NOTES.md   # Algorithmic and Mathematical Notes
│
├── docker-compose.yml        # PostgreSQL Optional Container
├── .env.example              # Environment Configuration
└── README.md
```

---

## 6. Quick Local Setup

### Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Python**: 3.10+ (tested on 3.12)
- **npm**: 9+

### Automated Zero-Friction Setup
CivicSolve is pre-configured to run out of the box with zero manual database configuration. It automatically falls back to an embedded SQLite database if PostgreSQL is not active.

#### 1. AI Service (Python FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Health Check*: `http://127.0.0.1:8000/health`

#### 2. Backend API (Node.js)
```bash
cd backend
npm install
npm run seed     # Initializes schema & hero seed data
npm start        # Starts server on port 5000
```
*Health Check*: `http://localhost:5000/api/health`

#### 3. Frontend App (React + Vite)
```bash
cd frontend
npm install
npm run dev      # Starts Vite on port 5173
```
*Web Access*: Open `http://localhost:5173` in your browser.

---

## 7. PostgreSQL Setup (Optional)
If you have Docker installed and wish to run PostgreSQL instead of SQLite:
```bash
# Start PostgreSQL Container
docker-compose up -d

# Set in backend/.env
DATABASE_URL=postgres://postgres:postgrespassword@localhost:5432/civicsolve
DB_CLIENT=postgres

# Run database seed
cd backend
npm run seed
npm start
```

---

## 8. Demo Personas & Mode Switcher

No passwords or accounts are required. Use the **"Switch Persona"** menu in the top bar:

| Persona | Role | Background |
| :--- | :--- | :--- |
| **Kavitha Rajan** | Citizen | Velachery Residents Welfare Association, Chennai |
| **Arjun Kumar** | Student | Civil Engineering (GIS & Drainage), Govt. Engg. College |
| **Dr. Meena Raman** | Faculty Expert | Centre for Water Resources, Anna University |
| **Ravi Infrastructure** | Industry Partner | Municipal Culvert & Desiltation Contractor |
| **CivicSolve Admin** | Administrator | Smart City Mission Innovation Cell |

---

## 9. Resetting Demo State
During a live hackathon demonstration, click the red **"Reset Demo Data"** button in the top navigation bar or Admin Dashboard to immediately restore the clean initial state.

Alternatively, execute via curl:
```bash
curl -X POST http://localhost:5000/api/demo/reset
```

---

## 10. Known Limitations & Future Roadmap
- **Real-World Execution**: In this MVP, pilot metrics represent calibrated simulation benchmarks. Future iterations will interface with IoT stormwater sensors.
- **Expanded Semantic Models**: Future production releases will incorporate local dense embeddings (e.g., SentenceTransformers / MiniLM) to complement the current explainable NLP taxonomy.
- **Municipal ERP Integration**: Planned REST connectors for municipal GIS portals.
