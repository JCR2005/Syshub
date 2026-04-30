<template>
  <div class="repository-commits-page">
    <AppNavbar
      :active-section="'dashboard'"
      :avatar-src="''"
      :avatar-initials="'US'"
      :search-value="''"
      @section-select="onSectionSelect"
      @profile="router.push('/profile')"
      @logout="logout"
    />

    <main class="content">
      <button class="back-btn" @click="goBackToRepository">
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" style="display:inline-block; vertical-align:middle; margin-right:6px; margin-top:-2px">
          <path
            d="M15 18l-6-6 6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span style="vertical-align:middle">Volver al repositorio</span>
      </button>

      <section class="commits-card">
        <header class="commits-header">
          <div>
            <p class="eyebrow">Repositorio</p>
            <h1>Historial de commits</h1>
            <p class="muted" v-if="repositoryName">{{ repositoryName }}</p>
          </div>
          <button class="icon-btn" @click="loadCommits" :disabled="isLoading">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 4v6h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>{{ isLoading ? 'Cargando...' : 'Recargar' }}</span>
          </button>
        </header>

        <p v-if="errorMessage" class="state-message error">{{ errorMessage }}</p>
        <p v-else-if="isLoading" class="state-message">Cargando commits...</p>
        <p v-else-if="!commits.length" class="state-message">Aún no hay commits registrados para este repositorio.</p>

        <ol v-else class="timeline">
          <li v-for="commit in commits" :key="`commit-${commit.id}`" class="timeline-item">
            <span class="timeline-dot" aria-hidden="true"></span>
            <article class="commit-card">
              <div class="commit-top-row">
                <strong>#{{ commit.id }}</strong>
                <span class="chip">{{ commit.accion || 'commit' }}</span>
              </div>
              <p class="commit-message">{{ commit.mensaje || 'Sin mensaje' }}</p>
              <p class="commit-meta">
                {{ formatDate(commit.createdAt) }} · {{ commit.usuario?.nombre || commit.usuario?.correoInstitucional || 'Usuario' }}
              </p>

              <div v-if="Array.isArray(commit.archivos) && commit.archivos.length" class="files-block">
                <p class="files-title">Archivos en este commit ({{ commit.archivos.length }})</p>
                <ul>
                  <li v-for="file in commit.archivos" :key="`file-${commit.id}-${file.id}`">
                    <code>{{ file.path || file.nombre || 'archivo' }}</code>
                  </li>
                </ul>
              </div>
            </article>
          </li>
        </ol>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import { clearAuthSession } from '../utils/authSession'

const resolveApiBase = () => {
  const rawBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
  const sanitized = String(rawBase).replace(/\/+$/, '')
  return /\/api$/i.test(sanitized) ? sanitized : `${sanitized}/api`
}

const API_BASE = resolveApiBase()

const router = useRouter()
const route = useRoute()

const commits = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const repositoryName = ref('')

const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

const fetchWithAuth = async (url) => {
  const token = getAuthToken()
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

const formatDate = (value) => {
  if (!value) return 'Fecha no disponible'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const onSectionSelect = (sectionId) => {
  if (sectionId === 'dashboard') {
    router.push('/dashboard')
  }
}

const logout = () => {
  clearAuthSession()
  router.push('/login')
}

const goBackToRepository = () => {
  const repoId = route.params.id
  router.push(`/repositories/${repoId}`)
}

const loadCommits = async () => {
  const repoId = route.params.id
  if (!repoId) {
    errorMessage.value = 'Repositorio inválido.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const [commitsResponse, mineResponse] = await Promise.all([
      fetchWithAuth(`${API_BASE}/repositories/${repoId}/commits`),
      fetchWithAuth(`${API_BASE}/repositories/mine`),
    ])

    if (!commitsResponse.ok) {
      let backendMessage = ''
      try {
        const payload = await commitsResponse.json()
        backendMessage = payload?.message || payload?.error || ''
      } catch {
        backendMessage = ''
      }

      const fallback = `No se pudo cargar el historial de commits (HTTP ${commitsResponse.status}).`
      throw new Error(backendMessage || fallback)
    }

    const commitsPayload = await commitsResponse.json()
    commits.value = Array.isArray(commitsPayload?.commits) ? commitsPayload.commits : []

    if (mineResponse.ok) {
      const minePayload = await mineResponse.json()
      const repositories = Array.isArray(minePayload?.repositories) ? minePayload.repositories : []
      const match = repositories.find((repo) => String(repo?.id) === String(repoId))
      repositoryName.value = match?.nombre || ''
    }
  } catch (error) {
    errorMessage.value = error?.message || 'No se pudieron cargar los commits.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadCommits)
</script>

<style scoped>
.repository-commits-page {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-primary);
}

.content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1.1rem 2rem;
  display: grid;
  gap: 1rem;
}

.back-btn {
  justify-self: start;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
}

.commits-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}

.commits-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.72rem;
  color: var(--text-muted);
}

h1 {
  margin: 0.15rem 0;
  font-size: 1.25rem;
}

.icon-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-app);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.48rem 0.66rem;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  cursor: pointer;
}

.icon-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.state-message {
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  border: 1px dashed var(--border-color);
  color: var(--text-muted);
}

.state-message.error {
  color: #b42318;
  border-color: #fecdca;
  background: #fff1f3;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.timeline-item {
  position: relative;
  padding-left: 1.2rem;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 0.85rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4f46e5;
}

.commit-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-app);
  padding: 0.75rem;
  display: grid;
  gap: 0.5rem;
}

.commit-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
}

.chip {
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.commit-message,
.commit-meta {
  margin: 0;
}

.commit-meta,
.muted {
  color: var(--text-muted);
  font-size: 0.86rem;
}

.files-block {
  border-top: 1px dashed var(--border-color);
  padding-top: 0.55rem;
}

.files-title {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.files-block ul {
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: 0.2rem;
}

.files-block code {
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .commits-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
