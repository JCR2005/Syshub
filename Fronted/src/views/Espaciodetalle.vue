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

    <main class="detalle-main">
      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="shimmer title-sh"></div>
        <div class="shimmer meta-sh"></div>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="error-state">
        <p>{{ loadError }}</p>
        <button class="back-btn" @click="router.push('/espacios-curso')">Volver</button>
      </div>

      <template v-else-if="espacio">
        <!-- Top nav -->
        <div class="top-nav">
          <button class="back-btn" @click="router.push('/espacios-curso')">
            <svg viewBox="0 0 24 24" class="back-icon"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Espacios de curso
          </button>
          <div class="nav-actions">
            <button
              v-if="!canCreate"
              :class="['join-btn', { joined: isJoined }]"
              @click="toggleJoin"
            >
              {{ isJoined ? 'Salir del curso' : 'Unirme' }}
            </button>
            <button
              v-if="canCreate && espacio.estado === 'activo'"
              class="finalize-btn"
              @click="finalizarCurso"
            >
              Finalizar curso
            </button>
          </div>
        </div>

        <!-- Header -->
        <header class="espacio-header">
          <div class="header-bar" :style="{ background: espacio.curso?.area?.color || '#f59e0b' }"></div>
          <div class="header-content">
            <div class="header-badges">
              <span class="hbadge area-badge" :style="espacio.curso?.area?.color ? { background: espacio.curso.area.color + '22', color: espacio.curso.area.color } : {}">
                {{ espacio.curso?.area?.nombre || 'General' }}
              </span>
              <span class="hbadge semester-badge">{{ espacio.anio }} · Semestre {{ espacio.semestre }}</span>
              <span v-if="espacio.estado === 'finalizado'" class="hbadge final-badge">Finalizado</span>
            </div>
            <h1 class="espacio-title">{{ espacio.curso?.nombre }}</h1>
            <p class="espacio-meta">
              <span>{{ espacio.curso?.codigo }}</span>
              <span class="dot">·</span>
              <span>Auxiliar: {{ espacio.creador?.nombre }}</span>
            </p>
            <div class="header-stats">
              <div class="hstat">
                <svg viewBox="0 0 24 24" class="hstat-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <span>{{ recursos.length }} recursos</span>
              </div>
              <div class="hstat">
                <svg viewBox="0 0 24 24" class="hstat-icon"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <span>{{ repos.length }} repos</span>
              </div>
              <div class="hstat">
                <svg viewBox="0 0 24 24" class="hstat-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                <span>{{ auxiliares.length }} auxiliares</span>
              </div>
              <div class="hstat">
                <svg viewBox="0 0 24 24" class="hstat-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                <span>{{ estudiantes.length }} estudiantes</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Tabs -->
        <div class="tabs-bar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <svg viewBox="0 0 24 24" class="tab-icon" v-html="tab.icon"></svg>
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div v-if="actionError" class="banner error">{{ actionError }}</div>
        <div v-if="actionSuccess" class="banner success">{{ actionSuccess }}</div>

        <!-- ── RECURSOS tab ───────────────────────────────────────────────── -->
        <section v-if="activeTab === 'recursos'" class="tab-content">
          <!-- Upload recurso (auxiliar only) -->
          <div v-if="canCreate" class="action-card">
            <div class="action-card-header">
              <svg viewBox="0 0 24 24" class="ac-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="17 8 12 3 7 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <h3>Subir recurso educativo</h3>
            </div>

          <div class="type-row">
  <button
    v-for="t in tiposRecurso"
    :key="t.id_tipo_recurso"
    :class="['type-btn', { active: newResource.id_tipo_recurso === t.id_tipo_recurso }]"
    type="button"
    @click="newResource.id_tipo_recurso = t.id_tipo_recurso"
  >
    <img 
      v-if="t.icono_svg" 
      :src="`https://api.iconify.design/${t.icono_svg}.svg`" 
      class="type-icon" 
      alt="icon" 
    />
    
    {{ t.nombre_recurso }}
  </button>
