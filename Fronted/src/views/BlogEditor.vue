<template>
  <div class="editor-shell">
    <AppNavbar
      active-section="forum"
      :avatar-initials="userInitials"
      :search-value="''"
      @section-select="onNavbarSectionSelect"
      @profile="router.push('/profile')"
      @logout="logout"
    />

    <main class="editor-layout">
      <!-- Top bar -->
      <div class="editor-topbar">
        <button class="back-btn" @click="router.push('/Sysreditt')">
          <svg viewBox="0 0 24 24" class="back-icon"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Volver al foro
        </button>
        <div class="topbar-center">
          <div class="format-toggle">
            <button type="button" :class="['format-btn', { active: form.formato === 'blog' }]" @click="form.formato = 'blog'">
              <svg viewBox="0 0 24 24" class="fmt-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Blog
            </button>
            <button type="button" :class="['format-btn', { active: form.formato === 'articulo' }]" @click="form.formato = 'articulo'">
              <svg viewBox="0 0 24 24" class="fmt-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Artículo
            </button>
          </div>
        </div>
        <div class="topbar-right">
          <span class="word-count">{{ wordCount }} palabras · {{ readTime }} min</span>
          <button
            class="publish-btn"
            @click="submit"
            :disabled="saving || !form.title.trim() || !form.categoriaId"
          >
            <svg viewBox="0 0 24 24" class="pub-icon"><line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            {{ saving ? 'Publicando...' : (isEditing ? 'Guardar cambios' : 'Publicar') }}
          </button>
        </div>
      </div>

      <p v-if="error" class="error-banner">
        <svg viewBox="0 0 24 24" class="err-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        {{ error }}
      </p>

      <!-- Main editor area -->
      <div class="editor-body">
        <!-- Left: metadata panel -->
        <aside class="meta-panel">
          <div class="meta-card">
            <h3 class="meta-title">Detalles</h3>

            <div class="form-group">
              <label class="form-label">Categoría <span class="required">*</span></label>
              <select v-model="form.categoriaId" class="form-select">
                <option disabled value="">Selecciona...</option>
                <option v-for="cat in categoriasForo" :key="cat.id" :value="String(cat.id)">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>


            <div class="format-info">
              <svg viewBox="0 0 24 24" class="info-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span>{{ form.formato === 'articulo' ? 'Artículo: investigación y análisis.' : 'Blog: tutorial o guía práctica.' }}</span>
            </div>

            <!-- Cover image -->
            <div class="form-group">
              <label class="form-label">Portada</label>
              <div
                class="cover-dropzone"
                :class="{ dragging: isDraggingCover, 'has-cover': !!coverPreviewSrc }"
                @dragover="onCoverDragOver"
                @dragleave="onCoverDragLeave"
                @drop="onCoverDrop"
                @click="triggerCoverInput"
              >
                <input
                  id="cover-input"
                  ref="coverInputRef"
                  type="file"
                  class="cover-input-hidden"
                  accept="image/png,image/jpeg,image/webp"
                  @change="onCoverChange"
                />
                <template v-if="coverPreviewSrc">
                  <img :src="coverPreviewSrc" class="cover-thumb" alt="Portada" />
                </template>
                <template v-else>
                  <svg viewBox="0 0 24 24" class="cover-icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><polyline points="21 15 16 10 5 21" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  <span class="cover-hint">Clic o arrastrá imagen</span>
                  <small class="cover-small">JPG/PNG/WebP · máx 3MB</small>
                </template>
              </div>
              <button v-if="coverPreviewSrc" type="button" class="remove-cover-btn" @click.stop="clearCover">
                Quitar portada
              </button>
            </div>
          </div>
        </aside>

        <!-- Right: writing area -->
        <div class="writing-area">
          <!-- Title input -->
          <input
            v-model="form.title"
            class="title-input"
            :placeholder="form.formato === 'articulo' ? 'Título del artículo de investigación...' : 'Título del blog o tutorial...'"
            maxlength="300"
          />
          <div class="title-meta">
            <span class="char-count" :class="{ warn: form.title.length > 250 }">{{ form.title.length }}/300</span>
          </div>

          <!-- Toolbar -->
          <div class="toolbar">
            <div class="toolbar-group">
              <button type="button" class="tool-btn" title="Negrita (Ctrl+B)" @click.prevent="exec('bold')">
                <svg viewBox="0 0 24 24" class="tool-icon"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button type="button" class="tool-btn" title="Cursiva (Ctrl+I)" @click.prevent="exec('italic')">
                <svg viewBox="0 0 24 24" class="tool-icon"><line x1="19" y1="4" x2="10" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="20" x2="5" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="4" x2="9" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button type="button" class="tool-btn" title="Subrayado" @click.prevent="exec('underline')">
                <svg viewBox="0 0 24 24" class="tool-icon"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>
            <div class="toolbar-sep"></div>
            <div class="toolbar-group">
              <button type="button" class="tool-btn" title="Título H2" @click.prevent="exec('formatBlock', 'h2')">
                <svg viewBox="0 0 24 24" class="tool-icon"><path d="M4 6h16M4 12h16M4 18h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button type="button" class="tool-btn" title="Cita" @click.prevent="exec('formatBlock', 'blockquote')">
                <svg viewBox="0 0 24 24" class="tool-icon"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>
            <div class="toolbar-sep"></div>
            <div class="toolbar-group">
              <button type="button" class="tool-btn" title="Lista sin orden" @click.prevent="exec('insertUnorderedList')">
                <svg viewBox="0 0 24 24" class="tool-icon"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button type="button" class="tool-btn" title="Lista numerada" @click.prevent="exec('insertOrderedList')">
                <svg viewBox="0 0 24 24" class="tool-icon"><line x1="10" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 6h1v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 10h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>
            <div class="toolbar-sep"></div>
            <div class="toolbar-group">
              <button type="button" class="tool-btn" title="Insertar enlace" @click.prevent="makeLink">
                <svg viewBox="0 0 24 24" class="tool-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button type="button" class="tool-btn tool-btn-danger" title="Quitar formato" @click.prevent="exec('removeFormat')">
                <svg viewBox="0 0 24 24" class="tool-icon"><path d="M4 7V4h16v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 20h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 4v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>

          <!-- Content editor — BUG FIX: no v-html binding, initialized in onMounted -->
          <div
            ref="editorRef"
            class="editor-content"
            contenteditable="true"
            :data-placeholder="form.formato === 'articulo' ? 'Escribe tu artículo de investigación...' : 'Escribe tu blog o tutorial...'"
            @input="onEditorInput"
            @keydown="onEditorKeydown"
          ></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import { clearAuthSession, getAuthToken, getAuthUser, hasRole } from '../utils/authSession'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const BACKEND_BASE = API_BASE.replace(/\/api\/?$/, '')
