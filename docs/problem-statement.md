# Problem Statement: Logistics & Ports L1 Container Congestion Predictor & Port Operations Optimiser

## Background

Maritime container shipping is the backbone of global commerce, transporting over 80% of world trade volume. Modern mega-container vessels (carrying up to 24,000 TEUs) operate on precision international schedules. However, global ports act as critical choke points where quayside berths, Ship-to-Shore (STS) gantry cranes, container yard stacks, and stevedore shift workforces converge under high volatility.

When disruptions occur — whether weather delays, crane mechanical failures, tidal restrictions, or unexpected vessel bunching — the cascading delays ripple across global supply chains within days. The 2021 Los Angeles & Long Beach port crisis demonstrated the catastrophic vulnerability of this ecosystem: over **100 container vessels waited offshore for weeks**, tying up tens of billions of dollars in cargo and inflicting an estimated **$10B+ in economic damages** on global supply chains.

## The Problem

Today, port terminal operators, harbor masters, and berth planners still coordinate multi-million-dollar maritime assets manually using fragmented spreadsheets, phone calls, and static VHF radio check-ins. 

The core operational failure is **reactive bottleneck discovery**:
1. **No Predictive Foresight**: Congestion hotspots are identified reactively — only after container vessels are already anchored in the roadstead or queueing offshore.
2. **Sub-optimal Berth & Crane Allocation**: Terminal managers attempt to solve the NP-hard Berth Allocation Problem (BAP) and Crane Assignment Problem (CAP) mentally or on static whiteboards, ignoring dynamic vessel draught, LOA (length overall), and crane density limits.
3. **Delayed Alternate Routing**: Diverting inbound vessels to regional alternative ports (e.g., Rotterdam vs. Antwerp vs. Zeebrugge) requires evaluating complex trade-offs (nautical mileage, bunker fuel consumption, demurrage penalties, and downstream terminal wait times). In manual workflows, diversion decisions are made too late, when vessels have already committed to congested sea lanes.
4. **Shift Scheduling Friction**: Stevedore gang assignments across 8-hour shift cycles (06:00-14:00, 14:00-22:00, 22:00-06:00) fail to dynamically synchronize with unexpected vessel berthing delays, causing costly crane idle times or stevedore gang shortages.

## Who is Affected

- **Port Terminal Operations Supervisors & Shift Managers**: Stressed by sudden queue surges, equipment breakdowns, and constant manual rescheduling across hundreds of vessel calls.
- **Harbor Masters & Vessel Traffic Services (VTS)**: Responsible for fairway safety, anchorage management, and pilotage coordination without forward-looking bottleneck visibility.
- **Shipping Lines & Ocean Carriers**: Penalized with astronomical demurrage charges ($25,000 – $75,000/day per vessel) when ships are trapped waiting at anchor.
- **Supply Chain & Cargo Owners (BCOs)**: Importers and exporters experiencing container dwell time inflation, lost production cycles, and stockouts.

## Why It Matters

- **Financial Impact**: A single 12-hour reduction in vessel port turnaround across a major terminal saves ocean carriers and cargo owners tens of millions of dollars annually in avoided demurrage and fuel burn.
- **Decarbonization & Emissions**: Idling container ships running auxiliary diesel generators at anchor emit thousands of metric tons of CO2, SOx, and particulate matter close to coastal cities. Proactive berth scheduling and speed optimization eliminate anchorage idling.
- **Supply Chain Resilience**: Proactive alternate routing turns localized port disruptions into manageable re-routings before regional logistics corridors freeze.

## Why Existing Solutions Fall Short

- **Legacy Terminal Operating Systems (TOS)** (e.g., Navis, Tideworks): Designed primarily as historical transaction databases and inventory trackers; they lack real-time predictive queuing engines and what-if simulation sandboxes.
- **Manual Spreadsheet Matrices**: Prone to human error, impossible to optimize across combinatorial constraints, and incapable of ingesting real-time AIS telemetry.
- **Siloed Communication**: Shipping agents, stevedore unions, and port authorities operate across disconnected channels without a unified, AI-assisted decision intelligence interface.
