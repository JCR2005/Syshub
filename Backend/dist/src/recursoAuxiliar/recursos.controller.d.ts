import type { Request, Response } from 'express';
import { RecursosService } from './recursos.service';
type AuthReq = Request & {
    user?: {
        sub?: number | string;
        id?: number | string;
        roles?: string[];
    };
};
export declare class RecursosController {
    private readonly recursosService;
    constructor(recursosService: RecursosService);
    getTipos(): Promise<{
        ok: boolean;
        tipos: any;
    }>;
    createTipo(body: {
        nombre?: string;
        nombre_recurso?: string;
        slug?: string;
        descripcion?: string;
        icono_svg?: string;
    }): Promise<{
        ok: boolean;
        tipo: {
            id: any;
            id_tipo_recurso: any;
            nombre: any;
            nombre_recurso: any;
            slug: any;
            descripcion: any;
            icono_svg: any;
        };
    }>;
    deleteTipo(id: string): Promise<{
        ok: boolean;
    }>;
    getRecursos(tipoId?: string, search?: string, page?: string): Promise<{
        recursos: any;
        total: any;
        page: number;
        pages: number;
        ok: boolean;
    }>;
    getRecurso(id: string): Promise<{
        ok: boolean;
        recurso: {
            id: any;
            nombre: any;
            descripcion: any;
            tipo: {
                id: any;
                nombre: any;
            };
            autor: {
                id: any;
                nombre: any;
                correo: any;
            } | null;
            archivos: any;
            createdAt: any;
        };
    }>;
    createRecurso(req: AuthReq, body: {
        nombre: string;
        descripcion?: string;
        id_tipo_recurso: number;
    }): Promise<{
        ok: boolean;
        recurso: {
            id: any;
            nombre: any;
            descripcion: any;
            tipo: {
                id: any;
                nombre: any;
            };
            autor: {
                id: any;
                nombre: any;
                correo: any;
            } | null;
            archivos: any;
            createdAt: any;
        };
    }>;
    updateRecurso(id: string, req: AuthReq, body: {
        nombre?: string;
        descripcion?: string;
        id_tipo_recurso?: number;
    }): Promise<{
        ok: boolean;
        recurso: {
            id: any;
            nombre: any;
            descripcion: any;
            tipo: {
                id: any;
                nombre: any;
            };
            autor: {
                id: any;
                nombre: any;
                correo: any;
            } | null;
            archivos: any;
            createdAt: any;
        };
    }>;
    deleteRecurso(id: string, req: AuthReq): Promise<{
        ok: boolean;
    }>;
    uploadArchivos(id: string, req: AuthReq, uploadedFiles: {
        files?: Express.Multer.File[];
    }): Promise<{
        ok: boolean;
        uploaded: {
            id: number;
            nombre: string;
            url: string;
        }[];
    }>;
    deleteArchivo(id: string, archivoId: string, req: AuthReq): Promise<{
        ok: boolean;
    }>;
    serveArchivo(archivoId: string, download: string, res: Response): Promise<void>;
}
export {};
