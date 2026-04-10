import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  correo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contrasena: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  edad?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  carnet?: string;
}
