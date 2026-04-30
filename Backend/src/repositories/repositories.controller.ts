import {
  Body,
  Controller,
  Delete,
  InternalServerErrorException,
  Get,
  Patch,
  Post,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Param,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { RepositoriesService } from './repositories.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import archiver from 'archiver';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const uploadPath = path.join(process.cwd(), 'uploads', 'repositories');
ensureDir(uploadPath);

type AuthenticatedRequest = Request & {
  user?: {
    sub?: number | string;
    id?: number | string;
  };
};

function extractOwnerId(req: AuthenticatedRequest): number {
  const rawId = req.user?.sub ?? req.user?.id;
  return Number(rawId);
}

// file filter (allow repository content files)
function fileFilter(
  _req: Request,
  _file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  return cb(null, true);
}

const uploadInterceptorOptions = {
  storage: diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      const name = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, name);
    },
  }),
  fileFilter,
  limits: { fileSize: 80 * 1024 * 1024 }, // 80MB per file
};

@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repoService: RepositoriesService) {}

  private async streamRepositoryZip(
    payload: {
      repositoryId: number;
      repositoryName: string;
      files: { absolutePath: string; archivePath: string }[];
    },
    res: Response,
  ) {
    const safeRepoName = payload.repositoryName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeRepoName || `repo-${payload.repositoryId}`}.zip"`,
    );

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', () => {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      res.end();
    });

    archive.pipe(res);

    if (!payload.files.length) {
      archive.append('Repositorio sin archivos.', { name: 'README.txt' });
    }

    payload.files.forEach((file, index) => {
      const safeArchivePath = file.archivePath
        .replace(/\\/g, '/')
        .split('/')
        .filter(Boolean)
        .map((segment) =>
          segment
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, ''),
        )
        .filter(Boolean)
        .join('/');

      archive.file(file.absolutePath, {
        name: safeArchivePath || `archivo-${index + 1}`,
      });
    });

    try {
      await archive.finalize();
    } catch {
      throw new InternalServerErrorException(
        'No se pudo generar el ZIP del repositorio',
      );
    }
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@Req() req: AuthenticatedRequest) {
    const ownerId = extractOwnerId(req);
    const repositories = await this.repoService.findByOwner(ownerId);
    return { ok: true, repositories };
  }

  @Get('options')
  @UseGuards(JwtAuthGuard)
  async findOptions() {
    const options = await this.repoService.getRepositoryOptions();
    return { ok: true, options };
  }

  @Get(':id/commits')
  @UseGuards(JwtAuthGuard)
  async listCommits(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const ownerId = extractOwnerId(req);
    const repositoryId = Number(id);
    const commits = await this.repoService.listRepositoryCommits(
      ownerId,
      repositoryId,
    );

    return { ok: true, commits };
  }

  @Post(':id/commit')
  @UseGuards(JwtAuthGuard)
  async createCommit(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { message?: string },
  ) {
    const ownerId = extractOwnerId(req);
    const repositoryId = Number(id);
    const commit = await this.repoService.createRepositoryCommit(
      ownerId,
      repositoryId,
      body.message,
      'commit',
    );

    return { ok: true, commit };
  }

  @Post(':id/push')
  @UseGuards(JwtAuthGuard)
  async pushRepository(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { message?: string },
  ) {
    const ownerId = extractOwnerId(req);
    const repositoryId = Number(id);
    const commit = await this.repoService.createRepositoryCommit(
      ownerId,
      repositoryId,
      body.message,
      'push',
    );

    return { ok: true, commit };
  }

  @Post(':id/pull')
  @UseGuards(JwtAuthGuard)
  async pullRepository(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const ownerId = extractOwnerId(req);
    const repositoryId = Number(id);
    const result = await this.repoService.pullRepository(ownerId, repositoryId);

    return { ok: true, ...result };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateRepository(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      nombre?: string;
      descripcion?: string;
      tags?: string[];
      stacks?: string[];
      visibilidad?: 'public' | 'private';
    },
  ) {
    const ownerId = extractOwnerId(req);
    const repositoryId = Number(id);

    const repository = await this.repoService.updateRepository(
      ownerId,
      repositoryId,
      {
        nombre: body.nombre,
        descripcion: body.descripcion,
        tags: body.tags,
        stacks: body.stacks,
        visibilidad: body.visibilidad,
      },
    );

    return { ok: true, repository };
  }

  @Post(':id/files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'files', maxCount: 200 }],
      uploadInterceptorOptions,
    ),
  )
  async uploadRepositoryFiles(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { relativePaths?: string[] | string },
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ) {
    const ownerId = extractOwnerId(req);
    const repositoryId = Number(id);

    const uploaded = await this.repoService.addFilesToRepository(
      ownerId,
      repositoryId,
      files?.files ?? [],
      Array.isArray(body.relativePaths)
        ? body.relativePaths
        : body.relativePaths
          ? [body.relativePaths]
          : [],
    );

    return { ok: true, uploaded };
  }

  @Delete(':id/files/:fileId')
  @UseGuards(JwtAuthGuard)
  async deleteRepositoryFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const ownerId = extractOwnerId(req);
    const repositoryId = Number(id);
    const parsedFileId = Number(fileId);

    await this.repoService.deleteRepositoryFile(
      ownerId,
      repositoryId,
      parsedFileId,
    );
    return { ok: true };
  }

  @Get('public/:id/clone')
  async clonePublicRepository(@Param('id') id: string, @Res() res: Response) {
    const repositoryId = Number(id);

    if (Number.isNaN(repositoryId)) {
      throw new NotFoundException('Repositorio no encontrado');
    }

    const payload =
      await this.repoService.getPublicRepositoryDownloadPayload(repositoryId);

    if (!payload) {
      throw new NotFoundException(
        'Repositorio público no encontrado para clonar',
      );
    }

    await this.streamRepositoryZip(payload, res);
  }

  @Get('public/:ownerId/:id/clone')
  async clonePublicRepositoryByOwner(
    @Param('ownerId') ownerId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const repositoryId = Number(id);
    const parsedOwnerId = Number(ownerId);

    if (Number.isNaN(repositoryId) || Number.isNaN(parsedOwnerId)) {
      throw new NotFoundException('Repositorio no encontrado');
    }

    const payload =
      await this.repoService.getPublicRepositoryDownloadPayloadByOwner(
        repositoryId,
        parsedOwnerId,
      );

    if (!payload) {
      throw new NotFoundException(
        'Repositorio público no encontrado para el propietario indicado',
      );
    }

    await this.streamRepositoryZip(payload, res);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadRepository(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const ownerId = extractOwnerId(req);
    const repositoryId = Number(id);

    if (Number.isNaN(repositoryId)) {
      throw new NotFoundException('Repositorio no encontrado');
    }

    const payload = await this.repoService.getRepositoryDownloadPayload(
      ownerId,
      repositoryId,
    );

    if (!payload) {
      throw new NotFoundException('Repositorio no encontrado');
    }

    await this.streamRepositoryZip(payload, res);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'files', maxCount: 20 }],
      uploadInterceptorOptions,
    ),
  )
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateRepositoryDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ) {
    const fileList = files?.files ?? [];
    // owner from JWT (payload uses `sub`)
    const ownerId = extractOwnerId(req);

    const repo = await this.repoService.createRepository(
      {
        nombre: body.nombre,
        descripcion: body.descripcion,
        ownerId,
        tags: body.tags,
        stacks: body.stacks,
        categoryId: body.categoryId,
        pensumId:
          body.pensumId === undefined ? undefined : Number(body.pensumId),
        cursoId: body.cursoId === undefined ? undefined : Number(body.cursoId),
      },
      fileList,
    );

    return { ok: true, repository: repo };
  }

  // repositorios.controller.ts

@Get('espacio/:espacioId')
@UseGuards(JwtAuthGuard)
async getReposByEspacio(
  @Param('espacioId') espacioId: string,
  @Req() req: any
) {
  // 1. Sacamos el ID del usuario del token
  const usuarioId = Number(req.user.id || req.user.sub);

  // 2. Verificamos si tiene rol de auxiliar o admin
  // Ajusta 'auxiliar' o 'admin' según los nombres exactos en tu tabla "Role"
  const rolesUsuario = req.user.roles || [];
  const isAuxiliar = rolesUsuario.some((rol: any) => 
    rol.nombre.toLowerCase() === 'auxiliar' || 
    rol.nombre.toLowerCase() === 'admin'
  );

  return this.repositoriosService.getRepositoriosPorEspacio(
    Number(espacioId),
    usuarioId,
    isAuxiliar
  );
}
}
