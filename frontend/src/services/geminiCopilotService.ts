import { CopilotMessage } from '../types/operations';

export interface CopilotContext {
  isOptimizationApplied: boolean;
  isRecoveryPlanApplied: boolean;
  oceanStarBerth: string;
  b04Utilization: number;
  c03Status: string;
  activeAlertsCount: number;
}

export class GeminiCopilotService {
  async processUserQuery(
    userQuery: string,
    context: CopilotContext
  ): Promise<CopilotMessage> {
    const query = userQuery.toLowerCase().trim();

    // Small realistic delay (350ms - 600ms) simulating high-speed edge reasoning, not endless fake typing
    await new Promise(resolve => setTimeout(resolve, 450));

    // Case 1: Why will B04 become congested?
    if (query.includes('b04') && (query.includes('congest') || query.includes('risk') || query.includes('why'))) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: `**Berth B04 is projected to reach 94% utilization within 24 hours** (current baseline is 82%).

### Key Root-Cause Drivers:
1. **Vessel Arrivals Surge (38%)**: 3 Ultra-Large Container Vessels (ULCVs) entering within a 6-hour tidal window.
2. **Berth Utilization Baseline (27%)**: Continuous operation above 80% with minimal buffer over the last 48h.
3. **Crane Shortage / C03 Fault (18%)**: STS C03 inverter electronics fault reducing operational crane density.
4. **Yard Haulage Pressure (11%)**: CY-03 cold-chain dwell time delaying quayside discharge clearing.
5. **Historical Pattern Variance (6%)**: Mid-week transshipment cycle variance.

${context.isOptimizationApplied 
  ? `> **Active Mitigation:** Ocean Star has been diverted to Berth B02. Current B04 congestion projection is reduced to 78%.`
  : `> **Recommendation:** Execute automated berth re-optimization to reroute **Ocean Star** to B02 and reallocate crane resources.`}
`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        toolCalls: [
          { toolName: 'getCongestionForecast', parameters: { berth: 'B04', horizon: '24h' }, resultSummary: 'Forecast: 94% utilization, 91% confidence' },
          { toolName: 'getBerthStatus', parameters: { berthId: 'B04' }, resultSummary: 'Queue: 7 vessels, Available cranes: 1/5' },
        ],
        suggestedActions: [
          { label: 'Optimize B04 Operations', actionRoute: '/decision/optimizer' },
          { label: 'Simulate Crane Failure', actionRoute: '/decision/simulator' },
          { label: 'Compare Alternate Ports', actionRoute: '/intelligence/routes' },
        ],
      };
    }

    // Case 2: What happens if C03 fails?
    if (query.includes('c03') || (query.includes('crane') && query.includes('fail'))) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: `Simulating an **8-hour failure of Megamax STS Crane C03** at Berth B04:

* **Quayside Queue:** Increases from **7 → 11 vessels** (+57% backlog).
* **Average Vessel Wait Time:** Escalates from **11.4h → 17.8h** (+6.4 hours demurrage delay).
* **Berth Utilization:** Spikes to **94%**, entering critical saturation.

### AI Recovery Protocol:
1. **Redeploy Crane C05**: Transfer idle Panamax STS C05 from Berth B05 to B04 within 45 minutes.
2. **Reassign Ocean Star**: Divert ULCV Ocean Star to Berth B02 with 4 operational STS cranes.
3. **Buffer Low-Priority Feeder**: Postpone *Pacific Voyager* berthing window by 4.0h to balance dock traffic.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        toolCalls: [
          { toolName: 'runSimulation', parameters: { scenario: 'crane_failure', craneId: 'C03', durationHours: 8 }, resultSummary: 'Queue +4 vessels, Wait +6.4h' },
        ],
        suggestedActions: [
          { label: 'Open What-If Simulator', actionRoute: '/decision/simulator' },
          { label: 'Apply Recovery Plan', actionRoute: '/decision/simulator' },
          { label: 'View Cranes Status', actionRoute: '/operations/cranes' },
        ],
      };
    }

    // Case 3: What changed after the recovery plan?
    if (query.includes('recovery') || query.includes('what changed') || query.includes('impact of')) {
      if (context.isRecoveryPlanApplied) {
        return {
          id: 'msg-' + Date.now(),
          sender: 'gemini',
          text: `### Recovery Plan Execution Impact Summary:

