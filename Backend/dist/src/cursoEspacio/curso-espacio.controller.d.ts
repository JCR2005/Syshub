import type { Request } from 'express';
import { CursoEspacioService } from './curso-espacio.service';
type AuthReq = Request & {
    user?: {
        sub?: number | string;
        id?: number | string;
    };
};
export declare class CursoEspacioController {
    private readonly cursoEspacioService;
    constructor(cursoEspacioService: CursoEspacioService);
    listEspacios(cursoId?: string, anio?: string, semestre?: string): Promise<{
        ok: boolean;
        espacios: any;
    }>;
    createEspacio(req: AuthReq, body: {
        cursoId?: number;
        anio?: number;
        semestre?: number;
    }): Promise<{
        ok: boolean;
        espacio: any;
    }>;
    getCatalogo(): Promise<{
        ok: boolean;
        catalogo: {
            cursos: any;
            tiposRecurso: any;
            auxiliares: any;
        };
    }>;
    getDetalle(id: string): Promise<{
        ok: boolean;
        espacio: {
            id: any;
            anio: any;
            semestre: any;
            estado: any;
            createdAt: any;
            curso: any;
            creador: any;
            recursosCount: any;
            reposCount: any;
            auxiliaresCount: any;
            estudiantesCount: any;
        };
    }>;
    listRecursos(id: string): Promise<{
        ok: boolean;
        recursos: any;
    }>;
    createRecurso(req: AuthReq, id: string, body: {
        nombre?: string;
        descripcion?: string;
        url?: string;
        tipoRecursoId?: number;
    }): Promise<{
        ok: boolean;
        recurso: any;
    }>;
    listRepos(req: AuthReq, id: string): Promise<{
        ok: boolean;
        repos: any;
    }>;
    linkRepo(req: AuthReq, id: string, body: {
        repositorioId?: number;
    }): Promise<{
        ok: boolean;
        repo: any;
    }>;
    toggleDestacado(req: AuthReq, id: string, repoId: string, body: {
        destacado?: boolean;
    }): Promise<{
        ok: boolean;
        repo: any;
    }>;
    listAuxiliares(id: string): Promise<{
        ok: boolean;
        auxiliares: any;
    }>;
    listEstudiantes(id: string): Promise<{
        ok: boolean;
        estudiantes: any;
    }>;
    joinEspacio(req: AuthReq, id: string): Promise<{
        ok: boolean;
        join: {
            id: any;
            createdAt: any;
            user: any;
        };
    }>;
    leaveEspacio(req: AuthReq, id: string): Promise<{
        ok: boolean;
        removed: boolean;
    }>;
    addAuxiliar(req: AuthReq, id: string, body: {
        userId?: number;
    }): Promise<{
        ok: boolean;
        auxiliar: {
            id: any;
            rol: any;
            createdAt: any;
            user: any;
        };
    }>;
    removeAuxiliar(req: AuthReq, id: string, userId: string): Promise<{
        ok: boolean;
        removed: boolean;
    }>;
    updateEstado(req: AuthReq, id: string, body: {
        estado?: string;
    }): Promise<{
        ok: boolean;
        estado: any;
    }>;
}
export {};
