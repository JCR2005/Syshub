import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
type AuthenticatedRequest = Request & {
    user?: {
        sub?: number | string;
    };
};
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    private assertAdmin;
    findAll(): Promise<{
        correoInstitucional: string;
        edad: number | null;
        nombre: string | null;
        rutaFotoPerfil: string | null;
        id: number;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        correoInstitucional: string;
        edad: number | null;
        nombre: string | null;
        rutaFotoPerfil: string | null;
        id: number;
    }>;
    getManagementUsers(request: AuthenticatedRequest): Promise<{
        users: {
            id: number;
            nombre: string | null;
            correo: string;
            carnet: string | null;
            bloqueado: boolean;
            roles: string[];
        }[];
    }>;
    setRole(request: AuthenticatedRequest, id: string, body: {
        role?: string;
        enabled?: boolean;
    }): Promise<{
        id: number;
        nombre: string | null;
        correo: string;
        carnet: string | null;
        bloqueado: boolean;
        roles: string[];
        rangos: string[];
    }>;
    setStatus(request: AuthenticatedRequest, id: string, body: {
        bloqueado?: boolean;
    }): Promise<{
        id: number;
        nombre: string | null;
        correo: string;
        carnet: string | null;
        bloqueado: boolean;
        roles: string[];
        rangos: string[];
    }>;
    getSystemClassification(request: AuthenticatedRequest): Promise<{
        ok: boolean;
        classification: {
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
        };
    }>;
    createArea(request: AuthenticatedRequest, body: {
        nombre?: string;
        descripcion?: string;
        color?: string;
        pensumId?: number;
    }): Promise<{
        ok: boolean;
        area: any;
    }>;
    createPensum(request: AuthenticatedRequest, body: {
        nombre?: string;
        descripcion?: string;
        vigente?: boolean;
        carreraId?: number;
    }): Promise<{
        ok: boolean;
        pensum: any;
    }>;
    createCarrera(request: AuthenticatedRequest, body: {
        nombre?: string;
        color?: string;
    }): Promise<{
        ok: boolean;
        carrera: any;
    }>;
    deleteCarrera(request: AuthenticatedRequest, id: string): Promise<{
        ok: boolean;
    }>;
    createCourse(request: AuthenticatedRequest, body: {
        codigo?: string;
        nombre?: string;
        semestre?: number;
        pensumId?: number;
        areaId?: number | null;
    }): Promise<{
        ok: boolean;
        course: any;
    }>;
    createTag(request: AuthenticatedRequest, body: {
        nombre?: string;
    }): Promise<{
        ok: boolean;
        tag: {
            id_etiqueta: number;
            nombre_etiqueta: string;
        };
    }>;
    createStack(request: AuthenticatedRequest, body: {
        nombre?: string;
    }): Promise<{
        ok: boolean;
        stack: {
            id_stack: number;
            nombre_stack: string;
        };
    }>;
    updateCourse(request: AuthenticatedRequest, id: string, body: {
        codigo?: string;
        nombre?: string;
        semestre?: number;
        pensumId?: number;
        areaId?: number | null;
    }): Promise<{
        ok: boolean;
        course: any;
    }>;
    togglePensumVigency(request: AuthenticatedRequest, id: string): Promise<{
        ok: boolean;
        pensum: any;
    }>;
    updateArea(request: AuthenticatedRequest, id: string, body: {
        nombre?: string;
        descripcion?: string;
        color?: string;
    }): Promise<{
        ok: boolean;
        area: any;
    }>;
    deleteArea(request: AuthenticatedRequest, id: string): Promise<{
        ok: boolean;
    }>;
    deletePensum(request: AuthenticatedRequest, id: string): Promise<{
        ok: boolean;
    }>;
    deleteCourse(request: AuthenticatedRequest, id: string): Promise<{
        ok: boolean;
    }>;
    deleteTag(request: AuthenticatedRequest, id: string): Promise<{
        ok: boolean;
    }>;
    deleteStack(request: AuthenticatedRequest, id: string): Promise<{
        ok: boolean;
    }>;
    getProfile(id: string): Promise<{
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
    updateProfile(id: string, dto: UpdateProfileDto): Promise<{
        correoInstitucional: string;
        edad: number | null;
        nombre: string | null;
        carnet: string | null;
        rutaFotoPerfil: string | null;
        id: number;
    }>;
    uploadProfilePhoto(id: string, file?: Express.Multer.File): Promise<{
        rutaFotoPerfil: string | null;
    }>;
    setUserRango(id: string, body: {
        rango: string;
        enabled: boolean;
    }): Promise<{
        id: number;
        nombre: string | null;
        correo: string;
        carnet: string | null;
        bloqueado: boolean;
        roles: string[];
        rangos: string[];
    }>;
}
export {};
