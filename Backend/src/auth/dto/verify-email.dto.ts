import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  correo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  codigo: string;
}
