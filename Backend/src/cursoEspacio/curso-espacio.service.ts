import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CursoEspacioService {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma as any;
  }

  private normalize(value: string) {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  private async isAdmin(userId: number) {
    const role = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: { nombre: { equals: 'admin', mode: 'insensitive' } },
      },
      select: { id: true },
    });
    return Boolean(role);
  }

  private async isAuxiliar(userId: number) {
    const rango = await this.prisma.userRango.findFirst({
      where: {
        userId,
        rango: { nombre: { equals: 'auxiliar', mode: 'insensitive' } },
      },
      select: { id: true },
    });
    return Boolean(rango) || (await this.isAdmin(userId));
  }

  private async isAuxiliarInSpace(userId: number, espacioId: number) {
    const member = await this.db.cursoEspacioAuxiliar.findFirst({
      where: { id_usuario: userId, id_espacio: espacioId },
      select: { id: true },
    });
    if (member) return true;
    const espacio = await this.db.cursoEspacio.findUnique({
      where: { id_espacio: espacioId },
      select: { createdById: true },
    });
    return espacio?.createdById === userId || (await this.isAdmin(userId));
  }

  private async isStudentInSpace(userId: number, espacioId: number) {
    if (await this.isAuxiliarInSpace(userId, espacioId)) return true;
    const member = await this.db.cursoEspacioEstudiante.findFirst({
      where: { id_usuario: userId, id_espacio: espacioId },
      select: { id: true },
    });
    return Boolean(member);
  }

  private ensureSemester(semestre: number) {
    if (![1, 2].includes(Number(semestre))) {
      throw new BadRequestException('El semestre debe ser 1 o 2');
    }
  }

  async listEspacios(filters: {
    cursoId?: number;
    anio?: number;
    semestre?: number;
  }) {
    const where: any = {};
    if (filters.cursoId) where.id_curso = filters.cursoId;
    if (filters.anio) where.anio = filters.anio;
    if (filters.semestre) where.semestre = filters.semestre;

    const espacios = await this.db.cursoEspacio.findMany({
      where,
      orderBy: [{ anio: 'desc' }, { semestre: 'desc' }, { createdAt: 'desc' }],
      include: {
        curso: true,
        creador: {
          select: { id: true, nombre: true, correoInstitucional: true },
        },
        _count: { select: { recursos: true, repositorios: true, estudiantes: true } },
      },
    });

    return espacios.map((espacio) => ({
      id: espacio.id_espacio,
      anio: espacio.anio,
      semestre: espacio.semestre,
      estado: espacio.estado,
      createdAt: espacio.createdAt,
      curso: espacio.curso,
      creador: espacio.creador,
      recursosCount: espacio._count.recursos,
      reposCount: espacio._count.repositorios,
      estudiantesCount: espacio._count.estudiantes,
    }));
  }

  async getCatalogo() {
    const [cursos, tipos, auxiliares] = await Promise.all([
      this.db.curso.findMany({
        orderBy: [{ id_pensum: 'asc' }, { semestre: 'asc' }, { codigo: 'asc' }],
        include: {
          pensum: { include: { carrera: true } },
          area: true,
        },
      }),
      this.db.tipo_Recurso.findMany({
        orderBy: { nombre_recurso: 'asc' },
      }),
      this.db.userRango.findMany({
        where: {
          rango: { nombre: { equals: 'auxiliar', mode: 'insensitive' } },
        },
        include: {
          user: {
            select: { id: true, nombre: true, correoInstitucional: true },
          },
        },
      }),
    ]);

    return {
      cursos: cursos.map((curso) => ({
        id: curso.id_curso,
        codigo: curso.codigo,
        nombre: curso.nombre,
        semestre: curso.semestre,
        pensum: curso.pensum
          ? {
              id: curso.pensum.id_pensum,
              nombre: curso.pensum.nombre,
              carrera: curso.pensum.carrera
                ? {
                    id: curso.pensum.carrera.id_carrera,
                    nombre: curso.pensum.carrera.nombre,
                    color: curso.pensum.carrera.color,
                  }
                : null,
            }
          : null,
        area: curso.area
          ? { id: curso.area.id_area, nombre: curso.area.nombre }
          : null,
      })),
      tiposRecurso: tipos.map((tipo) => ({
        id: tipo.id_tipo_recurso,
        nombre: tipo.nombre_recurso,
        icono: tipo.icono_svg,
      })),
      auxiliares: auxiliares.map((item) => ({
        id: item.user.id,
        nombre: item.user.nombre,
        correo: item.user.correoInstitucional,
      })),
    };
  }
  // Dentro de tu clase XxxxxService
