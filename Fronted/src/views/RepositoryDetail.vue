<template>
  <div class="repository-detail-page">
    <AppNavbar
      :active-section="'dashboard'"
      :avatar-src="''"
      :avatar-initials="'US'"
      :search-value="''"
      @section-select="onSectionSelect"
      @profile="router.push('/profile')"
      @logout="logout"
    />

    <main class="content">
    <button class="back-btn" @click="router.push('/dashboard')">
  <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" style="display:inline-block; vertical-align:middle; margin-right:6px; margin-top:-2px">
    <path
      d="M15 18l-6-6 6-6"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  <span style="vertical-align:middle">Volver al dashboard</span>
</button>

      <p v-if="isLoading" class="state-message">Cargando repositorio...</p>
      <p v-else-if="errorMessage" class="state-message error">{{ errorMessage }}</p>

      <section v-else-if="repository" class="repo-layout">
        <aside class="repo-side-panel repo-side-panel--settings">
          <article class="side-card">
            <div class="side-title-row">
              <h3>Ajustes del repositorio</h3>
            </div>

            <div class="setting-row">
              <span class="muted">Visibilidad</span>
              <button class="toggle-btn" :class="repository.visibilidad === 'public' ? 'on' : 'off'" @click="toggleVisibility">
                <span class="toggle-knob"></span>
              </button>
            </div>
            <p class="muted">{{ repository.visibilidad === 'public' ? 'Repositorio público' : 'Repositorio privado' }}</p>
          </article>

          <article class="side-card">
            <div class="side-title-row">
              <h3>Editar nombre</h3>
              <button class="icon-only" @click="editName = !editName" title="Editar nombre">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10-10-4-4L4 16zM13 7l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>
              </button>
            </div>
            <p v-if="!editName"></p>
            <div v-else class="editor-block">
              <input v-model="draftNombre" placeholder="Nombre del repositorio" />
              <button class="save-btn" @click="saveRepositoryChanges">Guardar</button>
            </div>
          </article>

          <article class="side-card">
            <div class="side-title-row">
              <h3>Descripción</h3>
              <button class="icon-only" @click="editDescription = !editDescription" title="Editar descripción">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10-10-4-4L4 16zM13 7l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>
              </button>
            </div>
            <p v-if="!editDescription"></p>
            <div v-else class="editor-block">
              <textarea v-model="draftDescripcion" rows="4"></textarea>
              <button class="save-btn" @click="saveRepositoryChanges">Guardar</button>
            </div>
          </article>

          <article class="side-card">
            <div class="side-title-row">
              <h3>Stacks</h3>
              <button class="icon-only" @click="editStacks = !editStacks" title="Editar stacks">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10-10-4-4L4 16zM13 7l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>
              </button>
            </div>
            <div  v-if="!editStacks">
            
              <span v-if="!repository.stacks?.length" class="muted">Sin stacks.</span>
            </div>
            <div v-else class="editor-block">
              <div class="chips selectable">
                <button
                  v-for="stack in stackOptions"
                  :key="`stack-option-${stack}`"
                  class="chip chip-btn"
                  :class="selectedStacks.includes(stack) ? 'selected' : ''"
                  @click="toggleStackSelection(stack)"
                >
                  {{ stack }}
                </button>
              </div>
              <button class="save-btn" @click="saveRepositoryChanges">Guardar</button>
            </div>
          </article>

          <article class="side-card">
            <div class="side-title-row">
              <h3>Tags</h3>
              <button class="icon-only" @click="editTags = !editTags" title="Editar tags">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10-10-4-4L4 16zM13 7l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>
              </button>
            </div>
            <div class="chips" v-if="!editTags">
              <span v-if="!repository.tags?.length" class="muted">Sin tags.</span>
            </div>
            <div v-else class="editor-block">
              <div class="chips selectable">
                <button
                  v-for="tag in tagOptions"
                  :key="`tag-option-${tag}`"
                  class="chip chip-btn alt"
                  :class="selectedTags.includes(tag) ? 'selected' : ''"
                  @click="toggleTagSelection(tag)"
                >
                  {{ tag }}
                </button>
              </div>
              <button class="save-btn" @click="saveRepositoryChanges">Guardar</button>
            </div>
          </article>
        </aside>

        <article class="repo-main-card">
          <header class="repo-main-header">
            <div>
              <h1>{{ repository.nombre }}</h1>
              <span class="visibility-pill" :class="repository.visibilidad === 'public' ? 'public' : 'private'">
                {{ repository.visibilidad === 'public' ? 'Público' : 'Privado' }}
              </span>
            </div>
            <button class="primary-btn" @click="downloadRepository" :disabled="isDownloadingRepo">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0-4-4m4 4 4-4M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ isDownloadingRepo ? 'Preparando ZIP...' : 'Descargar repositorio' }}
            </button>
          </header>

          <div class="repo-toolbar">
            <div class="toolbar-actions">
              <button class="icon-btn" @click="triggerFileUpload" title="Subir archivo">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Subir archivo</span>
              </button>
              <button class="icon-btn" @click="triggerFolderUpload" title="Subir carpeta">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 14v-4m0 0-2 2m2-2 2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Subir carpeta</span>
              </button>
            </div>
            <div class="repo-toolbar-right">
              <span class="muted">{{ totalFolders }} carpetas</span>
              <span class="muted">{{ repository.files.length }} archivos</span>
              <button class="icon-btn" @click="openCommitsView" title="Ver commits">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10M7 12h10M7 17h10M4 7h.01M4 12h.01M4 17h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <span>Commits</span>
              </button>
            </div>
          </div>

          <input ref="fileInputRef" class="hidden-input" type="file" multiple @change="onFileInputChange" />
          <input ref="folderInputRef" class="hidden-input" type="file" multiple webkitdirectory directory @change="onFolderInputChange" />

          <div class="repo-breadcrumb">
            <button
              class="crumb"
              :class="{ active: currentPath === '' }"
              @click="goToPath('')"
            >
              / raíz
            </button>
            <template v-for="(segment, index) in pathSegments" :key="`${segment}-${index}`">
              <span class="crumb-sep">/</span>
              <button
                class="crumb"
                :class="{ active: index === pathSegments.length - 1 }"
                @click="goToPath(pathSegments.slice(0, index + 1).join('/'))"
              >
                {{ segment }}
              </button>
            </template>
          </div>

          <section class="repo-table">
            <header class="table-head">
              <span>Nombre</span>
              <span>Acciones</span>
            </header>

            <div v-if="explorerEntries.length" class="table-body">
              <article
                v-for="entry in explorerEntries"
                :key="entry.key"
                class="table-row"
                :class="entry.type === 'folder' ? 'folder-row' : 'file-row'"
                @click="entry.type === 'file' ? openFile(entry.file) : undefined"
              >
                <button
                  v-if="entry.type === 'folder'"
                  class="entry-name folder-entry"
                  @click="openFolder(entry.fullPath)"
                >
                  <span class="entry-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                  </span>
                  <span>{{ entry.name }}</span>
                  <small>{{ entry.count }} archivo(s)</small>
                </button>

                <div v-else class="entry-name">
                  <span class="entry-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 3v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
                  </span>
                  <span>{{ entry.file.nombre }}</span>
                </div>

                <div v-if="entry.type === 'file'" class="file-actions">
                  <button class="file-icon-btn" @click.stop="downloadFile(entry.file)" title="Descargar archivo">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10m0 0-4-4m4 4 4-4M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                  <button class="file-icon-btn danger" @click.stop="deleteFile(entry.file)" title="Eliminar archivo">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2m-9 0l1 12h10.5l1-12 " fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>
                <span v-else class="muted">—</span>
              </article>
            </div>

            <p v-else class="empty-state">No hay archivos ni carpetas en esta ruta.</p>
          </section>
        </article>

        <aside class="repo-side-panel repo-side-panel--info">
            <article class="side-card">
              <div class="side-title-row">
                <h3>Sincronización .syshub</h3>
              </div>

              <div class="editor-block">
                <input
                  v-model="syncMessageDraft"
                  placeholder="Mensaje de commit/push (opcional)"
                />

                <div class="sync-actions">
                  <button
                    class="save-btn"
                    :disabled="syncBusy"
                    @click="runSyncAction('commit')"
                  >
                    {{ syncBusy && activeSyncAction === 'commit' ? 'Procesando...' : 'Commit' }}
                  </button>
                  <button
                    class="save-btn"
                    :disabled="syncBusy"
                    @click="runSyncAction('push')"
                  >
                    {{ syncBusy && activeSyncAction === 'push' ? 'Procesando...' : 'Push' }}
                  </button>
                  <button
                    class="save-btn"
                    :disabled="syncBusy"
                    @click="runSyncAction('pull')"
                  >
                    {{ syncBusy && activeSyncAction === 'pull' ? 'Procesando...' : 'Pull' }}
                  </button>
                </div>

                <p v-if="syncStatusMessage" class="muted">{{ syncStatusMessage }}</p>
              </div>
            </article>

            <article class="side-card">
              <div class="side-title-row">
                <h3>Información del repositorio</h3>
              </div>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Descripción</span>
                  <p>{{ repository.descripcion || 'Sin descripción' }}</p>
                </div>

                <div class="info-item" v-if="repository.stacks?.length">
                  <span class="info-label">Stacks</span>
                  <div class="chips">
                    <span v-for="stack in repository.stacks" :key="`stack-info-${stack}`" class="chip">{{ stack }}</span>
                  </div>
                </div>

                <div class="info-item" v-if="repository.tags?.length">
                  <span class="info-label">Tags</span>
                  <div class="chips">
                    <span v-for="tag in repository.tags" :key="`tag-info-${tag}`" class="chip alt">{{ tag }}</span>
                  </div>
                </div>

                <div class="info-item" v-if="repository.pensum">
                  <span class="info-label">Pensum</span>
                  <p>{{ repository.pensum.nombre }}</p>
                </div>

                <div class="info-item" v-if="repository.curso">
                  <span class="info-label">Curso</span>
                  <p>
                    {{ repository.curso.codigo }} — {{ repository.curso.nombre }}
                    <span class="muted">(Sem. {{ repository.curso.semestre }})</span>
                  </p>
                </div>
              </div>
            </article>

            <article class="side-card">
              <div class="side-title-row">
                <h3>Métricas</h3>
              </div>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Estrellas</span>
                  <strong>{{ repository.estrellas ?? 0 }}</strong>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Vistas</span>
                  <strong>{{ repository.vistas ?? 0 }}</strong>
                </div>
              </div>
            </article>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const errorMessage = ref('')
