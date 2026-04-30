import { CreateRepositoryDto } from './dto/create-repository.dto';
import { RepositoriesService } from './repositories.service';
import type { Request, Response } from 'express';
type AuthenticatedRequest = Request & {
    user?: {
        sub?: number | string;
        id?: number | string;
    };
};
export declare class RepositoriesController {
    private readonly repoService;
    constructor(repoService: RepositoriesService);
    private streamRepositoryZip;
    findMine(req: AuthenticatedRequest): Promise<{
        ok: boolean;
        repositories: {
            id: number;
            nombre: string;
            descripcion: string;
            visibilidad: string;
            estrellas: number;
            vistas: number;
            pensum: {
                id: number;
                nombre: string;
                vigente: boolean;
            } | null;
            curso: {
                id: number;
                codigo: string;
                nombre: string;
                semestre: number;
                pensumId: number;
            } | null;
            tags: string[];
            stacks: string[];
            files: {
                id: number;
                nombre: string;
                carpeta: string;
                openUrl: string;
                downloadUrl: string;
            }[];
        }[];
    }>;
    findOptions(): Promise<{
        ok: boolean;
        options: {
            tags: any;
            stacks: any;
            areas: any;
            pensums: any;
            courses: any;
        };
    }>;
    listCommits(id: string, req: AuthenticatedRequest): Promise<{
        ok: boolean;
        commits: any;
    }>;
    createCommit(id: string, req: AuthenticatedRequest, body: {
        message?: string;
    }): Promise<{
        ok: boolean;
        commit: {
            id: any;
            mensaje: any;
            accion: any;
            hashSnapshot: any;
            createdAt: any;
            filesCount: number;
        };
    }>;
    pushRepository(id: string, req: AuthenticatedRequest, body: {
        message?: string;
    }): Promise<{
        ok: boolean;
        commit: {
            id: any;
            mensaje: any;
            accion: any;
            hashSnapshot: any;
            createdAt: any;
            filesCount: number;
        };
    }>;
    pullRepository(id: string, req: AuthenticatedRequest): Promise<{
        commit: {
            id: any;
            mensaje: any;
            accion: any;
            hashSnapshot: any;
            createdAt: any;
            filesCount: any;
        } | null;
        summary: string;
        ok: boolean;
    }>;
    updateRepository(id: string, req: AuthenticatedRequest, body: {
        nombre?: string;
        descripcion?: string;
        tags?: string[];
        stacks?: string[];
        visibilidad?: 'public' | 'private';
    }): Promise<{
        ok: boolean;
        repository: {
            id: number;
            nombre: string;
            descripcion: string;
            visibilidad: string;
            estrellas: number;
            vistas: number;
            pensum: {
                id: number;
                nombre: string;
                vigente: boolean;
            } | null;
            curso: {
                id: number;
                codigo: string;
                nombre: string;
                semestre: number;
                pensumId: number;
            } | null;
            tags: string[];
            stacks: string[];
            files: {
                id: number;
                nombre: string;
                carpeta: string;
                openUrl: string;
                downloadUrl: string;
            }[];
        } | undefined;
    }>;
    uploadRepositoryFiles(id: string, req: AuthenticatedRequest, body: {
        relativePaths?: string[] | string;
    }, files: {
        files?: Express.Multer.File[];
    }): Promise<{
        ok: boolean;
        uploaded: any;
    }>;
    deleteRepositoryFile(id: string, fileId: string, req: AuthenticatedRequest): Promise<{
        ok: boolean;
    }>;
    clonePublicRepository(id: string, res: Response): Promise<void>;
    clonePublicRepositoryByOwner(ownerId: string, id: string, res: Response): Promise<void>;
    downloadRepository(id: string, req: AuthenticatedRequest, res: Response): Promise<void>;
    create(req: AuthenticatedRequest, body: CreateRepositoryDto, files: {
        files?: Express.Multer.File[];
    }): Promise<{
        ok: boolean;
        repository: {
            id_repositorio: number;
            nombre: string;
        };
    }>;
    getReposByEspacio(espacioId: string, req: any): Promise<{
        id_repositorio: number;
        nombre: string;
        descripcion: string;
        visibilidad: string;
        estrellas: number;
        vistas: number;
        id_pensum: number | null;
        id_curso: number | null;
    }[]>;
}
export {};
