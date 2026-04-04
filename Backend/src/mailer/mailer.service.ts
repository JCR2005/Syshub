import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  private logVerificationCode(to: string, code: string) {
    this.logger.warn(
      `MAIL no disponible. Código de verificación para ${to}: ${code}`,
    );
  }

  async sendVerificationEmail(to: string, code: string) {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT ?? 0);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    const shouldEchoCode =
      process.env.NODE_ENV !== 'production' ||
      process.env.MAIL_LOG_CODE_ALWAYS === 'true';

    if (shouldEchoCode) {
      this.logger.log(`Código de verificación [DEV] para ${to}: ${code}`);
    }

    const placeholderValues = [
      'smtp.example.com',
      'usuario@example.com',
      'tu_clave',
    ];
    const usingPlaceholderValues =
      placeholderValues.includes(host ?? '') ||
      placeholderValues.includes(user ?? '') ||
      placeholderValues.includes(pass ?? '');

    if (!host || !port || !user || !pass || usingPlaceholderValues) {
      this.logVerificationCode(to, code);
      return;
    }

    const transporter = nodemailer.createTransport({
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
    } catch {
      this.logger.error(
        `Error enviando correo de verificación a ${to}. Se usará fallback en consola.`,
      );
      this.logVerificationCode(to, code);
    }
  }
}