const repository = ref(null)
const isDownloadingRepo = ref(false)
const currentPath = ref('')
const fileInputRef = ref(null)
const folderInputRef = ref(null)
const editDescription = ref(false)
const editName = ref(false)
const editTags = ref(false)
const editStacks = ref(false)
const draftNombre = ref('')
const draftDescripcion = ref('')
const draftTags = ref('')
const draftStacks = ref('')
const stackOptions = ref([])
const tagOptions = ref([])
const selectedStacks = ref([])
const selectedTags = ref([])
const syncMessageDraft = ref('')
const syncStatusMessage = ref('')
const syncBusy = ref(false)
const activeSyncAction = ref('')

const normalizePath = (value) => (value || '').replace(/^\/+|\/+$/g, '')

const pathSegments = computed(() =>
  normalizePath(currentPath.value)
    ? normalizePath(currentPath.value).split('/')
    : [],
)

const getFileFullPath = (file) => {
  const folder = normalizePath(file.carpeta === 'raiz' ? '' : file.carpeta)
  return folder ? `${folder}/${file.nombre}` : file.nombre
}

const totalFolders = computed(() => {
  const files = repository.value?.files || []
  const folderSet = new Set()

  files.forEach((file) => {
    const folder = normalizePath(file.carpeta === 'raiz' ? '' : file.carpeta)
    if (!folder) return
    const parts = folder.split('/')
    let acc = ''
    parts.forEach((part) => {
      acc = acc ? `${acc}/${part}` : part
      folderSet.add(acc)
    })
  })

  return folderSet.size
})

