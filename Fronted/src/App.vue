<template>
  <RouterView />
  <ThemeToggle />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from './components/ThemeToggle.vue'
import { clearAuthSession, hasValidSession } from './utils/authSession'

const router = useRouter()
const route = useRoute()

let sessionCheckInterval = null

const redirectIfSessionExpired = async () => {
  if (route.name === 'login') return
  if (hasValidSession()) return

  clearAuthSession()
  await router.push({ name: 'login' })
}

onMounted(() => {
  redirectIfSessionExpired()
  sessionCheckInterval = setInterval(() => {
    void redirectIfSessionExpired()
  }, 15000)
})

onUnmounted(() => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval)
    sessionCheckInterval = null
  }
})
</script>
