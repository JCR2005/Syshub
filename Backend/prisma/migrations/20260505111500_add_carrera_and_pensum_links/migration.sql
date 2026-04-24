-- Ensure Carrera table exists
CREATE TABLE IF NOT EXISTS "Carrera" (
    "id_carrera" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT,
    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id_carrera")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Carrera_nombre_key') THEN
    CREATE UNIQUE INDEX "Carrera_nombre_key" ON "Carrera"("nombre");
  END IF;
END$$;

-- Insert default Carrera if none exist
INSERT INTO "Carrera" ("nombre")
SELECT 'General'
WHERE NOT EXISTS (SELECT 1 FROM "Carrera");

-- Add carrera link to Pensum
ALTER TABLE "Pensum" ADD COLUMN IF NOT EXISTS "id_carrera" INTEGER;

UPDATE "Pensum"
SET "id_carrera" = (SELECT "id_carrera" FROM "Carrera" ORDER BY "id_carrera" LIMIT 1)
WHERE "id_carrera" IS NULL;

ALTER TABLE "Pensum" ALTER COLUMN "id_carrera" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Pensum_id_carrera_idx') THEN
    CREATE INDEX "Pensum_id_carrera_idx" ON "Pensum"("id_carrera");
  END IF;
END$$;

DROP INDEX IF EXISTS "Pensum_nombre_key";
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Pensum_nombre_id_carrera_key') THEN
    CREATE UNIQUE INDEX "Pensum_nombre_id_carrera_key" ON "Pensum"("nombre", "id_carrera");
  END IF;
END$$;

ALTER TABLE "Pensum" DROP CONSTRAINT IF EXISTS "Pensum_id_carrera_fkey";
ALTER TABLE "Pensum"
  ADD CONSTRAINT "Pensum_id_carrera_fkey" FOREIGN KEY ("id_carrera") REFERENCES "Carrera"("id_carrera") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add pensum link to AreaTecnica
ALTER TABLE "AreaTecnica" ADD COLUMN IF NOT EXISTS "id_pensum" INTEGER;

UPDATE "AreaTecnica"
SET "id_pensum" = (SELECT "id_pensum" FROM "Pensum" ORDER BY "id_pensum" LIMIT 1)
WHERE "id_pensum" IS NULL;

ALTER TABLE "AreaTecnica" ALTER COLUMN "id_pensum" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'AreaTecnica_id_pensum_idx') THEN
    CREATE INDEX "AreaTecnica_id_pensum_idx" ON "AreaTecnica"("id_pensum");
  END IF;
END$$;

DROP INDEX IF EXISTS "AreaTecnica_nombre_key";
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'AreaTecnica_nombre_id_pensum_key') THEN
    CREATE UNIQUE INDEX "AreaTecnica_nombre_id_pensum_key" ON "AreaTecnica"("nombre", "id_pensum");
  END IF;
END$$;

ALTER TABLE "AreaTecnica" DROP CONSTRAINT IF EXISTS "AreaTecnica_id_pensum_fkey";
ALTER TABLE "AreaTecnica"
  ADD CONSTRAINT "AreaTecnica_id_pensum_fkey" FOREIGN KEY ("id_pensum") REFERENCES "Pensum"("id_pensum") ON DELETE RESTRICT ON UPDATE CASCADE;
