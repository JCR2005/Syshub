CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    "correoInstitucional" VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    edad INTEGER,
    bloqueado BOOLEAN DEFAULT FALSE,
    nombre VARCHAR(255),
    carnet VARCHAR(100),
    "rutaFotoPerfil" VARCHAR(500)
);

CREATE TABLE "Role" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE "Rango" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE "UserRole" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT fk_userrole_user
        FOREIGN KEY ("userId")
        REFERENCES "User"(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_userrole_role
        FOREIGN KEY ("roleId")
        REFERENCES "Role"(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_role
        UNIQUE ("userId", "roleId")
);

CREATE TABLE "UserRango" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "rangoId" INTEGER NOT NULL,

    CONSTRAINT fk_userrango_user
        FOREIGN KEY ("userId")
        REFERENCES "User"(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_userrango_rango
        FOREIGN KEY ("rangoId")
        REFERENCES "Rango"(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_rango
        UNIQUE ("userId", "rangoId")
);

CREATE TABLE "Carrera" (
    id_carrera SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    color VARCHAR(50)
);

CREATE TABLE "Pensum" (
    id_pensum SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    vigente BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_carrera INTEGER NOT NULL,

    CONSTRAINT fk_pensum_carrera
        FOREIGN KEY (id_carrera)
        REFERENCES "Carrera"(id_carrera)
);

CREATE TABLE "AreaTecnica" (
    id_area SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    color VARCHAR(50),
    id_pensum INTEGER NOT NULL,

    CONSTRAINT fk_area_pensum
        FOREIGN KEY (id_pensum)
        REFERENCES "Pensum"(id_pensum)
);

CREATE TABLE "Curso" (
    id_curso SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    semestre INTEGER NOT NULL,
    id_pensum INTEGER NOT NULL,
    id_area INTEGER,

    CONSTRAINT fk_curso_pensum
        FOREIGN KEY (id_pensum)
        REFERENCES "Pensum"(id_pensum),

    CONSTRAINT fk_curso_area
        FOREIGN KEY (id_area)
        REFERENCES "AreaTecnica"(id_area),

    CONSTRAINT uq_curso_nombre
        UNIQUE(nombre, id_pensum, semestre),

    CONSTRAINT uq_curso_codigo
        UNIQUE(codigo, id_pensum)
);

CREATE TABLE "Repositorio" (
    id_repositorio SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    visibilidad VARCHAR(20) DEFAULT 'public',
    estrellas INTEGER DEFAULT 0,
    vistas INTEGER DEFAULT 0,
    id_pensum INTEGER,
    id_curso INTEGER,

    CONSTRAINT fk_repo_pensum
        FOREIGN KEY (id_pensum)
        REFERENCES "Pensum"(id_pensum),

    CONSTRAINT fk_repo_curso
        FOREIGN KEY (id_curso)
        REFERENCES "Curso"(id_curso)
);

CREATE TABLE "Repositorio_Usuario" (
    id_repositorio_usuario SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_repositorio INTEGER NOT NULL,

    CONSTRAINT fk_repo_usuario_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_repo_usuario_repo
        FOREIGN KEY (id_repositorio)
        REFERENCES "Repositorio"(id_repositorio)
        ON DELETE CASCADE,

    CONSTRAINT uq_repo_usuario
        UNIQUE(id_usuario, id_repositorio)
);

CREATE TABLE "RepoCommit" (
    id_commit SERIAL PRIMARY KEY,
    id_repositorio INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    accion VARCHAR(100) DEFAULT 'commit',
    hash_snapshot VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_commit_repo
        FOREIGN KEY (id_repositorio)
        REFERENCES "Repositorio"(id_repositorio)
        ON DELETE CASCADE,

    CONSTRAINT fk_commit_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id)
);

CREATE TABLE "RepoCommitArchivo" (
    id_commit_archivo SERIAL PRIMARY KEY,
    id_commit INTEGER NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    hash_archivo VARCHAR(255) NOT NULL,
    tamano_bytes INTEGER,

    CONSTRAINT fk_commitarchivo_commit
        FOREIGN KEY (id_commit)
        REFERENCES "RepoCommit"(id_commit)
        ON DELETE CASCADE
);

CREATE TABLE "RepoSyncEvent" (
    id_evento SERIAL PRIMARY KEY,
    id_repositorio INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    id_commit INTEGER,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_repo
        FOREIGN KEY (id_repositorio)
        REFERENCES "Repositorio"(id_repositorio),

    CONSTRAINT fk_event_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id),

    CONSTRAINT fk_event_commit
        FOREIGN KEY (id_commit)
        REFERENCES "RepoCommit"(id_commit)
);