</div>

            <div class="form-row">
  <input v-model="newResource.nombre" class="form-input" placeholder="Nombre del recurso *" />
  <input v-model="newResource.url" class="form-input" placeholder="URL o enlace (Opcional si subes archivo)" />
</div>

<input type="file" ref="fileInput" multiple @change="onFileChange" style="display: none;" />

<div 
  class="form-input" 
  style="margin-top: 0.5rem; text-align: center; border: 1px dashed var(--border-color); cursor: pointer; padding: 1rem;" 
  @click="triggerFileSelect"
>
  <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; color: var(--text-muted); margin-bottom: 4px;">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m14-7-5-5-5 5m5-5v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <div style="font-size: 0.8rem; color: var(--text-muted);">
    Haz clic para adjuntar archivos
  </div>
</div>

<div v-if="selectedFiles.length > 0" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem;">
  <div v-for="(f, i) in selectedFiles" :key="i" style="display: flex; justify-content: space-between; background: var(--bg-surface); padding: 0.4rem; border-radius: 6px; font-size: 0.75rem; border: 1px solid var(--border-color);">
    <span>{{ f.name }}</span>
    <button class="danger-sm" style="border: none; padding: 0 0.4rem;" @click.stop="removeFile(i)">X</button>
  </div>
</div>

<textarea v-model="newResource.descripcion" class="form-input form-textarea" placeholder="Descripción (opcional)" rows="2" style="margin-top: 0.5rem;"></textarea>

<div class="form-submit-row">
  <button
    class="publish-btn"
    :disabled="!newResource.nombre || (!newResource.url && selectedFiles.length === 0) || submitting"
    @click="createResource"
  >
    {{ submitting ? 'Publicando...' : 'Publicar recurso' }}
  </button>
