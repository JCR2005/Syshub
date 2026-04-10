<template>
  <div class="dashboard">
    <AppNavbar
      :active-section="activeSection"
      :avatar-src="avatarSrc"
      :avatar-initials="initials"
      :search-value="searchQuery"
      @update:searchValue="searchQuery = $event"
      @section-select="selectSection"
      @profile="router.push('/profile')"
      @logout="logout"
    />

    <main class="content">
        <p v-if="isLoading" class="state-message">Cargando perfil...</p>
        <p v-else-if="errorMessage" class="state-message error">{{ errorMessage }}</p>
        <p v-if="comingSoonMessage" class="state-message info">{{ comingSoonMessage }}</p>
        <section class="profile-card">
          <div class="profile-info">
            <div class="profile-avatar">
              <img v-if="avatarSrc" :src="avatarSrc" alt="Avatar" />
              <span v-else>{{ initials }}</span>
            </div>
            <div>
              <h2>{{ profile.nombre || 'Usuario' }}</h2>
              <p class="muted">ID: {{ profile.carnet || 'Pending' }}</p>
              <div class="badges">
            <span
  v-for="rango in profile.rangos"
  :key="rango.id"
  class="badge"
 :class="{ 
    'badge-aux': rango.nombre.toLowerCase() === 'auxiliar', 
    'badge-mod': rango.nombre.toLowerCase() === 'moderador' 
  }"
  
>
  <svg 
    v-if="rango.nombre.toLowerCase() === 'auxiliar'" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    style="width: 14px; height: 14px; margin-right: 4px; display: inline-block; vertical-align: middle;"
  >
  
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
     <svg 
     v-if="rango.nombre.toLowerCase()==='moderador'"
                   viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    style="width: 14px; height: 14px; margin-right: 4px; display: inline-block; vertical-align: middle;"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
               
 
  </svg>
  
  {{ rango.nombre }}
</span>
              </div>
            </div>
          </div>
          <div class="profile-actions">
            <button class="secondary" @click="loadProfile">Refresh</button>
            <button
              v-if="canAccessAdmin"
              class="secondary"
              @click="switchToAdminMode"
                 style="
                background: linear-gradient(135deg, #FF0000 0%, #FC8649 100%);
                color: #fff;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 0.75rem 1.25rem;
                border-radius: 12px;
                font-weight: 700;
                box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.39);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                outline: none;
              "
              onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(245, 158, 11, 0.45)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px 0 rgba(245, 158, 11, 0.39)'">
        
            >
              Ir a administración
            </button>
          <button class="primary" 
            @click="selectSection('upload')"
            style="
              box-shadow: 0 4px 15px rgba(255, 107, 0, 0.4); 
              transition: all 0.3s ease;
              outline: none;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(255, 107, 0, 0.6)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255, 107, 0, 0.4)';"
            >
              <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                <path d="M12 16V4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="m7 9 5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              Crear Proyecto
            </button>
            <button 
              v-if="canAccessAuxiliar"
              @click="selectSection('cargarRecurso')" 
           
              style="
                background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
                color: #fff;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 0.75rem 1.25rem;
                border-radius: 12px;
                font-weight: 700;
                box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.39);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                outline: none;
              "
              onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(245, 158, 11, 0.45)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px 0 rgba(245, 158, 11, 0.39)'">
        
              <svg viewBox="0 0 24 24" aria-hidden="true" 
                  fill="none" stroke="currentColor" stroke-width="2.5" 
                  stroke-linecap="round" stroke-linejoin="round" 
                  style="width: 20px; height: 20px; flex-shrink: 0;">
                <path d="M12 21V7a2 2 0 0 0-2-2H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8" />
                <path d="M12 21V7a2 2 0 0 1 2-2h6a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-8" />
                <path d="M6 9h3" stroke-width="1.5" opacity="0.8" />
                <path d="M15 9h3" stroke-width="1.5" opacity="0.8" />
              </svg>

              <span style="font-family: inherit;">Crear Recurso</span>
            </button>
            <button
              v-if="canAccessAuxiliar"
              class="secondary"
              @click="selectSection('espacios-curso')"
              style="
                border: 1px solid rgba(124, 58, 237, 0.4);
                color: #c4b5fd;
                font-weight: 700;
              "
            >
              Espacios de curso
            </button>
               <button 
              v-if="canAccessModerator"
              @click="selectSection('forum')" 
           
              style="
                background: linear-gradient(135deg, #A80094 0%, #BE0AF5 100%);
                color: #fff;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 0.75rem 1.25rem;
                border-radius: 12px;
                font-weight: 700;
                box-shadow: 0 4px 14px 0 rgb(186 10 245 / 39%);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                outline: none;
              "
              onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(245, 158, 11, 0.45)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px 0 rgba(245, 158, 11, 0.39)'">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  style="width: 18px; height: 18px;"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              <span style="font-family: inherit;">Crear Articulo/Blog</span>
            </button>
          </div>
        </section>

        <div class="dashboard-grid">
          <section class="card card-projects">
            <header class="card-header">
              <h3>My Projects</h3>
              <button class="link" @click="searchQuery = ''">View All</button>
            </header>
            <div class="list">
              <article
                v-for="project in filteredProjects"
                :key="project.id"
                class="list-item list-item-clickable"
                role="button"
                tabindex="0"
                @click="openRepository(project.id)"
                @keydown.enter="openRepository(project.id)"
              >
                <div>
                  <h4>{{ project.title }}</h4>
                  <p class="muted meta-line">{{ project.date }} · {{ project.upvotes }} upvotes · {{ project.comments }} comments</p>
                  <div class="tags">
                    <span v-for="tech in project.tech" :key="tech" class="tag">{{ tech }}</span>
                  </div>
                </div>
                <span class="status" :class="project.status">
                  <svg v-if="project.status === 'approved'" viewBox="0 0 24 24" class="status-icon" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" class="status-icon" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
                    <path d="M12 7v5l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  {{ project.status }}
                </span>
              </article>
              <p v-if="!filteredProjects.length" class="empty-state">
                No projects match your search.
              </p>
            </div>
          </section>

          <div class="side-column">
            <section class="card">
              <header class="card-header">
                <h3>Forum Activity</h3>
              </header>
              <div class="list">
                <article v-for="thread in filteredForumActivity" :key="thread.id" class="list-item">
                  <div>
                    <h4>{{ thread.title }}</h4>
                    <p class="muted">{{ thread.upvotes }} upvotes</p>
                  </div>
                  <span class="meta">{{ thread.comments }} comments</span>
                </article>
                <p v-if="!filteredForumActivity.length" class="empty-state">
                  No forum threads match your search.
                </p>
              </div>
              <button class="ghost ghost-full" @click="selectSection('forum')">View Forum</button>
            </section>

            <section class="card">
              <header class="card-header">
                <h3>Your Stats</h3>
              </header>
              <div class="stats">
                <div class="stat-item">
                  <span class="muted">Total Projects</span>
                  <strong>{{ stats.totalProjects }}</strong>
                </div>
                <div class="stat-item">
                  <span class="muted">Total Upvotes</span>
                  <strong>{{ stats.totalUpvotes }}</strong>
                </div>
                <div class="stat-item">
                  <span class="muted">Total Comments</span>
                  <strong>{{ stats.totalComments }}</strong>
                </div>
              </div>
            </section>
          </div>
        </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  hasRole,
  hasRango,
  setActiveMode,
} from '../utils/authSession'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '')
const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const activeSection = ref('dashboard')
const comingSoonMessage = ref('')
const repositories = ref([])
const profile = ref({
  id: null,
  correoInstitucional: '',
  nombre: '',
  edad: null,
  carnet: '',
  rangos: []
})
const avatarUrl = ref('')
const avatarSrc = computed(() => {
  if (!avatarUrl.value) return ''
  if (avatarUrl.value.startsWith('http')) return avatarUrl.value
  return `${SERVER_BASE}${avatarUrl.value}`
})

