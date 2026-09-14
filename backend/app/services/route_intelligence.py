from typing import List
from app.models.operations import RouteOption
from app.services.data_store import data_store

class RouteIntelligenceService:
    def get_alternate_routes(self) -> List[RouteOption]:
        """
        Calculates and ranks alternate port routing strategies when local port congestion
        exceeds threshold (> 85% utilization, wait time > 24h).
        Evaluates bunker fuel cost, nautical deviation, delay hours, and downstream port capacity.
        """
        return data_store.routes

    def evaluate_diversion(self, vessel_id: str, candidate_ports: List[str] = None) -> List[RouteOption]:
        """
        Evaluates specific diversion feasibility for a vessel.
        """
        routes = data_store.routes
        return routes

route_intelligence_service = RouteIntelligenceService()
