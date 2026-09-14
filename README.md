# PortPulse AI (Port Operations Command Center)

> **“Predict the bottleneck before the world feels it.”**

PortPulse AI is a competition-grade, enterprise maritime decision-support platform designed for port operations supervisors, harbor masters, and terminal planners. It unifies real-time AIS vessel telemetry, mixed-integer quay optimization, what-if disruption simulations, multi-shift planning, and natural-language intelligence via a state-connected Gemini Copilot.

---

## Core Product Flow

$$\text{DATA} \longrightarrow \text{PREDICT} \longrightarrow \text{EXPLAIN} \longrightarrow \text{OPTIMIZE} \longrightarrow \text{SIMULATE} \longrightarrow \text{PLAN} \longrightarrow \text{ACT}$$

- **The human supervisor always remains in control.**
- **ML predicts** quayside bottlenecks 6 to 72 hours ahead.
- **Optimization algorithms** calculate optimal berth, crane, and routing reallocations.
- **Gemini Copilot** explains root-cause drivers and drafts operational directives.
- **The supervisor approves and acts.**

---

## Tech Stack & Architecture

- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS with custom Maritime Operations design system
- **Charts & Visualizations**: Recharts multi-line forecast curves, area comparisons, and custom SVG nautical vector routing
- **Icons**: Lucide React (semantically mapped across ships, cranes, berths, and alerts)
- **State Management**: Centralized `OperationsContext` with synchronized global state across all 15 operational modules
- **Routing**: React Router DOM v6 with deep links and URL parameter support

---

## Visual Design & Maritime Palette

| Token | Hex | Semantic Role |
|---|---|---|
| Deep Ocean | `#071A24` | Primary Canvas Background |
| Ocean Slate | `#0B2532` | Secondary Panels & Sidebars |
| Surface | `#102F3D` | Operational Cards & Data Containers |
| Elevated Surface | `#143A49` | Popovers, Active Drawers & Modals |
| Maritime Border | `#1D4655` | Subtle Structural Grid Lines |
| Marine Cyan | `#19C3C8` | Active States, Selection Glows, Key CTAs |
| Navigation Blue | `#4DA3FF` | Secondary Visual Cues & Route Vectors |
| Operational Green | `#35C98B` | Healthy, Optimized & Recovered States |
| Risk Amber | `#F4B942` | Predicted Risks & Threshold Warnings |
| Alert Red | `#F05D5E` | Critical Equipment Faults & Bottlenecks |
| Text Primary | `#F4F8FA` | High-Contrast Operational Data |
| Text Secondary | `#9FB5BF` | Metadata, Specs, and Subheadings |
| Text Muted | `#607C87` | Inactive Labels & Minor Ticks |

---

## Complete Screen Index

1. **Command Center** (`/dashboard`): Real-time KPIs, 72h forecast curve, B04 bottleneck spotlight (82% → 94%), root-cause driver weights, and one-click mitigation triggers.
2. **Vessel Operations** (`/operations/vessels`): Searchable and filterable vessel traffic table with ETA/ETD, assigned berths, priority tiers, and predicted waits.
3. **Vessel Detail** (`/operations/vessels/:id`): Deep vessel profile (LOA, draught, TEU capacity, cargo volumes, turnaround milestones, demurrage exposure).
4. **Berths Operations** (`/operations/berths`): Detailed card grid for quays B01 to B06, depth specifications, utilization bars, and slide-in telemetry drawer.
5. **Cranes Operations** (`/operations/cranes`): STS & yard crane status matrix, moves/hour telemetry, and live Crane C03 failure simulation prompt.
6. **Yard Capacity** (`/operations/yard`): Container blocks CY-01 to CY-04 stacking density, dwell times, and cold-chain reefer redistribution.
7. **Live Operations Board** (`/operations` or `/operations/board`): Real-time quayside Gantt board spanning berths, assigned cranes, and time shifts.
8. **Congestion Forecast** (`/intelligence/forecast`): Interactive Recharts multi-berth predictive curves across 6h, 12h, 24h, 48h, and 72h horizons.
9. **Operations Optimizer** (`/decision/optimizer`): Before/after algorithmic comparison (Ocean Star B04 → B02, -4.6h wait savings, -$148k demurrage avoidance).
10. **What-If Simulator** (`/decision/simulator`): Disruption engine testing Crane C03 8-hour failure, showing queue surge (7 → 11 vessels) and autonomous 3-step AI recovery.
11. **72-Hour Shift Planner** (`/decision/planner`): Stevedore shift scheduling (06-14, 14-22, 22-06), conflict resolution, and CSV export.
12. **Route Intelligence** (`/intelligence/routes`): Alternate port diversion trade-offs (Rotterdam vs Antwerp Gateway vs Zeebrugge) with nautical vector map.
13. **Gemini AI Copilot** (`/copilot` + global slide-over drawer): Connected natural-language assistant querying telemetry functions and executing operational recommendations.
14. **Analytics** (`/analytics`): Multi-period turnaround KPI trends, ML forecast accuracy, and audited PortPulse AI operational savings.
15. **Alert Center** (`/alerts`): Filterable operational alerts feed with direct navigation and supervisor resolution workflows.
16. **Settings** (`/settings`): Port specifications, ML congestion threshold parameters, and autonomy settings.
17. **Sign In** (`/login`): Clean maritime authentication with instant 1-click supervisor demo environment entry.

---

## 5-Step Demo Script for Judges & Stakeholders

1. **Command Center**: View port status. Observe Berth B04 at 82% current utilization climbing to 94% in 24 hours. Click **"Why is B04 at risk?"** to review the 5 ML root-cause drivers.
2. **Operations Optimizer**: Click **"Optimize Operations"**. Review the Before (B04, 3 cranes, 11.4h wait) vs After (B02, 4 cranes, 6.8h wait). Click **"Apply Recommendation"** to approve. Observe instant cross-module state update and confirmation toast.
3. **Operations Board**: Navigate to the Operations Board and observe that Ocean Star has automatically moved to Berth B02 with full crane allocation and zero schedule clashes.
4. **What-If Simulator**: Navigate to the Simulator. Configure Crane C03 failure (8 hours). Click **"Simulate Scenario"** to witness queue increase from 7 to 11 vessels and wait spike to 17.8 hours. Review the 3-step AI Recovery Plan and click **"Apply Recovery Plan"**.
5. **Gemini Copilot**: Open Copilot and click **"What changed after the recovery plan?"**. Gemini explains the full multi-module mitigation (C05 redeployment, Ocean Star berthing, and shift conflict resolution) in natural language.

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```
