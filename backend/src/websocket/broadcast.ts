import { ExtendedWebSocket } from './hub.js';

export enum WsEventType {
  VESSEL_UPDATED = 'VESSEL_UPDATED',
  ALERT_CREATED = 'ALERT_CREATED',
  ALERT_RESOLVED = 'ALERT_RESOLVED',
  BERTH_STATUS_CHANGED = 'BERTH_STATUS_CHANGED',
  CRANE_STATUS_CHANGED = 'CRANE_STATUS_CHANGED',
  OPTIMIZATION_APPLIED = 'OPTIMIZATION_APPLIED',
  SIMULATION_COMPLETED = 'SIMULATION_COMPLETED',
}

class BroadcastService {
  private clients: Set<ExtendedWebSocket> | null = null;

  setClients(clients: Set<ExtendedWebSocket>) {
    this.clients = clients;
  }

  emitToRole(role: string, type: WsEventType, payload: any) {
    if (!this.clients) return;
    const msg = JSON.stringify({ type, payload });
    for (const client of this.clients) {
      if (client.role === role && client.readyState === 1 /* OPEN */) {
        client.send(msg);
      }
    }
  }

  emitToUser(userId: string, type: WsEventType, payload: any) {
    if (!this.clients) return;
    const msg = JSON.stringify({ type, payload });
    for (const client of this.clients) {
      if (client.userId === userId && client.readyState === 1 /* OPEN */) {
        client.send(msg);
      }
    }
  }

  emitToAll(type: WsEventType, payload: any) {
    if (!this.clients) return;
    const msg = JSON.stringify({ type, payload });
    for (const client of this.clients) {
      if (client.readyState === 1 /* OPEN */) {
        client.send(msg);
      }
    }
  }
}

export const broadcast = new BroadcastService();
