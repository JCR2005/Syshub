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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const crypto_1 = require("crypto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const recursos_service_1 = require("./recursos.service");
const UPLOAD_TMP = path.join(process.cwd(), 'uploads', 'tmp');
if (!fs.existsSync(UPLOAD_TMP))
    fs.mkdirSync(UPLOAD_TMP, { recursive: true });
function uid(req) {
    return Number(req.user?.sub ?? req.user?.id);
}
function isAdmin(req) {
    const roles = req.user?.roles ?? [];
    return roles.some((r) => /admin/i.test(r));
}
const uploadInterceptor = (0, platform_express_1.FileFieldsInterceptor)([{ name: 'files', maxCount: 20 }], {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            if (!fs.existsSync(UPLOAD_TMP))
                fs.mkdirSync(UPLOAD_TMP, { recursive: true });
            cb(null, UPLOAD_TMP);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${Date.now()}-${(0, crypto_1.randomUUID)()}${ext}`);
        },
    }),
    limits: { fileSize: 100 * 1024 * 1024 },
});
let RecursosController = class RecursosController {
    recursosService;
    constructor(recursosService) {
        this.recursosService = recursosService;
    }
    async getTipos() {
        const tipos = await this.recursosService.getTipos();
        return { ok: true, tipos };
    }
    async createTipo(body) {
        const tipo = await this.recursosService.createTipo(body);
        return { ok: true, tipo };
    }
    async deleteTipo(id) {
        return this.recursosService.deleteTipo(Number(id));
    }
    async getRecursos(tipoId, search, page) {
        const result = await this.recursosService.getRecursos({
            tipoId: tipoId ? Number(tipoId) : undefined,
            search,
            page: page ? Number(page) : 1,
        });
        return { ok: true, ...result };
    }
    async getRecurso(id) {
        const recurso = await this.recursosService.getRecursoById(Number(id));
        return { ok: true, recurso };
    }
    async createRecurso(req, body) {
        const recurso = await this.recursosService.createRecurso(uid(req), {
            nombre: body.nombre,
            descripcion: body.descripcion,
            id_tipo_recurso: Number(body.id_tipo_recurso),
        });
        return { ok: true, recurso };
    }
    async updateRecurso(id, req, body) {
        const recurso = await this.recursosService.updateRecurso(uid(req), Number(id), body, isAdmin(req));
        return { ok: true, recurso };
    }
    async deleteRecurso(id, req) {
        return this.recursosService.deleteRecurso(uid(req), Number(id), isAdmin(req));
    }
    async uploadArchivos(id, req, uploadedFiles) {
        const files = uploadedFiles?.files ?? [];
        const uploaded = await this.recursosService.addArchivos(uid(req), Number(id), files);
        return { ok: true, uploaded };
    }
    async deleteArchivo(id, archivoId, req) {
        return this.recursosService.deleteArchivo(uid(req), Number(id), Number(archivoId), isAdmin(req));
    }
    async serveArchivo(archivoId, download, res) {
        const { path: filePath, originalName } = await this.recursosService.serveArchivo(Number(archivoId));
        if (download === '1') {
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
        }
        res.sendFile(filePath);
    }
};
exports.RecursosController = RecursosController;
__decorate([
    (0, common_1.Get)('tipos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "getTipos", null);
__decorate([
    (0, common_1.Post)('tipos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "createTipo", null);
__decorate([
    (0, common_1.Delete)('tipos/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "deleteTipo", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('tipoId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "getRecursos", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "getRecurso", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "createRecurso", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "updateRecurso", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "deleteRecurso", null);
__decorate([
    (0, common_1.Post)(':id/archivos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)(uploadInterceptor),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "uploadArchivos", null);
__decorate([
    (0, common_1.Delete)(':id/archivos/:archivoId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('archivoId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "deleteArchivo", null);
__decorate([
    (0, common_1.Get)('archivos/:archivoId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('archivoId')),
    __param(1, (0, common_1.Query)('download')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecursosController.prototype, "serveArchivo", null);
exports.RecursosController = RecursosController = __decorate([
    (0, common_1.Controller)('recursos'),
    __metadata("design:paramtypes", [recursos_service_1.RecursosService])
], RecursosController);
//# sourceMappingURL=recursos.controller.js.map