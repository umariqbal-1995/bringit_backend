/**
 * Rider Socket Handlers
 *
 * Events the rider client emits:
 *   rider:location:update  — { latitude, longitude }
 *
 * Events the server emits back to connected clients:
 *   rider:{id}:location    — { latitude, longitude }
 *   order:status:update    — { orderId, status }
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { riderService } from '../services/rider.service';
import { logger } from '../utils/logger';

export function registerRiderSocketHandlers(
  io: SocketIOServer,
  socket: Socket & { riderId: string },
): void {
  const { riderId } = socket;

  // Join a room named after the rider so the server can push to a specific rider
  socket.join(`rider:${riderId}`);

  /** Rider emits their current GPS coordinates */
  socket.on(
    'rider:location:update',
    async (payload: { latitude: unknown; longitude: unknown }) => {
      const lat = Number(payload.latitude);
      const lon = Number(payload.longitude);

      if (isNaN(lat) || isNaN(lon)) {
        socket.emit('error', { message: 'Invalid location payload' });
        return;
      }

      try {
        const { shouldEmit, latitude, longitude } = await riderService.updateLocation(riderId, {
          latitude: lat,
          longitude: lon,
        });

        if (shouldEmit) {
          // Broadcast to all clients listening for this rider's location
          // (customer app, store app, admin)
          io.emit(`rider:${riderId}:location`, { riderId, latitude, longitude });
          logger.debug(`Location emitted for rider ${riderId}: ${latitude}, ${longitude}`);
        }
      } catch (err) {
        logger.error(`Socket location update error for rider ${riderId}`, err);
        socket.emit('error', { message: 'Failed to update location' });
      }
    },
  );
}

/** Utility — emit order status update to relevant parties */
export function emitOrderStatusUpdate(
  io: SocketIOServer,
  orderId: string,
  status: string,
  extra?: Record<string, unknown>,
): void {
  io.emit('order:status:update', { orderId, status, ...extra });
}