const explorerEntries = computed(() => {
  const files = repository.value?.files || []
  const activePath = normalizePath(currentPath.value)
  const prefix = activePath ? `${activePath}/` : ''
  const folderMap = new Map()
  const fileEntries = []

  files.forEach((file) => {
    const fullPath = getFileFullPath(file)
    if (prefix && !fullPath.startsWith(prefix)) return

    const remainder = prefix ? fullPath.slice(prefix.length) : fullPath
    if (!remainder) return

    const parts = remainder.split('/')
    if (parts.length > 1) {
      const folderName = parts[0]
      const folderFullPath = normalizePath(
        activePath ? `${activePath}/${folderName}` : folderName,
      )

      const current = folderMap.get(folderFullPath) || {
        key: `folder-${folderFullPath}`,
        type: 'folder',
        name: folderName,
        fullPath: folderFullPath,
        count: 0,
      }
      current.count += 1
      folderMap.set(folderFullPath, current)
      return
    }

    fileEntries.push({
      key: `file-${file.id}`,
      type: 'file',
      name: file.nombre,
      file,
    })
  })

  const folderEntries = Array.from(folderMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  fileEntries.sort((a, b) => a.name.localeCompare(b.name))

  return [...folderEntries, ...fileEntries]
})

const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

const resolveApiUrl = (value) => {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value

  const serverBase = API_BASE.replace(/\/api\/?$/, '')
  const cleanValue = value.startsWith('/') ? value : `/${value}`
  return `${serverBase}${cleanValue}`
}

const getFilenameFromHeaders = (response, fallback) => {
  const disposition = response.headers.get('Content-Disposition') || ''
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match && utf8Match[1]) {
    return decodeURIComponent(utf8Match[1]).trim()
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
  if (plainMatch && plainMatch[1]) return plainMatch[1].trim()
  return fallback
}

const downloadBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 8000)
}

