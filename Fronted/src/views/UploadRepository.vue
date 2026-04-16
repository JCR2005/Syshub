<template>
  <div class="upload-shell">
    <AppNavbar
      active-section="upload"
      :avatar-initials="userInitials"
      :search-value="navbarSearch"
      @update:searchValue="navbarSearch = $event"
      @section-select="onNavbarSectionSelect"
      @profile="router.push('/profile')"
      @logout="logout"
    />

    <main class="upload-content">
      <header class="page-header">
        <h1>Subir proyecto académico</h1>
        <p>Comparte tu trabajo con la comunidad y recibe retroalimentación de compañeros y docentes</p>
      </header>

      <div v-if="uploading" class="feedback feedback--info">
        <div class="progress-track">
          <div :style="{ width: progress + '%' }" class="progress-bar"></div>
        </div>
        <small>Subiendo... {{ progress }}%</small>
      </div>

      <div v-if="resultMessage" :class="['feedback', resultType === 'error' ? 'feedback--error' : 'feedback--success']">
        {{ resultMessage }}
      </div>

      <form @submit.prevent="submit" class="upload-card">
        <div class="field-group">
          <label class="field-label">Título del proyecto</label>
          <input
            v-model="form.nombre"
            required
            class="field-input"
            placeholder="Ej.: Aplicación web de comercio electrónico con React"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Descripción</label>
          <textarea
            v-model="form.descripcion"
            required
            class="field-input field-textarea"
            rows="6"
            placeholder="Describe tu proyecto, sus funcionalidades y lo que aprendiste..."
          ></textarea>
          <small class="field-hint" :class="{ 'field-hint--warn': form.descripcion.length > 0 && form.descripcion.length < 50 }">
            Mínimo 50 caracteres. ¡Sé descriptivo!
          </small>
        </div>

        <div class="field-group">
          <label class="field-label">Stack tecnológico</label>
          <div class="suggestion-list">
            <button
              v-for="item in suggestedStacks"
              :key="item"
              type="button"
              class="suggestion-chip"
              :class="{ 'suggestion-chip--active': stacks.includes(item) }"
              @click="toggleStack(item)"
            >
              {{ item }}
            </button>
          </div>
          <div class="chip-list" v-if="stacks.length">
            <span v-for="(stack, index) in stacks" :key="stack + index" class="chip">
              {{ stack }}
              <button type="button" @click="removeStack(index)" class="chip-remove" aria-label="Eliminar stack">✕</button>
            </span>
          </div>
          <small class="field-hint">Selecciona stacks desde el catálogo administrado.</small>
        </div>

        <div class="field-group">
          <label class="field-label">Etiquetas</label>
          <div class="suggestion-list">
            <button
              v-for="item in suggestedTags"
              :key="item"
              type="button"
              class="suggestion-chip"
              :class="{ 'suggestion-chip--active': tags.includes(item) }"
              @click="toggleTag(item)"
            >
              {{ item }}
            </button>
          </div>
          <div class="chip-list" v-if="tags.length">
            <span v-for="(tag, index) in tags" :key="tag + index" class="chip">
              {{ tag }}
              <button type="button" @click="removeTag(index)" class="chip-remove" aria-label="Eliminar etiqueta">✕</button>
            </span>
          </div>
          <small class="field-hint">Selecciona tags desde el catálogo administrado.</small>
        </div>

        <div class="field-group">
          <label class="field-label" for="pensum-select">Pensum</label>
          <select id="pensum-select" v-model="form.pensumId" class="field-input">
            <option value="">Sin pensum</option>
            <option v-for="pensum in suggestedPensums" :key="pensum.id" :value="String(pensum.id)">
              {{ pensum.nombre }}
            </option>
          </select>
          <small class="field-hint">Opcional. Se carga desde clasificaciones de administración.</small>
        </div>

        <div class="field-group">
          <label class="field-label" for="curso-select">Curso</label>
          <select id="curso-select" v-model="form.cursoId" class="field-input" :disabled="!availableCourses.length">
            <option value="">Sin curso</option>
            <option v-for="course in availableCourses" :key="course.id" :value="String(course.id)">
              {{ course.codigo }} — {{ course.nombre }} (Sem. {{ course.semestre }})
            </option>
          </select>
          <small class="field-hint">
            {{
              form.pensumId
                ? 'Se muestran solo cursos del pensum seleccionado.'
                : 'Puedes seleccionar cualquier curso o elegir primero un pensum para filtrar.'
            }}
          </small>
        </div>

        <div class="field-group">
          <label class="field-label">Archivos del proyecto</label>

          <div @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop" :class="['dropzone', { 'dropzone--active': dragging }]">
            <input ref="fileInput" type="file" multiple accept=".zip,.pdf,.rar" @change="onFiles" class="hidden" />

            <svg viewBox="0 0 24 24" class="cloud-icon" aria-hidden="true">
              <path d="M20 16.5A3.5 3.5 0 0 0 16.5 13h-.1a5.4 5.4 0 0 0-10.2 2.1A3.4 3.4 0 0 0 6.5 22h12A3.5 3.5 0 0 0 20 16.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="m12 12 0 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="m9.4 14.6 2.6-2.6 2.6 2.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>

            <h3 class="dropzone-title">Arrastra y suelta archivos aquí</h3>
            <p class="dropzone-subtitle">o haz clic para buscarlos</p>

            <button type="button" class="secondary-btn" @click="browseFiles">Buscar archivos</button>

            <small class="dropzone-hint">Formatos permitidos: .zip, .pdf, .rar (Máx. 50MB)</small>
          </div>

          <ul v-if="selectedFiles.length" class="file-list">
            <li v-for="(file, index) in selectedFiles" :key="file.name + index" class="file-item">
              <div>
                <p class="file-name">{{ file.name }}</p>
                <p class="file-size">{{ formatSize(file.size) }}</p>
              </div>
              <button type="button" class="icon-remove" @click="removeFile(index)" aria-label="Eliminar archivo">✕</button>
            </li>
          </ul>
        </div>

        <div class="actions-row">
          <button type="button" class="secondary-btn" @click="goDashboard" :disabled="uploading">Cancelar</button>
          <button type="submit" class="primary-btn" :disabled="uploading">
            {{ uploading ? 'Subiendo...' : 'Publicar repositorio' }}
          </button>
        </div>
      </form>

      
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import useRepository from '../composables/useRepository'
import AppNavbar from '../components/AppNavbar.vue'

