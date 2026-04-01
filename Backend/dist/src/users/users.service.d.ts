import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MailerService } from '../mailer/mailer.service';
export declare class UsersService {
    private readonly prisma;
    private readonly mailer;
    constructor(prisma: PrismaService, mailer: MailerService);
    create(dto: CreateUserDto): Promise<{
        correoInstitucional: string;
        edad: number | null;
        bloqueado: boolean;
        nombre: string | null;
        id: number;
    }>;
    preRegister(dto: {
        correo: string;
        contrasena: string;
    }): Promise<{
        ok: boolean;
        message: string;
    }>;
    confirmRegister(correo: string, codigo: string, contrasena: string): Promise<{
        ok: boolean;
        message: string;
        user: {
            correoInstitucional: string;
            edad: number | null;
            bloqueado: boolean;
            nombre: string | null;
            id: number;
        };
    }>;
    findAll(): Promise<{
        correoInstitucional: string;
        edad: number | null;
        bloqueado: boolean;
        nombre: string | null;
        id: number;
    }[]>;
    findByCorreo(correo: string): Promise<{
        correoInstitucional: string;
        contrasena: string;
        edad: number | null;
        bloqueado: boolean;
        nombre: string | null;
        carnet: string | null;
        id: number;
    } | null>;
    getProfile(userId: number): Promise<{
        rangos: string[];
        roles: string[];
        correoInstitucional: string;
        nombre: string | null;
        carnet: string | null;
        id: number;
    }>;
    verifyEmail(correo: string, codigo: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    resendVerificationCode(correo: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    private generarCodigo;
    private hashPassword;
}