CREATE TABLE "CategoriaForo" (
    id_categoria SERIAL PRIMARY KEY,
    categoria VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE "TipoHiloForo" (
    id_tipo SERIAL PRIMARY KEY,
    tipo VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE "HiloForo" (
    id_hilo_foro SERIAL PRIMARY KEY,
    nombre_hilo_foro VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    "coverImageUrl" VARCHAR(500),
    reportado BOOLEAN DEFAULT FALSE,
    "isPinned" BOOLEAN DEFAULT FALSE,
    "isFeatured" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "autorId" INTEGER NOT NULL,
    upvotes INTEGER DEFAULT 0,

    CONSTRAINT fk_hilo_user
        FOREIGN KEY ("autorId")
        REFERENCES "User"(id)
);

CREATE TABLE "ComentarioHiloForo" (
    id_comentario SERIAL PRIMARY KEY,
    comentario TEXT NOT NULL,
    id_hilo_foro INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    upvotes INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "parentId" INTEGER,

    CONSTRAINT fk_comentario_hilo
        FOREIGN KEY (id_hilo_foro)
        REFERENCES "HiloForo"(id_hilo_foro)
        ON DELETE CASCADE,

    CONSTRAINT fk_comentario_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id),

    CONSTRAINT fk_comentario_parent
        FOREIGN KEY ("parentId")
        REFERENCES "ComentarioHiloForo"(id_comentario)
);

CREATE TABLE "ValoracionHiloForo" (
    id_valoracion SERIAL PRIMARY KEY,
    valoracion BOOLEAN NOT NULL,
    id_hilo_foro INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,

    CONSTRAINT fk_val_hilo
        FOREIGN KEY (id_hilo_foro)
        REFERENCES "HiloForo"(id_hilo_foro)
        ON DELETE CASCADE,

    CONSTRAINT fk_val_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id),

    CONSTRAINT uq_val_hilo_user
        UNIQUE(id_hilo_foro, id_usuario)
);

CREATE TABLE "ValoracionComentario" (
    id SERIAL PRIMARY KEY,
    valoracion BOOLEAN NOT NULL,
    "comentarioId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT fk_valcoment_coment
        FOREIGN KEY ("comentarioId")
        REFERENCES "ComentarioHiloForo"(id_comentario)
        ON DELETE CASCADE,

    CONSTRAINT fk_valcoment_user
        FOREIGN KEY ("userId")
        REFERENCES "User"(id),

    CONSTRAINT uq_valcoment_user
        UNIQUE("comentarioId", "userId")
);CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    "correoInstitucional" VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    edad INTEGER,
    bloqueado BOOLEAN DEFAULT FALSE,
    nombre VARCHAR(255),
    carnet VARCHAR(100),
    "rutaFotoPerfil" VARCHAR(500)
);

