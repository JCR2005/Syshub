-- CreateTable
CREATE TABLE "CursoEspacioEstudiante" (
    "id" SERIAL NOT NULL,
    "id_espacio" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CursoEspacioEstudiante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CursoEspacioEstudiante_id_espacio_id_usuario_key" ON "CursoEspacioEstudiante"("id_espacio", "id_usuario");

-- CreateIndex
CREATE INDEX "CursoEspacioEstudiante_id_usuario_idx" ON "CursoEspacioEstudiante"("id_usuario");

-- AddForeignKey
ALTER TABLE "CursoEspacioEstudiante" ADD CONSTRAINT "CursoEspacioEstudiante_id_espacio_fkey" FOREIGN KEY ("id_espacio") REFERENCES "CursoEspacio"("id_espacio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoEspacioEstudiante" ADD CONSTRAINT "CursoEspacioEstudiante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