async getRepositoriosDeEspacio(espacioId: number, usuarioId: number, isAuxiliar: boolean) {
  if (isAuxiliar) {
    // El auxiliar ve todo lo del espacio
    return this.prisma.repositorio.findMany({
      where: { id_espacio: espacioId },
      include: { 
        autor: true // Para que el auxiliar sepa de quién es cada repo
      }
    });
  } else {
    // El estudiante solo ve lo que él creó en ese espacio
    return this.prisma.repositorio.findMany({
      where: { 
        id_espacio: espacioId,
        id_usuario: usuarioId 
      }
    });
  }
}
  async createEspacio(
    userId: number,
    payload: { cursoId: number; anio: number; semestre: number },
  ) {
    if (!(await this.isAuxiliar(userId))) {
      throw new ForbiddenException(
        'Solo auxiliares pueden crear espacios de curso',
      );
    }
    this.ensureSemester(payload.semestre);

    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: payload.cursoId },
      select: { id_curso: true },
    });
    if (!curso) throw new NotFoundException('Curso no encontrado');

    const existing = await this.db.cursoEspacio.findFirst({
      where: {
        id_curso: payload.cursoId,
        anio: payload.anio,
        semestre: payload.semestre,
      },
      select: { id_espacio: true },
    });
    if (existing) {
      throw new BadRequestException(
        'Ya existe un espacio para ese curso, año y semestre',
      );
    }

    const espacio = await this.db.cursoEspacio.create({
      data: {
        id_curso: payload.cursoId,
        anio: payload.anio,
        semestre: payload.semestre,
        createdById: userId,
        estado: 'activo',
      },
    });

    await this.db.cursoEspacioAuxiliar.create({
      data: {
        id_espacio: espacio.id_espacio,
        id_usuario: userId,
        rol: 'owner',
      },
    });

    return espacio;
  }

  async getDetalle(espacioId: number) {
    const espacio = await this.db.cursoEspacio.findUnique({
      where: { id_espacio: espacioId },
      include: {
        curso: true,
        creador: {
          select: { id: true, nombre: true, correoInstitucional: true },
        },
        _count: {
          select: {
            recursos: true,
            repositorios: true,
            auxiliares: true,
            estudiantes: true,
          },
        },
      },
    });
    if (!espacio) throw new NotFoundException('Espacio no encontrado');

    return {
      id: espacio.id_espacio,
      anio: espacio.anio,
      semestre: espacio.semestre,
      estado: espacio.estado,
      createdAt: espacio.createdAt,
      curso: espacio.curso,
      creador: espacio.creador,
      recursosCount: espacio._count.recursos,
      reposCount: espacio._count.repositorios,
      auxiliaresCount: espacio._count.auxiliares,
      estudiantesCount: espacio._count.estudiantes,
    };
  }

  async listEstudiantes(espacioId: number) {
    const estudiantes = await this.db.cursoEspacioEstudiante.findMany({
      where: { id_espacio: espacioId },
      include: {
        usuario: {
          select: { id: true, nombre: true, correoInstitucional: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return estudiantes.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      user: item.usuario,
    }));
  }

  async joinEspacio(userId: number, espacioId: number) {
    if (await this.isAuxiliarInSpace(userId, espacioId)) {
      throw new BadRequestException('Los auxiliares ya forman parte del espacio');
    }
    const espacio = await this.db.cursoEspacio.findUnique({
      where: { id_espacio: espacioId },
      select: { id_espacio: true, estado: true },
    });
    if (!espacio) throw new NotFoundException('Espacio no encontrado');
    if (this.normalize(espacio.estado) !== 'activo') {
      throw new BadRequestException('El curso no está activo');
    }

    const join = await this.db.cursoEspacioEstudiante.upsert({
      where: {
        id_espacio_id_usuario: { id_espacio: espacioId, id_usuario: userId },
      },
      update: {},
      create: { id_espacio: espacioId, id_usuario: userId },
      include: {
        usuario: {
          select: { id: true, nombre: true, correoInstitucional: true },
        },
      },
    });

    return { id: join.id, createdAt: join.createdAt, user: join.usuario };
  }

  async leaveEspacio(userId: number, espacioId: number) {
    if (await this.isAuxiliarInSpace(userId, espacioId)) {
      throw new BadRequestException('Los auxiliares no pueden abandonar el espacio');
    }
    const existing = await this.db.cursoEspacioEstudiante.findFirst({
      where: { id_espacio: espacioId, id_usuario: userId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('No estás unido a este curso');
    }
    await this.db.cursoEspacioEstudiante.delete({ where: { id: existing.id } });
    return { removed: true };
  }

  async listRecursos(espacioId: number) {
    return this.db.cursoEspacioRecurso.findMany({
      where: { id_espacio: espacioId },
      orderBy: { createdAt: 'desc' },
      include: {
        tipo: {
          select: {
            id_tipo_recurso: true,
            nombre_recurso: true,
            icono_svg: true,
          },
        },
        creador: { select: { id: true, nombre: true } },
      },
    });
  }

  async createRecurso(
    userId: number,
    espacioId: number,
    payload: {
      nombre: string;
      descripcion?: string;
      url: string;
      tipoRecursoId: number;
    },
  ) {
    if (!(await this.isAuxiliarInSpace(userId, espacioId))) {
      throw new ForbiddenException(
        'No tienes permisos para subir recursos en este espacio',
      );
    }
    const nombre = (payload.nombre ?? '').trim();
    if (!nombre) throw new BadRequestException('El nombre es requerido');
    if (!payload.url) throw new BadRequestException('La URL es requerida');

    return this.db.cursoEspacioRecurso.create({
      data: {
        id_espacio: espacioId,
        nombre,
        descripcion: payload.descripcion?.trim() || null,
        url: payload.url.trim(),
        id_tipo_recurso: payload.tipoRecursoId,
        createdById: userId,
      },
      include: {
        tipo: {
          select: {
            id_tipo_recurso: true,
            nombre_recurso: true,
            icono_svg: true,
          },
        },
        creador: { select: { id: true, nombre: true } },
      },
    });
  }

  async listRepositorios(userId: number, espacioId: number) {
    const isAux = await this.isAuxiliarInSpace(userId, espacioId);
    const espacio = await this.db.cursoEspacio.findUnique({
      where: { id_espacio: espacioId },
      select: { estado: true },
    });

    if (!espacio) throw new NotFoundException('Espacio no encontrado');
    const estado = this.normalize(espacio.estado);

    if (!isAux && estado === 'activo') {
      return [];
    }

    const repos = await this.db.cursoEspacioRepositorio.findMany({
      where: {
        id_espacio: espacioId,
      },
      orderBy: [{ destacado: 'desc' }, { createdAt: 'desc' }],
      include: {
        repositorio: true,
        linkedBy: { select: { id: true, nombre: true } },
      },
    });

    if (isAux) return repos;

    return repos.filter(
      (item) => this.normalize(item.repositorio?.visibilidad) !== 'private',
    );
  }

  async linkRepositorio(
    userId: number,
    espacioId: number,
    repositorioId: number,
  ) {
    const repo = await this.prisma.repositorio.findUnique({
      where: { id_repositorio: repositorioId },
      select: { id_repositorio: true },
    });
    if (!repo) throw new NotFoundException('Repositorio no encontrado');

    const ownerLink = await this.prisma.repositorio_Usuario.findFirst({
      where: { id_usuario: userId, id_repositorio: repositorioId },
      select: { id_repositorio_usuario: true },
    });

    const isAux = await this.isAuxiliarInSpace(userId, espacioId);
    const isStudent = await this.isStudentInSpace(userId, espacioId);
    if (!ownerLink && !isAux) {
      throw new ForbiddenException(
        'No puedes vincular repositorios que no son tuyos',
      );
    }

    if (!isAux && !isStudent) {
      throw new ForbiddenException('Debes unirte al curso para vincular repositorios');
    }

    if (!isAux) {
      const espacio = await this.db.cursoEspacio.findUnique({
        where: { id_espacio: espacioId },
        select: { estado: true },
      });
      if (espacio && this.normalize(espacio.estado) !== 'activo') {
        throw new ForbiddenException('El curso ya finalizó y no acepta repositorios');
      }
    }

    return this.db.cursoEspacioRepositorio.upsert({
      where: {
        id_espacio_id_repositorio: {
          id_espacio: espacioId,
          id_repositorio: repositorioId,
        },
      },
      create: {
        id_espacio: espacioId,
        id_repositorio: repositorioId,
        linkedById: userId,
      },
      update: {},
      include: {
        repositorio: true,
        linkedBy: { select: { id: true, nombre: true } },
      },
    });
  }

  async toggleDestacado(
    userId: number,
    espacioId: number,
    repositorioId: number,
    destacado: boolean,
  ) {
    if (!(await this.isAuxiliarInSpace(userId, espacioId))) {
      throw new ForbiddenException(
        'Solo auxiliares pueden destacar repositorios',
      );
    }

    return this.db.cursoEspacioRepositorio.update({
      where: {
        id_espacio_id_repositorio: {
          id_espacio: espacioId,
          id_repositorio: repositorioId,
        },
      },
      data: { destacado },
    });
  }

  async listAuxiliares(espacioId: number) {
    const auxiliares = await this.db.cursoEspacioAuxiliar.findMany({
      where: { id_espacio: espacioId },
      include: {
        usuario: {
          select: { id: true, nombre: true, correoInstitucional: true },
        },
      },
      orderBy: { rol: 'desc' },
    });

    return auxiliares.map((aux) => ({
      id: aux.id,
      rol: aux.rol,
      createdAt: aux.createdAt,
      user: aux.usuario,
    }));
  }

  async addAuxiliar(
    requesterId: number,
    espacioId: number,
    auxiliarId: number,
  ) {
    const owner = await this.db.cursoEspacioAuxiliar.findFirst({
      where: { id_espacio: espacioId, id_usuario: requesterId, rol: 'owner' },
      select: { id: true },
    });
    if (!owner && !(await this.isAdmin(requesterId))) {
      throw new ForbiddenException(
        'Solo el auxiliar creador puede agregar auxiliares',
      );
    }

    if (!(await this.isAuxiliar(auxiliarId))) {
      throw new BadRequestException('El usuario no tiene rango de auxiliar');
    }

    const auxiliar = await this.db.cursoEspacioAuxiliar.upsert({
      where: {
        id_espacio_id_usuario: {
          id_espacio: espacioId,
          id_usuario: auxiliarId,
        },
      },
      create: { id_espacio: espacioId, id_usuario: auxiliarId, rol: 'aux' },
      update: {},
      include: {
        usuario: {
          select: { id: true, nombre: true, correoInstitucional: true },
        },
      },
    });

    return {
      id: auxiliar.id,
      rol: auxiliar.rol,
      createdAt: auxiliar.createdAt,
      user: auxiliar.usuario,
    };
  }

  async removeAuxiliar(
    requesterId: number,
    espacioId: number,
    auxiliarId: number,
  ) {
    const owner = await this.db.cursoEspacioAuxiliar.findFirst({
      where: { id_espacio: espacioId, id_usuario: requesterId, rol: 'owner' },
      select: { id: true },
    });
    if (!owner && !(await this.isAdmin(requesterId))) {
      throw new ForbiddenException(
        'Solo el auxiliar creador puede remover auxiliares',
      );
    }

    const target = await this.db.cursoEspacioAuxiliar.findFirst({
      where: { id_espacio: espacioId, id_usuario: auxiliarId },
      select: { rol: true },
    });

    if (!target)
      throw new NotFoundException('Auxiliar no encontrado en el espacio');
    if (target.rol === 'owner') {
      throw new BadRequestException('No puedes remover al auxiliar creador');
    }

    await this.db.cursoEspacioAuxiliar.delete({
      where: {
        id_espacio_id_usuario: {
          id_espacio: espacioId,
          id_usuario: auxiliarId,
        },
      },
    });

    return { removed: true };
  }

  async updateEstado(userId: number, espacioId: number, estado: string) {
    if (!(await this.isAuxiliarInSpace(userId, espacioId))) {
      throw new ForbiddenException('Solo auxiliares pueden actualizar el estado');
    }
    const normalized = this.normalize(estado);
    if (!['activo', 'finalizado'].includes(normalized)) {
      throw new BadRequestException('Estado inválido');
    }
    const updated = await this.db.cursoEspacio.update({
      where: { id_espacio: espacioId },
      data: { estado: normalized },
    });
    return { id: updated.id_espacio, estado: updated.estado };
  }
}