</div>
            <textarea v-model="newResource.descripcion" class="form-input form-textarea" placeholder="Descripción (opcional)" rows="2"></textarea>
            <div class="form-submit-row">
              <button
                class="publish-btn"
                :disabled="!newResource.nombre || !newResource.url || submitting"
                @click="createResource"
              >
                {{ submitting ? 'Publicando...' : 'Publicar recurso' }}
              </button>
            </div>
          </div>

          <!-- Resources list -->
          <div v-if="!recursos.length" class="empty-tab">No hay recursos publicados aún.</div>
          <div v-else class="items-list">
            <div v-for="r in recursos" :key="r.id_recurso_espacio ?? r.id" class="item-card">
              <div class="item-icon-wrap" :class="tipoClass(r.tipo?.nombre_recurso)">
                <svg viewBox="0 0 24 24" class="item-icon" v-html="tipoIcon(r.tipo?.nombre_recurso)"></svg>
              </div>
              <div class="item-body">
                <h4 class="item-title">{{ r.nombre }}</h4>
                <p v-if="r.descripcion" class="item-desc">{{ r.descripcion }}</p>
                <a :href="r.url" target="_blank" rel="noopener" class="item-link">
                  Abrir recurso
                  <svg viewBox="0 0 24 24" class="link-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="15 3 21 3 21 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </a>
              </div>
              <span class="item-tipo">{{ r.tipo?.nombre_recurso }}</span>
            </div>
          </div>
        </section>

       <section v-if="activeTab === 'repos'" class="tab-content">
          <div  class="action-card">
            <div class="action-card-header">
              <svg viewBox="0 0 24 24" class="ac-icon"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <h3>Vincular repositorio</h3>
            </div>
            <div class="form-row">
              <select v-model="newRepoId" class="form-input">
                <option value="">Selecciona un repositorio</option>
                <option v-for="repo in myRepos" :key="repo.id" :value="repo.id">{{ repo.nombre }}</option>
              </select>
              <button class="publish-btn" :disabled="!newRepoId" @click="linkRepo">Vincular</button>
            </div>
          </div>

          <div v-if="!repos.length" class="empty-tab">No hay repositorios vinculados.</div>
          <div v-else class="items-list">
            <div v-for="repo in repos" :key="repo.id" class="item-card">
              <div class="item-icon-wrap repo-icon-wrap">
                <svg viewBox="0 0 24 24" class="item-icon"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <div class="item-body">
                <h4 class="item-title">{{ repo.repositorio?.nombre }}</h4>
                <p class="item-desc">{{ repo.repositorio?.descripcion }}</p>
                
                <div v-if="canManageRepos && repo.repositorio?.usuarios?.length > 0" class="highlight-pill" style="margin-top: 5px; display: inline-flex; align-items: center; gap: 4px; background: rgba(245,158,11,0.12); color: #f59e0b;">
                  <svg viewBox="0 0 24 24" style="width: 12px; height: 12px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                  <span>Estudiante: {{ repo.repositorio.usuarios[0].usuario.nombre }}</span>
                </div>
                </div>
              <div class="item-actions">
                <span v-if="repo.destacado" class="highlight-pill">Destacado</span>
                <button v-if="canManageRepos" class="ghost-sm" @click="toggleDestacado(repo)">
                  {{ repo.destacado ? 'Quitar' : 'Destacar' }}
                </button>
              </div>
            </div>
          </div>
        </section>
        <!-- ── AUXILIARES tab ─────────────────────────────────────────────── -->
        <section v-if="activeTab === 'auxiliares'" class="tab-content">
          <div v-if="canManageAux" class="action-card">
            <div class="action-card-header">
              <svg viewBox="0 0 24 24" class="ac-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/><line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <h3>Agregar auxiliar</h3>
            </div>
            <div class="form-row">
              <select v-model="newAuxId" class="form-input">
                <option value="">Selecciona un auxiliar</option>
                <option v-for="aux in auxiliaresDisponibles" :key="aux.id" :value="aux.id">
                  {{ aux.nombre }} · {{ aux.correo }}
                </option>
              </select>
              <button class="publish-btn" :disabled="!newAuxId" @click="addAuxiliar">Agregar</button>
            </div>
          </div>

          <div v-if="!auxiliares.length" class="empty-tab">No hay auxiliares asignados.</div>
          <div v-else class="items-list">
            <div v-for="aux in auxiliares" :key="aux.user?.id ?? aux.id" class="item-card">
              <div class="user-avatar">{{ (aux.user?.nombre || '?').slice(0,1).toUpperCase() }}</div>
              <div class="item-body">
                <h4 class="item-title">{{ aux.user?.nombre }}</h4>
                <p class="item-desc">{{ aux.user?.correoInstitucional }}</p>
              </div>
              <div class="item-actions">
                <span class="role-pill">{{ aux.rol }}</span>
                <button v-if="canManageAux && aux.rol !== 'owner'" class="danger-sm" @click="removeAuxiliar(aux.user?.id ?? aux.id)">
                  Remover
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import { clearAuthSession, getAuthToken, getAuthUser, hasRole, hasRango } from '../utils/authSession'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const router = useRouter()
const route = useRoute()
const espacioId = computed(() => Number(route.params.id))

