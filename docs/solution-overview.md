# Solution Overview: PortPulse AI

## What We Built

**PortPulse AI** is an intelligent, competition-grade maritime operations command center designed for port terminal planners, harbor masters, and shift supervisors. It transforms reactive port management into proactive, algorithmic decision-making. 

PortPulse AI continuously ingests vessel AIS schedules, berth hydrographic specifications, crane operational telemetry, and yard occupancy metrics. It predicts quayside bottlenecks 6 to 72 hours in advance, solves the NP-hard Berth Allocation Problem and Crane Assignment Problem (BAP/CAP) in real time, evaluates alternate port diversions, automates 72-hour stevedore shift planning, and equips supervisors with an interactive IBM Bob AI Copilot.

---

## How It Works

The platform operates on a synchronized closed-loop decision flow:

$$\text{INGEST} \longrightarrow \text{PREDICT (6h–72h)} \longrightarrow \text{EXPLAIN} \longrightarrow \text{OPTIMIZE (BAP/CAP)} \longrightarrow \text{SIMULATE} \longrightarrow \text{PLAN} \longrightarrow \text{ACT}$$

1. **Telemetry & Schedule Ingestion**: Real-time AIS vessel tracking (LOA, draught, TEU capacity, ETA/ETD) is unified with quayside berth depths (B01–B06), Ship-to-Shore (STS) crane statuses (C01–C08), and container yard densities (CY-01–CY-04).
2. **Predictive Queuing Analysis**: The queuing engine computes future berth utilization across multiple horizons (6h, 12h, 24h, 48h, 72h) and flags upcoming bottleneck hotspots (e.g., Berth B04 utilization climbing from 82% to 94%).
3. **Root-Cause Attribution**: The system mathematically decomposes congestion risk into three interpretable drivers: **Arrival Bunching**, **Crane Deficits**, and **Yard Backpressure**.
4. **BAP/CAP Algorithmic Optimization**: Solves constrained optimization matrices to reassign arriving vessels to optimal berths and cranes, immediately quantifying wait time reductions and demurrage cost avoidance.
5. **What-If Disruption Simulation**: Enables operators to model simulated disruptions (such as an 8-hour breakdown of Crane C03), observe simulated queue surges, and evaluate 3-step AI recovery actions before deploying them to production.
6. **Alternate Port Diversion Ranking**: Ranks candidate alternate diversion ports (e.g., Rotterdam vs. Antwerp Gateway vs. Zeebrugge) based on nautical distance, bunker fuel consumption, demurrage penalties, and destination congestion.
7. **72-Hour Shift Generation**: Generates stevedore and crane operator shift assignments across three daily shifts (06:00-14:00, 14:00-22:00, 22:00-06:00) with automatic conflict resolution.
8. **IBM Bob Maritime Copilot**: Natural-language operational assistant querying live telemetry, explaining root causes, and triggering approved one-click operational mitigations.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Port Operations Supervisor                        │
│                 (Browser SPA: React 18 + TypeScript + Vite 6)               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS REST / WebSockets
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Backend Operations & AI Gateway                        │
│  ┌─────────────────────────────┐           ┌─────────────────────────────┐  │
│  │   TypeScript / Hono API     │           │   Python FastAPI Engine     │  │
│  │   • Auth & Role Guard       │           │   • Queuing Congestion Model│  │
│  │   • Live Operations State   │           │   • BAP/CAP Optimizer       │  │
│  │   • Shipping Documents      │           │   • Diversion Route Ranker  │  │
│  │   • WebSocket Event Hub     │           │   • Shift Conflict Resolver │  │
│  └──────────────┬──────────────┘           └──────────────┬──────────────┘  │
└─────────────────┼─────────────────────────────────────────┼─────────────────┘
                  ▼                                         ▼
┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│   PostgreSQL Relational Storage  │      │       IBM Bob & watsonx.ai       │
│  • Berth & Vessel Metadata       │      │  • Natural Language Telemetry    │
│  • Crane Telemetry & Yard Blocks │      │  • Root Cause Explanation        │
│  • Shift Plans & Audit Trails    │      │  • Recovery Directives Synthesis │
└──────────────────────────────────┘      └──────────────────────────────────┘
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Human-in-the-Loop Autonomy** | Port decisions carry safety and maritime liability. PortPulse AI recommends optimal allocations and explains trade-offs, but the human shift supervisor always maintains final approval. |
| **Dual-Engine Backend** | Combines the high-concurrency event-handling and real-time WebSockets of Node.js/Hono with the mathematical modeling and optimization packages (NumPy, Pytest) of Python. |
| **Interpretable Root-Cause Scoring** | Avoids opaque "black-box" predictions; decomposes congestion into quantifiable drivers (arrival bunching, crane deficit, yard backpressure) so supervisors understand *why* risk is increasing. |
| **Comprehensive Domain Modeling** | Enforces real-world maritime constraints: vessel draft vs. berth water depth, vessel LOA vs. berth length, crane reach and minimum/maximum crane density limits. |
| **High-Contrast Maritime Design System** | Engineered for 24/7 port control room lighting conditions with custom dark ocean palettes, Lucide maritime semantics, and instant status cues. |

---

## IBM Technologies Used

- **IBM Bob**:
  - Integrated as the supervisory intelligence layer to orchestrate live port telemetry queries, translate complex optimization matrices into clear natural-language briefs, and guide operators through simulated recovery procedures.
- **watsonx.ai**:
  - Utilized for generative summarization of operational advisories, automated incident report drafting, and contextual reasoning over vessel bills of lading and berth request documentation.
- **IBM Cloud Code Engine**:
  - Serverless container runtime architecture targeted for deploying the containerized FastAPI optimization engine and Hono API gateway with automatic scaling based on inbound AIS telemetry volume.
