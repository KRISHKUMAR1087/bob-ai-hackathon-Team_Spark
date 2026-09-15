from typing import List, Optional, Dict, Any
from copy import deepcopy
from app.models.operations import (
    Vessel, Berth, Crane, YardBlock, CongestionForecastData,
    OptimizationResult, SimulationResult, RouteOption, ShiftPlanItem,
    OperationalAlert, PortStatusSummary
)

# Baseline Seed Data
INITIAL_VESSELS: List[Dict[str, Any]] = [
    {
        "id": "VES-01",
        "name": "Ocean Star",
        "imo": "9845214",
        "flag": "Panama",
        "lengthMeters": 399.0,
        "draughtMeters": 16.2,
        "teuCapacity": 21000,
        "cargoVolume": 14500,
        "origin": "Rotterdam (NLRTM)",
        "destination": "Singapore (SGSIN)",
        "eta": "Today, 14:30 UTC",
        "etd": "Tomorrow, 18:00 UTC",
        "status": "Arriving",
        "priority": "Critical",
        "currentBerth": None,
        "assignedBerth": "B04",
        "predictedWaitHours": 11.4,
        "demurrageRisk": "High",
        "historicalTurnaroundHours": 24.5,
        "recommendedAction": "Reassign to Berth B02 with 4 STS cranes to avert 4.6h demurrage wait.",
        "timelineEvents": [
            {"stage": "Pilot Station Entry", "time": "13:45 UTC", "status": "completed"},
            {"stage": "Anchorage Waiting", "time": "14:30 UTC", "status": "current"},
            {"stage": "Tug Mooring", "time": "16:00 UTC", "status": "scheduled"},
            {"stage": "Discharge Ops", "time": "17:30 UTC", "status": "scheduled"},
            {"stage": "Departure", "time": "Tomorrow 18:00 UTC", "status": "scheduled"}
        ]
    },
    {
        "id": "VES-02",
        "name": "MSC Orion",
        "imo": "9752188",
        "flag": "Liberia",
        "lengthMeters": 366.0,
        "draughtMeters": 15.4,
        "teuCapacity": 16500,
        "cargoVolume": 11800,
        "origin": "Shanghai (CNSHA)",
        "destination": "Hamburg (DEHAM)",
        "eta": "Today, 08:15 UTC",
        "etd": "Today, 22:30 UTC",
        "status": "Loading",
        "priority": "Priority",
        "currentBerth": "B01",
        "assignedBerth": "B01",
        "predictedWaitHours": 1.2,
        "demurrageRisk": "Low",
        "historicalTurnaroundHours": 21.2,
        "recommendedAction": "Maintain current 3-crane allocation; discharge on track.",
        "timelineEvents": [
            {"stage": "Pilot Station Entry", "time": "07:30 UTC", "status": "completed"},
            {"stage": "Berthing Confirmed", "time": "08:15 UTC", "status": "completed"},
            {"stage": "Discharge Ops", "time": "09:00 UTC", "status": "current"},
            {"stage": "Final Lashing", "time": "21:00 UTC", "status": "scheduled"},
            {"stage": "Departure", "time": "22:30 UTC", "status": "scheduled"}
        ]
    },
    {
        "id": "VES-03",
        "name": "Maersk Mc-Kinney",
        "imo": "9619907",
        "flag": "Denmark",
        "lengthMeters": 399.0,
        "draughtMeters": 16.0,
        "teuCapacity": 18270,
        "cargoVolume": 13900,
        "origin": "Busan (KRPUS)",
        "destination": "Antwerp (BEANR)",
        "eta": "Today, 11:00 UTC",
        "etd": "Tomorrow, 14:00 UTC",
        "status": "Berthing",
        "priority": "Critical",
        "currentBerth": "B02",
        "assignedBerth": "B02",
        "predictedWaitHours": 0.8,
        "demurrageRisk": "Low",
        "historicalTurnaroundHours": 25.0,
        "recommendedAction": "Berthing in progress at B02. Assigned 4 STS cranes.",
        "timelineEvents": [
            {"stage": "Pilot Station Entry", "time": "10:15 UTC", "status": "completed"},
            {"stage": "Tug Assistance", "time": "11:00 UTC", "status": "current"},
            {"stage": "Crane Gang Setup", "time": "12:00 UTC", "status": "scheduled"},
            {"stage": "Full Unloading", "time": "13:00 UTC", "status": "scheduled"}
        ]
    },
    {
        "id": "VES-04",
        "name": "Ever Radiant",
        "imo": "9811002",
        "flag": "Taiwan",
        "lengthMeters": 334.0,
        "draughtMeters": 14.5,
        "teuCapacity": 12000,
        "cargoVolume": 8900,
        "origin": "Kaohsiung (TWKHH)",
        "destination": "Rotterdam (NLRTM)",
        "eta": "Tomorrow, 02:00 UTC",
        "etd": "Tomorrow, 23:00 UTC",
        "status": "At Anchor",
        "priority": "Standard",
        "currentBerth": None,
        "assignedBerth": "B03",
        "predictedWaitHours": 4.2,
        "demurrageRisk": "Medium",
        "historicalTurnaroundHours": 19.5,
        "recommendedAction": "Anchor hold until Berth B03 clears maintenance at 06:00.",
        "timelineEvents": [
            {"stage": "Anchorage Arrived", "time": "Yesterday 23:00", "status": "completed"},
            {"stage": "Waiting Berth Cleared", "time": "Current", "status": "current"}
        ]
    },
    {
        "id": "VES-05",
        "name": "Pacific Voyager",
        "imo": "9348821",
        "flag": "Singapore",
        "lengthMeters": 294.0,
        "draughtMeters": 13.2,
        "teuCapacity": 8500,
        "cargoVolume": 6200,
        "origin": "Yantian (CNYTN)",
        "destination": "Felixstowe (GBFXT)",
        "eta": "Tomorrow, 16:45 UTC",
        "etd": "+2 Days, 10:00 UTC",
        "status": "Arriving",
        "priority": "Standard",
        "currentBerth": None,
        "assignedBerth": "B05",
        "predictedWaitHours": 2.0,
        "demurrageRisk": "Low",
        "historicalTurnaroundHours": 18.0,
        "recommendedAction": "Normal entry via South fairway. Allocate 2 cranes on B05.",
        "timelineEvents": [
            {"stage": "Approaching Channel", "time": "15:00 UTC", "status": "scheduled"},
            {"stage": "Berthing", "time": "Tomorrow 16:45 UTC", "status": "scheduled"}
        ]
    },
    {
        "id": "VES-06",
        "name": "CMA CGM Antoine",
        "imo": "9722675",
        "flag": "France",
        "lengthMeters": 396.0,
        "draughtMeters": 15.8,
        "teuCapacity": 20600,
        "cargoVolume": 15200,
        "origin": "Tanjung Pelepas (MYTPP)",
        "destination": "Le Havre (FRLEH)",
        "eta": "+2 Days, 06:00 UTC",
        "etd": "+3 Days, 12:00 UTC",
        "status": "Arriving",
        "priority": "Priority",
        "currentBerth": None,
        "assignedBerth": "B06",
        "predictedWaitHours": 3.1,
        "demurrageRisk": "Low",
        "historicalTurnaroundHours": 26.0,
        "recommendedAction": "Schedule 3 STS cranes on Shift 06-14 upon arrival.",
        "timelineEvents": [
            {"stage": "En Route", "time": "In Transit", "status": "scheduled"}
        ]
    },
    {
        "id": "VES-07",
        "name": "Hapag Express",
        "imo": "9514782",
        "flag": "Germany",
        "lengthMeters": 366.0,
        "draughtMeters": 14.8,
        "teuCapacity": 13200,
        "cargoVolume": 9400,
        "origin": "Port Said (EGPSD)",
        "destination": "Tokyo (JPTYO)",
        "eta": "Today, 21:00 UTC (+6h delay)",
        "etd": "Tomorrow, 20:00 UTC",
        "status": "Delayed",
        "priority": "Priority",
        "currentBerth": None,
        "assignedBerth": "B03",
        "predictedWaitHours": 5.6,
        "demurrageRisk": "Medium",
        "historicalTurnaroundHours": 22.4,
        "recommendedAction": "Weather squall delayed arrival. Re-slot behind Ever Radiant at B03.",
        "timelineEvents": [
            {"stage": "Weather Slowdown", "time": "11:00 UTC", "status": "completed"},
            {"stage": "Revised ETA", "time": "21:00 UTC", "status": "scheduled"}
        ]
    },
    {
        "id": "VES-08",
        "name": "Cosco Glory",
        "imo": "9465241",
        "flag": "Hong Kong",
        "lengthMeters": 366.0,
        "draughtMeters": 14.2,
        "teuCapacity": 14000,
        "cargoVolume": 10500,
        "origin": "Hong Kong (HKHKG)",
        "destination": "Rotterdam (NLRTM)",
        "eta": "Yesterday, 04:00 UTC",
        "etd": "Today, 06:00 UTC",
        "status": "Completed",
        "priority": "Standard",
        "currentBerth": None,
        "assignedBerth": "B01",
        "predictedWaitHours": 0.0,
        "demurrageRisk": "Low",
        "historicalTurnaroundHours": 21.0,
        "recommendedAction": "Completed discharge of 10,500 TEU ahead of schedule by 1.8h.",
        "timelineEvents": [
            {"stage": "Departure", "time": "Today 06:00 UTC", "status": "completed"}
        ]
    }
]