const router = useRouter()
const form = ref({ nombre: '', descripcion: '', ownerId: 1, pensumId: '', cursoId: '' })
const stacks = ref([])
const tags = ref([])
const selectedFiles = ref([])
const uploading = ref(false)
const progress = ref(0)
const resultMessage = ref('')
const resultType = ref('success')
const dragging = ref(false)
const fileInput = ref(null)
const navbarSearch = ref('')

const { uploadRepository } = useRepository()

const allowedTypes = ['application/zip', 'application/x-zip-compressed', 'application/pdf', 'application/x-rar-compressed', 'application/octet-stream']
const maxSize = 50 * 1024 * 1024
const suggestedStacks = ref([])
const suggestedTags = ref([])
const suggestedPensums = ref([])
const suggestedCourses = ref([])

const availableCourses = computed(() => {
  if (!form.value.pensumId) return suggestedCourses.value
  return suggestedCourses.value.filter(course => String(course.pensumId) === String(form.value.pensumId))
})

const userInitials = computed(() => {
  try {
    const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
    if (!raw) return 'US'
    const user = JSON.parse(raw)
    const name = user?.nombre || user?.name || 'Usuario Syshub'
    return String(name)
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  } catch {
    return 'US'
  }
})

function goDashboard () {
  router.push('/dashboard')
}

function goForum () {
  router.push('/dashboard')
}

function onNavbarSectionSelect (section) {
  if (section === 'dashboard') {
    goDashboard()
    return
  }

  if (section === 'forum') {
    goForum()
    return
  }

  if (section === 'upload') {
    router.push('/upload-repo')
  }
}

async function logout () {
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
  sessionStorage.removeItem('authToken')
  sessionStorage.removeItem('authUser')
  await router.push('/login')
}

function onFiles (event) {
  const list = event.target?.files ? Array.from(event.target.files) : []
  addFiles(list)
}

function onDrop (event) {
  dragging.value = false
  const list = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : []
  addFiles(list)
}

