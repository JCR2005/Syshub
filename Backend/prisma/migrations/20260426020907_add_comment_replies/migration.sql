-- AlterTable
ALTER TABLE "ComentarioHiloForo" ADD COLUMN     "parentId" INTEGER;

-- CreateIndex
CREATE INDEX "ComentarioHiloForo_parentId_idx" ON "ComentarioHiloForo"("parentId");

-- AddForeignKey
ALTER TABLE "ComentarioHiloForo" ADD CONSTRAINT "ComentarioHiloForo_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ComentarioHiloForo"("id_comentario") ON DELETE NO ACTION ON UPDATE NO ACTION;
