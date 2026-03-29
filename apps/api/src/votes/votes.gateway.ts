import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VotesService } from './votes.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/votes',
})
export class VotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VotesGateway.name);

  constructor(private readonly votesService: VotesService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('vote.join')
  async handleJoinRoom(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `vote-session:${data.sessionId}`;
    await client.join(room);

    // Always fetch and emit fresh snapshot on join (reconnect recovery)
    try {
      const snapshot = await this.votesService.getSessionSnapshot(data.sessionId);
      client.emit('vote.snapshot', snapshot);
    } catch (err) {
      client.emit('vote.error', { message: 'Session not found' });
    }
  }

  @SubscribeMessage('vote.leave')
  async handleLeaveRoom(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `vote-session:${data.sessionId}`;
    await client.leave(room);
  }

  // ─── Broadcast Helpers (called by service/controller) ──

  async broadcastSessionUpdated(sessionId: string) {
    const room = `vote-session:${sessionId}`;
    try {
      const snapshot = await this.votesService.getSessionSnapshot(sessionId);
      this.server.to(room).emit('vote.session-updated', snapshot);
    } catch {
      // Session may already be deleted
    }
  }

  async broadcastResultsUpdated(sessionId: string) {
    const room = `vote-session:${sessionId}`;
    try {
      const snapshot = await this.votesService.getSessionSnapshot(sessionId);
      this.server.to(room).emit('vote.results-updated', snapshot);
    } catch {
      // Session may already be deleted
    }
  }

  async broadcastSessionClosed(sessionId: string) {
    const room = `vote-session:${sessionId}`;
    try {
      const snapshot = await this.votesService.getSessionSnapshot(sessionId);
      this.server.to(room).emit('vote.closed', snapshot);
    } catch {
      // swallow
    }
  }
}