INITIAL_BERTHS: List[Dict[str, Any]] = [
    {
        "id": "B01",
        "name": "Berth 01 (Deepwater North)",
        "lengthMeters": 380.0,
        "depthMeters": 16.5,
        "maxDraftMeters": 16.0,
        "status": "Occupied",
        "currentUtilization": 78,
        "predictedUtilization": 76,
        "queueCount": 1,
        "availableCranes": 2,
        "maxCranes": 4,
        "currentVesselId": "VES-02",
        "nextVesselId": "VES-08",
        "assignedCraneIds": ["C01", "C02"],
        "riskLevel": "LOW",
        "hourlyForecast": [
            {"hour": "Now", "utilization": 78},
            {"hour": "+6h", "utilization": 75},
            {"hour": "+12h", "utilization": 72},
            {"hour": "+24h", "utilization": 76},
            {"hour": "+48h", "utilization": 74},
            {"hour": "+72h", "utilization": 70}
        ]
    },
    {
        "id": "B02",
        "name": "Berth 02 (Deepwater Central)",
        "lengthMeters": 400.0,
        "depthMeters": 17.5,
        "maxDraftMeters": 17.0,
        "status": "Available",
        "currentUtilization": 61,
        "predictedUtilization": 70,
        "queueCount": 2,
        "availableCranes": 4,
        "maxCranes": 5,
        "currentVesselId": "VES-03",
        "nextVesselId": None,
        "assignedCraneIds": ["C04", "C06"],
        "riskLevel": "LOW",
        "hourlyForecast": [
            {"hour": "Now", "utilization": 61},
            {"hour": "+6h", "utilization": 65},
            {"hour": "+12h", "utilization": 68},
            {"hour": "+24h", "utilization": 70},
            {"hour": "+48h", "utilization": 69},
            {"hour": "+72h", "utilization": 66}
        ]
    },
    {
        "id": "B03",
        "name": "Berth 03 (Feeder & Transshipment)",
        "lengthMeters": 350.0,
        "depthMeters": 15.5,
        "maxDraftMeters": 15.0,
        "status": "Maintenance",
        "currentUtilization": 69,
        "predictedUtilization": 74,
        "queueCount": 2,
        "availableCranes": 1,
        "maxCranes": 3,
        "currentVesselId": None,
        "nextVesselId": "VES-04",
        "assignedCraneIds": ["C07"],
        "riskLevel": "MEDIUM",
        "hourlyForecast": [
            {"hour": "Now", "utilization": 69},
            {"hour": "+6h", "utilization": 71},
            {"hour": "+12h", "utilization": 73},
            {"hour": "+24h", "utilization": 74},
            {"hour": "+48h", "utilization": 72},
            {"hour": "+72h", "utilization": 68}
        ]
    },
    {
        "id": "B04",
        "name": "Berth 04 (Ultra-Large Container)",
        "lengthMeters": 420.0,
        "depthMeters": 18.0,
        "maxDraftMeters": 17.5,
        "status": "Congested",
        "currentUtilization": 82,
        "predictedUtilization": 94,
        "queueCount": 7,
        "availableCranes": 1,
        "maxCranes": 5,
        "currentVesselId": None,
        "nextVesselId": "VES-01",
        "assignedCraneIds": ["C03"],
        "riskLevel": "HIGH",
        "hourlyForecast": [
            {"hour": "Now", "utilization": 82},
            {"hour": "+6h", "utilization": 86},
            {"hour": "+12h", "utilization": 89},
            {"hour": "+24h", "utilization": 94},
            {"hour": "+48h", "utilization": 88},
            {"hour": "+72h", "utilization": 79}
        ]
    },
    {
        "id": "B05",
        "name": "Berth 05 (South Terminal A)",
        "lengthMeters": 340.0,
        "depthMeters": 15.0,
        "maxDraftMeters": 14.5,
        "status": "Available",
        "currentUtilization": 58,
        "predictedUtilization": 64,
        "queueCount": 1,
        "availableCranes": 2,
        "maxCranes": 3,
        "currentVesselId": None,
        "nextVesselId": "VES-05",
        "assignedCraneIds": ["C05"],
        "riskLevel": "LOW",
        "hourlyForecast": [
            {"hour": "Now", "utilization": 58},
            {"hour": "+6h", "utilization": 60},
            {"hour": "+12h", "utilization": 62},
            {"hour": "+24h", "utilization": 64},
            {"hour": "+48h", "utilization": 63},
            {"hour": "+72h", "utilization": 59}
        ]
    },
    {
        "id": "B06",
        "name": "Berth 06 (South Terminal B)",
        "lengthMeters": 360.0,
        "depthMeters": 15.5,
        "maxDraftMeters": 15.0,
        "status": "Available",
        "currentUtilization": 64,
        "predictedUtilization": 68,
        "queueCount": 1,
        "availableCranes": 2,
        "maxCranes": 3,
        "currentVesselId": None,
        "nextVesselId": "VES-06",
        "assignedCraneIds": ["C08"],
        "riskLevel": "LOW",
        "hourlyForecast": [
            {"hour": "Now", "utilization": 64},
            {"hour": "+6h", "utilization": 66},
            {"hour": "+12h", "utilization": 67},
            {"hour": "+24h", "utilization": 68},
            {"hour": "+48h", "utilization": 65},
            {"hour": "+72h", "utilization": 62}
        ]
    }
]

