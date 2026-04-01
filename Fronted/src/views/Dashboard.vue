<template>
  <div class="dashboard">
    <nav class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <div class="brand-icon">🎓</div>
          <span class="brand-text">Syshub</span>
        </div>
        <div class="nav-links">
          <button class="nav-link active">Dashboard</button>
          <button class="nav-link">Forum</button>
          <button class="nav-link">Upload Project</button>
        </div>
        <div class="nav-actions">
          <div class="search">
            <span class="search-icon">🔎</span>
            <input type="text" placeholder="Search..." />
          </div>
          <button class="icon-btn">🔔</button>
          <div class="avatar">{{ userInitials }}</div>
        </div>
      </div>
    </nav>

    <main class="content">
      <section class="profile-card">
        <div class="profile-info">
          <div class="profile-avatar">{{ userInitials }}</div>
          <div>
            <h2>{{ profile.nombre || 'Usuario' }}</h2>
            <p class="muted">ID: {{ profile.carnet || 'Sin carnet' }}</p>
            <div class="badges">
              <span
                v-for="rango in rangos"
                :key="rango"
                class="badge"
                :class="badgeClass(rango)"
              >
                {{ rango }}
              </span>
            </div>
          </div>
        </div>
        <div class="profile-actions">
          <button class="primary">Upload Project</button>
          <button class="ghost">Upload Resource</button>
          <button class="ghost">Publish Article</button>
        </div>
      </section>

      <div class="grid">
        <section class="card">
          <header class="card-header">
            <h3>My Projects</h3>
            <button class="link">View all</button>
          </header>
          <div class="list">
            <article v-for="project in myProjects" :key="project.id" class="list-item">
              <div>
                <h4>{{ project.title }}</h4>
                <p class="muted">{{ project.date }}</p>
                <div class="tags">
                  <span v-for="tech in project.tech" :key="tech" class="tag">{{ tech }}</span>
                </div>
              </div>
              <div class="meta">
                <span class="status" :class="project.status">{{ project.status }}</span>
                <span>👍 {{ project.upvotes }}</span>
                <span>💬 {{ project.comments }}</span>
              </div>
            </article>
          </div>
        </section>

        <section class="card">
          <header class="card-header">
            <h3>My Resources</h3>
            <button class="link">View all</button>
          </header>
          <div class="list">
            <article v-for="resource in myResources" :key="resource.id" class="list-item">
              <div>
                <h4>{{ resource.title }}</h4>
                <p class="muted">{{ resource.date }}</p>
              </div>
              <div class="meta">
                <span class="pill">{{ resource.type }}</span>
                <span>👀 {{ resource.views }}</span>
              </div>
            </article>
          </div>
        </section>

        <section class="card">
          <header class="card-header">
            <h3>Projects for Validation</h3>
            <button class="link">Review</button>
          </header>
          <div class="list">
            <article v-for="item in projectsForValidation" :key="item.id" class="list-item">
              <div>
                <h4>{{ item.title }}</h4>
                <p class="muted">{{ item.student }} · {{ item.submittedDate }}</p>
              </div>
              <span class="status pending">pending</span>
            </article>
          </div>
        </section>

        <section class="card">
          <header class="card-header">
            <h3>Reported Content</h3>
            <button class="link">Manage</button>
          </header>
          <div class="list">
            <article v-for="report in reportedContent" :key="report.id" class="list-item">
              <div>
                <h4>{{ report.thread }}</h4>
                <p class="muted">{{ report.reporter }} · {{ report.date }}</p>
              </div>
              <span class="pill danger">{{ report.reason }}</span>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const profile = ref({
  id: null,
  nombre: '',
  carnet: '',
  rangos: []
})

const rangos = computed(() => profile.value.rangos || [])

const userInitials = computed(() => {
  const name = profile.value.nombre || 'Usuario'
  const parts = name.split(' ').filter(Boolean)
  if (!parts.length) return 'U'
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
})

const badgeClass = (rango) => {
  const normalizado = rango.toLowerCase()
  if (normalizado.includes('auxiliar')) {
    return 'badge-aux'
  }
  if (normalizado.includes('moderador')) {
    return 'badge-mod'
  }
  return ''
}