const userInitials = computed(() => {
  const u = getAuthUser()
  if (!u?.nombre) return 'US'
  return u.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

const canCreate = computed(() => hasRango('auxiliar') || hasRole('admin'))
const currentUserId = computed(() => Number(getAuthUser()?.id ?? 0))



const tiposRecurso = ref([]); // Lista que llenaremos con lo del backend

// Función que llama a tu controlador existente
const fetchTiposRecurso = async () => {
  try {
    // Apuntamos a la ruta que ya tienes en recursos.controller.ts
    // Asegúrate de poner el prefijo correcto de tu API (ej. http://localhost:3000/api/recursos/tipos)
    const response = await fetch('http://localhost:3000/api/recursos/tipos', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}` // Asegúrate de enviar el token porque la ruta usa @UseGuards(JwtAuthGuard)
      }
    }); 
    const data = await response.json();
    
    // Tu controlador devuelve { ok: true, tipos: [...] }
    if (data.ok) {
      tiposRecurso.value = data.tipos; 
    }
  } catch (error) {
    console.error("Error cargando los tipos de recurso:", error);
  }
};

onMounted(() => {
  fetchTiposRecurso();
});
// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(false)
const loadError = ref('')
const actionError = ref('')
const actionSuccess = ref('')
const submitting = ref(false)

const espacio = ref(null)
const recursos = ref([])
const repos = ref([])
const auxiliares = ref([])
const estudiantes = ref([])
const myRepos = ref([])
const catalogo = reactive({ auxiliares: [], tiposRecurso: [] })

const activeTab = ref('recursos')
const newRepoId = ref('')
const newAuxId = ref('')

const newResource = reactive({ nombre: '', descripcion: '', url: '', tipo: 'video' })

// ── Tabs ──────────────────────────────────────────────────────────────────────
const tabs = computed(() => [
  { id: 'recursos', label: 'Recursos', count: recursos.value.length, icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'repos', label: 'Repositorios', count: repos.value.length, icon: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { id: 'auxiliares', label: 'Auxiliares', count: auxiliares.value.length, icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="2"/>' },
])

// ── Resource types ────────────────────────────────────────────────────────────
const resourceTypes = [
  { value: 'video', label: 'Video', icon: '<path d="M23 7l-7 5 7 5V7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="1" y="5" width="15" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { value: 'guia', label: 'Guía', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { value: 'documento', label: 'Doc', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
]

function tipoIcon(nombre) {
  if (!nombre) return resourceTypes[2].icon
  if (/video/i.test(nombre)) return resourceTypes[0].icon
  if (/guia|guía/i.test(nombre)) return resourceTypes[1].icon
  return resourceTypes[2].icon
}

function tipoClass(nombre) {
  if (/video/i.test(nombre || '')) return 'video-icon'
  if (/guia|guía/i.test(nombre || '')) return 'guia-icon'
  return 'doc-icon'
}

// ── Computed ──────────────────────────────────────────────────────────────────
const isJoined = computed(() => {
  if (canCreate.value) return true
  return estudiantes.value.some(e => e.user?.id === currentUserId.value)
})

const canManageAux = computed(() => {
  if (hasRole('admin')) return true
  return auxiliares.value.find(a => (a.user?.id ?? a.id) === currentUserId.value)?.rol === 'owner'
})

const canManageRepos = computed(() => canCreate.value)

const auxiliaresDisponibles = computed(() => {
  const ids = new Set(auxiliares.value.map(a => a.user?.id ?? a.id))
  return catalogo.auxiliares.filter(a => !ids.has(a.id))
})

// ── Nav ───────────────────────────────────────────────────────────────────────
const onNavbarSectionSelect = (s) => {
  if (s === 'dashboard') router.push('/dashboard')
  if (s === 'forum') router.push('/Sysreditt')
  if (s === 'upload') router.push('/upload-repo')
}
const logout = async () => { clearAuthSession(); await router.push('/login') }

// ── API ───────────────────────────────────────────────────────────────────────
const fetchJson = async (url, options = {}) => {
  const token = getAuthToken()
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!res.ok) throw new Error((await res.text()) || 'Error')
  return res.json()
}

function clearMessages() { actionError.value = ''; actionSuccess.value = '' }

async function loadEspacio() {
  loading.value = true
  loadError.value = ''
  try {
    const [detalleRes, recursosRes, reposRes, auxRes, estRes] = await Promise.all([
      fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}`),
      fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/recursos`),
      fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/repos`),
      fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/auxiliares`),
      fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/estudiantes`),
    ])
    const d = detalleRes?.espacio
    espacio.value = d ? { ...d, id: d.id ?? d.id_espacio } : null
    recursos.value = recursosRes?.recursos ?? []
    repos.value = reposRes?.repos ?? []
    auxiliares.value = auxRes?.auxiliares ?? []
    estudiantes.value = estRes?.estudiantes ?? []
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadCatalogo() {
  const data = await fetchJson(`${API_BASE}/curso-espacios/catalogo`)
  const p = data?.catalogo ?? {}
  catalogo.auxiliares = p.auxiliares ?? []
  catalogo.tiposRecurso = p.tiposRecurso ?? []
}