INITIAL_CRANES: List[Dict[str, Any]] = [
    {
        "id": "C01",
        "name": "Super STS 01",
        "type": "STS",
        "status": "ACTIVE",
        "berthId": "B01",
        "movesPerHour": 34,
        "utilizationPercent": 84,
        "assignedVesselId": "VES-02",
        "lastMaintenance": "2026-08-20",
        "nextMaintenance": "2026-09-20"
    },
    {
        "id": "C02",
        "name": "Super STS 02",
        "type": "STS",
        "status": "ACTIVE",
        "berthId": "B01",
        "movesPerHour": 31,
        "utilizationPercent": 79,
        "assignedVesselId": "VES-02",
        "lastMaintenance": "2026-08-22",
        "nextMaintenance": "2026-09-22"
    },
    {
        "id": "C03",
        "name": "Megamax STS 03",
        "type": "STS",
        "status": "FAILED",
        "berthId": "B04",
        "movesPerHour": 0,
        "utilizationPercent": 0,
        "failureDurationHours": 8,
        "impactSeverity": "High",
        "assignedVesselId": None,
        "lastMaintenance": "2026-07-15",
        "nextMaintenance": "IMMEDIATE REPAIR"
    },
    {
        "id": "C04",
        "name": "Super STS 04",
        "type": "STS",
        "status": "ACTIVE",
        "berthId": "B02",
        "movesPerHour": 36,
        "utilizationPercent": 88,
        "assignedVesselId": "VES-03",
        "lastMaintenance": "2026-08-10",
        "nextMaintenance": "2026-09-15"
    },
    {
        "id": "C05",
        "name": "Panamax STS 05",
        "type": "STS",
        "status": "IDLE",
        "berthId": "B05",
        "movesPerHour": 28,
        "utilizationPercent": 12,
        "impactSeverity": "Low",
        "assignedVesselId": None,
        "lastMaintenance": "2026-08-25",
        "nextMaintenance": "2026-09-25"
    },
    {
        "id": "C06",
        "name": "Super STS 06",
        "type": "STS",
        "status": "ACTIVE",
        "berthId": "B02",
        "movesPerHour": 33,
        "utilizationPercent": 81,
        "assignedVesselId": "VES-03",
        "lastMaintenance": "2026-08-18",
        "nextMaintenance": "2026-09-18"
    },
    {
        "id": "C07",
        "name": "Post-Panamax STS 07",
        "type": "STS",
        "status": "MAINTENANCE",
        "berthId": "B03",
        "movesPerHour": 0,
        "utilizationPercent": 0,
        "failureDurationHours": 4,
        "impactSeverity": "Medium",
        "assignedVesselId": None,
        "lastMaintenance": "Today 06:00",
        "nextMaintenance": "Routine cable replacement"
    },
    {
        "id": "C08",
        "name": "Super STS 08",
        "type": "STS",
        "status": "ACTIVE",
        "berthId": "B06",
        "movesPerHour": 29,
        "utilizationPercent": 72,
        "assignedVesselId": None,
        "lastMaintenance": "2026-08-14",
        "nextMaintenance": "2026-09-14"
    }
]

