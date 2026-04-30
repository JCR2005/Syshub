import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { PreRegisterDto } from './dto/pre-register.dto';
import { ConfirmRegisterDto } from './dto/confirm-register.dto';
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(dto: RegisterDto): Promise<{
        correoInstitucional: string;
        edad: number | null;
        nombre: string | null;
        rutaFotoPerfil: string | null;
        id: number;
    }>;
    preRegister(dto: PreRegisterDto): Promise<{
        ok: boolean;
        message: string;
    }>;
    confirmRegister(dto: ConfirmRegisterDto): Promise<{
        ok: boolean;
        message: string;
        user: {
            correoInstitucional: string;
            edad: number | null;
            nombre: string | null;
            rutaFotoPerfil: string | null;
            id: number;
        };
    }>;
    login(dto: LoginDto): Promise<{
        id: number;
        correo: string;
        nombre: string | null;
        roles: string[];
        rangos: string[];
        availableModes: string[];
        requiresModeSelection: boolean;
        activeMode: string | null;
        accessToken: string;
        tokenType: string;
        expiresIn: number | import("ms").StringValue | undefined;
        message: string;
    }>;
    verify(dto: VerifyEmailDto): Promise<{
        ok: boolean;
        message: string;
    }>;
    resend(dto: ResendCodeDto): Promise<{
        ok: boolean;
        message: string;
    }>;
}
