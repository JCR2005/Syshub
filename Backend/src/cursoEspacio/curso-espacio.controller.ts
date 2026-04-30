import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CursoEspacioService } from './curso-espacio.service';

type AuthReq = Request & {
  user?: { sub?: number | string; id?: number | string };
};

const uid = (req: AuthReq) => Number(req.user?.sub ?? req.user?.id);

@Controller('curso-espacios')
@UseGuards(JwtAuthGuard)
export class CursoEspacioController {
  constructor(private readonly cursoEspacioService: CursoEspacioService) {}

  @Get()
  async listEspacios(
    @Query('cursoId') cursoId?: string,
    @Query('anio') anio?: string,
    @Query('semestre') semestre?: string,
  ) {
    const espacios = await this.cursoEspacioService.listEspacios({
      cursoId: cursoId ? Number(cursoId) : undefined,
      anio: anio ? Number(anio) : undefined,
      semestre: semestre ? Number(semestre) : undefined,
    });
    return { ok: true, espacios };
  }

  @Post()
  async createEspacio(
    @Req() req: AuthReq,
    @Body() body: { cursoId?: number; anio?: number; semestre?: number },
  ) {
    const espacio = await this.cursoEspacioService.createEspacio(uid(req), {
      cursoId: Number(body.cursoId),
      anio: Number(body.anio),
      semestre: Number(body.semestre),
    });
    return { ok: true, espacio };
  }

  @Get('catalogo')
  async getCatalogo() {
    const catalogo = await this.cursoEspacioService.getCatalogo();
    return { ok: true, catalogo };
  }

  @Get(':id')
  async getDetalle(@Param('id') id: string) {
    const espacio = await this.cursoEspacioService.getDetalle(Number(id));
    return { ok: true, espacio };
  }

  @Get(':id/recursos')
  async listRecursos(@Param('id') id: string) {
    const recursos = await this.cursoEspacioService.listRecursos(Number(id));
    return { ok: true, recursos };
  }

  @Post(':id/recursos')
  async createRecurso(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Body()
    body: {
      nombre?: string;
      descripcion?: string;
      url?: string;
      tipoRecursoId?: number;
    },
  ) {
    const recurso = await this.cursoEspacioService.createRecurso(
      uid(req),
      Number(id),
      {
        nombre: body.nombre ?? '',
        descripcion: body.descripcion,
        url: body.url ?? '',
        tipoRecursoId: Number(body.tipoRecursoId),
      },
    );
    return { ok: true, recurso };
  }

  @Get(':id/repos')
  async listRepos(@Req() req: AuthReq, @Param('id') id: string) {
    const repos = await this.cursoEspacioService.listRepositorios(
      uid(req),
      Number(id),
    );
    return { ok: true, repos };
  }

  @Post(':id/repos')
  async linkRepo(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Body() body: { repositorioId?: number },
  ) {
    const repo = await this.cursoEspacioService.linkRepositorio(
      uid(req),
      Number(id),
      Number(body.repositorioId),
    );
    return { ok: true, repo };
  }

  @Patch(':id/repos/:repoId/destacado')
  async toggleDestacado(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Param('repoId') repoId: string,
    @Body() body: { destacado?: boolean },
  ) {
    const repo = await this.cursoEspacioService.toggleDestacado(
      uid(req),
      Number(id),
      Number(repoId),
      Boolean(body.destacado),
    );
    return { ok: true, repo };
  }

  @Get(':id/auxiliares')
  async listAuxiliares(@Param('id') id: string) {
    const auxiliares = await this.cursoEspacioService.listAuxiliares(
      Number(id),
    );
    return { ok: true, auxiliares };
  }

  @Get(':id/estudiantes')
  async listEstudiantes(@Param('id') id: string) {
    const estudiantes = await this.cursoEspacioService.listEstudiantes(
      Number(id),
    );
    return { ok: true, estudiantes };
  }

  @Post(':id/unirse')
  async joinEspacio(@Req() req: AuthReq, @Param('id') id: string) {
    const join = await this.cursoEspacioService.joinEspacio(
      uid(req),
      Number(id),
    );
    return { ok: true, join };
  }

  @Patch(':id/salir')
  async leaveEspacio(@Req() req: AuthReq, @Param('id') id: string) {
    const result = await this.cursoEspacioService.leaveEspacio(
      uid(req),
      Number(id),
    );
    return { ok: true, removed: result.removed };
  }

  @Post(':id/auxiliares')
  async addAuxiliar(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Body() body: { userId?: number },
  ) {
    const auxiliar = await this.cursoEspacioService.addAuxiliar(
      uid(req),
      Number(id),
      Number(body.userId),
    );
    return { ok: true, auxiliar };
  }

  @Patch(':id/auxiliares/:userId/remove')
  async removeAuxiliar(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    const result = await this.cursoEspacioService.removeAuxiliar(
      uid(req),
      Number(id),
      Number(userId),
    );
    return { ok: true, removed: result.removed };
  }

  @Patch(':id/estado')
  async updateEstado(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Body() body: { estado?: string },
  ) {
    const result = await this.cursoEspacioService.updateEstado(
      uid(req),
      Number(id),
      String(body.estado ?? ''),
    );
    return { ok: true, estado: result.estado };
  }
}
