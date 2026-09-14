// ─────────────────────────────────────────────────────────────────────────────
// PortPulse — Prisma Seed Script
// Sub-Task 3: Database Seeding
//
// Run with:  npx ts-node prisma/seed.ts
//            (or via `npm run db:seed`)
//
// Idempotent: uses upsert on all top-level records.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPasswordHash = await bcrypt.hash('Admin@2026!', 10);
  const agentPasswordHash = await bcrypt.hash('Agent@2026!', 10);
  // ───────────────────────────────────────────────────────────────────────────
  // 1. Users
  // ───────────────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: 'demo-admin' },
    update: { password: adminPasswordHash },
    create: {
      id: 'demo-admin',
      name: 'Port Operations Admin',
      email: 'admin@portpulse.demo',
      password: adminPasswordHash,
      role: 'admin',
      authProvider: 'demo',
    },
  });

  await prisma.user.upsert({
    where: { id: 'demo-agent' },
    update: { password: agentPasswordHash },
    create: {
      id: 'demo-agent',
      name: 'Global Shipping Agent',
      email: 'agent@portpulse.demo',
      password: agentPasswordHash,
      role: 'ship_agent',
      authProvider: 'demo',
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Vessels + VesselTimelineEvents
  // Each vessel is upserted; its timeline events are deleted-and-recreated so
  // the seed is idempotent without needing stable IDs for child rows.
  // ───────────────────────────────────────────────────────────────────────────
  const vessels: Parameters<typeof prisma.vessel.upsert>[0]['create'][] = [
    {
      id: 'VES-01',
      name: 'Ocean Star',
      imo: '9845214',
      flag: 'Panama',
      lengthMeters: 399,
      draughtMeters: 16.2,
      teuCapacity: 21000,
      cargoVolume: 14500,
      origin: 'Rotterdam (NLRTM)',
      destination: 'Singapore (SGSIN)',
      eta: 'Today, 14:30 UTC',
      etd: 'Tomorrow, 18:00 UTC',
      status: 'Arriving',
      priority: 'Critical',
      currentBerth: null,
      assignedBerth: 'B04',
      predictedWaitHours: 11.4,
      demurrageRisk: 'High',
      historicalTurnaroundHours: 24.5,
      recommendedAction: 'Reassign to Berth B02 with 4 STS cranes to avert 4.6h demurrage wait.',
      ownerId: 'demo-agent',
      shippingCompany: 'Apex Maritime Agency',
      callSign: '3EFP7',
      vesselType: 'Container Ship (ULCV)',
      voyageNumber: 'APX-2026-09E',
      previousPort: 'Felixstowe (GBFXT)',
      nextPort: 'Port Klang (MYPKG)',
      requestedBerth: 'B04',
      requestedArrivalTime: '18 Sep, 18:30',
      berthDurationHours: 24,
      requestedCranes: 4,
      cargoType: 'Consumer Electronics & Industrial Parts',
      cargoQuantity: '1,463 TEU Discharged / 820 TEU Loaded',
      containersLoaded: 1240,
      containersTotal: 1463,
      dangerousGoods: true,
      specialNotes: 'IMO Class 3 Flammable Liquids in Bay 14; priority discharge requested.',
    },
    {
      id: 'VES-02',
      name: 'MSC Orion',
      imo: '9752188',
      flag: 'Liberia',
      lengthMeters: 366,
      draughtMeters: 15.4,
      teuCapacity: 16500,
      cargoVolume: 11800,
      origin: 'Shanghai (CNSHA)',
      destination: 'Hamburg (DEHAM)',
      eta: 'Today, 08:15 UTC',
      etd: 'Today, 22:30 UTC',
      status: 'Loading',
      priority: 'Priority',
      currentBerth: 'B01',
      assignedBerth: 'B01',
      predictedWaitHours: 1.2,
      demurrageRisk: 'Low',
      historicalTurnaroundHours: 21.2,
      recommendedAction: 'Maintain current 3-crane allocation; discharge on track.',
      ownerId: 'demo-agent',
      shippingCompany: 'Apex Maritime Agency',
      callSign: 'D5NZ8',
      vesselType: 'Container Ship (Neo-Panamax)',
      voyageNumber: 'MSC-8841W',
      previousPort: 'Ningbo (CNNGB)',
      nextPort: 'Rotterdam (NLRTM)',
      requestedBerth: 'B01',
      requestedArrivalTime: 'Today, 08:00',
      berthDurationHours: 14,
      requestedCranes: 3,
      cargoType: 'Machinery & Automotive Components',
      cargoQuantity: '980 TEU Discharged / 650 TEU Loaded',
      containersLoaded: 890,
      containersTotal: 980,
      dangerousGoods: false,
      specialNotes: 'Reefer monitoring active for Bay 06 (42 reefer plugs connected).',
    },
    {
      id: 'VES-03',
      name: 'Maersk Mc-Kinney',
      imo: '9619907',
      flag: 'Denmark',
      lengthMeters: 399,
      draughtMeters: 16.0,
      teuCapacity: 18270,
      cargoVolume: 13900,
      origin: 'Busan (KRPUS)',
      destination: 'Antwerp (BEANR)',
      eta: 'Today, 11:00 UTC',
      etd: 'Tomorrow, 14:00 UTC',
      status: 'Berthing',
      priority: 'Critical',
      currentBerth: 'B02',
      assignedBerth: 'B02',
      predictedWaitHours: 0.8,
      demurrageRisk: 'Low',
      historicalTurnaroundHours: 25.0,
      recommendedAction: 'Berthing in progress at B02. Assigned 4 STS cranes.',
    },
    {
      id: 'VES-04',
      name: 'Ever Radiant',
      imo: '9811002',
      flag: 'Taiwan',
      lengthMeters: 334,
      draughtMeters: 14.5,
      teuCapacity: 12000,
      cargoVolume: 8900,
      origin: 'Ningbo (CNNGB)',
      destination: 'Felixstowe (GBFXT)',
      eta: 'Tomorrow, 04:00 UTC',
      etd: 'Tomorrow, 23:45 UTC',
      status: 'At_Anchor',
      priority: 'Standard',
      currentBerth: null,
      assignedBerth: 'B03',
      predictedWaitHours: 4.5,
      demurrageRisk: 'Medium',
      historicalTurnaroundHours: 19.8,
      recommendedAction: 'Hold at outer anchorage until B03 maintenance and turnaround concludes.',
    },
    {
      id: 'VES-05',
      name: 'Pacific Voyager',
      imo: '9456781',
      flag: 'Marshall Islands',
      lengthMeters: 294,
      draughtMeters: 12.8,
      teuCapacity: 6500,
      cargoVolume: 4200,
      origin: 'Colombo (LKCMB)',
      destination: 'Jebel Ali (AEJEA)',
      eta: 'Tomorrow, 16:45 UTC',
      etd: '+2 Days, 09:00 UTC',
      status: 'Arriving',
      priority: 'Standard',
      currentBerth: null,
      assignedBerth: 'B05',
      predictedWaitHours: 8.2,
      demurrageRisk: 'Medium',
      historicalTurnaroundHours: 16.5,
      recommendedAction: 'Subject to 4-hour delay window under AI Recovery Plan if B04 emergency occurs.',
      ownerId: 'demo-agent',
      shippingCompany: 'Apex Maritime Agency',
      callSign: 'V7AB2',
      vesselType: 'Container Ship (Feedermax)',
      voyageNumber: 'PV-0419',
      previousPort: 'Mumbai (INBOM)',
      nextPort: 'Jebel Ali (AEJEA)',
      requestedBerth: 'B05',
      requestedArrivalTime: 'Tomorrow, 15:30',
      berthDurationHours: 18,
      requestedCranes: 2,
      cargoType: 'Agricultural Produce & Textiles',
      cargoQuantity: '540 TEU Discharged / 380 TEU Loaded',
      containersLoaded: 380,
      containersTotal: 540,
      dangerousGoods: false,
      specialNotes: 'Phytosanitary inspection clearance documents uploaded.',
    },
    {
      id: 'VES-06',
      name: 'CMA CGM Antoine',
      imo: '9722675',
      flag: 'France',
      lengthMeters: 396,
      draughtMeters: 15.8,
      teuCapacity: 20600,
      cargoVolume: 15200,
      origin: 'Tanjung Pelepas (MYTPP)',
      destination: 'Le Havre (FRLEH)',
      eta: '+2 Days, 06:00 UTC',
      etd: '+3 Days, 12:00 UTC',
      status: 'Arriving',
      priority: 'Priority',
      currentBerth: null,
      assignedBerth: 'B06',
      predictedWaitHours: 3.1,
      demurrageRisk: 'Low',
      historicalTurnaroundHours: 26.0,
      recommendedAction: 'Schedule 3 STS cranes on Shift 06-14 upon arrival.',
    },
    {
      id: 'VES-07',
      name: 'Hapag Express',
      imo: '9514782',
      flag: 'Germany',
      lengthMeters: 366,
      draughtMeters: 14.8,
      teuCapacity: 13200,
      cargoVolume: 9400,
      origin: 'Port Said (EGPSD)',
      destination: 'Tokyo (JPTYO)',
      eta: 'Today, 21:00 UTC (+6h delay)',
      etd: 'Tomorrow, 20:00 UTC',
      status: 'Delayed',
      priority: 'Priority',
      currentBerth: null,
      assignedBerth: 'B03',
      predictedWaitHours: 5.6,
      demurrageRisk: 'Medium',
      historicalTurnaroundHours: 22.4,
      recommendedAction: 'Weather squall delayed arrival. Re-slot behind Ever Radiant at B03.',
    },
    {
      id: 'VES-08',
      name: 'Cosco Glory',
      imo: '9465241',
      flag: 'Hong Kong',
      lengthMeters: 366,
      draughtMeters: 14.2,
      teuCapacity: 14000,
      cargoVolume: 10500,
      origin: 'Hong Kong (HKHKG)',
      destination: 'Rotterdam (NLRTM)',
      eta: 'Yesterday, 04:00 UTC',
      etd: 'Today, 06:00 UTC',
      status: 'Completed',
      priority: 'Standard',
      currentBerth: null,
      assignedBerth: 'B01',
      predictedWaitHours: 0,
      demurrageRisk: 'Low',
      historicalTurnaroundHours: 21.0,
      recommendedAction: 'Completed discharge of 10,500 TEU ahead of schedule by 1.8h.',
    },
  ];

  const vesselTimelineEvents: Record<
    string,
    Array<{ stage: string; time: string; status: string }>
  > = {
    'VES-01': [
      { stage: 'Pilot Station Entry', time: '13:45 UTC', status: 'completed' },
      { stage: 'Anchorage Waiting', time: '14:30 UTC', status: 'current' },
      { stage: 'Tug Mooring', time: '16:00 UTC', status: 'scheduled' },
      { stage: 'Discharge Ops', time: '17:30 UTC', status: 'scheduled' },
      { stage: 'Departure', time: 'Tomorrow 18:00 UTC', status: 'scheduled' },
    ],
    'VES-02': [
      { stage: 'Pilot Station Entry', time: '07:30 UTC', status: 'completed' },
      { stage: 'Berthing Confirmed', time: '08:15 UTC', status: 'completed' },
      { stage: 'Discharge Ops', time: '09:00 UTC', status: 'current' },
      { stage: 'Final Lashing', time: '21:00 UTC', status: 'scheduled' },
      { stage: 'Departure', time: '22:30 UTC', status: 'scheduled' },
    ],
    'VES-03': [
      { stage: 'Pilot Station Entry', time: '10:15 UTC', status: 'completed' },
      { stage: 'Tug Assistance', time: '11:00 UTC', status: 'current' },
      { stage: 'Crane Gang Setup', time: '12:00 UTC', status: 'scheduled' },
      { stage: 'Full Unloading', time: '13:00 UTC', status: 'scheduled' },
    ],
    'VES-04': [
      { stage: 'Outer Anchorage', time: '03:15 UTC', status: 'current' },
      { stage: 'Pilot Boarding', time: 'Tomorrow 04:00 UTC', status: 'scheduled' },
      { stage: 'Discharge Ops', time: 'Tomorrow 06:30 UTC', status: 'scheduled' },
    ],
    'VES-05': [
      { stage: 'Approaching Channel', time: '15:00 UTC', status: 'scheduled' },
      { stage: 'Berthing', time: 'Tomorrow 16:45 UTC', status: 'scheduled' },
    ],
    'VES-06': [
      { stage: 'En Route', time: 'In Transit', status: 'scheduled' },
    ],
    'VES-07': [
      { stage: 'Weather Slowdown', time: '11:00 UTC', status: 'completed' },
      { stage: 'Revised ETA', time: '21:00 UTC', status: 'scheduled' },
    ],
    'VES-08': [
      { stage: 'Departure', time: 'Today 06:00 UTC', status: 'completed' },
    ],
  };

  for (const vessel of vessels) {
    await prisma.vessel.upsert({
      where: { id: vessel.id },
      update: {},
      create: vessel,
    });
    // Delete and recreate timeline events (no stable child IDs)
    await prisma.vesselTimelineEvent.deleteMany({ where: { vesselId: vessel.id } });
    const events = vesselTimelineEvents[vessel.id] ?? [];
    if (events.length > 0) {
      await prisma.vesselTimelineEvent.createMany({
        data: events.map((e) => ({ ...e, vesselId: vessel.id })),
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Berths + BerthHourlyForecast
  // ───────────────────────────────────────────────────────────────────────────
  const berths: Array<
    Parameters<typeof prisma.berth.upsert>[0]['create'] & {
      hourlyForecast: Array<{ hour: string; utilization: number }>;
    }
  > = [
    {
      id: 'B01',
      name: 'Berth 01 (Deepwater North)',
      lengthMeters: 380,
      depthMeters: 16.5,
      maxDraftMeters: 16.0,
      status: 'Occupied',
      currentUtilization: 78,
      predictedUtilization: 76,
      queueCount: 1,
      availableCranes: 2,
      maxCranes: 4,
      currentVesselId: 'VES-02',
      nextVesselId: 'VES-08',
      riskLevel: 'LOW',
      hourlyForecast: [
        { hour: 'Now', utilization: 78 },
        { hour: '+6h', utilization: 75 },
        { hour: '+12h', utilization: 72 },
        { hour: '+24h', utilization: 76 },
        { hour: '+48h', utilization: 74 },
        { hour: '+72h', utilization: 70 },
      ],
    },
    {
      id: 'B02',
      name: 'Berth 02 (Deepwater Central)',
      lengthMeters: 400,
      depthMeters: 17.5,
      maxDraftMeters: 17.0,
      status: 'Available',
      currentUtilization: 61,
      predictedUtilization: 70,
      queueCount: 2,
      availableCranes: 4,
      maxCranes: 5,
      currentVesselId: 'VES-03',
      nextVesselId: null,
      riskLevel: 'LOW',
      hourlyForecast: [
        { hour: 'Now', utilization: 61 },
        { hour: '+6h', utilization: 65 },
        { hour: '+12h', utilization: 68 },
        { hour: '+24h', utilization: 70 },
        { hour: '+48h', utilization: 69 },
        { hour: '+72h', utilization: 66 },
      ],
    },
    {
      id: 'B03',
      name: 'Berth 03 (Feeder & Transshipment)',
      lengthMeters: 350,
      depthMeters: 15.5,
      maxDraftMeters: 15.0,
      status: 'Maintenance',
      currentUtilization: 69,
      predictedUtilization: 74,
      queueCount: 2,
      availableCranes: 1,
      maxCranes: 3,
      currentVesselId: null,
      nextVesselId: 'VES-04',
      riskLevel: 'MEDIUM',
      hourlyForecast: [
        { hour: 'Now', utilization: 69 },
        { hour: '+6h', utilization: 71 },
        { hour: '+12h', utilization: 73 },
        { hour: '+24h', utilization: 74 },
        { hour: '+48h', utilization: 72 },
        { hour: '+72h', utilization: 68 },
      ],
    },
    {
      id: 'B04',
      name: 'Berth 04 (Ultra-Large Container)',
      lengthMeters: 420,
      depthMeters: 18.0,
      maxDraftMeters: 17.5,
      status: 'Congested',
      currentUtilization: 82,
      predictedUtilization: 94,
      queueCount: 7,
      availableCranes: 1,
      maxCranes: 5,
      currentVesselId: null,
      nextVesselId: 'VES-01',
      riskLevel: 'HIGH',
      hourlyForecast: [
        { hour: 'Now', utilization: 82 },
        { hour: '+6h', utilization: 86 },
        { hour: '+12h', utilization: 89 },
        { hour: '+24h', utilization: 94 },
        { hour: '+48h', utilization: 88 },
        { hour: '+72h', utilization: 79 },
      ],
    },
    {
      id: 'B05',
      name: 'Berth 05 (South Terminal A)',
      lengthMeters: 340,
      depthMeters: 15.0,
      maxDraftMeters: 14.5,
      status: 'Available',
      currentUtilization: 58,
      predictedUtilization: 64,
      queueCount: 1,
      availableCranes: 2,
      maxCranes: 3,
      currentVesselId: null,
      nextVesselId: 'VES-05',
      riskLevel: 'LOW',
      hourlyForecast: [
        { hour: 'Now', utilization: 58 },
        { hour: '+6h', utilization: 60 },
        { hour: '+12h', utilization: 62 },
        { hour: '+24h', utilization: 64 },
        { hour: '+48h', utilization: 63 },
        { hour: '+72h', utilization: 59 },
      ],
    },
    {
      id: 'B06',
      name: 'Berth 06 (South Terminal B)',
      lengthMeters: 360,
      depthMeters: 15.5,
      maxDraftMeters: 15.0,
      status: 'Available',
      currentUtilization: 64,
      predictedUtilization: 68,
      queueCount: 1,
      availableCranes: 2,
      maxCranes: 3,
      currentVesselId: null,
      nextVesselId: 'VES-06',
      riskLevel: 'LOW',
      hourlyForecast: [
        { hour: 'Now', utilization: 64 },
        { hour: '+6h', utilization: 66 },
        { hour: '+12h', utilization: 67 },
        { hour: '+24h', utilization: 68 },
        { hour: '+48h', utilization: 65 },
        { hour: '+72h', utilization: 62 },
      ],
    },
  ];

  for (const { hourlyForecast, ...berthData } of berths) {
    await prisma.berth.upsert({
      where: { id: berthData.id },
      update: {},
      create: berthData,
    });
    await prisma.berthHourlyForecast.deleteMany({ where: { berthId: berthData.id } });
    if (hourlyForecast.length > 0) {
      await prisma.berthHourlyForecast.createMany({
        data: hourlyForecast.map((f) => ({ ...f, berthId: berthData.id })),
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Cranes
  // ───────────────────────────────────────────────────────────────────────────
  const cranes: Parameters<typeof prisma.crane.upsert>[0]['create'][] = [
    {
      id: 'C01',
      name: 'Super STS 01',
      type: 'STS',
      status: 'ACTIVE',
      berthId: 'B01',
      movesPerHour: 34,
      utilizationPercent: 84,
      assignedVesselId: 'VES-02',
      lastMaintenance: '2026-08-20',
      nextMaintenance: '2026-09-20',
    },
    {
      id: 'C02',
      name: 'Super STS 02',
      type: 'STS',
      status: 'ACTIVE',
      berthId: 'B01',
      movesPerHour: 31,
      utilizationPercent: 79,
      assignedVesselId: 'VES-02',
      lastMaintenance: '2026-08-22',
      nextMaintenance: '2026-09-22',
    },
    {
      id: 'C03',
      name: 'Megamax STS 03',
      type: 'STS',
      status: 'FAILED',
      berthId: 'B04',
      movesPerHour: 0,
      utilizationPercent: 0,
      failureDurationHours: 8,
      impactSeverity: 'High',
      assignedVesselId: null,
      lastMaintenance: '2026-07-15',
      nextMaintenance: 'IMMEDIATE REPAIR',
    },
    {
      id: 'C04',
      name: 'Super STS 04',
      type: 'STS',
      status: 'ACTIVE',
      berthId: 'B02',
      movesPerHour: 36,
      utilizationPercent: 88,
      assignedVesselId: 'VES-03',
      lastMaintenance: '2026-08-10',
      nextMaintenance: '2026-09-15',
    },
    {
      id: 'C05',
      name: 'Panamax STS 05',
      type: 'STS',
      status: 'IDLE',
      berthId: 'B05',
      movesPerHour: 28,
      utilizationPercent: 12,
      impactSeverity: 'Low',
      assignedVesselId: null,
      lastMaintenance: '2026-08-25',
      nextMaintenance: '2026-09-25',
    },
    {
      id: 'C06',
      name: 'Super STS 06',
      type: 'STS',
      status: 'ACTIVE',
      berthId: 'B02',
      movesPerHour: 33,
      utilizationPercent: 81,
      assignedVesselId: 'VES-03',
      lastMaintenance: '2026-08-18',
      nextMaintenance: '2026-09-18',
    },
    {
      id: 'C07',
      name: 'Post-Panamax STS 07',
      type: 'STS',
      status: 'MAINTENANCE',
      berthId: 'B03',
      movesPerHour: 0,
      utilizationPercent: 0,
      failureDurationHours: 4,
      impactSeverity: 'Medium',
      assignedVesselId: null,
      lastMaintenance: 'Today 06:00',
      nextMaintenance: 'Routine cable replacement',
    },
    {
      id: 'C08',
      name: 'Super STS 08',
      type: 'STS',
      status: 'ACTIVE',
      berthId: 'B06',
      movesPerHour: 29,
      utilizationPercent: 72,
      assignedVesselId: null,
      lastMaintenance: '2026-08-14',
      nextMaintenance: '2026-09-14',
    },
  ];

  for (const crane of cranes) {
    await prisma.crane.upsert({
      where: { id: crane.id },
      update: {},
      create: crane,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. BerthCraneAssignment (junction)
  //    Derived from Berth.assignedCraneIds in mockData.ts
  // ───────────────────────────────────────────────────────────────────────────
  const berthCraneAssignments: Array<{ berthId: string; craneId: string }> = [
    { berthId: 'B01', craneId: 'C01' },
    { berthId: 'B01', craneId: 'C02' },
    { berthId: 'B02', craneId: 'C04' },
    { berthId: 'B02', craneId: 'C06' },
    { berthId: 'B03', craneId: 'C07' },
    { berthId: 'B04', craneId: 'C03' },
    { berthId: 'B05', craneId: 'C05' },
    { berthId: 'B06', craneId: 'C08' },
  ];

  for (const assignment of berthCraneAssignments) {
    await prisma.berthCraneAssignment.upsert({
      where: { berthId_craneId: assignment },
      update: {},
      create: assignment,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. YardBlocks
  // ───────────────────────────────────────────────────────────────────────────
  const yardBlocks: Parameters<typeof prisma.yardBlock.upsert>[0]['create'][] = [
    {
      id: 'CY-01',
      name: 'Container Yard 01 (North Export)',
      category: 'Dry',
      totalTeu: 14000,
      occupiedTeu: 10080,
      utilizationPercent: 72,
      dwellTimeDays: 3.4,
      inboundTeu24h: 1850,
      outboundTeu24h: 2100,
      congestionRisk: 'Moderate',
      suggestedRedistribution: null,
    },
    {
      id: 'CY-02',
      name: 'Container Yard 02 (Central Transshipment)',
      category: 'Dry',
      totalTeu: 16000,
      occupiedTeu: 10400,
      utilizationPercent: 65,
      dwellTimeDays: 2.8,
      inboundTeu24h: 2200,
      outboundTeu24h: 2400,
      congestionRisk: 'Normal',
      suggestedRedistribution: null,
    },
    {
      id: 'CY-03',
      name: 'Container Yard 03 (Cold Chain & Reefer)',
      category: 'Reefer',
      totalTeu: 8500,
      occupiedTeu: 7480,
      utilizationPercent: 88,
      dwellTimeDays: 4.6,
      inboundTeu24h: 1450,
      outboundTeu24h: 980,
      congestionRisk: 'High',
      suggestedRedistribution: JSON.stringify({
        targetBlockId: 'CY-04',
        amountTeu: 650,
        rationale:
          'Reefer plug occupancy nearing 92%. Transfer auxiliary dry plugs to CY-04 buffer.',
      }),
    },
    {
      id: 'CY-04',
      name: 'Container Yard 04 (South Overflow & Hazmat)',
      category: 'Hazmat',
      totalTeu: 12000,
      occupiedTeu: 6120,
      utilizationPercent: 51,
      dwellTimeDays: 3.1,
      inboundTeu24h: 900,
      outboundTeu24h: 1150,
      congestionRisk: 'Normal',
      suggestedRedistribution: null,
    },
  ];

  for (const block of yardBlocks) {
    await prisma.yardBlock.upsert({
      where: { id: block.id },
      update: {},
      create: block,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. CongestionForecast + ForecastDrivers + ForecastPoints
  //    Delete-and-recreate the single forecast record for idempotency.
  // ───────────────────────────────────────────────────────────────────────────
  const FORECAST_ID = 'forecast-24h-main';

  await prisma.forecastPoint.deleteMany({ where: { forecastId: FORECAST_ID } });
  await prisma.forecastDriver.deleteMany({ where: { forecastId: FORECAST_ID } });
  await prisma.congestionForecast.deleteMany({ where: { id: FORECAST_ID } });

  await prisma.congestionForecast.create({
    data: {
      id: FORECAST_ID,
      timeHorizon: '24h',
      overallCongestionPercent: 74,
      riskBottleneckBerth: 'B04',
      bottleneckConfidence: 91,
      drivers: {
        create: [
          {
            factor: 'Vessel Arrivals Surge',
            percentage: 38,
            impact: 'High',
            detail: '3 ULCVs entering within a 6-hour window creates arrival bunching.',
          },
          {
            factor: 'Berth Utilization Baseline',
            percentage: 27,
            impact: 'High',
            detail: 'B04 continuously operated at >80% capacity over previous 48 hours.',
          },
          {
            factor: 'Crane Shortage / C03 Fault',
            percentage: 18,
            impact: 'High',
            detail: 'STS C03 hoist inverter fault cuts crane density from 4 to 2.',
          },
          {
            factor: 'Yard Pressure (CY-03 Reefer)',
            percentage: 11,
            impact: 'Medium',
            detail: 'High dwell time on incoming refrigerated units delays dock-to-yard haulage.',
          },
          {
            factor: 'Historical Day-of-Week Pattern',
            percentage: 6,
            impact: 'Low',
            detail: 'Mid-week feeder arrivals consistently add 1.2h variance to cycle time.',
          },
        ],
      },
      points: {
        create: [
          { hour: 'Now',  berthData: JSON.stringify({ B01: 78, B02: 61, B03: 69, B04: 82, B05: 58, B06: 64 }), threshold: 85 },
          { hour: '+6h',  berthData: JSON.stringify({ B01: 75, B02: 65, B03: 71, B04: 86, B05: 60, B06: 66 }), threshold: 85 },
          { hour: '+12h', berthData: JSON.stringify({ B01: 72, B02: 68, B03: 73, B04: 89, B05: 62, B06: 67 }), threshold: 85 },
          { hour: '+18h', berthData: JSON.stringify({ B01: 74, B02: 69, B03: 72, B04: 92, B05: 63, B06: 68 }), threshold: 85 },
          { hour: '+24h', berthData: JSON.stringify({ B01: 76, B02: 70, B03: 74, B04: 94, B05: 64, B06: 68 }), threshold: 85 },
          { hour: '+36h', berthData: JSON.stringify({ B01: 75, B02: 71, B03: 73, B04: 91, B05: 64, B06: 67 }), threshold: 85 },
          { hour: '+48h', berthData: JSON.stringify({ B01: 74, B02: 69, B03: 72, B04: 88, B05: 63, B06: 65 }), threshold: 85 },
          { hour: '+72h', berthData: JSON.stringify({ B01: 70, B02: 66, B03: 68, B04: 79, B05: 59, B06: 62 }), threshold: 85 },
        ],
      },
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 8. OptimizationResult
  // ───────────────────────────────────────────────────────────────────────────
  await prisma.optimizationResult.upsert({
    where: { id: 'OPT-2026-0914-01' },
    update: {},
    create: {
      id: 'OPT-2026-0914-01',
      timestamp: 'Just now',
      isApplied: false,
      targetVesselId: 'VES-01',
      currentPlan: JSON.stringify({
        vesselId: 'VES-01',
        vesselName: 'Ocean Star',
        berthId: 'B04',
        cranesAssigned: 3,
        expectedWaitHours: 11.4,
        berthUtilizationPercent: 94,
      }), optimizedPlan: JSON.stringify({
        vesselId: 'VES-01',
        vesselName: 'Ocean Star',
        berthId: 'B02',
        cranesAssigned: 4,
        expectedWaitHours: 6.8,
        berthUtilizationPercent: 72,
      }), waitTimeDeltaHours: -4.6,
      waitTimeReductionPercent: 40.3,
      queueReductionCount: 3,
      savingsEstimateUsd: 148000,
      rationale:
        'Reassigning Ocean Star to Berth B02 unlocks 4 operational Super STS cranes, bypassing the C03 failure bottleneck at B04. This cuts vessel turnaround wait by 4.6 hours and prevents demurrage penalties.',
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 9. SimulationResult
  // ───────────────────────────────────────────────────────────────────────────
  await prisma.simulationResult.upsert({
    where: { id: 'SIM-C03-FAIL' },
    update: {},
    create: {
      id: 'SIM-C03-FAIL',
      scenario: JSON.stringify({
        id: 'SCEN-01',
        type: 'crane_failure',
        targetEntityId: 'C03',
        targetEntityName: 'Megamax STS 03 (Berth B04)',
        durationHours: 8,
        description:
          'Complete drive electronics fault on C03 removing primary high-speed hoist capacity at Berth B04.',
      }), before: JSON.stringify({
        queueCount: 7,
        avgWaitHours: 11.4,
        berthUtilizationPercent: 82,
      }), after: JSON.stringify({
        queueCount: 11,
        avgWaitHours: 17.8,
        berthUtilizationPercent: 94,
      }), recoveryPlan: JSON.stringify({
        id: 'REC-C03-01',
        isApplied: false,
        expectedRecoveryHours: 5.2,
        steps: [
          {
            order: 1,
            title: 'Move C05 to Berth B04',
            detail:
              'Redeploy idle Panamax STS C05 from Berth B05 to reinforce Berth B04 crane gang within 45 minutes.',
            targetEntity: 'Crane C05',
          },
          {
            order: 2,
            title: 'Reassign Ocean Star to Berth B02',
            detail:
              'Divert approaching ULCV Ocean Star to B02 to utilize high-throughput active STS cranes C04 and C06.',
            targetEntity: 'Vessel Ocean Star',
          },
          {
            order: 3,
            title: 'Delay low-priority vessel Pacific Voyager',
            detail:
              'Reschedule Pacific Voyager ETA window by +4.0 hours to level peak gate and quay arrival pressure.',
            targetEntity: 'Vessel Pacific Voyager',
          },
        ],
      }),
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 10. RouteOptions
  //     No stable ID in mockData — delete-and-recreate for idempotency.
  // ───────────────────────────────────────────────────────────────────────────
  await prisma.routeOption.deleteMany();
  await prisma.routeOption.createMany({
    data: [
      {
        portCode: 'PORT-A',
        portName: 'Rotterdam Hub (Current Route)',
        country: 'Netherlands',
        distanceNm: 420,
        eta: 'Today, 14:30 UTC',
        delayHours: 31,
        extraCostUsd: 100000,
        riskLevel: 'Critical',
        isRecommended: false,
        congestionScore: 92,
        rationale:
          'Severe berth bottleneck (B04 at 94%) and yard overflow cause 31h projected demurrage delay.',
        coordinates: JSON.stringify({ x: 180, y: 140 }),
      },
      {
        portCode: 'PORT-B',
        portName: 'Antwerp Gateway (Recommended Alternate)',
        country: 'Belgium',
        distanceNm: 465,
        eta: 'Tomorrow, 03:00 UTC',
        delayHours: 18,
        extraCostUsd: 110000,
        riskLevel: 'Medium',
        isRecommended: true,
        congestionScore: 54,
        rationale:
          '+$10k bunker cost offset by -13h turnaround savings and 4 active deepwater berths available immediately.',
        coordinates: JSON.stringify({ x: 320, y: 190 }),
      },
      {
        portCode: 'PORT-C',
        portName: 'Zeebrugge Deepwater (Contingency)',
        country: 'Belgium',
        distanceNm: 410,
        eta: 'Today, 22:00 UTC',
        delayHours: 23,
        extraCostUsd: 96000,
        riskLevel: 'High',
        isRecommended: false,
        congestionScore: 78,
        rationale:
          'Lower fuel expense, but intermodal rail capacity at Zeebrugge currently restricted by maintenance window.',
        coordinates: JSON.stringify({ x: 440, y: 260 }),
      },
    ],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 11. ShiftPlanItems
  // ───────────────────────────────────────────────────────────────────────────
  const shiftPlanItems: Parameters<typeof prisma.shiftPlanItem.upsert>[0]['create'][] = [
    { id: 'SP-01', dayOffset: 0, shift: '06-14', berthId: 'B01', vesselId: 'VES-02', vesselName: 'MSC Orion', assignedCranes: JSON.stringify(['C01', 'C02']), status: 'Scheduled' },
    { id: 'SP-02', dayOffset: 0, shift: '14-22', berthId: 'B01', vesselId: 'VES-02', vesselName: 'MSC Orion', assignedCranes: JSON.stringify(['C01', 'C02']), status: 'Scheduled' },
    { id: 'SP-03', dayOffset: 0, shift: '22-06', berthId: 'B01', vesselId: 'VES-08', vesselName: 'Cosco Glory (Turnaround)', assignedCranes: JSON.stringify(['C01']), status: 'Scheduled' },
    { id: 'SP-04', dayOffset: 0, shift: '06-14', berthId: 'B02', vesselId: 'VES-03', vesselName: 'Maersk Mc-Kinney', assignedCranes: JSON.stringify(['C04', 'C06']), status: 'Scheduled' },
    { id: 'SP-05', dayOffset: 0, shift: '14-22', berthId: 'B02', vesselId: 'VES-03', vesselName: 'Maersk Mc-Kinney', assignedCranes: JSON.stringify(['C04', 'C06']), status: 'Scheduled' },
    { id: 'SP-06', dayOffset: 0, shift: '22-06', berthId: 'B02', vesselId: null, vesselName: 'Buffer Window', assignedCranes: JSON.stringify([]), status: 'Scheduled' },
    { id: 'SP-07', dayOffset: 0, shift: '06-14', berthId: 'B04', vesselId: null, vesselName: 'Turnaround Prep', assignedCranes: JSON.stringify([]), status: 'Scheduled' },
    { id: 'SP-08', dayOffset: 0, shift: '14-22', berthId: 'B04', vesselId: 'VES-01', vesselName: 'Ocean Star', assignedCranes: JSON.stringify(['C03']), status: 'Conflict', conflictReason: 'Crane C03 is FAILED (8h) while Ocean Star requires 3+ STS cranes.' },
    { id: 'SP-09', dayOffset: 0, shift: '22-06', berthId: 'B04', vesselId: 'VES-01', vesselName: 'Ocean Star', assignedCranes: JSON.stringify(['C03']), status: 'Conflict', conflictReason: 'Bottleneck overflow extends into Night Shift.' },
    { id: 'SP-10', dayOffset: 1, shift: '06-14', berthId: 'B03', vesselId: 'VES-04', vesselName: 'Ever Radiant', assignedCranes: JSON.stringify(['C07']), status: 'Scheduled' },
    { id: 'SP-11', dayOffset: 1, shift: '14-22', berthId: 'B03', vesselId: 'VES-07', vesselName: 'Hapag Express', assignedCranes: JSON.stringify(['C07']), status: 'Conflict', conflictReason: 'Delayed ETA overlap with Ever Radiant discharge.' },
    { id: 'SP-12', dayOffset: 1, shift: '22-06', berthId: 'B03', vesselId: 'VES-07', vesselName: 'Hapag Express', assignedCranes: JSON.stringify(['C07']), status: 'Scheduled' },
    { id: 'SP-13', dayOffset: 1, shift: '06-14', berthId: 'B05', vesselId: null, vesselName: 'Available Capacity', assignedCranes: JSON.stringify(['C05']), status: 'Scheduled' },
    { id: 'SP-14', dayOffset: 1, shift: '14-22', berthId: 'B05', vesselId: 'VES-05', vesselName: 'Pacific Voyager', assignedCranes: JSON.stringify(['C05']), status: 'Scheduled' },
    { id: 'SP-15', dayOffset: 2, shift: '06-14', berthId: 'B06', vesselId: 'VES-06', vesselName: 'CMA CGM Antoine', assignedCranes: JSON.stringify(['C08']), status: 'Scheduled' },
  ];

  for (const item of shiftPlanItems) {
    await prisma.shiftPlanItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 12. OperationalAlerts
  // ───────────────────────────────────────────────────────────────────────────
  const alerts: Parameters<typeof prisma.operationalAlert.upsert>[0]['create'][] = [
    {
      id: 'ALT-01',
      timestamp: '12 mins ago',
      severity: 'CRITICAL',
      title: 'Crane C03 Inverter Fault Offline',
      description:
        'Megamax STS 03 at Berth B04 suffered main hoist drive electronics trip. Estimated repair window: 8 hours.',
      relatedEntity: JSON.stringify({ type: 'crane', id: 'C03', name: 'Megamax STS 03' }), isResolved: false,
      actionRoute: '/decision/simulator',
      actionLabel: 'Simulate Impact',
    },
    {
      id: 'ALT-02',
      timestamp: '28 mins ago',
      severity: 'HIGH',
      title: 'B04 Projected >90% Utilization',
      description:
        'ML model projects Berth B04 utilization climbing to 94% within 24h due to arrival bunching and crane deficit.',
      relatedEntity: JSON.stringify({ type: 'berth', id: 'B04', name: 'Berth 04' }), isResolved: false,
      actionRoute: '/decision/optimizer',
      actionLabel: 'Optimize Berth',
    },
    {
      id: 'ALT-03',
      timestamp: '45 mins ago',
      severity: 'MEDIUM',
      title: 'CY-03 Cold Chain Capacity at 88%',
      description:
        'Reefer yard CY-03 is approaching operational saturation (7,480 / 8,500 TEU). Redistribution recommended.',
      relatedEntity: JSON.stringify({ type: 'yard', id: 'CY-03', name: 'Yard Block CY-03' }), isResolved: false,
      actionRoute: '/operations/yard',
      actionLabel: 'View Block',
    },
    {
      id: 'ALT-04',
      timestamp: '1 hour ago',
      severity: 'INFO',
      title: 'Ocean Star Coastal Squall Advisory',
      description:
        'Ocean Star ETA updated +45m due to adverse tidal squall in approach channel. New ETA: 14:30 UTC.',
      relatedEntity: JSON.stringify({ type: 'vessel', id: 'VES-01', name: 'Ocean Star' }), isResolved: false,
      actionRoute: '/operations/vessels/VES-01',
      actionLabel: 'View Vessel',
    },
  ];

  for (const alert of alerts) {
    await prisma.operationalAlert.upsert({
      where: { id: alert.id },
      update: {},
      create: alert,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 13. BerthRequests
  // ───────────────────────────────────────────────────────────────────────────
  const berthRequests: Parameters<typeof prisma.berthRequest.upsert>[0]['create'][] = [
    {
      id: 'BR-01',
      vesselId: 'VES-01',
      vesselName: 'Ocean Star',
      imo: '9845214',
      requestedBerth: 'B04',
      requestedArrivalTime: 'Today, 14:30 UTC',
      estimatedDurationHours: 24,
      requestedCranes: 4,
      cargoType: 'ULCV Containers (1,463 TEU)',
      status: 'Pending',
      submittedAt: '2 hours ago',
      notes: 'Priority discharge required for Bay 14 IMO Class 3 cargo.',
      ownerId: 'demo-agent',
    },
    {
      id: 'BR-02',
      vesselId: 'VES-05',
      vesselName: 'Pacific Voyager',
      imo: '9456781',
      requestedBerth: 'B05',
      requestedArrivalTime: 'Tomorrow, 15:30 UTC',
      estimatedDurationHours: 18,
      requestedCranes: 2,
      cargoType: 'Regional Feeder (540 TEU)',
      status: 'Under_Review',
      submittedAt: '5 hours ago',
      notes: 'Tide draft window verified with port hydrography.',
      ownerId: 'demo-agent',
    },
    {
      id: 'BR-03',
      vesselId: 'VES-02',
      vesselName: 'MSC Orion',
      imo: '9752188',
      requestedBerth: 'B01',
      requestedArrivalTime: 'Today, 08:00 UTC',
      estimatedDurationHours: 14,
      requestedCranes: 3,
      cargoType: 'Machinery & Reefers (980 TEU)',
      status: 'Approved',
      submittedAt: '12 hours ago',
      reviewedAt: '10 hours ago',
      assignedBerth: 'B01',
      notes: 'Confirmed 3 STS cranes and 42 reefer power plugs.',
      ownerId: 'demo-agent',
    },
  ];

  for (const req of berthRequests) {
    await prisma.berthRequest.upsert({
      where: { id: req.id },
      update: {},
      create: req,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 14. ShippingDocuments
  //     mockData.ts has 6 documents (DOC-01 through DOC-06); seed all of them.
  // ───────────────────────────────────────────────────────────────────────────
  const shippingDocuments: Parameters<typeof prisma.shippingDocument.upsert>[0]['create'][] = [
    {
      id: 'DOC-01',
      name: 'Bill of Lading - APX-2026-09E',
      vesselId: 'VES-01',
      vesselName: 'Ocean Star',
      type: 'Bill of Lading',
      status: 'Approved',
      uploadedDate: '17 Sep 2026, 14:20',
      fileSize: '2.4 MB',
      ownerId: 'demo-agent',
    },
    {
      id: 'DOC-02',
      name: 'Inward Cargo Manifest (Final)',
      vesselId: 'VES-01',
      vesselName: 'Ocean Star',
      type: 'Cargo Manifest',
      status: 'Approved',
      uploadedDate: '17 Sep 2026, 16:45',
      fileSize: '4.1 MB',
      ownerId: 'demo-agent',
    },
    {
      id: 'DOC-03',
      name: 'Dangerous Goods Declaration (IMO 3)',
      vesselId: 'VES-01',
      vesselName: 'Ocean Star',
      type: 'Dangerous Goods Declaration',
      status: 'Under Review',
      uploadedDate: '18 Sep 2026, 09:15',
      fileSize: '1.2 MB',
      ownerId: 'demo-agent',
    },
    {
      id: 'DOC-04',
      name: 'General Vessel Declaration (FAL 1)',
      vesselId: 'VES-02',
      vesselName: 'MSC Orion',
      type: 'Vessel Declaration',
      status: 'Approved',
      uploadedDate: '18 Sep 2026, 06:30',
      fileSize: '850 KB',
      ownerId: 'demo-agent',
    },
    {
      id: 'DOC-05',
      name: 'Phytosanitary & Customs Clearance',
      vesselId: 'VES-05',
      vesselName: 'Pacific Voyager',
      type: 'Customs Clearance',
      status: 'Approved',
      uploadedDate: '17 Sep 2026, 18:00',
      fileSize: '1.8 MB',
      ownerId: 'demo-agent',
    },
    {
      id: 'DOC-06',
      name: 'Advance Arrival Notice (72h)',
      vesselId: 'VES-05',
      vesselName: 'Pacific Voyager',
      type: 'Arrival Notice',
      status: 'Required',
      uploadedDate: 'Pending Upload',
      fileSize: '—',
      ownerId: 'demo-agent',
    },
  ];

  for (const doc of shippingDocuments) {
    await prisma.shippingDocument.upsert({
      where: { id: doc.id },
      update: {},
      create: doc,
    });
  }

  console.log('✅  Seed complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
