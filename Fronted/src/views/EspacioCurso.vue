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

    <div class="syscourse">
      <div class="layout">

        <!-- ── Sidebar ─────────────────────────────────────────────────────── -->
        <aside class="sidebar">

          <!-- Área técnica -->
          <div class="sidebar-card">
            <div class="sidebar-card-header">
              <svg viewBox="0 0 24 24" class="sidebar-icon accent"><path d="M4 6h16M4 12h16M4 18h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span>Área técnica</span>
            </div>
            <div class="area-chips">
              <button
                v-for="area in areas"
                :key="area.id"
                :class="['area-chip', { active: selectedArea === area.id }]"
                @click="selectArea(area.id)"
                :style="area.color && selectedArea !== area.id ? { borderColor: area.color + '55', color: area.color } : {}"
              >
                <span class="area-dot" :style="{ background: area.color || 'var(--accent-500)' }"></span>
                {{ area.name }}
                <span class="area-count">{{ area.count }}</span>
              </button>
            </div>

            <button v-if="canCreate" class="new-space-btn" @click="router.push('/curso-espacios/crear')">
              <svg viewBox="0 0 24 24" class="btn-icon"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Nuevo espacio
            </button>
          </div>

          <!-- Filtros -->
          <div class="sidebar-card">
            <div class="sidebar-card-header">
              <svg viewBox="0 0 24 24" class="sidebar-icon accent"><path d="M3 6h18M6 12h12M10 18h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span>Filtros</span>
            </div>

            <!-- Semestre — botones -->
            <div class="filter-group">
              <span class="filter-label">Semestre</span>
              <div class="semester-btns">
                <button
                  :class="['sem-btn', { active: filters.semestre === '' }]"
                  @click="filters.semestre = ''"
                >Todos</button>
                <button
                  :class="['sem-btn', { active: filters.semestre === 1 }]"
                  @click="filters.semestre = 1"
                >1er semestre</button>
                <button
                  :class="['sem-btn', { active: filters.semestre === 2 }]"
                  @click="filters.semestre = 2"
                >2do semestre</button>
              </div>
            </div>

            <!-- Año — con +/- -->
            <div class="filter-group">
              <span class="filter-label">Año</span>
              <div class="year-input">
                <button class="year-btn" @click="filters.anio = Math.max(2000, (filters.anio || currentYear) - 1)">
                  <svg viewBox="0 0 24 24" class="yr-icon"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
                <input
                  v-model.number="filters.anio"
                  type="number"
                  class="year-field"
                  min="2000"
                  max="2100"
                  :placeholder="String(currentYear)"
                />
                <button class="year-btn" @click="filters.anio = Math.min(2100, (filters.anio || currentYear) + 1)">
                  <svg viewBox="0 0 24 24" class="yr-icon"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>

            <!-- Curso -->
            <div class="filter-group">
              <span class="filter-label">Curso</span>
              <select v-model="filters.cursoId" class="filter-select">
                <option value="">Todos los cursos</option>
                <option v-for="curso in catalogo.cursos" :key="curso.id" :value="curso.id">
                  {{ curso.codigo }} · {{ curso.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-actions">
              <button class="apply-btn" @click="loadEspacios">
                <svg viewBox="0 0 24 24" class="btn-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Aplicar
              </button>
              <button class="clear-btn" @click="clearFilters">Limpiar</button>
            </div>
          </div>

          <!-- Auxiliar tools -->
          <div class="sidebar-card role-card" v-if="canCreate">
            <div class="sidebar-card-header">
              <svg viewBox="0 0 24 24" class="sidebar-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span>Auxiliar</span>
            </div>
            <div class="role-actions">
              <button class="role-action-btn" @click="router.push('/curso-espacios/crear')">
                <svg viewBox="0 0 24 24" class="ra-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                Crear espacio de curso
              </button>
              <button class="role-action-btn" @click="router.push('/cargarRecurso')">
                <svg viewBox="0 0 24 24" class="ra-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="17 8 12 3 7 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Subir recurso global
              </button>
            </div>
          </div>
        </aside>

        <!-- ── Main feed ───────────────────────────────────────────────────── -->
        <main class="feed">
          <div class="feed-header">
            <div>
              <h2 class="feed-title">Espacios de Curso</h2>
              <p class="feed-subtitle">Recursos, repositorios y auxiliares por curso académico.</p>
            </div>
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <input v-model="searchQuery" class="search-input" placeholder="Buscar curso..." />
            </div>
          </div>

          <!-- Active filters pills -->
          <div v-if="hasActiveFilters" class="active-filters">
            <span class="filters-label">Filtros activos:</span>
            <span v-if="filters.semestre" class="filter-pill">
              {{ filters.semestre === 1 ? '1er Semestre' : '2do Semestre' }}
              <button @click="filters.semestre = ''">×</button>
            </span>
            <span v-if="filters.anio" class="filter-pill">
              {{ filters.anio }}
              <button @click="filters.anio = null">×</button>
            </span>
            <span v-if="filters.cursoId" class="filter-pill">
              {{ catalogo.cursos.find(c => c.id === filters.cursoId)?.codigo }}
              <button @click="filters.cursoId = ''">×</button>
            </span>
            <span v-if="selectedArea !== 'all'" class="filter-pill">
              {{ areas.find(a => a.id === selectedArea)?.name }}
              <button @click="selectedArea = 'all'">×</button>
            </span>
          </div>

          <div v-if="errorMsg" class="banner error">{{ errorMsg }}</div>

          <div v-if="loading" class="loading-grid">
            <div v-for="n in 6" :key="n" class="skeleton-card"></div>
          </div>

          <div v-else-if="!filteredEspacios.length" class="empty-feed">
            <svg viewBox="0 0 24 24" class="empty-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 15s1.5-2 4-2 4 2 4 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <p>No hay espacios disponibles con estos filtros.</p>
            <button class="clear-btn" @click="clearFilters">Limpiar filtros</button>
          </div>

          <div v-else class="course-grid">
            <article
              v-for="espacio in filteredEspacios"
              :key="espacio.id"
              class="course-card"
              @click="openEspacio(espacio.id)"
              tabindex="0"
              @keydown.enter="openEspacio(espacio.id)"
            >
              <!-- Color bar by area -->
              <div class="card-bar" :style="{ background: espacio.curso?.area?.color || 'var(--accent-500)' }"></div>

              <div class="card-body">
                <div class="card-badges">
                  <span class="badge area-badge" :style="espacio.curso?.area?.color ? { background: espacio.curso.area.color + '22', color: espacio.curso.area.color } : {}">
                    {{ espacio.curso?.area?.nombre || 'General' }}
                  </span>
                  <span class="badge semester-badge">
                    {{ espacio.anio }} · S{{ espacio.semestre }}
                  </span>
                  <span v-if="espacio.estado === 'finalizado'" class="badge finalizado-badge">Finalizado</span>
                </div>

                <h3 class="card-title">{{ espacio.curso?.nombre ?? 'Curso' }}</h3>
                <p class="card-code">{{ espacio.curso?.codigo }}</p>

                <div class="card-footer">
                  <div class="card-stats">
                    <span class="stat">
                      <svg viewBox="0 0 24 24" class="stat-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      {{ espacio.recursosCount ?? 0 }}
                    </span>
                    <span class="stat">
                      <svg viewBox="0 0 24 24" class="stat-icon"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      {{ espacio.reposCount ?? 0 }}
                    </span>
                  </div>
                  <svg viewBox="0 0 24 24" class="card-arrow"><polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import { clearAuthSession, getAuthToken, getAuthUser, hasRole, hasRango } from '../utils/authSession'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const router = useRouter()
const currentYear = new Date().getFullYear()

const userInitials = computed(() => {
  const user = getAuthUser()
  if (!user?.nombre) return 'US'
  return user.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

const canCreate = computed(() => hasRango('auxiliar') || hasRole('admin'))

// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(false)
const errorMsg = ref('')
const espacios = ref([])
const searchQuery = ref('')
const selectedArea = ref('all')
const catalogo = reactive({ cursos: [], tiposRecurso: [], auxiliares: [] })

const filters = reactive({
  cursoId: '',
  anio: null,
  semestre: '',
})

// ── Areas computed from espacios ──────────────────────────────────────────────
const areas = computed(() => {
  const map = new Map()
  espacios.value.forEach(e => {
    const nombre = e.curso?.area?.nombre ?? 'General'
    const color = e.curso?.area?.color ?? null
    const id = nombre
    map.set(id, { id, name: nombre, color, count: (map.get(id)?.count || 0) + 1 })
  })
  const items = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  return [{ id: 'all', name: 'Todo', color: null, count: espacios.value.length }, ...items]
})

const hasActiveFilters = computed(() =>
  filters.semestre !== '' || filters.anio || filters.cursoId || selectedArea.value !== 'all'
)

const filteredEspacios = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return espacios.value.filter(e => {
    if (selectedArea.value !== 'all') {
      const area = e.curso?.area?.nombre ?? 'General'
      if (area !== selectedArea.value) return false
    }
    if (!q) return true
    return `${e.curso?.codigo ?? ''} ${e.curso?.nombre ?? ''}`.toLowerCase().includes(q)
  })
})

// ── Navigation ────────────────────────────────────────────────────────────────
const onNavbarSectionSelect = (section) => {
  if (section === 'dashboard') router.push('/dashboard')
  if (section === 'forum') router.push('/Sysreditt')
  if (section === 'upload') router.push('/upload-repo')
}
const logout = async () => { clearAuthSession(); await router.push('/login') }

const openEspacio = (id) => {
  router.push(`/curso-espacios/${id}`);
};
function selectArea(id) {
  selectedArea.value = id
}

function clearFilters() {
  filters.cursoId = ''
  filters.anio = null
  filters.semestre = ''
  selectedArea.value = 'all'
  searchQuery.value = ''
}

// ── API ───────────────────────────────────────────────────────────────────────
const fetchJson = async (url, options = {}) => {
  const token = getAuthToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) throw new Error((await res.text()) || 'Error en la solicitud')
  return res.json()
}

const loadCatalogo = async () => {
  const data = await fetchJson(`${API_BASE}/curso-espacios/catalogo`)
  const payload = data?.catalogo ?? {}
  catalogo.cursos = payload.cursos ?? []
  catalogo.tiposRecurso = payload.tiposRecurso ?? []
  catalogo.auxiliares = payload.auxiliares ?? []
}

const loadEspacios = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = new URLSearchParams()
    if (filters.cursoId) params.append('cursoId', String(filters.cursoId))
    if (filters.anio) params.append('anio', String(filters.anio))
    if (filters.semestre) params.append('semestre', String(filters.semestre))
    const data = await fetchJson(`${API_BASE}/curso-espacios?${params}`)
    espacios.value = data?.espacios ?? []
  } catch (e) {
    errorMsg.value = e.message || 'No se pudieron cargar los espacios'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCatalogo()
  await loadEspacios()
})
</script>

