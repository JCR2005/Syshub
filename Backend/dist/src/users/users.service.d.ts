import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailerService } from '../mailer/mailer.service';
export declare class UsersService {
    private readonly prisma;
    private readonly mailer;
    constructor(prisma: PrismaService, mailer: MailerService);
    create(dto: CreateUserDto): Promise<{
        correoInstitucional: string;
        edad: number | null;
        nombre: string | null;
        rutaFotoPerfil: string | null;
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
            nombre: string | null;
            rutaFotoPerfil: string | null;
            id: number;
        };
    }>;
    findAll(): Promise<{
        correoInstitucional: string;
        edad: number | null;
        nombre: string | null;
        rutaFotoPerfil: string | null;
        id: number;
    }[]>;
    findByCorreo(correo: string): Promise<{
        correoInstitucional: string;
        contrasena: string;
        edad: number | null;
        bloqueado: boolean;
        nombre: string | null;
        carnet: string | null;
        rutaFotoPerfil: string | null;
        id: number;
    } | null>;
    getUserRangos(userId: number): Promise<string[]>;
    hasRango(userId: number, rangoName: string): Promise<boolean>;
    getUserRoles(userId: number): Promise<string[]>;
    hasRole(userId: number, roleName: string): Promise<boolean>;
    getAdminManagementUsers(): Promise<{
        users: {
            id: number;
            nombre: string | null;
            correo: string;
            carnet: string | null;
            bloqueado: boolean;
            roles: string[];
        }[];
    }>;
    setUserRole(userId: number, roleName: string, enabled: boolean): Promise<{
        id: number;
        nombre: string | null;
        correo: string;
        carnet: string | null;
        bloqueado: boolean;
        roles: string[];
        rangos: string[];
    }>;
    setUserBlocked(userId: number, bloqueado: boolean): Promise<{
        id: number;
        nombre: string | null;
        correo: string;
        carnet: string | null;
        bloqueado: boolean;
        roles: string[];
        rangos: string[];
    }>;
    getSystemClassification(): Promise<{
        areas: {
            id: any;
            nombre: any;
            descripcion: any;
            color: any;
            pensumId: any;
            pensumNombre: any;
        }[];
        tags: {
            id: any;
            nombre: any;
        }[];
        stacks: {
            id: any;
            nombre: any;
        }[];
        pensums: {
            id: any;
            nombre: any;
            descripcion: any;
            vigente: any;
            color: any;
        }[];
        courses: {
            id: any;
            codigo: any;
            nombre: any;
            semestre: any;
            pensumId: any;
            pensum: any;
            areaId: any;
            area: any;
            areaColor: any;
        }[];
        carreras: {
            id: any;
            nombre: any;
            color: any;
        }[];
    }>;
    createCarrera(payload: {
        nombre: string;
        color?: string;
    }): Promise<any>;
    deleteCarrera(carreraId: number): Promise<{
        ok: boolean;
    }>;
    createTechArea(payload: {
        nombre: string;
        descripcion?: string;
        pensumId: number;
    }): Promise<any>;
    updateTechArea(areaId: number, payload: {
        nombre?: string;
        descripcion?: string;
        color?: string;
    }): Promise<any>;
    deleteTechArea(areaId: number): Promise<{
        ok: boolean;
    }>;
    createPensum(payload: {
        nombre: string;
        descripcion?: string;
        vigente?: boolean;
        carreraId: number;
    }): Promise<any>;
    togglePensumVigency(pensumId: number): Promise<any>;
    deletePensum(pensumId: number): Promise<{
        ok: boolean;
    }>;
    createCourse(payload: {
        codigo: string;
        nombre: string;
        semestre: number;
        pensumId: number;
        areaId?: number | null;
    }): Promise<any>;
    updateCourse(courseId: number, payload: {
        codigo?: string;
        nombre?: string;
        semestre?: number;
        pensumId?: number;
        areaId?: number | null;
    }): Promise<any>;
    deleteCourse(courseId: number): Promise<{
        ok: boolean;
    }>;
    createTag(nombre: string): Promise<{
        id_etiqueta: number;
        nombre_etiqueta: string;
    }>;
    deleteTag(tagId: number): Promise<{
        ok: boolean;
    }>;
    createStack(nombre: string): Promise<{
        id_stack: number;
        nombre_stack: string;
    }>;
    deleteStack(stackId: number): Promise<{
        ok: boolean;
    }>;
    private getAdminManagementUserById;
    getProfile(userId: number): Promise<{
        id: number;
        correoInstitucional: string;
        nombre: string | null;
        edad: number | null;
        carnet: string | null;
        rutaFotoPerfil: string | null;
        rangos: {
            nombre: string;
            id: number;
        }[];
    }>;
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        correoInstitucional: string;
        edad: number | null;
        nombre: string | null;
        carnet: string | null;
        rutaFotoPerfil: string | null;
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
    private normalizeEmail;
    private validateInstitutionalEmail;
    private validateStrongPassword;
    setUserRango(userId: number, rangoNombre: string, enabled: boolean): Promise<{
        id: number;
        nombre: string | null;
        correo: string;
        carnet: string | null;
        bloqueado: boolean;
        roles: string[];
        rangos: string[];
    }>;
}
