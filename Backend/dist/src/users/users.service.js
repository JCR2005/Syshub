"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const mailer_service_1 = require("../mailer/mailer.service");
let UsersService = class UsersService {
    prisma;
    mailer;
    constructor(prisma, mailer) {
        this.prisma = prisma;
        this.mailer = mailer;
    }
    async create(dto) {
        const correoNormalizado = this.normalizeEmail(dto.correo);
        this.validateInstitutionalEmail(correoNormalizado);
        this.validateStrongPassword(dto.contrasena);
        const hashedPassword = await this.hashPassword(dto.contrasena);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    correoInstitucional: correoNormalizado,
                    contrasena: hashedPassword,
                    nombre: dto.nombre ?? null,
                    edad: dto.edad ?? null,
                    carnet: dto.carnet ?? null,
                },
                select: {
                    id: true,
                    correoInstitucional: true,
                    nombre: true,
                    edad: true,
                    rutaFotoPerfil: true,
                },
            });
            const role = await tx.role.upsert({
                where: { nombre: 'comun' },
                update: {},
                create: { nombre: 'comun' },
            });
            const rango = await tx.rango.upsert({
                where: { nombre: 'Estudiante' },
                update: {},
                create: { nombre: 'Estudiante' },
            });
            await tx.userRole.createMany({
                data: [{ userId: user.id, roleId: role.id }],
                skipDuplicates: true,
            });
            await tx.userRango.createMany({
                data: [{ userId: user.id, rangoId: rango.id }],
                skipDuplicates: true,
            });
            return user;
        });
    }
    async preRegister(dto) {
        const correoNormalizado = this.normalizeEmail(dto.correo);
        this.validateInstitutionalEmail(correoNormalizado);
        this.validateStrongPassword(dto.contrasena);
        const existente = await this.prisma.user.findUnique({
            where: { correoInstitucional: correoNormalizado },
        });
        if (existente) {
            throw new common_1.BadRequestException('El correo ya tiene una cuenta registrada');
        }
        const codigo = this.generarCodigo();
        const ahora = new Date();
        const expiracion = new Date(ahora.getTime() + 15 * 60 * 1000);
        await this.prisma.pendingUser.upsert({
            where: { correo: correoNormalizado },
            update: {
                codigoVerificacion: codigo,
                codigoExpiraEn: expiracion,
                codigoEnviadoEn: ahora,
            },
            create: {
                correo: correoNormalizado,
                codigoVerificacion: codigo,
                codigoExpiraEn: expiracion,
                codigoEnviadoEn: ahora,
            },
        });
        await this.mailer.sendVerificationEmail(correoNormalizado, codigo);
        return { ok: true, message: 'Código enviado' };
    }
    async confirmRegister(correo, codigo, contrasena) {
        const correoNormalizado = this.normalizeEmail(correo);
        this.validateInstitutionalEmail(correoNormalizado);
        const pending = await this.prisma.pendingUser.findUnique({
            where: { correo: correoNormalizado },
        });
        if (!pending) {
            throw new common_1.NotFoundException('No hay registro pendiente');
        }
        if (pending.codigoVerificacion !== codigo) {
            throw new common_1.BadRequestException('Código inválido');
        }
        if (pending.codigoExpiraEn.getTime() < Date.now()) {
            throw new common_1.BadRequestException('Código expirado');
        }
        const user = await this.create({
            correo: correoNormalizado,
            contrasena,
        });
        await this.prisma.pendingUser.delete({
            where: { correo: correoNormalizado },
        });
        return { ok: true, message: 'Cuenta creada', user };
    }
    async findAll() {
        const usuarios = await this.prisma.user.findMany({
            select: {
                id: true,
                correoInstitucional: true,
                nombre: true,
                edad: true,
                rutaFotoPerfil: true,
            },
        });
        return usuarios;
    }
    async findByCorreo(correo) {
        const correoNormalizado = this.normalizeEmail(correo);
        return this.prisma.user.findUnique({
            where: { correoInstitucional: correoNormalizado },
        });
    }
    async getUserRangos(userId) {
        const userRangos = await this.prisma.userRango.findMany({
            where: { userId },
            select: {
                rango: {
                    select: { nombre: true },
                },
            },
        });
        return userRangos.map((item) => item.rango.nombre);
    }
    async hasRango(userId, rangoName) {
        const rango = await this.prisma.userRango.findFirst({
            where: {
                userId,
                rango: {
                    nombre: rangoName.toLowerCase(),
                },
            },
            select: { id: true },
        });
        return !!rango;
    }
    async getUserRoles(userId) {
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId },
            select: {
                role: {
                    select: { nombre: true },
                },
            },
        });
        return userRoles.map((item) => item.role.nombre);
    }
    async hasRole(userId, roleName) {
        const role = await this.prisma.userRole.findFirst({
            where: {
                userId,
                role: {
                    nombre: roleName.toLowerCase(),
                },
            },
            select: { id: true },
        });
        return !!role;
    }
    async getAdminManagementUsers() {
        const users = await this.prisma.user.findMany({
            orderBy: { id: 'asc' },
            select: {
                id: true,
                nombre: true,
                correoInstitucional: true,
                carnet: true,
                bloqueado: true,
                roles: {
                    select: {
                        role: {
                            select: { nombre: true },
                        },
                    },
                },
            },
        });
        return {
            users: users.map((user) => ({
                id: user.id,
                nombre: user.nombre,
                correo: user.correoInstitucional,
                carnet: user.carnet,
                bloqueado: user.bloqueado,
                roles: user.roles.map((link) => link.role.nombre),
            })),
        };
    }
    async setUserRole(userId, roleName, enabled) {
        const normalizedRole = (roleName ?? '').trim().toLowerCase();
        if (!normalizedRole) {
            throw new common_1.BadRequestException('Rol inválido');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const role = await this.prisma.role.upsert({
            where: { nombre: normalizedRole },
            update: {},
            create: { nombre: normalizedRole },
            select: { id: true },
        });
        if (enabled) {
            await this.prisma.userRole.createMany({
                data: [{ userId, roleId: role.id }],
                skipDuplicates: true,
            });
        }
        else {
            await this.prisma.userRole.deleteMany({
                where: {
                    userId,
                    roleId: role.id,
                },
            });
        }
        return this.getAdminManagementUserById(userId);
    }
    async setUserBlocked(userId, bloqueado) {
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { bloqueado },
            select: { id: true },
        });
        return this.getAdminManagementUserById(updated.id);
    }
    async getSystemClassification() {
        const db = this.prisma;
        const safeList = async (label, fn) => {
            try {
                return await fn();
            }
            catch (error) {
                console.error(`Error cargando ${label}`, error);
                return [];
            }
        };
        const areas = await safeList('areas', () => db.areaTecnica.findMany({
            orderBy: { nombre: 'asc' },
            select: {
                id_area: true,
                nombre: true,
                descripcion: true,
                color: true,
                id_pensum: true,
                pensum: {
                    select: { nombre: true },
                },
            },
        }));
        const tags = await safeList('tags', () => this.prisma.etiqueta.findMany({
            orderBy: { nombre_etiqueta: 'asc' },
            select: { id_etiqueta: true, nombre_etiqueta: true },
        }));
        const stacks = await safeList('stacks', () => this.prisma.stack.findMany({
            orderBy: { nombre_stack: 'asc' },
            select: { id_stack: true, nombre_stack: true },
        }));
        const pensums = await safeList('pensums', () => db.pensum.findMany({
            orderBy: { nombre: 'asc' },
            select: {
                id_pensum: true,
                nombre: true,
                descripcion: true,
                vigente: true,
                carrera: {
                    select: {
                        color: true,
                    },
                },
            },
        }));
        const courses = await safeList('courses', () => db.curso.findMany({
            orderBy: [{ semestre: 'asc' }, { codigo: 'asc' }],
            select: {
                id_curso: true,
                codigo: true,
                nombre: true,
                semestre: true,
                id_pensum: true,
                id_area: true,
                pensum: {
                    select: {
                        id_pensum: true,
                        nombre: true,
                    },
                },
                area: {
                    select: {
                        id_area: true,
                        nombre: true,
                        color: true,
                    },
                },
            },
        }));
        const carreras = await safeList('carreras', () => db.carrera.findMany({
            orderBy: { nombre: 'asc' },
            select: {
                id_carrera: true,
                nombre: true,
                color: true,
            },
        }));
        return {
            areas: areas.map((item) => ({
                id: item.id_area,
                nombre: item.nombre,
                descripcion: item.descripcion,
                color: item.color,
                pensumId: item.id_pensum,
                pensumNombre: item.pensum?.nombre ?? null,
            })),
            tags: tags.map((item) => ({
                id: item.id_etiqueta,
                nombre: item.nombre_etiqueta,
            })),
            stacks: stacks.map((item) => ({
                id: item.id_stack,
                nombre: item.nombre_stack,
            })),
            pensums: pensums.map((item) => ({
                id: item.id_pensum,
                nombre: item.nombre,
                descripcion: item.descripcion,
                vigente: item.vigente,
                color: item.carrera?.color ?? null,
            })),
            courses: courses.map((item) => ({
                id: item.id_curso,
                codigo: item.codigo,
                nombre: item.nombre,
                semestre: item.semestre,
                pensumId: item.id_pensum,
                pensum: item.pensum?.nombre ?? null,
                areaId: item.id_area,
                area: item.area?.nombre ?? null,
                areaColor: item.area?.color ?? null,
            })),
            carreras: carreras.map((item) => ({
                id: item.id_carrera,
                nombre: item.nombre,
                color: item.color,
            })),
        };
    }
    async createCarrera(payload) {
        const db = this.prisma;
        const nombre = (payload.nombre ?? '').trim();
        if (!nombre) {
            throw new common_1.BadRequestException('El nombre es requerido');
        }
        const existing = await db.carrera.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('La carrera ya existe');
        }
        return db.carrera.create({
            data: {
                nombre,
                color: payload.color?.trim() || null,
            },
        });
    }
    async deleteCarrera(carreraId) {
        const db = this.prisma;
        const linkedPensums = await db.pensum.count({
            where: { id_carrera: carreraId },
        });
        if (linkedPensums > 0) {
            throw new common_1.BadRequestException('No puedes eliminar la carrera porque tiene pensums asociados');
        }
        await db.carrera.delete({
            where: { id_carrera: carreraId },
        });
        return { ok: true };
    }
    async createTechArea(payload) {
        const db = this.prisma;
        const nombre = (payload.nombre ?? '').trim();
        const pensumId = Number(payload.pensumId);
        if (!nombre) {
            throw new common_1.BadRequestException('El nombre del área es requerido');
        }
        const pensum = await db.pensum.findUnique({
            where: { id_pensum: pensumId },
            select: {
                id_pensum: true,
                carrera: {
                    select: {
                        color: true,
                    },
                },
            },
        });
        if (!pensum) {
            throw new common_1.NotFoundException('Pensum no encontrado');
        }
        const existing = await db.areaTecnica.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' },
                id_pensum: pensumId,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('El área ya existe en este pensum');
        }
        return db.areaTecnica.create({
            data: {
                nombre,
                descripcion: payload.descripcion?.trim() || null,
                color: pensum.carrera?.color ?? null,
                id_pensum: pensumId,
            },
            select: {
                id_area: true,
                nombre: true,
                descripcion: true,
                color: true,
                id_pensum: true,
            },
        });
    }
    async updateTechArea(areaId, payload) {
        const db = this.prisma;
        const current = await db.areaTecnica.findUnique({
            where: { id_area: areaId },
            select: { id_area: true, nombre: true },
        });
        if (!current) {
            throw new common_1.NotFoundException('Área técnica no encontrada');
        }
        const data = {};
        if (typeof payload.nombre === 'string' && payload.nombre.trim()) {
            const normalized = payload.nombre.trim();
            const existing = await db.areaTecnica.findFirst({
                where: {
                    nombre: { equals: normalized, mode: 'insensitive' },
                    NOT: { id_area: areaId },
                },
                select: { id_area: true },
            });
            if (existing) {
                throw new common_1.BadRequestException('Ya existe otra área con ese nombre');
            }
            data.nombre = normalized;
        }
        if (payload.descripcion !== undefined) {
            data.descripcion = payload.descripcion?.trim() || null;
        }
        if (payload.color !== undefined) {
            data.color = payload.color?.trim() || null;
        }
        return db.areaTecnica.update({
            where: { id_area: areaId },
            data,
            select: {
                id_area: true,
                nombre: true,
                descripcion: true,
                color: true,
            },
        });
    }
    async deleteTechArea(areaId) {
        const db = this.prisma;
        const linkedCourses = await db.curso.count({
            where: { id_area: areaId },
        });
        if (linkedCourses > 0) {
            throw new common_1.BadRequestException('No puedes eliminar el área porque tiene cursos asociados');
        }
        await db.areaTecnica.delete({
            where: { id_area: areaId },
        });
        return { ok: true };
    }
    async createPensum(payload) {
        const db = this.prisma;
        const nombre = (payload.nombre ?? '').trim();
        const carreraId = Number(payload.carreraId);
        if (!nombre) {
            throw new common_1.BadRequestException('El nombre del pensum es requerido');
        }
        if (!carreraId) {
            throw new common_1.BadRequestException('La carrera es requerida');
        }
        const carrera = await db.carrera.findUnique({
            where: { id_carrera: carreraId },
            select: { id_carrera: true },
        });
        if (!carrera) {
            throw new common_1.NotFoundException('Carrera no encontrada');
        }
        const existing = await db.pensum.findFirst({
            where: {
                nombre: { equals: nombre, mode: 'insensitive' },
                id_carrera: carreraId,
            },
            select: { id_pensum: true },
        });
        if (existing) {
            throw new common_1.BadRequestException('El pensum ya existe');
        }
        return db.pensum.create({
            data: {
                nombre,
                descripcion: payload.descripcion?.trim() || null,
                vigente: payload.vigente ?? true,
                id_carrera: carreraId,
            },
            select: {
                id_pensum: true,
                nombre: true,
                descripcion: true,
                vigente: true,
            },
        });
    }
    async togglePensumVigency(pensumId) {
        const db = this.prisma;
        const current = await db.pensum.findUnique({
            where: { id_pensum: pensumId },
            select: { id_pensum: true, vigente: true },
        });
        if (!current) {
            throw new common_1.NotFoundException('Pensum no encontrado');
        }
        return db.pensum.update({
            where: { id_pensum: pensumId },
            data: { vigente: !current.vigente },
            select: {
                id_pensum: true,
                nombre: true,
                descripcion: true,
                vigente: true,
            },
        });
    }
    async deletePensum(pensumId) {
        const db = this.prisma;
        const linkedCourses = await db.curso.count({
            where: { id_pensum: pensumId },
        });
        if (linkedCourses > 0) {
            throw new common_1.BadRequestException('No puedes eliminar el pensum porque tiene cursos asociados');
        }
        await db.pensum.delete({
            where: { id_pensum: pensumId },
        });
        return { ok: true };
    }
    async createCourse(payload) {
        const db = this.prisma;
        const codigo = (payload.codigo ?? '').trim().toUpperCase();
        const nombre = (payload.nombre ?? '').trim();
        const semestre = Number(payload.semestre);
        const pensumId = Number(payload.pensumId);
        const areaId = payload.areaId === null || payload.areaId === undefined
            ? null
            : Number(payload.areaId);
        if (!codigo || !nombre) {
            throw new common_1.BadRequestException('Código y nombre del curso son requeridos');
        }
        if (!Number.isInteger(semestre) || semestre < 1 || semestre > 20) {
            throw new common_1.BadRequestException('Semestre inválido');
        }
        const pensum = await db.pensum.findUnique({
            where: { id_pensum: pensumId },
            select: { id_pensum: true },
        });
        if (!pensum) {
            throw new common_1.NotFoundException('Pensum no encontrado');
        }
        if (areaId !== null) {
            const area = await db.areaTecnica.findUnique({
                where: { id_area: areaId },
                select: { id_area: true, id_pensum: true },
            });
            if (!area) {
                throw new common_1.NotFoundException('Área técnica no encontrada');
            }
            if (area.id_pensum !== pensumId) {
                throw new common_1.BadRequestException('El área no pertenece al pensum seleccionado');
            }
        }
        const duplicatedCode = await db.curso.findFirst({
            where: { codigo: { equals: codigo, mode: 'insensitive' } },
            select: { id_curso: true },
        });
        if (duplicatedCode) {
            throw new common_1.BadRequestException('Ya existe un curso con ese código');
        }
        return db.curso.create({
            data: {
                codigo,
                nombre,
                semestre,
                id_pensum: pensumId,
                id_area: areaId,
            },
            select: {
                id_curso: true,
                codigo: true,
                nombre: true,
                semestre: true,
                id_pensum: true,
                id_area: true,
            },
        });
    }
    async updateCourse(courseId, payload) {
        const db = this.prisma;
        const current = await db.curso.findUnique({
            where: { id_curso: courseId },
            select: {
                id_curso: true,
                codigo: true,
                nombre: true,
                semestre: true,
                id_pensum: true,
                id_area: true,
            },
        });
        if (!current) {
            throw new common_1.NotFoundException('Curso no encontrado');
        }
        const data = {};
        if (typeof payload.codigo === 'string' && payload.codigo.trim()) {
            const normalizedCode = payload.codigo.trim().toUpperCase();
            const duplicatedCode = await db.curso.findFirst({
                where: {
                    codigo: { equals: normalizedCode, mode: 'insensitive' },
                    NOT: { id_curso: courseId },
                },
                select: { id_curso: true },
            });
            if (duplicatedCode) {
                throw new common_1.BadRequestException('Ya existe otro curso con ese código');
            }
            data.codigo = normalizedCode;
        }
        if (typeof payload.nombre === 'string' && payload.nombre.trim()) {
            data.nombre = payload.nombre.trim();
        }
        if (payload.semestre !== undefined) {
            const semester = Number(payload.semestre);
            if (!Number.isInteger(semester) || semester < 1 || semester > 20) {
                throw new common_1.BadRequestException('Semestre inválido');
            }
            data.semestre = semester;
        }
        if (payload.pensumId !== undefined) {
            const pensumId = Number(payload.pensumId);
            const pensum = await db.pensum.findUnique({
                where: { id_pensum: pensumId },
                select: { id_pensum: true },
            });
            if (!pensum) {
                throw new common_1.NotFoundException('Pensum no encontrado');
            }
            data.id_pensum = pensumId;
        }
        if (payload.areaId !== undefined) {
            if (payload.areaId === null) {
                data.id_area = null;
            }
            else {
                const areaId = Number(payload.areaId);
                const area = await db.areaTecnica.findUnique({
                    where: { id_area: areaId },
                    select: { id_area: true },
                });
                if (!area) {
                    throw new common_1.NotFoundException('Área técnica no encontrada');
                }
                data.id_area = areaId;
            }
        }
        return db.curso.update({
            where: { id_curso: courseId },
            data,
            select: {
                id_curso: true,
                codigo: true,
                nombre: true,
                semestre: true,
                id_pensum: true,
                id_area: true,
            },
        });
    }
    async deleteCourse(courseId) {
        const db = this.prisma;
        await db.curso.delete({
            where: { id_curso: courseId },
        });
        return { ok: true };
    }
    async createTag(nombre) {
        const clean = (nombre ?? '').trim();
        if (!clean) {
            throw new common_1.BadRequestException('El nombre del tag es requerido');
        }
        const existing = await this.prisma.etiqueta.findFirst({
            where: { nombre_etiqueta: { equals: clean, mode: 'insensitive' } },
            select: { id_etiqueta: true },
        });
        if (existing) {
            throw new common_1.BadRequestException('El tag ya existe');
        }
        return this.prisma.etiqueta.create({
            data: { nombre_etiqueta: clean },
            select: { id_etiqueta: true, nombre_etiqueta: true },
        });
    }
    async deleteTag(tagId) {
        await this.prisma.etiqueta_Repositorio.deleteMany({
            where: { id_etiqueta: tagId },
        });
        await this.prisma.etiqueta.delete({
            where: { id_etiqueta: tagId },
        });
        return { ok: true };
    }
    async createStack(nombre) {
        const clean = (nombre ?? '').trim();
        if (!clean) {
            throw new common_1.BadRequestException('El nombre del stack es requerido');
        }
        const existing = await this.prisma.stack.findFirst({
            where: { nombre_stack: { equals: clean, mode: 'insensitive' } },
            select: { id_stack: true },
        });
        if (existing) {
            throw new common_1.BadRequestException('El stack ya existe');
        }
        return this.prisma.stack.create({
            data: { nombre_stack: clean },
            select: { id_stack: true, nombre_stack: true },
        });
    }
    async deleteStack(stackId) {
        await this.prisma.stack_Repositorio.deleteMany({
            where: { id_stack: stackId },
        });
        await this.prisma.stack.delete({
            where: { id_stack: stackId },
        });
        return { ok: true };
    }
    async getAdminManagementUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nombre: true,
                correoInstitucional: true,
                carnet: true,
                bloqueado: true,
                roles: {
                    select: {
                        role: {
                            select: { nombre: true },
                        },
                    },
                },
                rangos: {
                    select: {
                        rango: { select: { nombre: true } },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return {
            id: user.id,
            nombre: user.nombre,
            correo: user.correoInstitucional,
            carnet: user.carnet,
            bloqueado: user.bloqueado,
            roles: user.roles.map((link) => link.role.nombre),
            rangos: user.rangos.map((link) => link.rango.nombre),
        };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                correoInstitucional: true,
                nombre: true,
                edad: true,
                carnet: true,
                rutaFotoPerfil: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const rangos = await this.prisma.userRango.findMany({
            where: { userId },
            select: { rangoId: true },
        });
        const rangoIds = rangos.map((item) => item.rangoId);
        const rangoRecords = rangoIds.length
            ? await this.prisma.rango.findMany({
                where: { id: { in: rangoIds } },
                select: { id: true, nombre: true },
            })
            : [];
        return {
            id: user.id,
            correoInstitucional: user.correoInstitucional,
            nombre: user.nombre,
            edad: user.edad,
            carnet: user.carnet,
            rutaFotoPerfil: user.rutaFotoPerfil,
            rangos: rangoRecords,
        };
    }
    async updateProfile(userId, dto) {
        const usuario = await this.prisma.user.update({
            where: { id: userId },
            data: {
                nombre: dto.nombre ?? null,
                edad: dto.edad ?? null,
                carnet: dto.carnet ?? null,
                rutaFotoPerfil: dto.rutaFotoPerfil ?? null,
            },
            select: {
                id: true,
                correoInstitucional: true,
                nombre: true,
                edad: true,
                carnet: true,
                rutaFotoPerfil: true,
            },
        });
        return usuario;
    }
    async verifyEmail(correo, codigo) {
        const correoNormalizado = this.normalizeEmail(correo);
        this.validateInstitutionalEmail(correoNormalizado);
        const pending = await this.prisma.pendingUser.findUnique({
            where: { correo: correoNormalizado },
        });
        if (!pending) {
            return { ok: false, message: 'No hay registro pendiente' };
        }
        if (pending.codigoVerificacion !== codigo) {
            return { ok: false, message: 'Código inválido' };
        }
        if (pending.codigoExpiraEn.getTime() < Date.now()) {
            return { ok: false, message: 'Código expirado' };
        }
        return { ok: true, message: 'Código válido' };
    }
    async resendVerificationCode(correo) {
        const correoNormalizado = this.normalizeEmail(correo);
        this.validateInstitutionalEmail(correoNormalizado);
        const pending = await this.prisma.pendingUser.findUnique({
            where: { correo: correoNormalizado },
        });
        if (!pending) {
            return { ok: false, message: 'No hay registro pendiente' };
        }
        if (pending.codigoEnviadoEn) {
            const msDesdeUltimo = Date.now() - pending.codigoEnviadoEn.getTime();
            if (msDesdeUltimo < 2 * 60 * 1000) {
                return {
                    ok: false,
                    message: 'Espera 2 minutos antes de reenviar el código',
                };
            }
        }
        const codigo = this.generarCodigo();
        const ahora = new Date();
        const expiracion = new Date(ahora.getTime() + 15 * 60 * 1000);
        await this.prisma.pendingUser.update({
            where: { correo: correoNormalizado },
            data: {
                codigoVerificacion: codigo,
                codigoExpiraEn: expiracion,
                codigoEnviadoEn: ahora,
            },
        });
        await this.mailer.sendVerificationEmail(correoNormalizado, codigo);
        return { ok: true, message: 'Código reenviado' };
    }
    generarCodigo() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
    normalizeEmail(correo) {
        return (correo ?? '').trim().toLowerCase();
    }
    validateInstitutionalEmail(correo) {
        const institutionalPattern = /^[a-záéíóúñ]+\d{9}@cunoc\.edu\.gt$/i;
        if (!institutionalPattern.test(correo)) {
            throw new common_1.BadRequestException('Correo inválido. Formato requerido: NombreApellido123456789@cunoc.edu.gt');
        }
    }
    validateStrongPassword(contrasena) {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!passwordPattern.test(contrasena ?? '')) {
            throw new common_1.BadRequestException('Contraseña insegura. Debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.');
        }
    }
    async setUserRango(userId, rangoNombre, enabled) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const rango = await this.prisma.rango.upsert({
            where: { nombre: rangoNombre },
            update: {},
            create: { nombre: rangoNombre },
            select: { id: true },
        });
        if (enabled) {
            await this.prisma.userRango.createMany({
                data: [{ userId, rangoId: rango.id }],
                skipDuplicates: true,
            });
        }
        else {
            await this.prisma.userRango.deleteMany({
                where: { userId, rangoId: rango.id },
            });
        }
        return this.getAdminManagementUserById(userId);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_service_1.MailerService])
], UsersService);
//# sourceMappingURL=users.service.js.map