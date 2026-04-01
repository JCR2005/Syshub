import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { PreRegisterDto } from './dto/pre-register.dto';
import { ConfirmRegisterDto } from './dto/confirm-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('pre-register')
  preRegister(@Body() dto: PreRegisterDto) {
    return this.authService.preRegister(dto);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmRegisterDto) {
    return this.authService.confirmRegister(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifyEmailDto) {
    return this.authService.verify(dto);
  }

  @Post('resend')
  resend(@Body() dto: ResendCodeDto) {
    return this.authService.resend(dto);
  }
}