INITIAL_YARD_BLOCKS: List[Dict[str, Any]] = [
    {
        "id": "CY-01",
        "name": "Container Yard 01 (North Export)",
        "category": "Dry",
        "totalTeu": 14000,
        "occupiedTeu": 10080,
        "utilizationPercent": 72,
        "dwellTimeDays": 3.4,
        "inboundTeu24h": 1850,
        "outboundTeu24h": 2100,
        "congestionRisk": "Moderate"
    },
    {
        "id": "CY-02",
        "name": "Container Yard 02 (Central Transshipment)",
        "category": "Dry",
        "totalTeu": 16000,
        "occupiedTeu": 10400,
        "utilizationPercent": 65,
        "dwellTimeDays": 2.8,
        "inboundTeu24h": 2200,
        "outboundTeu24h": 2400,
        "congestionRisk": "Normal"
    },
    {
        "id": "CY-03",
        "name": "Container Yard 03 (Cold Chain & Reefer)",
        "category": "Reefer",
        "totalTeu": 8500,
        "occupiedTeu": 7480,
        "utilizationPercent": 88,
        "dwellTimeDays": 4.6,
        "inboundTeu24h": 1450,
        "outboundTeu24h": 980,
        "congestionRisk": "High",
        "suggestedRedistribution": {
            "targetBlockId": "CY-04",
            "amountTeu": 650,
            "rationale": "Reefer plug occupancy nearing 92%. Transfer auxiliary dry plugs to CY-04 buffer."
        }
    },
    {
        "id": "CY-04",
        "name": "Container Yard 04 (South Overflow & Hazmat)",
        "category": "Hazmat",
        "totalTeu": 12000,
        "occupiedTeu": 6120,
        "utilizationPercent": 51,
        "dwellTimeDays": 3.1,
        "inboundTeu24h": 900,
        "outboundTeu24h": 1150,
        "congestionRisk": "Normal"
    }
]

