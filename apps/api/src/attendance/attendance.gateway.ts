import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AttendanceService } from './attendance.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/attendance',
})
export class AttendanceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AttendanceGateway.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('attendance.join')
  async handleJoin(
    @MessageBody() data: { tripId: string; userId: string; sessionId?: string | null },
    @ConnectedSocket() client: Socket,
  ) {
    const tripRoom = `attendance-trip:${data.tripId}`;
    await client.join(tripRoom);

    if (data.sessionId) {
      await client.join(`attendance-session:${data.sessionId}`);
    }

    try {
      const snapshot = await this.attendanceService.getCurrentAttendanceSnapshot(
        data.tripId,
        data.userId,
      );
      client.emit('attendance.snapshot', snapshot);
    } catch {
      client.emit('attendance.error', { message: 'Attendance snapshot unavailable' });
    }
  }

  @SubscribeMessage('attendance.leave')
  async handleLeave(
    @MessageBody() data: { tripId: string; sessionId?: string | null },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`attendance-trip:${data.tripId}`);
    if (data.sessionId) {
      await client.leave(`attendance-session:${data.sessionId}`);
    }
  }

  async broadcastAttendanceUpdated(tripId: string, sessionId?: string | null) {
    this.server.to(`attendance-trip:${tripId}`).emit('attendance.updated', {
      tripId,
      sessionId: sessionId ?? null,
    });

    if (sessionId) {
      this.server.to(`attendance-session:${sessionId}`).emit('attendance.updated', {
        tripId,
        sessionId,
      });
    }
  }
}
