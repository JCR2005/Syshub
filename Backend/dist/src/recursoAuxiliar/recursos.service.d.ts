import { PrismaService } from '../prisma/prisma.service';
export declare class RecursosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTipos(): Promise<any>;
    private slugify;
    private ensureUniqueSlug;
    createTipo(data: {
        nombre?: string;
        nombre_recurso?: string;
        slug?: string;
        descripcion?: string;
        icono_svg?: string;
    }): Promise<{
        id: any;
        id_tipo_recurso: any;
        nombre: any;
        nombre_recurso: any;
        slug: any;
        descripcion: any;
        icono_svg: any;
    }>;
    deleteTipo(id: number): Promise<{
        ok: boolean;
    }>;
    getRecursos(filters: {
        tipoId?: number;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        recursos: any;
        total: any;
        page: number;
        pages: number;
    }>;
    getRecursoById(id: number): Promise<{
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
    }>;
    createRecurso(ownerId: number, data: {
        nombre: string;
        descripcion?: string;
        id_tipo_recurso: number;
    }): Promise<{
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
    }>;
    updateRecurso(ownerId: number, recursoId: number, data: {
        nombre?: string;
        descripcion?: string;
        id_tipo_recurso?: number;
    }, isAdmin?: boolean): Promise<{
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
    }>;
    deleteRecurso(ownerId: number, recursoId: number, isAdmin?: boolean): Promise<{
        ok: boolean;
    }>;
    addArchivos(ownerId: number, recursoId: number, files: Express.Multer.File[]): Promise<{
        id: number;
        nombre: string;
        url: string;
    }[]>;
    deleteArchivo(ownerId: number, recursoId: number, archivoId: number, isAdmin?: boolean): Promise<{
        ok: boolean;
    }>;
    serveArchivo(archivoId: number): Promise<{
        path: string;
        originalName: any;
    }>;
    private assertOwner;
    private formatRecurso;
}
