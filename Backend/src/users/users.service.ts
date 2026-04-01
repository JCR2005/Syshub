import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async create(dto: CreateUserDto) {
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

  async preRegister(dto: { correo: string; contrasena: string }) {
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

  async confirmRegister(correo: string, codigo: string, contrasena: string) {
    const pending = await this.prisma.pendingUser.findUnique({
      where: { correo },
    });

    if (!pending) {
      throw new NotFoundException('No hay registro pendiente');
    }

    if (pending.codigoVerificacion !== codigo) {
      throw new BadRequestException('Código inválido');
    }

    if (pending.codigoExpiraEn.getTime() < Date.now()) {
      throw new BadRequestException('Código expirado');
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

  async findByCorreo(correo: string) {
    return this.prisma.user.findUnique({ where: { correoInstitucional: correo } });
  }

  async getProfile(userId: number) {
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
      throw new NotFoundException('Usuario no encontrado');
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

  async verifyEmail(correo: string, codigo: string) {
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

  async resendVerificationCode(correo: string) {
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

  private generarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async hashPassword(password: string) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
