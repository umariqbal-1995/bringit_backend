import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { registerRiderSocketHandlers } from './rider.socket';
import { logger } from '../utils/logger';
import { verifyRiderToken, extractBearerToken } from '../utils/jwt';

let io: SocketIOServer;

/** Initialize Socket.IO server and attach to HTTP server */
export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // ── Rider namespace ─────────────────────────────────────────────────────────
  const riderNs = io.of('/rider');

  // Authenticate rider socket connections via JWT
  riderNs.use((socket, next) => {
    const token = extractBearerToken(
      socket.handshake.auth['token'] as string | undefined ?? socket.handshake.headers.authorization,
    );
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyRiderToken(token);
      (socket as Socket & { riderId: string }).riderId = payload.riderId;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  riderNs.on('connection', (socket) => {
    const riderId = (socket as Socket & { riderId: string }).riderId;
    logger.info(`Rider socket connected: ${riderId}`);
    registerRiderSocketHandlers(io, socket as Socket & { riderId: string });

    socket.on('disconnect', () => {
      logger.info(`Rider socket disconnected: ${riderId}`);
    });
  });

  logger.info('✅  Socket.IO server initialized');
  return io;
}

/** Get the global Socket.IO instance (used by controllers/services) */
export function getSocketServer(): SocketIOServer {
  if (!io) throw new Error('Socket.IO server not initialized');
  return io;
}
