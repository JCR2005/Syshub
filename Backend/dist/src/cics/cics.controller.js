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
exports.CicsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const student_info_dto_1 = require("./dto/student-info.dto");
const cics_service_1 = require("./cics.service");
let CicsController = class CicsController {
    cicsService;
    constructor(cicsService) {
        this.cicsService = cicsService;
    }
    async getStudentInfo(dto) {
        const ra = (dto?.ra ?? '').trim();
        const pin = (dto?.pin ?? '').trim();
        if (!ra || !pin) {
            throw new common_1.BadRequestException('Debes enviar carnet (ra) y pin');
        }
        return this.cicsService.getStudentInfo(ra, pin);
    }
};
exports.CicsController = CicsController;
__decorate([
    (0, common_1.Post)('student-info'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [student_info_dto_1.StudentInfoDto]),
    __metadata("design:returntype", Promise)
], CicsController.prototype, "getStudentInfo", null);
exports.CicsController = CicsController = __decorate([
    (0, common_1.Controller)('cics'),
    __metadata("design:paramtypes", [cics_service_1.CicsService])
], CicsController);
//# sourceMappingURL=cics.controller.js.map