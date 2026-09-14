from typing import List, Dict, Any
from app.models.operations import ShiftPlanItem
from app.services.data_store import data_store

class ShiftPlannerService:
    def get_72h_plan(self) -> List[ShiftPlanItem]:
        """
        Retrieves the current 72-hour operational shift plan across all 6 berths
        and 3 operational shifts (06-14, 14-22, 22-06).
        """
        return data_store.shift_plans

    def resolve_conflicts(self) -> Dict[str, Any]:
        """
        Detects and resolves shift scheduling conflicts:
        1. SP-08 & SP-09: Ocean Star at B04 with broken Crane C03 -> Rebalanced to B02 with C04 & C06.
        2. SP-11: Delayed Hapag Express overlapping with Ever Radiant -> Slot adjusted to night shift.
        """
        resolved_count = 0
        for item in data_store.shift_plans:
            if item.status == 'Conflict':
                if item.berthId == 'B04' and item.vesselId == 'VES-01':
                    item.berthId = 'B02'
                    item.assignedCranes = ['C04', 'C06']
                    item.status = 'Optimized'
                    item.conflictReason = None
                    resolved_count += 1
                elif item.berthId == 'B03' and item.vesselId == 'VES-07':
                    item.shift = '22-06'
                    item.status = 'Optimized'
                    item.conflictReason = None
                    resolved_count += 1

        return {
            "success": True,
            "resolvedConflictsCount": resolved_count,
            "updatedShifts": data_store.shift_plans
        }

shift_planner_service = ShiftPlannerService()
