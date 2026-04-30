/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const blogTypeRegex = /blog|art[íi]culo|tutorial|investigaci[oó]n/i;
const articleTypeRegex = /art[íi]culo|investigaci[oó]n/i;

function isBlogType(name) {
  return blogTypeRegex.test(name || '');
}

function isArticuloType(name) {
  return articleTypeRegex.test(name || '');
}

async function main() {
  console.log('Migrando HiloForo -> Blog/Articulo (solo tipos editorial)...');

  const hilos = await prisma.hiloForo.findMany({
    include: {
      autor: true,
      categorias: { include: { categoria: true } },
      tipos: { include: { tipo: true } },
      comentarios: true,
      valoraciones: true,
    },
  });

  let migratedBlogs = 0;
  let migratedArticulos = 0;

  for (const hilo of hilos) {
    const tipoNombre = hilo.tipos?.[0]?.tipo?.tipo ?? '';
    if (!isBlogType(tipoNombre)) continue;

    const isArticulo = isArticuloType(tipoNombre);
    const categoriaId = hilo.categorias?.[0]?.categoria?.id_categoria ?? null;
    if (!categoriaId) continue;

    const payload = {
      titulo: hilo.nombre_hilo_foro,
      contenido: hilo.contenido,
      coverImageUrl: hilo.coverImageUrl ?? null,
      upvotes: hilo.upvotes ?? 0,
      createdAt: hilo.createdAt,
      updatedAt: hilo.updatedAt,
      autorId: hilo.autorId,
      categoriaId,
      tipoId: hilo.tipos?.[0]?.tipo?.id_tipo ?? null,
    };

    if (isArticulo) {
      const articulo = await prisma.articulo.create({ data: payload });
      migratedArticulos += 1;

      if (hilo.comentarios?.length) {
        await prisma.articuloComentario.createMany({
          data: hilo.comentarios.map((c) => ({
            comentario: c.comentario,
            articuloId: articulo.id_articulo,
            autorId: c.id_usuario,
            createdAt: c.createdAt,
          })),
        });
      }

      if (hilo.valoraciones?.length) {
        for (const v of hilo.valoraciones) {
          await prisma.articuloValoracion.upsert({
            where: { articuloId_userId: { articuloId: articulo.id_articulo, userId: v.id_usuario } },
            update: { valoracion: v.valoracion },
            create: { articuloId: articulo.id_articulo, userId: v.id_usuario, valoracion: v.valoracion },
          });
        }
      }

      await prisma.articuloUser.upsert({
        where: { articuloId_userId: { articuloId: articulo.id_articulo, userId: hilo.autorId } },
        create: { articuloId: articulo.id_articulo, userId: hilo.autorId },
        update: {},
      });
    } else {
      const blog = await prisma.blog.create({ data: payload });
      migratedBlogs += 1;

      if (hilo.comentarios?.length) {
        await prisma.blogComentario.createMany({
          data: hilo.comentarios.map((c) => ({
            comentario: c.comentario,
            blogId: blog.id_blog,
            autorId: c.id_usuario,
            createdAt: c.createdAt,
          })),
        });
      }

      if (hilo.valoraciones?.length) {
        for (const v of hilo.valoraciones) {
          await prisma.blogValoracion.upsert({
            where: { blogId_userId: { blogId: blog.id_blog, userId: v.id_usuario } },
            update: { valoracion: v.valoracion },
            create: { blogId: blog.id_blog, userId: v.id_usuario, valoracion: v.valoracion },
          });
        }
      }

      await prisma.blogUser.upsert({
        where: { blogId_userId: { blogId: blog.id_blog, userId: hilo.autorId } },
        create: { blogId: blog.id_blog, userId: hilo.autorId },
        update: {},
      });
    }
  }

  console.log(`Migración completa. Blogs: ${migratedBlogs}, Artículos: ${migratedArticulos}`);
}

main()
  .catch((err) => {
    console.error('Error en migración editorial:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