async function loadMyRepos() {
  if (!canCreate.value) return
  try {
    const data = await fetchJson(`${API_BASE}/repositories/mine`)
    myRepos.value = data?.repositories ?? []
  } catch { myRepos.value = [] }
}

async function toggleJoin() {
  clearMessages()
  try {
    if (isJoined.value) {
      await fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/salir`, { method: 'PATCH' })
    } else {
      await fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/unirse`, { method: 'POST' })
    }
    await loadEspacio()
  } catch (e) { actionError.value = e.message }
}

async function finalizarCurso() {
  clearMessages()
  try {
    await fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/estado`, {
      method: 'PATCH', body: JSON.stringify({ estado: 'finalizado' }),
    })
    await loadEspacio()
  } catch (e) { actionError.value = e.message }
}

// Agrega estas variables si no las tienes aún
const selectedFiles = ref([]);
const fileInput = ref(null);

const triggerFileSelect = () => fileInput.value?.click();

const onFileChange = (e) => {
  const files = Array.from(e.target.files || []);
  selectedFiles.value = [...selectedFiles.value, ...files];
  if (fileInput.value) fileInput.value.value = ''; 
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};
const createResource = async () => {
  try {
    submitting.value = true;

    const resRecurso = await fetch(`http://localhost:3000/api/espacios/${espacioId}/recursos`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        nombre: newResource.nombre,             
        url: newResource.url || null,             
        descripcion: newResource.descripcion, 
        id_tipo_recurso: newResource.id_tipo_recurso 
      })
    });

    const dataRecurso = await resRecurso.json();
    const recursoId = dataRecurso.id; 

    // PASO 2: Subir los archivos físicos
    if (recursoId && selectedFiles.value.length > 0) {
      const formData = new FormData();
      selectedFiles.value.forEach(file => {
        formData.append('files', file); 
      });

      await fetch(`http://localhost:3000/api/recursos/${recursoId}/archivos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });
    }

    // Limpiamos los campos nativos de TU formulario (también sin .value si es reactive)
    newResource.nombre = '';
    newResource.url = '';
    newResource.descripcion = '';
    newResource.id_tipo_recurso = null;
    
    selectedFiles.value = [];
    

  } catch (error) {
    actionError.value = "Error al publicar el recurso";
    console.error("Error al publicar:", error);
  } finally {
    submitting.value = false;
  }
};

const fetchRepositorios = async () => {
  if (!espacioId) return;
  try {
    // Esta es la ruta exacta que creamos en tu RepositoriesController
    const response = await fetch(`${API_URL}/repositories/espacio/${espacioId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Asegúrate de mandar el token
      }
    });
    const data = await response.json();
    listaRepositorios.value = data; // Aquí se guarda la lista filtrada que manda el Back
  } catch (error) {
    console.error('Error al cargar repos:', error);
  }
};
async function linkRepo() {
  clearMessages()
  try {
    await fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/repos`, {
      method: 'POST', body: JSON.stringify({ repositorioId: Number(newRepoId.value) }),
    })
    newRepoId.value = ''
    await loadEspacio()
  } catch (e) { actionError.value = e.message }
}

async function toggleDestacado(repo) {
  clearMessages()
  try {
    await fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/repos/${repo.id_repositorio}/destacado`, {
      method: 'PATCH', body: JSON.stringify({ destacado: !repo.destacado }),
    })
    await loadEspacio()
  } catch (e) { actionError.value = e.message }
}

