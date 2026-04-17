<template>
  <div class="reader-shell">
    <AppNavbar
      active-section="forum"
      :avatar-initials="userInitials"
      :search-value="''"
      @section-select="onNavbarSectionSelect"
      @profile="router.push('/profile')"
      @logout="logout"
    />

    <!-- Reading progress bar -->
    <div class="progress-bar" :style="{ width: readProgress + '%' }"></div>

    <main class="reader-layout">
      <!-- Loading -->
      <div v-if="loading" class="reader-loading">
        <div class="loading-shimmer title-shimmer"></div>
        <div class="loading-shimmer meta-shimmer"></div>
        <div class="loading-shimmer body-shimmer"></div>
        <div class="loading-shimmer body-shimmer short"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="reader-error">
        <svg viewBox="0 0 24 24" class="error-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <p>{{ error }}</p>
        <button class="ghost" @click="router.push('/Sysreditt')">Volver al foro</button>
      </div>

      <!-- Content -->
      <article v-else-if="blog" class="reader-article" ref="articleRef">
        <!-- Back + actions row -->
        <div class="reader-nav">
          <button class="back-btn" @click="router.push('/Sysreditt')">
            <svg viewBox="0 0 24 24" class="back-icon"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Volver al foro
          </button>
          <div class="nav-actions">
            <button v-if="canEdit" class="edit-btn" @click="editBlog">
              <svg viewBox="0 0 24 24" class="edit-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Editar
            </button>
          </div>
        </div>

        <!-- Article header -->
        <header class="article-header">
          <!-- Badges -->
          <div class="article-badges">
            <span :class="['editorial-badge', editorialKind]">
              <svg v-if="editorialKind === 'articulo'" viewBox="0 0 24 24" class="badge-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <svg v-else viewBox="0 0 24 24" class="badge-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              {{ editorialLabel }}
            </span>
            <span v-if="blog.categoria" class="category-badge">{{ blog.categoria }}</span>
          </div>

          <!-- Title -->
          <h1 class="article-title">{{ blog.titulo }}</h1>

          <!-- Author row -->
          <div class="author-row">
            <div class="author-avatar">{{ (blog.author || '?').slice(0, 1).toUpperCase() }}</div>
            <div class="author-info">
              <div class="author-name-row">
                <span class="author-name">{{ blog.author }}</span>
                <span :class="['role-chip', blog.role?.toLowerCase?.() || 'student']">{{ blog.role }}</span>
              </div>
              <div class="article-meta">
                <span>{{ blog.timeAgo }}</span>
                <span class="meta-dot">·</span>
                <span>{{ readTime }} min de lectura</span>
                <span class="meta-dot">·</span>
                <span>{{ blog.commentCount ?? 0 }} comentarios</span>
              </div>
            </div>
            <!-- Vote actions inline -->
            <div class="vote-row">
              <button class="vote-btn-inline up" :class="{ active: blog.hasUpvoted }" @click="voteBlog(true)">
                <svg viewBox="0 0 24 24" class="vote-icon"><polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ blog.upvotes ?? 0 }}
              </button>
              <button class="vote-btn-inline down" @click="voteBlog(false)">
                <svg viewBox="0 0 24 24" class="vote-icon"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Cover image -->
        <div v-if="blog.coverImageUrl" class="article-cover">
          <img :src="resolveCoverUrl(blog.coverImageUrl)" :alt="blog.titulo" />
        </div>

        <!-- Article body -->
        <div class="article-body" v-html="blog.contenido"></div>

        <!-- Article footer -->
        <footer class="article-footer">
          <div class="footer-vote">
            <span class="footer-vote-label">¿Te fue útil?</span>
            <button class="vote-btn-lg up" :class="{ active: blog.hasUpvoted }" @click="voteBlog(true)">
              <svg viewBox="0 0 24 24" class="vote-icon-lg"><polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ blog.upvotes ?? 0 }} votos
            </button>
          </div>
          <div class="footer-meta">
            <span class="role-chip" :class="blog.role?.toLowerCase?.() || 'student'">{{ blog.role }}</span>
            <span class="footer-author">{{ blog.author }}</span>
          </div>
        </footer>

        <!-- Comments -->
        <section class="comments-section">
          <h2 class="comments-heading">
            <svg viewBox="0 0 24 24" class="comments-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            {{ blog.commentCount ?? 0 }} comentarios
          </h2>

          <div class="comments-list">
            <div v-for="c in blog.comments || []" :key="c.id" class="comment-item">
              <div class="comment-avatar">{{ (c.author || '?').slice(0, 1).toUpperCase() }}</div>
              <div class="comment-body">
                <div class="comment-meta-row">
                  <strong class="comment-author">{{ c.author }}</strong>
                  <span :class="['role-chip', c.role?.toLowerCase?.() || 'student']">{{ c.role }}</span>
                  <span class="comment-time">{{ c.timeAgo }}</span>
                </div>
                <p class="comment-text">{{ c.text }}</p>
                <div class="comment-actions-row">
                  <button class="comment-vote">
                    <svg viewBox="0 0 24 24" class="cvote-icon"><polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    {{ c.upvotes ?? 0 }}
                  </button>
                </div>
              </div>
            </div>

            <p v-if="!blog.comments?.length" class="no-comments">
              Sé el primero en comentar este artículo.
            </p>
          </div>

          <!-- New comment -->
          <div class="new-comment">
            <div class="comment-avatar self">TÚ</div>
            <div class="comment-input-wrap">
              <textarea
                v-model="newComment"
                class="comment-textarea"
                placeholder="Comenta con enfoque académico y constructivo..."
                rows="3"
              ></textarea>
              <div class="comment-submit-row">
                <span class="comment-hint">
                  <svg viewBox="0 0 24 24" class="hint-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  Aporta con respeto y rigor académico
                </span>
                <button
                  class="submit-btn"
                  @click="submitComment"
                  :disabled="!newComment.trim() || submitting"
                >
                  {{ submitting ? 'Publicando...' : 'Comentar' }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const logout = async () => { clearAuthSession(); await router.push('/login') }

// ── State ─────────────────────────────────────────────────────────────────────
const blog = ref(null)
const loading = ref(false)
const error = ref('')
const newComment = ref('')
const submitting = ref(false)
const articleRef = ref(null)
const readProgress = ref(0)

// ── Roles ─────────────────────────────────────────────────────────────────────
const canAuxiliar = computed(() => hasRole('auxiliar') || hasRole('admin'))
const canModerator = computed(() => hasRole('moderador') || hasRole('admin'))
const currentUserId = computed(() => Number(getAuthUser()?.id ?? 0))
const canEdit = computed(() => {
  const own = Number(blog.value?.authorId ?? 0) === currentUserId.value
  return own || canAuxiliar.value || canModerator.value
})

// ── Computed ──────────────────────────────────────────────────────────────────
const editorialKind = computed(() =>
  blog.value?.kind ?? (/art[íi]culo|investigaci[oó]n/i.test(blog.value?.tipo ?? '') ? 'articulo' : 'blog')
)
const editorialLabel = computed(() => editorialKind.value === 'articulo' ? 'Artículo' : 'Blog')

const wordCount = computed(() => {
  const text = (blog.value?.contenido ?? '').replace(/<[^>]+>/g, ' ').trim()
  return text ? text.split(/\s+/).filter(Boolean).length : 0
})
const readTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)))

