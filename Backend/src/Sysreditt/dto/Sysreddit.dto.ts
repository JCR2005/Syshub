// src/Sysreddit/dto/create-thread.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateThreadDto {
  @ApiProperty({
    example: '¿Cómo aprender NestJS?',
    minLength: 10,
    maxLength: 300,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  titulo: string;

  @ApiProperty({
    example: 'Estoy empezando con NestJS y quiero consejos...',
    minLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  contenido: string;

  @ApiPropertyOptional({
    example: 'Backend',
  })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({
    example: ['nestjs', 'backend'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// src/Sysreddit/dto/create-comment.dto.ts
export class CreateCommentDto {
  @ApiProperty({
    example: '¡Excelente artículo!',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  texto: string;
}

// src/Sysreddit/dto/update-thread.dto.ts
export class UpdateThreadDto {
  @ApiPropertyOptional({
    example: '¿Cómo aprender NestJS?',
    minLength: 10,
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  titulo?: string;

  @ApiPropertyOptional({
    example: 'Estoy empezando con NestJS y quiero consejos...',
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  contenido?: string;

  @ApiPropertyOptional({
    example: 'Backend',
  })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({
    example: ['nestjs', 'backend'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// src/Sysreddit/dto/create-blog.dto.ts
export class CreateBlogDto {
  @ApiProperty({
    example: 'Mi experiencia con NestJS',
    minLength: 10,
    maxLength: 300,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  titulo: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(100)
  contenido: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  extracto: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  readTime?: number;
}
