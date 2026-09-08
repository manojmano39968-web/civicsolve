# CivicSolve: 5–7 Minute Judge Demonstration Guide
**Smart India Hackathon Working MVP Walkthrough**

---

## High-Level Pitch (30 Seconds)
> "Real-world societal problems exist everywhere, but the citizens experiencing them and the students, researchers, and contractors who have the technical skills to solve them are disconnected. **CivicSolve** is an interdisciplinary platform that takes an issue from citizen submission, applies transparent AI categorization, performs explainable skill matching, forms collaborative student-expert-industry teams, tracks solution engineering, and measures verifiable community impact."

---

## 5–7 Minute Step-by-Step Demo Script

### STEP 1: Landing Page & Problem Lifecycle (0:00 – 0:45)
- **URL**: `http://localhost:5173/`
- **Action**: Show the landing page hero and the 6-stage lifecycle visual:
  `Problem → AI Analysis → Smart Matching → Collaboration → Implementation → Impact`
- **Key Talking Point**:
  > *"Imagine a community in Velachery, Chennai facing repeated monsoon waterlogging. Rather than letting the complaint get lost in a generic portal, CivicSolve initiates an interdisciplinary resolution lifecycle."*
- **Visual Callout**: Show the Hero Challenge card on the landing page.

---

### STEP 2: Citizen Demo Login & Intake (0:45 – 1:30)
- **Action**: Click **"Submit a Problem"** or use the top Demo Switcher to select **Citizen (Kavitha Rajan)**.
- **Navigate to**: `http://localhost:5173/submit`
- **Action**: Click the **"Prefill Chennai Flooding Example"** button (or type):
  - **Title**: `Recurring Urban Flooding Near Residential Area`
  - **Description**: `During heavy rainfall, the road and surrounding residential streets experience severe waterlogging. Water remains for several hours after rainfall, affecting pedestrians, vehicles and nearby homes.`
  - **Location**: `Chennai`
- **Key Talking Point**:
  > *"A citizen reports localized flooding in plain English. Now watch what happens when we submit."*

---

### STEP 3: Live AI Problem Categorization (1:30 – 2:15)
- **Action**: Click **"Analyze & Submit"**.
- **Observation**:
  - A real loading indicator appears: *"AI-assisted analysis: Extracting required engineering skills..."*
  - The Python FastAPI service processes the text using concept taxonomy and rule-based NLP.
- **Results Displayed**:
  - **Category**: `Urban Infrastructure / Flood Management`
  - **Detected Domain**: `Civil Infrastructure & Hydrology`
  - **Severity**: `High`
  - **Required Technical Skills**:
    `Hydrology` • `Drainage Design` • `GIS` • `Urban Planning`
  - **AI Reasoning**: Explains *why* terms like 'waterlogging', 'rainfall', and 'drainage' led to these required disciplines.
- **Key Talking Point**:
  > *"Notice that CivicSolve doesn't pretend to be an inscrutable black box. It provides transparent, explainable AI-assisted analysis that pinpoints the exact technical skills required for field resolution."*

---

### STEP 4: Smart Matching & Explainable Scoring (2:15 – 3:15)
- **Action**: Click **"Find Relevant People"** (navigates to `/challenges/:id/matches`).
- **Results Displayed**:
  1. **Arjun Kumar (Student)** — **92% Match**
     - *Why matched*: GIS, Drainage Design, Civil Engineering coursework in Chennai.
  2. **Dr. Meena Raman (Faculty Expert)** — **88% Match**
     - *Why matched*: Senior authority in Urban Hydrology & flood modeling at Anna University.
  3. **Ravi Infrastructure Solutions (Industry Partner)** — **81% Match**
     - *Why matched*: Drainage infrastructure machinery and municipal execution track record.
- **Visual Callout**: Expand the **"Why this match?"** factor breakdown on each card:
  - Skill Match: 80–90%
  - Domain Match: 92–96%
  - Location Relevance: 95%
  - Experience / Role: 88–95%
