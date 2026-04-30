CREATE TABLE "CursoEspacio" (
    "id_espacio" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_curso" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "CursoEspacio_pkey" PRIMARY KEY ("id_espacio")
);

CREATE UNIQUE INDEX "CursoEspacio_id_curso_anio_semestre_key" ON "CursoEspacio"("id_curso", "anio", "semestre");
CREATE INDEX "CursoEspacio_id_curso_idx" ON "CursoEspacio"("id_curso");

CREATE TABLE "CursoEspacioAuxiliar" (
    "id" SERIAL NOT NULL,
    "id_espacio" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'aux',

    CONSTRAINT "CursoEspacioAuxiliar_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CursoEspacioAuxiliar_id_espacio_id_usuario_key" ON "CursoEspacioAuxiliar"("id_espacio", "id_usuario");
CREATE INDEX "CursoEspacioAuxiliar_id_usuario_idx" ON "CursoEspacioAuxiliar"("id_usuario");

CREATE TABLE "CursoEspacioRecurso" (
    "id_recurso_espacio" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_espacio" INTEGER NOT NULL,
    "id_tipo_recurso" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "CursoEspacioRecurso_pkey" PRIMARY KEY ("id_recurso_espacio")
);

CREATE INDEX "CursoEspacioRecurso_id_espacio_idx" ON "CursoEspacioRecurso"("id_espacio");

CREATE TABLE "CursoEspacioRepositorio" (
    "id" SERIAL NOT NULL,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_espacio" INTEGER NOT NULL,
    "id_repositorio" INTEGER NOT NULL,
    "linkedById" INTEGER NOT NULL,

    CONSTRAINT "CursoEspacioRepositorio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CursoEspacioRepositorio_id_espacio_id_repositorio_key" ON "CursoEspacioRepositorio"("id_espacio", "id_repositorio");
CREATE INDEX "CursoEspacioRepositorio_id_repositorio_idx" ON "CursoEspacioRepositorio"("id_repositorio");

ALTER TABLE "CursoEspacio" ADD CONSTRAINT "CursoEspacio_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CursoEspacio" ADD CONSTRAINT "CursoEspacio_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CursoEspacioAuxiliar" ADD CONSTRAINT "CursoEspacioAuxiliar_id_espacio_fkey" FOREIGN KEY ("id_espacio") REFERENCES "CursoEspacio"("id_espacio") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CursoEspacioAuxiliar" ADD CONSTRAINT "CursoEspacioAuxiliar_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CursoEspacioRecurso" ADD CONSTRAINT "CursoEspacioRecurso_id_espacio_fkey" FOREIGN KEY ("id_espacio") REFERENCES "CursoEspacio"("id_espacio") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CursoEspacioRecurso" ADD CONSTRAINT "CursoEspacioRecurso_id_tipo_recurso_fkey" FOREIGN KEY ("id_tipo_recurso") REFERENCES "Tipo_Recurso"("id_tipo_recurso") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CursoEspacioRecurso" ADD CONSTRAINT "CursoEspacioRecurso_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CursoEspacioRepositorio" ADD CONSTRAINT "CursoEspacioRepositorio_id_espacio_fkey" FOREIGN KEY ("id_espacio") REFERENCES "CursoEspacio"("id_espacio") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CursoEspacioRepositorio" ADD CONSTRAINT "CursoEspacioRepositorio_id_repositorio_fkey" FOREIGN KEY ("id_repositorio") REFERENCES "Repositorio"("id_repositorio") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CursoEspacioRepositorio" ADD CONSTRAINT "CursoEspacioRepositorio_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
