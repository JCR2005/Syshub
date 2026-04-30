<template>
  <div class="theme-toggle" role="group" aria-label="Selector de tema">
    <span class="theme-label">Tema</span>
    <select :value="themePreference" @change="onChange" aria-label="Seleccionar tema">
      <option value="system">Sistema</option>
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
    </select>
  </div>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'

const { themePreference, setTheme } = useTheme()

const onChange = (event) => {
  setTheme(event.target.value)
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.7rem;
  border-radius: 999px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(8px);
}

.theme-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 600;
}

select {
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--bg-muted);
  color: var(--text-primary);
  padding: 0.3rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 600;
}

select:focus {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}

@media (max-width: 560px) {
  .theme-toggle {
    right: 0.75rem;
    bottom: 0.75rem;
  }
}
</style>