const canAccessAdmin = computed(() => hasRole('admin'))
const canAccessModerator = computed(() => hasRango('moderador'))
const canAccessAuxiliar = computed(() => hasRango('auxiliar'))

const initials = computed(() => {
  if (!profile.value?.nombre) return 'US'
  return profile.value.nombre     
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const loadProfile = async () => {
  const authUser = getAuthUser()
  if (!authUser?.id) {
    await router.push('/login')
    return
  }
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${API_BASE}/users/profile/${authUser.id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    if (!response.ok) {
      await router.push('/login')
      return
    }

    const data = await response.json()
    profile.value = data
    avatarUrl.value = data.rutaFotoPerfil || ''

    if (!data.nombre || !data.edad || !data.carnet) {
      await router.push('/complete-profile')
    }
  } catch (error) {
    errorMessage.value = 'No se pudo cargar el perfil. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

const showComingSoon = (message) => {
  comingSoonMessage.value = message
  setTimeout(() => {
    if (comingSoonMessage.value === message) {
      comingSoonMessage.value = ''
    }
  }, 2600)
}

const selectSection = (section) => {
  activeSection.value = section
  if (section === 'dashboard') return
  if (section === 'forum') {
    router.push('/Sysreditt')
      return
    return
  }
  // Navigate to the upload route instead of showing a "coming soon" message.
  if (section === 'upload') {
    router.push('/upload-repo')
    return
  }

  if (section === 'cargarRecurso' && canAccessAuxiliar.value) {
    router.push('/cargarRecurso')
    return
  }
  if (section === 'espacios-curso' && canAccessAuxiliar.value) {
    router.push('/espacios-curso')
    return
  }
  showComingSoon('Subir proyecto estará disponible en el siguiente sprint.')
}

const logout = async () => {
  clearAuthSession()
  await router.push('/login')
}

const switchToAdminMode = async () => {
  const changed = setActiveMode('admin')
  if (!changed) {
    await router.push('/login')
    return
  }

  await router.push('/admin')
}

const openRepository = (repositoryId) => {
  router.push(`/repositories/${repositoryId}`)
}

const loadRepositories = async () => {
  const token = getAuthToken()
  if (!token) return

  try {
    const response = await fetch(`${API_BASE}/repositories/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) return
    const data = await response.json()
    const rows = Array.isArray(data?.repositories) ? data.repositories : []

    repositories.value = rows.map((repo) => ({
      id: repo.id,
      title: repo.nombre,
      date: `#${repo.id}`,
      status: 'approved',
      upvotes: 0,
      comments: 0,
      tech: [...(repo.stacks || []), ...(repo.tags || [])],
    }))
  } catch {
    // keep dashboard usable even if repository list fails
  }
}

onMounted(async () => {
  await loadProfile()
  await loadRepositories()
})

const forumActivity = [
  {
    id: 1,
    title: 'How to optimize React performance?',
    upvotes: 24,
    comments: 12
  },
  {
    id: 2,
    title: 'Database normalization best practices',
    upvotes: 18,
    comments: 8
  }
]

const filteredProjects = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return repositories.value
  return repositories.value.filter((project) => {
    const titleMatch = project.title.toLowerCase().includes(query)
    const techMatch = project.tech.some((tech) => tech.toLowerCase().includes(query))
    return titleMatch || techMatch
  })
})

