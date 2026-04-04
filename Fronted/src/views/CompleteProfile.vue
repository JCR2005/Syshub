<template>
  <div class="profile-shell">
    <div class="profile-card">
      <h2>Completar perfil</h2>
      <p class="muted">
        Completa tus datos para continuar. Puedes editarlos más adelante desde tu perfil.
      </p>

      <form class="profile-form" @submit.prevent="handleSubmit">
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

        <button class="primary" type="submit" :disabled="isSubmitting">
          Guardar perfil
        </button>

        <p v-if="message" class="form-message" :class="status">
          {{ message }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const correo = ref('')
const nombre = ref('')
const edad = ref(null)
const carnet = ref('')
const isSubmitting = ref(false)
const message = ref('')
const status = ref('info')

const getAuthUser = () => {
  const stored = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  return stored ? JSON.parse(stored) : null
}

const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

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
    const response = await fetch(`${API_BASE}/users/profile/${authUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        nombre: nombre.value,
        edad: edad.value,
        carnet: carnet.value,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message ?? 'Error al guardar perfil')
    }

    const data = await response.json()
    const storage = localStorage.getItem('authUser') ? localStorage : sessionStorage
    storage.setItem('authUser', JSON.stringify({
      id: data.id,
      correo: data.correoInstitucional,
      nombre: data.nombre,
    }))

    message.value = 'Perfil actualizado'
    status.value = 'success'
    await router.push('/dashboard')
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Error inesperado'
    status.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-shell {
  min-height: 100vh;
  background: var(--bg-app);
  display: grid;
  place-items: center;
  padding: 2rem;
  color: var(--text-primary);
}

.profile-card {
  width: min(520px, 100%);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
}

.profile-card h2 {
  margin: 0;
}

.muted {
  color: var(--text-muted);
}

.profile-form {
  display: grid;
  gap: 1rem;
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

.primary {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  color: var(--accent-contrast);
  padding: 0.85rem;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
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
