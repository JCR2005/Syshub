const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
  'administrador000000001@cunoc.edu.gt';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const EXISTING_ADMIN_EMAIL = process.env.EXISTING_ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_ROLE = 'admin';
const ADMIN_RANGO = 'Administrador';

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const legacyAdmin = await prisma.user.findUnique({
    where: { correoInstitucional: 'admin' },
    select: { id: true },
  });

  if (legacyAdmin && ADMIN_EMAIL !== 'admin') {
    const alreadyUsingEmail = await prisma.user.findUnique({
      where: { correoInstitucional: ADMIN_EMAIL },
      select: { id: true },
    });

    if (!alreadyUsingEmail) {
      await prisma.user.update({
        where: { id: legacyAdmin.id },
        data: {
          correoInstitucional: ADMIN_EMAIL,
          contrasena: passwordHash,
          nombre: 'Administrador',
          bloqueado: false,
        },
      });
    }
  }

  const adminUser = await prisma.user.upsert({
    where: { correoInstitucional: ADMIN_EMAIL },
    update: {
      contrasena: passwordHash,
      nombre: 'Administrador',
      bloqueado: false,
    },
    create: {
      correoInstitucional: ADMIN_EMAIL,
      contrasena: passwordHash,
      nombre: 'Administrador',
      bloqueado: false,
    },
    select: { id: true, correoInstitucional: true, nombre: true },
  });

  const role = await prisma.role.upsert({
    where: { nombre: ADMIN_ROLE },
    update: {},
    create: { nombre: ADMIN_ROLE },
    select: { id: true },
  });

  const rango = await prisma.rango.upsert({
    where: { nombre: ADMIN_RANGO },
    update: {},
    create: { nombre: ADMIN_RANGO },
    select: { id: true },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: role.id,
    },
  });

  await prisma.userRango.upsert({
    where: {
      userId_rangoId: {
        userId: adminUser.id,
        rangoId: rango.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      rangoId: rango.id,
    },
  });

  if (EXISTING_ADMIN_EMAIL) {
    const existingUser = await prisma.user.findUnique({
      where: { correoInstitucional: EXISTING_ADMIN_EMAIL },
      select: { id: true, correoInstitucional: true },
    });

    if (existingUser) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: existingUser.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: existingUser.id,
          roleId: role.id,
        },
      });

      console.log(
        `✅ Rol admin agregado a usuario existente: ${existingUser.correoInstitucional}`,
      );
    } else {
      console.log(
        `⚠️ No se encontró el usuario EXISTING_ADMIN_EMAIL=${EXISTING_ADMIN_EMAIL}`,
      );
    }
  }

  console.log('✅ Usuario admin asegurado correctamente');
  console.log(`   usuario: ${ADMIN_EMAIL}`);
  console.log(`   contraseña: ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('❌ Error al crear usuario admin:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
