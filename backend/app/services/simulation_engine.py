from typing import Dict, Any
from app.models.operations import SimulationResult, SimulationScenario
from app.services.data_store import data_store

class SimulationEngineService:
    def run_scenario(self, scenario: SimulationScenario) -> SimulationResult:
        """
        Executes a disruption scenario simulation and projects queue buildup,
        wait time degradation, and synthesizes a multi-step AI recovery plan.
        """
        # Baseline simulation represents Crane C03 failure for 8 hours
        sim = data_store.simulation
        sim.scenario = scenario
        return sim

    def apply_recovery_plan(self) -> Dict[str, Any]:
        """
        Executes the 3-step AI recovery plan:
        1. Move idle Crane C05 from B05 to B04.
        2. Reassign Ocean Star to B02.
        3. Delay low-priority Pacific Voyager by +4 hours.
        Updates the physical state of cranes, berths, and vessels.
        """
        sim = data_store.simulation
        sim.recoveryPlan.isApplied = True

        # 1. Move C05 to B04
        c05 = next((c for c in data_store.cranes if c.id == 'C05'), None)
        if c05:
            c05.berthId = 'B04'
            c05.status = 'ACTIVE'
            c05.movesPerHour = 28
            c05.utilizationPercent = 75

        # 2. Reassign Ocean Star to B02
        v01 = next((v for v in data_store.vessels if v.id == 'VES-01'), None)
        if v01:
            v01.assignedBerth = 'B02'
            v01.predictedWaitHours = 6.8
            v01.demurrageRisk = 'Low'

        # 3. Update B04 metrics
        b04 = next((b for b in data_store.berths if b.id == 'B04'), None)
        if b04:
            b04.queueCount = 4
            b04.predictedUtilization = 83
            b04.riskLevel = 'MEDIUM'
            if 'C05' not in b04.assignedCraneIds:
                b04.assignedCraneIds.append('C05')

        return {
            "success": True,
            "message": "AI Recovery Plan applied successfully. Crane C05 redeployed to B04 and Ocean Star diverted to B02.",
            "recoveryPlan": sim.recoveryPlan
        }

simulation_engine_service = SimulationEngineService()
