-- CreateTable
CREATE TABLE "Blog" (
    "id_blog" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autorId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "tipoId" INTEGER,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id_blog")
);

-- CreateTable
CREATE TABLE "BlogUser" (
    "id_blog_user" SERIAL NOT NULL,
    "blogId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "BlogUser_pkey" PRIMARY KEY ("id_blog_user")
);

-- CreateTable
CREATE TABLE "BlogValoracion" (
    "id_valoracion" SERIAL NOT NULL,
    "valoracion" BOOLEAN NOT NULL,
    "blogId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "BlogValoracion_pkey" PRIMARY KEY ("id_valoracion")
);

-- CreateTable
CREATE TABLE "BlogComentario" (
    "id_comentario" SERIAL NOT NULL,
    "comentario" TEXT NOT NULL,
    "blogId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogComentario_pkey" PRIMARY KEY ("id_comentario")
);

-- CreateTable
CREATE TABLE "Articulo" (
    "id_articulo" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autorId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "tipoId" INTEGER,

    CONSTRAINT "Articulo_pkey" PRIMARY KEY ("id_articulo")
);

-- CreateTable
CREATE TABLE "ArticuloUser" (
    "id_articulo_user" SERIAL NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ArticuloUser_pkey" PRIMARY KEY ("id_articulo_user")
);

-- CreateTable
CREATE TABLE "ArticuloValoracion" (
    "id_valoracion" SERIAL NOT NULL,
    "valoracion" BOOLEAN NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ArticuloValoracion_pkey" PRIMARY KEY ("id_valoracion")
);

-- CreateTable
CREATE TABLE "ArticuloComentario" (
    "id_comentario" SERIAL NOT NULL,
    "comentario" TEXT NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticuloComentario_pkey" PRIMARY KEY ("id_comentario")
);

-- CreateIndex
CREATE INDEX "Blog_autorId_idx" ON "Blog"("autorId");

-- CreateIndex
CREATE INDEX "Blog_createdAt_idx" ON "Blog"("createdAt");

-- CreateIndex
CREATE INDEX "BlogUser_blogId_idx" ON "BlogUser"("blogId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogUser_blogId_userId_key" ON "BlogUser"("blogId", "userId");

-- CreateIndex
CREATE INDEX "BlogValoracion_blogId_idx" ON "BlogValoracion"("blogId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogValoracion_blogId_userId_key" ON "BlogValoracion"("blogId", "userId");

-- CreateIndex
CREATE INDEX "BlogComentario_blogId_idx" ON "BlogComentario"("blogId");

-- CreateIndex
CREATE INDEX "Articulo_autorId_idx" ON "Articulo"("autorId");

-- CreateIndex
CREATE INDEX "Articulo_createdAt_idx" ON "Articulo"("createdAt");

-- CreateIndex
CREATE INDEX "ArticuloUser_articuloId_idx" ON "ArticuloUser"("articuloId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticuloUser_articuloId_userId_key" ON "ArticuloUser"("articuloId", "userId");

-- CreateIndex
CREATE INDEX "ArticuloValoracion_articuloId_idx" ON "ArticuloValoracion"("articuloId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticuloValoracion_articuloId_userId_key" ON "ArticuloValoracion"("articuloId", "userId");

-- CreateIndex
CREATE INDEX "ArticuloComentario_articuloId_idx" ON "ArticuloComentario"("articuloId");

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaForo"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoHiloForo"("id_tipo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogUser" ADD CONSTRAINT "BlogUser_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id_blog") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogUser" ADD CONSTRAINT "BlogUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogValoracion" ADD CONSTRAINT "BlogValoracion_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id_blog") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogValoracion" ADD CONSTRAINT "BlogValoracion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComentario" ADD CONSTRAINT "BlogComentario_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id_blog") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComentario" ADD CONSTRAINT "BlogComentario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaForo"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoHiloForo"("id_tipo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloUser" ADD CONSTRAINT "ArticuloUser_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id_articulo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloUser" ADD CONSTRAINT "ArticuloUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloValoracion" ADD CONSTRAINT "ArticuloValoracion_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id_articulo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloValoracion" ADD CONSTRAINT "ArticuloValoracion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloComentario" ADD CONSTRAINT "ArticuloComentario_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id_articulo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloComentario" ADD CONSTRAINT "ArticuloComentario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
