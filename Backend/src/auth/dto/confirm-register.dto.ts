import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmRegisterDto {
  @ApiProperty()
  @IsEmail()
  correo: string;

  @ApiProperty()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty()
  @IsNotEmpty()
  contrasena: string;
}
