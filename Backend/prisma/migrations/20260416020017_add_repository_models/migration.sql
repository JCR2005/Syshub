-- CreateTable
CREATE TABLE "Repositorio" (
    "id_repositorio" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Repositorio_pkey" PRIMARY KEY ("id_repositorio")
);

-- CreateTable
CREATE TABLE "Repositorio_Usuario" (
    "id_repositorio_usuario" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_repositorio" INTEGER NOT NULL,

    CONSTRAINT "Repositorio_Usuario_pkey" PRIMARY KEY ("id_repositorio_usuario")
);

-- CreateTable
CREATE TABLE "Etiqueta" (
    "id_etiqueta" SERIAL NOT NULL,
    "nombre_etiqueta" TEXT NOT NULL,

    CONSTRAINT "Etiqueta_pkey" PRIMARY KEY ("id_etiqueta")
);

-- CreateTable
CREATE TABLE "Etiqueta_Repositorio" (
    "id_etiqueta" INTEGER NOT NULL,
    "id_repositorio" INTEGER NOT NULL,

    CONSTRAINT "Etiqueta_Repositorio_pkey" PRIMARY KEY ("id_etiqueta","id_repositorio")
);

-- CreateTable
CREATE TABLE "Stack" (
    "id_stack" SERIAL NOT NULL,
    "nombre_stack" TEXT NOT NULL,

    CONSTRAINT "Stack_pkey" PRIMARY KEY ("id_stack")
);

-- CreateTable
CREATE TABLE "Stack_Repositorio" (
    "id_stack" INTEGER NOT NULL,
    "id_repositorio" INTEGER NOT NULL,

    CONSTRAINT "Stack_Repositorio_pkey" PRIMARY KEY ("id_stack","id_repositorio")
);

-- CreateTable
CREATE TABLE "Archivo" (
    "id_archivo" SERIAL NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Archivo_pkey" PRIMARY KEY ("id_archivo")
);

-- CreateTable
CREATE TABLE "Archivo_Repositorio" (
    "id_archivo" INTEGER NOT NULL,
    "id_repositorio" INTEGER NOT NULL,

    CONSTRAINT "Archivo_Repositorio_pkey" PRIMARY KEY ("id_archivo","id_repositorio")
);

-- CreateTable
CREATE TABLE "Tipo_Recurso" (
    "id_tipo_recurso" SERIAL NOT NULL,
    "nombre_recurso" TEXT NOT NULL,

    CONSTRAINT "Tipo_Recurso_pkey" PRIMARY KEY ("id_tipo_recurso")
);

-- CreateTable
CREATE TABLE "Recurso_Auxiliar" (
    "id_recurso" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "id_tipo_recurso" INTEGER NOT NULL,

    CONSTRAINT "Recurso_Auxiliar_pkey" PRIMARY KEY ("id_recurso")
);

-- CreateTable
CREATE TABLE "Recurso_Repositorio" (
    "id_recurso" INTEGER NOT NULL,
    "id_repositorio" INTEGER NOT NULL,

    CONSTRAINT "Recurso_Repositorio_pkey" PRIMARY KEY ("id_recurso","id_repositorio")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repositorio_Usuario_id_usuario_id_repositorio_key" ON "Repositorio_Usuario"("id_usuario", "id_repositorio");

-- AddForeignKey
ALTER TABLE "UserRango" ADD CONSTRAINT "UserRango_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRango" ADD CONSTRAINT "UserRango_rangoId_fkey" FOREIGN KEY ("rangoId") REFERENCES "Rango"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repositorio_Usuario" ADD CONSTRAINT "Repositorio_Usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repositorio_Usuario" ADD CONSTRAINT "Repositorio_Usuario_id_repositorio_fkey" FOREIGN KEY ("id_repositorio") REFERENCES "Repositorio"("id_repositorio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etiqueta_Repositorio" ADD CONSTRAINT "Etiqueta_Repositorio_id_etiqueta_fkey" FOREIGN KEY ("id_etiqueta") REFERENCES "Etiqueta"("id_etiqueta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etiqueta_Repositorio" ADD CONSTRAINT "Etiqueta_Repositorio_id_repositorio_fkey" FOREIGN KEY ("id_repositorio") REFERENCES "Repositorio"("id_repositorio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stack_Repositorio" ADD CONSTRAINT "Stack_Repositorio_id_stack_fkey" FOREIGN KEY ("id_stack") REFERENCES "Stack"("id_stack") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stack_Repositorio" ADD CONSTRAINT "Stack_Repositorio_id_repositorio_fkey" FOREIGN KEY ("id_repositorio") REFERENCES "Repositorio"("id_repositorio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archivo_Repositorio" ADD CONSTRAINT "Archivo_Repositorio_id_archivo_fkey" FOREIGN KEY ("id_archivo") REFERENCES "Archivo"("id_archivo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archivo_Repositorio" ADD CONSTRAINT "Archivo_Repositorio_id_repositorio_fkey" FOREIGN KEY ("id_repositorio") REFERENCES "Repositorio"("id_repositorio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurso_Auxiliar" ADD CONSTRAINT "Recurso_Auxiliar_id_tipo_recurso_fkey" FOREIGN KEY ("id_tipo_recurso") REFERENCES "Tipo_Recurso"("id_tipo_recurso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurso_Repositorio" ADD CONSTRAINT "Recurso_Repositorio_id_recurso_fkey" FOREIGN KEY ("id_recurso") REFERENCES "Recurso_Auxiliar"("id_recurso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurso_Repositorio" ADD CONSTRAINT "Recurso_Repositorio_id_repositorio_fkey" FOREIGN KEY ("id_repositorio") REFERENCES "Repositorio"("id_repositorio") ON DELETE RESTRICT ON UPDATE CASCADE;
