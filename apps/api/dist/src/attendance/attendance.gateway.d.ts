import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AttendanceService } from './attendance.service';
export declare class AttendanceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly attendanceService;
    server: Server;
    private readonly logger;
    constructor(attendanceService: AttendanceService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(data: {
        tripId: string;
        userId: string;
        sessionId?: string | null;
    }, client: Socket): Promise<void>;
    handleLeave(data: {
        tripId: string;
        sessionId?: string | null;
    }, client: Socket): Promise<void>;
    broadcastAttendanceUpdated(tripId: string, sessionId?: string | null): Promise<void>;
}
