# syshub-cli (MVP)

CLI ligera para clonar repositorios públicos de Syshub en local sin descompresión manual.

## Requisitos

- Node.js 18+

## Instalación local

```bash
cd syshub-cli
npm install
npm link
```

## Uso

```bash
syshub clone http://localhost:5173/repositories/12
```

También acepta URL API directa:

```bash
syshub clone http://localhost:3000/api/repositories/public/12/clone
syshub clone http://localhost:3000/api/repositories/public/5/12/clone
```

Opciones útiles:

```bash
syshub clone <url> [destino]
syshub clone <url> --api-base http://localhost:3000/api
syshub clone <url> --token <jwt>
syshub clone <url> --force
```

## Qué hace `clone`

1. Resuelve URL frontend/API a endpoint de clone del backend.
2. Descarga el ZIP de snapshot del repositorio.
3. Lo extrae automáticamente en una carpeta local.
4. Crea `.syshub/config.json` con metadatos base del remoto.

## Nota

Este MVP implementa únicamente `clone`. Los comandos `add`, `commit`, `push`, `pull` quedan para la siguiente fase del CLI.