<style scoped>
.espacio-shell { min-height: 100vh; background: var(--bg-app); color: var(--text-primary); }

.syscourse { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem 3rem; }

.layout { display: grid; gap: 1.5rem; grid-template-columns: 260px 1fr; align-items: start; }

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
.sidebar { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 1.5rem; }

.sidebar-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem 1.1rem;
  display: grid;
  gap: 0.75rem;
}

.sidebar-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.sidebar-icon { width: 16px; height: 16px; color: var(--text-muted); }
.sidebar-icon.accent { color: #f59e0b; }

/* ── Area chips ──────────────────────────────────────────────────────────── */
.area-chips { display: flex; flex-direction: column; gap: 0.25rem; }

.area-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.area-chip:hover { background: color-mix(in srgb, #f59e0b 8%, transparent); }

.area-chip.active {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  font-weight: 600;
  border-color: rgba(245, 158, 11, 0.3);
}

.area-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.area-count {
  margin-left: auto;
  background: var(--bg-app);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.new-space-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.65rem;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.new-space-btn:hover { opacity: 0.88; }
.btn-icon { width: 15px; height: 15px; }

/* ── Filters ─────────────────────────────────────────────────────────────── */
.filter-group { display: grid; gap: 0.4rem; }
.filter-label { font-size: 0.78rem; font-weight: 600; color: var(--text-soft); }

.semester-btns { display: flex; flex-direction: column; gap: 0.3rem; }

.sem-btn {
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.82rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.sem-btn:hover { border-color: #f59e0b; color: #f59e0b; }

.sem-btn.active {
  background: rgba(245, 158, 11, 0.12);
  border-color: #f59e0b;
  color: #f59e0b;
  font-weight: 600;
}

.year-input {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-app);
}

.year-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: transparent;
  border: none;
  color: var(--text-soft);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.year-btn:hover { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.yr-icon { width: 14px; height: 14px; }

.year-field {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  text-align: center;
  font-size: 0.875rem;
  padding: 0;
  outline: none;
  min-width: 0;
}

.year-field::-webkit-inner-spin-button,
.year-field::-webkit-outer-spin-button { -webkit-appearance: none; }

.filter-select {
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-app);
  color: var(--text-primary);
  font-size: 0.82rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus { outline: none; border-color: #f59e0b; }

.filter-actions { display: flex; gap: 0.5rem; }

.apply-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: #f59e0b;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.5rem;
  cursor: pointer;
  transition: opacity 0.15s;
}

.apply-btn:hover { opacity: 0.88; }

.clear-btn {
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-soft);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.clear-btn:hover { border-color: #f87171; color: #f87171; }

/* ── Role card ───────────────────────────────────────────────────────────── */
.role-card { border-color: rgba(245, 158, 11, 0.25); }

.role-actions { display: flex; flex-direction: column; gap: 0.4rem; }

.role-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 10px;
  color: #f59e0b;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.role-action-btn:hover { background: rgba(245, 158, 11, 0.15); }
.ra-icon { width: 14px; height: 14px; flex-shrink: 0; }

/* ── Feed ────────────────────────────────────────────────────────────────── */
.feed { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }

.feed-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.feed-title { font-size: 1.6rem; font-weight: 800; margin: 0; }
.feed-subtitle { margin: 0.3rem 0 0; color: var(--text-muted); font-size: 0.88rem; }

.search-wrap { position: relative; }
.search-icon {
  position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%);
  width: 15px; height: 15px; color: var(--text-muted);
}
.search-input {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.5rem 0.75rem 0.5rem 2.1rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  width: 200px;
  transition: border-color 0.2s;
}
.search-input:focus { outline: none; border-color: #f59e0b; }

/* Active filters */
.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.8rem;
}
.filters-label { color: var(--text-muted); }
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-weight: 600;
}
.filter-pill button {
  background: none; border: none; color: inherit; cursor: pointer;
  font-size: 0.85rem; padding: 0; line-height: 1;
}

/* Error banner */
.banner.error {
  background: color-mix(in srgb, #ef4444 10%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 25%, transparent);
  color: #f87171;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  font-size: 0.88rem;
}

/* Skeleton loader */
.loading-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.skeleton-card {
  height: 140px;
  border-radius: 16px;
  background: linear-gradient(90deg, var(--bg-surface) 25%, color-mix(in srgb, var(--bg-surface) 70%, var(--bg-app)) 50%, var(--bg-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Empty state */
.empty-feed {
  text-align: center;
  padding: 3rem;
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
}
.empty-icon { width: 48px; height: 48px; }

/* ── Course grid ─────────────────────────────────────────────────────────── */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.course-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-3px);
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.card-bar { height: 4px; width: 100%; }

.card-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }

.card-badges { display: flex; gap: 0.35rem; flex-wrap: wrap; }

.badge {
  font-size: 0.68rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}

.area-badge { background: rgba(148,163,184,0.15); color: var(--text-soft); }
.semester-badge { background: rgba(245,158,11,0.12); color: #f59e0b; }
.finalizado-badge { background: rgba(100,116,139,0.15); color: var(--text-muted); }

.card-title { font-size: 0.95rem; font-weight: 700; margin: 0.15rem 0 0; line-height: 1.3; }
.card-code { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

.card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.6rem; }

.card-stats { display: flex; gap: 0.75rem; }

.stat { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; color: var(--text-muted); }
.stat-icon { width: 12px; height: 12px; }

.card-arrow { width: 16px; height: 16px; color: var(--text-muted); }

/* Responsive */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .course-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 540px) {
  .course-grid { grid-template-columns: 1fr; }
}
</style>