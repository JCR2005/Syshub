import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const RECURSOS_UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'recursos');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(RECURSOS_UPLOAD_ROOT);

@Injectable()
export class RecursosService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Tipos de Recurso ────────────────────────────────────────────────────────

  async getTipos() {
    const db = this.prisma as any;
    const tipos = await db.tipo_Recurso.findMany({
      orderBy: { nombre_recurso: 'asc' },
    });
    return tipos.map((t) => ({
      id: t.id_tipo_recurso,
      id_tipo_recurso: t.id_tipo_recurso,
      nombre: t.nombre_recurso,
      nombre_recurso: t.nombre_recurso,
      slug: t.slug,
      descripcion: t.descripcion,
      icono_svg: t.icono_svg,
    }));
  }

  private slugify(value: string) {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }

  private async ensureUniqueSlug(baseSlug: string) {
    if (!baseSlug) return '';
    let slug = baseSlug;
    let counter = 2;

    const db = this.prisma as any;
    while (true) {
      const exists = await db.tipo_Recurso.findFirst({
        where: { slug },
        select: { id_tipo_recurso: true },
      });
      if (!exists) return slug;
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  async createTipo(data: {
    nombre?: string;
    nombre_recurso?: string;
    slug?: string;
    descripcion?: string;
    icono_svg?: string;
  }) {
    const clean = (data?.nombre_recurso ?? data?.nombre ?? '').trim();
    if (!clean) throw new BadRequestException('El nombre es requerido');

    const db = this.prisma as any;
    const existing = await db.tipo_Recurso.findFirst({
      where: { nombre_recurso: clean },
    });
    if (existing) throw new BadRequestException('El tipo ya existe');

    const baseSlug = this.slugify(data?.slug?.trim() || clean);
    const slug = await this.ensureUniqueSlug(baseSlug);
    if (!slug) throw new BadRequestException('El slug es requerido');

    const tipo = await db.tipo_Recurso.create({
      data: {
        nombre_recurso: clean,
        slug,
        descripcion: data?.descripcion?.trim() || null,
        icono_svg: data?.icono_svg?.trim() || null,
      },
    });
    return {
      id: tipo.id_tipo_recurso,
      id_tipo_recurso: tipo.id_tipo_recurso,
      nombre: tipo.nombre_recurso,
      nombre_recurso: tipo.nombre_recurso,
      slug: tipo.slug,
      descripcion: tipo.descripcion,
      icono_svg: tipo.icono_svg,
    };
  }

  async deleteTipo(id: number) {
    const db = this.prisma as any;
    const linked = await db.recurso_Auxiliar.count({
      where: { id_tipo_recurso: id },
    });
    if (linked > 0)
      throw new BadRequestException(
        'Tiene recursos asociados, no se puede eliminar',
      );
    await this.prisma.tipo_Recurso.delete({ where: { id_tipo_recurso: id } });
    return { ok: true };
  }

  // ─── Recursos ────────────────────────────────────────────────────────────────

  async getRecursos(filters: {
    tipoId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const db = this.prisma as any;
    const { tipoId, search, page = 1, limit = 20 } = filters;

    const where: any = {};
    if (tipoId) where.id_tipo_recurso = tipoId;
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [recursos, total] = await Promise.all([
      db.recurso_Auxiliar.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tipo: { select: { id_tipo_recurso: true, nombre_recurso: true } },
          usuarios: {
            include: {
              usuario: {
                select: { id: true, nombre: true, correoInstitucional: true },
              },
            },
          },
          archivos: {
            include: {
              archivo: {
                select: {
                  id_archivo: true,
                  url: true,
                  nombre_original: true,
                  nombre_unico: true,
                },
              },
            },
          },
        },
      }),
      db.recurso_Auxiliar.count({ where }),
    ]);

    return {
      recursos: recursos.map((r: any) => this.formatRecurso(r)),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getRecursoById(id: number) {
    const db = this.prisma as any;
    const recurso = await db.recurso_Auxiliar.findUnique({
      where: { id_recurso: id },
      include: {
        tipo: { select: { id_tipo_recurso: true, nombre_recurso: true } },
        usuarios: {
          include: {
            usuario: {
              select: { id: true, nombre: true, correoInstitucional: true },
            },
          },
        },
        archivos: {
          include: {
            archivo: {
              select: {
                id_archivo: true,
                url: true,
                nombre_original: true,
                nombre_unico: true,
                ruta_relativa: true,
              },
            },
          },
        },
      },
    });

    if (!recurso) throw new NotFoundException('Recurso no encontrado');
    return this.formatRecurso(recurso);
  }

  async createRecurso(
    ownerId: number,
    data: { nombre: string; descripcion?: string; id_tipo_recurso: number },
  ) {
    const db = this.prisma as any;

    const tipo = await this.prisma.tipo_Recurso.findUnique({
      where: { id_tipo_recurso: data.id_tipo_recurso },
    });
    if (!tipo) throw new NotFoundException('Tipo de recurso no encontrado');

    const recurso = await db.recurso_Auxiliar.create({
      data: {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        id_tipo_recurso: data.id_tipo_recurso,
        usuarios: {
          create: [{ id_usuario: ownerId }],
        },
      },
      include: {
        tipo: { select: { id_tipo_recurso: true, nombre_recurso: true } },
        usuarios: {
          include: {
            usuario: {
              select: { id: true, nombre: true, correoInstitucional: true },
            },
          },
        },
        archivos: true,
      },
    });

    return this.formatRecurso(recurso);
  }

  async updateRecurso(
    ownerId: number,
    recursoId: number,
    data: { nombre?: string; descripcion?: string; id_tipo_recurso?: number },
    isAdmin = false,
  ) {
    const db = this.prisma as any;
    await this.assertOwner(ownerId, recursoId, isAdmin);

    const updateData: any = {};
    if (data.nombre?.trim()) updateData.nombre = data.nombre.trim();
    if (data.descripcion !== undefined)
      updateData.descripcion = data.descripcion?.trim() || null;
    if (data.id_tipo_recurso) {
      const tipo = await this.prisma.tipo_Recurso.findUnique({
        where: { id_tipo_recurso: data.id_tipo_recurso },
      });
      if (!tipo) throw new NotFoundException('Tipo no encontrado');
      updateData.id_tipo_recurso = data.id_tipo_recurso;
    }

    await db.recurso_Auxiliar.update({
      where: { id_recurso: recursoId },
      data: updateData,
    });

    return this.getRecursoById(recursoId);
  }

  async deleteRecurso(ownerId: number, recursoId: number, isAdmin = false) {
    const db = this.prisma as any;
    await this.assertOwner(ownerId, recursoId, isAdmin);

    // Eliminar archivos físicos antes de borrar el registro
    const recurso = await this.getRecursoById(recursoId);
    for (const file of recurso.archivos) {
      const absPath = path.resolve(
        RECURSOS_UPLOAD_ROOT,
        file.nombreUnico ?? '',
      );
      if (fs.existsSync(absPath)) {
        await fsPromises.unlink(absPath).catch(() => undefined);
      }
    }

    await db.recurso_Auxiliar.delete({ where: { id_recurso: recursoId } });
    return { ok: true };
  }

  // ─── Archivos ─────────────────────────────────────────────────────────────────

  async addArchivos(
    ownerId: number,
    recursoId: number,
    files: Express.Multer.File[],
  ) {
    const db = this.prisma as any;
    await this.assertOwner(ownerId, recursoId);

    if (!files.length) return [];

    const uploaded: Array<{ id: number; nombre: string; url: string }> = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 80);
      const storedName = `${Date.now()}-${randomUUID()}-${safeBase}${ext}`;
      const destPath = path.join(RECURSOS_UPLOAD_ROOT, storedName);

      try {
        await fsPromises.rename(file.path, destPath);
      } catch {
        await fsPromises.copyFile(file.path, destPath);
        await fsPromises.unlink(file.path).catch(() => undefined);
      }

      const relPath = storedName;

      const archivo = await db.archivo.create({
        data: {
          url: relPath,
          nombre_original: file.originalname,
          nombre_unico: storedName,
          ruta_relativa: relPath,
        },
      });

      await db.archivo_Recurso_Auxiliar.create({
        data: {
          id_recurso: recursoId,
          id_archivo: archivo.id_archivo,
        },
      });

      uploaded.push({
        id: archivo.id_archivo,
        nombre: file.originalname,
        url: `/api/recursos/archivos/${archivo.id_archivo}`,
      });
    }

    return uploaded;
  }

  async deleteArchivo(
    ownerId: number,
    recursoId: number,
    archivoId: number,
    isAdmin = false,
  ) {
    const db = this.prisma as any;
    await this.assertOwner(ownerId, recursoId, isAdmin);

    const link = await db.archivo_Recurso_Auxiliar.findFirst({
      where: { id_recurso: recursoId, id_archivo: archivoId },
      include: { archivo: true },
    });

    if (!link)
      throw new NotFoundException('Archivo no encontrado en este recurso');

    await db.archivo_Recurso_Auxiliar.delete({
      where: { id_archivo_recurso: link.id_archivo_recurso },
    });

    // Eliminar archivo físico si no está en ningún otro lugar
    const otrosLinks = await db.archivo_Recurso_Auxiliar.count({
      where: { id_archivo: archivoId },
    });

    if (otrosLinks === 0) {
      const absPath = path.resolve(
        RECURSOS_UPLOAD_ROOT,
        link.archivo.nombre_unico ?? '',
      );
      if (fs.existsSync(absPath)) {
        await fsPromises.unlink(absPath).catch(() => undefined);
      }
      await db.archivo.delete({ where: { id_archivo: archivoId } });
    }

    return { ok: true };
  }

  async serveArchivo(archivoId: number) {
    const db = this.prisma as any;
    const archivo = await db.archivo.findUnique({
      where: { id_archivo: archivoId },
    });
    if (!archivo) throw new NotFoundException('Archivo no encontrado');

    const absPath = path.resolve(
      RECURSOS_UPLOAD_ROOT,
      archivo.nombre_unico ?? archivo.url,
    );
    if (!fs.existsSync(absPath))
      throw new NotFoundException('Archivo no encontrado en disco');

    return {
      path: absPath,
      originalName: archivo.nombre_original ?? path.basename(absPath),
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async assertOwner(
    ownerId: number,
    recursoId: number,
    isAdmin = false,
  ) {
    if (isAdmin) return;
    const db = this.prisma as any;
    const link = await db.usuario_Recurso_Auxiliar.findFirst({
      where: { id_usuario: ownerId, id_recurso_auxiliar: recursoId },
    });
    if (!link)
      throw new ForbiddenException('No tienes permiso sobre este recurso');
  }

  private formatRecurso(r: any) {
    return {
      id: r.id_recurso,
      nombre: r.nombre,
      descripcion: r.descripcion ?? null,
      tipo: {
        id: r.tipo?.id_tipo_recurso,
        nombre: r.tipo?.nombre_recurso,
      },
      autor: r.usuarios?.[0]?.usuario
        ? {
            id: r.usuarios[0].usuario.id,
            nombre: r.usuarios[0].usuario.nombre,
            correo: r.usuarios[0].usuario.correoInstitucional,
          }
        : null,
      archivos: (r.archivos ?? []).map((a: any) => ({
        id: a.archivo?.id_archivo,
        nombre: a.archivo?.nombre_original ?? a.archivo?.nombre_unico,
        nombreUnico: a.archivo?.nombre_unico,
        url: `/api/recursos/archivos/${a.archivo?.id_archivo}`,
        downloadUrl: `/api/recursos/archivos/${a.archivo?.id_archivo}?download=1`,
      })),
      createdAt: r.createdAt,
    };
  }
}
