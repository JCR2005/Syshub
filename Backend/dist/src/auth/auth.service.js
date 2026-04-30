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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async register(dto) {
        return this.usersService.create(dto);
    }
    async preRegister(dto) {
        return this.usersService.preRegister(dto);
    }
    async confirmRegister(dto) {
        return this.usersService.confirmRegister(dto.correo, dto.codigo, dto.contrasena);
    }
    async login(dto) {
        const user = await this.usersService.findByCorreo(dto.correo);
        const passwordOk = user
            ? await bcrypt.compare(dto.contrasena, user.contrasena)
            : false;
        if (!user || !passwordOk) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (user.bloqueado) {
            throw new common_1.UnauthorizedException('Tu usuario está bloqueado');
        }
        const rangos = await this.usersService.getUserRangos(user.id);
        const normalizedRangos = rangos.map((rango) => rango.toLowerCase());
        const roles = await this.usersService.getUserRoles(user.id);
        const normalizedRoles = roles.map((role) => role.toLowerCase());
        const hasStudentRole = normalizedRoles.includes('comun');
        const hasAdminRole = normalizedRoles.includes('admin');
        const availableModes = hasStudentRole && hasAdminRole
            ? ['student', 'admin']
            : hasAdminRole
                ? ['admin']
                : ['student'];
        const requiresModeSelection = availableModes.length > 1;
        const activeMode = requiresModeSelection ? null : availableModes[0];
        const secret = process.env.JWT_SECRET ?? 'syshub_dev_secret';
        const expiresIn = (process.env.JWT_EXPIRES_IN ??
            '1d');
        const token = jwt.sign({
            sub: user.id,
            correo: user.correoInstitucional,
            nombre: user.nombre,
            roles,
            rangos,
        }, secret, { expiresIn });
        return {
            id: user.id,
            correo: user.correoInstitucional,
            nombre: user.nombre,
            roles,
            rangos,
            availableModes,
            requiresModeSelection,
            activeMode,
            accessToken: token,
            tokenType: 'Bearer',
            expiresIn,
            message: 'Login ok',
        };
    }
    async verify(dto) {
        return this.usersService.verifyEmail(dto.correo, dto.codigo);
    }
    async resend(dto) {
        return this.usersService.resendVerificationCode(dto.correo);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map