import { computed, ref } from 'vue'

const THEME_STORAGE_KEY = 'syshub-theme'
const VALID_THEMES = ['system', 'light', 'dark']

const themePreference = ref('system')
const resolvedTheme = ref('dark')
let mediaQuery = null
let mediaQueryListener = null

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

const resolveAndApplyTheme = () => {
  const effectiveTheme = themePreference.value === 'system'
    ? getSystemTheme()
    : themePreference.value

  resolvedTheme.value = effectiveTheme
  applyTheme(effectiveTheme)
}

const attachSystemListener = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return
  if (mediaQuery) return

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQueryListener = () => {
    if (themePreference.value === 'system') {
      resolveAndApplyTheme()
    }
  }

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', mediaQueryListener)
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(mediaQueryListener)
  }
}

export const initTheme = () => {
  if (typeof window === 'undefined') return

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme && VALID_THEMES.includes(storedTheme)) {
    themePreference.value = storedTheme
  } else {
    themePreference.value = 'system'
  }

  attachSystemListener()
  resolveAndApplyTheme()
}

export const useTheme = () => {
  const setTheme = (theme) => {
    const nextTheme = VALID_THEMES.includes(theme) ? theme : 'system'
    themePreference.value = nextTheme

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }

    resolveAndApplyTheme()
  }

  return {
    themePreference,
    resolvedTheme: computed(() => resolvedTheme.value),
    setTheme,
  }
}
