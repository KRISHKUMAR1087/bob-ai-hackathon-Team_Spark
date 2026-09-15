-- ==============================================================================
-- PortsPilot AI — Supabase Step A Migration Script: Tables & RLS Policies
-- ==============================================================================

-- 1. Infrastructure (Port-Wide) Tables
CREATE TABLE IF NOT EXISTS public."Berth" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lengthMeters" DOUBLE PRECISION NOT NULL,
    "depthMeters" DOUBLE PRECISION NOT NULL,
    "maxDraftMeters" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "currentUtilization" DOUBLE PRECISION NOT NULL,
    "predictedUtilization" DOUBLE PRECISION NOT NULL,
    "queueCount" INT NOT NULL DEFAULT 0,
    "availableCranes" INT NOT NULL DEFAULT 0,
    "maxCranes" INT NOT NULL DEFAULT 0,
    "currentVesselId" TEXT,
    "nextVesselId" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW'
);

CREATE TABLE IF NOT EXISTS public."BerthHourlyForecast" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "berthId" TEXT NOT NULL REFERENCES public."Berth"("id") ON DELETE CASCADE,
    "hour" TEXT NOT NULL,
    "utilization" DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS public."Crane" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "berthId" TEXT NOT NULL REFERENCES public."Berth"("id"),
    "movesPerHour" DOUBLE PRECISION NOT NULL,
    "utilizationPercent" DOUBLE PRECISION NOT NULL,
    "failureDurationHours" DOUBLE PRECISION,
    "impactSeverity" TEXT,
    "assignedVesselId" TEXT,
    "lastMaintenance" TEXT NOT NULL,
    "nextMaintenance" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public."BerthCraneAssignment" (
    "berthId" TEXT NOT NULL REFERENCES public."Berth"("id") ON DELETE CASCADE,
    "craneId" TEXT NOT NULL REFERENCES public."Crane"("id") ON DELETE CASCADE,
    PRIMARY KEY ("berthId", "craneId")
);

CREATE TABLE IF NOT EXISTS public."YardBlock" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "totalTeu" INT NOT NULL,
    "occupiedTeu" INT NOT NULL,
    "utilizationPercent" DOUBLE PRECISION NOT NULL,
    "dwellTimeDays" DOUBLE PRECISION NOT NULL,
    "inboundTeu24h" INT NOT NULL DEFAULT 0,
    "outboundTeu24h" INT NOT NULL DEFAULT 0,
    "congestionRisk" TEXT NOT NULL DEFAULT 'Normal',
    "suggestedRedistribution" TEXT
);

-- 2. Per-Agent Operational Generated Results Tables
CREATE TABLE IF NOT EXISTS public."CongestionForecast" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "timeHorizon" TEXT NOT NULL,
    "overallCongestionPercent" DOUBLE PRECISION NOT NULL,
    "riskBottleneckBerth" TEXT NOT NULL,
    "bottleneckConfidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE
);

-- Ensure ownerId column exists if table was previously created
ALTER TABLE public."CongestionForecast" ADD COLUMN IF NOT EXISTS "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public."ForecastDriver" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "forecastId" TEXT NOT NULL REFERENCES public."CongestionForecast"("id") ON DELETE CASCADE,
    "factor" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "impact" TEXT NOT NULL,
    "detail" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public."ForecastPoint" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "forecastId" TEXT NOT NULL REFERENCES public."CongestionForecast"("id") ON DELETE CASCADE,
    "hour" TEXT NOT NULL,
    "berthData" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS public."OptimizationResult" (
    "id" TEXT PRIMARY KEY,
    "timestamp" TEXT NOT NULL,
    "isApplied" BOOLEAN NOT NULL DEFAULT FALSE,
    "targetVesselId" TEXT NOT NULL,
    "currentPlan" TEXT NOT NULL,
    "optimizedPlan" TEXT NOT NULL,
    "waitTimeDeltaHours" DOUBLE PRECISION NOT NULL,
    "waitTimeReductionPercent" DOUBLE PRECISION NOT NULL,
    "queueReductionCount" INT NOT NULL,
    "savingsEstimateUsd" DOUBLE PRECISION NOT NULL,
    "rationale" TEXT NOT NULL,
    "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE
);

ALTER TABLE public."OptimizationResult" ADD COLUMN IF NOT EXISTS "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public."SimulationResult" (
    "id" TEXT PRIMARY KEY,
    "scenario" TEXT NOT NULL,
    "before" TEXT NOT NULL,
    "after" TEXT NOT NULL,
    "recoveryPlan" TEXT NOT NULL,
    "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE
);

