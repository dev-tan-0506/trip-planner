import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(user: {
        id: string;
        email: string;
    }): Promise<{
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    getMe(user: JwtPayload): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        email: string;
        avatarUrl: string | null;
        healthProfile: string | null;
        provider: string;
    }>;
}
