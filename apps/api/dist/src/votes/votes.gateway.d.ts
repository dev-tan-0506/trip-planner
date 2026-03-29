import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VotesService } from './votes.service';
export declare class VotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly votesService;
    server: Server;
    private readonly logger;
    constructor(votesService: VotesService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        sessionId: string;
    }, client: Socket): Promise<void>;
    handleLeaveRoom(data: {
        sessionId: string;
    }, client: Socket): Promise<void>;
    broadcastSessionUpdated(sessionId: string): Promise<void>;
    broadcastResultsUpdated(sessionId: string): Promise<void>;
    broadcastSessionClosed(sessionId: string): Promise<void>;
}
