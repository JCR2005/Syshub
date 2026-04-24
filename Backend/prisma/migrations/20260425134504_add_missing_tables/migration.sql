/*
  Warnings:

  - A unique constraint covering the columns `[nombre_unico]` on the table `Archivo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Archivo" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nombre_original" TEXT,
ADD COLUMN     "nombre_unico" TEXT,
ADD COLUMN     "ruta_relativa" TEXT;

-- AlterTable
ALTER TABLE "Repositorio" ADD COLUMN     "estrellas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "id_curso" INTEGER,
ADD COLUMN     "id_pensum" INTEGER,
ADD COLUMN     "visibilidad" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN     "vistas" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AreaTecnica" (
    "id_area" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "color" TEXT,

    CONSTRAINT "AreaTecnica_pkey" PRIMARY KEY ("id_area")
);

-- CreateTable
CREATE TABLE "Pensum" (
    "id_pensum" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pensum_pkey" PRIMARY KEY ("id_pensum")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id_curso" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL,
    "id_pensum" INTEGER NOT NULL,
    "id_area" INTEGER,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "CategoriaForo" (
    "id_categoria" SERIAL NOT NULL,
    "categoria" TEXT NOT NULL,

    CONSTRAINT "CategoriaForo_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "TipoHiloForo" (
    "id_tipo" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "TipoHiloForo_pkey" PRIMARY KEY ("id_tipo")
);

-- CreateTable
CREATE TABLE "HiloForo" (
    "id_hilo_foro" SERIAL NOT NULL,
    "nombre_hilo_foro" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "reportado" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autorId" INTEGER NOT NULL,

    CONSTRAINT "HiloForo_pkey" PRIMARY KEY ("id_hilo_foro")
);

-- CreateTable
CREATE TABLE "HiloForo_Categoria" (
    "id_hilo_foro_categoria" SERIAL NOT NULL,
    "id_hilo_foro" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "HiloForo_Categoria_pkey" PRIMARY KEY ("id_hilo_foro_categoria")
);

-- CreateTable
CREATE TABLE "HiloForo_Tipo" (
    "id_hilo_foro_tipo" SERIAL NOT NULL,
    "id_hilo_foro" INTEGER NOT NULL,
    "id_tipo" INTEGER NOT NULL,

    CONSTRAINT "HiloForo_Tipo_pkey" PRIMARY KEY ("id_hilo_foro_tipo")
);

-- CreateTable
CREATE TABLE "HiloForo_Usuario" (
    "id_hilo_foro_usuario" SERIAL NOT NULL,
    "id_hilo_foro" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "HiloForo_Usuario_pkey" PRIMARY KEY ("id_hilo_foro_usuario")
);

-- CreateTable
CREATE TABLE "ValoracionHiloForo" (
    "id_valoracion" SERIAL NOT NULL,
    "valoracion" BOOLEAN NOT NULL,
    "id_hilo_foro" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "ValoracionHiloForo_pkey" PRIMARY KEY ("id_valoracion")
);

-- CreateTable
CREATE TABLE "ComentarioHiloForo" (
    "id_comentario" SERIAL NOT NULL,
    "comentario" TEXT NOT NULL,
    "id_hilo_foro" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioHiloForo_pkey" PRIMARY KEY ("id_comentario")
);

-- CreateTable
CREATE TABLE "ValoracionComentario" (
    "id" SERIAL NOT NULL,
    "valoracion" BOOLEAN NOT NULL,
    "comentarioId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ValoracionComentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AreaTecnica_nombre_key" ON "AreaTecnica"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Pensum_nombre_key" ON "Pensum"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_key" ON "Curso"("codigo");

-- CreateIndex
CREATE INDEX "Curso_id_pensum_idx" ON "Curso"("id_pensum");

-- CreateIndex
CREATE INDEX "Curso_id_area_idx" ON "Curso"("id_area");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_nombre_id_pensum_semestre_key" ON "Curso"("nombre", "id_pensum", "semestre");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaForo_categoria_key" ON "CategoriaForo"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "TipoHiloForo_tipo_key" ON "TipoHiloForo"("tipo");

-- CreateIndex
CREATE INDEX "HiloForo_autorId_idx" ON "HiloForo"("autorId");

-- CreateIndex
CREATE INDEX "HiloForo_createdAt_idx" ON "HiloForo"("createdAt");

-- CreateIndex
CREATE INDEX "HiloForo_Categoria_id_hilo_foro_idx" ON "HiloForo_Categoria"("id_hilo_foro");

-- CreateIndex
CREATE UNIQUE INDEX "HiloForo_Categoria_id_hilo_foro_id_categoria_key" ON "HiloForo_Categoria"("id_hilo_foro", "id_categoria");

-- CreateIndex
CREATE INDEX "HiloForo_Tipo_id_hilo_foro_idx" ON "HiloForo_Tipo"("id_hilo_foro");

-- CreateIndex
CREATE UNIQUE INDEX "HiloForo_Tipo_id_hilo_foro_id_tipo_key" ON "HiloForo_Tipo"("id_hilo_foro", "id_tipo");

-- CreateIndex
CREATE INDEX "HiloForo_Usuario_id_hilo_foro_idx" ON "HiloForo_Usuario"("id_hilo_foro");

-- CreateIndex
CREATE UNIQUE INDEX "HiloForo_Usuario_id_hilo_foro_id_usuario_key" ON "HiloForo_Usuario"("id_hilo_foro", "id_usuario");

-- CreateIndex
CREATE INDEX "ValoracionHiloForo_id_hilo_foro_idx" ON "ValoracionHiloForo"("id_hilo_foro");

-- CreateIndex
CREATE UNIQUE INDEX "ValoracionHiloForo_id_hilo_foro_id_usuario_key" ON "ValoracionHiloForo"("id_hilo_foro", "id_usuario");

-- CreateIndex
CREATE INDEX "ComentarioHiloForo_id_hilo_foro_idx" ON "ComentarioHiloForo"("id_hilo_foro");

-- CreateIndex
CREATE INDEX "ComentarioHiloForo_id_usuario_idx" ON "ComentarioHiloForo"("id_usuario");

-- CreateIndex
CREATE INDEX "ValoracionComentario_comentarioId_idx" ON "ValoracionComentario"("comentarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ValoracionComentario_comentarioId_userId_key" ON "ValoracionComentario"("comentarioId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Archivo_nombre_unico_key" ON "Archivo"("nombre_unico");

-- CreateIndex
CREATE INDEX "Repositorio_id_pensum_idx" ON "Repositorio"("id_pensum");

-- CreateIndex
CREATE INDEX "Repositorio_id_curso_idx" ON "Repositorio"("id_curso");

-- AddForeignKey
ALTER TABLE "Repositorio" ADD CONSTRAINT "Repositorio_id_pensum_fkey" FOREIGN KEY ("id_pensum") REFERENCES "Pensum"("id_pensum") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repositorio" ADD CONSTRAINT "Repositorio_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso"("id_curso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_id_pensum_fkey" FOREIGN KEY ("id_pensum") REFERENCES "Pensum"("id_pensum") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "AreaTecnica"("id_area") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiloForo" ADD CONSTRAINT "HiloForo_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiloForo_Categoria" ADD CONSTRAINT "HiloForo_Categoria_id_hilo_foro_fkey" FOREIGN KEY ("id_hilo_foro") REFERENCES "HiloForo"("id_hilo_foro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiloForo_Categoria" ADD CONSTRAINT "HiloForo_Categoria_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "CategoriaForo"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiloForo_Tipo" ADD CONSTRAINT "HiloForo_Tipo_id_hilo_foro_fkey" FOREIGN KEY ("id_hilo_foro") REFERENCES "HiloForo"("id_hilo_foro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiloForo_Tipo" ADD CONSTRAINT "HiloForo_Tipo_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "TipoHiloForo"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiloForo_Usuario" ADD CONSTRAINT "HiloForo_Usuario_id_hilo_foro_fkey" FOREIGN KEY ("id_hilo_foro") REFERENCES "HiloForo"("id_hilo_foro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiloForo_Usuario" ADD CONSTRAINT "HiloForo_Usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValoracionHiloForo" ADD CONSTRAINT "ValoracionHiloForo_id_hilo_foro_fkey" FOREIGN KEY ("id_hilo_foro") REFERENCES "HiloForo"("id_hilo_foro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValoracionHiloForo" ADD CONSTRAINT "ValoracionHiloForo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioHiloForo" ADD CONSTRAINT "ComentarioHiloForo_id_hilo_foro_fkey" FOREIGN KEY ("id_hilo_foro") REFERENCES "HiloForo"("id_hilo_foro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioHiloForo" ADD CONSTRAINT "ComentarioHiloForo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValoracionComentario" ADD CONSTRAINT "ValoracionComentario_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "ComentarioHiloForo"("id_comentario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValoracionComentario" ADD CONSTRAINT "ValoracionComentario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
