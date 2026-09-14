import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import url from 'url';
import jwt from 'jsonwebtoken';
import { broadcast } from './broadcast.js';

export interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  role?: string;
}

const clients = new Set<ExtendedWebSocket>();

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: ExtendedWebSocket, req: IncomingMessage) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    try {
      const parsedUrl = url.parse(req.url || '', true);
      const token = parsedUrl.query.token as string;

      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string, role: string };
      ws.userId = decoded.sub;
      ws.role = decoded.role;
      
      clients.add(ws);
      console.log(`[ws] Client connected: ${ws.userId} (${ws.role})`);
    } catch (err) {
      console.error('[ws] Connection rejected:', err);
      ws.close(1008, 'Unauthorized');
      return;
    }

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[ws] Client disconnected: ${ws.userId}`);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      if (!extWs.isAlive) return extWs.terminate();
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
  
  // Set the set for broadcast
  broadcast.setClients(clients);
}
