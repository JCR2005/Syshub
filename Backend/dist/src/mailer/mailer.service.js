"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = __importDefault(require("nodemailer"));
let MailerService = MailerService_1 = class MailerService {
    logger = new common_1.Logger(MailerService_1.name);
    logVerificationCode(to, code) {
        this.logger.warn(`MAIL no disponible. Código de verificación para ${to}: ${code}`);
    }
    async sendVerificationEmail(to, code) {
        const host = process.env.MAIL_HOST;
        const port = Number(process.env.MAIL_PORT ?? 0);
        const user = process.env.MAIL_USER;
        const pass = process.env.MAIL_PASS;
        const shouldEchoCode = process.env.NODE_ENV !== 'production' ||
            process.env.MAIL_LOG_CODE_ALWAYS === 'true';
        if (shouldEchoCode) {
            this.logger.log(`Código de verificación [DEV] para ${to}: ${code}`);
        }
        const placeholderValues = [
            'smtp.example.com',
            'usuario@example.com',
            'tu_clave',
        ];
        const usingPlaceholderValues = placeholderValues.includes(host ?? '') ||
            placeholderValues.includes(user ?? '') ||
            placeholderValues.includes(pass ?? '');
        if (!host || !port || !user || !pass || usingPlaceholderValues) {
            this.logVerificationCode(to, code);
            return;
        }
        const transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
        try {
            await transporter.sendMail({
                from: process.env.MAIL_FROM ?? user,
                to,
                subject: 'Syshub - Código de verificación',
                text: `Tu código de verificación es: ${code}`,
                html: `<p>Tu código de verificación es:</p><h2>${code}</h2>`,
            });
        }
        catch {
            this.logger.error(`Error enviando correo de verificación a ${to}. Se usará fallback en consola.`);
            this.logVerificationCode(to, code);
        }
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = MailerService_1 = __decorate([
    (0, common_1.Injectable)()
], MailerService);
//# sourceMappingURL=mailer.service.js.map