const getStoredUser = () => {
  const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const getToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

const loadProfile = async () => {
  const storedUser = getStoredUser()
  if (!storedUser?.id) {
    return
  }

  try {
    const token = getToken()
    const response = await fetch(`${API_BASE}/users/${storedUser.id}/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })

    if (!response.ok) {
      throw new Error('No se pudo cargar el perfil')
    }

    const data = await response.json().catch(() => null)
    if (data) {
      profile.value = {
        id: data.id ?? storedUser.id,
        nombre: data.nombre ?? storedUser.nombre ?? '',
        carnet: data.carnet ?? '',
        rangos: data.rangos ?? []
      }
    }
  } catch {
    profile.value = {
      id: storedUser.id ?? null,
      nombre: storedUser.nombre ?? '',
      carnet: storedUser.carnet ?? '',
      rangos: []
    }
  }
}

onMounted(loadProfile)
const myProjects = [
  {
    id: 1,
    title: 'Full-Stack E-Commerce Platform',
    date: '2026-03-10',
    status: 'approved',
    upvotes: 42,
    comments: 15,
    tech: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 2,
    title: 'Machine Learning Model for Predictions',
    date: '2026-03-05',
    status: 'pending',
    upvotes: 28,
    comments: 8,
    tech: ['Python', 'TensorFlow']
  }
]

const myResources = [
  {
    id: 1,
    title: 'Advanced React Patterns - Video Tutorial',
    date: '2026-03-12',
    type: 'Video',
    views: 234
  },
  {
    id: 2,
    title: 'Database Design Best Practices Guide',
    date: '2026-03-08',
    type: 'Guide',
    views: 189
  }
]

const projectsForValidation = [
  {
    id: 1,
    title: 'REST API with Authentication',
    student: 'Sarah Chen',
    submittedDate: '2026-03-15',
    status: 'pending'
  },
  {
    id: 2,
    title: 'Mobile Task Manager App',
    student: 'Carlos Rodriguez',
    submittedDate: '2026-03-14',
    status: 'pending'
  }
]

const reportedContent = [
  {
    id: 1,
    type: 'comment',
    thread: 'Help with React Hooks',
    reporter: 'User123',
    reason: 'Spam',
    date: '2026-03-17'
  },
  {
    id: 2,
    type: 'thread',
    thread: 'Off-topic discussion',
    reporter: 'User456',
    reason: 'Inappropriate content',
    date: '2026-03-16'
  }
]
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #0a0a0f;
  color: #f5f5f7;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid #24253a;
  background: #0f1020;
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
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c5cff, #ff5fa0);
  display: grid;
  place-items: center;
}

.brand-text {
  font-size: 1.2rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.nav-link {
  background: transparent;
  border: none;
  color: #b7b8d6;
  cursor: pointer;
  font-weight: 600;
}

.nav-link.active {
  color: #fff;
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
  background: #11121b;
  border: 1px solid #2a2b3c;
  border-radius: 10px;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  color: inherit;
}

.search-icon {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: #9fa0b8;
}

.icon-btn {
  background: #11121b;
  border: 1px solid #2a2b3c;
  border-radius: 10px;
  color: inherit;
  padding: 0.5rem;
  cursor: pointer;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c5cff, #ff5fa0);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.profile-card {
  background: linear-gradient(135deg, #15162b, #11121b);
  border: 1px solid #2a2b3c;
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c5cff, #ff5fa0);
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  font-weight: 700;
}

.badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: rgba(124, 92, 255, 0.2);
  color: #b7b8d6;
  font-size: 0.75rem;
}

.badge-aux {
  background: rgba(255, 196, 0, 0.2);
  color: #facc15;
}

.badge-mod {
  background: rgba(255, 95, 160, 0.2);
  color: #ff5fa0;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.primary {
  background: linear-gradient(90deg, #6aa7ff, #f25f9a);
  border: none;
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.ghost {
  background: transparent;
  border: 1px solid #2a2b3c;
  color: #c9c9d8;
  padding: 0.7rem 1rem;
  border-radius: 12px;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #11121b;
  border: 1px solid #2a2b3c;
  border-radius: 16px;
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
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
}

.meta {
  display: grid;
  gap: 0.3rem;
  text-align: right;
  color: #b7b8d6;
  font-size: 0.85rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(124, 92, 255, 0.15);
  color: #b7b8d6;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
}

.status {
  text-transform: capitalize;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  background: rgba(124, 92, 255, 0.15);
  color: #b7b8d6;
}

.status.approved {
  background: rgba(125, 211, 168, 0.2);
  color: #7dd3a8;
}

.status.pending {
  background: rgba(250, 204, 21, 0.2);
  color: #facc15;
}

.pill {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(124, 92, 255, 0.15);
  font-size: 0.7rem;
  color: #b7b8d6;
}

.pill.danger {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

.link {
  background: none;
  border: none;
  color: #7c5cff;
  cursor: pointer;
  font-weight: 600;
}

.muted {
  color: #9fa0b8;
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

  .list-item {
    flex-direction: column;
  }

  .meta {
    text-align: left;
  }
}
</style>