INITIAL_FORECAST: Dict[str, Any] = {
    "timeHorizon": "24h",
    "overallCongestionPercent": 74,
    "riskBottleneckBerth": "B04",
    "bottleneckConfidence": 91,
    "drivers": [
        {"factor": "Vessel Arrivals Surge", "percentage": 38, "impact": "High", "detail": "3 ULCVs entering within a 6-hour window creates arrival bunching."},
        {"factor": "Berth Utilization Baseline", "percentage": 27, "impact": "High", "detail": "B04 continuously operated at >80% capacity over previous 48 hours."},
        {"factor": "Crane Shortage / C03 Fault", "percentage": 18, "impact": "High", "detail": "STS C03 hoist inverter fault cuts crane density from 4 to 2."},
        {"factor": "Yard Pressure (CY-03 Reefer)", "percentage": 11, "impact": "Medium", "detail": "High dwell time on incoming refrigerated units delays dock-to-yard haulage."},
        {"factor": "Historical Day-of-Week Pattern", "percentage": 6, "impact": "Low", "detail": "Mid-week feeder arrivals consistently add 1.2h variance to cycle time."}
    ],
    "points": [
        {"hour": "Now", "B01": 78, "B02": 61, "B03": 69, "B04": 82, "B05": 58, "B06": 64, "threshold": 85},
        {"hour": "+6h", "B01": 75, "B02": 65, "B03": 71, "B04": 86, "B05": 60, "B06": 66, "threshold": 85},
        {"hour": "+12h", "B01": 72, "B02": 68, "B03": 73, "B04": 89, "B05": 62, "B06": 67, "threshold": 85},
        {"hour": "+18h", "B01": 74, "B02": 69, "B03": 72, "B04": 92, "B05": 63, "B06": 68, "threshold": 85},
        {"hour": "+24h", "B01": 76, "B02": 70, "B03": 74, "B04": 94, "B05": 64, "B06": 68, "threshold": 85},
        {"hour": "+36h", "B01": 75, "B02": 71, "B03": 73, "B04": 91, "B05": 64, "B06": 67, "threshold": 85},
        {"hour": "+48h", "B01": 74, "B02": 69, "B03": 72, "B04": 88, "B05": 63, "B06": 65, "threshold": 85},
        {"hour": "+72h", "B01": 70, "B02": 66, "B03": 68, "B04": 79, "B05": 59, "B06": 62, "threshold": 85}
    ]
}

