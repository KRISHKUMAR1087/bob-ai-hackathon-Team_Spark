import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.data_store import data_store

@pytest.fixture(autouse=True)
def reset_store():
    data_store.reset()

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "/api/status" in data["endpoints"].values()

def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_port_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["highRiskBerth"] == "B04"
    assert data["highRiskBerthUtilization"] == 82
    assert data["highRiskBerthPredicted"] == 94
    assert data["currentQueue"] > 0

def test_get_vessels():
    response = client.get("/api/vessels")
    assert response.status_code == 200
    vessels = response.json()
    assert len(vessels) >= 8
    ocean_star = next(v for v in vessels if v["id"] == "VES-01")
    assert ocean_star["name"] == "Ocean Star"
    assert ocean_star["demurrageRisk"] == "High"

def test_get_congestion_forecast():
    response = client.get("/api/forecast/congestion?horizon=24h")
    assert response.status_code == 200
    forecast = response.json()
    assert forecast["riskBottleneckBerth"] == "B04"
    assert len(forecast["drivers"]) >= 4
    assert len(forecast["points"]) > 0

def test_optimization_solve_and_apply():
    # 1. Get current plan
    response = client.get("/api/optimize")
    assert response.status_code == 200
    opt = response.json()
    assert opt["targetVesselId"] == "VES-01"
    assert opt["optimizedPlan"]["berthId"] == "B02"
    assert opt["waitTimeDeltaHours"] == -4.6
    assert opt["savingsEstimateUsd"] == 148000

    # 2. Apply optimization
    apply_resp = client.post("/api/optimize/apply")
    assert apply_resp.status_code == 200
    assert apply_resp.json()["success"] is True

    # 3. Verify vessel was updated
    vessel_resp = client.get("/api/vessels/VES-01")
    assert vessel_resp.status_code == 200
    assert vessel_resp.json()["assignedBerth"] == "B02"
    assert vessel_resp.json()["demurrageRisk"] == "Low"

def test_shift_planner_resolve_conflicts():
    shifts_resp = client.get("/api/planner/shifts")
    assert shifts_resp.status_code == 200
    shifts = shifts_resp.json()
    conflict_count_before = sum(1 for s in shifts if s["status"] == "Conflict")
    assert conflict_count_before > 0

    # Resolve conflicts
    resolve_resp = client.post("/api/planner/resolve-conflicts")
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["resolvedConflictsCount"] >= 1
