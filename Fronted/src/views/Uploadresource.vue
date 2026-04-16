<template>
  <div class="upload-shell">
    <AppNavbar
      active-section="upload"
      :avatar-initials="userInitials"
      :search-value="''"
      @section-select="onNavbarSectionSelect"
      @profile="router.push('/profile')"
      @logout="logout"
    />

    <main class="upload-main">
      <!-- Page header -->
      <div class="page-header">
        <button class="back-btn" @click="router.push('/dashboard')">
          <svg viewBox="0 0 24 24" class="back-icon"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Volver al dashboard
        </button>

        <div class="header-content">
          <div class="header-icon-wrap">
            <svg viewBox="0 0 24 24" class="header-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h1 class="page-title">Subir recurso educativo</h1>
            <p class="page-subtitle">Comparte materiales de aprendizaje con los estudiantes</p>
          </div>
        </div>
      </div>

      <!-- Error/Success banners -->
      <div v-if="errorMsg" class="banner error-banner">
        <svg viewBox="0 0 24 24" class="banner-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="banner success-banner">
        <svg viewBox="0 0 24 24" class="banner-icon"><polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        {{ successMsg }}
      </div>

      <form @submit.prevent="submit" class="upload-card">

        <!-- Resource type selector -->
        <div class="form-section">
          <label class="section-label">Tipo de recurso</label>
          <div class="type-grid">
            <button
              v-for="type in resourceTypes"
              :key="type.value"
              type="button"
              :class="['type-btn', { active: form.tipo === type.value }]"
              @click="form.tipo = type.value"
            >
              <div class="type-icon-wrap">
                <svg viewBox="0 0 24 24" class="type-icon" v-html="type.icon"></svg>
              </div>
              <span class="type-label">{{ type.label }}</span>
              <span class="type-desc">{{ type.desc }}</span>
            </button>
          </div>
        </div>

        <!-- Title -->
        <div class="form-section two-col">
          <div class="form-group">
            <label class="form-label">Título <span class="required">*</span></label>
            <input
              v-model="form.nombre"
              class="form-input"
              placeholder="Ej: Tutorial avanzado de React Hooks"
              required
              maxlength="200"
            />
            <small class="field-hint">{{ form.nombre.length }}/200</small>
          </div>

        
        </div>

        <!-- Description -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">Descripción <span class="required">*</span></label>
            <textarea
              v-model="form.descripcion"
              class="form-input form-textarea"
              placeholder="Describe el contenido, objetivos y a quién está dirigido el recurso..."
              rows="4"
              required
            ></textarea>
          </div>
        </div>

        <!-- File upload -->
        <div class="form-section">
          <label class="section-label">Archivos <span class="required">*</span></label>

          <div
            :class="['dropzone', { 'dropzone-active': isDragging }]"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInputRef?.click()"
          >
            <input
              ref="fileInputRef"
              type="file"
              class="hidden-input"
              multiple
              accept=".pdf,.mp4,.zip,.rar,.docx,.pptx,.xlsx"
              @change="onFileChange"
            />
            <div class="dropzone-content">
              <div class="dropzone-icon-wrap">
                <svg viewBox="0 0 24 24" class="dropzone-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="17 8 12 3 7 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <p class="dropzone-title">Haz clic o arrastra archivos aquí</p>
              <p class="dropzone-hint">PDF, MP4, ZIP, DOCX, PPTX · máx 100MB</p>
            </div>
          </div>

          <!-- File list -->
          <transition-group name="file-list" tag="div" class="file-list" v-if="selectedFiles.length">
            <div v-for="(file, idx) in selectedFiles" :key="file.name + idx" class="file-item">
              <div class="file-icon-wrap">
                <svg viewBox="0 0 24 24" class="file-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <div class="file-info">
                <p class="file-name">{{ file.name }}</p>
                <p class="file-size">{{ formatSize(file.size) }}</p>
              </div>
              <button type="button" class="file-remove" @click.stop="removeFile(idx)" aria-label="Quitar archivo">
                <svg viewBox="0 0 24 24" class="remove-icon"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>
          </transition-group>
        </div>

        <!-- Upload progress -->
        <div v-if="uploading" class="progress-section">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="progress-label">Subiendo... {{ progress }}%</p>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="router.push('/dashboard')" :disabled="uploading">
            Cancelar
          </button>
          <button
            type="submit"
            class="submit-btn"
            :disabled="uploading || !form.nombre.trim() || !form.tipoRecursoId || !selectedFiles.length"
          >
            <svg v-if="!uploading" viewBox="0 0 24 24" class="submit-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="17 8 12 3 7 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <svg v-else viewBox="0 0 24 24" class="submit-icon spin"><line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            {{ uploading ? 'Subiendo...' : 'Publicar recurso' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import { clearAuthSession, getAuthToken, getAuthUser, hasRole } from '../utils/authSession'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const router = useRouter()

// ── Auth ──────────────────────────────────────────────────────────────────────
const userInitials = computed(() => {
  const u = getAuthUser()
  if (!u?.nombre) return 'US'
  return u.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

const onNavbarSectionSelect = (section) => {
  if (section === 'dashboard') router.push('/dashboard')
  else if (section === 'forum') router.push('/Sysreditt')
  else if (section === 'upload') router.push('/upload-repo')
}

const logout = async () => { clearAuthSession(); await router.push('/login') }

// Redirect if not auxiliar
onMounted(async () => {
  if (!hasRole('auxiliar') && !hasRole('admin')) {
    router.push('/dashboard')
    return
  }
  await loadTiposRecurso()
})

// ── Resource type options (UI) ────────────────────────────────────────────────
const resourceTypes = [
  {
    value: 'video',
    label: 'Video Tutorial',
    desc: 'Clases grabadas o demos',
    icon: '<path d="M23 7l-7 5 7 5V7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  },
  {
    value: 'guia',
    label: 'Guía',
    desc: 'Tutoriales paso a paso',
    icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  },
  {
    value: 'documento',
    label: 'Documento',
    desc: 'PDFs, presentaciones',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  },
   {
    value: 'documento',
    label: 'Documento',
    desc: 'PDFs, presentaciones',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  },
   {
    value: 'documento',
    label: 'Documento',
    desc: 'PDFs, presentaciones',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  },
]

// ── State ─────────────────────────────────────────────────────────────────────
const tiposRecurso = ref([])
const selectedFiles = ref([])
const isDragging = ref(false)
const uploading = ref(false)
const progress = ref(0)
const errorMsg = ref('')
const successMsg = ref('')
const fileInputRef = ref(null)

const form = reactive({
  nombre: '',
  descripcion: '',
  tipo: 'video',       // UI selection
  tipoRecursoId: '',   // FK to Tipo_Recurso
})

// ── Load tipos ────────────────────────────────────────────────────────────────
async function loadTiposRecurso() {
  const token = getAuthToken()
  if (!token) return
  try {
    const res = await fetch(`${API_BASE}/recursos/tipos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const data = await res.json()
    tiposRecurso.value = (data.tipos ?? []).map(t => ({
      id: t.id_tipo_recurso ?? t.id,
      nombre: t.nombre_recurso ?? t.nombre,
    }))
  } catch {
    // keep form usable
  }
}

// ── Files ─────────────────────────────────────────────────────────────────────
function onFileChange(e) {
  addFiles(Array.from(e.target.files ?? []))
  e.target.value = ''
}

function onDrop(e) {
  isDragging.value = false
  addFiles(Array.from(e.dataTransfer?.files ?? []))
}

function addFiles(list) {
  const maxSize = 100 * 1024 * 1024
  for (const file of list) {
    if (file.size > maxSize) { errorMsg.value = `"${file.name}" supera el límite de 100MB.`; continue }
    const dup = selectedFiles.value.some(f => f.name === file.name && f.size === file.size)
    if (!dup) selectedFiles.value.push(file)
  }
}

function removeFile(idx) { selectedFiles.value.splice(idx, 1) }

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submit() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.nombre.trim()) { errorMsg.value = 'El título es obligatorio.'; return }
  if (!form.descripcion.trim()) { errorMsg.value = 'La descripción es obligatoria.'; return }
  if (!form.tipoRecursoId) { errorMsg.value = 'Selecciona un tipo de recurso.'; return }
  if (!selectedFiles.value.length) { errorMsg.value = 'Agrega al menos un archivo.'; return }

  uploading.value = true
  progress.value = 0

  try {
    const token = getAuthToken()
    const authUser = getAuthUser()

    // 1. Create the resource record
    const createRes = await fetch(`${API_BASE}/recursos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: form.nombre,
        descripcion: form.descripcion,
        id_tipo_recurso: Number(form.tipoRecursoId),
        ownerId: authUser?.id,
      }),
    })

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}))
      throw new Error(err.message ?? `Error ${createRes.status}`)
    }

    const created = await createRes.json()
    const recursoId = created.recurso?.id_recurso ?? created.recurso?.id

    progress.value = 30

    // 2. Upload files
    const formData = new FormData()
    for (const file of selectedFiles.value) {
      formData.append('files', file)
    }

    const uploadRes = await fetch(`${API_BASE}/recursos/${recursoId}/archivos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}))
      throw new Error(err.message ?? 'Error subiendo archivos')
    }

    progress.value = 100
    successMsg.value = '¡Recurso publicado exitosamente!'
    setTimeout(() => router.push('/dashboard'), 1800)
  } catch (e) {
    errorMsg.value = e.message ?? 'No se pudo subir el recurso.'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
/* ── Shell ─────────────────────────────────────────────────────────────────── */
.upload-shell {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-primary);
}

.upload-main {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* ── Page header ─────────────────────────────────────────────────────────── */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  color: var(--text-soft);
  padding: 0.4rem 0.9rem 0.4rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.15s;
}
.back-btn:hover { border-color: var(--accent-500); color: var(--accent-500); }
.back-icon { width: 16px; height: 16px; }

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.header-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.header-icon {
  width: 26px;
  height: 26px;
  color: var(--accent-contrast, #fff);
}

.page-title {
  font-size: 1.7rem;
  font-weight: 800;
  margin: 0;
}

.page-subtitle {
  color: var(--text-muted);
  margin: 0.2rem 0 0;
}

/* ── Banners ─────────────────────────────────────────────────────────────── */
.banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.88rem;
}

.error-banner {
  background: color-mix(in srgb, #ef4444 10%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 25%, transparent);
  color: #f87171;
}

.success-banner {
  background: color-mix(in srgb, #22c55e 10%, transparent);
  border: 1px solid color-mix(in srgb, #22c55e 25%, transparent);
  color: #4ade80;
}

.banner-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* ── Upload card ─────────────────────────────────────────────────────────── */
.upload-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  display: grid;
  gap: 1.75rem;
}

/* ── Form sections ───────────────────────────────────────────────────────── */
.form-section { display: grid; gap: 0.75rem; }
.form-section.two-col { grid-template-columns: 1fr 1fr; gap: 1.25rem; }

.section-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group { display: grid; gap: 0.4rem; }

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.required { color: var(--accent-500); }

.form-input,
.form-select {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus { outline: none; border-color: var(--accent-500); }

.form-input::placeholder { color: var(--text-muted); }
.form-textarea { resize: vertical; min-height: 110px; }
.form-select { cursor: pointer; }

.field-hint { font-size: 0.75rem; color: var(--text-muted); }

/* ── Resource type buttons ───────────────────────────────────────────────── */
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 0.75rem;
  border: 1.5px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-app);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.type-btn:hover {
  border-color: color-mix(in srgb, var(--accent-500) 40%, var(--border-color));
  background: color-mix(in srgb, var(--accent-500) 5%, transparent);
}

.type-btn.active {
  border-color: var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 8%, transparent);
}

.type-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bg-surface);
  display: grid;
  place-items: center;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.type-btn.active .type-icon-wrap {
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  border-color: transparent;
}

.type-icon {
  width: 20px;
  height: 20px;
  color: var(--text-soft);
  transition: color 0.2s;
}

.type-btn.active .type-icon { color: var(--accent-contrast, #fff); }

.type-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
}

.type-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ── Dropzone ────────────────────────────────────────────────────────────── */
.hidden-input { display: none; }

.dropzone {
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  padding: 2.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-app);
}

.dropzone:hover,
.dropzone-active {
  border-color: var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 5%, transparent);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.dropzone-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent-500) 10%, transparent);
  display: grid;
  place-items: center;
  margin-bottom: 0.25rem;
}

.dropzone-icon {
  width: 28px;
  height: 28px;
  color: var(--accent-500);
}

.dropzone-title {
  font-weight: 700;
  font-size: 0.95rem;
  margin: 0;
  color: var(--text-primary);
}

.dropzone-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

/* ── File list ───────────────────────────────────────────────────────────── */
.file-list { display: grid; gap: 0.5rem; margin-top: 0.25rem; }

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: border-color 0.15s;
}

.file-item:hover { border-color: color-mix(in srgb, var(--accent-500) 30%, var(--border-color)); }

.file-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--accent-500) 10%, transparent);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.file-icon { width: 16px; height: 16px; color: var(--accent-500); }

.file-info { flex: 1; min-width: 0; }

.file-name {
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.file-size { font-size: 0.75rem; color: var(--text-muted); margin: 0; }

.file-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 6px;
  display: grid;
  place-items: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.file-remove:hover { background: color-mix(in srgb, #ef4444 10%, transparent); color: #f87171; }
.remove-icon { width: 14px; height: 14px; }

/* ── Progress ────────────────────────────────────────────────────────────── */
.progress-section { display: grid; gap: 0.4rem; }

.progress-track {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-label { font-size: 0.8rem; color: var(--text-muted); text-align: right; margin: 0; }

/* ── Actions ─────────────────────────────────────────────────────────────── */
.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border-color);
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-soft);
  padding: 0.65rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
}

.cancel-btn:hover:not(:disabled) { border-color: var(--text-muted); color: var(--text-primary); }
.cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  border-radius: 12px;
  color: var(--accent-contrast, #fff);
  padding: 0.65rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.submit-icon { width: 16px; height: 16px; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }

/* ── File list transitions ───────────────────────────────────────────────── */
.file-list-enter-active,
.file-list-leave-active { transition: all 0.2s ease; }
.file-list-enter-from { opacity: 0; transform: translateY(-6px); }
.file-list-leave-to { opacity: 0; transform: translateX(10px); }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .form-section.two-col { grid-template-columns: 1fr; }
  .type-grid { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column-reverse; }
  .submit-btn, .cancel-btn { width: 100%; justify-content: center; }
}
</style>