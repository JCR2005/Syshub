<template>
  <div class="auth-shell">
    <section class="hero">
      <div class="hero-content">
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="icon-svg">
              <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M22 10v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="brand-text">Syshub</span>
        </div>

        <h1>
          Bienvenido a
          <span class="accent">Syshub Académico</span>
        </h1>
        <p class="hero-subtitle">
          Conecta, colabora y comparte tus proyectos con estudiantes de Ingeniería en Sistemas.
        </p>

        <div class="hero-features">
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="icon-svg">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <div class="feature-title">Share Knowledge</div>
              <div class="feature-text">Explora proyectos y recursos académicos</div>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="icon-svg">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <div class="feature-title">Foro Estudiantil</div>
              <div class="feature-text">Recibe apoyo de auxiliares y compañeros</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-inner">
        <header class="auth-header">
          <h2>{{ isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta' }}</h2>
          <p class="muted">
            {{ isLogin ? 'Ingresa tus credenciales institucionales' : 'Únete a la comunidad de ingeniería' }}
          </p>
        </header>

  <form class="auth-form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="email">Correo institucional</label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              placeholder="estudiante@universidad.edu"
              required
            />
            <p v-if="!isLogin && email && !isInstitutionalEmailValid" class="hint error">
              Formato esperado: <strong>NombreApellido123456789@cunoc.edu.gt</strong>
            </p>
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
            />
            <div v-if="!isLogin" class="password-rules">
              <p class="hint">Requisitos de seguridad:</p>
              <ul>
                <li :class="{ ok: passwordChecks.minLength }">Mínimo 8 caracteres</li>
                <li :class="{ ok: passwordChecks.uppercase }">Al menos una mayúscula</li>
                <li :class="{ ok: passwordChecks.lowercase }">Al menos una minúscula</li>
                <li :class="{ ok: passwordChecks.number }">Al menos un número</li>
                <li :class="{ ok: passwordChecks.symbol }">Al menos un símbolo (!@#$...)</li>
              </ul>
            </div>
          </div>

          <div v-if="!isLogin" class="field">
            <label for="confirm">Confirmar contraseña</label>
            <input
              id="confirm"
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
            />
            <p v-if="confirmPassword && !passwordsMatch" class="hint error">
              Las contraseñas no coinciden.
            </p>
          </div>

          <div v-if="!isLogin && registerStep === 'confirm'" class="field">
            <label for="code">Código de verificación</label>
            <input
              id="code"
              v-model="verificationCode"
              type="text"
              placeholder="123456"
              required
            />
          </div>


          <div v-if="isLogin" class="row">
            <label class="checkbox">
              <input v-model="remember" type="checkbox" />
              Recordarme
            </label>
            <a class="link" href="#">¿Olvidaste tu contraseña?</a>
          </div>

          <button class="primary" type="submit" :disabled="isSubmitting">
            {{ isLogin ? 'Ingresar' : registerStep === 'request' ? 'Enviar código' : 'Confirmar registro' }}
          </button>

          <button
            v-if="!isLogin && registerStep === 'confirm'"
            type="button"
            class="secondary"
            :disabled="isSubmitting || resendCooldown > 0"
            @click="handleResend"
          >
            Reenviar código
          </button>

          <p v-if="!isLogin && registerStep === 'confirm' && resendCooldown > 0" class="timer">
            Puedes reenviar en {{ resendCooldown }}s
          </p>

          <p v-if="formMessage" class="form-message" :class="formStatus">
            {{ formMessage }}
          </p>

          <p class="switch">
            {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
            <button type="button" class="link" @click="toggleMode">
              {{ isLogin ? 'Crear cuenta' : 'Iniciar sesión' }}
            </button>
          </p>
        </form>
      </div>

      <div v-if="showModeSelector" class="mode-selector-backdrop">
        <div class="mode-selector-card">
          <h3>Elegir modo de ingreso</h3>
          <p>
            Tu cuenta tiene más de un rol. ¿Cómo quieres entrar hoy?
          </p>

          <div class="mode-options">
            <button
              v-for="mode in pendingModes"
              :key="mode"
              type="button"
              class="mode-option"
              :class="{ active: selectedMode === mode }"
              @click="selectedMode = mode"
            >
              {{ mode === 'admin' ? 'Modo Admin' : 'Modo Estudiante' }}
            </button>
          </div>

          <div class="mode-actions">
            <button type="button" class="secondary" @click="cancelModeSelection">Cancelar</button>
            <button type="button" class="primary" @click="confirmModeSelection">Continuar</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const remember = ref(false)
const registerStep = ref('request')
const verificationCode = ref('')
const resendCooldown = ref(0)
let resendTimer = null
const isSubmitting = ref(false)
const formMessage = ref('')
const formStatus = ref('info')
const showModeSelector = ref(false)
const pendingModes = ref([])
const selectedMode = ref('student')
const pendingLoginData = ref(null)
const router = useRouter()

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const institutionalEmailPattern = /^[a-záéíóúñ]+\d{9}@cunoc\.edu\.gt$/i

const isInstitutionalEmailValid = computed(() =>
  institutionalEmailPattern.test((email.value ?? '').trim()),
)

const passwordChecks = computed(() => {
  const value = password.value ?? ''
  return {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z\d]/.test(value),
  }
})

const isStrongPassword = computed(() =>
  Object.values(passwordChecks.value).every(Boolean),
)

const passwordsMatch = computed(() => password.value === confirmPassword.value)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetRegisterFields()
  formMessage.value = ''
}

const persistSession = (data, mode) => {
  const storage = remember.value ? localStorage : sessionStorage
  const fallbackStorage = remember.value ? sessionStorage : localStorage

  fallbackStorage.removeItem('authToken')
  fallbackStorage.removeItem('authUser')

  if (data?.accessToken) {
    storage.setItem('authToken', data.accessToken)
  }

  if (data?.id) {
    storage.setItem('authUser', JSON.stringify({
      id: data.id,
      correo: data.correo,
      nombre: data.nombre,
      roles: Array.isArray(data.roles) ? data.roles : [],
      rangos: Array.isArray(data.rangos) ? data.rangos : [],
      activeMode: mode,
    }))
  }
}

const finalizeLogin = async (data, mode) => {
  persistSession(data, mode)
  formMessage.value = 'Login exitoso'
  formStatus.value = 'success'
  password.value = ''
  await router.push(mode === 'admin' ? '/admin' : '/dashboard')
}

const cancelModeSelection = () => {
  showModeSelector.value = false
  pendingModes.value = []
  pendingLoginData.value = null
  selectedMode.value = 'student'
}

const confirmModeSelection = async () => {
  if (!pendingLoginData.value) return
  const mode = selectedMode.value === 'admin' ? 'admin' : 'student'

  const payload = pendingLoginData.value
  cancelModeSelection()
  await finalizeLogin(payload, mode)
}

const resetRegisterFields = () => {
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  verificationCode.value = ''
  registerStep.value = 'request'
  resendCooldown.value = 0
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
}

const handleSubmit = async () => {
  formMessage.value = ''
  formStatus.value = 'info'

  if (!isLogin.value && registerStep.value === 'request' && !isInstitutionalEmailValid.value) {
    formMessage.value =
      'Usa tu correo institucional con formato: NombreApellido123456789@cunoc.edu.gt'
    formStatus.value = 'error'
    return
  }

  if (!isLogin.value && registerStep.value === 'request' && !isStrongPassword.value) {
    formMessage.value =
      'Tu contraseña aún no cumple los requisitos mínimos. Revisa la guía debajo del campo contraseña.'
    formStatus.value = 'error'
    return
  }

  if (!isLogin.value && registerStep.value === 'request' && password.value !== confirmPassword.value) {
    formMessage.value = 'Las contraseñas no coinciden'
    formStatus.value = 'error'
    return
  }

  if (isLogin.value) {
    try {
      isSubmitting.value = true
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: email.value,
          contrasena: password.value,
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message ?? 'Error al iniciar sesión')
      }

      const data = await response.json().catch(() => null)

      const modes = Array.isArray(data?.availableModes) ? data.availableModes : []
      const requiresModeSelection =
        data?.requiresModeSelection === true && modes.length > 1

      if (requiresModeSelection) {
        pendingLoginData.value = data
        pendingModes.value = modes
        selectedMode.value = modes.includes('student') ? 'student' : modes[0]
        showModeSelector.value = true
        formMessage.value = 'Selecciona el modo de ingreso para continuar.'
        formStatus.value = 'info'
        return
      }

      const activeMode =
        data?.activeMode === 'admin'
          ? 'admin'
          : data?.activeMode === 'student'
            ? 'student'
            : 'student'

      await finalizeLogin(data, activeMode)
      return
    } catch (error) {
      formMessage.value = error instanceof Error ? error.message : 'Error inesperado'
      formStatus.value = 'error'
      return
    } finally {
      isSubmitting.value = false
    }
  }

  try {
    isSubmitting.value = true

    if (registerStep.value === 'request') {
      const response = await fetch(`${API_BASE}/auth/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: email.value,
          contrasena: password.value,
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message ?? 'Error al enviar código')
      }

      registerStep.value = 'confirm'
      formMessage.value = 'Código enviado. Ingresa el código para confirmar.'
      formStatus.value = 'success'
      startCooldown()
      return
    }

    const confirmResponse = await fetch(`${API_BASE}/auth/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: email.value,
        contrasena: password.value,
        codigo: verificationCode.value,
      })
    })

    if (!confirmResponse.ok) {
      const data = await confirmResponse.json().catch(() => null)
      throw new Error(data?.message ?? 'Error al confirmar registro')
    }

    formMessage.value = 'Cuenta creada. Ya puedes iniciar sesión.'
    formStatus.value = 'success'
    isLogin.value = true
    resetRegisterFields()
  } catch (error) {
    formMessage.value = error instanceof Error ? error.message : 'Error inesperado'
    formStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const handleResend = async () => {
  formMessage.value = ''
  formStatus.value = 'info'

  try {
    isSubmitting.value = true
    const response = await fetch(`${API_BASE}/auth/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email.value })
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message ?? 'Error al reenviar código')
    }

    formMessage.value = 'Código reenviado. Revisa tu correo.'
    formStatus.value = 'success'
    startCooldown()
  } catch (error) {
    formMessage.value = error instanceof Error ? error.message : 'Error inesperado'
    formStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const startCooldown = () => {
  resendCooldown.value = 120
  if (resendTimer) {
    clearInterval(resendTimer)
  }
  resendTimer = setInterval(() => {
    if (resendCooldown.value <= 1) {
      resendCooldown.value = 0
      clearInterval(resendTimer)
      resendTimer = null
      return
    }
    resendCooldown.value -= 1
  }, 1000)
}
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: var(--bg-app);
  color: var(--text-primary);
}

.hero {
  padding: clamp(2.5rem, 5vw, 5rem);
  background: radial-gradient(circle at top left, var(--accent-soft), transparent 55%),
    radial-gradient(circle at bottom, rgba(251, 146, 60, 0.14), transparent 55%),
    var(--bg-surface-alt);
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 520px;
  display: grid;
  gap: 2rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

.brand-text {
  font-size: 1.25rem;
}

h1 {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  line-height: 1.1;
}

.accent {
  display: block;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.hero-subtitle {
  color: var(--text-soft);
  font-size: 1.05rem;
}

.hero-features {
  display: grid;
  gap: 1.25rem;
  color: var(--text-soft);
}

.feature {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--accent-soft);
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

.icon-svg {
  width: 22px;
  height: 22px;
}

.feature-title {
  color: var(--text-primary);
  font-weight: 600;
}

.feature-text {
  font-size: 0.9rem;
}

.panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 5vw, 4rem);
  background: var(--bg-app);
}

.panel-inner {
  width: min(420px, 100%);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-header h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.muted {
  color: var(--text-muted);
}

.auth-form {
  display: grid;
  gap: 1.25rem;
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

input:focus {
  outline: 2px solid var(--focus-ring);
  border-color: transparent;
}

.pill-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.pill {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-soft);
  padding: 0.7rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill.active {
  border-color: var(--accent-500);
  color: var(--accent-contrast);
  background: var(--accent-soft);
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  color: var(--accent-contrast);
  padding: 0.85rem;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.primary:hover {
  opacity: 0.92;
}

.secondary {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-soft);
  padding: 0.75rem;
  border-radius: 14px;
  cursor: pointer;
  transition: border 0.2s ease;
}

.secondary:hover {
  border-color: var(--accent-500);
}

.timer {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.hint.error {
  color: var(--error);
}

.password-rules {
  margin-top: 0.2rem;
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
}

.password-rules ul {
  margin: 0.35rem 0 0;
  padding-left: 1rem;
  display: grid;
  gap: 0.2rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.password-rules li.ok {
  color: var(--success);
}

.link {
  background: none;
  border: none;
  color: var(--accent-500);
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  text-decoration: none;
}

.switch {
  text-align: center;
  color: var(--text-soft);
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

.mode-selector-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 8, 18, 0.72);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 40;
  padding: 1rem;
}

.mode-selector-card {
  width: min(420px, 100%);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.2rem;
  display: grid;
  gap: 0.9rem;
}

.mode-selector-card h3 {
  margin: 0;
  font-size: 1.1rem;
}

.mode-selector-card p {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.92rem;
}

.mode-options {
  display: grid;
  gap: 0.6rem;
}

.mode-option {
  border: 1px solid var(--border-color);
  background: var(--bg-muted);
  color: var(--text-soft);
  border-radius: 12px;
  padding: 0.65rem 0.8rem;
  text-align: left;
  cursor: pointer;
}

.mode-option.active {
  border-color: var(--accent-500);
  color: var(--text-primary);
  background: var(--accent-soft);
}

.mode-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .hero {
    display: none;
  }

  .panel {
    min-height: 100vh;
  }
}
</style>
