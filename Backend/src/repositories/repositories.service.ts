import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { createHash, randomUUID } from 'crypto';

const REPOSITORY_UPLOAD_ROOT = path.join(
  process.cwd(),
  'uploads',
  'repositories',
);

type RepoLinkRecord = {
  repositorio: {
    id_repositorio: number;
    nombre: string;
    descripcion: string;
    id_pensum?: number | null;
    id_curso?: number | null;
    visibilidad?: string;
    estrellas?: number;
    vistas?: number;
    pensum?: {
      id_pensum: number;
      nombre: string;
      vigente: boolean;
    } | null;
    curso?: {
      id_curso: number;
      codigo: string;
      nombre: string;
      semestre: number;
      id_pensum: number;
    } | null;
    etiquetas: { etiqueta: { nombre_etiqueta: string } }[];
    stacks: { stack: { nombre_stack: string } }[];
    archivos: {
      archivo: {
        id_archivo: number;
        url: string;
        nombre_original: string | null;
        nombre_unico: string | null;
        ruta_relativa: string | null;
      };
    }[];
  };
};

type RepoUserDelegate = {
  findMany(args: {
    where: { id_usuario: number };
    include: {
      repositorio: {
        include: {
          pensum: true;
          curso: true;
          etiquetas: { include: { etiqueta: true } };
          stacks: { include: { stack: true } };
          archivos: { include: { archivo: true } };
        };
      };
    };
    orderBy: { id_repositorio_usuario: 'desc' };
  }): Promise<RepoLinkRecord[]>;
  create(args: {
    data: {
      id_usuario: number;
      id_repositorio: number;
    };
  }): Promise<unknown>;
};

type RepositoryTransactionClient = {
  repositorio: {
    create(args: {
      data: {
        nombre: string;
        descripcion: string;
        id_pensum?: number;
        id_curso?: number;
      };
    }): Promise<{ id_repositorio: number; nombre: string }>;
  };
  repositorio_Usuario: RepoUserDelegate;
  etiqueta: {
    findFirst(args: {
      where: { nombre_etiqueta: string };
    }): Promise<{ id_etiqueta: number } | null>;
    create(args: {
      data: { nombre_etiqueta: string };
    }): Promise<{ id_etiqueta: number }>;
  };
  etiqueta_Repositorio: {
    create(args: {
      data: { id_etiqueta: number; id_repositorio: number };
    }): Promise<unknown>;
  };
  stack: {
    findFirst(args: {
      where: { nombre_stack: string };
    }): Promise<{ id_stack: number } | null>;
    create(args: {
      data: { nombre_stack: string };
    }): Promise<{ id_stack: number }>;
  };
  stack_Repositorio: {
    create(args: {
      data: { id_stack: number; id_repositorio: number };
    }): Promise<unknown>;
  };
  archivo: {
    create(args: {
      data: {
        url: string;
        nombre_original: string;
        nombre_unico: string;
        ruta_relativa: string;
      };
    }): Promise<{ id_archivo: number }>;
  };
  archivo_Repositorio: {
    create(args: {
      data: { id_archivo: number; id_repositorio: number };
    }): Promise<unknown>;
  };
  pensum?: {
    findFirst(args: {
      where: { id_pensum: number };
      select?: { id_pensum: true };
    }): Promise<{ id_pensum: number } | null>;
  };
  curso?: {
    findFirst(args: {
      where: { id_curso: number };
      select?: { id_curso: true; id_pensum: true };
    }): Promise<{ id_curso: number; id_pensum: number } | null>;
  };
};

type RepositoryDownloadPayload = {
  repositoryId: number;
  repositoryName: string;
  files: {
    absolutePath: string;
    archivePath: string;
  }[];
};

type RepositoryCommitHistoryItem = {
  id: number;
  mensaje: string;
  accion: string;
  hashSnapshot: string | null;
  createdAt: Date;
  usuario: {
    id: number;
    nombre: string | null;
    correoInstitucional: string;
  };
  archivos: {
    ruta: string;
    hash: string;
    tamanoBytes: number | null;
  }[];
};