ALTER TABLE public."SimulationResult" ADD COLUMN IF NOT EXISTS "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public."RouteOption" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "portCode" TEXT NOT NULL,
    "portName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "distanceNm" DOUBLE PRECISION NOT NULL,
    "eta" TEXT NOT NULL,
    "delayHours" DOUBLE PRECISION NOT NULL,
    "extraCostUsd" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT FALSE,
    "congestionScore" DOUBLE PRECISION NOT NULL,
    "rationale" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE
);

ALTER TABLE public."RouteOption" ADD COLUMN IF NOT EXISTS "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public."ShiftPlanItem" (
    "id" TEXT PRIMARY KEY,
    "dayOffset" INT NOT NULL,
    "shift" TEXT NOT NULL,
    "berthId" TEXT NOT NULL,
    "vesselId" TEXT,
    "vesselName" TEXT,
    "assignedCranes" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "conflictReason" TEXT,
    "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE
);

ALTER TABLE public."ShiftPlanItem" ADD COLUMN IF NOT EXISTS "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public."OperationalAlert" (
    "id" TEXT PRIMARY KEY,
    "timestamp" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "relatedEntity" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT FALSE,
    "actionRoute" TEXT NOT NULL,
    "actionLabel" TEXT NOT NULL,
    "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE
);

ALTER TABLE public."OperationalAlert" ADD COLUMN IF NOT EXISTS "ownerId" TEXT REFERENCES public."User"("id") ON DELETE CASCADE;

-- 3. Row Level Security Policies

-- Helper check function if not defined
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.1 Infrastructure Tables (Port-Wide Read for All Authenticated; Admin Write)
ALTER TABLE public."Berth" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BerthHourlyForecast" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Crane" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BerthCraneAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."YardBlock" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view berths" ON public."Berth";
DROP POLICY IF EXISTS "Admins can manage berths" ON public."Berth";
CREATE POLICY "All users can view berths" ON public."Berth" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage berths" ON public."Berth" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "All users can view berth hourly forecasts" ON public."BerthHourlyForecast";
DROP POLICY IF EXISTS "Admins can manage berth hourly forecasts" ON public."BerthHourlyForecast";
CREATE POLICY "All users can view berth hourly forecasts" ON public."BerthHourlyForecast" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage berth hourly forecasts" ON public."BerthHourlyForecast" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "All users can view cranes" ON public."Crane";
DROP POLICY IF EXISTS "Admins can manage cranes" ON public."Crane";
CREATE POLICY "All users can view cranes" ON public."Crane" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage cranes" ON public."Crane" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "All users can view berth crane assignments" ON public."BerthCraneAssignment";
DROP POLICY IF EXISTS "Admins can manage berth crane assignments" ON public."BerthCraneAssignment";
CREATE POLICY "All users can view berth crane assignments" ON public."BerthCraneAssignment" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage berth crane assignments" ON public."BerthCraneAssignment" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "All users can view yard blocks" ON public."YardBlock";
DROP POLICY IF EXISTS "Admins can manage yard blocks" ON public."YardBlock";
CREATE POLICY "All users can view yard blocks" ON public."YardBlock" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage yard blocks" ON public."YardBlock" FOR ALL USING (public.is_admin());

-- 3.2 Per-Agent Generated Tables RLS Policies
ALTER TABLE public."OperationalAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ShiftPlanItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RouteOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OptimizationResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SimulationResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CongestionForecast" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ForecastDriver" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ForecastPoint" ENABLE ROW LEVEL SECURITY;

-- OperationalAlert
DROP POLICY IF EXISTS "Admins can manage all alerts" ON public."OperationalAlert";
DROP POLICY IF EXISTS "Ship agents can view own alerts" ON public."OperationalAlert";
DROP POLICY IF EXISTS "Ship agents can manage own alerts" ON public."OperationalAlert";
CREATE POLICY "Admins can manage all alerts" ON public."OperationalAlert" FOR ALL USING (public.is_admin());
CREATE POLICY "Ship agents can view own alerts" ON public."OperationalAlert" FOR SELECT USING ("ownerId" = auth.uid()::text);
CREATE POLICY "Ship agents can manage own alerts" ON public."OperationalAlert" FOR ALL USING ("ownerId" = auth.uid()::text);

-- ShiftPlanItem
DROP POLICY IF EXISTS "Admins can manage all shift plans" ON public."ShiftPlanItem";
DROP POLICY IF EXISTS "Ship agents can view own shift plans" ON public."ShiftPlanItem";
DROP POLICY IF EXISTS "Ship agents can manage own shift plans" ON public."ShiftPlanItem";
CREATE POLICY "Admins can manage all shift plans" ON public."ShiftPlanItem" FOR ALL USING (public.is_admin());
CREATE POLICY "Ship agents can view own shift plans" ON public."ShiftPlanItem" FOR SELECT USING ("ownerId" = auth.uid()::text);
CREATE POLICY "Ship agents can manage own shift plans" ON public."ShiftPlanItem" FOR ALL USING ("ownerId" = auth.uid()::text);

