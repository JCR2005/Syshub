-- Syshub lightweight sync models (commit/push/pull)
-- Additive migration: no destructive changes to existing normalized schema.

CREATE TABLE IF NOT EXISTS "RepoCommit" (
  "id_commit" SERIAL PRIMARY KEY,
  "id_repositorio" INTEGER NOT NULL,
  "id_usuario" INTEGER NOT NULL,
  "mensaje" TEXT NOT NULL,
  "accion" TEXT NOT NULL DEFAULT 'commit',
  "hash_snapshot" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "RepoCommitArchivo" (
  "id_commit_archivo" SERIAL PRIMARY KEY,
  "id_commit" INTEGER NOT NULL,
  "ruta" TEXT NOT NULL,
  "hash_archivo" TEXT NOT NULL,
  "tamano_bytes" INTEGER
);

CREATE TABLE IF NOT EXISTS "RepoSyncEvent" (
  "id_evento" SERIAL PRIMARY KEY,
  "id_repositorio" INTEGER NOT NULL,
  "id_usuario" INTEGER NOT NULL,
  "id_commit" INTEGER,
  "accion" TEXT NOT NULL,
  "detalle" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RepoCommit_id_repositorio_fkey'
  ) THEN
    ALTER TABLE "RepoCommit"
      ADD CONSTRAINT "RepoCommit_id_repositorio_fkey"
      FOREIGN KEY ("id_repositorio") REFERENCES "Repositorio"("id_repositorio") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RepoCommit_id_usuario_fkey'
  ) THEN
    ALTER TABLE "RepoCommit"
      ADD CONSTRAINT "RepoCommit_id_usuario_fkey"
      FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RepoCommitArchivo_id_commit_fkey'
  ) THEN
    ALTER TABLE "RepoCommitArchivo"
      ADD CONSTRAINT "RepoCommitArchivo_id_commit_fkey"
      FOREIGN KEY ("id_commit") REFERENCES "RepoCommit"("id_commit") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RepoSyncEvent_id_repositorio_fkey'
  ) THEN
    ALTER TABLE "RepoSyncEvent"
      ADD CONSTRAINT "RepoSyncEvent_id_repositorio_fkey"
      FOREIGN KEY ("id_repositorio") REFERENCES "Repositorio"("id_repositorio") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RepoSyncEvent_id_usuario_fkey'
  ) THEN
    ALTER TABLE "RepoSyncEvent"
      ADD CONSTRAINT "RepoSyncEvent_id_usuario_fkey"
      FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RepoSyncEvent_id_commit_fkey'
  ) THEN
    ALTER TABLE "RepoSyncEvent"
      ADD CONSTRAINT "RepoSyncEvent_id_commit_fkey"
      FOREIGN KEY ("id_commit") REFERENCES "RepoCommit"("id_commit") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "RepoCommit_id_repositorio_createdAt_idx" ON "RepoCommit"("id_repositorio", "createdAt");
CREATE INDEX IF NOT EXISTS "RepoCommit_id_usuario_idx" ON "RepoCommit"("id_usuario");
CREATE INDEX IF NOT EXISTS "RepoCommitArchivo_id_commit_idx" ON "RepoCommitArchivo"("id_commit");
CREATE INDEX IF NOT EXISTS "RepoCommitArchivo_ruta_idx" ON "RepoCommitArchivo"("ruta");
CREATE INDEX IF NOT EXISTS "RepoSyncEvent_id_repositorio_createdAt_idx" ON "RepoSyncEvent"("id_repositorio", "createdAt");
CREATE INDEX IF NOT EXISTS "RepoSyncEvent_id_usuario_idx" ON "RepoSyncEvent"("id_usuario");
CREATE INDEX IF NOT EXISTS "RepoSyncEvent_id_commit_idx" ON "RepoSyncEvent"("id_commit");
