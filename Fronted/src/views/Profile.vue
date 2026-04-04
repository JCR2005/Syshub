<template>
  <div class="profile-shell">
    <header class="page-header">
      <div>
        <h2>Mi Perfil</h2>
        <p class="muted">Gestiona tu información y revisa tu actividad</p>
      </div>
      <button class="ghost ghost-pill" type="button" @click="router.push('/dashboard')">
        Volver al Dashboard
      </button>
    </header>

    <div class="profile-layout">
      <section class="profile-card">
        <div class="profile-header">
          <div class="avatar-block">
            <div class="avatar-preview">
              <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" />
              <span v-else>{{ initials }}</span>
            </div>
            <div>
              <h3>{{ nombre || 'Usuario' }}</h3>
              <p class="muted">{{ carnet ? `CS-${carnet}` : 'ID pendiente' }}</p>
              <span class="badge">Student</span>
            </div>
          </div>
          <button class="ghost ghost-pill" type="button" @click="toggleEdit">
            <span class="edit-icon">✎</span>
            {{ isEditing ? 'Cancelar' : 'Editar' }}
          </button>
        </div>

        <div v-if="!isEditing" class="profile-details">
          <div class="detail-item">
            <span class="detail-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.8" />
                <path d="M4 6l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <span class="label">Email</span>
              <span>{{ correo }}</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 7l9-4 9 4-9 4-9-4z" fill="none" stroke="currentColor" stroke-width="1.8" />
                <path d="M5 10v5c0 2.2 3.1 4 7 4s7-1.8 7-4v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <span class="label">Carrera</span>
              <span>Ingeniería de Sistemas</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 4h14v16H5z" fill="none" stroke="currentColor" stroke-width="1.8" />
                <path d="M9 4v16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <span class="label">Semestre</span>
              <span>7° Semestre</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" fill="none" stroke="currentColor" stroke-width="1.8" />
                <circle cx="12" cy="11" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8" />
              </svg>
            </span>
            <div>
              <span class="label">Campus</span>
              <span>La Paz</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 4h14v16H5z" fill="none" stroke="currentColor" stroke-width="1.8" />
                <path d="M8 2v4M16 2v4M5 9h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <span class="label">Miembro desde</span>
              <span>Marzo 2023</span>
            </div>
          </div>
          <div class="detail-item full">
            <span class="label">Biografía</span>
            <span>
              Apasionado por el desarrollo web y la inteligencia artificial. Me encanta colaborar en proyectos
              open source.
            </span>
          </div>
          <div class="detail-item full">
            <span class="label">Enlaces Sociales</span>
            <div class="social-links">
              <span>GitHub</span>
              <span>@usuario</span>
              <span>LinkedIn</span>
              <span>@usuario-dev</span>
            </div>
          </div>
        </div>

        <form v-else class="profile-form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="correo">Correo institucional</label>
            <input id="correo" type="email" :value="correo" disabled />
          </div>
          <div class="field">
            <label for="nombre">Nombre completo</label>
            <input id="nombre" v-model.trim="nombre" type="text" required />
          </div>
          <div class="field">
            <label for="edad">Edad</label>
            <input id="edad" v-model.number="edad" type="number" min="15" max="120" required />
          </div>
          <div class="field">
            <label for="carnet">Carnet</label>
            <input id="carnet" v-model.trim="carnet" type="text" required />
          </div>

          <div class="avatar-actions">
            <label class="ghost ghost-pill">
              Subir foto
              <input type="file" accept="image/*" @change="handleAvatarChange" />
            </label>
            <button class="ghost ghost-pill" type="button" @click="removeAvatar" :disabled="!avatarUrl">
              Quitar foto
            </button>
          </div>

          <div class="actions">
            <button class="primary" type="submit" :disabled="isSubmitting">
              Guardar cambios
            </button>
          </div>

          <p v-if="message" class="form-message" :class="status">
            {{ message }}
          </p>
        </form>
      </section>

      <aside class="side-panel">
        <section class="card stats-card">
          <header class="card-header">
            <h3>Estadísticas Generales</h3>
          </header>
          <div class="stat-list">
            <div class="stat-row">
              <span class="stat-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 16l4-4-4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M20 12H8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M6 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
              <span>Proyectos</span>
              <strong>12</strong>
            </div>
            <div class="stat-row">
              <span class="stat-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 8h10a3 3 0 013 3v4a3 3 0 01-3 3H10l-4 3v-3H7a3 3 0 01-3-3v-4a3 3 0 013-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                </svg>
              </span>
              <span>Posts Foro</span>
              <strong>34</strong>
            </div>
            <div class="stat-row">
              <span class="stat-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 21V10a4 4 0 014-4h2l1-3h3v6h-4l-1 4h6a3 3 0 013 3v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span>Upvotes</span>
              <strong>156</strong>
            </div>
          </div>
        </section>

        <section class="card achievements-card">
          <header class="card-header">
            <h3>Logros</h3>
          </header>
          <div class="achievement">
            <span class="achievement-icon blue" aria-hidden="true">

              <svg viewBox="0 0 24 24" class="achievement-svg">
                <path d="m12 19 7-7-7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <span>Colaborador Activo</span>
              <small>10+ proyectos subidos</small>
            </div>
          </div>
          <div class="achievement">
            <span class="achievement-icon purple" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="achievement-svg">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div>
              <span>Participante Destacado</span>
              <small>30+ posts en el foro</small>
            </div>
          </div>
          <div class="achievement">
            <span class="achievement-icon gold" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="achievement-svg">
                <circle cx="12" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="2" />
                <path d="m8.5 13.5-2 8 5.5-3 5.5 3-2-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div>
              <span>Valorado por la Comunidad</span>
              <small>100+ upvotes recibidos</small>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <section class="card recent-projects">
      <header class="card-header">
        <h3>Proyectos Recientes</h3>
        <button class="ghost ghost-pill" type="button">Subir Proyecto</button>
      </header>
      <div class="recent-item">
        <span>Proyecto de ejemplo</span>
        <span class="status-pill approved">Aprobado</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '')
