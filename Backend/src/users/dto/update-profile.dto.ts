import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  edad?: number;

  @ApiPropertyOptional({
    example: '123456',
  })
  @IsOptional()
  @IsString()
  carnet?: string;
  rutaFotoPerfil?: string;
}
