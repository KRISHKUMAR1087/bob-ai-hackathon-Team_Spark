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

PortsPilot AI transforms reactive port management into proactive, algorithmic decision-making. By continuously ingesting vessel AIS telemetry, berth depths, and crane operational status, the platform forecasts quayside bottlenecks 6 to 72 hours in advance, solves the Berth Allocation Problem and Crane Assignment Problem (BAP/CAP), ranks alternate port diversions by fuel and demurrage trade-offs, and automates 72-hour stevedore shift planning through an interactive VARUNA AI.

---

### 📁 Repository Structure

```text
bob-ai-hackathon-Team_Spark/
├── demo/                        # Video link, live URL & UI screenshots
├── docs/                        # Architecture, setup & problem statement docs
├── presentation/                # Pitch deck & presentation files
├── src/
│   ├── frontend/                # React 18 + Vite 6 + Tailwind CSS App
│   │   ├── public/              # Media & audio assets
│   │   ├── src/
│   │   │   ├── components/      # UI components, 3D viewers & layouts
│   │   │   ├── context/         # Auth, Operations, Timezone & Theme context
│   │   │   ├── pages/           # Port Admin, Ship Agent & Super Admin pages
│   │   │   ├── services/        # Supabase & Gemini AI services
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── backend/                 # TypeScript API + Python AI Engine
│       ├── app/                 # FastAPI congestion predictor & optimizer
│       ├── prisma/              # Prisma DB schemas & seeders
│       ├── src/                 # Node.js / Express API gateway & routes
│       ├── tests/               # Pytest suite
│       ├── Dockerfile
│       └── package.json
│
├── submission.yaml              # Hackathon submission metadata
└── README.md                    # Main documentation


```
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
| 📹 **Demo Video** | https://drive.google.com/file/d/1YPuxK3lNwau_r-ySanBZ-Uw47uPNth__/view?usp=drivesdk |
| 🌐 **Live Demo** | https://portspilot.pages.dev/ |
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
