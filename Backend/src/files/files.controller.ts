import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  Req,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import type { Request, Response } from 'express';

const uploadPath = path.join(process.cwd(), 'uploads', 'repositories');

type AuthenticatedRequest = Request & {
  user?: {
    sub?: number | string;
    id?: number | string;
  };
};

function getOwnerId(req: AuthenticatedRequest): number {
  return Number(req.user?.sub ?? req.user?.id);
}

@Controller('files')
export class FilesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async serveFile(
    @Param('id') id: string,
    @Query('download') download: string | undefined,
    @Res() res: Response,
    @Req() req: AuthenticatedRequest,
  ) {
    const fileId = Number(id);
    const ownerId = getOwnerId(req);

    const archivo = await (
      this.prisma as unknown as {
        archivo: {
          findUnique(args: {
            where: { id_archivo: number };
            include: {
              repositorios: {
                include: {
                  repositorio: {
                    include: {
                      usuarios: true;
                    };
                  };
                };
              };
            };
          }): Promise<{
            id_archivo: number;
            url: string;
            nombre_original: string | null;
            nombre_unico: string | null;
            ruta_relativa: string | null;
            repositorios: {
              repositorio: {
                usuarios: {
                  id_usuario: number;
                }[];
              };
            }[];
          } | null>;
        };
      }
    ).archivo.findUnique({
      where: { id_archivo: fileId },
      include: {
        repositorios: {
          include: {
            repositorio: {
              include: {
                usuarios: true,
              },
            },
          },
        },
      },
    });

    if (!archivo) throw new NotFoundException('Archivo no encontrado');

    const isOwner = archivo.repositorios.some((repoLink) =>
      repoLink.repositorio.usuarios.some(
        (ownerLink) => ownerLink.id_usuario === ownerId,
      ),
    );

    if (!isOwner) {
      throw new ForbiddenException('No tienes acceso a este archivo');
    }

    const storedPath = archivo.ruta_relativa || archivo.url;
    const abs = path.isAbsolute(storedPath)
      ? path.resolve(storedPath)
      : path.resolve(uploadPath, storedPath);

    // ensure file is inside uploads directory
    if (!abs.startsWith(uploadPath))
      throw new ForbiddenException('Acceso denegado');

    if (!fs.existsSync(abs)) {
      throw new NotFoundException('El archivo no existe en disco');
    }

    const downloadName =
      archivo.nombre_original || archivo.nombre_unico || path.basename(abs);

    res.setHeader(
      'Content-Disposition',
      download === '1'
        ? `attachment; filename="${downloadName}"`
        : `inline; filename="${downloadName}"`,
    );

    const dir = path.dirname(abs);
    const name = path.basename(abs);
    return res.sendFile(name, { root: dir });
  }
}
