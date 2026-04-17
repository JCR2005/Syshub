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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SysredditController = void 0;
const common_1 = require("@nestjs/common");
const Sysreddit_service_1 = require("./Sysreddit.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const blogCoverUploadPath = (0, path_1.join)(process.cwd(), 'uploads', 'blog-covers');
const ensureDir = (p) => {
    if (!(0, fs_1.existsSync)(p))
        (0, fs_1.mkdirSync)(p, { recursive: true });
};
function uid(req) {
    return Number(req.user?.sub ?? req.user?.id);
}
function isAdmin(req) {
    const roles = req.user?.roles ?? [];
    return roles.some((r) => /admin|mod/i.test(r));
}
function isAuxiliar(req) {
    const roles = req.user?.roles ?? [];
    return roles.some((r) => /aux|admin|mod/i.test(r));
}
function canPublishBlog(req) {
    if (isAuxiliar(req))
        return true;
    const roles = (req.user?.roles ?? []).map((r) => String(r ?? '').toLowerCase());
    const isStudent = roles.some((r) => /comun|estudiante|student/.test(r));
    const hasEditorialPermission = roles.some((r) => /publicador|editor|autor[_-]?blog|permiso[_-]?blog|blog[_-]?writer/.test(r));
    return isStudent && hasEditorialPermission;
}
let SysredditController = class SysredditController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getCategorias() {
        const categorias = await this.service.getCategorias();
        return { ok: true, categorias };
    }
    async getTipos() {
        const tipos = await this.service.getTipos();
        return { ok: true, tipos };
    }
    async getStats() {
        const stats = await this.service.getStats();
        return { ok: true, stats };
    }
    async getHilos(req, categoriaId, search, sortBy, page) {
        const result = await this.service.getForumHilos({
            categoriaId: categoriaId ? Number(categoriaId) : undefined,
            search,
            sortBy,
            page: page ? Number(page) : 1,
            userId: uid(req),
        });
        return { ok: true, ...result };
    }
    async getHilo(id, req) {
        const hilo = await this.service.getHiloById(Number(id), uid(req));
        return { ok: true, hilo };
    }
    async getBlogs(req, categoriaId, search, sortBy, page, kind) {
        const result = await this.service.getBlogs({
            categoriaId: categoriaId ? Number(categoriaId) : undefined,
            search,
            sortBy,
            page: page ? Number(page) : 1,
            userId: uid(req),
            kind: kind ?? 'blog',
        });
        return { ok: true, ...result };
    }
    async getArticulos(req, categoriaId, search, sortBy, page) {
        const result = await this.service.getBlogs({
            categoriaId: categoriaId ? Number(categoriaId) : undefined,
            search,
            sortBy,
            page: page ? Number(page) : 1,
            userId: uid(req),
            kind: 'articulo',
        });
        return { ok: true, ...result };
    }
    async getBlog(id, req, kind) {
        const blog = await this.service.getBlogById(Number(id), uid(req), kind);
        return { ok: true, blog };
    }
    async getArticulo(id, req) {
        const articulo = await this.service.getBlogById(Number(id), uid(req), 'articulo');
        return { ok: true, articulo };
    }
    async createBlog(req, body) {
        if (!canPublishBlog(req)) {
            throw new common_1.ForbiddenException('Solo auxiliares/admin/mod o estudiantes con permiso editorial pueden publicar blogs/artículos.');
        }
        const blog = await this.service.createBlog(uid(req), body);
        return { ok: true, blog };
    }
    async createArticulo(req, body) {
        if (!canPublishBlog(req)) {
            throw new common_1.ForbiddenException('Solo auxiliares/admin/mod o estudiantes con permiso editorial pueden publicar artículos.');
        }
        const articulo = await this.service.createBlog(uid(req), {
            ...body,
            formato: 'articulo',
        });
        return { ok: true, articulo };
    }
    async uploadBlogCover(file) {
        const url = file ? `/uploads/blog-covers/${file.filename}` : null;
        return { ok: true, url };
    }
    async votarBlog(id, req, body, kind) {
        const result = await this.service.votarBlog(uid(req), Number(id), body.isUp, kind);
        return { ok: true, ...result };
    }
    async votarArticulo(id, req, body) {
        const result = await this.service.votarBlog(uid(req), Number(id), body.isUp, 'articulo');
        return { ok: true, ...result };
    }
    async getBlogComentarios(id, req, kind) {
        const comentarios = await this.service.getBlogComentarios(Number(id), uid(req), kind);
        return { ok: true, comentarios };
    }
    async getArticuloComentarios(id, req) {
        const comentarios = await this.service.getBlogComentarios(Number(id), uid(req), 'articulo');
        return { ok: true, comentarios };
    }
    async createBlogComentario(id, req, body, kind) {
        const comentario = await this.service.createBlogComentario(uid(req), Number(id), body.texto, body.parentId, kind);
        return { ok: true, comentario };
    }
    async createArticuloComentario(id, req, body) {
        const comentario = await this.service.createBlogComentario(uid(req), Number(id), body.texto, undefined, 'articulo');
        return { ok: true, comentario };
    }
    async createHilo(req, body) {
        const hilo = await this.service.createHilo(uid(req), body);
        return { ok: true, hilo };
    }
    async updateHilo(id, req, body) {
        const hilo = await this.service.updateHilo(uid(req), Number(id), body, isAdmin(req));
        return { ok: true, hilo };
    }
    async updateBlog(id, req, kind = 'blog', body) {
        const blog = await this.service.updateBlog(uid(req), Number(id), body, kind, isAdmin(req));
        return { ok: true, blog };
    }
    async updateArticulo(id, req, body) {
        const articulo = await this.service.updateBlog(uid(req), Number(id), body, 'articulo', isAdmin(req));
        return { ok: true, articulo };
    }
    async deleteHilo(id, req) {
        return this.service.deleteHilo(uid(req), Number(id), isAdmin(req));
    }
    async pinHilo(id, body) {
        const result = await this.service.pinHilo(Number(id), body.isPinned);
        return { ok: true, ...result };
    }
    async featureHilo(id, body) {
        const result = await this.service.featureHilo(Number(id), body.isFeatured);
        return { ok: true, ...result };
    }
    async reportHilo(id, body) {
        const result = await this.service.reportHilo(Number(id), body.reportado);
        return { ok: true, ...result };
    }
    async votar(id, req, body) {
        const result = await this.service.votar(uid(req), Number(id), body.isUp);
        return { ok: true, ...result };
    }
    async getComentarios(id, req) {
        const comentarios = await this.service.getComentarios(Number(id), uid(req));
        return { ok: true, comentarios };
    }
    async createComentario(id, req, body) {
        const comentario = await this.service.createComentario(uid(req), Number(id), body.texto, body.parentId);
        return { ok: true, comentario };
    }
    async deleteComentario(id, req) {
        return this.service.deleteComentario(uid(req), Number(id), isAdmin(req));
    }
    async votarComentario(id, req, body) {
        const result = await this.service.votarComentario(uid(req), Number(id), body.isUp);
        return { ok: true, ...result };
    }
    async createCategoria(body) {
        const result = await this.service.createCategoria(body.categoria);
        return { ok: true, categoria: result };
    }
    async deleteCategoria(id) {
        return this.service.deleteCategoria(Number(id));
    }
    async createTipo(body) {
        const result = await this.service.createTipo(body.tipo);
        return { ok: true, tipo: result };
    }
    async deleteTipo(id) {
        return this.service.deleteTipo(Number(id));
    }
};
exports.SysredditController = SysredditController;
__decorate([
    (0, common_1.Get)('categorias'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getCategorias", null);
__decorate([
    (0, common_1.Get)('tipos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getTipos", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('hilos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('categoriaId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getHilos", null);
__decorate([
    (0, common_1.Get)('hilos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getHilo", null);
__decorate([
    (0, common_1.Get)('blogs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('categoriaId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getBlogs", null);
__decorate([
    (0, common_1.Get)('articulos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('categoriaId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getArticulos", null);
__decorate([
    (0, common_1.Get)('blogs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getBlog", null);
__decorate([
    (0, common_1.Get)('articulos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getArticulo", null);
__decorate([
    (0, common_1.Post)('blogs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "createBlog", null);
__decorate([
    (0, common_1.Post)('articulos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "createArticulo", null);
__decorate([
    (0, common_1.Post)('blogs/cover'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                ensureDir(blogCoverUploadPath);
                cb(null, blogCoverUploadPath);
            },
            filename: (_req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const ext = (0, path_1.extname)(file.originalname).toLowerCase();
                cb(null, `blog-cover-${uniqueSuffix}${ext}`);
            },
        }),
        limits: { fileSize: 3 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            if (!allowed.includes(ext)) {
                return cb(new Error('Formato de imagen no permitido'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "uploadBlogCover", null);
__decorate([
    (0, common_1.Post)('blogs/:id/votar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "votarBlog", null);
__decorate([
    (0, common_1.Post)('articulos/:id/votar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "votarArticulo", null);
__decorate([
    (0, common_1.Get)('blogs/:id/comentarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getBlogComentarios", null);
__decorate([
    (0, common_1.Get)('articulos/:id/comentarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getArticuloComentarios", null);
__decorate([
    (0, common_1.Post)('blogs/:id/comentarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "createBlogComentario", null);
__decorate([
    (0, common_1.Post)('articulos/:id/comentarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "createArticuloComentario", null);
__decorate([
    (0, common_1.Post)('hilos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "createHilo", null);
__decorate([
    (0, common_1.Patch)('hilos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "updateHilo", null);
__decorate([
    (0, common_1.Patch)('blogs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('kind')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "updateBlog", null);
__decorate([
    (0, common_1.Patch)('articulos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "updateArticulo", null);
__decorate([
    (0, common_1.Delete)('hilos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "deleteHilo", null);
__decorate([
    (0, common_1.Patch)('hilos/:id/pin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "pinHilo", null);
__decorate([
    (0, common_1.Patch)('hilos/:id/feature'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "featureHilo", null);
__decorate([
    (0, common_1.Patch)('hilos/:id/report'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "reportHilo", null);
__decorate([
    (0, common_1.Post)('hilos/:id/votar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "votar", null);
__decorate([
    (0, common_1.Get)('hilos/:id/comentarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "getComentarios", null);
__decorate([
    (0, common_1.Post)('hilos/:id/comentarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "createComentario", null);
__decorate([
    (0, common_1.Delete)('comentarios/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "deleteComentario", null);
__decorate([
    (0, common_1.Post)('comentarios/:id/votar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "votarComentario", null);
__decorate([
    (0, common_1.Post)('admin/categorias'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "createCategoria", null);
__decorate([
    (0, common_1.Delete)('admin/categorias/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "deleteCategoria", null);
__decorate([
    (0, common_1.Post)('admin/tipos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "createTipo", null);
__decorate([
    (0, common_1.Delete)('admin/tipos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SysredditController.prototype, "deleteTipo", null);
exports.SysredditController = SysredditController = __decorate([
    (0, common_1.Controller)('sysreddit'),
    __metadata("design:paramtypes", [Sysreddit_service_1.SysredditService])
], SysredditController);
//# sourceMappingURL=Sysreddit.controller.js.map