/*
  Warnings:

  - The primary key for the `PendingUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PendingUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Rango` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Rango` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Role` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `codigoEnviadoEn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `codigoExpiraEn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `codigoVerificacion` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificado` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserRango` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserRango` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserRole` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `UserRango` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `rangoId` on the `UserRango` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `UserRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `roleId` on the `UserRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserRango" DROP CONSTRAINT "UserRango_rangoId_fkey";

-- DropForeignKey
ALTER TABLE "UserRango" DROP CONSTRAINT "UserRango_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- AlterTable
ALTER TABLE "PendingUser" DROP CONSTRAINT "PendingUser_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PendingUser_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Rango" DROP CONSTRAINT "Rango_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Rango_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "codigoEnviadoEn",
DROP COLUMN "codigoExpiraEn",
DROP COLUMN "codigoVerificacion",
DROP COLUMN "createdAt",
DROP COLUMN "emailVerificado",
DROP COLUMN "updatedAt",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserRango" DROP CONSTRAINT "UserRango_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "userId" TYPE INTEGER USING ("userId"::integer),
ALTER COLUMN "rangoId" TYPE INTEGER USING ("rangoId"::integer),
ADD CONSTRAINT "UserRango_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "userId" TYPE INTEGER USING ("userId"::integer),
ALTER COLUMN "roleId" TYPE INTEGER USING ("roleId"::integer),
ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX IF EXISTS "UserRango_userId_rangoId_key";

-- DropIndex
DROP INDEX IF EXISTS "UserRole_userId_roleId_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserRango_userId_rangoId_key" ON "UserRango"("userId", "rangoId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");
