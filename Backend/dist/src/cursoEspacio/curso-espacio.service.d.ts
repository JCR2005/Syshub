import { PrismaService } from '../prisma/prisma.service';
export declare class CursoEspacioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    private normalize;
    private isAdmin;
    private isAuxiliar;
    private isAuxiliarInSpace;
    private isStudentInSpace;
    private ensureSemester;
    listEspacios(filters: {
        cursoId?: number;
        anio?: number;
        semestre?: number;
    }): Promise<any>;
    getCatalogo(): Promise<{
        cursos: any;
        tiposRecurso: any;
        auxiliares: any;
    }>;
    createEspacio(userId: number, payload: {
        cursoId: number;
        anio: number;
        semestre: number;
    }): Promise<any>;
    getDetalle(espacioId: number): Promise<{
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
    }>;
    listEstudiantes(espacioId: number): Promise<any>;
    joinEspacio(userId: number, espacioId: number): Promise<{
        id: any;
        createdAt: any;
        user: any;
    }>;
    leaveEspacio(userId: number, espacioId: number): Promise<{
        removed: boolean;
    }>;
    listRecursos(espacioId: number): Promise<any>;
    createRecurso(userId: number, espacioId: number, payload: {
        nombre: string;
        descripcion?: string;
        url: string;
        tipoRecursoId: number;
    }): Promise<any>;
    listRepositorios(userId: number, espacioId: number): Promise<any>;
    linkRepositorio(userId: number, espacioId: number, repositorioId: number): Promise<any>;
    toggleDestacado(userId: number, espacioId: number, repositorioId: number, destacado: boolean): Promise<any>;
    listAuxiliares(espacioId: number): Promise<any>;
    addAuxiliar(requesterId: number, espacioId: number, auxiliarId: number): Promise<{
        id: any;
        rol: any;
        createdAt: any;
        user: any;
    }>;
    removeAuxiliar(requesterId: number, espacioId: number, auxiliarId: number): Promise<{
        removed: boolean;
    }>;
    updateEstado(userId: number, espacioId: number, estado: string): Promise<{
        id: any;
        estado: any;
    }>;
}
