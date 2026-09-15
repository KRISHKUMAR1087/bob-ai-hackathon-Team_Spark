-- ==============================================================================
-- PortsPilot AI — Supabase Optional Seed Script (Sample Infrastructure & Data)
-- ==============================================================================

-- 1. Insert Initial Port Infrastructure (Berths B01–B06)
INSERT INTO public."Berth" (
    "id", "name", "lengthMeters", "depthMeters", "maxDraftMeters", "status",
    "currentUtilization", "predictedUtilization", "queueCount", "availableCranes", "maxCranes",
    "currentVesselId", "nextVesselId", "riskLevel"
) VALUES
('B01', 'North Container Terminal - Quay 1 (B01)', 400, 16.5, 15.5, 'Occupied', 88, 92, 2, 3, 4, 'VES-02', 'VES-03', 'MEDIUM'),
('B02', 'North Container Terminal - Quay 2 (B02)', 400, 16.5, 15.5, 'Occupied', 65, 74, 1, 4, 4, 'VES-04', 'VES-01', 'LOW'),
('B03', 'South Container Terminal - Quay 3 (B03)', 350, 15.0, 14.2, 'Available', 42, 55, 0, 3, 3, NULL, 'VES-06', 'LOW'),
('B04', 'Deepwater ULCV Berth (B04)', 450, 18.0, 17.0, 'Occupied', 94, 94, 4, 2, 5, 'VES-01', 'VES-05', 'HIGH'),
('B05', 'Feeder & Coastal Berth (B05)', 300, 13.5, 12.5, 'Occupied', 78, 82, 1, 2, 3, 'VES-03', NULL, 'LOW'),
('B06', 'Multipurpose & General Cargo Quay (B06)', 350, 14.0, 13.0, 'Maintenance', 0, 0, 0, 0, 2, NULL, NULL, 'LOW')
ON CONFLICT ("id") DO UPDATE SET
    "status" = EXCLUDED."status",
    "currentUtilization" = EXCLUDED."currentUtilization",
    "predictedUtilization" = EXCLUDED."predictedUtilization",
    "queueCount" = EXCLUDED."queueCount";

-- 2. Insert Initial Cranes (C01–C08)
INSERT INTO public."Crane" (
    "id", "name", "type", "status", "berthId", "movesPerHour", "utilizationPercent",
    "failureDurationHours", "impactSeverity", "assignedVesselId", "lastMaintenance", "nextMaintenance"
) VALUES
('C01', 'Megamax STS 01', 'STS', 'ACTIVE', 'B01', 34, 82, NULL, NULL, 'VES-02', '2026-08-15', '2026-09-30'),
('C02', 'Megamax STS 02', 'STS', 'ACTIVE', 'B01', 32, 79, NULL, NULL, 'VES-02', '2026-08-20', '2026-10-05'),
('C03', 'Megamax STS 03', 'STS', 'FAILED', 'B04', 0, 0, 8, 'Critical', 'VES-01', '2026-07-10', '2026-09-12'),
('C04', 'Megamax STS 04', 'STS', 'ACTIVE', 'B02', 36, 88, NULL, NULL, 'VES-04', '2026-08-28', '2026-10-15'),
('C05', 'Super Post-Panamax STS 05', 'STS', 'IDLE', 'B03', 28, 45, NULL, NULL, NULL, '2026-09-01', '2026-10-20'),
('C06', 'Super Post-Panamax STS 06', 'STS', 'ACTIVE', 'B02', 30, 72, NULL, NULL, 'VES-04', '2026-08-10', '2026-09-25'),
('C07', 'Panamax STS 07', 'STS', 'MAINTENANCE', 'B05', 0, 0, 12, 'Medium', NULL, '2026-09-14', '2026-09-16'),
('C08', 'Mobile Harbour Crane 08', 'Mobile', 'ACTIVE', 'B05', 22, 60, NULL, NULL, 'VES-03', '2026-08-01', '2026-09-22')
ON CONFLICT ("id") DO UPDATE SET
    "status" = EXCLUDED."status",
    "utilizationPercent" = EXCLUDED."utilizationPercent";

-- 3. Insert Initial Yard Blocks
INSERT INTO public."YardBlock" (
    "id", "name", "category", "totalTeu", "occupiedTeu", "utilizationPercent",
    "dwellTimeDays", "inboundTeu24h", "outboundTeu24h", "congestionRisk", "suggestedRedistribution"
) VALUES
('YB-A', 'Block Alpha (Dry Container Stack)', 'Dry', 4500, 3820, 84.8, 4.2, 620, 480, 'High', '{"targetBlockId":"YB-C","amountTeu":350,"rationale":"Divert non-priority dry containers to Block Gamma to avoid gate bottleneck."}'),
('YB-B', 'Block Bravo (Reefer Cold Chain)', 'Reefer', 1200, 940, 78.3, 2.8, 180, 210, 'Moderate', NULL),
('YB-C', 'Block Gamma (Overflow & Intermodal)', 'Dry', 5000, 2100, 42.0, 5.1, 310, 400, 'Normal', NULL),
('YB-D', 'Block Delta (Hazmat & IMO Special)', 'Hazmat', 800, 320, 40.0, 1.9, 45, 60, 'Normal', NULL)
ON CONFLICT ("id") DO UPDATE SET
    "occupiedTeu" = EXCLUDED."occupiedTeu",
    "utilizationPercent" = EXCLUDED."utilizationPercent";