const fetchWithAuth = async (url) => {
  const token = getAuthToken()
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const triggerFolderUpload = () => {
  folderInputRef.value?.click()
}

const openCommitsView = () => {
  if (!repository.value?.id) return
  router.push(`/repositories/${repository.value.id}/commits`)
}

const uploadToRepository = async (files, keepRelativePath = false) => {
  if (!repository.value?.id || !files?.length) return

  const token = getAuthToken()
  const form = new FormData()
  const activePath = normalizePath(currentPath.value)

  files.forEach((file) => {
    const filename =
      keepRelativePath && file.webkitRelativePath
        ? file.webkitRelativePath
        : file.name
    const cleanRelativeName = filename.replace(/^\/+/, '')
    const targetRelativePath = activePath
      ? `${activePath}/${cleanRelativeName}`
      : cleanRelativeName

    form.append('files', file, file.name)
    form.append('relativePaths', targetRelativePath)
  })

  try {
    const response = await fetch(`${API_BASE}/repositories/${repository.value.id}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    })

    if (!response.ok) throw new Error('No se pudo subir')
    await loadRepository()
  } catch {
    errorMessage.value = 'No se pudieron subir los archivos.'
  }
}

const onFileInputChange = async (event) => {
  const files = Array.from(event.target?.files || [])
  await uploadToRepository(files, false)
  event.target.value = ''
}

const onFolderInputChange = async (event) => {
  const files = Array.from(event.target?.files || [])
  await uploadToRepository(files, true)
  event.target.value = ''
}

const openFolder = (pathValue) => {
  currentPath.value = normalizePath(pathValue)
}

const goToPath = (pathValue) => {
  currentPath.value = normalizePath(pathValue)
}

const openFile = async (file) => {
  try {
    const response = await fetchWithAuth(resolveApiUrl(file.openUrl))
    if (!response.ok) throw new Error('No se pudo abrir el archivo')

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    window.open(objectUrl, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(objectUrl), 15000)
  } catch {
    errorMessage.value = 'No se pudo abrir el archivo.'
  }
}

const downloadFile = async (file) => {
  try {
    const response = await fetchWithAuth(resolveApiUrl(file.downloadUrl))
    if (!response.ok) throw new Error('No se pudo descargar el archivo')

    const blob = await response.blob()
    const filename = getFilenameFromHeaders(response, file.nombre || 'archivo')
    downloadBlob(blob, filename)
  } catch {
    errorMessage.value = 'No se pudo descargar el archivo.'
  }
}

const deleteFile = async (file) => {
  if (!repository.value?.id) return

  try {
    const token = getAuthToken()
    const response = await fetch(
      `${API_BASE}/repositories/${repository.value.id}/files/${file.id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) throw new Error('No se pudo eliminar')
    await loadRepository()
  } catch {
    errorMessage.value = 'No se pudo eliminar el archivo.'
  }
}

const downloadRepository = async () => {
  if (!repository.value?.id) return
  isDownloadingRepo.value = true

  try {
    const response = await fetchWithAuth(`${API_BASE}/repositories/${repository.value.id}/download`)
    if (!response.ok) throw new Error('No se pudo descargar el repositorio')

    const blob = await response.blob()
    const fallbackName = `${repository.value.nombre || 'repositorio'}.zip`
    const filename = getFilenameFromHeaders(response, fallbackName)
    downloadBlob(blob, filename)
  } catch {
    errorMessage.value = 'No se pudo descargar el repositorio.'
  } finally {
    isDownloadingRepo.value = false
  }
}

const toggleVisibility = async () => {
  if (!repository.value) return

  repository.value.visibilidad =
    repository.value.visibilidad === 'public' ? 'private' : 'public'

  await saveRepositoryChanges()
}

const splitByComma = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const toggleStackSelection = (stack) => {
  if (selectedStacks.value.includes(stack)) {
    selectedStacks.value = selectedStacks.value.filter((item) => item !== stack)
    return
  }

  selectedStacks.value = [...selectedStacks.value, stack]
}

const toggleTagSelection = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((item) => item !== tag)
    return
  }

  selectedTags.value = [...selectedTags.value, tag]
}

