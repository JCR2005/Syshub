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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoriesController = void 0;
const common_1 = require("@nestjs/common");
const create_repository_dto_1 = require("./dto/create-repository.dto");
const repositories_service_1 = require("./repositories.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const crypto_1 = require("crypto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const archiver_1 = __importDefault(require("archiver"));
function ensureDir(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
const uploadPath = path.join(process.cwd(), 'uploads', 'repositories');
ensureDir(uploadPath);
function extractOwnerId(req) {
    const rawId = req.user?.sub ?? req.user?.id;
    return Number(rawId);
}
function fileFilter(_req, _file, cb) {
    return cb(null, true);
}
const uploadInterceptorOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            ensureDir(uploadPath);
            cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
            const name = `${Date.now()}-${(0, crypto_1.randomUUID)()}${path.extname(file.originalname)}`;
            cb(null, name);
        },
    }),
    fileFilter,
    limits: { fileSize: 80 * 1024 * 1024 },
};
let RepositoriesController = class RepositoriesController {
    repoService;
    constructor(repoService) {
        this.repoService = repoService;
    }
    async streamRepositoryZip(payload, res) {
        const safeRepoName = payload.repositoryName
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${safeRepoName || `repo-${payload.repositoryId}`}.zip"`);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.on('error', () => {
            if (!res.headersSent) {
                res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            res.end();
        });
        archive.pipe(res);
        if (!payload.files.length) {
            archive.append('Repositorio sin archivos.', { name: 'README.txt' });
        }
        payload.files.forEach((file, index) => {
            const safeArchivePath = file.archivePath
                .replace(/\\/g, '/')
                .split('/')
                .filter(Boolean)
                .map((segment) => segment
                .replace(/[^a-zA-Z0-9._-]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_+|_+$/g, ''))
                .filter(Boolean)
                .join('/');
            archive.file(file.absolutePath, {
                name: safeArchivePath || `archivo-${index + 1}`,
            });
        });
        try {
            await archive.finalize();
        }
        catch {
            throw new common_1.InternalServerErrorException('No se pudo generar el ZIP del repositorio');
        }
    }
    async findMine(req) {
        const ownerId = extractOwnerId(req);
        const repositories = await this.repoService.findByOwner(ownerId);
        return { ok: true, repositories };
    }
    async findOptions() {
        const options = await this.repoService.getRepositoryOptions();
        return { ok: true, options };
    }
    async listCommits(id, req) {
        const ownerId = extractOwnerId(req);
        const repositoryId = Number(id);
        const commits = await this.repoService.listRepositoryCommits(ownerId, repositoryId);
        return { ok: true, commits };
    }
    async createCommit(id, req, body) {
        const ownerId = extractOwnerId(req);
        const repositoryId = Number(id);
        const commit = await this.repoService.createRepositoryCommit(ownerId, repositoryId, body.message, 'commit');
        return { ok: true, commit };
    }
    async pushRepository(id, req, body) {
        const ownerId = extractOwnerId(req);
        const repositoryId = Number(id);
        const commit = await this.repoService.createRepositoryCommit(ownerId, repositoryId, body.message, 'push');
        return { ok: true, commit };
    }
    async pullRepository(id, req) {
        const ownerId = extractOwnerId(req);
        const repositoryId = Number(id);
        const result = await this.repoService.pullRepository(ownerId, repositoryId);
        return { ok: true, ...result };
    }
    async updateRepository(id, req, body) {
        const ownerId = extractOwnerId(req);
        const repositoryId = Number(id);
        const repository = await this.repoService.updateRepository(ownerId, repositoryId, {
            nombre: body.nombre,
            descripcion: body.descripcion,
            tags: body.tags,
            stacks: body.stacks,
            visibilidad: body.visibilidad,
        });
        return { ok: true, repository };
    }
    async uploadRepositoryFiles(id, req, body, files) {
        const ownerId = extractOwnerId(req);
        const repositoryId = Number(id);
        const uploaded = await this.repoService.addFilesToRepository(ownerId, repositoryId, files?.files ?? [], Array.isArray(body.relativePaths)
            ? body.relativePaths
            : body.relativePaths
                ? [body.relativePaths]
                : []);
        return { ok: true, uploaded };
    }
    async deleteRepositoryFile(id, fileId, req) {
        const ownerId = extractOwnerId(req);
        const repositoryId = Number(id);
        const parsedFileId = Number(fileId);
        await this.repoService.deleteRepositoryFile(ownerId, repositoryId, parsedFileId);
        return { ok: true };
    }
    async clonePublicRepository(id, res) {
        const repositoryId = Number(id);
        if (Number.isNaN(repositoryId)) {
            throw new common_1.NotFoundException('Repositorio no encontrado');
        }
        const payload = await this.repoService.getPublicRepositoryDownloadPayload(repositoryId);
        if (!payload) {
            throw new common_1.NotFoundException('Repositorio público no encontrado para clonar');
        }
        await this.streamRepositoryZip(payload, res);
    }
    async clonePublicRepositoryByOwner(ownerId, id, res) {
        const repositoryId = Number(id);
        const parsedOwnerId = Number(ownerId);
        if (Number.isNaN(repositoryId) || Number.isNaN(parsedOwnerId)) {
            throw new common_1.NotFoundException('Repositorio no encontrado');
        }
        const payload = await this.repoService.getPublicRepositoryDownloadPayloadByOwner(repositoryId, parsedOwnerId);
        if (!payload) {
            throw new common_1.NotFoundException('Repositorio público no encontrado para el propietario indicado');
        }
        await this.streamRepositoryZip(payload, res);
    }
    async downloadRepository(id, req, res) {
        const ownerId = extractOwnerId(req);
        const repositoryId = Number(id);
        if (Number.isNaN(repositoryId)) {
            throw new common_1.NotFoundException('Repositorio no encontrado');
        }
        const payload = await this.repoService.getRepositoryDownloadPayload(ownerId, repositoryId);
        if (!payload) {
            throw new common_1.NotFoundException('Repositorio no encontrado');
        }
        await this.streamRepositoryZip(payload, res);
    }
    async create(req, body, files) {
        const fileList = files?.files ?? [];
        const ownerId = extractOwnerId(req);
        const repo = await this.repoService.createRepository({
            nombre: body.nombre,
            descripcion: body.descripcion,
            ownerId,
            tags: body.tags,
            stacks: body.stacks,
            categoryId: body.categoryId,
            pensumId: body.pensumId === undefined ? undefined : Number(body.pensumId),
            cursoId: body.cursoId === undefined ? undefined : Number(body.cursoId),
        }, fileList);
        return { ok: true, repository: repo };
    }
    async getReposByEspacio(espacioId, req) {
        const usuarioId = Number(req.user.id || req.user.sub);
        const rolesUsuario = req.user.roles || [];
        const isAuxiliar = rolesUsuario.some((rol) => rol.nombre.toLowerCase() === 'auxiliar' ||
            rol.nombre.toLowerCase() === 'admin');
        return this.repoService.getRepositoriosPorEspacio(Number(espacioId), usuarioId, isAuxiliar);
    }
};
exports.RepositoriesController = RepositoriesController;
__decorate([
    (0, common_1.Get)('mine'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('options'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "findOptions", null);
__decorate([
    (0, common_1.Get)(':id/commits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "listCommits", null);
__decorate([
    (0, common_1.Post)(':id/commit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "createCommit", null);
__decorate([
    (0, common_1.Post)(':id/push'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "pushRepository", null);
__decorate([
    (0, common_1.Post)(':id/pull'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "pullRepository", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "updateRepository", null);
__decorate([
    (0, common_1.Post)(':id/files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'files', maxCount: 200 }], uploadInterceptorOptions)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "uploadRepositoryFiles", null);
__decorate([
    (0, common_1.Delete)(':id/files/:fileId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "deleteRepositoryFile", null);
__decorate([
    (0, common_1.Get)('public/:id/clone'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "clonePublicRepository", null);
__decorate([
    (0, common_1.Get)('public/:ownerId/:id/clone'),
    __param(0, (0, common_1.Param)('ownerId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "clonePublicRepositoryByOwner", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "downloadRepository", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'files', maxCount: 20 }], uploadInterceptorOptions)),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_repository_dto_1.CreateRepositoryDto, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('espacio/:espacioId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('espacioId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RepositoriesController.prototype, "getReposByEspacio", null);
exports.RepositoriesController = RepositoriesController = __decorate([
    (0, common_1.Controller)('repositories'),
    __metadata("design:paramtypes", [repositories_service_1.RepositoriesService])
], RepositoriesController);
//# sourceMappingURL=repositories.controller.js.map