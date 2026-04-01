-- CreateTable
CREATE TABLE "PendingUser" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "codigoVerificacion" TEXT NOT NULL,
    "codigoExpiraEn" TIMESTAMP(3) NOT NULL,
    "codigoEnviadoEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_correo_key" ON "PendingUser"("correo");