INITIAL_OPTIMIZATION: Dict[str, Any] = {
    "id": "OPT-2026-0914-01",
    "timestamp": "Just now",
    "isApplied": False,
    "targetVesselId": "VES-01",
    "currentPlan": {
        "vesselId": "VES-01",
        "vesselName": "Ocean Star",
        "berthId": "B04",
        "cranesAssigned": 3,
        "expectedWaitHours": 11.4,
        "berthUtilizationPercent": 94
    },
    "optimizedPlan": {
        "vesselId": "VES-01",
        "vesselName": "Ocean Star",
        "berthId": "B02",
        "cranesAssigned": 4,
        "expectedWaitHours": 6.8,
        "berthUtilizationPercent": 72
    },
    "waitTimeDeltaHours": -4.6,
    "waitTimeReductionPercent": 40.3,
    "queueReductionCount": 3,
    "savingsEstimateUsd": 148000.0,
    "rationale": "Reassigning Ocean Star to Berth B02 unlocks 4 operational Super STS cranes, bypassing the C03 failure bottleneck at B04. This cuts vessel turnaround wait by 4.6 hours and prevents demurrage penalties."
}

INITIAL_SIMULATION: Dict[str, Any] = {
    "id": "SIM-C03-FAIL",
    "scenario": {
        "id": "SCEN-01",
        "type": "crane_failure",
        "targetEntityId": "C03",
        "targetEntityName": "Megamax STS 03 (Berth B04)",
        "durationHours": 8,
        "description": "Complete drive electronics fault on C03 removing primary high-speed hoist capacity at Berth B04."
    },
    "before": {
        "queueCount": 7,
        "avgWaitHours": 11.4,
        "berthUtilizationPercent": 82
    },
    "after": {
        "queueCount": 11,
        "avgWaitHours": 17.8,
        "berthUtilizationPercent": 94
    },
    "recoveryPlan": {
        "id": "REC-C03-01",
        "isApplied": False,
        "expectedRecoveryHours": 5.2,
        "steps": [
            {
                "order": 1,
                "title": "Move C05 to Berth B04",
                "detail": "Redeploy idle Panamax STS C05 from Berth B05 to reinforce Berth B04 crane gang within 45 minutes.",
                "targetEntity": "Crane C05"
            },
            {
                "order": 2,
                "title": "Reassign Ocean Star to Berth B02",
                "detail": "Divert approaching ULCV Ocean Star to B02 to utilize high-throughput active STS cranes C04 and C06.",
                "targetEntity": "Vessel Ocean Star"
            },
            {
                "order": 3,
                "title": "Delay low-priority vessel Pacific Voyager",
                "detail": "Reschedule Pacific Voyager ETA window by +4.0 hours to level peak gate and quay arrival pressure.",
                "targetEntity": "Vessel Pacific Voyager"
            }
        ]
    }
}

INITIAL_ROUTES: List[Dict[str, Any]] = [
    {
        "portCode": "PORT-A",
        "portName": "Rotterdam Hub (Current Route)",
        "country": "Netherlands",
        "distanceNm": 420,
        "eta": "Today, 14:30 UTC",
        "delayHours": 31.0,
        "extraCostUsd": 100000,
        "riskLevel": "Critical",
        "isRecommended": False,
        "congestionScore": 92,
        "rationale": "Severe berth bottleneck (B04 at 94%) and yard overflow cause 31h projected demurrage delay.",
        "coordinates": {"x": 180, "y": 140}
    },
    {
        "portCode": "PORT-B",
        "portName": "Antwerp Gateway (Recommended Alternate)",
        "country": "Belgium",
        "distanceNm": 465,
        "eta": "Tomorrow, 03:00 UTC",
        "delayHours": 18.0,
        "extraCostUsd": 110000,
        "riskLevel": "Medium",
        "isRecommended": True,
        "congestionScore": 54,
        "rationale": "+$10k bunker cost offset by -13h turnaround savings and 4 active deepwater berths available immediately.",
        "coordinates": {"x": 320, "y": 190}
    },
    {
        "portCode": "PORT-C",
        "portName": "Zeebrugge Deepwater (Contingency)",
        "country": "Belgium",
        "distanceNm": 410,
        "eta": "Today, 22:00 UTC",
        "delayHours": 23.0,
        "extraCostUsd": 96000,
        "riskLevel": "High",
        "isRecommended": False,
        "congestionScore": 78,
        "rationale": "Lower fuel expense, but intermodal rail capacity at Zeebrugge currently restricted by maintenance window.",
        "coordinates": {"x": 440, "y": 260}
    }
]

