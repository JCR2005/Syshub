<template>
  <div class="espacio-shell">
    <AppNavbar
      active-section="dashboard"
      :avatar-initials="userInitials"
      :search-value="''"
      :show-search="false"
      @section-select="onNavbarSectionSelect"
      @profile="router.push('/profile')"
      @logout="logout"
    />

    <main class="create-main">
      <!-- Top bar -->
      <div class="topbar">
        <button class="back-btn" @click="router.push('/espacios-curso')">
          <svg viewBox="0 0 24 24" class="back-icon"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Volver a espacios
        </button>
        <button
          class="publish-btn"
          :disabled="saving || !form.cursoId || !form.semestre || !form.anio"
          @click="submit"
        >
          <svg viewBox="0 0 24 24" class="pub-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          {{ saving ? 'Creando...' : 'Crear espacio' }}
        </button>
      </div>

      <!-- Page header -->
      <div class="page-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" class="h-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </div>
        <div>
          <h1 class="page-title">Nuevo espacio de curso</h1>
          <p class="page-subtitle">Crea un espacio para compartir recursos y repositorios con tus estudiantes.</p>
        </div>
      </div>

      <!-- Banners -->
      <div v-if="errorMsg" class="banner error-banner">
        <svg viewBox="0 0 24 24" class="banner-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="banner success-banner">
        <svg viewBox="0 0 24 24" class="banner-icon"><polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        {{ successMsg }}
      </div>

      <div class="form-layout">
        <!-- Left: main form -->
        <div class="form-card">

          <!-- Curso selector -->
          <div class="form-section">
            <label class="section-label">Curso <span class="req">*</span></label>
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <input
                v-model="cursoSearch"
                class="search-input"
                placeholder="Buscar por código o nombre..."
              />
            </div>

            <div class="curso-grid">
              <button
                v-for="curso in filteredCursos"
                :key="curso.id"
                type="button"
                :class="['curso-btn', { active: form.cursoId === curso.id }]"
                @click="selectCurso(curso)"
                :style="selectedCursoArea?.color && form.cursoId === curso.id
                  ? { borderColor: selectedCursoArea.color, background: selectedCursoArea.color + '18' }
                  : {}"
              >
                <div class="curso-btn-top">
                  <span class="curso-codigo">{{ curso.codigo }}</span>
                  <span v-if="curso.area?.nombre" class="curso-area-chip" :style="{ background: (curso.area?.color || '#94a3b8') + '22', color: curso.area?.color || '#94a3b8' }">
                    {{ curso.area.nombre }}
                  </span>
                </div>
                <p class="curso-nombre">{{ curso.nombre }}</p>
                <small class="curso-semestre">Sem. {{ curso.semestre }}</small>
              </button>
            </div>

            <p v-if="cursoSearch && !filteredCursos.length" class="no-results">
              No se encontraron cursos con "{{ cursoSearch }}"
            </p>
          </div>

          <!-- Semestre buttons -->
          <div class="form-section">
            <label class="section-label">Semestre académico <span class="req">*</span></label>
            <div class="semester-row">
              <button
                type="button"
                :class="['sem-btn', { active: form.semestre === 1 }]"
                @click="form.semestre = 1"
              >
                <svg viewBox="0 0 24 24" class="sem-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <div>
                  <strong>Primer semestre</strong>
                  <small>Enero – Junio</small>
                </div>
              </button>
              <button
                type="button"
                :class="['sem-btn', { active: form.semestre === 2 }]"
                @click="form.semestre = 2"
              >
                <svg viewBox="0 0 24 24" class="sem-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <div>
                  <strong>Segundo semestre</strong>
                  <small>Julio – Diciembre</small>
                </div>
              </button>
            </div>
          </div>

          <!-- Año -->
          <div class="form-section">
            <label class="section-label">Año académico <span class="req">*</span></label>
            <div class="year-input">
              <button type="button" class="year-btn" @click="form.anio = Math.max(2000, form.anio - 1)">
                <svg viewBox="0 0 24 24" class="yr-icon"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <input v-model.number="form.anio" type="number" class="year-field" min="2000" max="2100" />
              <button type="button" class="year-btn" @click="form.anio = Math.min(2100, form.anio + 1)">
                <svg viewBox="0 0 24 24" class="yr-icon"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>

          <!-- Descripción -->
          <div class="form-section">
            <label class="section-label">Descripción <small class="optional">(opcional)</small></label>
            <textarea
              v-model="form.descripcion"
              class="form-textarea"
              placeholder="Describe el enfoque del espacio, temas a tratar, objetivos..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- Right: preview -->
        <div class="preview-panel">
          <div class="preview-label">Vista previa</div>
          <div class="preview-card" :style="previewBarColor">
            <div class="preview-bar"></div>
            <div class="preview-body">
              <div class="preview-badges">
                <span class="preview-badge area">{{ selectedCursoArea?.nombre || 'Área' }}</span>
                <span class="preview-badge sem">{{ form.anio || '—' }} · S{{ form.semestre || '—' }}</span>
              </div>
              <h3 class="preview-title">{{ selectedCurso?.nombre || 'Nombre del curso' }}</h3>
              <p class="preview-code">{{ selectedCurso?.codigo || 'Código' }}</p>
              <div class="preview-footer">
                <div class="preview-stats">
                  <span class="pstat">0 recursos</span>
                  <span class="pstat">0 repos</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedCurso" class="course-info-card">
            <div class="ci-row">
              <span class="ci-label">Área</span>
              <span class="ci-value">{{ selectedCursoArea?.nombre || '—' }}</span>
            </div>
            <div class="ci-row">
              <span class="ci-label">Semestre del plan</span>
              <span class="ci-value">{{ selectedCurso.semestre }}°</span>
            </div>
            <div class="ci-row">
              <span class="ci-label">Pensum</span>
              <span class="ci-value">{{ selectedCurso.pensum || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import { clearAuthSession, getAuthToken, getAuthUser, hasRole, hasRango } from '../utils/authSession'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const router = useRouter()

const userInitials = computed(() => {
  const u = getAuthUser()
  if (!u?.nombre) return 'US'
  return u.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

// Redirect if not auxiliar/admin
onMounted(async () => {
  if (!hasRango('auxiliar') && !hasRole('admin')) {
    router.push('/curso-espacios')
    return
  }
  await loadCatalogo()
})

// ── State ─────────────────────────────────────────────────────────────────────
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const cursos = ref([])
const areas = ref([])
const cursoSearch = ref('')

const form = reactive({
  cursoId: '',
  semestre: null,
  anio: new Date().getFullYear(),
  descripcion: '',
})

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredCursos = computed(() => {
  const q = cursoSearch.value.trim().toLowerCase()
  if (!q) return cursos.value
  return cursos.value.filter(c =>
    c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q)
  )
})

const selectedCurso = computed(() =>
  cursos.value.find(c => c.id === form.cursoId) ?? null
)

const selectedCursoArea = computed(() => {
  const areaId = selectedCurso.value?.areaId
  if (!areaId) return null
  return areas.value.find(a => a.id === areaId) ?? null
})

const previewBarColor = computed(() => {
  const color = selectedCursoArea.value?.color || '#f59e0b'
  return { '--preview-bar-color': color }
})

// ── Navigation ────────────────────────────────────────────────────────────────
const onNavbarSectionSelect = (s) => {
  if (s === 'dashboard') router.push('/dashboard')
  if (s === 'forum') router.push('/Sysreditt')
  if (s === 'upload') router.push('/upload-repo')
}
const logout = async () => { clearAuthSession(); await router.push('/login') }

function selectCurso(curso) {
  form.cursoId = curso.id
}

// ── API ───────────────────────────────────────────────────────────────────────
const fetchJson = async (url, options = {}) => {
  const token = getAuthToken()
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!res.ok) throw new Error((await res.json().then(d => d.message).catch(() => null)) || `Error ${res.status}`)
  return res.json()
}

async function loadCatalogo() {
  try {
    const data = await fetchJson(`${API_BASE}/curso-espacios/catalogo`)
    const p = data?.catalogo ?? {}
    cursos.value = p.cursos ?? []
    areas.value = p.areas ?? []
  } catch (e) {
    errorMsg.value = 'No se pudo cargar el catálogo de cursos.'
  }
}

async function submit() {
  if (!form.cursoId || !form.semestre || !form.anio) return
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const data = await fetchJson(`${API_BASE}/curso-espacios`, {
      method: 'POST',
      body: JSON.stringify({
        cursoId: form.cursoId,
        semestre: form.semestre,
        anio: form.anio,
        descripcion: form.descripcion || undefined,
      }),
    })
    successMsg.value = '¡Espacio creado exitosamente!'
    const id = data?.espacio?.id ?? data?.espacio?.id_espacio
    setTimeout(() => router.push(id ? `/curso-espacios/${id}` : '/curso-espacios'), 1500)
  } catch (e) {
    errorMsg.value = e.message || 'No se pudo crear el espacio.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.espacio-shell { min-height: 100vh; background: var(--bg-app); color: var(--text-primary); }

.create-main { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem 4rem; display: grid; gap: 1.5rem; }

/* Topbar */
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

.back-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: none; border: 1px solid var(--border-color); border-radius: 999px;
  color: var(--text-soft); padding: 0.4rem 0.9rem 0.4rem 0.6rem;
  font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
}
.back-btn:hover { border-color: #f59e0b; color: #f59e0b; }
.back-icon { width: 16px; height: 16px; }

.publish-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border: none; border-radius: 999px; color: #fff;
  font-weight: 700; font-size: 0.9rem; padding: 0.5rem 1.25rem;
  cursor: pointer; transition: opacity 0.2s;
}
.publish-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.publish-btn:hover:not(:disabled) { opacity: 0.88; }
.pub-icon { width: 15px; height: 15px; }

/* Page header */
.page-header { display: flex; align-items: center; gap: 1rem; }

.header-icon {
  width: 52px; height: 52px; border-radius: 16px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  display: grid; place-items: center; flex-shrink: 0;
}
.h-icon { width: 26px; height: 26px; color: #fff; }

.page-title { font-size: 1.65rem; font-weight: 800; margin: 0; }
.page-subtitle { margin: 0.25rem 0 0; color: var(--text-muted); font-size: 0.88rem; }

/* Banners */
.banner { display: flex; align-items: center; gap: 0.5rem; border-radius: 12px; padding: 0.7rem 1rem; font-size: 0.88rem; }
.error-banner { background: color-mix(in srgb, #ef4444 10%, transparent); border: 1px solid color-mix(in srgb, #ef4444 25%, transparent); color: #f87171; }
.success-banner { background: color-mix(in srgb, #22c55e 10%, transparent); border: 1px solid color-mix(in srgb, #22c55e 25%, transparent); color: #4ade80; }
.banner-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Form layout */
.form-layout { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }

.form-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.5rem;
  display: grid;
  gap: 1.5rem;
}

/* Sections */
.form-section { display: grid; gap: 0.75rem; }

.section-label { font-size: 0.82rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.05em; }
.req { color: #f59e0b; }
.optional { color: var(--text-muted); font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 0.78rem; }

/* Curso search */
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--text-muted); }
.search-input {
  width: 100%; background: var(--bg-app); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 0.55rem 0.75rem 0.55rem 2.1rem;
  color: var(--text-primary); font-size: 0.875rem; box-sizing: border-box;
  transition: border-color 0.2s;
}
.search-input:focus { outline: none; border-color: #f59e0b; }

/* Curso grid */
.curso-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.6rem; max-height: 320px; overflow-y: auto; }

.curso-btn {
  padding: 0.75rem;
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-app);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  display: grid;
  gap: 0.25rem;
}
.curso-btn:hover { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.04); }
.curso-btn.active { border-color: #f59e0b; background: rgba(245,158,11,0.08); }

.curso-btn-top { display: flex; align-items: center; justify-content: space-between; gap: 0.25rem; }
.curso-codigo { font-size: 0.72rem; font-weight: 700; color: #f59e0b; }
.curso-area-chip { font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 999px; font-weight: 600; }
.curso-nombre { font-size: 0.82rem; font-weight: 600; margin: 0; color: var(--text-primary); line-height: 1.3; }
.curso-semestre { font-size: 0.72rem; color: var(--text-muted); }

.no-results { font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1rem; }

/* Semester buttons */
.semester-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.sem-btn {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.9rem 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-app);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.sem-btn:hover { border-color: rgba(245,158,11,0.4); }
.sem-btn.active { border-color: #f59e0b; background: rgba(245,158,11,0.08); }
.sem-btn strong { display: block; font-size: 0.85rem; color: var(--text-primary); }
.sem-btn small { font-size: 0.75rem; color: var(--text-muted); }
.sem-icon { width: 20px; height: 20px; color: #f59e0b; flex-shrink: 0; }

/* Year input */
.year-input { display: inline-flex; align-items: center; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: var(--bg-app); width: 160px; }
.year-btn { width: 40px; height: 44px; display: grid; place-items: center; background: transparent; border: none; color: var(--text-soft); cursor: pointer; transition: all 0.15s; }
.year-btn:hover { background: rgba(245,158,11,0.1); color: #f59e0b; }
.yr-icon { width: 14px; height: 14px; }
.year-field { flex: 1; border: none; background: transparent; color: var(--text-primary); text-align: center; font-size: 1rem; font-weight: 700; padding: 0; outline: none; }
.year-field::-webkit-inner-spin-button, .year-field::-webkit-outer-spin-button { -webkit-appearance: none; }

/* Textarea */
.form-textarea { width: 100%; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.65rem 0.8rem; color: var(--text-primary); font-size: 0.875rem; font-family: inherit; resize: vertical; box-sizing: border-box; transition: border-color 0.2s; }
.form-textarea:focus { outline: none; border-color: #f59e0b; }

/* Preview panel */
.preview-panel { display: grid; gap: 0.75rem; position: sticky; top: 1.5rem; }
.preview-label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.preview-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
}

.preview-bar { height: 4px; background: var(--preview-bar-color, #f59e0b); }
.preview-body { padding: 1rem; display: grid; gap: 0.4rem; }
.preview-badges { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.preview-badge { font-size: 0.68rem; padding: 0.15rem 0.5rem; border-radius: 999px; font-weight: 600; }
.preview-badge.area { background: rgba(148,163,184,0.15); color: var(--text-soft); }
.preview-badge.sem { background: rgba(245,158,11,0.12); color: #f59e0b; }
.preview-title { font-size: 0.95rem; font-weight: 700; margin: 0; }
.preview-code { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
.preview-footer { margin-top: 0.25rem; }
.preview-stats { display: flex; gap: 0.75rem; }
.pstat { font-size: 0.72rem; color: var(--text-muted); }

/* Course info card */
.course-info-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 14px; padding: 0.9rem; display: grid; gap: 0.5rem; }
.ci-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; }
.ci-label { color: var(--text-muted); }
.ci-value { font-weight: 600; }

/* Responsive */
@media (max-width: 820px) {
  .form-layout { grid-template-columns: 1fr; }
  .preview-panel { position: static; order: -1; }
  .semester-row { grid-template-columns: 1fr; }
}

@media (max-width: 540px) {
  .curso-grid { grid-template-columns: 1fr; }
}
</style>