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
exports.CursoEspacioController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const curso_espacio_service_1 = require("./curso-espacio.service");
const uid = (req) => Number(req.user?.sub ?? req.user?.id);
let CursoEspacioController = class CursoEspacioController {
    cursoEspacioService;
    constructor(cursoEspacioService) {
        this.cursoEspacioService = cursoEspacioService;
    }
    async listEspacios(cursoId, anio, semestre) {
        const espacios = await this.cursoEspacioService.listEspacios({
            cursoId: cursoId ? Number(cursoId) : undefined,
            anio: anio ? Number(anio) : undefined,
            semestre: semestre ? Number(semestre) : undefined,
        });
        return { ok: true, espacios };
    }
    async createEspacio(req, body) {
        const espacio = await this.cursoEspacioService.createEspacio(uid(req), {
            cursoId: Number(body.cursoId),
            anio: Number(body.anio),
            semestre: Number(body.semestre),
        });
        return { ok: true, espacio };
    }
    async getCatalogo() {
        const catalogo = await this.cursoEspacioService.getCatalogo();
        return { ok: true, catalogo };
    }
    async getDetalle(id) {
        const espacio = await this.cursoEspacioService.getDetalle(Number(id));
        return { ok: true, espacio };
    }
    async listRecursos(id) {
        const recursos = await this.cursoEspacioService.listRecursos(Number(id));
        return { ok: true, recursos };
    }
    async createRecurso(req, id, body) {
        const recurso = await this.cursoEspacioService.createRecurso(uid(req), Number(id), {
            nombre: body.nombre ?? '',
            descripcion: body.descripcion,
            url: body.url ?? '',
            tipoRecursoId: Number(body.tipoRecursoId),
        });
        return { ok: true, recurso };
    }
    async listRepos(req, id) {
        const repos = await this.cursoEspacioService.listRepositorios(uid(req), Number(id));
        return { ok: true, repos };
    }
    async linkRepo(req, id, body) {
        const repo = await this.cursoEspacioService.linkRepositorio(uid(req), Number(id), Number(body.repositorioId));
        return { ok: true, repo };
    }
    async toggleDestacado(req, id, repoId, body) {
        const repo = await this.cursoEspacioService.toggleDestacado(uid(req), Number(id), Number(repoId), Boolean(body.destacado));
        return { ok: true, repo };
    }
    async listAuxiliares(id) {
        const auxiliares = await this.cursoEspacioService.listAuxiliares(Number(id));
        return { ok: true, auxiliares };
    }
    async listEstudiantes(id) {
        const estudiantes = await this.cursoEspacioService.listEstudiantes(Number(id));
        return { ok: true, estudiantes };
    }
    async joinEspacio(req, id) {
        const join = await this.cursoEspacioService.joinEspacio(uid(req), Number(id));
        return { ok: true, join };
    }
    async leaveEspacio(req, id) {
        const result = await this.cursoEspacioService.leaveEspacio(uid(req), Number(id));
        return { ok: true, removed: result.removed };
    }
    async addAuxiliar(req, id, body) {
        const auxiliar = await this.cursoEspacioService.addAuxiliar(uid(req), Number(id), Number(body.userId));
        return { ok: true, auxiliar };
    }
    async removeAuxiliar(req, id, userId) {
        const result = await this.cursoEspacioService.removeAuxiliar(uid(req), Number(id), Number(userId));
        return { ok: true, removed: result.removed };
    }
    async updateEstado(req, id, body) {
        const result = await this.cursoEspacioService.updateEstado(uid(req), Number(id), String(body.estado ?? ''));
        return { ok: true, estado: result.estado };
    }
};
exports.CursoEspacioController = CursoEspacioController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('cursoId')),
    __param(1, (0, common_1.Query)('anio')),
    __param(2, (0, common_1.Query)('semestre')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "listEspacios", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "createEspacio", null);
__decorate([
    (0, common_1.Get)('catalogo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "getCatalogo", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "getDetalle", null);
__decorate([
    (0, common_1.Get)(':id/recursos'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "listRecursos", null);
__decorate([
    (0, common_1.Post)(':id/recursos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "createRecurso", null);
__decorate([
    (0, common_1.Get)(':id/repos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "listRepos", null);
__decorate([
    (0, common_1.Post)(':id/repos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "linkRepo", null);
__decorate([
    (0, common_1.Patch)(':id/repos/:repoId/destacado'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('repoId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "toggleDestacado", null);
__decorate([
    (0, common_1.Get)(':id/auxiliares'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "listAuxiliares", null);
__decorate([
    (0, common_1.Get)(':id/estudiantes'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "listEstudiantes", null);
__decorate([
    (0, common_1.Post)(':id/unirse'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "joinEspacio", null);
__decorate([
    (0, common_1.Patch)(':id/salir'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "leaveEspacio", null);
__decorate([
    (0, common_1.Post)(':id/auxiliares'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "addAuxiliar", null);
__decorate([
    (0, common_1.Patch)(':id/auxiliares/:userId/remove'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "removeAuxiliar", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CursoEspacioController.prototype, "updateEstado", null);
exports.CursoEspacioController = CursoEspacioController = __decorate([
    (0, common_1.Controller)('curso-espacios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [curso_espacio_service_1.CursoEspacioService])
], CursoEspacioController);
//# sourceMappingURL=curso-espacio.controller.js.map