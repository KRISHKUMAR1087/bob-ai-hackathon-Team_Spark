# 🚀 PortsPilot AI — Port Operations Command Center

> **Predict the bottleneck before the world feels it.**

An enterprise-grade maritime decision-support platform for port operations supervisors, harbor masters, and terminal planners — uniting 72-hour queuing congestion prediction, BAP/CAP berth and crane optimization, alternate port routing intelligence, shift planning, and conversational IBM Bob intelligence.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | Team Spark |
| **Track** | AI - L1 : CONTAINER CONGESTION PREDICTOR AND PORT OPERATIONS OPTIMISER |
| **Team Lead** | Nandan Vakani — nandanvakani@gmail.com (24dit074@charusat.edu.in) |
| **Members** | Pari Chudasama — chudasamapari1109@gmail.com (d25dit079@charusat.edu.in)<br>Krish Darji — hello.krishkumardarji@gmail.com (24dce027@charusat.edu.in)<br>Yashvi Thakkar — yashvicharuat34@gmail.com (24dcs136@charusat.edu.in) |

---

## 🎯 Problem Statement

The 2021 Los Angeles & Long Beach port crisis left over 100 container vessels idling offshore for weeks, inflicting an estimated $10B+ in economic losses on global supply chains. Today, terminal operators still schedule berths, cranes, and container yard capacity manually across complex spreadsheets. Congestion hotspots are identified reactively — only after vessels are already trapped in anchorage queues — making proactive vessel diversion and optimal crane allocation impossible.

---

## 💡 Solution

PortPulse AI transforms reactive port management into proactive, algorithmic decision-making. By continuously ingesting vessel AIS telemetry, berth depths, and crane operational status, the platform forecasts quayside bottlenecks 6 to 72 hours in advance, solves the Berth Allocation Problem and Crane Assignment Problem (BAP/CAP), ranks alternate port diversions by fuel and demurrage trade-offs, and automates 72-hour stevedore shift planning through an interactive IBM Bob Copilot.

---

## ✨ Key Features

- **Predictive 72-Hour Congestion Hotspot Engine**: Forecasts berth queuing density across 6h, 12h, 24h, 48h, and 72h horizons with automated root-cause attribution (arrival bunching, crane deficit, yard backpressure).
- **BAP/CAP Operations Optimizer**: Solves constrained berth and crane allocation matrices, slashing vessel wait hours and quantifying exact demurrage cost savings.
- **Alternate Route & Port Diversion Intelligence**: Dynamically evaluates diversion candidates (e.g., Rotterdam vs. Antwerp Gateway vs. Zeebrugge) based on nautical miles, bunker fuel consumption, and downstream congestion.
- **72-Hour Stevedore & Crane Shift Planner**: Automatically schedules workforces across three daily shifts (06:00-14:00, 14:00-22:00, 22:00-06:00) with clash detection and one-click resolution.
- **Interactive Maritime Copilot (IBM Bob / Gemini)**: Natural-language assistant capable of querying live port telemetry, explaining root causes, and executing supervisor-approved recovery directives.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | TypeScript, Python, SQL |
| **Frameworks** | React 18, Vite 6, FastAPI, Hono, Tailwind CSS, Prisma ORM |
| **IBM Technologies** | IBM Bob, watsonx.ai, IBM Cloud Code Engine |
| **Databases** | PostgreSQL, Supabase |
| **Other** | Docker, Recharts, Lucide React, Three.js, Pytest |

---

## 📁 Repository Structure

```
├── submission.yaml          # Structured submission metadata (evaluated first)
├── README.md                # Project overview and entry point
├── src/                     # All source code (monorepo structure)
│   ├── frontend/            # React 18 + Vite command center SPA
│   ├── backend/             # Node/Hono API gateway + Python FastAPI engine
│   ├── .env.example         # Template for environment variables
│   └── README.md            # Source code layout explanation
├── docs/                    # Complete project documentation
│   ├── problem-statement.md # In-depth problem analysis and market impact
│   ├── solution-overview.md # Conceptual solution and workflow details
│   ├── architecture.md      # Mermaid system diagram and data flow
│   └── setup-guide.md       # Exact verified steps to run the project
├── demo/                    # Demo artifacts
│   ├── demo-video-link.txt  # Link to walkthrough demo video
│   ├── live-demo-url.txt    # Deployment status
│   └── screenshots/         # High-resolution screenshots of the running app
├── presentation/            # Slide deck directory
└── .github/workflows/
    └── validate.yml         # Automated submission validator
```

---

## ⚡ How to Run

Follow these exact steps from [`docs/setup-guide.md`](docs/setup-guide.md):

### 1. Clone the Repo
```bash
git clone https://github.com/KRISHKUMAR1087/bob-ai-hackathon-Team_Spark.git
cd bob-ai-hackathon-Team_Spark
```

### 2. Install Dependencies
```bash
# Install backend Node & Python dependencies
cd src/backend
npm install
python -m pip install -r requirements.txt
cd ../..

# Install frontend dependencies
cd src/frontend
npm install
cd ../..
```

### 3. Configure Environment
```bash
cp src/.env.example src/backend/.env
cp src/.env.example src/frontend/.env
```

### 4. Run the Project
```bash
# Terminal 1 — Start Backend Gateway (Port 3001)
cd src/backend
npm run dev

# Terminal 2 — Start Frontend Command Center (Port 5173)
cd src/frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

### 5. Run Verification Tests
```bash
cd src/backend
python -m pytest
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 **Demo Video** | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 **Live Demo** | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ **Screenshots** | [See demo/screenshots/](demo/screenshots/) |
| 📊 **Presentation** | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- **AIS Telemetry**: Vessel traffic simulation utilizes realistic high-frequency telemetry replay; direct connection to proprietary live satellite AIS aggregators requires licensed API keys.
- **Dynamic Bathymetry**: Water depths are currently modeled as discrete berth parameters rather than real-time continuous astronomical tide gauges.
- **Tugboat & Pilot Dispatch**: Berth allocations focus on quayside and crane availability; marine pilot and tugboat assignment is recommended as a next-phase integration.

---

## 🏅 What We're Most Proud Of

The tight, closed-loop coordination between predictive analytics and actionable supervisor control:
1. Predicting Berth B04 congestion 24 hours before peak arrival bunching occurs.
2. Recommending an optimal reallocation (shifting *Ocean Star* from B04 to B02 with 4 STS cranes) that quantifiably saves **4.6 hours of vessel wait time** and **$148,000 in demurrage penalties**.
3. Permitting the supervisor to simulate crane breakdown disruptions in a sandbox, review an AI-synthesized 3-step recovery plan, and approve it across all operational modules with one click.