1. **Berth Congestion Mitigated**: Ocean Star is routed to **Berth B02**, reducing B04 pressure from 94% down to 78%.
2. **Crane Gang Rebalancing**: STS C05 was repositioned to B04, restoring total berth throughput to 68 moves/hr.
3. **Queue & Demurrage Controlled**: Average vessel wait projected at **6.8 hours** instead of escalating to **17.8 hours** (net savings of **11.0 hours**).
4. **Schedule Conflicts Cleared**: 3 operational shift clashes in the 72-Hour Planner have been resolved into scheduled windows.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
          toolCalls: [
            { toolName: 'getSystemStatus', parameters: {}, resultSummary: 'Recovery state active: B02 handling Ocean Star, C05 redeployed' },
          ],
          suggestedActions: [
            { label: 'View 72-Hour Planner', actionRoute: '/decision/planner' },
            { label: 'Inspect Operations Board', actionRoute: '/operations' },
          ],
        };
      } else {
        return {
          id: 'msg-' + Date.now(),
          sender: 'gemini',
          text: `The AI Recovery Plan has **not been executed yet**. 
          
Currently, Crane C03 remains in a failed state at B04, leaving expected queue delay at **11.4h – 17.8h**. Would you like to review and apply the 3-step recovery plan now?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
          suggestedActions: [
            { label: 'Open Simulator & Apply Plan', actionRoute: '/decision/simulator' },
          ],
        };
      }
    }

    // Case 4: Why was Ocean Star moved?
    if (query.includes('ocean star') || query.includes('why was ocean star moved')) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: `**Ocean Star** (21,000 TEU, Critical Priority) was reassigned from **Berth B04 to Berth B02**.

### Operational Rationale:
- **Crane Density**: Berth B04 lost STS C03 to an electronics trip, dropping available cranes to 2. Berth B02 has **4 operational Super STS cranes (C04, C06 + reserves)** ready.
- **Turnaround Acceleration**: Expected waiting time drops from **11.4 hours → 6.8 hours** (**-4.6 hours, 40.3% faster turnaround**).
- **Financial Avoidance**: Prevents an estimated **$148,000 USD** in carrier demurrage and schedule slippage.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        toolCalls: [
          { toolName: 'getVesselDetails', parameters: { vesselId: 'VES-01' }, resultSummary: 'Ocean Star assigned to ' + context.oceanStarBerth },
          { toolName: 'runOptimization', parameters: { vesselId: 'VES-01' }, resultSummary: 'Wait time delta: -4.6h' },
        ],
        suggestedActions: [
          { label: 'View Ocean Star Details', actionRoute: '/operations/vessels/VES-01' },
          { label: 'View Optimizer Plan', actionRoute: '/decision/optimizer' },
        ],
      };
    }

    // Case 5: Which vessel should we prioritize?
    if (query.includes('prioritize') || query.includes('priority')) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: `### Quayside Priority Matrix:

1. **Top Priority: Ocean Star (VES-01)** — *Critical ULCV (21,000 TEU)*. 14,500 TEU discharge with tight European feeder connections. Must receive 4 cranes minimum.
2. **High Priority: Maersk Mc-Kinney (VES-03)** — *Critical (18,270 TEU)*. Currently berthing at B02. Maintain 4 cranes to guarantee on-time departure.
3. **Standard Priority: Pacific Voyager (VES-05)** — *6,500 TEU regional feeder*. Safest candidate for a 4-hour delay window without contractual demurrage breach.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        toolCalls: [
          { toolName: 'getVessels', parameters: {}, resultSummary: '8 active vessels evaluated against demurrage SLAs' },
        ],
        suggestedActions: [
          { label: 'View All Vessels', actionRoute: '/operations/vessels' },
        ],
      };
    }

    // Case 6: Compare alternate ports / routes
    if (query.includes('route') || query.includes('port') || query.includes('alternate')) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: `### Alternate Route Feasibility Comparison:

* **PORT A (Rotterdam Hub - Current):** 31h expected turnaround delay, $100k extra operational cost, **Critical Congestion Risk (92/100)**.
* **PORT B (Antwerp Gateway - Recommended):** 18h delay, $110k cost, **Medium Risk (54/100)**.
  - *Recommendation Rationale:* For only **+$10k bunker cost**, you gain **-13 hours delay reduction** and guaranteed berth availability.
* **PORT C (Zeebrugge Deepwater):** 23h delay, $96k cost, High Risk (78/100). Intermodal rail bottlenecks reduce transshipment flow.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        toolCalls: [
          { toolName: 'compareRoutes', parameters: { vesselId: 'VES-01' }, resultSummary: 'Port B recommended (+10k cost, -13h delay)' },
        ],
        suggestedActions: [
          { label: 'Open Route Intelligence', actionRoute: '/intelligence/routes' },
        ],
      };
    }

    // Case 7: Generate tomorrow's shift plan
    if (query.includes('shift') || query.includes('plan') || query.includes('tomorrow')) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: `### 72-Hour Shift Operational Summary:

- **Total Movements:** 42 vessel movements scheduled across 6 berths.
- **Berth Allocations:** 18 continuous quay windows.
- **Cranes Mobilized:** 31 crane shifts (8 STS cranes across 3 rotating teams).
- **Conflict Status:** ${context.isRecoveryPlanApplied ? 'All 3 predicted conflicts have been RESOLVED.' : '3 predicted conflicts detected (B04 C03 fault overlap, B03 delayed arrival collision).'}.

Recommended next step: Review the 72-Hour Planner and transmit shift assignments to stevedore foremen.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        toolCalls: [
          { toolName: 'generate72HourPlan', parameters: {}, resultSummary: '42 movements, 18 assignments, conflicts resolved: ' + context.isRecoveryPlanApplied },
        ],
        suggestedActions: [
          { label: 'Inspect 72-Hour Planner', actionRoute: '/decision/planner' },
        ],
      };
    }

    // Default fallback
    return {
      id: 'msg-' + Date.now(),
      sender: 'gemini',
      text: `### Port Operational Status Assessment:
- **Berth Utilization:** ${context.b04Utilization}% at B04 (${context.b04Utilization > 85 ? 'HIGH RISK' : 'NORMAL'}).
- **Vessel Ocean Star:** Assigned to **${context.oceanStarBerth}**.
- **Crane Fleet Status:** C03 is **${context.c03Status}**.
- **Active Operational Alerts:** ${context.activeAlertsCount} alerts requiring supervisor attention.

How can I assist you with berth optimization, disruption simulation, or route alternatives?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      suggestedActions: [
        { label: 'Why is B04 at risk?', prompt: 'Why is B04 at risk?' },
        { label: 'Simulate C03 failure', prompt: 'What happens if C03 fails?' },
        { label: 'Optimize Ocean Star', actionRoute: '/decision/optimizer' },
      ],
    };
  }
}

export const geminiCopilotService = new GeminiCopilotService();
