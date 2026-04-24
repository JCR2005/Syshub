"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CicsService = void 0;
const common_1 = require("@nestjs/common");
let CicsService = class CicsService {
    baseUrl = process.env.CICS_API_BASE?.replace(/\/+$/, '') ||
        'https://cics.cunoc.edu.gt/api';
    async getStudentInfo(ra, pin) {
        const url = `${this.baseUrl}/auth/student-info?ra=${encodeURIComponent(ra)}&pin=${encodeURIComponent(pin)}`;
        let response;
        try {
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });
        }
        catch {
            throw new common_1.BadGatewayException('No se pudo conectar con el servicio académico CICS');
        }
        let payload = null;
        try {
            const parsed = await response.json();
            if (parsed && typeof parsed === 'object') {
                payload = parsed;
            }
        }
        catch {
            payload = null;
        }
        if (!response.ok) {
            const upstreamMessage = this.extractMessage(payload);
            if (response.status === 401 || response.status === 403) {
                throw new common_1.UnauthorizedException(upstreamMessage || 'Credenciales CICS inválidas');
            }
            throw new common_1.BadGatewayException(upstreamMessage ||
                'No se pudo obtener información académica desde CICS');
        }
        return {
            ok: true,
            data: payload,
        };
    }
    extractMessage(payload) {
        if (!payload)
            return '';
        const message = payload.message;
        if (typeof message === 'string')
            return message;
        const error = payload.error;
        if (error && typeof error === 'object') {
            const nestedMessage = error.message;
            if (typeof nestedMessage === 'string')
                return nestedMessage;
        }
        return '';
    }
};
exports.CicsService = CicsService;
exports.CicsService = CicsService = __decorate([
    (0, common_1.Injectable)()
], CicsService);
//# sourceMappingURL=cics.service.js.map