export const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

export const getAuthUserRaw = () => {
  return localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
}

export const getAuthUser = () => {
  const raw = getAuthUserRaw()
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const normalizeRoleName = (value) => String(value || '').trim().toLowerCase()

const getRolesFromToken = () => {
  const payload = decodeJwtPayload(getAuthToken())
  const roles = Array.isArray(payload?.roles) ? payload.roles : []
  return roles.map(normalizeRoleName).filter(Boolean)
}

const getRangosFromToken = () => {
  const payload = decodeJwtPayload(getAuthToken())
  const rangos = Array.isArray(payload?.rangos) ? payload.rangos : []
  console.log('Rangos from Token:', rangos) // Debug log to check rangos from token
  return rangos.map(normalizeRoleName).filter(Boolean)
}

const getNormalizedRoles = () => {
  const user = getAuthUser()
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map(normalizeRoleName).filter(Boolean)
    : []

  if (userRoles.length) return userRoles
  return getRolesFromToken()
}

const getNormalizedRangos = () => {
  const user = getAuthUser()
  const userRangos = Array.isArray(user?.rangos)
    ? user.rangos.map(normalizeRoleName).filter(Boolean)
    : []
  console.log('User Raddngos:', userRangos) // Debug log to check user rangos
  console.log('User Object:', user) // Debug log to check user object
  if (userRangos.length) return userRangos
  return getRangosFromToken()
}

export const clearAuthSession = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
  sessionStorage.removeItem('authToken')
  sessionStorage.removeItem('authUser')
}

const resolvePrimaryStorage = () => {
  const hasLocalSession =
    !!localStorage.getItem('authToken') || !!localStorage.getItem('authUser')
  return hasLocalSession ? localStorage : sessionStorage
}

export const setAuthUser = (user) => {
  if (!user) return false
  const storage = resolvePrimaryStorage()
  storage.setItem('authUser', JSON.stringify(user))
  return true
}

export const hasRango = (rangoName) => {
  const normalizedRangos = getNormalizedRangos()
  return normalizedRangos.includes(normalizeRoleName(rangoName))
}

export const hasRole = (roleName) => {
  const normalizedRoles = getNormalizedRoles()
  return normalizedRoles.includes(normalizeRoleName(roleName))
}

export const canSwitchModes = () => {
  const normalizedRoles = getNormalizedRoles()
  return (
    normalizedRoles.includes('admin') &&
    normalizedRoles.includes('comun')
  )
}

export const getActiveMode = () => {
  const user = getAuthUser()
  const current = user?.activeMode === 'admin' ? 'admin' : 'student'
  return current
}

export const setActiveMode = (mode) => {
  const targetMode = mode === 'admin' ? 'admin' : 'student'
  const user = getAuthUser()
  if (!user) return false

  if (!Array.isArray(user.roles) || !user.roles.length) {
    user.roles = getNormalizedRoles()
  }

  user.activeMode = targetMode
  return setAuthUser(user)
}

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4)
  const padded = normalized + '='.repeat(padLength)

  try {
    return atob(padded)
  } catch {
    return null
  }
}

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length < 2) return null

  const decoded = decodeBase64Url(parts[1])
  if (!decoded) return null

  try {
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const isTokenExpired = (token, skewSeconds = 10) => {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') {
    return true
  }

  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + skewSeconds
}

export const hasValidSession = () => {
  const token = getAuthToken()
  const user = getAuthUserRaw()

  if (!token || !user || token === 'null' || token === 'undefined') {
    return false
  }

  return !isTokenExpired(token)
}
