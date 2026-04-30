"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursoEspacioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CursoEspacioService = class CursoEspacioService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return this.prisma;
    }
    normalize(value) {
        return String(value || '')
            .trim()
            .toLowerCase();
    }
    async isAdmin(userId) {
        const role = await this.prisma.userRole.findFirst({
            where: {
                userId,
                role: { nombre: { equals: 'admin', mode: 'insensitive' } },
            },
            select: { id: true },
        });
        return Boolean(role);
    }
    async isAuxiliar(userId) {
        const rango = await this.prisma.userRango.findFirst({
            where: {
                userId,
                rango: { nombre: { equals: 'auxiliar', mode: 'insensitive' } },
            },
            select: { id: true },
        });
        return Boolean(rango) || (await this.isAdmin(userId));
    }
    async isAuxiliarInSpace(userId, espacioId) {
        const member = await this.db.cursoEspacioAuxiliar.findFirst({
            where: { id_usuario: userId, id_espacio: espacioId },
            select: { id: true },
        });
        if (member)
            return true;
        const espacio = await this.db.cursoEspacio.findUnique({
            where: { id_espacio: espacioId },
            select: { createdById: true },
        });
        return espacio?.createdById === userId || (await this.isAdmin(userId));
    }
    async isStudentInSpace(userId, espacioId) {
        if (await this.isAuxiliarInSpace(userId, espacioId))
            return true;
        const member = await this.db.cursoEspacioEstudiante.findFirst({
            where: { id_usuario: userId, id_espacio: espacioId },
            select: { id: true },
        });
        return Boolean(member);
    }
    ensureSemester(semestre) {
        if (![1, 2].includes(Number(semestre))) {
            throw new common_1.BadRequestException('El semestre debe ser 1 o 2');
        }
    }
    async listEspacios(filters) {
        const where = {};
        if (filters.cursoId)
            where.id_curso = filters.cursoId;
        if (filters.anio)
            where.anio = filters.anio;
        if (filters.semestre)
            where.semestre = filters.semestre;
        const espacios = await this.db.cursoEspacio.findMany({
            where,
            orderBy: [{ anio: 'desc' }, { semestre: 'desc' }, { createdAt: 'desc' }],
            include: {
                curso: true,
                creador: {
                    select: { id: true, nombre: true, correoInstitucional: true },
                },
                _count: { select: { recursos: true, repositorios: true, estudiantes: true } },
            },
        });
        return espacios.map((espacio) => ({
            id: espacio.id_espacio,
            anio: espacio.anio,
            semestre: espacio.semestre,
            estado: espacio.estado,
            createdAt: espacio.createdAt,
            curso: espacio.curso,
            creador: espacio.creador,
            recursosCount: espacio._count.recursos,
            reposCount: espacio._count.repositorios,
            estudiantesCount: espacio._count.estudiantes,
        }));
    }
    async getCatalogo() {
        const [cursos, tipos, auxiliares] = await Promise.all([
            this.db.curso.findMany({
                orderBy: [{ id_pensum: 'asc' }, { semestre: 'asc' }, { codigo: 'asc' }],
                include: {
                    pensum: { include: { carrera: true } },
                    area: true,
                },
            }),
            this.db.tipo_Recurso.findMany({
                orderBy: { nombre_recurso: 'asc' },
            }),
            this.db.userRango.findMany({
                where: {
                    rango: { nombre: { equals: 'auxiliar', mode: 'insensitive' } },
                },
                include: {
                    user: {
                        select: { id: true, nombre: true, correoInstitucional: true },
                    },
                },
            }),
        ]);
        return {
            cursos: cursos.map((curso) => ({
                id: curso.id_curso,
                codigo: curso.codigo,
                nombre: curso.nombre,
                semestre: curso.semestre,
                pensum: curso.pensum
                    ? {
                        id: curso.pensum.id_pensum,
                        nombre: curso.pensum.nombre,
                        carrera: curso.pensum.carrera
                            ? {
                                id: curso.pensum.carrera.id_carrera,
                                nombre: curso.pensum.carrera.nombre,
                                color: curso.pensum.carrera.color,
                            }
                            : null,
                    }
                    : null,
                area: curso.area
                    ? { id: curso.area.id_area, nombre: curso.area.nombre }
                    : null,
            })),
            tiposRecurso: tipos.map((tipo) => ({
                id: tipo.id_tipo_recurso,
                nombre: tipo.nombre_recurso,
                icono: tipo.icono_svg,
            })),
            auxiliares: auxiliares.map((item) => ({
                id: item.user.id,
                nombre: item.user.nombre,
                correo: item.user.correoInstitucional,
            })),
        };
    }
    async getRepositoriosDeEspacio(espacioId, usuarioId, isAuxiliar) {
        if (isAuxiliar) {
            return this.prisma.repositorio.findMany({
                where: { id_espacio: espacioId },
                include: {
                    autor: true
                }
            });
        }
        else {
            return this.prisma.repositorio.findMany({
                where: {
                    id_espacio: espacioId,
                    id_usuario: usuarioId
                }
            });
        }
    }
    async createEspacio(userId, payload) {
        if (!(await this.isAuxiliar(userId))) {
            throw new common_1.ForbiddenException('Solo auxiliares pueden crear espacios de curso');
        }
        this.ensureSemester(payload.semestre);
        const curso = await this.prisma.curso.findUnique({
            where: { id_curso: payload.cursoId },
            select: { id_curso: true },
        });
        if (!curso)
            throw new common_1.NotFoundException('Curso no encontrado');
        const existing = await this.db.cursoEspacio.findFirst({
            where: {
                id_curso: payload.cursoId,
                anio: payload.anio,
                semestre: payload.semestre,
            },
            select: { id_espacio: true },
        });
        if (existing) {
            throw new common_1.BadRequestException('Ya existe un espacio para ese curso, año y semestre');
        }
        const espacio = await this.db.cursoEspacio.create({
            data: {
                id_curso: payload.cursoId,
                anio: payload.anio,
                semestre: payload.semestre,
                createdById: userId,
                estado: 'activo',
            },
        });
        await this.db.cursoEspacioAuxiliar.create({
            data: {
                id_espacio: espacio.id_espacio,
                id_usuario: userId,
                rol: 'owner',
            },
        });
        return espacio;
    }
    async getDetalle(espacioId) {
        const espacio = await this.db.cursoEspacio.findUnique({
            where: { id_espacio: espacioId },
            include: {
                curso: true,
                creador: {
                    select: { id: true, nombre: true, correoInstitucional: true },
                },
                _count: {
                    select: {
                        recursos: true,
                        repositorios: true,
                        auxiliares: true,
                        estudiantes: true,
                    },
                },
            },
        });
        if (!espacio)
            throw new common_1.NotFoundException('Espacio no encontrado');
        return {
            id: espacio.id_espacio,
            anio: espacio.anio,
            semestre: espacio.semestre,
            estado: espacio.estado,
            createdAt: espacio.createdAt,
            curso: espacio.curso,
            creador: espacio.creador,
            recursosCount: espacio._count.recursos,
            reposCount: espacio._count.repositorios,
            auxiliaresCount: espacio._count.auxiliares,
            estudiantesCount: espacio._count.estudiantes,
        };
    }
    async listEstudiantes(espacioId) {
        const estudiantes = await this.db.cursoEspacioEstudiante.findMany({
            where: { id_espacio: espacioId },
            include: {
                usuario: {
                    select: { id: true, nombre: true, correoInstitucional: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return estudiantes.map((item) => ({
            id: item.id,
            createdAt: item.createdAt,
            user: item.usuario,
        }));
    }
    async joinEspacio(userId, espacioId) {
        if (await this.isAuxiliarInSpace(userId, espacioId)) {
            throw new common_1.BadRequestException('Los auxiliares ya forman parte del espacio');
        }
        const espacio = await this.db.cursoEspacio.findUnique({
            where: { id_espacio: espacioId },
            select: { id_espacio: true, estado: true },
        });
        if (!espacio)
            throw new common_1.NotFoundException('Espacio no encontrado');
        if (this.normalize(espacio.estado) !== 'activo') {
            throw new common_1.BadRequestException('El curso no está activo');
        }
        const join = await this.db.cursoEspacioEstudiante.upsert({
            where: {
                id_espacio_id_usuario: { id_espacio: espacioId, id_usuario: userId },
            },
            update: {},
            create: { id_espacio: espacioId, id_usuario: userId },
            include: {
                usuario: {
                    select: { id: true, nombre: true, correoInstitucional: true },
                },
            },
        });
        return { id: join.id, createdAt: join.createdAt, user: join.usuario };
    }
    async leaveEspacio(userId, espacioId) {
        if (await this.isAuxiliarInSpace(userId, espacioId)) {
            throw new common_1.BadRequestException('Los auxiliares no pueden abandonar el espacio');
        }
        const existing = await this.db.cursoEspacioEstudiante.findFirst({
            where: { id_espacio: espacioId, id_usuario: userId },
            select: { id: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException('No estás unido a este curso');
        }
        await this.db.cursoEspacioEstudiante.delete({ where: { id: existing.id } });
        return { removed: true };
    }
    async listRecursos(espacioId) {
        return this.db.cursoEspacioRecurso.findMany({
            where: { id_espacio: espacioId },
            orderBy: { createdAt: 'desc' },
            include: {
                tipo: {
                    select: {
                        id_tipo_recurso: true,
                        nombre_recurso: true,
                        icono_svg: true,
                    },
                },
                creador: { select: { id: true, nombre: true } },
            },
        });
    }
    async createRecurso(userId, espacioId, payload) {
        if (!(await this.isAuxiliarInSpace(userId, espacioId))) {
            throw new common_1.ForbiddenException('No tienes permisos para subir recursos en este espacio');
        }
        const nombre = (payload.nombre ?? '').trim();
        if (!nombre)
            throw new common_1.BadRequestException('El nombre es requerido');
        if (!payload.url)
            throw new common_1.BadRequestException('La URL es requerida');
        return this.db.cursoEspacioRecurso.create({
            data: {
                id_espacio: espacioId,
                nombre,
                descripcion: payload.descripcion?.trim() || null,
                url: payload.url.trim(),
                id_tipo_recurso: payload.tipoRecursoId,
                createdById: userId,
            },
            include: {
                tipo: {
                    select: {
                        id_tipo_recurso: true,
                        nombre_recurso: true,
                        icono_svg: true,
                    },
                },
                creador: { select: { id: true, nombre: true } },
            },
        });
    }
    async listRepositorios(userId, espacioId) {
        const isAux = await this.isAuxiliarInSpace(userId, espacioId);
        const espacio = await this.db.cursoEspacio.findUnique({
            where: { id_espacio: espacioId },
            select: { estado: true },
        });
        if (!espacio)
            throw new common_1.NotFoundException('Espacio no encontrado');
        const estado = this.normalize(espacio.estado);
        if (!isAux && estado === 'activo') {
            return [];
        }
        const repos = await this.db.cursoEspacioRepositorio.findMany({
            where: {
                id_espacio: espacioId,
            },
            orderBy: [{ destacado: 'desc' }, { createdAt: 'desc' }],
            include: {
                repositorio: true,
                linkedBy: { select: { id: true, nombre: true } },
            },
        });
        if (isAux)
            return repos;
        return repos.filter((item) => this.normalize(item.repositorio?.visibilidad) !== 'private');
    }
    async linkRepositorio(userId, espacioId, repositorioId) {
        const repo = await this.prisma.repositorio.findUnique({
            where: { id_repositorio: repositorioId },
            select: { id_repositorio: true },
        });
        if (!repo)
            throw new common_1.NotFoundException('Repositorio no encontrado');
        const ownerLink = await this.prisma.repositorio_Usuario.findFirst({
            where: { id_usuario: userId, id_repositorio: repositorioId },
            select: { id_repositorio_usuario: true },
        });
        const isAux = await this.isAuxiliarInSpace(userId, espacioId);
        const isStudent = await this.isStudentInSpace(userId, espacioId);
        if (!ownerLink && !isAux) {
            throw new common_1.ForbiddenException('No puedes vincular repositorios que no son tuyos');
        }
        if (!isAux && !isStudent) {
            throw new common_1.ForbiddenException('Debes unirte al curso para vincular repositorios');
        }
        if (!isAux) {
            const espacio = await this.db.cursoEspacio.findUnique({
                where: { id_espacio: espacioId },
                select: { estado: true },
            });
            if (espacio && this.normalize(espacio.estado) !== 'activo') {
                throw new common_1.ForbiddenException('El curso ya finalizó y no acepta repositorios');
            }
        }
        return this.db.cursoEspacioRepositorio.upsert({
            where: {
                id_espacio_id_repositorio: {
                    id_espacio: espacioId,
                    id_repositorio: repositorioId,
                },
            },
            create: {
                id_espacio: espacioId,
                id_repositorio: repositorioId,
                linkedById: userId,
            },
            update: {},
            include: {
                repositorio: true,
                linkedBy: { select: { id: true, nombre: true } },
            },
        });
    }
    async toggleDestacado(userId, espacioId, repositorioId, destacado) {
        if (!(await this.isAuxiliarInSpace(userId, espacioId))) {
            throw new common_1.ForbiddenException('Solo auxiliares pueden destacar repositorios');
        }
        return this.db.cursoEspacioRepositorio.update({
            where: {
                id_espacio_id_repositorio: {
                    id_espacio: espacioId,
                    id_repositorio: repositorioId,
                },
            },
            data: { destacado },
        });
    }
    async listAuxiliares(espacioId) {
        const auxiliares = await this.db.cursoEspacioAuxiliar.findMany({
            where: { id_espacio: espacioId },
            include: {
                usuario: {
                    select: { id: true, nombre: true, correoInstitucional: true },
                },
            },
            orderBy: { rol: 'desc' },
        });
        return auxiliares.map((aux) => ({
            id: aux.id,
            rol: aux.rol,
            createdAt: aux.createdAt,
            user: aux.usuario,
        }));
    }
    async addAuxiliar(requesterId, espacioId, auxiliarId) {
        const owner = await this.db.cursoEspacioAuxiliar.findFirst({
            where: { id_espacio: espacioId, id_usuario: requesterId, rol: 'owner' },
            select: { id: true },
        });
        if (!owner && !(await this.isAdmin(requesterId))) {
            throw new common_1.ForbiddenException('Solo el auxiliar creador puede agregar auxiliares');
        }
        if (!(await this.isAuxiliar(auxiliarId))) {
            throw new common_1.BadRequestException('El usuario no tiene rango de auxiliar');
        }
        const auxiliar = await this.db.cursoEspacioAuxiliar.upsert({
            where: {
                id_espacio_id_usuario: {
                    id_espacio: espacioId,
                    id_usuario: auxiliarId,
                },
            },
            create: { id_espacio: espacioId, id_usuario: auxiliarId, rol: 'aux' },
            update: {},
            include: {
                usuario: {
                    select: { id: true, nombre: true, correoInstitucional: true },
                },
            },
        });
        return {
            id: auxiliar.id,
            rol: auxiliar.rol,
            createdAt: auxiliar.createdAt,
            user: auxiliar.usuario,
        };
    }
    async removeAuxiliar(requesterId, espacioId, auxiliarId) {
        const owner = await this.db.cursoEspacioAuxiliar.findFirst({
            where: { id_espacio: espacioId, id_usuario: requesterId, rol: 'owner' },
            select: { id: true },
        });
        if (!owner && !(await this.isAdmin(requesterId))) {
            throw new common_1.ForbiddenException('Solo el auxiliar creador puede remover auxiliares');
        }
        const target = await this.db.cursoEspacioAuxiliar.findFirst({
            where: { id_espacio: espacioId, id_usuario: auxiliarId },
            select: { rol: true },
        });
        if (!target)
            throw new common_1.NotFoundException('Auxiliar no encontrado en el espacio');
        if (target.rol === 'owner') {
            throw new common_1.BadRequestException('No puedes remover al auxiliar creador');
        }
        await this.db.cursoEspacioAuxiliar.delete({
            where: {
                id_espacio_id_usuario: {
                    id_espacio: espacioId,
                    id_usuario: auxiliarId,
                },
            },
        });
        return { removed: true };
    }
    async updateEstado(userId, espacioId, estado) {
        if (!(await this.isAuxiliarInSpace(userId, espacioId))) {
            throw new common_1.ForbiddenException('Solo auxiliares pueden actualizar el estado');
        }
        const normalized = this.normalize(estado);
        if (!['activo', 'finalizado'].includes(normalized)) {
            throw new common_1.BadRequestException('Estado inválido');
        }
        const updated = await this.db.cursoEspacio.update({
            where: { id_espacio: espacioId },
            data: { estado: normalized },
        });
        return { id: updated.id_espacio, estado: updated.estado };
    }
};
exports.CursoEspacioService = CursoEspacioService;
exports.CursoEspacioService = CursoEspacioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CursoEspacioService);
//# sourceMappingURL=curso-espacio.service.js.map