-- Add metadata columns to Tipo_Recurso
ALTER TABLE "Tipo_Recurso" ADD COLUMN "slug" TEXT;
ALTER TABLE "Tipo_Recurso" ADD COLUMN "descripcion" TEXT;
ALTER TABLE "Tipo_Recurso" ADD COLUMN "icono_svg" TEXT;

UPDATE "Tipo_Recurso"
SET "slug" = LOWER(REGEXP_REPLACE("nombre_recurso", '\\s+', '-', 'g'))
WHERE "slug" IS NULL;

ALTER TABLE "Tipo_Recurso" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Tipo_Recurso_slug_key" ON "Tipo_Recurso"("slug");

-- Add descripcion to Recurso_Auxiliar
ALTER TABLE "Recurso_Auxiliar" ADD COLUMN "descripcion" TEXT;

-- Create Usuario_Recurso_Auxiliar table
CREATE TABLE "Usuario_Recurso_Auxiliar" (
    "id_usuario_recurso" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_recurso_auxiliar" INTEGER NOT NULL,

    CONSTRAINT "Usuario_Recurso_Auxiliar_pkey" PRIMARY KEY ("id_usuario_recurso")
);

CREATE UNIQUE INDEX "Usuario_Recurso_Auxiliar_id_usuario_id_recurso_auxiliar_key" ON "Usuario_Recurso_Auxiliar"("id_usuario", "id_recurso_auxiliar");
CREATE INDEX "Usuario_Recurso_Auxiliar_id_usuario_idx" ON "Usuario_Recurso_Auxiliar"("id_usuario");
CREATE INDEX "Usuario_Recurso_Auxiliar_id_recurso_auxiliar_idx" ON "Usuario_Recurso_Auxiliar"("id_recurso_auxiliar");

ALTER TABLE "Usuario_Recurso_Auxiliar" ADD CONSTRAINT "Usuario_Recurso_Auxiliar_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Usuario_Recurso_Auxiliar" ADD CONSTRAINT "Usuario_Recurso_Auxiliar_id_recurso_auxiliar_fkey" FOREIGN KEY ("id_recurso_auxiliar") REFERENCES "Recurso_Auxiliar"("id_recurso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create Archivo_Recurso_Auxiliar table
CREATE TABLE "Archivo_Recurso_Auxiliar" (
    "id_archivo_recurso" SERIAL NOT NULL,
    "id_recurso" INTEGER NOT NULL,
    "id_archivo" INTEGER NOT NULL,

    CONSTRAINT "Archivo_Recurso_Auxiliar_pkey" PRIMARY KEY ("id_archivo_recurso")
);

CREATE UNIQUE INDEX "Archivo_Recurso_Auxiliar_id_recurso_id_archivo_key" ON "Archivo_Recurso_Auxiliar"("id_recurso", "id_archivo");
CREATE INDEX "Archivo_Recurso_Auxiliar_id_recurso_idx" ON "Archivo_Recurso_Auxiliar"("id_recurso");

ALTER TABLE "Archivo_Recurso_Auxiliar" ADD CONSTRAINT "Archivo_Recurso_Auxiliar_id_recurso_fkey" FOREIGN KEY ("id_recurso") REFERENCES "Recurso_Auxiliar"("id_recurso") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Archivo_Recurso_Auxiliar" ADD CONSTRAINT "Archivo_Recurso_Auxiliar_id_archivo_fkey" FOREIGN KEY ("id_archivo") REFERENCES "Archivo"("id_archivo") ON DELETE RESTRICT ON UPDATE CASCADE;
