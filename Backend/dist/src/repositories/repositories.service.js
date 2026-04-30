"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const fs_1 = require("fs");
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const REPOSITORY_UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'repositories');
let RepositoriesService = class RepositoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByOwner(ownerId) {
        const db = this.prisma;
        const linkedRepos = await db.repositorio_Usuario.findMany({
            where: { id_usuario: ownerId },
            include: {
                repositorio: {
                    include: {
                        pensum: true,
                        curso: true,
                        etiquetas: {
                            include: { etiqueta: true },
                        },
                        stacks: {
                            include: { stack: true },
                        },
                        archivos: {
                            include: { archivo: true },
                        },
                    },
                },
            },
            orderBy: { id_repositorio_usuario: 'desc' },
        });
        return linkedRepos.map((link) => {
            const repo = link.repositorio;
            return {
                id: repo.id_repositorio,
                nombre: repo.nombre,
                descripcion: repo.descripcion,
                visibilidad: repo.visibilidad || 'public',
                estrellas: typeof repo.estrellas === 'number' ? repo.estrellas : 0,
                vistas: typeof repo.vistas === 'number' ? repo.vistas : 0,
                pensum: repo.pensum
                    ? {
                        id: repo.pensum.id_pensum,
                        nombre: repo.pensum.nombre,
                        vigente: repo.pensum.vigente,
                    }
                    : null,
                curso: repo.curso
                    ? {
                        id: repo.curso.id_curso,
                        codigo: repo.curso.codigo,
                        nombre: repo.curso.nombre,
                        semestre: repo.curso.semestre,
                        pensumId: repo.curso.id_pensum,
                    }
                    : null,
                tags: repo.etiquetas.map((tagLink) => tagLink.etiqueta.nombre_etiqueta),
                stacks: repo.stacks.map((stackLink) => stackLink.stack.nombre_stack),
                files: repo.archivos.map((fileLink) => {
                    const file = fileLink.archivo;
                    const fallbackName = this.sanitizeFileSegment(path.basename(file.url));
                    const storedPath = file.ruta_relativa || file.url;
                    const normalizedStoredPath = storedPath.replace(/\\/g, '/');
                    const storedSegments = normalizedStoredPath
                        .split('/')
                        .filter(Boolean);
                    const visibleSegments = storedSegments[0] && /^repo-\d+-owner-\d+$/.test(storedSegments[0])
                        ? storedSegments.slice(1, -1)
                        : storedSegments.slice(0, -1);
                    const folderRaw = visibleSegments.join('/');
                    const folder = !folderRaw || folderRaw === '.'
                        ? 'raiz'
                        : folderRaw.replace(/\\/g, '/');
                    return {
                        id: file.id_archivo,
                        nombre: file.nombre_original || file.nombre_unico || fallbackName,
                        carpeta: folder,
                        openUrl: `/api/files/${file.id_archivo}`,
                        downloadUrl: `/api/files/${file.id_archivo}?download=1`,
                    };
                }),
            };
        });
    }
    async createRepository(data, files) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const t = tx;
                let normalizedPensumId;
                let normalizedCursoId;
                if (typeof data.pensumId === 'number' && !Number.isNaN(data.pensumId)) {
                    const pensumExists = await t.pensum?.findFirst({
                        where: { id_pensum: data.pensumId },
                        select: { id_pensum: true },
                    });
                    if (!pensumExists) {
                        throw new common_1.NotFoundException('El pensum seleccionado no existe');
                    }
                    normalizedPensumId = data.pensumId;
                }
                if (typeof data.cursoId === 'number' && !Number.isNaN(data.cursoId)) {
                    const selectedCourse = await t.curso?.findFirst({
                        where: { id_curso: data.cursoId },
                        select: { id_curso: true, id_pensum: true },
                    });
                    if (!selectedCourse) {
                        throw new common_1.NotFoundException('El curso seleccionado no existe');
                    }
                    if (normalizedPensumId !== undefined &&
                        selectedCourse.id_pensum !== normalizedPensumId) {
                        throw new common_1.ForbiddenException('El curso no pertenece al pensum seleccionado');
                    }
                    normalizedCursoId = selectedCourse.id_curso;
                    normalizedPensumId ??= selectedCourse.id_pensum;
                    const espaciosActivos = await t.cursoEspacio.findMany({
                        where: { id_curso: normalizedCursoId, estado: 'activo' },
                        select: { id_espacio: true },
                    });
                    if (!espaciosActivos.length) {
                        throw new common_1.ForbiddenException('El curso no está activo en ningún espacio disponible');
                    }
                    const hasMembership = await Promise.all(espaciosActivos.map((espacio) => t.cursoEspacioEstudiante.findFirst({
                        where: { id_espacio: espacio.id_espacio, id_usuario: data.ownerId },
                        select: { id: true },
                    })));
                    if (!hasMembership.some(Boolean)) {
                        throw new common_1.ForbiddenException('Debes unirte al curso antes de asociar un repositorio');
                    }
                }
                const repo = await t.repositorio.create({
                    data: {
                        nombre: data.nombre,
                        descripcion: data.descripcion,
                        id_pensum: normalizedPensumId,
                        id_curso: normalizedCursoId,
                    },
                });
                await t.repositorio_Usuario.create({
                    data: {
                        id_usuario: data.ownerId,
                        id_repositorio: repo.id_repositorio,
                    },
                });
                if (data.tags && data.tags.length) {
                    for (const tagName of data.tags) {
                        const name = tagName.trim();
                        if (!name)
                            continue;
                        let tag = await t.etiqueta.findFirst({
                            where: { nombre_etiqueta: name },
                        });
                        if (!tag) {
                            tag = await t.etiqueta.create({
                                data: { nombre_etiqueta: name },
                            });
                        }
                        await t.etiqueta_Repositorio
                            .create({
                            data: {
                                id_etiqueta: tag.id_etiqueta,
                                id_repositorio: repo.id_repositorio,
                            },
                        })
                            .catch(() => undefined);
                    }
                }
                if (data.stacks && data.stacks.length) {
                    for (const sName of data.stacks) {
                        const name = sName.trim();
                        if (!name)
                            continue;
                        let stack = await t.stack.findFirst({
                            where: { nombre_stack: name },
                        });
                        if (!stack) {
                            stack = await t.stack.create({ data: { nombre_stack: name } });
                        }
                        await t.stack_Repositorio
                            .create({
                            data: {
                                id_stack: stack.id_stack,
                                id_repositorio: repo.id_repositorio,
                            },
                        })
                            .catch(() => undefined);
                    }
                }
                if (files && files.length) {
                    const repoFolderName = `repo-${repo.id_repositorio}-owner-${data.ownerId}`;
                    for (const incomingFile of files) {
                        const moved = await this.moveFileToRepositoryFolder(incomingFile, repoFolderName);
                        const archivo = await t.archivo.create({
                            data: {
                                url: moved.relativePath,
                                nombre_original: moved.originalName,
                                nombre_unico: moved.storedName,
                                ruta_relativa: moved.relativePath,
                            },
                        });
                        await t.archivo_Repositorio
                            .create({
                            data: {
                                id_archivo: archivo.id_archivo,
                                id_repositorio: repo.id_repositorio,
                            },
                        })
                            .catch(() => undefined);
                    }
                }
                return repo;
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('No se pudo crear el repositorio');
        }
    }
    async updateRepository(ownerId, repositoryId, payload) {
        await this.assertOwnedRepository(ownerId, repositoryId);
        const db = this.prisma;
        await db.$transaction(async (tx) => {
            const updateData = {};
            if (typeof payload.nombre === 'string' && payload.nombre.trim()) {
                updateData.nombre = payload.nombre.trim();
            }
            if (typeof payload.descripcion === 'string') {
                updateData.descripcion = payload.descripcion;
            }
            if (payload.visibilidad === 'public' ||
                payload.visibilidad === 'private') {
                updateData.visibilidad = payload.visibilidad;
            }
            if (Object.keys(updateData).length > 0) {
                await tx.repositorio.update({
                    where: { id_repositorio: repositoryId },
                    data: updateData,
                });
            }
            if (Array.isArray(payload.tags)) {
                await tx.etiqueta_Repositorio.deleteMany({
                    where: { id_repositorio: repositoryId },
                });
                const uniqueTags = [
                    ...new Set(payload.tags.map((item) => item.trim()).filter(Boolean)),
                ];
                for (const tagName of uniqueTags) {
                    let tag = await tx.etiqueta.findFirst({
                        where: { nombre_etiqueta: tagName },
                    });
                    if (!tag) {
                        tag = await tx.etiqueta.create({
                            data: { nombre_etiqueta: tagName },
                        });
                    }
                    await tx.etiqueta_Repositorio
                        .create({
                        data: {
                            id_etiqueta: tag.id_etiqueta,
                            id_repositorio: repositoryId,
                        },
                    })
                        .catch(() => undefined);
                }
            }
            if (Array.isArray(payload.stacks)) {
                await tx.stack_Repositorio.deleteMany({
                    where: { id_repositorio: repositoryId },
                });
                const uniqueStacks = [
                    ...new Set(payload.stacks.map((item) => item.trim()).filter(Boolean)),
                ];
                for (const stackName of uniqueStacks) {
                    let stack = await tx.stack.findFirst({
                        where: { nombre_stack: stackName },
                    });
                    if (!stack) {
                        stack = await tx.stack.create({
                            data: { nombre_stack: stackName },
                        });
                    }
                    await tx.stack_Repositorio
                        .create({
                        data: {
                            id_stack: stack.id_stack,
                            id_repositorio: repositoryId,
                        },
                    })
                        .catch(() => undefined);
                }
            }
        });
        const repositories = await this.findByOwner(ownerId);
        return repositories.find((repo) => repo.id === repositoryId);
    }
    async addFilesToRepository(ownerId, repositoryId, files, relativePaths = []) {
        await this.assertOwnedRepository(ownerId, repositoryId);
        if (!files.length)
            return [];
        const db = this.prisma;
        return db.$transaction(async (tx) => {
            const repoFolderName = `repo-${repositoryId}-owner-${ownerId}`;
            const uploaded = [];
            for (const incomingFile of files) {
                const moved = await this.moveFileToRepositoryFolder(incomingFile, repoFolderName, relativePaths[uploaded.length]);
                const existing = await tx.archivo.findFirst({
                    where: {
                        nombre_original: moved.originalName,
                        repositorios: { some: { id_repositorio: repositoryId } },
                    },
                });
                if (existing) {
                    await tx.archivo_Repositorio.deleteMany({
                        where: {
                            id_archivo: existing.id_archivo,
                            id_repositorio: repositoryId,
                        },
                    });
                    await tx.archivo.delete({
                        where: { id_archivo: existing.id_archivo },
                    });
                    const absPath = this.resolveAbsolutePath(existing.ruta_relativa || existing.url);
                    if (fs.existsSync(absPath)) {
                        await fs_1.promises.unlink(absPath).catch(() => undefined);
                    }
                }
                const archivo = await tx.archivo.create({
                    data: {
                        url: moved.relativePath,
                        nombre_original: moved.originalName,
                        nombre_unico: moved.storedName,
                        ruta_relativa: moved.relativePath,
                    },
                });
                await tx.archivo_Repositorio.create({
                    data: {
                        id_archivo: archivo.id_archivo,
                        id_repositorio: repositoryId,
                    },
                });
                uploaded.push({ id: archivo.id_archivo, nombre: moved.originalName });
            }
            return uploaded;
        });
    }
    async getRepositoriosPorEspacio(espacioId, usuarioId, isAuxiliar) {
        if (isAuxiliar) {
            return this.prisma.repositorio.findMany({
                where: {
                    cursoEspacios: {
                        some: {
                            id_espacio: espacioId,
                        },
                    },
                },
                include: {
                    usuarios: {
                        include: {
                            usuario: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    correoInstitucional: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        else {
            return this.prisma.repositorio.findMany({
                where: {
                    cursoEspacios: {
                        some: {
                            id_espacio: espacioId,
                        },
                    },
                    usuarios: {
                        some: {
                            id_usuario: usuarioId,
                        },
                    },
                },
            });
        }
    }
    async getRepositoryOptions() {
        const db = this.prisma;
        const [tagsRows, stacksRows, areaRows, pensumRows, courseRows] = await Promise.all([
            db.etiqueta.findMany({
                orderBy: { nombre_etiqueta: 'asc' },
                select: { nombre_etiqueta: true },
            }),
            db.stack.findMany({
                orderBy: { nombre_stack: 'asc' },
                select: { nombre_stack: true },
            }),
            db.areaTecnica?.findMany
                ? db.areaTecnica.findMany({
                    orderBy: { nombre: 'asc' },
                    select: {
                        id_area: true,
                        nombre: true,
                        color: true,
                    },
                })
                : Promise.resolve([]),
            db.pensum?.findMany
                ? db.pensum.findMany({
                    orderBy: { nombre: 'asc' },
                    select: {
                        id_pensum: true,
                        nombre: true,
                        vigente: true,
                    },
                })
                : Promise.resolve([]),
            db.curso?.findMany
                ? db.curso.findMany({
                    orderBy: [{ semestre: 'asc' }, { codigo: 'asc' }],
                    select: {
                        id_curso: true,
                        codigo: true,
                        nombre: true,
                        semestre: true,
                        id_pensum: true,
                        id_area: true,
                    },
                })
                : Promise.resolve([]),
        ]);
        return {
            tags: tagsRows.map((row) => row.nombre_etiqueta),
            stacks: stacksRows.map((row) => row.nombre_stack),
            areas: areaRows.map((row) => ({
                id: row.id_area,
                nombre: row.nombre,
                color: row.color ?? null,
            })),
            pensums: pensumRows.map((row) => ({
                id: row.id_pensum,
                nombre: row.nombre,
                vigente: row.vigente,
            })),
            courses: courseRows.map((row) => ({
                id: row.id_curso,
                codigo: row.codigo,
                nombre: row.nombre,
                semestre: row.semestre,
                pensumId: row.id_pensum,
                areaId: row.id_area,
            })),
        };
    }
    async deleteRepositoryFile(ownerId, repositoryId, fileId) {
        await this.assertOwnedRepository(ownerId, repositoryId);
        const db = this.prisma;
        const link = await db.archivo_Repositorio.findFirst({
            where: {
                id_repositorio: repositoryId,
                id_archivo: fileId,
            },
            include: {
                archivo: true,
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Archivo no encontrado en el repositorio');
        }
        await db.archivo_Repositorio.delete({
            where: {
                id_archivo_id_repositorio: {
                    id_archivo: fileId,
                    id_repositorio: repositoryId,
                },
            },
        });
        const remainingLinks = await db.archivo_Repositorio.count({
            where: {
                id_archivo: fileId,
            },
        });
        if (remainingLinks === 0) {
            const storedPath = link.archivo.ruta_relativa || link.archivo.url;
            const absolutePath = this.resolveAbsolutePath(storedPath);
            if (fs.existsSync(absolutePath)) {
                await fs_1.promises.unlink(absolutePath).catch(() => undefined);
            }
            await db.archivo.delete({
                where: {
                    id_archivo: fileId,
                },
            });
        }
    }
    async assertOwnedRepository(ownerId, repositoryId) {
        const db = this.prisma;
        const relation = await db.repositorio_Usuario.findFirst({
            where: {
                id_usuario: ownerId,
                id_repositorio: repositoryId,
            },
            include: {
                repositorio: true,
            },
        });
        if (!relation) {
            throw new common_1.NotFoundException('Repositorio no encontrado');
        }
        if (!relation.repositorio) {
            throw new common_1.ForbiddenException('No tienes acceso al repositorio');
        }
        return relation.repositorio;
    }
    async getRepositoryDownloadPayload(ownerId, repositoryId) {
        const db = this.prisma;
        const repository = await db.repositorio.findFirst({
            where: {
                id_repositorio: repositoryId,
                usuarios: { some: { id_usuario: ownerId } },
            },
            include: {
                archivos: {
                    include: {
                        archivo: true,
                    },
                },
            },
        });
        if (!repository)
            return null;
        const files = repository.archivos
            .map((link) => {
            const file = link.archivo;
            const storedPath = file.ruta_relativa || file.url;
            const absolutePath = this.resolveAbsolutePath(storedPath);
            if (!fs.existsSync(absolutePath))
                return null;
            const normalizedStoredPath = storedPath.replace(/\\/g, '/');
            const storedSegments = normalizedStoredPath.split('/').filter(Boolean);
            const visibleSegments = storedSegments[0] && /^repo-\d+-owner-\d+$/.test(storedSegments[0])
                ? storedSegments.slice(1, -1)
                : storedSegments.slice(0, -1);
            const filename = file.nombre_original ||
                file.nombre_unico ||
                path.basename(storedPath);
            const archivePath = this.normalizeRelativePath(path.join(...visibleSegments, filename));
            return {
                absolutePath,
                archivePath,
            };
        })
            .filter((item) => Boolean(item));
        return {
            repositoryId: repository.id_repositorio,
            repositoryName: repository.nombre,
            files,
        };
    }
    async getPublicRepositoryDownloadPayload(repositoryId) {
        return this.getPublicRepositoryDownloadPayloadByOwner(repositoryId);
    }
    async getPublicRepositoryDownloadPayloadByOwner(repositoryId, ownerId) {
        const db = this.prisma;
        const repository = await db.repositorio.findFirst({
            where: {
                id_repositorio: repositoryId,
                visibilidad: 'public',
                ...(typeof ownerId === 'number'
                    ? { usuarios: { some: { id_usuario: ownerId } } }
                    : {}),
            },
            include: {
                archivos: {
                    include: {
                        archivo: true,
                    },
                },
            },
        });
        if (!repository)
            return null;
        const files = repository.archivos
            .map((link) => {
            const file = link.archivo;
            const storedPath = file.ruta_relativa || file.url;
            const absolutePath = this.resolveAbsolutePath(storedPath);
            if (!fs.existsSync(absolutePath))
                return null;
            const normalizedStoredPath = storedPath.replace(/\\/g, '/');
            const storedSegments = normalizedStoredPath.split('/').filter(Boolean);
            const visibleSegments = storedSegments[0] && /^repo-\d+-owner-\d+$/.test(storedSegments[0])
                ? storedSegments.slice(1, -1)
                : storedSegments.slice(0, -1);
            const filename = file.nombre_original ||
                file.nombre_unico ||
                path.basename(storedPath);
            const archivePath = this.normalizeRelativePath(path.join(...visibleSegments, filename));
            return {
                absolutePath,
                archivePath,
            };
        })
            .filter((item) => Boolean(item));
        return {
            repositoryId: repository.id_repositorio,
            repositoryName: repository.nombre,
            files,
        };
    }
    async listRepositoryCommits(ownerId, repositoryId) {
        await this.assertOwnedRepository(ownerId, repositoryId);
        const db = this.prisma;
        const commits = await db.repoCommit.findMany({
            where: {
                id_repositorio: repositoryId,
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        correoInstitucional: true,
                    },
                },
                archivos: {
                    select: {
                        ruta: true,
                        hash_archivo: true,
                        tamano_bytes: true,
                    },
                    orderBy: {
                        ruta: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });
        return commits.map((commit) => ({
            id: commit.id_commit,
            mensaje: commit.mensaje,
            accion: commit.accion,
            hashSnapshot: commit.hash_snapshot ?? null,
            createdAt: commit.createdAt,
            usuario: {
                id: Number(commit.usuario?.id ?? 0),
                nombre: commit.usuario?.nombre ?? null,
                correoInstitucional: commit.usuario?.correoInstitucional ?? 'usuario@desconocido',
            },
            archivos: (Array.isArray(commit.archivos) ? commit.archivos : []).map((file) => ({
                ruta: file.ruta,
                hash: file.hash_archivo,
                tamanoBytes: file.tamano_bytes ?? null,
            })),
        }));
    }
    async createRepositoryCommit(ownerId, repositoryId, message, action = 'commit') {
        await this.assertOwnedRepository(ownerId, repositoryId);
        const repositories = await this.findByOwner(ownerId);
        const repository = repositories.find((repo) => repo.id === repositoryId);
        if (!repository) {
            throw new common_1.NotFoundException('Repositorio no encontrado');
        }
        const fileSnapshots = (repository.files || [])
            .map((file) => {
            const folder = !file.carpeta || file.carpeta === 'raiz' ? '' : file.carpeta;
            const normalizedPath = this.normalizeRelativePath(folder ? `${folder}/${file.nombre}` : file.nombre);
            return {
                ruta: normalizedPath,
                hash_archivo: (0, crypto_1.createHash)('sha256')
                    .update(`${normalizedPath}:${file.id}`)
                    .digest('hex'),
                tamano_bytes: null,
            };
        })
            .sort((a, b) => a.ruta.localeCompare(b.ruta));
        const hashSnapshot = (0, crypto_1.createHash)('sha256')
            .update(JSON.stringify({
            repositoryId,
            files: fileSnapshots.map((file) => ({
                ruta: file.ruta,
                hash: file.hash_archivo,
            })),
        }))
            .digest('hex');
        const db = this.prisma;
        const commit = await db.$transaction(async (tx) => {
            const createdCommit = await tx.repoCommit.create({
                data: {
                    id_repositorio: repositoryId,
                    id_usuario: ownerId,
                    mensaje: (message || '').trim() ||
                        (action === 'push'
                            ? 'Push manual desde Syshub'
                            : 'Commit manual desde Syshub'),
                    accion: action,
                    hash_snapshot: hashSnapshot,
                },
            });
            if (fileSnapshots.length) {
                await tx.repoCommitArchivo.createMany({
                    data: fileSnapshots.map((file) => ({
                        id_commit: createdCommit.id_commit,
                        ruta: file.ruta,
                        hash_archivo: file.hash_archivo,
                        tamano_bytes: file.tamano_bytes,
                    })),
                });
            }
            await tx.repoSyncEvent.create({
                data: {
                    id_repositorio: repositoryId,
                    id_usuario: ownerId,
                    id_commit: createdCommit.id_commit,
                    accion: action,
                    detalle: action === 'push'
                        ? 'Push ejecutado con snapshot actual'
                        : 'Commit creado con snapshot actual',
                },
            });
            return createdCommit;
        });
        return {
            id: commit.id_commit,
            mensaje: commit.mensaje,
            accion: commit.accion,
            hashSnapshot: commit.hash_snapshot,
            createdAt: commit.createdAt,
            filesCount: fileSnapshots.length,
        };
    }
    async pullRepository(ownerId, repositoryId) {
        await this.assertOwnedRepository(ownerId, repositoryId);
        const db = this.prisma;
        const latestCommit = await db.repoCommit.findFirst({
            where: {
                id_repositorio: repositoryId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                archivos: {
                    select: {
                        ruta: true,
                        hash_archivo: true,
                    },
                    orderBy: {
                        ruta: 'asc',
                    },
                },
            },
        });
        await db.repoSyncEvent.create({
            data: {
                id_repositorio: repositoryId,
                id_usuario: ownerId,
                id_commit: latestCommit?.id_commit,
                accion: 'pull',
                detalle: latestCommit
                    ? 'Pull ejecutado usando el último commit remoto'
                    : 'Pull ejecutado sin commits previos',
            },
        });
        return {
            commit: latestCommit
                ? {
                    id: latestCommit.id_commit,
                    mensaje: latestCommit.mensaje,
                    accion: latestCommit.accion,
                    hashSnapshot: latestCommit.hash_snapshot,
                    createdAt: latestCommit.createdAt,
                    filesCount: Array.isArray(latestCommit.archivos)
                        ? latestCommit.archivos.length
                        : 0,
                }
                : null,
            summary: latestCommit
                ? 'Pull completado. Se sincronizó el último commit del repositorio.'
                : 'Pull completado. Aún no hay commits para sincronizar.',
        };
    }
    sanitizeFileSegment(value) {
        const cleaned = value
            .normalize('NFKD')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        return cleaned || 'archivo';
    }
    resolveAbsolutePath(storedPath) {
        if (path.isAbsolute(storedPath)) {
            return path.resolve(storedPath);
        }
        return path.resolve(REPOSITORY_UPLOAD_ROOT, storedPath);
    }
    normalizeRelativePath(relativePath) {
        return relativePath.replace(/\\/g, '/');
    }
    async moveFileToRepositoryFolder(file, repoFolderName, relativePathOverride) {
        const relativeOriginal = (relativePathOverride || file.originalname)
            .replace(/\\/g, '/')
            .replace(/^\/+/, '')
            .replace(/\.{2,}/g, '');
        const extension = path
            .extname(relativeOriginal || file.originalname)
            .toLowerCase();
        const baseName = path.basename(relativeOriginal || file.originalname, extension);
        const originalName = path.basename(relativeOriginal || file.originalname);
        const clientFolder = path.dirname(relativeOriginal);
        const safeClientFolder = clientFolder && clientFolder !== '.'
            ? this.normalizeRelativePath(clientFolder)
                .split('/')
                .map((part) => this.sanitizeFileSegment(part))
                .join('/')
            : '';
        const safeBaseName = this.sanitizeFileSegment(baseName).slice(0, 80);
        const storedName = `${Date.now()}-${(0, crypto_1.randomUUID)()}-${safeBaseName}${extension}`;
        const relativePath = this.normalizeRelativePath(path.join(repoFolderName, safeClientFolder, storedName));
        const destinationAbsolutePath = path.join(REPOSITORY_UPLOAD_ROOT, relativePath);
        await fs_1.promises.mkdir(path.dirname(destinationAbsolutePath), {
            recursive: true,
        });
        try {
            await fs_1.promises.rename(file.path, destinationAbsolutePath);
        }
        catch {
            await fs_1.promises.copyFile(file.path, destinationAbsolutePath);
            await fs_1.promises.unlink(file.path);
        }
        return {
            relativePath,
            storedName,
            originalName,
        };
    }
};
exports.RepositoriesService = RepositoriesService;
exports.RepositoriesService = RepositoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RepositoriesService);
//# sourceMappingURL=repositories.service.js.map