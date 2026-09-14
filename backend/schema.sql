-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "photoUrl" TEXT,
    "role" TEXT NOT NULL,
    "authProvider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vessel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imo" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "lengthMeters" DOUBLE PRECISION NOT NULL,
    "draughtMeters" DOUBLE PRECISION NOT NULL,
    "teuCapacity" INTEGER NOT NULL,
    "cargoVolume" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "eta" TEXT NOT NULL,
    "etd" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "currentBerth" TEXT,
    "assignedBerth" TEXT NOT NULL,
    "predictedWaitHours" DOUBLE PRECISION NOT NULL,
    "demurrageRisk" TEXT NOT NULL,
    "historicalTurnaroundHours" DOUBLE PRECISION NOT NULL,
    "recommendedAction" TEXT,
    "ownerId" TEXT,
    "shippingCompany" TEXT,
    "callSign" TEXT,
    "vesselType" TEXT,
    "voyageNumber" TEXT,
    "previousPort" TEXT,
    "nextPort" TEXT,
    "requestedBerth" TEXT,
    "requestedArrivalTime" TEXT,
    "berthDurationHours" DOUBLE PRECISION,
    "requestedCranes" INTEGER,
    "cargoType" TEXT,
    "cargoQuantity" TEXT,
    "containersLoaded" INTEGER,
    "containersTotal" INTEGER,
    "dangerousGoods" BOOLEAN,
    "specialNotes" TEXT,

    CONSTRAINT "Vessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VesselTimelineEvent" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "VesselTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Berth" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lengthMeters" DOUBLE PRECISION NOT NULL,
    "depthMeters" DOUBLE PRECISION NOT NULL,
    "maxDraftMeters" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "currentUtilization" DOUBLE PRECISION NOT NULL,
    "predictedUtilization" DOUBLE PRECISION NOT NULL,
    "queueCount" INTEGER NOT NULL,
    "availableCranes" INTEGER NOT NULL,
    "maxCranes" INTEGER NOT NULL,
    "currentVesselId" TEXT,
    "nextVesselId" TEXT,
    "riskLevel" TEXT NOT NULL,

    CONSTRAINT "Berth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BerthHourlyForecast" (
    "id" TEXT NOT NULL,
    "berthId" TEXT NOT NULL,
    "hour" TEXT NOT NULL,
    "utilization" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BerthHourlyForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crane" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "berthId" TEXT NOT NULL,
    "movesPerHour" DOUBLE PRECISION NOT NULL,
    "utilizationPercent" DOUBLE PRECISION NOT NULL,
    "failureDurationHours" DOUBLE PRECISION,
    "impactSeverity" TEXT,
    "assignedVesselId" TEXT,
    "lastMaintenance" TEXT NOT NULL,
    "nextMaintenance" TEXT NOT NULL,

    CONSTRAINT "Crane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BerthCraneAssignment" (
    "berthId" TEXT NOT NULL,
    "craneId" TEXT NOT NULL,

    CONSTRAINT "BerthCraneAssignment_pkey" PRIMARY KEY ("berthId","craneId")
);

-- CreateTable
CREATE TABLE "YardBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "totalTeu" INTEGER NOT NULL,
    "occupiedTeu" INTEGER NOT NULL,
    "utilizationPercent" DOUBLE PRECISION NOT NULL,
    "dwellTimeDays" DOUBLE PRECISION NOT NULL,
    "inboundTeu24h" INTEGER NOT NULL,
    "outboundTeu24h" INTEGER NOT NULL,
    "congestionRisk" TEXT NOT NULL,
    "suggestedRedistribution" TEXT,

    CONSTRAINT "YardBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CongestionForecast" (
    "id" TEXT NOT NULL,
    "timeHorizon" TEXT NOT NULL,
    "overallCongestionPercent" DOUBLE PRECISION NOT NULL,
    "riskBottleneckBerth" TEXT NOT NULL,
    "bottleneckConfidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CongestionForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastDriver" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "factor" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "impact" TEXT NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "ForecastDriver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastPoint" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "hour" TEXT NOT NULL,
    "berthData" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ForecastPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationResult" (
    "id" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "targetVesselId" TEXT NOT NULL,
    "currentPlan" TEXT NOT NULL,
    "optimizedPlan" TEXT NOT NULL,
    "waitTimeDeltaHours" DOUBLE PRECISION NOT NULL,
    "waitTimeReductionPercent" DOUBLE PRECISION NOT NULL,
    "queueReductionCount" INTEGER NOT NULL,
    "savingsEstimateUsd" DOUBLE PRECISION NOT NULL,
    "rationale" TEXT NOT NULL,

    CONSTRAINT "OptimizationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationResult" (
    "id" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "before" TEXT NOT NULL,
    "after" TEXT NOT NULL,
    "recoveryPlan" TEXT NOT NULL,

    CONSTRAINT "SimulationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteOption" (
    "id" TEXT NOT NULL,
    "portCode" TEXT NOT NULL,
    "portName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "distanceNm" DOUBLE PRECISION NOT NULL,
    "eta" TEXT NOT NULL,
    "delayHours" DOUBLE PRECISION NOT NULL,
    "extraCostUsd" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "congestionScore" DOUBLE PRECISION NOT NULL,
    "rationale" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,

    CONSTRAINT "RouteOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftPlanItem" (
    "id" TEXT NOT NULL,
    "dayOffset" INTEGER NOT NULL,
    "shift" TEXT NOT NULL,
    "berthId" TEXT NOT NULL,
    "vesselId" TEXT,
    "vesselName" TEXT,
    "assignedCranes" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "conflictReason" TEXT,

    CONSTRAINT "ShiftPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalAlert" (
    "id" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "relatedEntity" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "actionRoute" TEXT NOT NULL,
    "actionLabel" TEXT NOT NULL,

    CONSTRAINT "OperationalAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BerthRequest" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "vesselName" TEXT NOT NULL,
    "imo" TEXT NOT NULL,
    "requestedBerth" TEXT NOT NULL,
    "requestedArrivalTime" TEXT NOT NULL,
    "estimatedDurationHours" DOUBLE PRECISION NOT NULL,
    "requestedCranes" INTEGER NOT NULL,
    "cargoType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submittedAt" TEXT NOT NULL,
    "reviewedAt" TEXT,
    "assignedBerth" TEXT,
    "notes" TEXT,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "BerthRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "vesselName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "uploadedDate" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "fileUrl" TEXT,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "ShippingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_imo_key" ON "Vessel"("imo");

-- AddForeignKey
ALTER TABLE "Vessel" ADD CONSTRAINT "Vessel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VesselTimelineEvent" ADD CONSTRAINT "VesselTimelineEvent_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BerthHourlyForecast" ADD CONSTRAINT "BerthHourlyForecast_berthId_fkey" FOREIGN KEY ("berthId") REFERENCES "Berth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crane" ADD CONSTRAINT "Crane_berthId_fkey" FOREIGN KEY ("berthId") REFERENCES "Berth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BerthCraneAssignment" ADD CONSTRAINT "BerthCraneAssignment_berthId_fkey" FOREIGN KEY ("berthId") REFERENCES "Berth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BerthCraneAssignment" ADD CONSTRAINT "BerthCraneAssignment_craneId_fkey" FOREIGN KEY ("craneId") REFERENCES "Crane"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastDriver" ADD CONSTRAINT "ForecastDriver_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "CongestionForecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastPoint" ADD CONSTRAINT "ForecastPoint_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "CongestionForecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BerthRequest" ADD CONSTRAINT "BerthRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingDocument" ADD CONSTRAINT "ShippingDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

