import pytest
from app.services.data_store import data_store
from app.services.operations_optimizer import operations_optimizer_service
from app.services.simulation_engine import simulation_engine_service
from app.models.operations import SimulationScenario

@pytest.fixture(autouse=True)
def reset_store():
    data_store.reset()

def test_berth_draft_constraint_enforcement():
    """Verify that deep draft vessels are never assigned to shallow berths."""
    ocean_star = next(v for v in data_store.vessels if v.id == "VES-01")
    assert ocean_star.draughtMeters == 16.2

    # B05 has max draft 14.5m, B03 has 15.0m
    # B02 has max draft 17.0m, B04 has 17.5m
    b05 = next(b for b in data_store.berths if b.id == "B05")
    assert b05.maxDraftMeters < ocean_star.draughtMeters

    opt = operations_optimizer_service.solve_bap_cap()
    assigned_berth = next(b for b in data_store.berths if b.id == opt.optimizedPlan.berthId)
    assert assigned_berth.maxDraftMeters >= ocean_star.draughtMeters
    assert assigned_berth.lengthMeters >= ocean_star.lengthMeters

def test_demurrage_savings_calculation():
    """Verify that wait time reduction accurately produces demurrage savings."""
    opt = operations_optimizer_service.solve_bap_cap()
    assert opt.waitTimeDeltaHours < 0
    assert opt.savingsEstimateUsd > 100000

def test_simulation_crane_failure_and_recovery():
    """Verify that What-If simulation captures queue increase and recovery repairs the bottleneck."""
    scenario = SimulationScenario(
        id="TEST-SCEN",
        type="crane_failure",
        targetEntityId="C03",
        targetEntityName="Megamax STS 03",
        durationHours=8,
        description="Test Crane C03 failure"
    )
    result = simulation_engine_service.run_scenario(scenario)
    assert result.after.queueCount > result.before.queueCount
    assert result.after.avgWaitHours > result.before.avgWaitHours

    # Apply recovery
    recovery_resp = simulation_engine_service.apply_recovery_plan()
    assert recovery_resp["success"] is True
    c05 = next(c for c in data_store.cranes if c.id == "C05")
    assert c05.berthId == "B04"
    assert c05.status == "ACTIVE"