- **Key Talking Point**:
  > *"Here is the core innovation: smart, multi-factor matching. We calculate 40% skill coverage, 25% domain alignment, 15% geographic proximity, and 20% experience readiness. Every percentage point is justified and explainable to judges."*

---

### STEP 5: Collaborative Team Assembly (3:15 – 3:45)
- **Action**: Check the boxes for Arjun, Dr. Meena, and Ravi Infrastructure.
- **Action**: Team Name: `CivicSolve Flood Response Team`.
- **Action**: Click **"Create Team Workspace"**.
- **Key Talking Point**:
  > *"We unite the three pillars of civic problem solving: student innovation, academic domain rigor, and industry execution capacity."*

---

### STEP 6: Team Workspace & Live Tasks (3:45 – 4:30)
- **Navigate to**: Team Workspace (`/teams/1`).
- **Interact**:
  - Toggle a task checkbox (e.g. *"Identify critical blockage points and silt accumulation depths"*). The progress bar updates live.
  - Post a discussion message in the team chat:
    > *"Drone elevation mapping of the 400m bypass route is complete."*
  - Message immediately renders with author badge and timestamp.
- **Key Talking Point**:
  > *"This is a living, persistent workspace. Student researchers, faculty advisors, and contractors coordinate tasks and technical files in real-time."*

---

### STEP 7: Lifecycle Progress & Proposed Solution (4:30 – 5:15)
- **Action**: Click **"Lifecycle Progress"** (`/progress/1`) or **"Proposed Solution"** (`/solutions/1`).
- **Inspect**:
  - Lifecycle stepper: Problem Submitted → AI Categorized → Team Matched → Team Formed → Field Analysis → Solution Developed.
  - Engineering Intervention Dossier:
    - Desiltation of 3 choke points
    - High-intake perforated road grates
    - 400m auxiliary gravity bypass conduit
  - Status: Clearly labeled **"Ready for Pilot Review"**.
- **Key Talking Point**:
  > *"We don't make false claims that the whole city is fixed overnight. The team drafts an actionable engineering dossier ready for municipal corporation review."*

---

### STEP 8: Impact Dashboard (5:15 – 6:00)
- **Navigate to**: `/impact/1`.
- **Inspect**:
  - Banner: **DEMO / PILOT DATA — Simulated evaluation metrics**.
  - **Waterlogging Duration**: Baseline `5.0 hours` → Target `2.0 hours` → Current Measured `3.0 hours`
  - **Flooded Surface Area**: `2.4 km²` → `1.2 km²` (Target) → `1.5 km²` (Current)
  - **Monthly Inundations**: `12/mo` → `4/mo` (Target) → `7/mo` (Current)
- **Key Talking Point**:
  > *"CivicSolve closes the loop with verifiable outcome tracking. Notice that metrics are transparently labeled as pilot benchmark data, proving the platform's measurement architecture."*

---

### STEP 9: Reverse Matching & Student Perspective (6:00 – 6:30)
- **Action**: Use the Demo Persona Switcher to switch to **Student (Arjun Kumar)**.
- **Navigate to**: `/dashboard/student`.
- **Observe**:
  - Arjun sees **"Recommended Problems for You"**:
    - Chennai Urban Flooding (92%)
    - Madurai Road Safety (84%)
    - Erode Lake Restoration (78%)
- **Key Talking Point**:
  > *"CivicSolve works bi-directionally: not only does a Problem find Relevant People, but Students and Experts receive intelligent recommendations based on their verified competencies."*

---

### STEP 10: Conclusion & Reset (6:30 – 7:00)
- **Action**: Click **"Reset Demo Data"** in the top bar to demonstrate repeatability.
- **Closing Statement**:
  > *"Notice that the problem was not simply reported. It was categorized, matched to relevant people, collaboratively developed into a solution, and tracked towards measurable impact. That is CivicSolve: Connect People, Solve Problems, Create Impact."*
