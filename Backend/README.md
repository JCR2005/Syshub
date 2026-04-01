# Syshub Backend (NestJS + Prisma + PostgreSQL)

Backend para Syshub usando **NestJS** y **Prisma** con PostgreSQL.

## ✅ Requisitos
- Node.js 18+
- Docker (opcional, recomendado para PostgreSQL local)

## 🔧 Configuración rápida
1) Copiar variables de entorno:

```bash
cp .env.example .env
```

2) Levantar PostgreSQL con Docker (recomendado):

```bash
docker compose up -d
```

3) Instalar dependencias:

```bash
npm install
```

4) Crear la base de datos y migrar:

```bash
npm run prisma:migrate -- --name init
```

5) Iniciar el servidor:

```bash
npm run start:dev
```

Servidor por defecto: `http://localhost:3000/api`

## 📌 Endpoints iniciales
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `POST /api/users`

## ✉️ Verificación por correo
Al registrarse se genera un código de 6 dígitos y se envía al correo. Configura estas variables en `.env`:

```
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=usuario@example.com
MAIL_PASS=tu_clave
MAIL_FROM="Syshub <no-reply@syshub.com>"
```

Si no configuras SMTP, el servidor imprimirá el código en consola (útil para desarrollo).

## 🧱 Estructura
- `src/auth` → login/registro
- `src/users` → CRUD básico
- `src/prisma` → PrismaService
- `prisma/schema.prisma` → modelos

## 🗄️ Base de datos
Por defecto usa esta URL (configurable en `.env`):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/syshub?schema=public"
```

## ✅ Scripts útiles
- `npm run start:dev` — desarrollo
- `npm run build` — build
- `npm run prisma:migrate` — crear migraciones
- `npm run prisma:studio` — GUI de Prisma

---
Si quieres que conectemos el backend con el frontend o definir el modelo completo desde los diagramas, dime y lo armamos.
