# PortsPilot AI - Backend Operations Engine

Competition-grade backend for the **Logistics & Ports L1 Container Congestion Predictor & Port Operations Optimiser**.

## Key Capabilities

1. **Congestion Hotspot Predictor**: Forecasts quayside bottlenecks across 6h, 12h, 24h, 48h, and 72h horizons, computing root-cause weights (arrival bunching, crane deficits, and yard backpressure).
2. **Operations Optimizer (BAP/CAP)**: Solves the Berth Allocation Problem and Crane Assignment Problem subject to vessel draft, LOA, and crane density limits, slashing wait times and demurrage costs.
3. **Alternate Route Intelligence**: Ranks container vessel diversion candidates (e.g. Rotterdam vs Antwerp Gateway vs Zeebrugge) based on nautical miles, fuel costs, and downstream congestion.
4. **72-Hour Shift Planner**: Automates stevedore and crane assignment across 3 daily shifts (06-14, 14-22, 22-06) with conflict detection and automated resolution.
5. **What-If Disruption Simulator**: Models equipment breakdowns (e.g., Crane C03 failure) and synthesizes multi-step AI recovery actions.

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd backend
python -m pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. Run Tests
```bash
pytest
```

## Docker Containerization

```bash
docker build -t portspilot-backend .
docker run -p 8000:8000 portspilot-backend
```