const filteredForumActivity = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return forumActivity
  return forumActivity.filter((thread) => thread.title.toLowerCase().includes(query))
})

const stats = computed(() => {
  const totalProjects = repositories.value.length
  const totalUpvotes = repositories.value.reduce((sum, project) => sum + project.upvotes, 0)
  const totalComments = repositories.value.reduce((sum, project) => sum + project.comments, 0)
  return {
    totalProjects,
    totalUpvotes,
    totalComments,
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-primary);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-surface) 90%, transparent);
  backdrop-filter: blur(8px);
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.brand-text {
  font-size: 1.2rem;
  background: linear-gradient(130deg, var(--accent-500), var(--accent-400));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.nav-link {
  background: transparent;
  border: none;
  color: var(--text-soft);
  cursor: pointer;
  font-weight: 600;
  padding: 0.35rem 0.55rem;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.active {
  color: var(--text-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search {
  position: relative;
}

.search input {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  color: inherit;
}

.search-icon {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  color: var(--text-muted);
}

.icon-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: inherit;
  padding: 0.5rem;
  cursor: pointer;
  position: relative;
}

.notify-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent-400);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  font-weight: 700;
  border: none;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-soft);
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.profile-card {
  background: linear-gradient(145deg, color-mix(in srgb, var(--bg-surface) 90%, var(--bg-surface-alt)), color-mix(in srgb, var(--bg-surface-alt) 78%, transparent));
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-strong);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  font-weight: 700;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.state-message {
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.state-message.error {
  color: var(--error);
}

.state-message.info {
  color: var(--info);
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
}

.badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-500);
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-aux {
  background: rgba(255, 196, 0, 0.2);
  color: #ff9901;
}

.badge-mod {
  background: rgba(255, 95, 160, 0.2);
  color: #ff5fa0;
}

.primary {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  color: var(--accent-contrast);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.secondary {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-soft);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-soft);
  padding: 0.7rem 1rem;
  border-radius: 12px;
  cursor: pointer;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.side-column {
  display: grid;
  gap: 1.5rem;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
  transition: border-color 0.2s ease, transform 0.15s ease;
}

.card:hover {
  border-color: color-mix(in srgb, var(--accent-500) 30%, var(--border-color));
}

.card-projects {
  min-height: 300px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list {
  display: grid;
  gap: 1rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.list-item-clickable {
  cursor: pointer;
  border-radius: 12px;
  padding: 0.4rem;
  transition: border-color 0.18s ease, transform 0.18s ease, background 0.18s ease;
  border: 1px solid transparent;
}

.list-item-clickable:hover,
.list-item-clickable:focus-visible {
  border-color: var(--accent-500);
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--accent-500) 8%, transparent);
  outline: none;
}

.meta-line {
  margin-top: 0.2rem;
}

.empty-state {
  color: var(--text-muted);
  font-size: 0.9rem;
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  padding: 0.75rem;
}

.meta {
  color: var(--text-soft);
  font-size: 0.85rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  background: var(--accent-soft);
  color: var(--accent-500);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  text-transform: capitalize;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  background: var(--accent-soft);
  color: var(--accent-500);
}

.status-icon {
  width: 12px;
  height: 12px;
}

.status.approved {
  background: var(--success-soft);
  color: var(--success);
}

.status.pending {
  background: rgba(250, 204, 21, 0.2);
  color: var(--warning);
}

.pill {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(124, 92, 255, 0.15);
  font-size: 0.7rem;
  color: var(--text-soft);
}

.link {
  background: none;
  border: none;
  color: var(--accent-500);
  cursor: pointer;
  font-weight: 600;
}

.ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-soft);
  padding: 0.6rem 1rem;
  border-radius: 12px;
  cursor: pointer;
}

.ghost-full {
  width: 100%;
}

.stats {
  display: grid;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.stat-item strong {
  font-size: 1.2rem;
}

.muted {
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .nav-actions {
    width: 100%;
    justify-content: space-between;
  }

  .search {
    flex: 1;
  }

  .profile-card {
    align-items: flex-start;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .list-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