const loadRepositoryOptions = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/repositories/options`)
    if (!response.ok) return

    const data = await response.json()
    const options = data?.options || {}
    stackOptions.value = Array.isArray(options.stacks) ? options.stacks : []
    tagOptions.value = Array.isArray(options.tags) ? options.tags : []
  } catch {
    // keep editing optional if options fail
  }
}

const runSyncAction = async (action) => {
  if (!repository.value?.id || syncBusy.value) return

  const token = getAuthToken()
  const message = syncMessageDraft.value.trim()
  syncBusy.value = true
  activeSyncAction.value = action
  syncStatusMessage.value = ''

  try {
    const response = await fetch(`${API_BASE}/repositories/${repository.value.id}/${action}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(payload?.message || `No se pudo ejecutar ${action}`)
    }

    syncStatusMessage.value =
      payload?.summary ||
      `Acción ${action} ejecutada correctamente.`

    if (action === 'commit' || action === 'push') {
      syncMessageDraft.value = ''
    }
  } catch (error) {
    syncStatusMessage.value = error?.message || `Falló la acción ${action}.`
  } finally {
    syncBusy.value = false
    activeSyncAction.value = ''
  }
}

const saveRepositoryChanges = async () => {
  if (!repository.value?.id) return

  const token = getAuthToken()
  const body = {
    nombre: editName.value ? draftNombre.value : repository.value.nombre,
    descripcion: editDescription.value
      ? draftDescripcion.value
      : repository.value.descripcion,
    tags: editTags.value ? selectedTags.value : repository.value.tags,
    stacks: editStacks.value
      ? selectedStacks.value
      : repository.value.stacks,
    visibilidad: repository.value.visibilidad,
  }

  try {
    const response = await fetch(`${API_BASE}/repositories/${repository.value.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error('No se pudo guardar')

  editName.value = false
    editDescription.value = false
    editTags.value = false
    editStacks.value = false
    await loadRepository()
  } catch {
    errorMessage.value = 'No se pudieron guardar los cambios del repositorio.'
  }
}

const loadRepository = async () => {
  const token = getAuthToken()
  const repositoryId = Number(route.params.id)

  if (!token || Number.isNaN(repositoryId)) {
    errorMessage.value = 'No se encontró el repositorio solicitado.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${API_BASE}/repositories/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      errorMessage.value = 'No se pudo cargar el repositorio.'
      return
    }

    const data = await response.json()
    const rows = Array.isArray(data?.repositories) ? data.repositories : []
    const found = rows.find((repo) => Number(repo.id) === repositoryId)

    if (!found) {
      errorMessage.value = 'Ese repositorio no existe o no te pertenece.'
      return
    }

    currentPath.value = ''
    repository.value = {
      id: found.id,
      nombre: found.nombre,
      descripcion: found.descripcion,
      visibilidad: found.visibilidad || 'public',
      estrellas: found.estrellas || 0,
      vistas: found.vistas || 0,
      pensum:
        found.pensum && typeof found.pensum === 'object'
          ? {
              id: found.pensum.id,
              nombre: found.pensum.nombre,
              vigente: found.pensum.vigente,
            }
          : null,
      curso:
        found.curso && typeof found.curso === 'object'
          ? {
              id: found.curso.id,
              codigo: found.curso.codigo,
              nombre: found.curso.nombre,
              semestre: found.curso.semestre,
              pensumId: found.curso.pensumId,
            }
          : null,
      tags: Array.isArray(found.tags) ? found.tags : [],
      stacks: Array.isArray(found.stacks) ? found.stacks : [],
      files: Array.isArray(found.files)
        ? found.files.map((file) => ({
            id: file.id,
            nombre: file.nombre || `Archivo #${file.id}`,
            carpeta: file.carpeta || 'raiz',
            openUrl: file.openUrl || `/api/files/${file.id}`,
            downloadUrl: file.downloadUrl || `/api/files/${file.id}?download=1`,
          }))
        : [],
    }

  draftNombre.value = repository.value.nombre || ''
  draftDescripcion.value = repository.value.descripcion || ''
  draftTags.value = repository.value.tags.join(', ')
  draftStacks.value = repository.value.stacks.join(', ')
  selectedTags.value = [...repository.value.tags]
  selectedStacks.value = [...repository.value.stacks]
  } catch {
    errorMessage.value = 'Error de red al cargar el repositorio.'
  } finally {
    isLoading.value = false
  }
}

