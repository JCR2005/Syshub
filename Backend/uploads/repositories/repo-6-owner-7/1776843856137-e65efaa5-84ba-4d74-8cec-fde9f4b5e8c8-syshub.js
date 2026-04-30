#!/usr/bin/env node

const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const crypto = require('crypto');
const http   = require('http');
const https  = require('https');
const AdmZip = require('adm-zip');



const GLOBAL_AUTH_PATH = path.join(os.homedir(), '.syshub', 'auth.json');



const out = {
  ok:   (msg) => console.log(`  [+] ${msg}`),
  info: (msg) => console.log(`  [>] ${msg}`),
  skip: (msg) => console.log(`  [~] ${msg}`),
  warn: (msg) => console.log(`  [!] ${msg}`),
  err:  (msg) => console.error(`  [-] ${msg}`),
};

function fail(message) {
  out.err(message);
  process.exit(1);
}



function loadAuth() {
  if (!fs.existsSync(GLOBAL_AUTH_PATH)) return null;
  try { return JSON.parse(fs.readFileSync(GLOBAL_AUTH_PATH, 'utf8')); }
  catch { return null; }
}

function saveAuth(data) {
  const dir = path.dirname(GLOBAL_AUTH_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(GLOBAL_AUTH_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function requireAuth(options) {
  if (options.token) return options.token;
  const auth = loadAuth();
  if (!auth?.token) {
    fail('No autenticado. Ejecuta: syshub login <url> --user <correo> --password <clave>');
  }
  return auth.token;
}

function requireApiBase(options, configRemote) {
  if (options.apiBase)         return normalizeApiBase(options.apiBase);
  if (configRemote?.apiBase)   return configRemote.apiBase;
  const auth = loadAuth();
  if (auth?.apiBase)           return auth.apiBase;
  fail('No se encontro el API base. Usa --api-base o ejecuta syshub login primero.');
}



function parseArgs(argv) {
  const args    = [...argv];
  const command = args.shift();

  if (!command || command === '--help' || command === '-h') {
    return { help: true };
  }

  const valid = ['login', 'logout', 'clone', 'push', 'commit', 'log', 'pull'];
  if (!valid.includes(command)) {
    fail(`Comando no reconocido: "${command}". Disponibles: ${valid.join(', ')}`);
  }

  const positional = [];
  const options = {
    apiBase:  null,
    token:    null,
    force:    false,
    user:     null,
    password: null,
    message:  null,
  };

  while (args.length) {
    const cur = args.shift();
    if (!cur) continue;

    if (cur === '--api-base')                      { options.apiBase   = args.shift() || null; continue; }
    if (cur === '--token')                         { options.token     = args.shift() || null; continue; }
    if (cur === '--user'     || cur === '-u')      { options.user      = args.shift() || null; continue; }
    if (cur === '--password' || cur === '-p')      { options.password  = args.shift() || null; continue; }
    if (cur === '--message'  || cur === '-m')      { options.message   = args.shift() || null; continue; }
    if (cur === '--force')                         { options.force     = true;                 continue; }

    positional.push(cur);
  }

  return { help: false, command, positional, options };
}



function ensureUrl(raw, label) {
  try { return new URL(raw); }
  catch { fail(`URL invalida (${label}): ${raw}`); }
}

function normalizeApiBase(raw) {
  if (!raw) return null;
  const url  = ensureUrl(raw, 'api-base');
  let   base = `${url.origin}${url.pathname}`.replace(/\/$/, '');
  if (!base.endsWith('/api')) base = `${base}/api`;
  return base;
}

function deriveApiBase(source) {
  if (source.hostname === 'localhost' && source.port === '5173') {
    return 'http://localhost:3000/api';
  }
  return `${source.origin}/api`;
}

function parseRepoFromFrontend(pathname) {
  const m = pathname.match(/\/repositories\/(\d+)(?:\/)?$/i);
  return m ? { repositoryId: Number(m[1]), ownerId: null } : null;
}

function parseRepoFromApiPath(pathname) {
  const m2 = pathname.match(/\/api\/repositories\/public\/(\d+)\/(\d+)\/clone(?:\/)?$/i);
  if (m2) return { ownerId: Number(m2[1]), repositoryId: Number(m2[2]) };
  const m1 = pathname.match(/\/api\/repositories\/public\/(\d+)\/clone(?:\/)?$/i);
  if (m1) return { ownerId: null, repositoryId: Number(m1[1]) };
  return null;
}

function resolveCloneRequest(sourceUrl, options) {
  const source  = ensureUrl(sourceUrl, 'source');
  const apiBase = normalizeApiBase(options.apiBase) || deriveApiBase(source);

  const fromApi = parseRepoFromApiPath(source.pathname);
  if (fromApi) {
    return {
      cloneUrl:     `${source.origin}${source.pathname}`,
      apiBase,
      ownerId:      fromApi.ownerId,
      repositoryId: fromApi.repositoryId,
      sourceType:   'api',
    };
  }

  const fromFrontend = parseRepoFromFrontend(source.pathname);
  if (fromFrontend) {
    return {
      cloneUrl:     `${apiBase}/repositories/public/${fromFrontend.repositoryId}/clone`,
      apiBase,
      ownerId:      null,
      repositoryId: fromFrontend.repositoryId,
      sourceType:   'frontend',
    };
  }

  fail('No pude resolver la URL. Usa /repositories/:id o /api/repositories/public/.../clone');
}



function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function scanLocalFiles(dir, base = dir, ignore = ['.syshub']) {
  const result = [];
  for (const entry of fs.readdirSync(dir)) {
    if (ignore.includes(entry)) continue;
    const full = path.join(dir, entry);
    const rel  = path.relative(base, full).replace(/\\/g, '/');
    if (fs.statSync(full).isDirectory()) {
      result.push(...scanLocalFiles(full, base, ignore));
    } else {
      result.push({ rel, full, hash: hashFile(full) });
    }
  }
  return result;
}

function loadManifest(syshubDir) {
  const p = path.join(syshubDir, 'manifest.json');
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return {}; }
}

function saveManifest(syshubDir, manifest) {
  fs.writeFileSync(path.join(syshubDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
}



function getFilenameFromHeaders(headers, fallback) {
  const d    = headers.get('content-disposition') || '';
  const utf8 = d.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) { try { return decodeURIComponent(utf8[1]); } catch { /**/ } }
  const plain = d.match(/filename="?([^";]+)"?/i);
  if (plain?.[1]) return plain[1];
  return fallback;
}

async function apiPost(url, body, token) {
  const res  = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let   data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!res.ok) fail(`HTTP ${res.status}: ${data?.message || text}`);
  return data;
}

async function uploadFile(apiBase, repositoryId, filePath, relativePath, token) {
  const boundary   = `----SyshubBoundary${Date.now()}${crypto.randomBytes(4).toString('hex')}`;
  const fileBuffer = fs.readFileSync(filePath);
  const filename   = path.basename(relativePath);

  const partFileHeader = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="files"; filename="${filename}"\r\n` +
    `Content-Type: application/octet-stream\r\n\r\n`,
  );

  const partFileTail = Buffer.from('\r\n');

  const partRelPath = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="relativePaths"\r\n\r\n` +
    `${relativePath}\r\n`,
  );

  const closing = Buffer.from(`--${boundary}--\r\n`);

  const body = Buffer.concat([partFileHeader, fileBuffer, partFileTail, partRelPath, closing]);

  const urlObj = new URL(`${apiBase}/repositories/${repositoryId}/files`);
  const lib    = urlObj.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request({
      hostname: urlObj.hostname,
      port:     urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path:     urlObj.pathname,
      method:   'POST',
      headers:  {
        'Content-Type':   `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(raw)); } catch { resolve({}); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}



async function runLogin(parsed) {
  const serverUrl = parsed.positional[0];
  if (!serverUrl)        fail('Debes indicar la URL del servidor. Ej: syshub login http://localhost:3000');
  if (!parsed.options.user)     fail('Falta --user <correo>');
  if (!parsed.options.password) fail('Falta --password <clave>');

  const apiBase = normalizeApiBase(serverUrl) || `${serverUrl.replace(/\/$/, '')}/api`;

  out.info(`Conectando a ${apiBase} ...`);

  const data = await apiPost(`${apiBase}/auth/login`, {
    correo: parsed.options.user,
    contrasena:          parsed.options.password,
  });

  const token = data.access_token || data.token || data.accessToken;
  if (!token) fail('El servidor no devolvio un token. Verifica tus credenciales.');

  saveAuth({ apiBase, token, user: parsed.options.user, savedAt: new Date().toISOString() });

  out.ok(`Sesion iniciada como ${parsed.options.user}`);
  out.ok(`Credenciales guardadas en ${GLOBAL_AUTH_PATH}`);
}

function runLogout() {
  if (fs.existsSync(GLOBAL_AUTH_PATH)) {
    fs.rmSync(GLOBAL_AUTH_PATH, { force: true });
    out.ok('Sesion cerrada.');
  } else {
    out.warn('No habia sesion activa.');
  }
}

async function runClone(parsed) {
  const sourceUrl = parsed.positional[0];
  if (!sourceUrl) fail('Debes indicar una URL para clonar.');

  const resolved = resolveCloneRequest(sourceUrl, parsed.options);
  out.info(`Resolviendo: ${resolved.cloneUrl}`);

  const token = loadAuth()?.token || parsed.options.token;
  const res   = await fetch(resolved.cloneUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) fail(`No se pudo clonar (HTTP ${res.status}).`);

  const fileName    = getFilenameFromHeaders(res.headers, `repo-${resolved.repositoryId}.zip`);
  const destArg     = parsed.positional[1] || null;
  const destination = destArg
    ? path.resolve(process.cwd(), destArg)
    : path.resolve(process.cwd(), fileName.replace(/\.zip$/i, '') || `repo-${resolved.repositoryId}`);

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  } else if (fs.readdirSync(destination).length && !parsed.options.force) {
    fail(`La carpeta destino no esta vacia: ${destination}. Usa --force para continuar.`);
  }

  const tmpFile = path.join(os.tmpdir(), `syshub-clone-${Date.now()}.zip`);
  fs.writeFileSync(tmpFile, Buffer.from(await res.arrayBuffer()));

  try {
    new AdmZip(tmpFile).extractAllTo(destination, true);
  } catch (e) {
    fail(`Error extrayendo snapshot: ${e.message}`);
  } finally {
    fs.rmSync(tmpFile, { force: true });
  }

  const syshubDir = path.join(destination, '.syshub');
  fs.mkdirSync(syshubDir, { recursive: true });

  fs.writeFileSync(
    path.join(syshubDir, 'config.json'),
    JSON.stringify({
      version: 1,
      remote: {
        sourceType:   resolved.sourceType,
        sourceUrl,
        cloneUrl:     resolved.cloneUrl,
        apiBase:      resolved.apiBase,
        ownerId:      resolved.ownerId,
        repositoryId: resolved.repositoryId,
      },
      clonedAt: new Date().toISOString(),
    }, null, 2),
    'utf8',
  );


  const manifest = {};
  for (const f of scanLocalFiles(destination)) manifest[f.rel] = f.hash;
  saveManifest(syshubDir, manifest);

  out.ok(`Repositorio clonado en: ${destination}`);
}

async function runPush(parsed) {
  const cwd        = process.cwd();
  const syshubDir  = path.join(cwd, '.syshub');
  const configPath = path.join(syshubDir, 'config.json');

  if (!fs.existsSync(configPath)) {
    fail('No se encontro .syshub/config.json. Asegurate de estar dentro de un repositorio syshub.');
  }

  const config                     = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { apiBase, repositoryId }  = config.remote;
  const token                      = requireAuth(parsed.options);
  const manifest                   = loadManifest(syshubDir);
  const localFiles                 = scanLocalFiles(cwd);

  const toUpload  = [];
  const unchanged = [];

  for (const file of localFiles) {
    if (manifest[file.rel] === file.hash) unchanged.push(file);
    else                                   toUpload.push(file);
  }

  if (!toUpload.length) {
    out.info('Sin cambios detectados. Nada que subir.');
    return;
  }

  out.info(`Sin cambios : ${unchanged.length} archivo(s)`);
  out.info(`A subir     : ${toUpload.length} archivo(s)`);
  console.log('');

  let uploaded = 0;
  let failed   = 0;

  for (const file of toUpload) {
    process.stdout.write(`  [>] ${file.rel} ... `);
    try {
      await uploadFile(apiBase, repositoryId, file.full, file.rel, token);
      process.stdout.write('ok\n');
      manifest[file.rel] = file.hash;
      uploaded++;
    } catch (e) {
      process.stdout.write('error\n');
      out.warn(`   ${e.message}`);
      failed++;
    }
  }

  if (!uploaded) fail('No se pudo subir ningun archivo.');

  console.log('');

  const message = parsed.options.message || 'Push desde syshub CLI';
  out.info(`Registrando commit: "${message}"`);

  const result = await apiPost(`${apiBase}/repositories/${repositoryId}/push`, { message }, token);

  saveManifest(syshubDir, manifest);

  console.log('');
  out.ok(`Push completado — ${uploaded} archivo(s) subido(s)${failed ? `, ${failed} fallido(s)` : ''}`);
  out.ok(`Commit  #${result.commit?.id}`);
  out.ok(`Hash     ${result.commit?.hashSnapshot?.slice(0, 16)}...`);
  out.ok(`Mensaje  ${result.commit?.mensaje}`);
}

async function runCommit(parsed) {
  const cwd        = process.cwd();
  const configPath = path.join(cwd, '.syshub', 'config.json');

  if (!fs.existsSync(configPath)) {
    fail('No se encontro .syshub/config.json. Asegurate de estar dentro de un repositorio syshub.');
  }

  const config                    = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { apiBase, repositoryId } = config.remote;
  const token                     = requireAuth(parsed.options);
  const message                   = parsed.options.message || 'Commit desde syshub CLI';

  out.info(`Registrando commit: "${message}"`);

  const result = await apiPost(`${apiBase}/repositories/${repositoryId}/commit`, { message }, token);

  console.log('');
  out.ok(`Commit  #${result.commit?.id}`);
  out.ok(`Hash     ${result.commit?.hashSnapshot?.slice(0, 16)}...`);
  out.ok(`Archivos ${result.commit?.filesCount}`);
}

async function runLog(parsed) {
  const cwd        = process.cwd();
  const configPath = path.join(cwd, '.syshub', 'config.json');

  if (!fs.existsSync(configPath)) {
    fail('No se encontro .syshub/config.json. Asegurate de estar dentro de un repositorio syshub.');
  }

  const config                    = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { apiBase, repositoryId } = config.remote;
  const token                     = requireAuth(parsed.options);

  const res = await fetch(`${apiBase}/repositories/${repositoryId}/commits`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) fail(`No se pudo obtener el historial (HTTP ${res.status}).`);

  const { commits = [] } = await res.json();

  if (!commits.length) { out.info('Sin commits registrados.'); return; }

  console.log('');
  for (const c of commits) {
    const date = new Date(c.createdAt).toLocaleString('es-GT');
    console.log(`  commit  ${c.hashSnapshot?.slice(0, 16) || String(c.id)}`);
    console.log(`  Autor   ${c.usuario?.nombre || c.usuario?.correoInstitucional}`);
    console.log(`  Fecha   ${date}`);
    console.log(`  Accion  ${c.accion}`);
    console.log(`  Mensaje ${c.mensaje}`);
    if (c.archivos?.length) {
      console.log(`  Archivos`);
      for (const f of c.archivos) console.log(`    - ${f.ruta}`);
    }
    console.log('');
  }
}

async function runPull(parsed) {
  const cwd        = process.cwd();
  const configPath = path.join(cwd, '.syshub', 'config.json');

  if (!fs.existsSync(configPath)) {
    fail('No se encontro .syshub/config.json. Asegurate de estar dentro de un repositorio syshub.');
  }

  const config                    = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { apiBase, repositoryId } = config.remote;
  const token                     = requireAuth(parsed.options);

  out.info('Sincronizando con el servidor ...');

  const result = await apiPost(`${apiBase}/repositories/${repositoryId}/pull`, {}, token);

  out.ok(result.summary || 'Pull completado.');
  if (result.commit) {
    out.ok(`Ultimo commit  #${result.commit.id} — ${result.commit.mensaje}`);
    out.ok(`Hash           ${result.commit.hashSnapshot?.slice(0, 16)}...`);
  }
}



function printHelp() {
  console.log(`
  syshub CLI

  Uso:
    syshub <comando> [opciones]

  Comandos:
    login <url>    Iniciar sesion en un servidor syshub
    logout         Cerrar sesion
    clone <url>    Clonar un repositorio publico
    push           Subir cambios y registrar commit
    commit         Registrar snapshot sin subir archivos
    log            Ver historial de commits
    pull           Sincronizar con el ultimo commit remoto

  Opciones:
    --api-base     URL base del API (ej: http://localhost:3000/api)
    --token        JWT manual (si no hay sesion activa)
    --force        Forzar clonado en directorio no vacio
    --user,    -u  Correo institucional (login)
    --password,-p  Contrasena (login)
    --message, -m  Mensaje del commit (push / commit)

  Ejemplos:
    syshub login http://localhost:3000 -u carlos@uni.edu -p 1234
    syshub clone http://localhost:5173/repositories/6
    syshub push -m "Apuntes unidad 3"
    syshub commit -m "Snapshot del proyecto"
    syshub log
    syshub pull
`);
}

//saaaaaaaaaaaaaaaaaaald,ewpffomwffffffffffffffffffffffff putaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

(async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help)                    { printHelp();            process.exit(0); }
  if (parsed.command === 'login')     { await runLogin(parsed); process.exit(0); }
  if (parsed.command === 'logout')    {       runLogout();       process.exit(0); }
  if (parsed.command === 'clone')     { await runClone(parsed); process.exit(0); }
  if (parsed.command === 'push')      { await runPush(parsed);  process.exit(0); }
  if (parsed.command === 'commit')    { await runCommit(parsed);process.exit(0); }
  if (parsed.command === 'log')       { await runLog(parsed);   process.exit(0); }
  if (parsed.command === 'pull')      { await runPull(parsed);  process.exit(0); }
})();
