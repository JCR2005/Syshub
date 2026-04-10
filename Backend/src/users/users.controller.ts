import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express, Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ApiProperty } from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user?: {
    sub?: number | string;
  };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private async assertAdmin(request: AuthenticatedRequest) {
    const rawSub = request.user?.sub;
    const userId =
      typeof rawSub === 'number'
        ? rawSub
        : typeof rawSub === 'string'
          ? Number(rawSub)
          : NaN;

    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException('Sesión inválida');
    }

    const isAdmin = await this.usersService.hasRole(userId, 'admin');
    if (!isAdmin) {
      throw new ForbiddenException('Solo administradores pueden acceder');
    }

    return userId;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get('admin/management')
  @UseGuards(JwtAuthGuard)
  async getManagementUsers(@Req() request: AuthenticatedRequest) {
    await this.assertAdmin(request);
    return this.usersService.getAdminManagementUsers();
  }

  @Patch('admin/:id/role')
  @UseGuards(JwtAuthGuard)
  async setRole(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { role?: string; enabled?: boolean },
  ) {
    const actorUserId = await this.assertAdmin(request);
    const targetUserId = Number(id);

    if (!Number.isFinite(targetUserId)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    if (typeof body.enabled !== 'boolean' || !body.role) {
      throw new BadRequestException('Payload inválido');
    }

    if (
      actorUserId === targetUserId &&
      body.role.toLowerCase() === 'admin' &&
      body.enabled === false
    ) {
      throw new ForbiddenException('No puedes remover tu propio rol admin');
    }

    return this.usersService.setUserRole(targetUserId, body.role, body.enabled);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard)
  async setStatus(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { bloqueado?: boolean },
  ) {
    const actorUserId = await this.assertAdmin(request);
    const targetUserId = Number(id);

    if (!Number.isFinite(targetUserId)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    if (typeof body.bloqueado !== 'boolean') {
      throw new BadRequestException('Payload inválido');
    }
    if (actorUserId === targetUserId && body.bloqueado) {
      throw new ForbiddenException('No puedes bloquearte a ti mismo');
    }

    return this.usersService.setUserBlocked(targetUserId, body.bloqueado);
  }

  @Get('admin/classification')
  @UseGuards(JwtAuthGuard)
  async getSystemClassification(@Req() request: AuthenticatedRequest) {
    await this.assertAdmin(request);
    const classification = await this.usersService.getSystemClassification();
    return { ok: true, classification };
  }

  @Post('admin/classification/areas')
  @UseGuards(JwtAuthGuard)
  async createArea(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      nombre?: string;
      descripcion?: string;
      color?: string;
      pensumId?: number;
    },
  ) {
    await this.assertAdmin(request);

    if (!body.pensumId) {
      throw new BadRequestException('El pensum es requerido');
    }

    const area = await this.usersService.createTechArea({
      nombre: body.nombre ?? '',
      descripcion: body.descripcion,

      pensumId: body.pensumId,
    });

    return { ok: true, area };
  }

  @Post('admin/classification/pensums')
  @UseGuards(JwtAuthGuard)
  async createPensum(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      nombre?: string;
      descripcion?: string;
      vigente?: boolean;
      carreraId?: number;
    },
  ) {
    await this.assertAdmin(request);

    if (!body.carreraId) {
      throw new BadRequestException('La carrera es requerida');
    }

    const pensum = await this.usersService.createPensum({
      nombre: body.nombre ?? '',
      descripcion: body.descripcion,
      vigente: body.vigente,
      carreraId: Number(body.carreraId),
    });

    return { ok: true, pensum };
  }

  @Post('admin/classification/carreras')
  @UseGuards(JwtAuthGuard)
  async createCarrera(
    @Req() request: AuthenticatedRequest,
    @Body() body: { nombre?: string; color?: string },
  ) {
    await this.assertAdmin(request);
    const carrera = await this.usersService.createCarrera({
      nombre: body.nombre ?? '',
      color: body.color,
    });
    return { ok: true, carrera };
  }

  @Delete('admin/classification/carreras/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCarrera(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.assertAdmin(request);
    return this.usersService.deleteCarrera(Number(id));
  }

  @Post('admin/classification/courses')
  @UseGuards(JwtAuthGuard)
  async createCourse(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      codigo?: string;
      nombre?: string;
      semestre?: number;
      pensumId?: number;
      areaId?: number | null;
    },
  ) {
    await this.assertAdmin(request);

    const course = await this.usersService.createCourse({
      codigo: body.codigo ?? '',
      nombre: body.nombre ?? '',
      semestre: Number(body.semestre),
      pensumId: Number(body.pensumId),
      areaId: body.areaId === null ? null : Number(body.areaId),
    });

    return { ok: true, course };
  }

  @Post('admin/classification/tags')
  @UseGuards(JwtAuthGuard)
  async createTag(
    @Req() request: AuthenticatedRequest,
    @Body() body: { nombre?: string },
  ) {
    await this.assertAdmin(request);
    const tag = await this.usersService.createTag(body.nombre ?? '');
    return { ok: true, tag };
  }

  @Post('admin/classification/stacks')
  @UseGuards(JwtAuthGuard)
  async createStack(
    @Req() request: AuthenticatedRequest,
    @Body() body: { nombre?: string },
  ) {
    await this.assertAdmin(request);
    const stack = await this.usersService.createStack(body.nombre ?? '');
    return { ok: true, stack };
  }

  @Patch('admin/classification/courses/:id')
  @UseGuards(JwtAuthGuard)
  async updateCourse(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: {
      codigo?: string;
      nombre?: string;
      semestre?: number;
      pensumId?: number;
      areaId?: number | null;
    },
  ) {
    await this.assertAdmin(request);
    const course = await this.usersService.updateCourse(Number(id), {
      codigo: body.codigo,
      nombre: body.nombre,
      semestre: body.semestre === undefined ? undefined : Number(body.semestre),
      pensumId: body.pensumId === undefined ? undefined : Number(body.pensumId),
      areaId:
        body.areaId === undefined
          ? undefined
          : body.areaId === null
            ? null
            : Number(body.areaId),
    });
    return { ok: true, course };
  }

  @Patch('admin/classification/pensums/:id/toggle')
  @UseGuards(JwtAuthGuard)
  async togglePensumVigency(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.assertAdmin(request);
    const pensum = await this.usersService.togglePensumVigency(Number(id));
    return { ok: true, pensum };
  }

  @Patch('admin/classification/areas/:id')
  @UseGuards(JwtAuthGuard)
  async updateArea(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { nombre?: string; descripcion?: string; color?: string },
  ) {
    await this.assertAdmin(request);
    const area = await this.usersService.updateTechArea(Number(id), {
      nombre: body.nombre,
      descripcion: body.descripcion,
      color: body.color,
    });
    return { ok: true, area };
  }

  @Delete('admin/classification/areas/:id')
  @UseGuards(JwtAuthGuard)
  async deleteArea(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.assertAdmin(request);
    return this.usersService.deleteTechArea(Number(id));
  }

  @Delete('admin/classification/pensums/:id')
  @UseGuards(JwtAuthGuard)
  async deletePensum(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.assertAdmin(request);
    return this.usersService.deletePensum(Number(id));
  }

  @Delete('admin/classification/courses/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCourse(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.assertAdmin(request);
    return this.usersService.deleteCourse(Number(id));
  }

  @Delete('admin/classification/tags/:id')
  @UseGuards(JwtAuthGuard)
  async deleteTag(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.assertAdmin(request);
    return this.usersService.deleteTag(Number(id));
  }

  @Delete('admin/classification/stacks/:id')
  @UseGuards(JwtAuthGuard)
  async deleteStack(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.assertAdmin(request);
    return this.usersService.deleteStack(Number(id));
  }

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(Number(id));
  }

  @Put('profile/:id')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(Number(id), dto);
  }

  @Post('profile/:id/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (
          req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase();
          const rawParam = req.params?.id;
          const userId =
            typeof rawParam === 'string'
              ? rawParam
              : Array.isArray(rawParam)
                ? rawParam[0]
                : 'unknown';
          cb(null, `user-${userId}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
          return cb(new Error('Formato de imagen no permitido'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfilePhoto(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const rutaFotoPerfil = file ? `/uploads/${file.filename}` : null;
    await this.usersService.updateProfile(Number(id), {
      rutaFotoPerfil: rutaFotoPerfil ?? undefined,
    });
    return {
      rutaFotoPerfil,
    };
  }
  @Patch('admin/:id/rango')
  @UseGuards(JwtAuthGuard)
  async setUserRango(
    @Param('id') id: string,
    @Body() body: { rango: string; enabled: boolean },
  ) {
    return this.usersService.setUserRango(Number(id), body.rango, body.enabled);
  }
}
