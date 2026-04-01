import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  async sendVerificationEmail(to: string, code: string) {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT ?? 0);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        `MAIL_* variables no configuradas. Código de verificación para ${to}: ${code}`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? user,
      to,
      subject: 'Syshub - Código de verificación',
      text: `Tu código de verificación es: ${code}`,
      html: `<p>Tu código de verificación es:</p><h2>${code}</h2>`,
    });
  }
}
