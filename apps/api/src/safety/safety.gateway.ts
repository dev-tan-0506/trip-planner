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
import { SafetyService } from './safety.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/safety',
})
export class SafetyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SafetyGateway.name);

  constructor(private readonly safetyService: SafetyService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('safety.join')
  async handleJoin(
    @MessageBody() data: { tripId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `safety-trip:${data.tripId}`;
    await client.join(room);

    try {
      const snapshot = await this.safetyService.getWarnings(data.tripId, data.userId);
      client.emit('safety.snapshot', snapshot);
    } catch {
      client.emit('safety.error', { message: 'Safety snapshot unavailable' });
    }
  }

  @SubscribeMessage('safety.leave')
  async handleLeave(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`safety-trip:${data.tripId}`);
  }

  async broadcast(tripId: string) {
    this.server.to(`safety-trip:${tripId}`).emit('safety.updated', { tripId });
  }
}
