from typing import List, Optional, Literal, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.models.operations import (
    PortStatusSummary, Vessel, Berth, Crane, YardBlock,
    CongestionForecastData, OptimizationResult, OptimizationRequest,
    RouteOption, ShiftPlanItem, SimulationResult, SimulationScenario,
    OperationalAlert
)
from app.services.data_store import data_store
from app.services.congestion_predictor import congestion_predictor_service
from app.services.operations_optimizer import operations_optimizer_service
from app.services.route_intelligence import route_intelligence_service
from app.services.shift_planner import shift_planner_service
from app.services.simulation_engine import simulation_engine_service

router = APIRouter(prefix="/api", tags=["Port Operations"])

# --- Port Status ---
@router.get("/status", response_model=PortStatusSummary)
def get_port_status():
    """Returns top-level port operational KPIs, queue counts, and high-risk bottleneck status."""
    return data_store.get_port_status()

# --- Vessels ---
@router.get("/vessels", response_model=List[Vessel])
def list_vessels():
    """Lists all vessels with ETA, ETD, priority tier, assigned berth, and predicted wait."""
    return data_store.vessels

@router.get("/vessels/{vessel_id}", response_model=Vessel)
def get_vessel(vessel_id: str):
    """Retrieves detailed profile and operational timeline for a specific vessel."""
    vessel = next((v for v in data_store.vessels if v.id == vessel_id or v.imo == vessel_id), None)
    if not vessel:
        raise HTTPException(status_code=404, detail=f"Vessel {vessel_id} not found")
    return vessel

# --- Berths ---
@router.get("/berths", response_model=List[Berth])
def list_berths():
    """Lists quayside berths B01 through B06 with draft, length, crane capacity, and utilization."""
    return data_store.berths

@router.get("/berths/{berth_id}", response_model=Berth)
def get_berth(berth_id: str):
    """Retrieves telemetry and hourly forecast for a single berth."""
    berth = next((b for b in data_store.berths if b.id == berth_id), None)
    if not berth:
        raise HTTPException(status_code=404, detail=f"Berth {berth_id} not found")
    return berth

# --- Cranes ---
@router.get("/cranes", response_model=List[Crane])
def list_cranes():
    """Lists all STS and yard cranes with status, moves per hour, and maintenance schedule."""
    return data_store.cranes

@router.get("/cranes/{crane_id}", response_model=Crane)
def get_crane(crane_id: str):
    crane = next((c for c in data_store.cranes if c.id == crane_id), None)
    if not crane:
        raise HTTPException(status_code=404, detail=f"Crane {crane_id} not found")
    return crane

# --- Yard Capacity ---
@router.get("/yard", response_model=List[YardBlock])
def list_yard_blocks():
    """Lists container yard blocks CY-01 to CY-04 with stacking density and dwell times."""
    return data_store.yard_blocks

# --- Congestion Forecasting ---
@router.get("/forecast/congestion", response_model=CongestionForecastData)
def get_congestion_forecast(horizon: Literal['6h', '12h', '24h', '48h', '72h'] = Query('24h')):
    """
    Predicts quayside congestion hotspots and bottleneck probabilities across
    6h, 12h, 24h, 48h, and 72h horizons with root-cause driver attribution.
    """
    return congestion_predictor_service.get_forecast(horizon=horizon)

# --- Berth & Crane Operations Optimizer ---
@router.get("/optimize", response_model=OptimizationResult)
def get_current_optimization():
    """Returns the latest Berth Allocation & Crane Assignment (BAP/CAP) optimization plan."""
    return data_store.optimization

@router.post("/optimize/solve", response_model=OptimizationResult)
def solve_optimization(request: Optional[OptimizationRequest] = None):
    """
    Solves the Berth Allocation and Crane Assignment Problem (BAP/CAP) algorithm
    to minimize vessel waiting hours and demurrage penalties.
    """
    return operations_optimizer_service.solve_bap_cap(request)

@router.post("/optimize/apply")
def apply_optimization():
    """Applies the optimization recommendation to the live system state."""
    return operations_optimizer_service.apply_optimization()

# --- Route Intelligence ---
@router.get("/routes/alternate", response_model=List[RouteOption])
def list_alternate_routes():
    """
    Evaluates alternate port diversion strategies (Rotterdam vs Antwerp Gateway vs Zeebrugge)
    with delay hours, fuel expense, and downstream congestion trade-offs.
    """
    return route_intelligence_service.get_alternate_routes()

# --- 72-Hour Shift Planner ---
@router.get("/planner/shifts", response_model=List[ShiftPlanItem])
def get_shift_plan():
    """Generates the 72-hour operational shift plan (06-14, 14-22, 22-06) across berths and cranes."""
    return shift_planner_service.get_72h_plan()

@router.post("/planner/resolve-conflicts")
def resolve_shift_conflicts():
    """Automatically resolves stevedore and crane maintenance conflicts in the shift plan."""
    return shift_planner_service.resolve_conflicts()

# --- What-If Disruption Simulator ---
@router.get("/simulation", response_model=SimulationResult)
def get_simulation():
    """Returns current active simulation state and AI recovery steps."""
    return data_store.simulation

@router.post("/simulate", response_model=SimulationResult)
def run_simulation(scenario: SimulationScenario):
    """Simulates operational disruptions (crane failure, berth closure, vessel surge)."""
    return simulation_engine_service.run_scenario(scenario)

@router.post("/simulate/apply-recovery")
def apply_simulation_recovery():
    """Applies the multi-step AI recovery plan from the What-If simulation."""
    return simulation_engine_service.apply_recovery_plan()

# --- Operational Alerts ---
@router.get("/alerts", response_model=List[OperationalAlert])
def list_alerts():
    """Lists operational alerts with severity levels and supervisor action links."""
    return data_store.alerts

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    """Marks an operational alert as resolved."""
    alert = next((a for a in data_store.alerts if a.id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    alert.isResolved = True
    return {"success": True, "alert": alert}

# --- System Reset ---
@router.post("/reset")
def reset_system_state():
    """Resets all simulation and optimization states back to initial baseline data."""
    data_store.reset()
    return {"success": True, "message": "PortsPilot operational data reset to baseline."}