const router = useRouter()
const route = useRoute()

const userInitials = computed(() => {
  const u = getAuthUser()
  if (!u?.nombre) return 'US'
  return u.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

const onNavbarSectionSelect = (section) => {
  if (section === 'dashboard') router.push('/dashboard')
  else if (section === 'upload') router.push('/upload-repo')
  else if (section === 'forum') router.push('/Sysreditt')
}

const logout = async () => {
  clearAuthSession()
  await router.push('/login')
}

// ── Roles ─────────────────────────────────────────────────────────────────────
const canAuxiliar = computed(() => hasRole('auxiliar') || hasRole('admin'))
const canModerator = computed(() => hasRole('moderador') || hasRole('admin'))
const canPublishBlogs = computed(() => {
  if (canAuxiliar.value || canModerator.value) return true
  return hasRole('publicador_blog') || hasRole('editor_blog') || hasRole('autor_blog')
})

// ── State ─────────────────────────────────────────────────────────────────────
const categoriasForo = ref([])
const tiposForo = ref([])
const saving = ref(false)
const error = ref('')
const coverPreviewUrl = ref('')
const isDraggingCover = ref(false)
const editorRef = ref(null)
const coverInputRef = ref(null)

const form = reactive({
  title: '',
  categoriaId: '',
  tipoId: '',
  content: '',
  formato: 'blog',
  coverImageUrl: '',
})

const isEditing = computed(() => Boolean(route.params.id) && route.path.endsWith('/edit'))

// ── Word count & read time ────────────────────────────────────────────────────
const wordCount = computed(() => {
  const text = form.content.replace(/<[^>]+>/g, ' ').trim()
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
})

const readTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)))

