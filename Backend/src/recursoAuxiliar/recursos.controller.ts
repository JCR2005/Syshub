import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecursosService } from './recursos.service';

const UPLOAD_TMP = path.join(process.cwd(), 'uploads', 'tmp');
if (!fs.existsSync(UPLOAD_TMP)) fs.mkdirSync(UPLOAD_TMP, { recursive: true });

type AuthReq = Request & {
  user?: { sub?: number | string; id?: number | string; roles?: string[] };
};

function uid(req: AuthReq): number {
  return Number(req.user?.sub ?? req.user?.id);
}

function isAdmin(req: AuthReq): boolean {
  const roles = (req.user as any)?.roles ?? [];
  return roles.some((r: string) => /admin/i.test(r));
}

const uploadInterceptor = FileFieldsInterceptor(
  [{ name: 'files', maxCount: 20 }],
  {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        if (!fs.existsSync(UPLOAD_TMP))
          fs.mkdirSync(UPLOAD_TMP, { recursive: true });
        cb(null, UPLOAD_TMP);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  },
);

@Controller('recursos')
export class RecursosController {
  constructor(private readonly recursosService: RecursosService) {}

  // ─── Tipos ────────────────────────────────────────────────────────────────────

  /** GET /recursos/tipos */
  @Get('tipos')
  @UseGuards(JwtAuthGuard)
  async getTipos() {
    const tipos = await this.recursosService.getTipos();
    return { ok: true, tipos };
  }

  /** POST /recursos/tipos — body: { nombre, slug?, descripcion?, icono_svg? } */
  @Post('tipos')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTipo(
    @Body()
    body: {
      nombre?: string;
      nombre_recurso?: string;
      slug?: string;
      descripcion?: string;
      icono_svg?: string;
    },
  ) {
    const tipo = await this.recursosService.createTipo(body);
    return { ok: true, tipo };
  }

  /** DELETE /recursos/tipos/:id */
  @Delete('tipos/:id')
  @UseGuards(JwtAuthGuard)
  async deleteTipo(@Param('id') id: string) {
    return this.recursosService.deleteTipo(Number(id));
  }

  // ─── Recursos ─────────────────────────────────────────────────────────────────

  /** GET /recursos
   *  Query: tipoId?, search?, page? */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getRecursos(
    @Query('tipoId') tipoId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.recursosService.getRecursos({
      tipoId: tipoId ? Number(tipoId) : undefined,
      search,
      page: page ? Number(page) : 1,
    });
    return { ok: true, ...result };
  }

  /** GET /recursos/:id */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRecurso(@Param('id') id: string) {
    const recurso = await this.recursosService.getRecursoById(Number(id));
    return { ok: true, recurso };
  }

  /** POST /recursos
   *  Body: { nombre, descripcion?, id_tipo_recurso } */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRecurso(
    @Req() req: AuthReq,
    @Body()
    body: { nombre: string; descripcion?: string; id_tipo_recurso: number },
  ) {
    const recurso = await this.recursosService.createRecurso(uid(req), {
      nombre: body.nombre,
      descripcion: body.descripcion,
      id_tipo_recurso: Number(body.id_tipo_recurso),
    });
    return { ok: true, recurso };
  }

  /** PATCH /recursos/:id
   *  Body: { nombre?, descripcion?, id_tipo_recurso? } */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateRecurso(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body()
    body: { nombre?: string; descripcion?: string; id_tipo_recurso?: number },
  ) {
    const recurso = await this.recursosService.updateRecurso(
      uid(req),
      Number(id),
      body,
      isAdmin(req),
    );
    return { ok: true, recurso };
  }

  /** DELETE /recursos/:id */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRecurso(@Param('id') id: string, @Req() req: AuthReq) {
    return this.recursosService.deleteRecurso(
      uid(req),
      Number(id),
      isAdmin(req),
    );
  }

  // ─── Archivos del recurso ─────────────────────────────────────────────────────

  /** POST /recursos/:id/archivos — multipart/form-data, campo "files" */
  @Post(':id/archivos')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(uploadInterceptor)
  async uploadArchivos(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @UploadedFiles() uploadedFiles: { files?: Express.Multer.File[] },
  ) {
    const files = uploadedFiles?.files ?? [];
    const uploaded = await this.recursosService.addArchivos(
      uid(req),
      Number(id),
      files,
    );
    return { ok: true, uploaded };
  }

  /** DELETE /recursos/:id/archivos/:archivoId */
  @Delete(':id/archivos/:archivoId')
  @UseGuards(JwtAuthGuard)
  async deleteArchivo(
    @Param('id') id: string,
    @Param('archivoId') archivoId: string,
    @Req() req: AuthReq,
  ) {
    return this.recursosService.deleteArchivo(
      uid(req),
      Number(id),
      Number(archivoId),
      isAdmin(req),
    );
  }

  /** GET /recursos/archivos/:archivoId — servir/descargar archivo */
  @Get('archivos/:archivoId')
  @UseGuards(JwtAuthGuard)
  async serveArchivo(
    @Param('archivoId') archivoId: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    const { path: filePath, originalName } =
      await this.recursosService.serveArchivo(Number(archivoId));

    if (download === '1') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(originalName)}"`,
      );
    }

    res.sendFile(filePath);
  }
}
