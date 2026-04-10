import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PreRegisterDto {
  @ApiProperty()
  @IsEmail()
  correo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contrasena: string;
}