function onDragOver () {
  dragging.value = true
}

function onDragLeave () {
  dragging.value = false
}

function browseFiles () {
  fileInput.value?.click()
}

function addFiles (list) {
  for (const file of list) {
    if (file.size > maxSize) continue
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const extAllowed = ['zip', 'pdf', 'rar']
    if (!allowedTypes.includes(file.type) && !extAllowed.includes(ext)) continue

    const duplicate = selectedFiles.value.some(f => f.name === file.name && f.size === file.size)
    if (!duplicate) {
      selectedFiles.value.push(file)
    }
  }
}

function removeFile (index) {
  selectedFiles.value.splice(index, 1)
}

function formatSize (size) {
  if (!size) return '0 B'
  const kb = 1024
  if (size < kb) return `${size} B`
  if (size < kb * kb) return `${(size / kb).toFixed(1)} KB`
  return `${(size / (kb * kb)).toFixed(2)} MB`
}

function removeStack (index) {
  stacks.value.splice(index, 1)
}

function toggleStack (value) {
  const idx = stacks.value.indexOf(value)
  if (idx === -1) stacks.value.push(value)
  else stacks.value.splice(idx, 1)
}

function removeTag (index) {
  tags.value.splice(index, 1)
}

function toggleTag (value) {
  const idx = tags.value.indexOf(value)
  if (idx === -1) tags.value.push(value)
  else tags.value.splice(idx, 1)
}

function setError (message) {
  resultType.value = 'error'
  resultMessage.value = message
}

