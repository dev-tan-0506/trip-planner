import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private readonly refreshExpiresIn;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    }>;
    login(userId: string, email: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            avatarUrl: string | null;
        } | null;
    }>;
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
    } | null>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    logout(token: string): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        email: string;
        avatarUrl: string | null;
        healthProfile: string | null;
        provider: string;
    }>;
    private generateTokens;
}
