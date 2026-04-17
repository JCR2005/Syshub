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
exports.RecursosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const fs_1 = require("fs");
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const RECURSOS_UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'recursos');
function ensureDir(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
ensureDir(RECURSOS_UPLOAD_ROOT);
let RecursosService = class RecursosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTipos() {
        const db = this.prisma;
        const tipos = await db.tipo_Recurso.findMany({
            orderBy: { nombre_recurso: 'asc' },
        });
        return tipos.map((t) => ({
            id: t.id_tipo_recurso,
            id_tipo_recurso: t.id_tipo_recurso,
            nombre: t.nombre_recurso,
            nombre_recurso: t.nombre_recurso,
            slug: t.slug,
            descripcion: t.descripcion,
            icono_svg: t.icono_svg,
        }));
    }
    slugify(value) {
        return (value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
    }
    async ensureUniqueSlug(baseSlug) {
        if (!baseSlug)
            return '';
        let slug = baseSlug;
        let counter = 2;
        const db = this.prisma;
        while (true) {
            const exists = await db.tipo_Recurso.findFirst({
                where: { slug },
                select: { id_tipo_recurso: true },
            });
            if (!exists)
                return slug;
            slug = `${baseSlug}-${counter}`;
            counter += 1;
        }
    }
    async createTipo(data) {
        const clean = (data?.nombre_recurso ?? data?.nombre ?? '').trim();
        if (!clean)
            throw new common_1.BadRequestException('El nombre es requerido');
        const db = this.prisma;
        const existing = await db.tipo_Recurso.findFirst({
            where: { nombre_recurso: clean },
        });
        if (existing)
            throw new common_1.BadRequestException('El tipo ya existe');
        const baseSlug = this.slugify(data?.slug?.trim() || clean);
        const slug = await this.ensureUniqueSlug(baseSlug);
        if (!slug)
            throw new common_1.BadRequestException('El slug es requerido');
        const tipo = await db.tipo_Recurso.create({
            data: {
                nombre_recurso: clean,
                slug,
                descripcion: data?.descripcion?.trim() || null,
                icono_svg: data?.icono_svg?.trim() || null,
            },
        });
        return {
            id: tipo.id_tipo_recurso,
            id_tipo_recurso: tipo.id_tipo_recurso,
            nombre: tipo.nombre_recurso,
            nombre_recurso: tipo.nombre_recurso,
            slug: tipo.slug,
            descripcion: tipo.descripcion,
            icono_svg: tipo.icono_svg,
        };
    }
    async deleteTipo(id) {
        const db = this.prisma;
        const linked = await db.recurso_Auxiliar.count({
            where: { id_tipo_recurso: id },
        });
        if (linked > 0)
            throw new common_1.BadRequestException('Tiene recursos asociados, no se puede eliminar');
        await this.prisma.tipo_Recurso.delete({ where: { id_tipo_recurso: id } });
        return { ok: true };
    }
    async getRecursos(filters) {
        const db = this.prisma;
        const { tipoId, search, page = 1, limit = 20 } = filters;
        const where = {};
        if (tipoId)
            where.id_tipo_recurso = tipoId;
        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [recursos, total] = await Promise.all([
            db.recurso_Auxiliar.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    tipo: { select: { id_tipo_recurso: true, nombre_recurso: true } },
                    usuarios: {
                        include: {
                            usuario: {
                                select: { id: true, nombre: true, correoInstitucional: true },
                            },
                        },
                    },
                    archivos: {
                        include: {
                            archivo: {
                                select: {
                                    id_archivo: true,
                                    url: true,
                                    nombre_original: true,
                                    nombre_unico: true,
                                },
                            },
                        },
                    },
                },
            }),
            db.recurso_Auxiliar.count({ where }),
        ]);
        return {
            recursos: recursos.map((r) => this.formatRecurso(r)),
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
    async getRecursoById(id) {
        const db = this.prisma;
        const recurso = await db.recurso_Auxiliar.findUnique({
            where: { id_recurso: id },
            include: {
                tipo: { select: { id_tipo_recurso: true, nombre_recurso: true } },
                usuarios: {
                    include: {
                        usuario: {
                            select: { id: true, nombre: true, correoInstitucional: true },
                        },
                    },
                },
                archivos: {
                    include: {
                        archivo: {
                            select: {
                                id_archivo: true,
                                url: true,
                                nombre_original: true,
                                nombre_unico: true,
                                ruta_relativa: true,
                            },
                        },
                    },
                },
            },
        });
        if (!recurso)
            throw new common_1.NotFoundException('Recurso no encontrado');
        return this.formatRecurso(recurso);
    }
    async createRecurso(ownerId, data) {
        const db = this.prisma;
        const tipo = await this.prisma.tipo_Recurso.findUnique({
            where: { id_tipo_recurso: data.id_tipo_recurso },
        });
        if (!tipo)
            throw new common_1.NotFoundException('Tipo de recurso no encontrado');
        const recurso = await db.recurso_Auxiliar.create({
            data: {
                nombre: data.nombre.trim(),
                descripcion: data.descripcion?.trim() || null,
                id_tipo_recurso: data.id_tipo_recurso,
                usuarios: {
                    create: [{ id_usuario: ownerId }],
                },
            },
            include: {
                tipo: { select: { id_tipo_recurso: true, nombre_recurso: true } },
                usuarios: {
                    include: {
                        usuario: {
                            select: { id: true, nombre: true, correoInstitucional: true },
                        },
                    },
                },
                archivos: true,
            },
        });
        return this.formatRecurso(recurso);
    }
    async updateRecurso(ownerId, recursoId, data, isAdmin = false) {
        const db = this.prisma;
        await this.assertOwner(ownerId, recursoId, isAdmin);
        const updateData = {};
        if (data.nombre?.trim())
            updateData.nombre = data.nombre.trim();
        if (data.descripcion !== undefined)
            updateData.descripcion = data.descripcion?.trim() || null;
        if (data.id_tipo_recurso) {
            const tipo = await this.prisma.tipo_Recurso.findUnique({
                where: { id_tipo_recurso: data.id_tipo_recurso },
            });
            if (!tipo)
                throw new common_1.NotFoundException('Tipo no encontrado');
            updateData.id_tipo_recurso = data.id_tipo_recurso;
        }
        await db.recurso_Auxiliar.update({
            where: { id_recurso: recursoId },
            data: updateData,
        });
        return this.getRecursoById(recursoId);
    }
    async deleteRecurso(ownerId, recursoId, isAdmin = false) {
        const db = this.prisma;
        await this.assertOwner(ownerId, recursoId, isAdmin);
        const recurso = await this.getRecursoById(recursoId);
        for (const file of recurso.archivos) {
            const absPath = path.resolve(RECURSOS_UPLOAD_ROOT, file.nombreUnico ?? '');
            if (fs.existsSync(absPath)) {
                await fs_1.promises.unlink(absPath).catch(() => undefined);
            }
        }
        await db.recurso_Auxiliar.delete({ where: { id_recurso: recursoId } });
        return { ok: true };
    }
    async addArchivos(ownerId, recursoId, files) {
        const db = this.prisma;
        await this.assertOwner(ownerId, recursoId);
        if (!files.length)
            return [];
        const uploaded = [];
        for (const file of files) {
            const ext = path.extname(file.originalname).toLowerCase();
            const safeBase = path
                .basename(file.originalname, ext)
                .replace(/[^a-zA-Z0-9._-]/g, '_')
                .slice(0, 80);
            const storedName = `${Date.now()}-${(0, crypto_1.randomUUID)()}-${safeBase}${ext}`;
            const destPath = path.join(RECURSOS_UPLOAD_ROOT, storedName);
            try {
                await fs_1.promises.rename(file.path, destPath);
            }
            catch {
                await fs_1.promises.copyFile(file.path, destPath);
                await fs_1.promises.unlink(file.path).catch(() => undefined);
            }
            const relPath = storedName;
            const archivo = await db.archivo.create({
                data: {
                    url: relPath,
                    nombre_original: file.originalname,
                    nombre_unico: storedName,
                    ruta_relativa: relPath,
                },
            });
            await db.archivo_Recurso_Auxiliar.create({
                data: {
                    id_recurso: recursoId,
                    id_archivo: archivo.id_archivo,
                },
            });
            uploaded.push({
                id: archivo.id_archivo,
                nombre: file.originalname,
                url: `/api/recursos/archivos/${archivo.id_archivo}`,
            });
        }
        return uploaded;
    }
    async deleteArchivo(ownerId, recursoId, archivoId, isAdmin = false) {
        const db = this.prisma;
        await this.assertOwner(ownerId, recursoId, isAdmin);
        const link = await db.archivo_Recurso_Auxiliar.findFirst({
            where: { id_recurso: recursoId, id_archivo: archivoId },
            include: { archivo: true },
        });
        if (!link)
            throw new common_1.NotFoundException('Archivo no encontrado en este recurso');
        await db.archivo_Recurso_Auxiliar.delete({
            where: { id_archivo_recurso: link.id_archivo_recurso },
        });
        const otrosLinks = await db.archivo_Recurso_Auxiliar.count({
            where: { id_archivo: archivoId },
        });
        if (otrosLinks === 0) {
            const absPath = path.resolve(RECURSOS_UPLOAD_ROOT, link.archivo.nombre_unico ?? '');
            if (fs.existsSync(absPath)) {
                await fs_1.promises.unlink(absPath).catch(() => undefined);
            }
            await db.archivo.delete({ where: { id_archivo: archivoId } });
        }
        return { ok: true };
    }
    async serveArchivo(archivoId) {
        const db = this.prisma;
        const archivo = await db.archivo.findUnique({
            where: { id_archivo: archivoId },
        });
        if (!archivo)
            throw new common_1.NotFoundException('Archivo no encontrado');
        const absPath = path.resolve(RECURSOS_UPLOAD_ROOT, archivo.nombre_unico ?? archivo.url);
        if (!fs.existsSync(absPath))
            throw new common_1.NotFoundException('Archivo no encontrado en disco');
        return {
            path: absPath,
            originalName: archivo.nombre_original ?? path.basename(absPath),
        };
    }
    async assertOwner(ownerId, recursoId, isAdmin = false) {
        if (isAdmin)
            return;
        const db = this.prisma;
        const link = await db.usuario_Recurso_Auxiliar.findFirst({
            where: { id_usuario: ownerId, id_recurso_auxiliar: recursoId },
        });
        if (!link)
            throw new common_1.ForbiddenException('No tienes permiso sobre este recurso');
    }
    formatRecurso(r) {
        return {
            id: r.id_recurso,
            nombre: r.nombre,
            descripcion: r.descripcion ?? null,
            tipo: {
                id: r.tipo?.id_tipo_recurso,
                nombre: r.tipo?.nombre_recurso,
            },
            autor: r.usuarios?.[0]?.usuario
                ? {
                    id: r.usuarios[0].usuario.id,
                    nombre: r.usuarios[0].usuario.nombre,
                    correo: r.usuarios[0].usuario.correoInstitucional,
                }
                : null,
            archivos: (r.archivos ?? []).map((a) => ({
                id: a.archivo?.id_archivo,
                nombre: a.archivo?.nombre_original ?? a.archivo?.nombre_unico,
                nombreUnico: a.archivo?.nombre_unico,
                url: `/api/recursos/archivos/${a.archivo?.id_archivo}`,
                downloadUrl: `/api/recursos/archivos/${a.archivo?.id_archivo}?download=1`,
            })),
            createdAt: r.createdAt,
        };
    }
};
exports.RecursosService = RecursosService;
exports.RecursosService = RecursosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecursosService);
//# sourceMappingURL=recursos.service.js.map