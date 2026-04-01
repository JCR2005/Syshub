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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const mailer_service_1 = require("../mailer/mailer.service");
let UsersService = class UsersService {
    prisma;
    mailer;
    constructor(prisma, mailer) {
        this.prisma = prisma;
        this.mailer = mailer;
    }
    async create(dto) {
        const hashedPassword = await this.hashPassword(dto.contrasena);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    correoInstitucional: dto.correo,
                    contrasena: hashedPassword,
                    nombre: dto.nombre ?? null,
                    edad: dto.edad ?? null,
                    carnet: dto.carnet ?? null,
                },
                select: {
                    id: true,
                    correoInstitucional: true,
                    nombre: true,
                    edad: true,
                    bloqueado: true,
                },
            });
            const role = await tx.role.upsert({
                where: { nombre: 'comun' },
                update: {},
                create: { nombre: 'comun' },
            });
            const rango = await tx.rango.upsert({
                where: { nombre: 'Estudiante' },
                update: {},
                create: { nombre: 'Estudiante' },
            });
            await tx.userRole.createMany({
                data: [{ userId: user.id, roleId: role.id }],
                skipDuplicates: true,
            });
            await tx.userRango.createMany({
                data: [{ userId: user.id, rangoId: rango.id }],
                skipDuplicates: true,
            });
            return user;
        });
    }
    async preRegister(dto) {
        const existente = await this.prisma.user.findUnique({
            where: { correoInstitucional: dto.correo },
        });
        if (existente) {
            return { ok: false, message: 'El correo ya está registrado' };
        }
        const codigo = this.generarCodigo();
        const ahora = new Date();
        const expiracion = new Date(ahora.getTime() + 15 * 60 * 1000);
        await this.prisma.pendingUser.upsert({
            where: { correo: dto.correo },
            update: {
                codigoVerificacion: codigo,
                codigoExpiraEn: expiracion,
                codigoEnviadoEn: ahora,
            },
            create: {
                correo: dto.correo,
                codigoVerificacion: codigo,
                codigoExpiraEn: expiracion,
                codigoEnviadoEn: ahora,
            },
        });
        await this.mailer.sendVerificationEmail(dto.correo, codigo);
        return { ok: true, message: 'Código enviado' };
    }
    async confirmRegister(correo, codigo, contrasena) {
        const pending = await this.prisma.pendingUser.findUnique({
            where: { correo },
        });
        if (!pending) {
            throw new common_1.NotFoundException('No hay registro pendiente');
        }
        if (pending.codigoVerificacion !== codigo) {
            throw new common_1.BadRequestException('Código inválido');
        }
        if (pending.codigoExpiraEn.getTime() < Date.now()) {
            throw new common_1.BadRequestException('Código expirado');
        }
        const user = await this.create({
            correo: pending.correo,
            contrasena,
        });
        await this.prisma.pendingUser.delete({ where: { correo } });
        return { ok: true, message: 'Cuenta creada', user };
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                correoInstitucional: true,
                nombre: true,
                edad: true,
                bloqueado: true,
            },
        });
    }
    async findByCorreo(correo) {
        return this.prisma.user.findUnique({ where: { correoInstitucional: correo } });
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                correoInstitucional: true,
                nombre: true,
                carnet: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const userRangos = await this.prisma.userRango.findMany({
            where: { userId },
            select: { rangoId: true },
        });
        const rangoIds = userRangos.map((item) => item.rangoId);
        const rangos = rangoIds.length
            ? await this.prisma.rango.findMany({
                where: { id: { in: rangoIds } },
                select: { nombre: true },
            })
            : [];
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId },
            select: { roleId: true },
        });
        const roleIds = userRoles.map((item) => item.roleId);
        const roles = roleIds.length
            ? await this.prisma.role.findMany({
                where: { id: { in: roleIds } },
                select: { nombre: true },
            })
            : [];
        return {
            ...user,
            rangos: rangos.map((rango) => rango.nombre),
            roles: roles.map((role) => role.nombre),
        };
    }
    async verifyEmail(correo, codigo) {
        const pending = await this.prisma.pendingUser.findUnique({
            where: { correo },
        });
        if (!pending) {
            return { ok: false, message: 'No hay registro pendiente' };
        }
        if (pending.codigoVerificacion !== codigo) {
            return { ok: false, message: 'Código inválido' };
        }
        if (pending.codigoExpiraEn.getTime() < Date.now()) {
            return { ok: false, message: 'Código expirado' };
        }
        return { ok: true, message: 'Código válido' };
    }
    async resendVerificationCode(correo) {
        const pending = await this.prisma.pendingUser.findUnique({
            where: { correo },
        });
        if (!pending) {
            return { ok: false, message: 'No hay registro pendiente' };
        }
        if (pending.codigoEnviadoEn) {
            const msDesdeUltimo = Date.now() - pending.codigoEnviadoEn.getTime();
            if (msDesdeUltimo < 2 * 60 * 1000) {
                return {
                    ok: false,
                    message: 'Espera 2 minutos antes de reenviar el código',
                };
            }
        }
        const codigo = this.generarCodigo();
        const ahora = new Date();
        const expiracion = new Date(ahora.getTime() + 15 * 60 * 1000);
        await this.prisma.pendingUser.update({
            where: { correo },
            data: {
                codigoVerificacion: codigo,
                codigoExpiraEn: expiracion,
                codigoEnviadoEn: ahora,
            },
        });
        await this.mailer.sendVerificationEmail(correo, codigo);
        return { ok: true, message: 'Código reenviado' };
    }
    generarCodigo() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_service_1.MailerService])
], UsersService);
//# sourceMappingURL=users.service.js.map