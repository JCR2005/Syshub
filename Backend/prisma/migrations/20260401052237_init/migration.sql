-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "correoInstitucional" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "edad" INTEGER,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "codigoVerificacion" TEXT,
    "codigoExpiraEn" TIMESTAMP(3),
    "codigoEnviadoEn" TIMESTAMP(3),
    "nombre" TEXT,
    "carnet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rango" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Rango_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRango" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rangoId" TEXT NOT NULL,

    CONSTRAINT "UserRango_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_correoInstitucional_key" ON "User"("correoInstitucional");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nombre_key" ON "Role"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Rango_nombre_key" ON "Rango"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "UserRango_userId_rangoId_key" ON "UserRango"("userId", "rangoId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRango" ADD CONSTRAINT "UserRango_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRango" ADD CONSTRAINT "UserRango_rangoId_fkey" FOREIGN KEY ("rangoId") REFERENCES "Rango"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