const router = useRouter()

const correo = ref('')
const nombre = ref('')
const edad = ref(null)
const carnet = ref('')
const avatarUrl = ref('')
const avatarFile = ref(null)
const avatarPreview = computed(() => {
  if (!avatarUrl.value) return ''
  if (avatarUrl.value.startsWith('data:') || avatarUrl.value.startsWith('http')) {
    return avatarUrl.value
  }
  return `${SERVER_BASE}${avatarUrl.value}`
})
const isSubmitting = ref(false)
const message = ref('')
const status = ref('info')
const isEditing = ref(false)

const getAuthUser = () => {
  const stored = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  return stored ? JSON.parse(stored) : null
}

const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

const storage = computed(() => {
  return localStorage.getItem('authUser') ? localStorage : sessionStorage
})

const initials = computed(() => {
  if (!nombre.value) return 'US'
  return nombre.value
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
  correo.value = data.correoInstitucional
  nombre.value = data.nombre ?? ''
  edad.value = data.edad ?? null
  carnet.value = data.carnet ?? ''
  avatarUrl.value = data.rutaFotoPerfil || ''
}

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    avatarUrl.value = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

const removeAvatar = () => {
  avatarUrl.value = ''
}

const handleSubmit = async () => {
  const authUser = getAuthUser()
  if (!authUser?.id) {
    await router.push('/login')
    return
  }

  message.value = ''
  status.value = 'info'

  try {
    isSubmitting.value = true
    let rutaFotoPerfil = avatarUrl.value

    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('file', avatarFile.value)

      const uploadResponse = await fetch(
        `${API_BASE}/users/profile/${authUser.id}/photo`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        },
      )

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json().catch(() => null)
        throw new Error(data?.message ?? 'Error al subir la foto')
      }

      const uploadData = await uploadResponse.json()
      rutaFotoPerfil = uploadData?.rutaFotoPerfil || rutaFotoPerfil
      avatarFile.value = null
      avatarUrl.value = rutaFotoPerfil
    }

    const response = await fetch(`${API_BASE}/users/profile/${authUser.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          nombre: nombre.value,
          edad: edad.value,
          carnet: carnet.value,
          rutaFotoPerfil,
        }),
      }
    )

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message ?? 'Error al guardar perfil')
    }

    const data = await response.json()
    storage.value.setItem('authUser', JSON.stringify({
      id: data.id,
      correo: data.correoInstitucional,
      nombre: data.nombre,
    }))

    message.value = 'Perfil actualizado'
    status.value = 'success'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Error inesperado'
    status.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  message.value = ''
  status.value = 'info'
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-shell {
  min-height: 100vh;
  background: var(--bg-app);
  padding: 2.5rem;
  color: var(--text-primary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.ghost-pill {
  border-radius: 999px;
  padding: 0.5rem 1rem;
}

.edit-icon {
  margin-right: 0.4rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.profile-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem 2.5rem;
  display: grid;
  gap: 1.5rem;
  box-shadow: var(--shadow-strong);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.avatar-block {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.muted {
  color: var(--text-muted);
}

.avatar-preview {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  font-size: 1.8rem;
  font-weight: 700;
  overflow: hidden;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-form {
  display: grid;
  gap: 1rem;
}

.profile-details {
  display: grid;
  gap: 1.25rem;
}

.detail-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  font-size: 0.95rem;
  align-items: center;
}

.detail-item.full {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.detail-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--bg-surface-alt);
  display: grid;
  place-items: center;
  font-size: 0.9rem;
  color: var(--text-soft);
}

.detail-icon svg {
  width: 18px;
  height: 18px;
}

.detail-item.full {
  grid-column: 1 / -1;
}

.label {
  color: var(--text-muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge {
  display: inline-flex;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-500);
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.4rem;
}

.social-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem 1.5rem;
  color: var(--text-soft);
}

.social-links span:nth-child(odd) {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.social-links span:nth-child(even) {
  font-weight: 600;
}

.field {
  display: grid;
  gap: 0.5rem;
}

label {
  font-size: 0.85rem;
  color: var(--text-soft);
}

input {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  color: inherit;
}

input:disabled {
  opacity: 0.7;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.primary {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  color: var(--accent-contrast);
  padding: 0.85rem 1.1rem;
  border-radius: 14px;
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

.ghost input {
  display: none;
}

.side-panel {
  display: grid;
  gap: 1.5rem;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
  box-shadow: var(--shadow-soft);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-list {
  display: grid;
  gap: 0.75rem;
}

.stat-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.6rem;
  align-items: center;
  color: var(--text-soft);
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--bg-surface-alt);
  display: grid;
  place-items: center;
  font-size: 0.9rem;
  color: #60a5fa;
}

.stat-icon svg {
  width: 18px;
  height: 18px;
}

.achievements-card {
  gap: 1rem;
}

.achievement {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
  color: var(--text-soft);
  align-items: center;
}

.achievement-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 0.9rem;
}

.achievement-svg {
  width: 18px;
  height: 18px;
}

.achievement-icon.blue {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
}

.achievement-icon.purple {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

.achievement-icon.gold {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}

.recent-projects {
  margin-top: 2rem;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-top: 1px solid var(--border-color);
}

.status-pill {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.status-pill.approved {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}


.achievement small {
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .profile-shell {
    padding: 1.5rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .profile-layout {
    grid-template-columns: 1fr;
  }
}

.form-message {
  text-align: center;
  font-size: 0.9rem;
}

.form-message.success {
  color: var(--success);
}

.form-message.error {
  color: var(--error);
}

.form-message.info {
  color: var(--text-muted);
}
</style>