const onSectionSelect = (section) => {
  if (section === 'dashboard') {
    router.push('/dashboard')
    return
  }
  if (section === 'upload') {
    router.push('/upload-repo')
  }
}

const logout = async () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
  sessionStorage.removeItem('authToken')
  sessionStorage.removeItem('authUser')
  await router.push('/login')
}

onMounted(async () => {
  await loadRepository()
  await loadRepositoryOptions()
})
</script>

<style scoped>
.repository-detail-page {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-primary);
  overflow-x: hidden;
}

.content {
  max-width: 1780px;
  margin: 0 auto;
  padding: 1.25rem clamp(1rem, 2.5vw, 1.5rem);
  box-sizing: border-box;
}

.back-btn {
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
}

.repo-layout {
  display: grid;
  grid-template-columns: minmax(250px, 300px) minmax(0, 2fr) minmax(250px, 350px);
  gap: 1rem;
  align-items: start;
  width: 100%;
}

.repo-main-card,
.repo-side-panel .side-card {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-surface);
}

.repo-main-card {
  overflow: hidden;
  min-width: 0;
}

.repo-side-panel {
  min-width: 0;
  display: grid;
  gap: 0.85rem;
  align-content: start;
}

.repo-main-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.repo-main-header h1 {
  margin: 0;
}