async function addAuxiliar() {
  clearMessages()
  try {
    await fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/auxiliares`, {
      method: 'POST', body: JSON.stringify({ userId: Number(newAuxId.value) }),
    })
    newAuxId.value = ''
    await loadEspacio()
  } catch (e) { actionError.value = e.message }
}

async function removeAuxiliar(userId) {
  clearMessages()
  try {
    await fetchJson(`${API_BASE}/curso-espacios/${espacioId.value}/auxiliares/${userId}/remove`, { method: 'PATCH' })
    await loadEspacio()
  } catch (e) { actionError.value = e.message }
}

onMounted(async () => {
  await Promise.all([loadEspacio(), loadCatalogo(), loadMyRepos()])
})
</script>

<style scoped>
.espacio-shell { min-height: 100vh; background: var(--bg-app); color: var(--text-primary); }

.detalle-main { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; display: grid; gap: 1.25rem; }

/* Loading */
.loading-state { display: grid; gap: 0.75rem; }
.shimmer { border-radius: 10px; background: linear-gradient(90deg, var(--bg-surface) 25%, color-mix(in srgb, var(--bg-surface) 70%, var(--bg-app)) 50%, var(--bg-surface) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.title-sh { height: 48px; width: 70%; }
.meta-sh { height: 20px; width: 45%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Error state */
.error-state { text-align: center; padding: 3rem; display: grid; gap: 1rem; place-items: center; color: var(--text-muted); }

/* Top nav */
.top-nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }

.back-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: none; border: 1px solid var(--border-color); border-radius: 999px;
  color: var(--text-soft); padding: 0.4rem 0.9rem 0.4rem 0.6rem;
  font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
}
.back-btn:hover { border-color: #f59e0b; color: #f59e0b; }
.back-icon { width: 16px; height: 16px; }

.nav-actions { display: flex; gap: 0.5rem; }

.join-btn {
  padding: 0.45rem 1rem; border-radius: 999px; border: 1px solid #f59e0b;
  background: transparent; color: #f59e0b; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
}
.join-btn:hover, .join-btn.joined { background: #f59e0b; color: #fff; }

.finalize-btn {
  padding: 0.45rem 1rem; border-radius: 999px;
  border: 1px solid var(--border-color); background: transparent;
  color: var(--text-soft); font-size: 0.85rem; cursor: pointer;
}

/* Header */
.espacio-header {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  overflow: hidden;
}

.header-bar { height: 5px; width: 100%; }

.header-content { padding: 1.5rem; display: grid; gap: 0.5rem; }

.header-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.hbadge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
.area-badge { background: rgba(148,163,184,0.15); color: var(--text-soft); }
.semester-badge { background: rgba(245,158,11,0.12); color: #f59e0b; }
.final-badge { background: rgba(100,116,139,0.12); color: var(--text-muted); }

.espacio-title { font-size: 1.6rem; font-weight: 800; margin: 0; }

.espacio-meta { font-size: 0.85rem; color: var(--text-muted); margin: 0; display: flex; gap: 0.4rem; flex-wrap: wrap; }
.dot { opacity: 0.4; }

.header-stats { display: flex; gap: 1.25rem; flex-wrap: wrap; margin-top: 0.25rem; }
.hstat { display: flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; color: var(--text-soft); }
.hstat-icon { width: 14px; height: 14px; }

/* Tabs */
.tabs-bar {
  display: flex;
  gap: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 0.5rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #fff; }
.tab-icon { width: 13px; height: 13px; }
.tab-count { background: rgba(0,0,0,0.15); border-radius: 999px; padding: 0.05rem 0.4rem; font-size: 0.7rem; }

/* Banners */
.banner { border-radius: 12px; padding: 0.7rem 1rem; font-size: 0.88rem; }
.banner.error { background: color-mix(in srgb, #ef4444 10%, transparent); border: 1px solid color-mix(in srgb, #ef4444 25%, transparent); color: #f87171; }
.banner.success { background: color-mix(in srgb, #22c55e 10%, transparent); border: 1px solid color-mix(in srgb, #22c55e 25%, transparent); color: #4ade80; }

/* Tab content */
.tab-content { display: grid; gap: 1rem; }

/* Action card */
.action-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem;
  display: grid;
  gap: 0.9rem;
}

.action-card-header { display: flex; align-items: center; gap: 0.6rem; }
.action-card-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; }
.ac-icon { width: 18px; height: 18px; color: #f59e0b; }

.type-row { display: flex; gap: 0.5rem; }

.type-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.type-btn:hover { border-color: #f59e0b; color: #f59e0b; }
.type-btn.active { background: rgba(245,158,11,0.12); border-color: #f59e0b; color: #f59e0b; }
.type-icon { width: 13px; height: 13px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }

.form-input {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: #f59e0b; }
.form-textarea { resize: vertical; min-height: 70px; }

.form-submit-row { display: flex; justify-content: flex-end; }

.publish-btn {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  padding: 0.55rem 1.25rem;
  cursor: pointer;
  font-size: 0.88rem;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.publish-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.publish-btn:hover:not(:disabled) { opacity: 0.88; }

/* Items list */
.empty-tab { color: var(--text-muted); font-size: 0.9rem; padding: 1.5rem; text-align: center; border: 1px dashed var(--border-color); border-radius: 14px; }

.items-list { display: grid; gap: 0.65rem; }

.item-card {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  transition: border-color 0.15s;
}
.item-card:hover { border-color: rgba(245,158,11,0.3); }

.item-icon-wrap {
  width: 38px; height: 38px; border-radius: 10px;
  display: grid; place-items: center; flex-shrink: 0;
}
.video-icon { background: rgba(239,68,68,0.1); }
.video-icon .item-icon { color: #f87171; }
.guia-icon { background: rgba(245,158,11,0.1); }
.guia-icon .item-icon { color: #f59e0b; }
.doc-icon { background: rgba(59,130,246,0.1); }
.doc-icon .item-icon { color: #60a5fa; }
.repo-icon-wrap { background: rgba(124,92,255,0.1); }
.repo-icon-wrap .item-icon { color: var(--accent-500); }
.item-icon { width: 18px; height: 18px; }

.item-body { flex: 1; min-width: 0; display: grid; gap: 0.15rem; }
.item-title { font-size: 0.92rem; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-desc { font-size: 0.78rem; color: var(--text-muted); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.item-link {
  display: inline-flex; align-items: center; gap: 0.3rem;
  color: #f59e0b; font-size: 0.78rem; font-weight: 600; text-decoration: none;
}
.link-icon { width: 11px; height: 11px; }

.item-tipo { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; }

.item-actions { display: flex; gap: 0.4rem; align-items: center; flex-shrink: 0; }

.highlight-pill { background: rgba(245,158,11,0.12); color: #f59e0b; border-radius: 999px; padding: 0.15rem 0.55rem; font-size: 0.72rem; font-weight: 700; }

.ghost-sm { background: none; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-soft); padding: 0.25rem 0.6rem; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; }
.ghost-sm:hover { border-color: #f59e0b; color: #f59e0b; }

.danger-sm { background: none; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #f87171; padding: 0.25rem 0.6rem; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; }
.danger-sm:hover { background: rgba(239,68,68,0.08); }

.role-pill { background: rgba(245,158,11,0.12); color: #f59e0b; border-radius: 999px; padding: 0.15rem 0.55rem; font-size: 0.72rem; font-weight: 700; }

.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #fbbf24); display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .tabs-bar { flex-direction: column; }
  .type-row { flex-wrap: wrap; }
}
</style>