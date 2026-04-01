<template>
  <div class="auth-shell">
    <section class="hero">
      <div class="hero-content">
        <div class="brand">
          <div class="brand-icon">
            <span>🎓</span>
          </div>
          <span class="brand-text">Syshub</span>
        </div>

        <h1>
          Welcome to the
          <span class="accent">Engineering Hub</span>
        </h1>
        <p class="hero-subtitle">
          Connect, collaborate, and share your projects with fellow computer science students.
        </p>

        <div class="hero-features">
          <div class="feature">
            <div class="feature-icon">📚</div>
            <div>
              <div class="feature-title">Share Knowledge</div>
              <div class="feature-text">Browse academic projects and repositories</div>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">💬</div>
            <div>
              <div class="feature-title">Community Forum</div>
              <div class="feature-text">Get help from TAs and peers</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-inner">
        <header class="auth-header">
          <h2>{{ isLogin ? 'Sign in to your account' : 'Create your account' }}</h2>
          <p class="muted">
            {{ isLogin ? 'Enter your institutional credentials' : 'Join the engineering community' }}
          </p>
        </header>

  <form class="auth-form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="email">Institutional Email</label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              placeholder="student@university.edu"
              required
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="!isLogin" class="field">
            <label for="confirm">Confirm Password</label>
            <input
              id="confirm"
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="!isLogin && registerStep === 'confirm'" class="field">
            <label for="code">Verification Code</label>
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
              Remember me
            </label>
            <a class="link" href="#">Forgot password?</a>
          </div>

          <button class="primary" type="submit" :disabled="isSubmitting">
            {{ isLogin ? 'Sign In' : registerStep === 'request' ? 'Enviar código' : 'Confirmar registro' }}
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
            {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
            <button type="button" class="link" @click="toggleMode">
              {{ isLogin ? 'Create account' : 'Sign in' }}
            </button>
          </p>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
const router = useRouter()

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetRegisterFields()
  formMessage.value = ''
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
      const storage = remember.value ? localStorage : sessionStorage

      if (data?.accessToken) {
        storage.setItem('authToken', data.accessToken)
      }
      if (data?.id) {
        storage.setItem('authUser', JSON.stringify({
          id: data.id,
          correo: data.correo,
          nombre: data.nombre,
        }))
      }

      formMessage.value = 'Login exitoso'
      formStatus.value = 'success'
      password.value = ''
  await router.push('/dashboard')
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
  background: #0a0a0f;
  color: #f5f5f7;
}

.hero {
  padding: clamp(2.5rem, 5vw, 5rem);
  background: radial-gradient(circle at top left, rgba(130, 97, 255, 0.25), transparent 55%),
    radial-gradient(circle at bottom, rgba(255, 95, 160, 0.2), transparent 55%),
    #0f1020;
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
  background: linear-gradient(135deg, #7c5cff, #ff5fa0);
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
  background: linear-gradient(135deg, #7c5cff, #ff5fa0);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.hero-subtitle {
  color: #b7b8d6;
  font-size: 1.05rem;
}

.hero-features {
  display: grid;
  gap: 1.25rem;
  color: #b7b8d6;
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
  background: rgba(124, 92, 255, 0.2);
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

.feature-title {
  color: #f5f5f7;
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
  background: #0a0a0f;
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
  color: #9fa0b8;
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
  color: #cfcfe4;
}

input {
  background: #11121b;
  border: 1px solid #2a2b3c;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  color: inherit;
}

input:focus {
  outline: 2px solid rgba(124, 92, 255, 0.7);
  border-color: transparent;
}

.pill-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.pill {
  background: #11121b;
  border: 1px solid #2a2b3c;
  color: #c9c9d8;
  padding: 0.7rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill.active {
  border-color: #7c5cff;
  color: #fff;
  background: rgba(124, 92, 255, 0.18);
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
  background: linear-gradient(90deg, #6aa7ff, #f25f9a);
  border: none;
  color: #fff;
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
  border: 1px solid #2a2b3c;
  color: #c9c9d8;
  padding: 0.75rem;
  border-radius: 14px;
  cursor: pointer;
  transition: border 0.2s ease;
}

.secondary:hover {
  border-color: #7c5cff;
}

.timer {
  text-align: center;
  font-size: 0.85rem;
  color: #9fa0b8;
}

.link {
  background: none;
  border: none;
  color: #7c5cff;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  text-decoration: none;
}

.switch {
  text-align: center;
  color: #b6b6c8;
}

.form-message {
  text-align: center;
  font-size: 0.9rem;
}

.form-message.success {
  color: #7dd3a8;
}

.form-message.error {
  color: #f87171;
}

.form-message.info {
  color: #9fa0b8;
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