@Injectable()
export class RepositoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByOwner(ownerId: number) {
    const db = this.prisma as unknown as {
      repositorio_Usuario: RepoUserDelegate;
    };

    const linkedRepos = await db.repositorio_Usuario.findMany({
      where: { id_usuario: ownerId },
      include: {
        repositorio: {
          include: {
            pensum: true,
            curso: true,
            etiquetas: {
              include: { etiqueta: true },
            },
            stacks: {
              include: { stack: true },
            },
            archivos: {
              include: { archivo: true },
            },
          },
        },
      },
      orderBy: { id_repositorio_usuario: 'desc' },
    });

    return linkedRepos.map((link) => {
      const repo = link.repositorio;
      return {
        id: repo.id_repositorio,
        nombre: repo.nombre,
        descripcion: repo.descripcion,
        visibilidad: repo.visibilidad || 'public',
        estrellas: typeof repo.estrellas === 'number' ? repo.estrellas : 0,
        vistas: typeof repo.vistas === 'number' ? repo.vistas : 0,
        pensum: repo.pensum
          ? {
              id: repo.pensum.id_pensum,
              nombre: repo.pensum.nombre,
              vigente: repo.pensum.vigente,
            }
          : null,
        curso: repo.curso
          ? {
              id: repo.curso.id_curso,
              codigo: repo.curso.codigo,
              nombre: repo.curso.nombre,
              semestre: repo.curso.semestre,
              pensumId: repo.curso.id_pensum,
            }
          : null,
        tags: repo.etiquetas.map((tagLink) => tagLink.etiqueta.nombre_etiqueta),
        stacks: repo.stacks.map((stackLink) => stackLink.stack.nombre_stack),
        files: repo.archivos.map((fileLink) => {
          const file = fileLink.archivo;
          const fallbackName = this.sanitizeFileSegment(
            path.basename(file.url),
          );
          const storedPath = file.ruta_relativa || file.url;
          const normalizedStoredPath = storedPath.replace(/\\/g, '/');
          const storedSegments = normalizedStoredPath
            .split('/')
            .filter(Boolean);
          const visibleSegments =
            storedSegments[0] && /^repo-\d+-owner-\d+$/.test(storedSegments[0])
              ? storedSegments.slice(1, -1)
              : storedSegments.slice(0, -1);

          const folderRaw = visibleSegments.join('/');
          const folder =
            !folderRaw || folderRaw === '.'
              ? 'raiz'
              : folderRaw.replace(/\\/g, '/');

          return {
            id: file.id_archivo,
            nombre: file.nombre_original || file.nombre_unico || fallbackName,
            carpeta: folder,
            openUrl: `/api/files/${file.id_archivo}`,
            downloadUrl: `/api/files/${file.id_archivo}?download=1`,
          };
        }),
      };
    });
  }

  async createRepository(
    data: {
      nombre: string;
      descripcion: string;
      // note: schema follows the user's ER; owner is linked via Repositorio_Usuario
      ownerId: number;
      tags?: string[];
      stacks?: string[];
      categoryId?: number;
      pensumId?: number;
      cursoId?: number;
    },
    files: Express.Multer.File[],
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const t = tx as unknown as RepositoryTransactionClient;

        let normalizedPensumId: number | undefined;
        let normalizedCursoId: number | undefined;

        if (typeof data.pensumId === 'number' && !Number.isNaN(data.pensumId)) {
          const pensumExists = await t.pensum?.findFirst({
            where: { id_pensum: data.pensumId },
            select: { id_pensum: true },
          });

          if (!pensumExists) {
            throw new NotFoundException('El pensum seleccionado no existe');
          }

          normalizedPensumId = data.pensumId;
        }

        if (typeof data.cursoId === 'number' && !Number.isNaN(data.cursoId)) {
          const selectedCourse = await t.curso?.findFirst({
            where: { id_curso: data.cursoId },
            select: { id_curso: true, id_pensum: true },
          });

          if (!selectedCourse) {
            throw new NotFoundException('El curso seleccionado no existe');
          }

          if (
            normalizedPensumId !== undefined &&
            selectedCourse.id_pensum !== normalizedPensumId
          ) {
            throw new ForbiddenException(
              'El curso no pertenece al pensum seleccionado',
            );
          }

          normalizedCursoId = selectedCourse.id_curso;
          normalizedPensumId ??= selectedCourse.id_pensum;
        }

        const repo = await t.repositorio.create({
          data: {
            nombre: data.nombre,
            descripcion: data.descripcion,
            id_pensum: normalizedPensumId,
            id_curso: normalizedCursoId,
          },
        });

        // link owner in Repositorio_Usuario
        await t.repositorio_Usuario.create({
          data: {
            id_usuario: data.ownerId,
            id_repositorio: repo.id_repositorio,
          },
        });

        // handle tags (upsert Etiqueta and create Etiqueta_Repositorio)
        if (data.tags && data.tags.length) {
          for (const tagName of data.tags) {
            const name = tagName.trim();
            if (!name) continue;
            // nombre_etiqueta no es unique en el schema, usar findFirst/create
            let tag = await t.etiqueta.findFirst({
              where: { nombre_etiqueta: name },
            });
            if (!tag) {
              tag = await t.etiqueta.create({
                data: { nombre_etiqueta: name },
              });
            }
            await t.etiqueta_Repositorio
              .create({
                data: {
                  id_etiqueta: tag.id_etiqueta,
                  id_repositorio: repo.id_repositorio,
                },
              })
              .catch(() => undefined);
          }
        }

        // handle stacks
        if (data.stacks && data.stacks.length) {
          for (const sName of data.stacks) {
            const name = sName.trim();
            if (!name) continue;
            // nombre_stack no es unique en el schema, usar findFirst/create
            let stack = await t.stack.findFirst({
              where: { nombre_stack: name },
            });
            if (!stack) {
              stack = await t.stack.create({ data: { nombre_stack: name } });
            }
            await t.stack_Repositorio
              .create({
                data: {
                  id_stack: stack.id_stack,
                  id_repositorio: repo.id_repositorio,
                },
              })
              .catch(() => undefined);
          }
        }

        // handle files and move each one to folder by repository
        if (files && files.length) {
          const repoFolderName = `repo-${repo.id_repositorio}-owner-${data.ownerId}`;

          for (const incomingFile of files) {
            const moved = await this.moveFileToRepositoryFolder(
              incomingFile,
              repoFolderName,
            );

            const archivo = await t.archivo.create({
              data: {
                url: moved.relativePath,
                nombre_original: moved.originalName,
                nombre_unico: moved.storedName,
                ruta_relativa: moved.relativePath,
              },
            });

            await t.archivo_Repositorio
              .create({
                data: {
                  id_archivo: archivo.id_archivo,
                  id_repositorio: repo.id_repositorio,
                },
              })
              .catch(() => undefined);
          }
        }

        return repo;
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('No se pudo crear el repositorio');
    }
  }

  async updateRepository(
    ownerId: number,
    repositoryId: number,
    payload: {
      nombre?: string;
      descripcion?: string;
      tags?: string[];
      stacks?: string[];
      visibilidad?: 'public' | 'private';
    },
  ) {
    await this.assertOwnedRepository(ownerId, repositoryId);
    const db = this.prisma as any;

    await db.$transaction(async (tx: any) => {
      const updateData: Record<string, unknown> = {};

      if (typeof payload.nombre === 'string' && payload.nombre.trim()) {
        updateData.nombre = payload.nombre.trim();
      }

      if (typeof payload.descripcion === 'string') {
        updateData.descripcion = payload.descripcion;
      }

      if (
        payload.visibilidad === 'public' ||
        payload.visibilidad === 'private'
      ) {
        updateData.visibilidad = payload.visibilidad;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.repositorio.update({
          where: { id_repositorio: repositoryId },
          data: updateData,
        });
      }

      if (Array.isArray(payload.tags)) {
        await tx.etiqueta_Repositorio.deleteMany({
          where: { id_repositorio: repositoryId },
        });

        const uniqueTags = [
          ...new Set(payload.tags.map((item) => item.trim()).filter(Boolean)),
        ];

        for (const tagName of uniqueTags) {
          let tag = await tx.etiqueta.findFirst({
            where: { nombre_etiqueta: tagName },
          });
          if (!tag) {
            tag = await tx.etiqueta.create({
              data: { nombre_etiqueta: tagName },
            });
          }

          await tx.etiqueta_Repositorio
            .create({
              data: {
                id_etiqueta: tag.id_etiqueta,
                id_repositorio: repositoryId,
              },
            })
            .catch(() => undefined);
        }
      }

      if (Array.isArray(payload.stacks)) {
        await tx.stack_Repositorio.deleteMany({
          where: { id_repositorio: repositoryId },
        });

        const uniqueStacks = [
          ...new Set(payload.stacks.map((item) => item.trim()).filter(Boolean)),
        ];

        for (const stackName of uniqueStacks) {
          let stack = await tx.stack.findFirst({
            where: { nombre_stack: stackName },
          });
          if (!stack) {
            stack = await tx.stack.create({
              data: { nombre_stack: stackName },
            });
          }

          await tx.stack_Repositorio
            .create({
              data: {
                id_stack: stack.id_stack,
                id_repositorio: repositoryId,
              },
            })
            .catch(() => undefined);
        }
      }
    });

    const repositories = await this.findByOwner(ownerId);
    return repositories.find((repo) => repo.id === repositoryId);
  }
  async addFilesToRepository(
    ownerId: number,
    repositoryId: number,
    files: Express.Multer.File[],
    relativePaths: string[] = [],
  ) {
    await this.assertOwnedRepository(ownerId, repositoryId);
    if (!files.length) return [];

    const db = this.prisma as any;
    return db.$transaction(async (tx: any) => {
      const repoFolderName = `repo-${repositoryId}-owner-${ownerId}`;
      const uploaded: Array<{ id: number; nombre: string }> = [];

      for (const incomingFile of files) {
        const moved = await this.moveFileToRepositoryFolder(
          incomingFile,
          repoFolderName,
          relativePaths[uploaded.length],
        );

        // ── NUEVO: eliminar duplicado si ya existe un archivo con el mismo nombre ──
        const existing = await tx.archivo.findFirst({
          where: {
            nombre_original: moved.originalName,
            repositorios: { some: { id_repositorio: repositoryId } },
          },
        });

        if (existing) {
          await tx.archivo_Repositorio.deleteMany({
            where: {
              id_archivo: existing.id_archivo,
              id_repositorio: repositoryId,
            },
          });
          await tx.archivo.delete({
            where: { id_archivo: existing.id_archivo },
          });
          const absPath = this.resolveAbsolutePath(
            existing.ruta_relativa || existing.url,
          );
          if (fs.existsSync(absPath)) {
            await fsPromises.unlink(absPath).catch(() => undefined);
          }
        }
        // ────────────────────────────────────────────────────────────────────────────

        const archivo = await tx.archivo.create({
          data: {
            url: moved.relativePath,
            nombre_original: moved.originalName,
            nombre_unico: moved.storedName,
            ruta_relativa: moved.relativePath,
          },
        });

        await tx.archivo_Repositorio.create({
          data: {
            id_archivo: archivo.id_archivo,
            id_repositorio: repositoryId,
          },
        });

        uploaded.push({ id: archivo.id_archivo, nombre: moved.originalName });
      }

      return uploaded;
    });
  }

  async getRepositoryOptions() {
    const db = this.prisma as any;
    const [tagsRows, stacksRows, areaRows, pensumRows, courseRows] =
      await Promise.all([
        db.etiqueta.findMany({
          orderBy: { nombre_etiqueta: 'asc' },
          select: { nombre_etiqueta: true },
        }),
        db.stack.findMany({
          orderBy: { nombre_stack: 'asc' },
          select: { nombre_stack: true },
        }),
        db.areaTecnica?.findMany
          ? db.areaTecnica.findMany({
              orderBy: { nombre: 'asc' },
              select: {
                id_area: true,
                nombre: true,
                color: true,
              },
            })
          : Promise.resolve([]),
        db.pensum?.findMany
          ? db.pensum.findMany({
              orderBy: { nombre: 'asc' },
              select: {
                id_pensum: true,
                nombre: true,
                vigente: true,
              },
            })
          : Promise.resolve([]),
        db.curso?.findMany
          ? db.curso.findMany({
              orderBy: [{ semestre: 'asc' }, { codigo: 'asc' }],
              select: {
                id_curso: true,
                codigo: true,
                nombre: true,
                semestre: true,
                id_pensum: true,
                id_area: true,
              },
            })
          : Promise.resolve([]),
      ]);

    return {
      tags: tagsRows.map(
        (row: { nombre_etiqueta: string }) => row.nombre_etiqueta,
      ),
      stacks: stacksRows.map(
        (row: { nombre_stack: string }) => row.nombre_stack,
      ),
      areas: areaRows.map(
        (row: { id_area: number; nombre: string; color?: string | null }) => ({
          id: row.id_area,
          nombre: row.nombre,
          color: row.color ?? null,
        }),
      ),
      pensums: pensumRows.map(
        (row: { id_pensum: number; nombre: string; vigente: boolean }) => ({
          id: row.id_pensum,
          nombre: row.nombre,
          vigente: row.vigente,
        }),
      ),
      courses: courseRows.map(
        (row: {
          id_curso: number;
          codigo: string;
          nombre: string;
          semestre: number;
          id_pensum: number;
          id_area: number | null;
        }) => ({
          id: row.id_curso,
          codigo: row.codigo,
          nombre: row.nombre,
          semestre: row.semestre,
          pensumId: row.id_pensum,
          areaId: row.id_area,
        }),
      ),
    };
  }

  async deleteRepositoryFile(
    ownerId: number,
    repositoryId: number,
    fileId: number,
  ) {
    await this.assertOwnedRepository(ownerId, repositoryId);
    const db = this.prisma as any;

    const link = await db.archivo_Repositorio.findFirst({
      where: {
        id_repositorio: repositoryId,
        id_archivo: fileId,
      },
      include: {
        archivo: true,
      },
    });

    if (!link) {
      throw new NotFoundException('Archivo no encontrado en el repositorio');
    }

    await db.archivo_Repositorio.delete({
      where: {
        id_archivo_id_repositorio: {
          id_archivo: fileId,
          id_repositorio: repositoryId,
        },
      },
    });

    const remainingLinks = await db.archivo_Repositorio.count({
      where: {
        id_archivo: fileId,
      },
    });

    if (remainingLinks === 0) {
      const storedPath = link.archivo.ruta_relativa || link.archivo.url;
      const absolutePath = this.resolveAbsolutePath(storedPath);
      if (fs.existsSync(absolutePath)) {
        await fsPromises.unlink(absolutePath).catch(() => undefined);
      }

      await db.archivo.delete({
        where: {
          id_archivo: fileId,
        },
      });
    }
  }

  private async assertOwnedRepository(ownerId: number, repositoryId: number) {
    const db = this.prisma as any;

    const relation = await db.repositorio_Usuario.findFirst({
      where: {
        id_usuario: ownerId,
        id_repositorio: repositoryId,
      },
      include: {
        repositorio: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('Repositorio no encontrado');
    }

    if (!relation.repositorio) {
      throw new ForbiddenException('No tienes acceso al repositorio');
    }

    return relation.repositorio;
  }

  async getRepositoryDownloadPayload(
    ownerId: number,
    repositoryId: number,
  ): Promise<RepositoryDownloadPayload | null> {
    const db = this.prisma as unknown as {
      repositorio: {
        findFirst(args: {
          where: {
            id_repositorio: number;
            usuarios: { some: { id_usuario: number } };
          };
          include: {
            archivos: {
              include: {
                archivo: true;
              };
            };
          };
        }): Promise<{
          id_repositorio: number;
          nombre: string;
          archivos: {
            archivo: {
              id_archivo: number;
              url: string;
              nombre_original: string | null;
              nombre_unico: string | null;
              ruta_relativa: string | null;
            };
          }[];
        } | null>;
      };
    };

    const repository = await db.repositorio.findFirst({
      where: {
        id_repositorio: repositoryId,
        usuarios: { some: { id_usuario: ownerId } },
      },
      include: {
        archivos: {
          include: {
            archivo: true,
          },
        },
      },
    });

    if (!repository) return null;

    const files = repository.archivos
      .map((link) => {
        const file = link.archivo;
        const storedPath = file.ruta_relativa || file.url;
        const absolutePath = this.resolveAbsolutePath(storedPath);

        if (!fs.existsSync(absolutePath)) return null;

        const normalizedStoredPath = storedPath.replace(/\\/g, '/');
        const storedSegments = normalizedStoredPath.split('/').filter(Boolean);
        const visibleSegments =
          storedSegments[0] && /^repo-\d+-owner-\d+$/.test(storedSegments[0])
            ? storedSegments.slice(1, -1)
            : storedSegments.slice(0, -1);

        const filename =
          file.nombre_original ||
          file.nombre_unico ||
          path.basename(storedPath);
        const archivePath = this.normalizeRelativePath(
          path.join(...visibleSegments, filename),
        );

        return {
          absolutePath,
          archivePath,
        };
      })
      .filter((item): item is { absolutePath: string; archivePath: string } =>
        Boolean(item),
      );

    return {
      repositoryId: repository.id_repositorio,
      repositoryName: repository.nombre,
      files,
    };
  }

  async getPublicRepositoryDownloadPayload(
    repositoryId: number,
  ): Promise<RepositoryDownloadPayload | null> {
    return this.getPublicRepositoryDownloadPayloadByOwner(repositoryId);
  }

  async getPublicRepositoryDownloadPayloadByOwner(
    repositoryId: number,
    ownerId?: number,
  ): Promise<RepositoryDownloadPayload | null> {
    const db = this.prisma as unknown as {
      repositorio: {
        findFirst(args: {
          where: {
            id_repositorio: number;
            visibilidad: string;
            usuarios?: { some: { id_usuario: number } };
          };
          include: {
            archivos: {
              include: {
                archivo: true;
              };
            };
          };
        }): Promise<{
          id_repositorio: number;
          nombre: string;
          archivos: {
            archivo: {
              id_archivo: number;
              url: string;
              nombre_original: string | null;
              nombre_unico: string | null;
              ruta_relativa: string | null;
            };
          }[];
        } | null>;
      };
    };

    const repository = await db.repositorio.findFirst({
      where: {
        id_repositorio: repositoryId,
        visibilidad: 'public',
        ...(typeof ownerId === 'number'
          ? { usuarios: { some: { id_usuario: ownerId } } }
          : {}),
      },
      include: {
        archivos: {
          include: {
            archivo: true,
          },
        },
      },
    });

    if (!repository) return null;

    const files = repository.archivos
      .map((link) => {
        const file = link.archivo;
        const storedPath = file.ruta_relativa || file.url;
        const absolutePath = this.resolveAbsolutePath(storedPath);

        if (!fs.existsSync(absolutePath)) return null;

        const normalizedStoredPath = storedPath.replace(/\\/g, '/');
        const storedSegments = normalizedStoredPath.split('/').filter(Boolean);
        const visibleSegments =
          storedSegments[0] && /^repo-\d+-owner-\d+$/.test(storedSegments[0])
            ? storedSegments.slice(1, -1)
            : storedSegments.slice(0, -1);

        const filename =
          file.nombre_original ||
          file.nombre_unico ||
          path.basename(storedPath);
        const archivePath = this.normalizeRelativePath(
          path.join(...visibleSegments, filename),
        );

        return {
          absolutePath,
          archivePath,
        };
      })
      .filter((item): item is { absolutePath: string; archivePath: string } =>
        Boolean(item),
      );

    return {
      repositoryId: repository.id_repositorio,
      repositoryName: repository.nombre,
      files,
    };
  }

  async listRepositoryCommits(ownerId: number, repositoryId: number) {
    await this.assertOwnedRepository(ownerId, repositoryId);

    const db = this.prisma as any;
    const commits = await db.repoCommit.findMany({
      where: {
        id_repositorio: repositoryId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            correoInstitucional: true,
          },
        },
        archivos: {
          select: {
            ruta: true,
            hash_archivo: true,
            tamano_bytes: true,
          },
          orderBy: {
            ruta: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return commits.map(
      (commit: any): RepositoryCommitHistoryItem => ({
        id: commit.id_commit,
        mensaje: commit.mensaje,
        accion: commit.accion,
        hashSnapshot: commit.hash_snapshot ?? null,
        createdAt: commit.createdAt,
        usuario: {
          id: Number(commit.usuario?.id ?? 0),
          nombre: commit.usuario?.nombre ?? null,
          correoInstitucional:
            commit.usuario?.correoInstitucional ?? 'usuario@desconocido',
        },
        archivos: (Array.isArray(commit.archivos) ? commit.archivos : []).map(
          (file: any) => ({
            ruta: file.ruta,
            hash: file.hash_archivo,
            tamanoBytes: file.tamano_bytes ?? null,
          }),
        ),
      }),
    );
  }

  async createRepositoryCommit(
    ownerId: number,
    repositoryId: number,
    message?: string,
    action: 'commit' | 'push' = 'commit',
  ) {
    await this.assertOwnedRepository(ownerId, repositoryId);

    const repositories = await this.findByOwner(ownerId);
    const repository = repositories.find((repo) => repo.id === repositoryId);

    if (!repository) {
      throw new NotFoundException('Repositorio no encontrado');
    }

    const fileSnapshots = (repository.files || [])
      .map((file) => {
        const folder =
          !file.carpeta || file.carpeta === 'raiz' ? '' : file.carpeta;
        const normalizedPath = this.normalizeRelativePath(
          folder ? `${folder}/${file.nombre}` : file.nombre,
        );
        return {
          ruta: normalizedPath,
          hash_archivo: createHash('sha256')
            .update(`${normalizedPath}:${file.id}`)
            .digest('hex'),
          tamano_bytes: null as number | null,
        };
      })
      .sort((a, b) => a.ruta.localeCompare(b.ruta));

    const hashSnapshot = createHash('sha256')
      .update(
        JSON.stringify({
          repositoryId,
          files: fileSnapshots.map((file) => ({
            ruta: file.ruta,
            hash: file.hash_archivo,
          })),
        }),
      )
      .digest('hex');

    const db = this.prisma as any;
    const commit = await db.$transaction(async (tx: any) => {
      const createdCommit = await tx.repoCommit.create({
        data: {
          id_repositorio: repositoryId,
          id_usuario: ownerId,
          mensaje:
            (message || '').trim() ||
            (action === 'push'
              ? 'Push manual desde Syshub'
              : 'Commit manual desde Syshub'),
          accion: action,
          hash_snapshot: hashSnapshot,
        },
      });

      if (fileSnapshots.length) {
        await tx.repoCommitArchivo.createMany({
          data: fileSnapshots.map((file) => ({
            id_commit: createdCommit.id_commit,
            ruta: file.ruta,
            hash_archivo: file.hash_archivo,
            tamano_bytes: file.tamano_bytes,
          })),
        });
      }

      await tx.repoSyncEvent.create({
        data: {
          id_repositorio: repositoryId,
          id_usuario: ownerId,
          id_commit: createdCommit.id_commit,
          accion: action,
          detalle:
            action === 'push'
              ? 'Push ejecutado con snapshot actual'
              : 'Commit creado con snapshot actual',
        },
      });

      return createdCommit;
    });

    return {
      id: commit.id_commit,
      mensaje: commit.mensaje,
      accion: commit.accion,
      hashSnapshot: commit.hash_snapshot,
      createdAt: commit.createdAt,
      filesCount: fileSnapshots.length,
    };
  }

  async pullRepository(ownerId: number, repositoryId: number) {
    await this.assertOwnedRepository(ownerId, repositoryId);

    const db = this.prisma as any;
    const latestCommit = await db.repoCommit.findFirst({
      where: {
        id_repositorio: repositoryId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        archivos: {
          select: {
            ruta: true,
            hash_archivo: true,
          },
          orderBy: {
            ruta: 'asc',
          },
        },
      },
    });

    await db.repoSyncEvent.create({
      data: {
        id_repositorio: repositoryId,
        id_usuario: ownerId,
        id_commit: latestCommit?.id_commit,
        accion: 'pull',
        detalle: latestCommit
          ? 'Pull ejecutado usando el último commit remoto'
          : 'Pull ejecutado sin commits previos',
      },
    });

    return {
      commit: latestCommit
        ? {
            id: latestCommit.id_commit,
            mensaje: latestCommit.mensaje,
            accion: latestCommit.accion,
            hashSnapshot: latestCommit.hash_snapshot,
            createdAt: latestCommit.createdAt,
            filesCount: Array.isArray(latestCommit.archivos)
              ? latestCommit.archivos.length
              : 0,
          }
        : null,
      summary: latestCommit
        ? 'Pull completado. Se sincronizó el último commit del repositorio.'
        : 'Pull completado. Aún no hay commits para sincronizar.',
    };
  }

  private sanitizeFileSegment(value: string): string {
    const cleaned = value
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    return cleaned || 'archivo';
  }

  private resolveAbsolutePath(storedPath: string): string {
    if (path.isAbsolute(storedPath)) {
      return path.resolve(storedPath);
    }

    return path.resolve(REPOSITORY_UPLOAD_ROOT, storedPath);
  }

  private normalizeRelativePath(relativePath: string): string {
    return relativePath.replace(/\\/g, '/');
  }

  private async moveFileToRepositoryFolder(
    file: Express.Multer.File,
    repoFolderName: string,
    relativePathOverride?: string,
  ): Promise<{
    relativePath: string;
    storedName: string;
    originalName: string;
  }> {
    const relativeOriginal = (relativePathOverride || file.originalname)
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\.{2,}/g, '');

    const extension = path
      .extname(relativeOriginal || file.originalname)
      .toLowerCase();
    const baseName = path.basename(
      relativeOriginal || file.originalname,
      extension,
    );
    const originalName = path.basename(relativeOriginal || file.originalname);
    const clientFolder = path.dirname(relativeOriginal);
    const safeClientFolder =
      clientFolder && clientFolder !== '.'
        ? this.normalizeRelativePath(clientFolder)
            .split('/')
            .map((part) => this.sanitizeFileSegment(part))
            .join('/')
        : '';

    const safeBaseName = this.sanitizeFileSegment(baseName).slice(0, 80);
    const storedName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;

    const relativePath = this.normalizeRelativePath(
      path.join(repoFolderName, safeClientFolder, storedName),
    );

    const destinationAbsolutePath = path.join(
      REPOSITORY_UPLOAD_ROOT,
      relativePath,
    );

    await fsPromises.mkdir(path.dirname(destinationAbsolutePath), {
      recursive: true,
    });

    try {
      await fsPromises.rename(file.path, destinationAbsolutePath);
    } catch {
      await fsPromises.copyFile(file.path, destinationAbsolutePath);
      await fsPromises.unlink(file.path);
    }

    return {
      relativePath,
      storedName,
      originalName,
    };
  }
}
