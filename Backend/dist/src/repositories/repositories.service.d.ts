import { PrismaService } from '../prisma/prisma.service';
type RepositoryDownloadPayload = {
    repositoryId: number;
    repositoryName: string;
    files: {
        absolutePath: string;
        archivePath: string;
    }[];
};
export declare class RepositoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByOwner(ownerId: number): Promise<{
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
    }[]>;
    createRepository(data: {
        nombre: string;
        descripcion: string;
        ownerId: number;
        tags?: string[];
        stacks?: string[];
        categoryId?: number;
        pensumId?: number;
        cursoId?: number;
    }, files: Express.Multer.File[]): Promise<{
        id_repositorio: number;
        nombre: string;
    }>;
    updateRepository(ownerId: number, repositoryId: number, payload: {
        nombre?: string;
        descripcion?: string;
        tags?: string[];
        stacks?: string[];
        visibilidad?: 'public' | 'private';
    }): Promise<{
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
    } | undefined>;
    addFilesToRepository(ownerId: number, repositoryId: number, files: Express.Multer.File[], relativePaths?: string[]): Promise<any>;
    getRepositoriosPorEspacio(espacioId: number, usuarioId: number, isAuxiliar: boolean): Promise<{
        id_repositorio: number;
        nombre: string;
        descripcion: string;
        visibilidad: string;
        estrellas: number;
        vistas: number;
        id_pensum: number | null;
        id_curso: number | null;
    }[]>;
    getRepositoryOptions(): Promise<{
        tags: any;
        stacks: any;
        areas: any;
        pensums: any;
        courses: any;
    }>;
    deleteRepositoryFile(ownerId: number, repositoryId: number, fileId: number): Promise<void>;
    private assertOwnedRepository;
    getRepositoryDownloadPayload(ownerId: number, repositoryId: number): Promise<RepositoryDownloadPayload | null>;
    getPublicRepositoryDownloadPayload(repositoryId: number): Promise<RepositoryDownloadPayload | null>;
    getPublicRepositoryDownloadPayloadByOwner(repositoryId: number, ownerId?: number): Promise<RepositoryDownloadPayload | null>;
    listRepositoryCommits(ownerId: number, repositoryId: number): Promise<any>;
    createRepositoryCommit(ownerId: number, repositoryId: number, message?: string, action?: 'commit' | 'push'): Promise<{
        id: any;
        mensaje: any;
        accion: any;
        hashSnapshot: any;
        createdAt: any;
        filesCount: number;
    }>;
    pullRepository(ownerId: number, repositoryId: number): Promise<{
        commit: {
            id: any;
            mensaje: any;
            accion: any;
            hashSnapshot: any;
            createdAt: any;
            filesCount: any;
        } | null;
        summary: string;
    }>;
    private sanitizeFileSegment;
    private resolveAbsolutePath;
    private normalizeRelativePath;
    private moveFileToRepositoryFolder;
}
export {};
