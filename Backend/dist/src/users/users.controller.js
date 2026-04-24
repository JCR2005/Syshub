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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async assertAdmin(request) {
        const rawSub = request.user?.sub;
        const userId = typeof rawSub === 'number'
            ? rawSub
            : typeof rawSub === 'string'
                ? Number(rawSub)
                : NaN;
        if (!Number.isFinite(userId)) {
            throw new common_1.UnauthorizedException('Sesión inválida');
        }
        const isAdmin = await this.usersService.hasRole(userId, 'admin');
        if (!isAdmin) {
            throw new common_1.ForbiddenException('Solo administradores pueden acceder');
        }
        return userId;
    }
    findAll() {
        return this.usersService.findAll();
    }
    create(dto) {
        return this.usersService.create(dto);
    }
    async getManagementUsers(request) {
        await this.assertAdmin(request);
        return this.usersService.getAdminManagementUsers();
    }
    async setRole(request, id, body) {
        const actorUserId = await this.assertAdmin(request);
        const targetUserId = Number(id);
        if (!Number.isFinite(targetUserId)) {
            throw new common_1.BadRequestException('ID de usuario inválido');
        }
        if (typeof body.enabled !== 'boolean' || !body.role) {
            throw new common_1.BadRequestException('Payload inválido');
        }
        if (actorUserId === targetUserId &&
            body.role.toLowerCase() === 'admin' &&
            body.enabled === false) {
            throw new common_1.ForbiddenException('No puedes remover tu propio rol admin');
        }
        return this.usersService.setUserRole(targetUserId, body.role, body.enabled);
    }
    async setStatus(request, id, body) {
        const actorUserId = await this.assertAdmin(request);
        const targetUserId = Number(id);
        if (!Number.isFinite(targetUserId)) {
            throw new common_1.BadRequestException('ID de usuario inválido');
        }
        if (typeof body.bloqueado !== 'boolean') {
            throw new common_1.BadRequestException('Payload inválido');
        }
        if (actorUserId === targetUserId && body.bloqueado) {
            throw new common_1.ForbiddenException('No puedes bloquearte a ti mismo');
        }
        return this.usersService.setUserBlocked(targetUserId, body.bloqueado);
    }
    async getSystemClassification(request) {
        await this.assertAdmin(request);
        const classification = await this.usersService.getSystemClassification();
        return { ok: true, classification };
    }
    async createArea(request, body) {
        await this.assertAdmin(request);
        if (!body.pensumId) {
            throw new common_1.BadRequestException('El pensum es requerido');
        }
        const area = await this.usersService.createTechArea({
            nombre: body.nombre ?? '',
            descripcion: body.descripcion,
            pensumId: body.pensumId,
        });
        return { ok: true, area };
    }
    async createPensum(request, body) {
        await this.assertAdmin(request);
        if (!body.carreraId) {
            throw new common_1.BadRequestException('La carrera es requerida');
        }
        const pensum = await this.usersService.createPensum({
            nombre: body.nombre ?? '',
            descripcion: body.descripcion,
            vigente: body.vigente,
            carreraId: Number(body.carreraId),
        });
        return { ok: true, pensum };
    }
    async createCarrera(request, body) {
        await this.assertAdmin(request);
        const carrera = await this.usersService.createCarrera({
            nombre: body.nombre ?? '',
            color: body.color,
        });
        return { ok: true, carrera };
    }
    async deleteCarrera(request, id) {
        await this.assertAdmin(request);
        return this.usersService.deleteCarrera(Number(id));
    }
    async createCourse(request, body) {
        await this.assertAdmin(request);
        const course = await this.usersService.createCourse({
            codigo: body.codigo ?? '',
            nombre: body.nombre ?? '',
            semestre: Number(body.semestre),
            pensumId: Number(body.pensumId),
            areaId: body.areaId === null ? null : Number(body.areaId),
        });
        return { ok: true, course };
    }
    async createTag(request, body) {
        await this.assertAdmin(request);
        const tag = await this.usersService.createTag(body.nombre ?? '');
        return { ok: true, tag };
    }
    async createStack(request, body) {
        await this.assertAdmin(request);
        const stack = await this.usersService.createStack(body.nombre ?? '');
        return { ok: true, stack };
    }
    async updateCourse(request, id, body) {
        await this.assertAdmin(request);
        const course = await this.usersService.updateCourse(Number(id), {
            codigo: body.codigo,
            nombre: body.nombre,
            semestre: body.semestre === undefined ? undefined : Number(body.semestre),
            pensumId: body.pensumId === undefined ? undefined : Number(body.pensumId),
            areaId: body.areaId === undefined
                ? undefined
                : body.areaId === null
                    ? null
                    : Number(body.areaId),
        });
        return { ok: true, course };
    }
    async togglePensumVigency(request, id) {
        await this.assertAdmin(request);
        const pensum = await this.usersService.togglePensumVigency(Number(id));
        return { ok: true, pensum };
    }
    async updateArea(request, id, body) {
        await this.assertAdmin(request);
        const area = await this.usersService.updateTechArea(Number(id), {
            nombre: body.nombre,
            descripcion: body.descripcion,
            color: body.color,
        });
        return { ok: true, area };
    }
    async deleteArea(request, id) {
        await this.assertAdmin(request);
        return this.usersService.deleteTechArea(Number(id));
    }
    async deletePensum(request, id) {
        await this.assertAdmin(request);
        return this.usersService.deletePensum(Number(id));
    }
    async deleteCourse(request, id) {
        await this.assertAdmin(request);
        return this.usersService.deleteCourse(Number(id));
    }
    async deleteTag(request, id) {
        await this.assertAdmin(request);
        return this.usersService.deleteTag(Number(id));
    }
    async deleteStack(request, id) {
        await this.assertAdmin(request);
        return this.usersService.deleteStack(Number(id));
    }
    getProfile(id) {
        return this.usersService.getProfile(Number(id));
    }
    updateProfile(id, dto) {
        return this.usersService.updateProfile(Number(id), dto);
    }
    async uploadProfilePhoto(id, file) {
        const rutaFotoPerfil = file ? `/uploads/${file.filename}` : null;
        await this.usersService.updateProfile(Number(id), {
            rutaFotoPerfil: rutaFotoPerfil ?? undefined,
        });
        return {
            rutaFotoPerfil,
        };
    }
    async setUserRango(id, body) {
        return this.usersService.setUserRango(Number(id), body.rango, body.enabled);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin/management'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getManagementUsers", null);
__decorate([
    (0, common_1.Patch)('admin/:id/role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setRole", null);
__decorate([
    (0, common_1.Patch)('admin/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setStatus", null);
__decorate([
    (0, common_1.Get)('admin/classification'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getSystemClassification", null);
__decorate([
    (0, common_1.Post)('admin/classification/areas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createArea", null);
__decorate([
    (0, common_1.Post)('admin/classification/pensums'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createPensum", null);
__decorate([
    (0, common_1.Post)('admin/classification/carreras'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createCarrera", null);
__decorate([
    (0, common_1.Delete)('admin/classification/carreras/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteCarrera", null);
__decorate([
    (0, common_1.Post)('admin/classification/courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Post)('admin/classification/tags'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createTag", null);
__decorate([
    (0, common_1.Post)('admin/classification/stacks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createStack", null);
__decorate([
    (0, common_1.Patch)('admin/classification/courses/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Patch)('admin/classification/pensums/:id/toggle'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "togglePensumVigency", null);
__decorate([
    (0, common_1.Patch)('admin/classification/areas/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateArea", null);
__decorate([
    (0, common_1.Delete)('admin/classification/areas/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteArea", null);
__decorate([
    (0, common_1.Delete)('admin/classification/pensums/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deletePensum", null);
__decorate([
    (0, common_1.Delete)('admin/classification/courses/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Delete)('admin/classification/tags/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteTag", null);
__decorate([
    (0, common_1.Delete)('admin/classification/stacks/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteStack", null);
__decorate([
    (0, common_1.Get)('profile/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('profile/:id/photo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const ext = (0, path_1.extname)(file.originalname).toLowerCase();
                const rawParam = req.params?.id;
                const userId = typeof rawParam === 'string'
                    ? rawParam
                    : Array.isArray(rawParam)
                        ? rawParam[0]
                        : 'unknown';
                cb(null, `user-${userId}-${uniqueSuffix}${ext}`);
            },
        }),
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            if (!allowed.includes(ext)) {
                return cb(new Error('Formato de imagen no permitido'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadProfilePhoto", null);
__decorate([
    (0, common_1.Patch)('admin/:id/rango'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setUserRango", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map