// ── Reading progress ──────────────────────────────────────────────────────────
function onScroll() {
  if (!articleRef.value) return
  const rect = articleRef.value.getBoundingClientRect()
  const total = articleRef.value.offsetHeight
  const scrolled = Math.max(0, -rect.top)
  readProgress.value = Math.min(100, Math.round((scrolled / total) * 100))
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function resolveCoverUrl(url) {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `${BACKEND_BASE}${url}`
}

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

// ── Load blog ─────────────────────────────────────────────────────────────────
async function loadBlog() {
  const id = Number(route.params.id)
  if (!id) { error.value = 'Blog no encontrado.'; return }
  const kind = route.query.kind ? String(route.query.kind) : undefined
  loading.value = true
  error.value = ''
  try {
    if (kind === 'articulo') {
      const data = await api(`/sysreddit/articulos/${id}`)
      blog.value = data.articulo
    } else {
      const query = kind ? `?kind=${encodeURIComponent(kind)}` : ''
      const data = await api(`/sysreddit/blogs/${id}${query}`)
      blog.value = data.blog
    }
  } catch (e) {
    error.value = e.message ?? 'No se pudo cargar el artículo.'
  } finally {
    loading.value = false
  }
}

// ── Vote ─────────────────────────────────────────────────────────────────────
async function voteBlog(isUp) {
  if (!blog.value) return
  const prev = { upvotes: blog.value.upvotes, hasUpvoted: blog.value.hasUpvoted }
  try {
    const data = await api(`/sysreddit/blogs/${blog.value.id}/votar`, {
      method: 'POST',
      body: JSON.stringify({ isUp }),
    })
    if (data.upvotes !== undefined) blog.value.upvotes = data.upvotes
    if (data.hasUpvoted !== undefined) blog.value.hasUpvoted = data.hasUpvoted
  } catch {
    blog.value.upvotes = prev.upvotes
    blog.value.hasUpvoted = prev.hasUpvoted
  }
}

// ── Comment ───────────────────────────────────────────────────────────────────
async function submitComment() {
  if (!blog.value || !newComment.value.trim()) return
  submitting.value = true
  try {
    const kind = blog.value?.kind ?? route.query.kind
    const query = kind ? `?kind=${encodeURIComponent(kind)}` : ''
    const data = await api(`/sysreddit/blogs/${blog.value.id}/comentarios${query}`, {
      method: 'POST',
      body: JSON.stringify({ texto: newComment.value.trim() }),
    })
    if (!blog.value.comments) blog.value.comments = []
    blog.value.comments.push({
      id: data.comentario?.id,
      author: data.comentario?.author,
      role: data.comentario?.role,
      text: data.comentario?.text,
      upvotes: data.comentario?.upvotes ?? 0,
      timeAgo: 'ahora',
    })
    blog.value.commentCount = (blog.value.commentCount ?? 0) + 1
    newComment.value = ''
  } catch (e) {
    error.value = e.message ?? 'No se pudo publicar el comentario.'
  } finally {
    submitting.value = false
  }
}

function editBlog() {
  if (!blog.value?.id) return
  const kind = blog.value?.kind ?? route.query.kind
  router.push({ path: `/blogs/${blog.value.id}/edit`, query: { kind } })
}

onMounted(() => {
  loadBlog()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
/* ── Shell ─────────────────────────────────────────────────────────────────── */
.reader-shell {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-primary);
}

/* ── Reading progress bar ────────────────────────────────────────────────── */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  z-index: 100;
  transition: width 0.1s linear;
  border-radius: 0 999px 999px 0;
}

.reader-layout {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
}

/* ── Loading skeleton ────────────────────────────────────────────────────── */
.reader-loading { display: grid; gap: 1rem; }

.loading-shimmer {
  border-radius: 10px;
  background: linear-gradient(90deg, var(--bg-surface) 25%, color-mix(in srgb, var(--bg-surface) 70%, var(--bg-app)) 50%, var(--bg-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.title-shimmer { height: 48px; width: 85%; }
.meta-shimmer { height: 20px; width: 55%; }
.body-shimmer { height: 18px; }
.body-shimmer.short { width: 70%; }

/* ── Error ───────────────────────────────────────────────────────────────── */
.reader-error {
  text-align: center;
  padding: 4rem 2rem;
  display: grid;
  gap: 1rem;
  place-items: center;
}

.error-icon { width: 48px; height: 48px; color: #f87171; }

/* ── Nav ─────────────────────────────────────────────────────────────────── */
.reader-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
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
  transition: all 0.15s;
}

.back-btn:hover { border-color: var(--accent-500); color: var(--accent-500); }
.back-icon { width: 16px; height: 16px; }

.nav-actions { display: flex; gap: 0.5rem; }

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  border-radius: 999px;
  color: var(--accent-contrast, #fff);
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.edit-icon { width: 14px; height: 14px; }

/* ── Article header ──────────────────────────────────────────────────────── */
.article-header { margin-bottom: 1.5rem; }

.article-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.editorial-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.editorial-badge.blog {
  background: color-mix(in srgb, var(--accent-500) 15%, transparent);
  color: var(--accent-500);
  border: 1px solid color-mix(in srgb, var(--accent-500) 30%, transparent);
}

.editorial-badge.articulo {
  background: color-mix(in srgb, #0ea5e9 15%, transparent);
  color: #38bdf8;
  border: 1px solid color-mix(in srgb, #0ea5e9 30%, transparent);
}

.badge-icon { width: 12px; height: 12px; }

.category-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  font-size: 0.78rem;
  color: var(--text-soft);
}

.article-title {
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  font-weight: 800;
  line-height: 1.25;
  margin: 0 0 1.25rem;
  letter-spacing: -0.02em;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  color: var(--accent-contrast, #fff);
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.author-info { flex: 1; min-width: 0; }

.author-name-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.author-name { font-weight: 700; }

.role-chip {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.role-chip.student, .role-chip.comun, .role-chip.estudiante {
  background: color-mix(in srgb, var(--accent-500) 12%, transparent);
  color: var(--accent-500);
}

.role-chip.auxiliar {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
}

.role-chip.admin, .role-chip.moderador {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.article-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-top: 0.2rem;
}

.meta-dot { opacity: 0.4; }

.vote-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
}

.vote-btn-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: transparent;
  color: var(--text-soft);
  padding: 0.3rem 0.65rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}

.vote-btn-inline.up:hover, .vote-btn-inline.up.active { border-color: var(--accent-500); color: var(--accent-500); background: color-mix(in srgb, var(--accent-500) 8%, transparent); }
.vote-btn-inline.down:hover { border-color: #f87171; color: #f87171; }
.vote-icon { width: 14px; height: 14px; }

/* ── Cover ───────────────────────────────────────────────────────────────── */
.article-cover {
  margin: 1.5rem 0 2rem;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.article-cover img {
  width: 100%;
  max-height: 440px;
  object-fit: cover;
  display: block;
}

/* ── Article body ────────────────────────────────────────────────────────── */
.article-body {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-primary);
}

.article-body :deep(p) { margin: 0 0 1.1rem; }
.article-body :deep(h2) { font-size: 1.5rem; font-weight: 800; margin: 2rem 0 0.75rem; letter-spacing: -0.01em; }
.article-body :deep(h3) { font-size: 1.2rem; font-weight: 700; margin: 1.5rem 0 0.6rem; }
.article-body :deep(blockquote) {
  border-left: 4px solid var(--accent-500);
  margin: 1.5rem 0;
  padding: 0.75rem 1.25rem;
  color: var(--text-soft);
  font-style: italic;
  background: color-mix(in srgb, var(--accent-500) 5%, transparent);
  border-radius: 0 12px 12px 0;
  font-size: 1.05rem;
}
.article-body :deep(ul), .article-body :deep(ol) { margin: 0.5rem 0 1rem 1.5rem; }
.article-body :deep(li) { margin-bottom: 0.4rem; }
.article-body :deep(a) { color: var(--accent-500); text-decoration: underline; text-underline-offset: 3px; }
.article-body :deep(strong) { font-weight: 700; }
.article-body :deep(code) {
  background: color-mix(in srgb, var(--accent-500) 10%, transparent);
  padding: 0.15rem 0.4rem;
  border-radius: 5px;
  font-family: monospace;
  font-size: 0.9em;
}
.article-body :deep(pre) {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}
.article-body :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin: 0.5rem 0;
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin: 2.5rem 0;
  flex-wrap: wrap;
}

.footer-vote {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-vote-label { font-size: 0.9rem; color: var(--text-soft); }

.vote-btn-lg {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: transparent;
  color: var(--text-soft);
  padding: 0.45rem 1rem;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s;
}

.vote-btn-lg.up:hover, .vote-btn-lg.up.active {
  border-color: var(--accent-500);
  color: var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 8%, transparent);
}

.vote-icon-lg { width: 16px; height: 16px; }

.footer-meta { display: flex; align-items: center; gap: 0.5rem; }
.footer-author { font-weight: 600; font-size: 0.9rem; }

/* ── Comments ────────────────────────────────────────────────────────────── */
.comments-section { display: grid; gap: 1.25rem; }

.comments-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.comments-icon { width: 18px; height: 18px; }

.comments-list { display: grid; gap: 0.75rem; }

.comment-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.9rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  transition: border-color 0.15s;
}

.comment-item:hover { border-color: color-mix(in srgb, var(--accent-500) 25%, var(--border-color)); }

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  color: var(--accent-contrast, #fff);
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.comment-avatar.self {
  background: linear-gradient(135deg, #22c55e, #0ea5e9);
  font-size: 0.55rem;
}

.comment-body { flex: 1; min-width: 0; }

.comment-meta-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 0.4rem;
}

.comment-author { font-weight: 700; }
.comment-time { font-size: 0.75rem; color: var(--text-muted); }

.comment-text {
  font-size: 0.9rem;
  color: var(--text-soft);
  line-height: 1.55;
  margin: 0 0 0.4rem;
}

.comment-actions-row { display: flex; gap: 0.5rem; }

.comment-vote {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  transition: all 0.15s;
}

.comment-vote:hover { background: color-mix(in srgb, var(--accent-500) 8%, transparent); color: var(--accent-500); }
.cvote-icon { width: 13px; height: 13px; }

.no-comments {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  border: 1px dashed var(--border-color);
  border-radius: 14px;
  font-size: 0.9rem;
}

/* ── New comment ─────────────────────────────────────────────────────────── */
.new-comment {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.comment-input-wrap { flex: 1; display: grid; gap: 0.5rem; }

.comment-textarea {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.75rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.comment-textarea:focus { outline: none; border-color: var(--accent-500); }

.comment-submit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.comment-hint {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.hint-icon { width: 13px; height: 13px; }

.submit-btn {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  border-radius: 999px;
  color: var(--accent-contrast, #fff);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.45rem 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.submit-btn:hover:not(:disabled) { opacity: 0.88; }

/* ── Misc ────────────────────────────────────────────────────────────────── */
.ghost {
  border: 1px solid var(--border-color);
  background: transparent;
  border-radius: 999px;
  color: var(--text-primary);
  padding: 0.45rem 1rem;
  cursor: pointer;
}

@media (max-width: 640px) {
  .author-row { flex-direction: column; align-items: flex-start; }
  .vote-row { margin-left: 0; }
  .article-title { font-size: 1.6rem; }
  .article-footer { flex-direction: column; align-items: flex-start; }
}
</style>