import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { PreRegisterDto } from './dto/pre-register.dto';
import { ConfirmRegisterDto } from './dto/confirm-register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    return this.usersService.create(dto);
  }

  async preRegister(dto: PreRegisterDto) {
    return this.usersService.preRegister(dto);
  }

  async confirmRegister(dto: ConfirmRegisterDto) {
    return this.usersService.confirmRegister(dto.correo, dto.codigo, dto.contrasena);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByCorreo(dto.correo);

    const passwordOk = user
      ? await bcrypt.compare(dto.contrasena, user.contrasena)
      : false;

    if (!user || !passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const secret = process.env.JWT_SECRET ?? 'syshub_dev_secret';
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1d') as jwt.SignOptions['expiresIn'];
    const token = jwt.sign(
      {
        sub: user.id,
        correo: user.correoInstitucional,
        nombre: user.nombre,
      },
      secret,
      { expiresIn },
    );

    return {
      id: user.id,
      correo: user.correoInstitucional,
      nombre: user.nombre,
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn,
      message: 'Login ok',
    };
  }

  async verify(dto: VerifyEmailDto) {
    return this.usersService.verifyEmail(dto.correo, dto.codigo);
  }

  async resend(dto: ResendCodeDto) {
    return this.usersService.resendVerificationCode(dto.correo);
  }
}