// ── Editor ────────────────────────────────────────────────────────────────────
function exec(command, value) {
  try {
    editorRef.value?.focus()
    document.execCommand(command, false, value ?? null)
    onEditorInput()
  } catch (e) {
    console.warn('Editor command failed', command, e)
  }
}

function makeLink() {
  const url = prompt('URL del enlace (incluye https://)')
  if (url) exec('createLink', url)
}

function onEditorInput() {
  if (!editorRef.value) return
  form.content = editorRef.value.innerHTML || ''
}

// Ensure Enter creates <p> tags not <div> for better rendering
function onEditorKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    exec('insertParagraph')
  }
}

// ── Cover ─────────────────────────────────────────────────────────────────────
const coverPreviewSrc = computed(() => {
  if (coverPreviewUrl.value) return coverPreviewUrl.value
  if (form.coverImageUrl) {
    return /^https?:\/\//i.test(form.coverImageUrl)
      ? form.coverImageUrl
      : `${BACKEND_BASE}${form.coverImageUrl}`
  }
  return ''
})

function triggerCoverInput() {
  coverInputRef.value?.click()
}

async function uploadCover(file) {
  if (!file) return
  coverPreviewUrl.value = URL.createObjectURL(file)
  const formData = new FormData()
  formData.append('file', file)
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}/sysreddit/blogs/cover`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `Error ${res.status}`)
  }
  const data = await res.json()
  form.coverImageUrl = data.url ?? ''
}

async function onCoverChange(e) {
  const file = e?.target?.files?.[0]
  if (!file) return
  try { await uploadCover(file) } catch (e) { error.value = e.message }
}

function onCoverDragOver(e) { e.preventDefault(); isDraggingCover.value = true }
function onCoverDragLeave() { isDraggingCover.value = false }
async function onCoverDrop(e) {
  e.preventDefault(); isDraggingCover.value = false
  const file = e?.dataTransfer?.files?.[0]
  if (!file) return
  try { await uploadCover(file) } catch (e) { error.value = e.message }
}
function clearCover() { form.coverImageUrl = ''; coverPreviewUrl.value = '' }

// ── Tipo options ──────────────────────────────────────────────────────────────
const blogTipoOptions = computed(() =>
  tiposForo.value.filter(t => /blog|art[íi]culo|tutorial|investigaci[oó]n/i.test(t.nombre ?? ''))
)
const blogTipoOptionsByFormat = computed(() => {
  if (form.formato === 'articulo')
    return blogTipoOptions.value.filter(t => /art[íi]culo|investigaci[oó]n/i.test(t.nombre ?? ''))
  return blogTipoOptions.value.filter(t => /blog|tutorial/i.test(t.nombre ?? ''))
})

// ── API ───────────────────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `Error ${res.status}`)
  }
  return res.json()
}

async function loadCatalogos() {
  const [catsRes, tiposRes] = await Promise.all([
    api('/sysreddit/categorias'),
    api('/sysreddit/tipos'),
  ])
  categoriasForo.value = catsRes.categorias ?? []
  tiposForo.value = tiposRes.tipos ?? []
}

async function loadBlog() {
  if (!isEditing.value) return
  const id = Number(route.params.id)
  if (!id) return
  const kind = route.query.kind ? String(route.query.kind) : undefined
  const query = kind ? `?kind=${encodeURIComponent(kind)}` : ''
  const data = await api(`/sysreddit/blogs/${id}${query}`)
  const blog = data.blog
  if (!blog) return
  form.title = blog.titulo ?? ''
  form.categoriaId = blog.categoriaId ? String(blog.categoriaId) : ''
  form.tipoId = blog.tipoId ? String(blog.tipoId) : ''
  form.content = blog.contenido ?? ''
  form.coverImageUrl = blog.coverImageUrl ?? ''
  form.formato = blog.kind ?? (/art[íi]culo|investigaci[oó]n/i.test(blog.tipo ?? '') ? 'articulo' : 'blog')
  // Set editor content after DOM is ready
  if (editorRef.value) editorRef.value.innerHTML = form.content
}

function sanitizeHtmlLight(html) {
  if (!html) return ''
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/ on\w+="[\s\S]*?"/gi, '')
    .replace(/ on\w+='[\s\S]*?'/gi, '')
}

async function submit() {
  if (!canPublishBlogs.value) { error.value = 'No tienes permiso para publicar.'; return }
  if (!form.title.trim() || !form.categoriaId) { error.value = 'Completa título y categoría.'; return }
  if (!form.content.trim()) { error.value = 'El contenido no puede estar vacío.'; return }

  saving.value = true
  error.value = ''
  try {
    let tipoId = form.tipoId ? Number(form.tipoId) : blogTipoOptionsByFormat.value[0]?.id
    const body = {
      titulo: form.title,
      contenido: sanitizeHtmlLight(form.content),
      categoriaId: Number(form.categoriaId),
      tipoId,
      formato: form.formato,
      coverImageUrl: form.coverImageUrl || undefined,
    }
    const endpoint = form.formato === 'articulo' ? '/sysreddit/articulos' : '/sysreddit/blogs'
    if (isEditing.value) {
      await api(`${endpoint}/${route.params.id}`, { method: 'PATCH', body: JSON.stringify(body) })
    } else {
      await api(endpoint, { method: 'POST', body: JSON.stringify(body) })
    }
    router.push('/Sysreditt')
  } catch (e) {
    error.value = e.message ?? 'No se pudo guardar.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadCatalogos()
  await loadBlog()
  if (!canPublishBlogs.value) error.value = 'No tienes permiso para publicar blogs/artículos.'
})

watch(() => form.formato, () => { form.tipoId = '' })
</script>

<style scoped>
/* ── Shell ─────────────────────────────────────────────────────────────────── */
.editor-shell {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-primary);
}

.editor-layout {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

/* ── Top bar ─────────────────────────────────────────────────────────────────── */
.editor-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  position: sticky;
  top: 0;
  background: var(--bg-app);
  z-index: 10;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  color: var(--text-soft);
  padding: 0.4rem 0.9rem 0.4rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.back-btn:hover { border-color: var(--accent-500); color: var(--accent-500); }
.back-icon { width: 16px; height: 16px; }

.topbar-center { flex: 1; display: flex; justify-content: center; }

.format-toggle {
  display: inline-flex;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 3px;
  gap: 3px;
}

.format-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.format-btn.active {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  color: var(--accent-contrast, #fff);
}

.fmt-icon { width: 14px; height: 14px; }

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.word-count {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.publish-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  color: var(--accent-contrast, #fff);
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.publish-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.publish-btn:hover:not(:disabled) { opacity: 0.88; }
.pub-icon { width: 15px; height: 15px; }

/* ── Error banner ─────────────────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: color-mix(in srgb, #ef4444 12%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
  color: #f87171;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.88rem;
}

.err-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* ── Main body layout ────────────────────────────────────────────────────── */
.editor-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* ── Meta panel ──────────────────────────────────────────────────────────── */
.meta-panel {
  position: sticky;
  top: 5rem;
}

.meta-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.meta-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.form-group { display: grid; gap: 0.4rem; }

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-soft);
}

.required { color: var(--accent-500); }

.form-select {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus { outline: none; border-color: var(--accent-500); }

.format-info {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  background: color-mix(in srgb, var(--accent-500) 8%, transparent);
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  font-size: 0.78rem;
  color: var(--text-soft);
}

.info-icon { width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; color: var(--accent-500); }

/* Cover */
.cover-dropzone {
  border: 1.5px dashed var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 100px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: center;
  overflow: hidden;
}

.cover-dropzone:hover,
.cover-dropzone.dragging { border-color: var(--accent-500); background: color-mix(in srgb, var(--accent-500) 6%, transparent); }

.cover-dropzone.has-cover { padding: 0; border-style: solid; }

.cover-input-hidden { display: none; }

.cover-icon { width: 28px; height: 28px; color: var(--text-muted); }
.cover-hint { font-size: 0.8rem; color: var(--text-soft); }
.cover-small { font-size: 0.72rem; color: var(--text-muted); }

.cover-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  max-height: 140px;
}

.remove-cover-btn {
  background: none;
  border: none;
  color: #f87171;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0.2rem 0;
  text-align: left;
}

/* ── Writing area ─────────────────────────────────────────────────────────── */
.writing-area {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  overflow: hidden;
}

.title-input {
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1.3;
  padding: 1.5rem 1.5rem 0.5rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  resize: none;
  font-family: inherit;
}

.title-input::placeholder { color: var(--text-muted); }

.title-meta {
  display: flex;
  justify-content: flex-end;
  padding: 0 1.5rem 0.5rem;
}

.char-count {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.char-count.warn { color: #f59e0b; }

/* ── Toolbar ─────────────────────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-surface) 80%, var(--bg-app));
  flex-wrap: wrap;
}

.toolbar-group { display: flex; align-items: center; gap: 0.15rem; }

.toolbar-sep {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 0.25rem;
}

.tool-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tool-btn:hover { background: color-mix(in srgb, var(--accent-500) 10%, transparent); color: var(--accent-500); }
.tool-btn-danger:hover { background: color-mix(in srgb, #ef4444 10%, transparent); color: #f87171; }
.tool-icon { width: 15px; height: 15px; }

/* ── Content editor — THE FIX ─────────────────────────────────────────────── */
.editor-content {
  min-height: 480px;
  padding: 1.25rem 1.5rem 2rem;
  outline: none;
  line-height: 1.75;
  font-size: 1rem;
  color: var(--text-primary);
  /* NO white-space: pre-wrap — eso causaba el bug de scroll */
  word-break: break-word;
  overflow-wrap: break-word;
}

.editor-content:empty::before {
  content: attr(data-placeholder);
  color: var(--text-muted);
  pointer-events: none;
}

/* Rich text styles inside the editor */
.editor-content :deep(p) { margin: 0 0 0.9rem; }
.editor-content :deep(p:last-child) { margin-bottom: 0; }
.editor-content :deep(h2) { font-size: 1.4rem; font-weight: 800; margin: 1.5rem 0 0.6rem; }
.editor-content :deep(h3) { font-size: 1.1rem; font-weight: 700; margin: 1.2rem 0 0.5rem; }
.editor-content :deep(blockquote) {
  border-left: 3px solid var(--accent-500);
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  color: var(--text-soft);
  font-style: italic;
  background: color-mix(in srgb, var(--accent-500) 5%, transparent);
  border-radius: 0 8px 8px 0;
}
.editor-content :deep(ul), .editor-content :deep(ol) { margin: 0.5rem 0 0.9rem 1.25rem; }
.editor-content :deep(li) { margin-bottom: 0.3rem; }
.editor-content :deep(a) { color: var(--accent-500); text-decoration: underline; }
.editor-content :deep(strong) { font-weight: 700; }
.editor-content :deep(em) { font-style: italic; }
.editor-content :deep(code) {
  background: color-mix(in srgb, var(--accent-500) 10%, transparent);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .editor-body { grid-template-columns: 1fr; }
  .meta-panel { position: static; }
  .editor-topbar { flex-wrap: wrap; gap: 0.75rem; }
  .topbar-center { order: 3; width: 100%; }
  .word-count { display: none; }
}
</style>