INITIAL_SHIFTS: List[Dict[str, Any]] = [
    {"id": "SP-01", "dayOffset": 0, "shift": "06-14", "berthId": "B01", "vesselId": "VES-02", "vesselName": "MSC Orion", "assignedCranes": ["C01", "C02"], "status": "Scheduled"},
    {"id": "SP-02", "dayOffset": 0, "shift": "14-22", "berthId": "B01", "vesselId": "VES-02", "vesselName": "MSC Orion", "assignedCranes": ["C01", "C02"], "status": "Scheduled"},
    {"id": "SP-03", "dayOffset": 0, "shift": "22-06", "berthId": "B01", "vesselId": "VES-08", "vesselName": "Cosco Glory (Turnaround)", "assignedCranes": ["C01"], "status": "Scheduled"},
    {"id": "SP-04", "dayOffset": 0, "shift": "06-14", "berthId": "B02", "vesselId": "VES-03", "vesselName": "Maersk Mc-Kinney", "assignedCranes": ["C04", "C06"], "status": "Scheduled"},
    {"id": "SP-05", "dayOffset": 0, "shift": "14-22", "berthId": "B02", "vesselId": "VES-03", "vesselName": "Maersk Mc-Kinney", "assignedCranes": ["C04", "C06"], "status": "Scheduled"},
    {"id": "SP-06", "dayOffset": 0, "shift": "22-06", "berthId": "B02", "vesselId": None, "vesselName": "Buffer Window", "assignedCranes": [], "status": "Scheduled"},
    {"id": "SP-07", "dayOffset": 0, "shift": "06-14", "berthId": "B04", "vesselId": None, "vesselName": "Turnaround Prep", "assignedCranes": [], "status": "Scheduled"},
    {"id": "SP-08", "dayOffset": 0, "shift": "14-22", "berthId": "B04", "vesselId": "VES-01", "vesselName": "Ocean Star", "assignedCranes": ["C03"], "status": "Conflict", "conflictReason": "Crane C03 is FAILED (8h) while Ocean Star requires 3+ STS cranes."},
    {"id": "SP-09", "dayOffset": 0, "shift": "22-06", "berthId": "B04", "vesselId": "VES-01", "vesselName": "Ocean Star", "assignedCranes": ["C03"], "status": "Conflict", "conflictReason": "Bottleneck overflow extends into Night Shift."},
    {"id": "SP-10", "dayOffset": 1, "shift": "06-14", "berthId": "B03", "vesselId": "VES-04", "vesselName": "Ever Radiant", "assignedCranes": ["C07"], "status": "Scheduled"},
    {"id": "SP-11", "dayOffset": 1, "shift": "14-22", "berthId": "B03", "vesselId": "VES-07", "vesselName": "Hapag Express", "assignedCranes": ["C07"], "status": "Conflict", "conflictReason": "Delayed ETA overlap with Ever Radiant discharge."},
    {"id": "SP-12", "dayOffset": 1, "shift": "22-06", "berthId": "B03", "vesselId": "VES-07", "vesselName": "Hapag Express", "assignedCranes": ["C07"], "status": "Scheduled"},
    {"id": "SP-13", "dayOffset": 1, "shift": "06-14", "berthId": "B05", "vesselId": None, "vesselName": "Available Capacity", "assignedCranes": ["C05"], "status": "Scheduled"},
    {"id": "SP-14", "dayOffset": 1, "shift": "14-22", "berthId": "B05", "vesselId": "VES-05", "vesselName": "Pacific Voyager", "assignedCranes": ["C05"], "status": "Scheduled"},
    {"id": "SP-15", "dayOffset": 2, "shift": "06-14", "berthId": "B06", "vesselId": "VES-06", "vesselName": "CMA CGM Antoine", "assignedCranes": ["C08"], "status": "Scheduled"}
]