async function loadRepositoryOptions () {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  if (!token) return

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/repositories/options`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) return
    const payload = await response.json().catch(() => null)
    const options = payload?.options || {}

    suggestedStacks.value = Array.isArray(options.stacks) ? options.stacks : []
    suggestedTags.value = Array.isArray(options.tags) ? options.tags : []
    suggestedPensums.value = Array.isArray(options.pensums) ? options.pensums : []
    suggestedCourses.value = Array.isArray(options.courses) ? options.courses : []
  } catch {
    // keep form available even if options are temporarily unavailable
  }
}

watch(
  () => form.value.pensumId,
  () => {
    if (!form.value.cursoId) return
    const existsInAvailable = availableCourses.value.some(
      (course) => String(course.id) === String(form.value.cursoId),
    )
    if (!existsInAvailable) {
      form.value.cursoId = ''
    }
  },
)

async function submit () {
  if (!form.value.nombre.trim() || !form.value.descripcion.trim()) {
    setError('El título y la descripción son obligatorios.')
    return
  }

  if (form.value.descripcion.trim().length < 50) {
    setError('La descripción debe tener al menos 50 caracteres.')
    return
  }

  uploading.value = true
  progress.value = 0
  resultMessage.value = ''

  try {
    const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
    if (raw) {
      const user = JSON.parse(raw)
      form.value.ownerId = user.id || user.id_usuario || user.userId || form.value.ownerId
    }
  } catch {}

  try {
    await uploadRepository(
      {
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        ownerId: form.value.ownerId,
        tags: tags.value,
        stacks: stacks.value,
        pensumId: form.value.pensumId ? Number(form.value.pensumId) : undefined,
        cursoId: form.value.cursoId ? Number(form.value.cursoId) : undefined,
      },
      selectedFiles.value,
      (value) => {
        progress.value = value
      },
    )

    resultType.value = 'success'
    resultMessage.value = 'Repositorio publicado exitosamente.'
  } catch (error) {
    setError(error?.message || 'La carga falló debido a un error inesperado.')
  } finally {
    uploading.value = false
  }
}

onMounted(async () => {
  await loadRepositoryOptions()
})
</script>

<style scoped>
.upload-shell {
  min-height: 100vh;
  background: var(--bg-app);
}

.upload-content {
  max-width: 780px;
  margin: 0 auto;
  padding: 1.6rem 1rem 3rem;
}

.page-header h1 {
  font-size: clamp(1.6rem, 2.4vw, 2.1rem);
  margin-bottom: 0.3rem;
}

.page-header p {
  color: var(--text-muted);
}

.feedback {
  margin-top: 1rem;
  border-radius: 0.75rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--border-color);
}

.feedback--info {
  background: var(--bg-surface-alt);
}

.feedback--error {
  border-color: color-mix(in srgb, var(--error) 30%, var(--border-color));
  background: color-mix(in srgb, var(--error) 14%, transparent);
}

.feedback--success {
  border-color: color-mix(in srgb, var(--success) 30%, var(--border-color));
  background: color-mix(in srgb, var(--success) 14%, transparent);
}

.progress-track {
  width: 100%;
  height: 0.64rem;
  border-radius: 999px;
  overflow: hidden;
  background: var(--bg-muted);
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  transition: width 0.2s ease;
}

.upload-card {
  margin-top: 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 0.95rem;
  padding: 1.3rem;
  display: grid;
  gap: 1.2rem;
}

.field-group {
  display: grid;
  gap: 0.5rem;
}

.field-label {
  font-weight: 700;
}

.field-input {
  width: 100%;
  border-radius: 0.65rem;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-alt);
  color: var(--text-primary);
  padding: 0.68rem 0.78rem;
  outline: none;
}

.field-input:focus {
  border-color: var(--accent-500);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.field-input::placeholder {
  color: var(--text-soft);
}

.field-textarea {
  min-height: 7.6rem;
  resize: vertical;
}

.field-hint {
  color: var(--text-muted);
  font-size: 0.78rem;
}

.field-hint--warn {
  color: var(--warning);
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.suggestion-chip {
  border: 1px solid var(--border-color);
  background: var(--bg-surface-alt);
  color: var(--text-muted);
  border-radius: 999px;
  padding: 0.25rem 0.66rem;
  font-size: 0.78rem;
  cursor: pointer;
}

.suggestion-chip--active {
  border-color: color-mix(in srgb, var(--accent-500) 40%, var(--border-color));
  background: var(--accent-soft);
  color: var(--accent-500);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 999px;
  padding: 0.25rem 0.66rem;
  border: 1px solid color-mix(in srgb, var(--accent-500) 26%, var(--border-color));
  background: var(--accent-soft);
  color: var(--text-primary);
  font-size: 0.82rem;
}

.chip-remove {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.dropzone {
  border-radius: 0.85rem;
  border: 2px dashed var(--border-strong);
  background: color-mix(in srgb, var(--bg-surface-alt) 88%, transparent);
  text-align: center;
  padding: 1.7rem 0.9rem;
}

.dropzone--active {
  border-color: var(--accent-500);
  background: color-mix(in srgb, var(--accent-soft) 35%, transparent);
}

.cloud-icon {
  width: 3.6rem;
  height: 3.6rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.dropzone-title {
  margin-bottom: 0.2rem;
}

.dropzone-subtitle {
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.dropzone-hint {
  display: block;
  margin-top: 0.65rem;
  color: var(--text-soft);
}

.file-list {
  list-style: none;
  display: grid;
  gap: 0.55rem;
  margin-top: 0.75rem;
}

.file-item {
  border: 1px solid var(--border-color);
  background: var(--bg-surface-alt);
  border-radius: 0.65rem;
  padding: 0.56rem 0.7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.file-size {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.icon-remove {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
}

.icon-remove:hover {
  color: var(--text-primary);
}

.actions-row {
  display: flex;
  gap: 0.65rem;
  padding-top: 0.4rem;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  border-radius: 0.65rem;
  padding: 0.6rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  border: none;
  color: var(--accent-contrast);
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
}

.secondary-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-surface-alt);
  color: var(--text-primary);
}

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.guidelines-card {
  margin-top: 1rem;
  border-radius: 0.95rem;
  border: 1px solid color-mix(in srgb, var(--accent-500) 24%, var(--border-color));
  background: linear-gradient(145deg, color-mix(in srgb, var(--accent-soft) 25%, transparent), transparent 80%);
  padding: 1rem;
}

.guidelines-card h3 {
  margin-bottom: 0.4rem;
}

.guidelines-card ul {
  padding-left: 1.1rem;
  display: grid;
  gap: 0.22rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.hidden {
  display: none;
}

@media (max-width: 620px) {
  .upload-content {
    padding: 1rem 0.7rem 2.4rem;
  }

  .upload-card {
    padding: 1rem;
  }

  .actions-row {
    flex-direction: column;
  }
}
</style>