-- RouteOption
DROP POLICY IF EXISTS "Admins can manage all route options" ON public."RouteOption";
DROP POLICY IF EXISTS "Ship agents can view own route options" ON public."RouteOption";
DROP POLICY IF EXISTS "Ship agents can manage own route options" ON public."RouteOption";
CREATE POLICY "Admins can manage all route options" ON public."RouteOption" FOR ALL USING (public.is_admin());
CREATE POLICY "Ship agents can view own route options" ON public."RouteOption" FOR SELECT USING ("ownerId" = auth.uid()::text);
CREATE POLICY "Ship agents can manage own route options" ON public."RouteOption" FOR ALL USING ("ownerId" = auth.uid()::text);

-- OptimizationResult
DROP POLICY IF EXISTS "Admins can manage all optimization results" ON public."OptimizationResult";
DROP POLICY IF EXISTS "Ship agents can view own optimization results" ON public."OptimizationResult";
DROP POLICY IF EXISTS "Ship agents can manage own optimization results" ON public."OptimizationResult";
CREATE POLICY "Admins can manage all optimization results" ON public."OptimizationResult" FOR ALL USING (public.is_admin());
CREATE POLICY "Ship agents can view own optimization results" ON public."OptimizationResult" FOR SELECT USING ("ownerId" = auth.uid()::text);
CREATE POLICY "Ship agents can manage own optimization results" ON public."OptimizationResult" FOR ALL USING ("ownerId" = auth.uid()::text);

-- SimulationResult
DROP POLICY IF EXISTS "Admins can manage all simulation results" ON public."SimulationResult";
DROP POLICY IF EXISTS "Ship agents can view own simulation results" ON public."SimulationResult";
DROP POLICY IF EXISTS "Ship agents can manage own simulation results" ON public."SimulationResult";
CREATE POLICY "Admins can manage all simulation results" ON public."SimulationResult" FOR ALL USING (public.is_admin());
CREATE POLICY "Ship agents can view own simulation results" ON public."SimulationResult" FOR SELECT USING ("ownerId" = auth.uid()::text);
CREATE POLICY "Ship agents can manage own simulation results" ON public."SimulationResult" FOR ALL USING ("ownerId" = auth.uid()::text);

-- CongestionForecast
DROP POLICY IF EXISTS "Admins can manage all congestion forecasts" ON public."CongestionForecast";
DROP POLICY IF EXISTS "Ship agents can view own congestion forecasts" ON public."CongestionForecast";
DROP POLICY IF EXISTS "Ship agents can manage own congestion forecasts" ON public."CongestionForecast";
CREATE POLICY "Admins can manage all congestion forecasts" ON public."CongestionForecast" FOR ALL USING (public.is_admin());
CREATE POLICY "Ship agents can view own congestion forecasts" ON public."CongestionForecast" FOR SELECT USING ("ownerId" = auth.uid()::text);
CREATE POLICY "Ship agents can manage own congestion forecasts" ON public."CongestionForecast" FOR ALL USING ("ownerId" = auth.uid()::text);

-- ForecastDriver & ForecastPoint
DROP POLICY IF EXISTS "Admins can manage forecast drivers" ON public."ForecastDriver";
DROP POLICY IF EXISTS "Users can view forecast drivers" ON public."ForecastDriver";
CREATE POLICY "Admins can manage forecast drivers" ON public."ForecastDriver" FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view forecast drivers" ON public."ForecastDriver" FOR ALL USING (
    EXISTS (SELECT 1 FROM public."CongestionForecast" cf WHERE cf.id = "ForecastDriver"."forecastId" AND (cf."ownerId" = auth.uid()::text OR public.is_admin()))
);

DROP POLICY IF EXISTS "Admins can manage forecast points" ON public."ForecastPoint";
DROP POLICY IF EXISTS "Users can view forecast points" ON public."ForecastPoint";
CREATE POLICY "Admins can manage forecast points" ON public."ForecastPoint" FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view forecast points" ON public."ForecastPoint" FOR ALL USING (
    EXISTS (SELECT 1 FROM public."CongestionForecast" cf WHERE cf.id = "ForecastPoint"."forecastId" AND (cf."ownerId" = auth.uid()::text OR public.is_admin()))
);