INITIAL_ALERTS: List[Dict[str, Any]] = [
    {
        "id": "ALT-01",
        "timestamp": "12 mins ago",
        "severity": "CRITICAL",
        "title": "Crane C03 Inverter Fault Offline",
        "description": "Megamax STS 03 at Berth B04 suffered main hoist drive electronics trip. Estimated repair window: 8 hours.",
        "relatedEntity": {"type": "crane", "id": "C03", "name": "Megamax STS 03"},
        "isResolved": False,
        "actionRoute": "/decision/simulator",
        "actionLabel": "Simulate Impact"
    },
    {
        "id": "ALT-02",
        "timestamp": "28 mins ago",
        "severity": "HIGH",
        "title": "B04 Projected >90% Utilization",
        "description": "ML model projects Berth B04 utilization climbing to 94% within 24h due to arrival bunching and crane deficit.",
        "relatedEntity": {"type": "berth", "id": "B04", "name": "Berth 04"},
        "isResolved": False,
        "actionRoute": "/decision/optimizer",
        "actionLabel": "Optimize Berth"
    },
    {
        "id": "ALT-03",
        "timestamp": "45 mins ago",
        "severity": "MEDIUM",
        "title": "CY-03 Cold Chain Capacity at 88%",
        "description": "Reefer yard CY-03 is approaching operational saturation (7,480 / 8,500 TEU). Redistribution recommended.",
        "relatedEntity": {"type": "yard", "id": "CY-03", "name": "Yard Block CY-03"},
        "isResolved": False,
        "actionRoute": "/operations/yard",
        "actionLabel": "View Block"
    },
    {
        "id": "ALT-04",
        "timestamp": "1 hour ago",
        "severity": "INFO",
        "title": "Ocean Star Coastal Squall Advisory",
        "description": "Ocean Star ETA updated +45m due to adverse tidal squall in approach channel. New ETA: 14:30 UTC.",
        "relatedEntity": {"type": "vessel", "id": "VES-01", "name": "Ocean Star"},
        "isResolved": False,
        "actionRoute": "/operations/vessels/VES-01",
        "actionLabel": "View Vessel"
    }
]

class DataStore:
    def __init__(self):
        self.reset()

    def reset(self):
        self.vessels: List[Vessel] = [Vessel(**v) for v in deepcopy(INITIAL_VESSELS)]
        self.berths: List[Berth] = [Berth(**b) for b in deepcopy(INITIAL_BERTHS)]
        self.cranes: List[Crane] = [Crane(**c) for c in deepcopy(INITIAL_CRANES)]
        self.yard_blocks: List[YardBlock] = [YardBlock(**y) for y in deepcopy(INITIAL_YARD_BLOCKS)]
        self.forecast: CongestionForecastData = CongestionForecastData(**deepcopy(INITIAL_FORECAST))
        self.optimization: OptimizationResult = OptimizationResult(**deepcopy(INITIAL_OPTIMIZATION))
        self.simulation: SimulationResult = SimulationResult(**deepcopy(INITIAL_SIMULATION))
        self.routes: List[RouteOption] = [RouteOption(**r) for r in deepcopy(INITIAL_ROUTES)]
        self.shift_plans: List[ShiftPlanItem] = [ShiftPlanItem(**s) for s in deepcopy(INITIAL_SHIFTS)]
        self.alerts: List[OperationalAlert] = [OperationalAlert(**a) for a in deepcopy(INITIAL_ALERTS)]

    def get_port_status(self) -> PortStatusSummary:
        vessels_in_port = len([v for v in self.vessels if v.status in ['Berthing', 'Loading']])
        arriving_count = len([v for v in self.vessels if v.status == 'Arriving'])
        avg_berth_util = round(sum(b.currentUtilization for b in self.berths) / len(self.berths)) if self.berths else 0
        active_cranes = len([c for c in self.cranes if c.status == 'ACTIVE'])
        crane_avail = round((active_cranes / len(self.cranes)) * 100) if self.cranes else 0
        total_yard_occupied = sum(y.occupiedTeu for y in self.yard_blocks)
        total_yard_capacity = sum(y.totalTeu for y in self.yard_blocks)
        yard_util = round((total_yard_occupied / total_yard_capacity) * 100) if total_yard_capacity else 0
        queue_total = sum(b.queueCount for b in self.berths)

        congestion_level = 'NORMAL'
        if avg_berth_util >= 85:
            congestion_level = 'CRITICAL'
        elif avg_berth_util >= 70:
            congestion_level = 'HIGH'

        return PortStatusSummary(
            vesselsInPort=vessels_in_port,
            vesselsArriving=arriving_count,
            activeBerthUtilization=avg_berth_util,
            craneAvailability=crane_avail,
            yardUtilization=yard_util,
            currentQueue=queue_total,
            predictedCongestion=congestion_level,
            highRiskBerth="B04",
            highRiskBerthUtilization=82,
            highRiskBerthPredicted=94
        )

# Global singleton store
data_store = DataStore()