CREATE TABLE "Role" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE "Rango" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE "UserRole" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT fk_userrole_user
        FOREIGN KEY ("userId")
        REFERENCES "User"(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_userrole_role
        FOREIGN KEY ("roleId")
        REFERENCES "Role"(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_role
        UNIQUE ("userId", "roleId")
);

CREATE TABLE "UserRango" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "rangoId" INTEGER NOT NULL,

    CONSTRAINT fk_userrango_user
        FOREIGN KEY ("userId")
        REFERENCES "User"(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_userrango_rango
        FOREIGN KEY ("rangoId")
        REFERENCES "Rango"(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_rango
        UNIQUE ("userId", "rangoId")
);

CREATE TABLE "Carrera" (
    id_carrera SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    color VARCHAR(50)
);

CREATE TABLE "Pensum" (
    id_pensum SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    vigente BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_carrera INTEGER NOT NULL,

    CONSTRAINT fk_pensum_carrera
        FOREIGN KEY (id_carrera)
        REFERENCES "Carrera"(id_carrera)
);

CREATE TABLE "AreaTecnica" (
    id_area SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    color VARCHAR(50),
    id_pensum INTEGER NOT NULL,

    CONSTRAINT fk_area_pensum
        FOREIGN KEY (id_pensum)
        REFERENCES "Pensum"(id_pensum)
);

CREATE TABLE "Curso" (
    id_curso SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    semestre INTEGER NOT NULL,
    id_pensum INTEGER NOT NULL,
    id_area INTEGER,

    CONSTRAINT fk_curso_pensum
        FOREIGN KEY (id_pensum)
        REFERENCES "Pensum"(id_pensum),

    CONSTRAINT fk_curso_area
        FOREIGN KEY (id_area)
        REFERENCES "AreaTecnica"(id_area),

    CONSTRAINT uq_curso_nombre
        UNIQUE(nombre, id_pensum, semestre),

    CONSTRAINT uq_curso_codigo
        UNIQUE(codigo, id_pensum)
);

CREATE TABLE "Repositorio" (
    id_repositorio SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    visibilidad VARCHAR(20) DEFAULT 'public',
    estrellas INTEGER DEFAULT 0,
    vistas INTEGER DEFAULT 0,
    id_pensum INTEGER,
    id_curso INTEGER,

    CONSTRAINT fk_repo_pensum
        FOREIGN KEY (id_pensum)
        REFERENCES "Pensum"(id_pensum),

    CONSTRAINT fk_repo_curso
        FOREIGN KEY (id_curso)
        REFERENCES "Curso"(id_curso)
);

CREATE TABLE "Repositorio_Usuario" (
    id_repositorio_usuario SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_repositorio INTEGER NOT NULL,

    CONSTRAINT fk_repo_usuario_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_repo_usuario_repo
        FOREIGN KEY (id_repositorio)
        REFERENCES "Repositorio"(id_repositorio)
        ON DELETE CASCADE,

    CONSTRAINT uq_repo_usuario
        UNIQUE(id_usuario, id_repositorio)
);

CREATE TABLE "RepoCommit" (
    id_commit SERIAL PRIMARY KEY,
    id_repositorio INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    accion VARCHAR(100) DEFAULT 'commit',
    hash_snapshot VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_commit_repo
        FOREIGN KEY (id_repositorio)
        REFERENCES "Repositorio"(id_repositorio)
        ON DELETE CASCADE,

    CONSTRAINT fk_commit_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id)
);

CREATE TABLE "RepoCommitArchivo" (
    id_commit_archivo SERIAL PRIMARY KEY,
    id_commit INTEGER NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    hash_archivo VARCHAR(255) NOT NULL,
    tamano_bytes INTEGER,

    CONSTRAINT fk_commitarchivo_commit
        FOREIGN KEY (id_commit)
        REFERENCES "RepoCommit"(id_commit)
        ON DELETE CASCADE
);

CREATE TABLE "RepoSyncEvent" (
    id_evento SERIAL PRIMARY KEY,
    id_repositorio INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    id_commit INTEGER,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_repo
        FOREIGN KEY (id_repositorio)
        REFERENCES "Repositorio"(id_repositorio),

    CONSTRAINT fk_event_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id),

    CONSTRAINT fk_event_commit
        FOREIGN KEY (id_commit)
        REFERENCES "RepoCommit"(id_commit)
);

CREATE TABLE "CategoriaForo" (
    id_categoria SERIAL PRIMARY KEY,
    categoria VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE "TipoHiloForo" (
    id_tipo SERIAL PRIMARY KEY,
    tipo VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE "HiloForo" (
    id_hilo_foro SERIAL PRIMARY KEY,
    nombre_hilo_foro VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    "coverImageUrl" VARCHAR(500),
    reportado BOOLEAN DEFAULT FALSE,
    "isPinned" BOOLEAN DEFAULT FALSE,
    "isFeatured" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "autorId" INTEGER NOT NULL,
    upvotes INTEGER DEFAULT 0,

    CONSTRAINT fk_hilo_user
        FOREIGN KEY ("autorId")
        REFERENCES "User"(id)
);

CREATE TABLE "ComentarioHiloForo" (
    id_comentario SERIAL PRIMARY KEY,
    comentario TEXT NOT NULL,
    id_hilo_foro INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    upvotes INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "parentId" INTEGER,

    CONSTRAINT fk_comentario_hilo
        FOREIGN KEY (id_hilo_foro)
        REFERENCES "HiloForo"(id_hilo_foro)
        ON DELETE CASCADE,

    CONSTRAINT fk_comentario_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id),

    CONSTRAINT fk_comentario_parent
        FOREIGN KEY ("parentId")
        REFERENCES "ComentarioHiloForo"(id_comentario)
);

CREATE TABLE "ValoracionHiloForo" (
    id_valoracion SERIAL PRIMARY KEY,
    valoracion BOOLEAN NOT NULL,
    id_hilo_foro INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,

    CONSTRAINT fk_val_hilo
        FOREIGN KEY (id_hilo_foro)
        REFERENCES "HiloForo"(id_hilo_foro)
        ON DELETE CASCADE,

    CONSTRAINT fk_val_user
        FOREIGN KEY (id_usuario)
        REFERENCES "User"(id),

    CONSTRAINT uq_val_hilo_user
        UNIQUE(id_hilo_foro, id_usuario)
);

CREATE TABLE "ValoracionComentario" (
    id SERIAL PRIMARY KEY,
    valoracion BOOLEAN NOT NULL,
    "comentarioId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT fk_valcoment_coment
        FOREIGN KEY ("comentarioId")
        REFERENCES "ComentarioHiloForo"(id_comentario)
        ON DELETE CASCADE,

    CONSTRAINT fk_valcoment_user
        FOREIGN KEY ("userId")
        REFERENCES "User"(id),

    CONSTRAINT uq_valcoment_user
        UNIQUE("comentarioId", "userId")
);