.visibility-pill {
  display: inline-flex;
  margin-top: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.visibility-pill.public {
  border-color: color-mix(in srgb, var(--success, #22c55e) 40%, var(--border-color));
  color: var(--success, #16a34a);
}

.visibility-pill.private {
  border-color: color-mix(in srgb, var(--warning, #f59e0b) 40%, var(--border-color));
  color: var(--warning, #d97706);
}

.primary-btn {
  border: 1px solid var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 14%, transparent);
  color: var(--accent-500);
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.primary-btn svg {
  width: 15px;
  height: 15px;
}

.primary-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.repo-toolbar {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 0.65rem;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-actions {
  display: inline-flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.repo-toolbar-right {
  display: inline-flex;
  margin-left: auto;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.icon-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-secondary);
  border-radius: 10px;
  padding: 0.42rem 0.62rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  line-height: 1;
  font-size: 0.84rem;
  white-space: nowrap;
  cursor: pointer;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.icon-btn:hover {
  border-color: var(--accent-500);
  color: var(--accent-500);
}

.hidden-input {
  display: none;
}

.repo-breadcrumb {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.crumb {
  border: none;
  background: transparent;
  color: var(--accent-500);
  cursor: pointer;
  padding: 0;
  font-size: 0.86rem;
}

.crumb.active {
  color: var(--text-primary);
  font-weight: 700;
}

.crumb-sep {
  color: var(--text-muted);
}

.repo-table {
  padding: 0.5rem 0;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.62rem 1rem;
}

.table-head {
  color: var(--text-muted);
  font-size: 0.8rem;
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  border-bottom: 1px solid color-mix(in srgb, var(--border-color) 65%, transparent);
}

.file-row {
  cursor: pointer;
}

.file-row:hover {
  background: color-mix(in srgb, var(--accent-500) 7%, transparent);
}

.entry-name {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--text-primary);
}

.folder-entry {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font: inherit;
  text-align: left;
}

.folder-entry:hover {
  color: var(--accent-500);
}

.entry-icon {
  width: 1.25rem;
  display: inline-flex;
  justify-content: center;
}

.entry-icon svg {
  width: 16px;
  height: 16px;
}

.folder-entry small {
  color: var(--text-muted);
  margin-left: 0.35rem;
}

.file-actions {
  display: inline-flex;
  gap: 0.45rem;
}

.file-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  font-size: 0.8rem;
}

.file-btn:hover {
  border-color: var(--accent-500);
  color: var(--accent-500);
}

.file-icon-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
}

.file-icon-btn svg {
  width: 15px;
  height: 15px;
}

.file-icon-btn:hover {
  border-color: var(--accent-500);
  color: var(--accent-500);
}

.file-icon-btn.danger:hover {
  border-color: var(--danger-500, #ef4444);
  color: var(--danger-500, #ef4444);
}

.side-card {
  padding: 0.85rem;
}

.side-card h3 {
  margin: 0 0 0.45rem;
}

.side-card p {
  margin: 0;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.side-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}

.icon-only {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
}

.icon-only svg {
  width: 14px;
  height: 14px;
}

.icon-only:hover {
  border-color: var(--accent-500);
  color: var(--accent-500);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.toggle-btn {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--bg-app);
  padding: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.toggle-knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: transform 0.2s ease;
}

.toggle-btn.on {
  border-color: var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 20%, transparent);
}

.toggle-btn.on .toggle-knob {
  background: var(--accent-500);
  transform: translateX(19px);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.stat-item {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.45rem 0.55rem;
  background: var(--bg-app);
  display: grid;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.editor-block {
  display: grid;
  gap: 0.45rem;
}

.editor-block textarea,
.editor-block input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-app);
  color: var(--text-primary);
  padding: 0.45rem 0.55rem;
  font: inherit;
  box-sizing: border-box;
}

.save-btn {
  border: 1px solid var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 14%, transparent);
  color: var(--accent-500);
  border-radius: 8px;
  padding: 0.35rem 0.65rem;
  justify-self: start;
  cursor: pointer;
  font-weight: 600;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.info-list {
  display: grid;
  gap: 0.85rem;
}

.info-item {
  display: grid;
  gap: 0.35rem;
}

.info-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.info-item p {
  margin: 0;
}

.chip {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  font-size: 0.82rem;
}

.chip.alt {
  background: color-mix(in srgb, var(--accent-500) 12%, transparent);
}

.chips.selectable {
  gap: 0.4rem;
}

.sync-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.sync-actions .save-btn {
  margin: 0;
}

.commit-list {
  display: grid;
  gap: 0.55rem;
}

.commit-item {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.5rem 0.6rem;
  background: var(--bg-app);
  display: grid;
  gap: 0.35rem;
}

.commit-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
}

.commit-action {
  text-transform: uppercase;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
}

.chip-btn {
  cursor: pointer;
  background: var(--bg-surface);
}

.chip-btn.selected {
  border-color: var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 18%, transparent);
  color: var(--accent-500);
}

.empty-state {
  margin: 0;
  padding: 1rem;
  color: var(--text-muted);
}

.state-message {
  margin: 1rem 0;
  color: var(--text-secondary);
}

.state-message.error {
  color: var(--danger-500, #ef4444);
}

.muted {
  color: var(--text-muted);
}

@media (max-width: 980px) {
  .repo-layout {
    grid-template-columns: 1fr;
  }

  .repo-main-card {
    order: 1;
  }

  .repo-side-panel--settings {
    order: 2;
  }

  .repo-side-panel--info {
    order: 3;
  }
}
</style>
