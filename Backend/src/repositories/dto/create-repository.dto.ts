import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateRepositoryDto {
  @ApiProperty({
    example: 'my-repository',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'A brief description of the repository',
  })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({
    example: '# My Repository',
  })
  @IsOptional()
  @IsString()
  readme?: string;

  @ApiPropertyOptional({
    example: 'public',
  })
  @IsString()
  visibility?: string;

  @ApiPropertyOptional({
    example: 'MIT',
  })
  @IsOptional()
  @IsString()
  license?: string;

  @ApiPropertyOptional({
    example: ['typescript', 'nestjs'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({
    example: ['typescript', 'nestjs'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  stacks?: string[];

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  pensumId?: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  cursoId?: number;

  // ownerId is provided by the authenticated user (JWT); not accepted in body
}
