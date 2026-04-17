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
exports.SysredditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SysredditService = class SysredditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sanitizeContent(html) {
        if (!html)
            return '';
        let out = String(html).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
        out = out.replace(/ on\w+=\"[\s\S]*?\"/gi, '');
        out = out.replace(/ on\w+=\'[\s\S]*?\'/gi, '');
        return out;
    }
    blogTypeRegex = /blog|art[íi]culo|tutorial|investigaci[oó]n/i;
    async getCategorias() {
        const db = this.prisma;
        const cats = await db.categoriaForo.findMany({
            orderBy: { categoria: 'asc' },
            include: { _count: { select: { hilos: true } } },
        });
        return cats.map((c) => ({
            id: c.id_categoria,
            nombre: c.categoria,
            count: c._count.hilos,
        }));
    }
    async getTipos() {
        const db = this.prisma;
        const tipos = await db.tipoHiloForo.findMany({ orderBy: { tipo: 'asc' } });
        return tipos.map((t) => ({ id: t.id_tipo, nombre: t.tipo }));
    }
    isBlogTypeName(tipo) {
        return this.blogTypeRegex.test(tipo ?? '');
    }
    normalizeTypeText(value) {
        return (value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }
    isArticleTypeName(tipo) {
        const normalized = this.normalizeTypeText(tipo);
        return (normalized.includes('articulo') || normalized.includes('investigacion'));
    }
    isBlogFormatTypeName(tipo) {
        const normalized = this.normalizeTypeText(tipo);
        return normalized.includes('blog') || normalized.includes('tutorial');
    }
    async ensureTipoByName(nombre) {
        const db = this.prisma;
        const existing = await db.tipoHiloForo.findFirst({
            where: { tipo: { equals: nombre, mode: 'insensitive' } },
            select: { id_tipo: true },
        });
        if (existing)
            return existing.id_tipo;
        const created = await db.tipoHiloForo.create({
            data: { tipo: nombre },
            select: { id_tipo: true },
        });
        return created.id_tipo;
    }
    async getBlogTypeIds() {
        const db = this.prisma;
        const tipos = await db.tipoHiloForo.findMany({
            where: {
                OR: [
                    { tipo: { contains: 'blog', mode: 'insensitive' } },
                    { tipo: { contains: 'articulo', mode: 'insensitive' } },
                    { tipo: { contains: 'artículo', mode: 'insensitive' } },
                    { tipo: { contains: 'tutorial', mode: 'insensitive' } },
                    { tipo: { contains: 'investigacion', mode: 'insensitive' } },
                    { tipo: { contains: 'investigación', mode: 'insensitive' } },
                ],
            },
            select: { id_tipo: true, tipo: true },
        });
        return tipos
            .filter((t) => this.isBlogTypeName(t.tipo))
            .map((t) => t.id_tipo);
    }
    async assertBlogHilo(hiloId) {
        const db = this.prisma;
        const hilo = await db.hiloForo.findUnique({
            where: { id_hilo_foro: hiloId },
            include: { tipos: { include: { tipo: { select: { tipo: true } } } } },
        });
        if (!hilo)
            throw new common_1.NotFoundException('Blog/Artículo no encontrado');
        const isBlog = (hilo.tipos ?? []).some((t) => this.isBlogTypeName(t?.tipo?.tipo));
        if (!isBlog) {
            throw new common_1.BadRequestException('El recurso solicitado no es un blog/artículo');
        }
    }
    async getHilos(filters) {
        const db = this.prisma;
        const { categoriaId, search, sortBy = 'hot', page = 1, limit = 20, userId, tipoIds, excludeTipoIds, } = filters;
        const searchTerm = search?.trim();
        const where = {};
        if (categoriaId) {
            where.categorias = { some: { id_categoria: categoriaId } };
        }
        if (tipoIds?.length) {
            where.tipos = { some: { id_tipo: { in: tipoIds } } };
        }
        else if (excludeTipoIds?.length) {
            where.NOT = [{ tipos: { some: { id_tipo: { in: excludeTipoIds } } } }];
        }
        if (searchTerm) {
            where.OR = [
                { nombre_hilo_foro: { contains: searchTerm, mode: 'insensitive' } },
                { contenido: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }
        const orderBy = [{ isPinned: 'desc' }];
        if (sortBy === 'new') {
            orderBy.push({ createdAt: 'desc' });
        }
        else if (sortBy === 'top') {
            orderBy.push({ upvotes: 'desc' });
        }
        else {
            orderBy.push({ upvotes: 'desc' }, { createdAt: 'desc' });
        }
        const [hilos, total] = await Promise.all([
            db.hiloForo.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    autor: {
                        select: {
                            id: true,
                            nombre: true,
                            correoInstitucional: true,
                            rutaFotoPerfil: true,
                            roles: { include: { role: { select: { nombre: true } } } },
                        },
                    },
                    categorias: {
                        include: {
                            categoria: { select: { id_categoria: true, categoria: true } },
                        },
                    },
                    tipos: {
                        include: { tipo: { select: { id_tipo: true, tipo: true } } },
                    },
                    _count: { select: { comentarios: true, valoraciones: true } },
                    valoraciones: userId
                        ? { where: { id_usuario: userId }, select: { valoracion: true } }
                        : false,
                },
            }),
            db.hiloForo.count({ where }),
        ]);
        return {
            hilos: hilos.map((h) => this.formatHilo(h, userId)),
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
    async getForumHilos(filters) {
        const blogTypeIds = await this.getBlogTypeIds();
        return this.getHilos({ ...filters, excludeTipoIds: blogTypeIds });
    }
    async getHiloById(id, userId) {
        const db = this.prisma;
        const hilo = await db.hiloForo.findUnique({
            where: { id_hilo_foro: id },
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        correoInstitucional: true,
                        rutaFotoPerfil: true,
                        roles: { include: { role: { select: { nombre: true } } } },
                    },
                },
                categorias: { include: { categoria: true } },
                tipos: { include: { tipo: true } },
                comentarios: {
                    orderBy: { upvotes: 'desc' },
                    include: {
                        autor: {
                            select: {
                                id: true,
                                nombre: true,
                                correoInstitucional: true,
                                roles: { include: { role: { select: { nombre: true } } } },
                            },
                        },
                        votos: userId
                            ? { where: { userId }, select: { valoracion: true } }
                            : false,
                    },
                },
                valoraciones: userId
                    ? { where: { id_usuario: userId }, select: { valoracion: true } }
                    : false,
                _count: { select: { comentarios: true, valoraciones: true } },
            },
        });
        if (!hilo)
            throw new common_1.NotFoundException('Hilo no encontrado');
        return this.formatHilo(hilo, userId);
    }
    normalizeKind(kind) {
        if (!kind)
            return 'all';
        if (kind === 'blog' || kind === 'articulo')
            return kind;
        return 'all';
    }
    formatEditorialEntry(entry, kind, userId) {
        const userVote = Array.isArray(entry.valoraciones)
            ? entry.valoraciones[0]
            : null;
        return {
            id: kind === 'blog' ? entry.id_blog : entry.id_articulo,
            kind,
            titulo: entry.titulo,
            contenido: entry.contenido,
            coverImageUrl: entry.coverImageUrl ?? null,
            categoria: entry.categoria?.categoria ?? 'General',
            categoriaId: entry.categoria?.id_categoria ?? null,
            tipo: entry.tipo?.tipo ?? null,
            tipoId: entry.tipo?.id_tipo ?? null,
            author: entry.autor?.nombre ?? entry.autor?.correoInstitucional ?? 'Anónimo',
            authorId: entry.autor?.id,
            role: this.resolveRole(entry.autor),
            upvotes: typeof entry.upvotes === 'number' ? entry.upvotes : 0,
            commentCount: entry._count?.comentarios ?? entry.comentarios?.length ?? 0,
            timeAgo: this.timeAgo(entry.createdAt),
            createdAt: entry.createdAt,
            hasUpvoted: userVote?.valoracion === true,
            hasDownvoted: userVote?.valoracion === false,
            comments: Array.isArray(entry.comentarios)
                ? entry.comentarios.map((c) => this.formatEditorialComment(c))
                : undefined,
        };
    }
    formatEditorialComment(c) {
        return {
            id: c.id_comentario,
            author: c.autor?.nombre ?? c.autor?.correoInstitucional ?? 'Anónimo',
            authorId: c.autor?.id,
            role: this.resolveRole(c.autor),
            text: c.comentario,
            upvotes: 0,
            hasUpvoted: false,
            hasDownvoted: false,
            timeAgo: this.timeAgo(c.createdAt),
            createdAt: c.createdAt,
            parentId: null,
            replies: [],
        };
    }
    async getBlogs(filters) {
        const db = this.prisma;
        const { categoriaId, search, sortBy = 'hot', page = 1, limit = 20, userId, } = filters;
        const kind = this.normalizeKind(filters.kind);
        const searchTerm = search?.trim();
        const where = {};
        if (categoriaId)
            where.categoriaId = categoriaId;
        if (searchTerm) {
            where.OR = [
                { titulo: { contains: searchTerm, mode: 'insensitive' } },
                { contenido: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }
        const orderBy = [];
        if (sortBy === 'new')
            orderBy.push({ createdAt: 'desc' });
        else if (sortBy === 'top')
            orderBy.push({ upvotes: 'desc' });
        else
            orderBy.push({ upvotes: 'desc' }, { createdAt: 'desc' });
        const includeBase = {
            autor: {
                select: {
                    id: true,
                    nombre: true,
                    correoInstitucional: true,
                    roles: { include: { role: { select: { nombre: true } } } },
                },
            },
            categoria: { select: { id_categoria: true, categoria: true } },
            tipo: { select: { id_tipo: true, tipo: true } },
            _count: { select: { comentarios: true, valoraciones: true } },
        };
        const includeVotes = userId
            ? { valoraciones: { where: { userId }, select: { valoracion: true } } }
            : { valoraciones: false };
        const take = limit;
        const skip = (page - 1) * limit;
        const [blogs, articulos] = await Promise.all([
            kind === 'articulo'
                ? Promise.resolve([])
                : db.blog.findMany({
                    where,
                    orderBy,
                    skip,
                    take,
                    include: { ...includeBase, ...includeVotes },
                }),
            kind === 'blog'
                ? Promise.resolve([])
                : db.articulo.findMany({
                    where,
                    orderBy,
                    skip,
                    take,
                    include: { ...includeBase, ...includeVotes },
                }),
        ]);
        const items = [
            ...blogs.map((b) => this.formatEditorialEntry(b, 'blog', userId)),
            ...articulos.map((a) => this.formatEditorialEntry(a, 'articulo', userId)),
        ];
        const total = items.length;
        return {
            hilos: items,
            total,
            page,
            pages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async getBlogById(id, userId, kind) {
        const db = this.prisma;
        const resolved = this.normalizeKind(kind);
        const include = {
            autor: {
                select: {
                    id: true,
                    nombre: true,
                    correoInstitucional: true,
                    roles: { include: { role: { select: { nombre: true } } } },
                },
            },
            categoria: { select: { id_categoria: true, categoria: true } },
            tipo: { select: { id_tipo: true, tipo: true } },
            comentarios: {
                orderBy: { createdAt: 'desc' },
                include: {
                    autor: {
                        select: {
                            id: true,
                            nombre: true,
                            correoInstitucional: true,
                            roles: { include: { role: { select: { nombre: true } } } },
                        },
                    },
                },
            },
            _count: { select: { comentarios: true, valoraciones: true } },
        };
        const includeVotes = userId
            ? { valoraciones: { where: { userId }, select: { valoracion: true } } }
            : { valoraciones: false };
        if (resolved !== 'articulo') {
            const blog = await db.blog.findUnique({
                where: { id_blog: id },
                include: { ...include, ...includeVotes },
            });
            if (blog)
                return this.formatEditorialEntry(blog, 'blog', userId);
        }
        if (resolved !== 'blog') {
            const articulo = await db.articulo.findUnique({
                where: { id_articulo: id },
                include: { ...include, ...includeVotes },
            });
            if (articulo)
                return this.formatEditorialEntry(articulo, 'articulo', userId);
        }
        throw new common_1.NotFoundException('Blog/Artículo no encontrado');
    }
    async createBlog(autorId, data) {
        const db = this.prisma;
        const blogTypeIds = await this.getBlogTypeIds();
        let tipoId = data.tipoId;
        if (tipoId) {
            const tipo = await db.tipoHiloForo.findUnique({
                where: { id_tipo: tipoId },
            });
            if (!tipo || !this.isBlogTypeName(tipo.tipo)) {
                throw new common_1.BadRequestException('Para publicar en Blogs/Artículos debes usar un tipo como Blog, Artículo o Tutorial.');
            }
            if (data.formato === 'articulo' && !this.isArticleTypeName(tipo.tipo)) {
                throw new common_1.BadRequestException('El tipo seleccionado no corresponde a Artículo.');
            }
            if (data.formato === 'blog' && !this.isBlogFormatTypeName(tipo.tipo)) {
                throw new common_1.BadRequestException('El tipo seleccionado no corresponde a Blog.');
            }
        }
        else {
            const wantedFormat = data.formato ?? 'blog';
            const tipos = await db.tipoHiloForo.findMany({
                where: blogTypeIds.length
                    ? { id_tipo: { in: blogTypeIds } }
                    : undefined,
                select: { id_tipo: true, tipo: true },
            });
            const preferred = tipos.find((t) => wantedFormat === 'articulo'
                ? this.isArticleTypeName(t.tipo)
                : this.isBlogFormatTypeName(t.tipo));
            if (preferred) {
                tipoId = preferred.id_tipo;
            }
            else {
                tipoId = await this.ensureTipoByName(wantedFormat === 'articulo' ? 'Artículo' : 'Blog');
            }
        }
        const safeContent = this.sanitizeContent(data.contenido);
        const payload = {
            titulo: data.titulo,
            contenido: safeContent,
            categoriaId: data.categoriaId,
            tipoId,
            coverImageUrl: data.coverImageUrl ?? null,
            autorId,
        };
        if (data.formato === 'articulo') {
            const articulo = await db.articulo.create({
                data: payload,
                include: {
                    autor: {
                        select: {
                            id: true,
                            nombre: true,
                            correoInstitucional: true,
                            roles: { include: { role: { select: { nombre: true } } } },
                        },
                    },
                    categoria: { select: { id_categoria: true, categoria: true } },
                    tipo: { select: { id_tipo: true, tipo: true } },
                    _count: { select: { comentarios: true, valoraciones: true } },
                },
            });
            return this.formatEditorialEntry(articulo, 'articulo', autorId);
        }
        const blog = await db.blog.create({
            data: payload,
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        correoInstitucional: true,
                        roles: { include: { role: { select: { nombre: true } } } },
                    },
                },
                categoria: { select: { id_categoria: true, categoria: true } },
                tipo: { select: { id_tipo: true, tipo: true } },
                _count: { select: { comentarios: true, valoraciones: true } },
            },
        });
        return this.formatEditorialEntry(blog, 'blog', autorId);
    }
    async getBlogComentarios(blogId, userId, kind) {
        const db = this.prisma;
        const resolved = this.normalizeKind(kind);
        const include = {
            autor: {
                select: {
                    id: true,
                    nombre: true,
                    correoInstitucional: true,
                    roles: { include: { role: { select: { nombre: true } } } },
                },
            },
        };
        if (resolved !== 'articulo') {
            const comentarios = await db.blogComentario.findMany({
                where: { blogId },
                orderBy: { createdAt: 'desc' },
                include,
            });
            if (comentarios)
                return comentarios.map((c) => this.formatEditorialComment(c));
        }
        const comentarios = await db.articuloComentario.findMany({
            where: { articuloId: blogId },
            orderBy: { createdAt: 'desc' },
            include,
        });
        return comentarios.map((c) => this.formatEditorialComment(c));
    }
    async createBlogComentario(autorId, blogId, texto, _parentId, kind) {
        const db = this.prisma;
        const resolved = this.normalizeKind(kind);
        if (resolved === 'articulo') {
            const comentario = await db.articuloComentario.create({
                data: { articuloId: blogId, autorId, comentario: texto },
                include: {
                    autor: {
                        select: {
                            id: true,
                            nombre: true,
                            correoInstitucional: true,
                            roles: { include: { role: { select: { nombre: true } } } },
                        },
                    },
                },
            });
            return this.formatEditorialComment(comentario);
        }
        const comentario = await db.blogComentario.create({
            data: { blogId, autorId, comentario: texto },
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        correoInstitucional: true,
                        roles: { include: { role: { select: { nombre: true } } } },
                    },
                },
            },
        });
        return this.formatEditorialComment(comentario);
    }
    async votarBlog(userId, blogId, isUp, kind) {
        const db = this.prisma;
        const resolved = this.normalizeKind(kind);
        if (resolved === 'articulo') {
            const articulo = await db.articulo.findUnique({
                where: { id_articulo: blogId },
            });
            if (!articulo)
                throw new common_1.NotFoundException('Artículo no encontrado');
            const existing = await db.articuloValoracion.findUnique({
                where: { articuloId_userId: { articuloId: blogId, userId } },
            });
            const wasRemoved = existing?.valoracion === isUp;
            if (existing) {
                if (existing.valoracion === isUp) {
                    await db.articuloValoracion.delete({
                        where: { articuloId_userId: { articuloId: blogId, userId } },
                    });
                }
                else {
                    await db.articuloValoracion.update({
                        where: { articuloId_userId: { articuloId: blogId, userId } },
                        data: { valoracion: isUp },
                    });
                }
            }
            else {
                await db.articuloValoracion.create({
                    data: { articuloId: blogId, userId, valoracion: isUp },
                });
                await db.articuloUser.upsert({
                    where: { articuloId_userId: { articuloId: blogId, userId } },
                    create: { articuloId: blogId, userId },
                    update: {},
                });
            }
            const [ups, downs] = await Promise.all([
                db.articuloValoracion.count({
                    where: { articuloId: blogId, valoracion: true },
                }),
                db.articuloValoracion.count({
                    where: { articuloId: blogId, valoracion: false },
                }),
            ]);
            const netScore = ups - downs;
            await db.articulo.update({
                where: { id_articulo: blogId },
                data: { upvotes: netScore },
            });
            return {
                id: blogId,
                upvotes: netScore,
                hasUpvoted: !wasRemoved && isUp,
                hasDownvoted: !wasRemoved && !isUp,
                action: wasRemoved ? 'removed' : 'voted',
            };
        }
        const blog = await db.blog.findUnique({ where: { id_blog: blogId } });
        if (!blog)
            throw new common_1.NotFoundException('Blog no encontrado');
        const existing = await db.blogValoracion.findUnique({
            where: { blogId_userId: { blogId, userId } },
        });
        const wasRemoved = existing?.valoracion === isUp;
        if (existing) {
            if (existing.valoracion === isUp) {
                await db.blogValoracion.delete({
                    where: { blogId_userId: { blogId, userId } },
                });
            }
            else {
                await db.blogValoracion.update({
                    where: { blogId_userId: { blogId, userId } },
                    data: { valoracion: isUp },
                });
            }
        }
        else {
            await db.blogValoracion.create({
                data: { blogId, userId, valoracion: isUp },
            });
            await db.blogUser.upsert({
                where: { blogId_userId: { blogId, userId } },
                create: { blogId, userId },
                update: {},
            });
        }
        const [ups, downs] = await Promise.all([
            db.blogValoracion.count({ where: { blogId, valoracion: true } }),
            db.blogValoracion.count({ where: { blogId, valoracion: false } }),
        ]);
        const netScore = ups - downs;
        await db.blog.update({
            where: { id_blog: blogId },
            data: { upvotes: netScore },
        });
        return {
            id: blogId,
            upvotes: netScore,
            hasUpvoted: !wasRemoved && isUp,
            hasDownvoted: !wasRemoved && !isUp,
            action: wasRemoved ? 'removed' : 'voted',
        };
    }
    async createHilo(autorId, data) {
        const db = this.prisma;
        const cat = await db.categoriaForo.findUnique({
            where: { id_categoria: data.categoriaId },
        });
        if (!cat)
            throw new common_1.NotFoundException('Categoría no encontrada');
        const safeContent = this.sanitizeContent(data.contenido);
        const hilo = await db.hiloForo.create({
            data: {
                nombre_hilo_foro: data.titulo,
                contenido: safeContent,
                coverImageUrl: data.coverImageUrl ?? null,
                autorId,
                categorias: {
                    create: [{ id_categoria: data.categoriaId }],
                },
                tipos: data.tipoId ? { create: [{ id_tipo: data.tipoId }] } : undefined,
                usuarios: {
                    create: [{ id_usuario: autorId }],
                },
            },
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        correoInstitucional: true,
                        roles: { include: { role: true } },
                    },
                },
                categorias: { include: { categoria: true } },
                tipos: { include: { tipo: true } },
                _count: { select: { comentarios: true, valoraciones: true } },
            },
        });
        return this.formatHilo(hilo, autorId);
    }
    async updateHilo(userId, hiloId, data, isAdmin = false) {
        const db = this.prisma;
        const hilo = await db.hiloForo.findUnique({
            where: { id_hilo_foro: hiloId },
        });
        if (!hilo)
            throw new common_1.NotFoundException('Hilo no encontrado');
        if (!isAdmin && hilo.autorId !== userId)
            throw new common_1.ForbiddenException('Sin permiso para editar');
        const updateData = {};
        if (data.titulo)
            updateData.nombre_hilo_foro = data.titulo;
        if (data.contenido)
            updateData.contenido = this.sanitizeContent(data.contenido);
        if (data.coverImageUrl !== undefined)
            updateData.coverImageUrl = data.coverImageUrl;
        if (data.categoriaId !== undefined) {
            await db.hiloForo_Categoria.deleteMany({
                where: { id_hilo_foro: hiloId },
            });
            updateData.categorias = { create: [{ id_categoria: data.categoriaId }] };
        }
        if (data.tipoId !== undefined) {
            await db.hiloForo_Tipo.deleteMany({ where: { id_hilo_foro: hiloId } });
            updateData.tipos = { create: [{ id_tipo: data.tipoId }] };
        }
        return db.hiloForo.update({
            where: { id_hilo_foro: hiloId },
            data: updateData,
            include: {
                autor: { select: { id: true, nombre: true } },
                categorias: { include: { categoria: true } },
                tipos: { include: { tipo: true } },
                _count: { select: { comentarios: true } },
            },
        });
    }
    async updateBlog(userId, blogId, data, kind = 'blog', isAdmin = false) {
        const db = this.prisma;
        if (kind === 'articulo') {
            const articulo = await db.articulo.findUnique({
                where: { id_articulo: blogId },
            });
            if (!articulo)
                throw new common_1.NotFoundException('Artículo no encontrado');
            if (!isAdmin && articulo.autorId !== userId)
                throw new common_1.ForbiddenException('Sin permiso para editar');
            const updateData = {};
            if (data.titulo)
                updateData.titulo = data.titulo;
            if (data.contenido)
                updateData.contenido = this.sanitizeContent(data.contenido);
            if (data.categoriaId !== undefined)
                updateData.categoriaId = data.categoriaId;
            if (data.tipoId !== undefined)
                updateData.tipoId = data.tipoId;
            if (data.coverImageUrl !== undefined)
                updateData.coverImageUrl = data.coverImageUrl;
            const updated = await db.articulo.update({
                where: { id_articulo: blogId },
                data: updateData,
                include: {
                    autor: {
                        select: {
                            id: true,
                            nombre: true,
                            correoInstitucional: true,
                            roles: { include: { role: { select: { nombre: true } } } },
                        },
                    },
                    categoria: { select: { id_categoria: true, categoria: true } },
                    tipo: { select: { id_tipo: true, tipo: true } },
                    _count: { select: { comentarios: true, valoraciones: true } },
                },
            });
            return this.formatEditorialEntry(updated, 'articulo', userId);
        }
        const blog = await db.blog.findUnique({ where: { id_blog: blogId } });
        if (!blog)
            throw new common_1.NotFoundException('Blog no encontrado');
        if (!isAdmin && blog.autorId !== userId)
            throw new common_1.ForbiddenException('Sin permiso para editar');
        const updateData = {};
        if (data.titulo)
            updateData.titulo = data.titulo;
        if (data.contenido)
            updateData.contenido = this.sanitizeContent(data.contenido);
        if (data.categoriaId !== undefined)
            updateData.categoriaId = data.categoriaId;
        if (data.tipoId !== undefined)
            updateData.tipoId = data.tipoId;
        if (data.coverImageUrl !== undefined)
            updateData.coverImageUrl = data.coverImageUrl;
        const updated = await db.blog.update({
            where: { id_blog: blogId },
            data: updateData,
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        correoInstitucional: true,
                        roles: { include: { role: { select: { nombre: true } } } },
                    },
                },
                categoria: { select: { id_categoria: true, categoria: true } },
                tipo: { select: { id_tipo: true, tipo: true } },
                _count: { select: { comentarios: true, valoraciones: true } },
            },
        });
        return this.formatEditorialEntry(updated, 'blog', userId);
    }
    async deleteHilo(userId, hiloId, isAdmin = false) {
        const db = this.prisma;
        const hilo = await db.hiloForo.findUnique({
            where: { id_hilo_foro: hiloId },
        });
        if (!hilo)
            throw new common_1.NotFoundException('Hilo no encontrado');
        if (!isAdmin && hilo.autorId !== userId)
            throw new common_1.ForbiddenException('Sin permiso');
        await db.hiloForo.delete({ where: { id_hilo_foro: hiloId } });
        return { ok: true };
    }
    async pinHilo(hiloId, isPinned) {
        const db = this.prisma;
        return db.hiloForo.update({
            where: { id_hilo_foro: hiloId },
            data: { isPinned },
            select: { id_hilo_foro: true, isPinned: true },
        });
    }
    async featureHilo(hiloId, isFeatured) {
        const db = this.prisma;
        return db.hiloForo.update({
            where: { id_hilo_foro: hiloId },
            data: { isFeatured },
            select: { id_hilo_foro: true, isFeatured: true },
        });
    }
    async reportHilo(hiloId, reportado) {
        const db = this.prisma;
        return db.hiloForo.update({
            where: { id_hilo_foro: hiloId },
            data: { reportado },
            select: { id_hilo_foro: true, reportado: true },
        });
    }
    async votar(userId, hiloId, isUp) {
        const db = this.prisma;
        const hilo = await db.hiloForo.findUnique({
            where: { id_hilo_foro: hiloId },
        });
        if (!hilo)
            throw new common_1.NotFoundException('Hilo no encontrado');
        const existing = await db.valoracionHiloForo.findUnique({
            where: {
                id_hilo_foro_id_usuario: { id_hilo_foro: hiloId, id_usuario: userId },
            },
        });
        const wasRemoved = existing?.valoracion === isUp;
        if (existing) {
            if (existing.valoracion === isUp) {
                await db.valoracionHiloForo.delete({
                    where: {
                        id_hilo_foro_id_usuario: {
                            id_hilo_foro: hiloId,
                            id_usuario: userId,
                        },
                    },
                });
            }
            else {
                await db.valoracionHiloForo.update({
                    where: {
                        id_hilo_foro_id_usuario: {
                            id_hilo_foro: hiloId,
                            id_usuario: userId,
                        },
                    },
                    data: { valoracion: isUp },
                });
            }
        }
        else {
            await db.valoracionHiloForo.create({
                data: { id_hilo_foro: hiloId, id_usuario: userId, valoracion: isUp },
            });
            await db.hiloForo_Usuario.upsert({
                where: {
                    id_hilo_foro_id_usuario: { id_hilo_foro: hiloId, id_usuario: userId },
                },
                create: { id_hilo_foro: hiloId, id_usuario: userId },
                update: {},
            });
        }
        const [ups, downs] = await Promise.all([
            db.valoracionHiloForo.count({
                where: { id_hilo_foro: hiloId, valoracion: true },
            }),
            db.valoracionHiloForo.count({
                where: { id_hilo_foro: hiloId, valoracion: false },
            }),
        ]);
        const netScore = ups - downs;
        await db.hiloForo.update({
            where: { id_hilo_foro: hiloId },
            data: { upvotes: netScore },
        });
        return {
            id: hiloId,
            upvotes: netScore,
            hasUpvoted: !wasRemoved && isUp,
            hasDownvoted: !wasRemoved && !isUp,
            action: wasRemoved ? 'removed' : 'voted',
        };
    }
    async getComentarios(hiloId, userId) {
        const db = this.prisma;
        const hilo = await db.hiloForo.findUnique({
            where: { id_hilo_foro: hiloId },
        });
        if (!hilo)
            throw new common_1.NotFoundException('Hilo no encontrado');
        const comentarios = await db.comentarioHiloForo.findMany({
            where: { id_hilo_foro: hiloId, parentId: null },
            orderBy: { upvotes: 'desc' },
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        correoInstitucional: true,
                        roles: { include: { role: { select: { nombre: true } } } },
                    },
                },
                votos: userId
                    ? { where: { userId }, select: { valoracion: true } }
                    : false,
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        autor: {
                            select: {
                                id: true,
                                nombre: true,
                                correoInstitucional: true,
                                roles: { include: { role: { select: { nombre: true } } } },
                            },
                        },
                        votos: userId
                            ? { where: { userId }, select: { valoracion: true } }
                            : false,
                    },
                },
            },
        });
        return comentarios.map((c) => this.formatComentario(c, userId));
    }
    async createComentario(autorId, hiloId, texto, parentId) {
        const db = this.prisma;
        const hilo = await db.hiloForo.findUnique({
            where: { id_hilo_foro: hiloId },
        });
        if (!hilo)
            throw new common_1.NotFoundException('Hilo no encontrado');
        if (parentId) {
            const parent = await db.comentarioHiloForo.findUnique({
                where: { id_comentario: parentId },
            });
            if (!parent)
                throw new common_1.NotFoundException('Comentario padre no encontrado');
            if (parent.id_hilo_foro !== hiloId)
                throw new common_1.ForbiddenException('El comentario padre no pertenece a este hilo');
            if (parent.parentId)
                throw new common_1.BadRequestException('Solo se permite un nivel de respuestas');
        }
        const comentario = await db.comentarioHiloForo.create({
            data: {
                id_hilo_foro: hiloId,
                id_usuario: autorId,
                comentario: texto,
                parentId: parentId ?? null,
            },
            include: {
                autor: {
                    select: {
                        id: true,
                        nombre: true,
                        correoInstitucional: true,
                        roles: { include: { role: true } },
                    },
                },
                replies: {
                    include: {
                        autor: {
                            select: {
                                id: true,
                                nombre: true,
                                correoInstitucional: true,
                                roles: { include: { role: true } },
                            },
                        },
                    },
                },
            },
        });
        await db.hiloForo_Usuario
            .upsert({
            where: {
                id_hilo_foro_id_usuario: {
                    id_hilo_foro: hiloId,
                    id_usuario: autorId,
                },
            },
            create: { id_hilo_foro: hiloId, id_usuario: autorId },
            update: {},
        })
            .catch(() => undefined);
        return this.formatComentario(comentario, autorId);
    }
    async deleteComentario(userId, comentarioId, isAdmin = false) {
        const db = this.prisma;
        const c = await db.comentarioHiloForo.findUnique({
            where: { id_comentario: comentarioId },
        });
        if (!c)
            throw new common_1.NotFoundException('Comentario no encontrado');
        if (!isAdmin && c.id_usuario !== userId)
            throw new common_1.ForbiddenException('Sin permiso');
        await db.comentarioHiloForo.delete({
            where: { id_comentario: comentarioId },
        });
        return { ok: true };
    }
    async votarComentario(userId, comentarioId, isUp) {
        const db = this.prisma;
        const c = await db.comentarioHiloForo.findUnique({
            where: { id_comentario: comentarioId },
        });
        if (!c)
            throw new common_1.NotFoundException('Comentario no encontrado');
        const existing = await db.valoracionComentario.findUnique({
            where: { comentarioId_userId: { comentarioId, userId } },
        });
        let delta = 0;
        const wasRemoved = existing?.valoracion === isUp;
        if (existing) {
            if (existing.valoracion === isUp) {
                await db.valoracionComentario.delete({
                    where: { comentarioId_userId: { comentarioId, userId } },
                });
                delta = isUp ? -1 : 1;
            }
            else {
                await db.valoracionComentario.update({
                    where: { comentarioId_userId: { comentarioId, userId } },
                    data: { valoracion: isUp },
                });
                delta = isUp ? 2 : -2;
            }
        }
        else {
            await db.valoracionComentario.create({
                data: { comentarioId, userId, valoracion: isUp },
            });
            delta = isUp ? 1 : -1;
        }
        const updated = await db.comentarioHiloForo.update({
            where: { id_comentario: comentarioId },
            data: { upvotes: { increment: delta } },
            select: { id_comentario: true, upvotes: true },
        });
        return {
            ...updated,
            hasUpvoted: !wasRemoved && isUp,
            hasDownvoted: !wasRemoved && !isUp,
            action: wasRemoved ? 'removed' : 'voted',
        };
    }
    async getStats() {
        const db = this.prisma;
        const [hilos, comentarios, categorias] = await Promise.all([
            db.hiloForo.count(),
            db.comentarioHiloForo.count(),
            db.categoriaForo.count(),
        ]);
        return { hilos, comentarios, categorias };
    }
    resolveRole(user) {
        if (!user?.roles?.length)
            return 'Student';
        const names = user.roles.map((r) => r?.role?.nombre ?? '');
        if (names.some((n) => /admin/i.test(n)))
            return 'Admin';
        if (names.some((n) => /mod/i.test(n)))
            return 'Moderador';
        if (names.some((n) => /aux/i.test(n)))
            return 'Auxiliar';
        return 'Student';
    }
    formatHilo(h, userId) {
        const userVote = Array.isArray(h.valoraciones) ? h.valoraciones[0] : null;
        const upvotes = typeof h.upvotes === 'number' ? h.upvotes : 0;
        return {
            id: h.id_hilo_foro,
            titulo: h.nombre_hilo_foro,
            contenido: h.contenido,
            categoria: h.categorias?.[0]?.categoria?.categoria ?? 'General',
            categoriaId: h.categorias?.[0]?.categoria?.id_categoria ?? null,
            tipo: h.tipos?.[0]?.tipo?.tipo ?? null,
            tipoId: h.tipos?.[0]?.tipo?.id_tipo ?? null,
            author: h.autor?.nombre ?? h.autor?.correoInstitucional ?? 'Anónimo',
            authorId: h.autor?.id,
            coverImageUrl: h.coverImageUrl ?? null,
            role: this.resolveRole(h.autor),
            upvotes,
            commentCount: h._count?.comentarios ?? h.comentarios?.length ?? 0,
            timeAgo: this.timeAgo(h.createdAt),
            createdAt: h.createdAt,
            hasUpvoted: userVote?.valoracion === true,
            hasDownvoted: userVote?.valoracion === false,
            isFeatured: h.isFeatured,
            isPinned: h.isPinned,
            hasReports: h.reportado,
            comments: Array.isArray(h.comentarios)
                ? h.comentarios.map((c) => this.formatComentario(c, userId))
                : undefined,
        };
    }
    formatComentario(c, userId) {
        const userVote = Array.isArray(c.votos) ? c.votos[0] : null;
        return {
            id: c.id_comentario,
            author: c.autor?.nombre ?? c.autor?.correoInstitucional ?? 'Anónimo',
            authorId: c.autor?.id,
            role: this.resolveRole(c.autor),
            text: c.comentario,
            upvotes: c.upvotes,
            hasUpvoted: userVote?.valoracion === true,
            hasDownvoted: userVote?.valoracion === false,
            timeAgo: this.timeAgo(c.createdAt),
            createdAt: c.createdAt,
            parentId: c.parentId ?? null,
            replies: Array.isArray(c.replies)
                ? c.replies.map((r) => this.formatComentario(r, userId))
                : [],
        };
    }
    timeAgo(date) {
        const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (s < 60)
            return 'ahora';
        if (s < 3600)
            return `hace ${Math.floor(s / 60)}min`;
        if (s < 86400)
            return `hace ${Math.floor(s / 3600)}h`;
        if (s < 604800)
            return `hace ${Math.floor(s / 86400)}d`;
        return `hace ${Math.floor(s / 604800)}sem`;
    }
    async createCategoria(nombre) {
        const db = this.prisma;
        const clean = (nombre ?? '').trim();
        if (!clean)
            throw new common_1.BadRequestException('El nombre es requerido');
        const existing = await db.categoriaForo.findUnique({
            where: { categoria: clean },
        });
        if (existing)
            throw new common_1.BadRequestException('La categoría ya existe');
        const created = await db.categoriaForo.create({
            data: { categoria: clean },
            select: { id_categoria: true, categoria: true },
        });
        return { id: created.id_categoria, nombre: created.categoria };
    }
    async deleteCategoria(id) {
        const db = this.prisma;
        const linked = await db.hiloForo_Categoria.count({
            where: { id_categoria: id },
        });
        if (linked > 0)
            throw new common_1.BadRequestException('Tiene hilos asociados, no se puede eliminar');
        await db.categoriaForo.delete({ where: { id_categoria: id } });
        return { ok: true };
    }
    async createTipo(nombre) {
        const db = this.prisma;
        const clean = (nombre ?? '').trim();
        if (!clean)
            throw new common_1.BadRequestException('El nombre es requerido');
        const existing = await db.tipoHiloForo.findUnique({
            where: { tipo: clean },
        });
        if (existing)
            throw new common_1.BadRequestException('El tipo ya existe');
        const created = await db.tipoHiloForo.create({
            data: { tipo: clean },
            select: { id_tipo: true, tipo: true },
        });
        return { id: created.id_tipo, nombre: created.tipo };
    }
    async deleteTipo(id) {
        const db = this.prisma;
        const linked = await db.hiloForo_Tipo.count({ where: { id_tipo: id } });
        if (linked > 0)
            throw new common_1.BadRequestException('Tiene hilos asociados, no se puede eliminar');
        await db.tipoHiloForo.delete({ where: { id_tipo: id } });
        return { ok: true };
    }
};
exports.SysredditService = SysredditService;
exports.SysredditService = SysredditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SysredditService);
//# sourceMappingURL=Sysreddit.service.js.map