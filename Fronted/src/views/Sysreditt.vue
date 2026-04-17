<template>
    <div class="upload-shell">
        <AppNavbar
            active-section="forum"
            :avatar-initials="userInitials"
            :search-value="navbarSearch"
            @update:searchValue="navbarSearch = $event"
            @section-select="onNavbarSectionSelect"
            @profile="router.push('/profile')"
            @logout="logout"
        />
        <div class="sysreddit">

    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="tab-toggle">
          <button
            :class="['tab-btn', { active: activeTab === 'threads' }]"
            @click="activeTab = 'threads'"
          >
            <svg viewBox="0 0 24 24" class="tab-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Foros
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'blogs' }]"
            @click="activeTab = 'blogs'"
          >
            <svg viewBox="0 0 24 24" class="tab-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Blogs
          </button>
        </div>

        <!-- Categories -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <svg viewBox="0 0 24 24" class="sidebar-icon accent"><path d="M4 6h16M4 12h16M4 18h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Categorías</span>
          </div>
          <div class="category-list">
            <button
              v-for="cat in categories"
              :key="cat.id"
              :class="['cat-btn', { active: selectedCategory === cat.id }]"
              @click="selectCategory(cat.id)"
            >
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ cat.count }}</span>
            </button>
          </div>

          <button
            class="new-post-btn"
            :disabled="activeTab === 'blogs' && !canPublishBlogs"
            @click="openCompose"
          >
            <svg viewBox="0 0 24 24" class="btn-icon"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            {{ activeTab === 'threads' ? 'Nueva discusión' : 'Nuevo artículo' }}
          </button>
          <small v-if="activeTab === 'blogs' && !canPublishBlogs" class="publish-lock-note">
            Solo auxiliares/mod/admin o estudiantes con permiso editorial pueden publicar.
          </small>
        </div>

        <!-- Role Tools -->
        <div v-if="canAuxiliar || canModerator" class="sidebar-card role-tools">
          <div class="sidebar-card-header">
            <svg viewBox="0 0 24 24" class="sidebar-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Herramientas</span>
          </div>
          <div class="role-list">
            <template v-if="canAuxiliar">
              <div class="role-item aux">
                <svg viewBox="0 0 24 24" class="role-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Destacar publicaciones
              </div>
              <div class="role-item aux">
                <svg viewBox="0 0 24 24" class="role-icon"><line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="12 15 7 10 17 10" fill="currentColor"/></svg>
                Fijar hilos
              </div>
            </template>
            <template v-if="canModerator">
              <div class="role-item mod">
                <svg viewBox="0 0 24 24" class="role-icon"><polyline points="9 11 12 14 22 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Moderar contenido
              </div>
              <div class="role-item mod">
                <svg viewBox="0 0 24 24" class="role-icon"><polyline points="3 6 5 6 21 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Eliminar reportes
              </div>
            </template>
          </div>
        </div>

        <!-- Sort controls -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <svg viewBox="0 0 24 24" class="sidebar-icon accent"><path d="M3 6h18M6 12h12M10 18h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Ordenar por</span>
          </div>
          <div class="sort-list">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              :class="['sort-btn', { active: sortBy === opt.value }]"
              @click="changeSortBy(opt.value)"
            >
              <svg viewBox="0 0 24 24" class="sort-icon" v-html="opt.icon"></svg>
              {{ opt.label }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Feed -->
      <main class="feed">
        <!-- THREADS TAB -->
        <template v-if="activeTab === 'threads'">
          <div class="feed-header">
            <div>
              <h2 class="feed-title">Sys-Reddit</h2>
              <p class="feed-subtitle">Discusiones de la comunidad y resolución de dudas</p>
            </div>
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <input v-model="searchQuery" class="search-input" placeholder="Buscar discusiones..." @input="onSearch" />
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="empty-feed">
            <p>Cargando hilos...</p>
          </div>

          <transition-group v-else name="thread-list" tag="div" class="thread-feed">
            <article
              v-for="thread in threads"
              :key="thread.id"
              :class="['thread-card', {
                featured: thread.isFeatured,
                reported: thread.hasReports && canModerator,
                pinned: thread.isPinned,
              }]"
            >
              <!-- Badges row -->
              <div v-if="thread.isPinned || thread.isFeatured || (thread.hasReports && canModerator)" class="badge-row">
                <span v-if="thread.isPinned" class="thread-badge pinned-badge">
                  <svg viewBox="0 0 24 24" class="badge-icon"><line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="12 15 7 10 17 10" fill="currentColor"/></svg>
                  Fijado
                </span>
                <span v-if="thread.isFeatured" class="thread-badge featured-badge">
                  <svg viewBox="0 0 24 24" class="badge-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="currentColor" stroke-width="1"/></svg>
                  Destacado
                </span>
                <span v-if="thread.hasReports && canModerator" class="thread-badge report-badge">
                  <svg viewBox="0 0 24 24" class="badge-icon"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  Reportado
                </span>
              </div>

              <div class="thread-body">
                <!-- Vote column -->
                <div class="vote-col">
                  <button
                    :class="['vote-btn', 'up', { voted: thread.hasUpvoted }]"
                    @click="vote(thread.id, true)"
                    aria-label="Votar positivo"
                  >
                    <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                  <span class="vote-count" :class="{ positive: thread.upvotes > 0 }">{{ thread.upvotes }}</span>
                  <button
                    :class="['vote-btn', 'down', { voted: thread.hasDownvoted }]"
                    @click="vote(thread.id, false)"
                    aria-label="Votar negativo"
                  >
                    <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>

                <!-- Content -->
                <div class="thread-content">
                  <h3 class="thread-title" @click="toggleComments(thread.id)">{{ thread.title }}</h3>

                  <div class="thread-tags">
                    <span v-for="tag in thread.tags" :key="tag" class="thread-tag">{{ tag }}</span>
                  </div>

                  <div class="thread-meta">
                    <span>por</span>
                    <strong class="author-name">{{ thread.author }}</strong>
                    <span :class="['author-badge', thread.role.toLowerCase()]">{{ thread.role }}</span>
                    <span class="meta-sep">·</span>
                    <span class="time-ago">{{ thread.timeAgo }}</span>
                    <span class="meta-sep">·</span>
                    <button class="comment-toggle" @click="toggleComments(thread.id)">
                      <svg viewBox="0 0 24 24" class="meta-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      {{ thread.commentCount }} comentarios
                    </button>
                  </div>

                  <!-- Actions row -->
                  <div class="thread-actions">
                    <button class="action-btn" @click="toggleComments(thread.id)">
                      <svg viewBox="0 0 24 24" class="action-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      Comentar
                    </button>
                    <button class="action-btn">
                      <svg viewBox="0 0 24 24" class="action-icon"><circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      Compartir
                    </button>
                    <button v-if="!thread.hasReports" class="action-btn warn" @click="reportThread(thread.id)">
                      <svg viewBox="0 0 24 24" class="action-icon"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      Reportar
                    </button>

                    <!-- Auxiliar tools -->
                    <template v-if="canAuxiliar">
                      <button
                        :class="['action-btn', 'aux-btn', { active: thread.isFeatured }]"
                        @click="toggleFeatured(thread.id)"
                      >
                        <svg viewBox="0 0 24 24" class="action-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        {{ thread.isFeatured ? 'Quitar destaque' : 'Destacar' }}
                      </button>
                      <button
                        :class="['action-btn', 'aux-btn', { active: thread.isPinned }]"
                        @click="togglePinned(thread.id)"
                      >
                        <svg viewBox="0 0 24 24" class="action-icon"><line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="12 15 7 10 17 10" fill="currentColor"/></svg>
                        {{ thread.isPinned ? 'Desfijar' : 'Fijar' }}
                      </button>
                    </template>

                    <!-- Moderator tools -->
                    <template v-if="canModerator">
                      <button class="action-btn delete-btn" @click="deleteThread(thread.id)">
                        <svg viewBox="0 0 24 24" class="action-icon"><polyline points="3 6 5 6 21 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        Eliminar
                      </button>
                    </template>
                  </div>

                  <!-- Comments panel -->
                  <transition name="comments-slide">
                    <div v-if="expandedThread === thread.id" class="comments-panel">
                      <p v-if="loadingComments[thread.id]" class="comment-hint" style="padding: 0.5rem 0">Cargando comentarios...</p>
                      <div class="comments-list">
                        <div v-for="c in thread.comments" :key="c.id" class="comment-item">
                          <div class="comment-avatar">{{ c.author.slice(0, 1) }}</div>
                          <div class="comment-body">
                            <div class="comment-meta">
                              <strong>{{ c.author }}</strong>
                              <span :class="['author-badge', c.role.toLowerCase()]">{{ c.role }}</span>
                              <span class="comment-time">{{ c.timeAgo }}</span>
                            </div>
                            <p class="comment-text">{{ c.text }}</p>
                            <div class="comment-actions">
                              <button :class="['comment-vote', { voted: c.hasUpvoted }]" @click="voteComment(thread.id, c.id, true)">
                                <svg viewBox="0 0 24 24" class="action-icon"><polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                                {{ c.upvotes }}
                              </button>
                              <button :class="['comment-vote', { voted: c.hasDownvoted }]" @click="voteComment(thread.id, c.id, false)">
                                <svg viewBox="0 0 24 24" class="action-icon"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                              </button>
                              <button v-if="canModerator" class="comment-reply-btn" style="color: #f87171" @click="deleteComment(thread.id, c.id)">Eliminar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- New comment input -->
                      <div class="new-comment">
                        <div class="comment-avatar self">TÚ</div>
                        <div class="comment-input-wrap">
                          <textarea
                            v-model="newComments[thread.id]"
                            class="comment-textarea"
                            placeholder="Escribe un comentario académico..."
                            rows="2"
                          ></textarea>
                          <div class="comment-submit-row">
                            <span class="comment-hint">Sé respetuoso y constructivo</span>
                            <button
                              class="submit-comment-btn"
                              @click="submitComment(thread.id)"
                              :disabled="!newComments[thread.id]?.trim() || submittingComment"
                            >Publicar</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </article>
          </transition-group>

          <div v-if="!isLoading && threads.length === 0" class="empty-feed">
            <svg viewBox="0 0 24 24" class="empty-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 15s1.5-2 4-2 4 2 4 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <p>No hay discusiones que coincidan.</p>
          </div>

          <div v-if="hasMore && !isLoading" class="load-more-row">
            <button class="load-more-btn" @click="loadMore">Cargar más</button>
          </div>
        </template>

        <!-- BLOGS TAB (próximamente con API) -->
        <template v-else>
          <div class="feed-header">
            <div>
              <h2 class="feed-title">Blogs & Artículos</h2>
              <p class="feed-subtitle">Tutoriales, artículos de investigación y guías de auxiliares</p>
            </div>
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <input v-model="searchQuery" class="search-input" placeholder="Buscar artículos..." @input="onSearch" />
            </div>
          </div>

          <div class="editorial-filter">
            <button
              v-for="opt in editorialFilterOptions"
              :key="opt.value"
              :class="['filter-pill', { active: editorialFilter === opt.value }]"
              @click="setEditorialFilter(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>

          <div v-if="isLoadingBlogs" class="empty-feed">
            <p>Cargando blogs y artículos...</p>
          </div>

          <!-- Featured Blog -->
          <div v-if="!isLoadingBlogs && firstBlog" class="blog-hero" @click="openBlog(firstBlog)">
            <div class="blog-hero-content">
              <div class="blog-hero-meta">
                <span :class="['content-kind-badge', firstBlog.editorialKind]">{{ firstBlog.editorialLabel }}</span>
                <span :class="['author-badge', firstBlog.role.toLowerCase()]">{{ firstBlog.role }}</span>
                <span class="time-ago">{{ firstBlog.timeAgo }}</span>
                <span class="read-time">{{ firstBlog.readTime }} min de lectura</span>
              </div>
              <h2 class="blog-hero-title">{{ firstBlog.title }}</h2>
              <p class="blog-hero-excerpt">{{ firstBlog.excerpt }}</p>
              <div class="blog-hero-footer">
                <div class="blog-author">
                  <div class="blog-avatar">{{ firstBlog.author.slice(0, 1) }}</div>
                  <span>{{ firstBlog.author }}</span>
                </div>
                <div class="blog-hero-actions">
                  <button
                    v-if="canEditBlog(firstBlog)"
                    class="edit-blog-btn"
                    @click.stop="openEditBlog(firstBlog)"
                  >
                    Editar
                  </button>
                  <button class="read-btn" @click.stop="openBlog(firstBlog)">Leer</button>
                  <button class="vote-inline" @click="voteBlog(firstBlog.id, true)">
                    <svg viewBox="0 0 24 24" class="action-icon"><polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    {{ firstBlog.upvotes }}
                  </button>
                  <button class="vote-inline" @click="voteBlog(firstBlog.id, false)">
                    <svg viewBox="0 0 24 24" class="action-icon"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  </button>
                  <button class="read-btn" @click.stop="toggleBlogComments(firstBlog.id)">Comentarios ({{ firstBlog.commentCount }})</button>
                </div>
              </div>
            </div>
            <div class="blog-hero-cover" :style="getCoverStyle(firstBlog)">
              <svg viewBox="0 0 120 80" class="cover-illustration">
                <rect x="10" y="20" width="60" height="8" rx="4" fill="rgba(255,255,255,0.3)"/>
                <rect x="10" y="34" width="40" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
                <rect x="10" y="46" width="50" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
                <rect x="10" y="58" width="30" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
                <circle cx="95" cy="35" r="18" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
                <path d="M88 35 l5 5 l10-10" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <transition name="comments-slide">
            <div v-if="firstBlog && expandedBlog === firstBlog.id" class="comments-panel" style="margin-bottom: 1rem;">
              <p v-if="loadingBlogComments[firstBlog.id]" class="comment-hint" style="padding: 0.5rem 0">Cargando comentarios...</p>
              <div class="comments-list">
                <div v-for="c in firstBlog.comments" :key="c.id" class="comment-item">
                  <div class="comment-avatar">{{ c.author.slice(0, 1) }}</div>
                  <div class="comment-body">
                    <div class="comment-meta">
                      <strong>{{ c.author }}</strong>
                      <span :class="['author-badge', c.role.toLowerCase()]">{{ c.role }}</span>
                      <span class="comment-time">{{ c.timeAgo }}</span>
                    </div>
                    <p class="comment-text">{{ c.text }}</p>
                  </div>
                </div>
              </div>
              <div class="new-comment">
                <div class="comment-avatar self">TÚ</div>
                <div class="comment-input-wrap">
                  <textarea
                    v-model="newBlogComments[firstBlog.id]"
                    class="comment-textarea"
                    placeholder="Comenta este artículo..."
                    rows="2"
                  ></textarea>
                  <div class="comment-submit-row">
                    <span class="comment-hint">Aporta con enfoque académico</span>
                    <button
                      class="submit-comment-btn"
                      @click="submitBlogComment(firstBlog.id)"
                      :disabled="!newBlogComments[firstBlog.id]?.trim() || submittingComment"
                    >Publicar</button>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <div class="blog-grid">
            <article v-for="blog in restBlogs" :key="blog.id" class="blog-card" @click="openBlog(blog)">
              <div class="blog-cover" :style="getCoverStyle(blog)">
                <div class="blog-cover-tag">{{ blog.category }}</div>
              </div>
              <div class="blog-card-body">
                <div class="blog-card-meta">
                  <span :class="['content-kind-badge', blog.editorialKind]">{{ blog.editorialLabel }}</span>
                  <span :class="['author-badge', blog.role.toLowerCase()]">{{ blog.role }}</span>
                  <span class="time-ago">{{ blog.timeAgo }}</span>
                  <span class="read-time">{{ blog.readTime }} min</span>
                </div>
                <h3 class="blog-card-title">{{ blog.title }}</h3>
                <p class="blog-card-excerpt">{{ blog.excerpt }}</p>
                <div class="blog-card-footer">
                  <div class="blog-author">
                    <div class="blog-avatar small">{{ blog.author.slice(0, 1) }}</div>
                    <span class="blog-author-name">{{ blog.author }}</span>
                  </div>
                  <div class="blog-card-stats">
                    <button
                      v-if="canEditBlog(blog)"
                      class="edit-blog-btn"
                      @click.stop="openEditBlog(blog)"
                    >
                      Editar
                    </button>
                    <button class="read-btn" @click.stop="openBlog(blog)">Leer</button>
                    <button class="vote-inline" @click="voteBlog(blog.id, true)">
                      <svg viewBox="0 0 24 24" class="action-icon"><polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      {{ blog.upvotes }}
                    </button>
                    <button class="vote-inline" @click="voteBlog(blog.id, false)">
                      <svg viewBox="0 0 24 24" class="action-icon"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </button>
                    <button class="comment-count-small" @click="toggleBlogComments(blog.id)">
                      <svg viewBox="0 0 24 24" class="action-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                      {{ blog.commentCount }}
                    </button>
                  </div>
                </div>

                <transition name="comments-slide">
                  <div v-if="expandedBlog === blog.id" class="comments-panel" style="margin-top: 0.8rem;">
                    <p v-if="loadingBlogComments[blog.id]" class="comment-hint" style="padding: 0.5rem 0">Cargando comentarios...</p>
                    <div class="comments-list">
                      <div v-for="c in blog.comments" :key="c.id" class="comment-item">
                        <div class="comment-avatar">{{ c.author.slice(0, 1) }}</div>
                        <div class="comment-body">
                          <div class="comment-meta">
                            <strong>{{ c.author }}</strong>
                            <span :class="['author-badge', c.role.toLowerCase()]">{{ c.role }}</span>
                            <span class="comment-time">{{ c.timeAgo }}</span>
                          </div>
                          <p class="comment-text">{{ c.text }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="new-comment">
                      <div class="comment-avatar self">TÚ</div>
                      <div class="comment-input-wrap">
                        <textarea
                          v-model="newBlogComments[blog.id]"
                          class="comment-textarea"
                          placeholder="Comenta este artículo..."
                          rows="2"
                        ></textarea>
                        <div class="comment-submit-row">
                          <span class="comment-hint">Aporta con enfoque académico</span>
                          <button
                            class="submit-comment-btn"
                            @click="submitBlogComment(blog.id)"
                            :disabled="!newBlogComments[blog.id]?.trim() || submittingComment"
                          >Publicar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </article>
          </div>

          <div v-if="!isLoadingBlogs && !filteredBlogs.length" class="empty-feed">
            <p>No hay blogs/artículos que coincidan.</p>
          </div>

          <div v-if="hasMoreBlogs && !isLoadingBlogs" class="load-more-row">
            <button class="load-more-btn" @click="loadMore">Cargar más</button>
          </div>
        </template>
      </main>
    </div>

    <!-- Compose Modal -->
    <transition name="modal-fade">
      <div v-if="showCompose" class="modal-overlay" @click.self="showCompose = false">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ modalTitle }}</h3>
            <button class="modal-close" @click="showCompose = false">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Título</label>
              <input v-model="compose.title" class="form-input" :placeholder="activeTab === 'threads' ? 'Escribe tu pregunta o tema...' : 'Escribe el título del artículo...'" />
            </div>

            <div class="form-group">
              <label class="form-label">Categoría</label>
              <select v-model="compose.categoriaId" class="form-select">
                <option disabled value="">Selecciona una categoría</option>
                <option v-for="cat in categoriasForo" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tipo de publicación</label>
              <select v-model="compose.tipoId" class="form-select">
                <option value="">{{ activeTab === 'threads' ? 'Sin tipo específico' : 'Automático según formato' }}</option>
                <option v-for="tipo in visibleTipoOptions" :key="tipo.id" :value="tipo.id">
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>

            <div v-if="activeTab === 'blogs'" class="form-group">
              <label class="form-label">Formato editorial</label>
              <div class="format-toggle">
                <button
                  type="button"
                  :class="['format-btn', { active: compose.formato === 'blog' }]"
                  @click="compose.formato = 'blog'"
                >Blog</button>
                <button
                  type="button"
                  :class="['format-btn', { active: compose.formato === 'articulo' }]"
                  @click="compose.formato = 'articulo'"
                >Artículo</button>
              </div>
              <small class="form-help">
                Blog: enfoque práctico/tutorial. Artículo: enfoque de investigación y análisis.
              </small>
            </div>

            <div class="form-group">
              <label class="form-label">Contenido</label>

              <!-- Rich editor for blogs/articles, plain textarea for threads -->
              <div v-if="activeTab === 'blogs'" class="editor-wrap">
                <div class="editor-toolbar">
                  <button type="button" class="tool-btn" @click.prevent="exec('bold')" title="Negrita">B</button>
                  <button type="button" class="tool-btn" @click.prevent="exec('italic')" title="Cursiva">I</button>
                  <button type="button" class="tool-btn" @click.prevent="exec('underline')" title="Subrayado">U</button>
                  <button type="button" class="tool-btn" @click.prevent="exec('insertUnorderedList')" title="Lista">•</button>
                  <button type="button" class="tool-btn" @click.prevent="exec('insertOrderedList')" title="Lista ordenada">1.</button>
                  <button type="button" class="tool-btn" @click.prevent="makeLink" title="Insertar enlace">🔗</button>
                  <button type="button" class="tool-btn" @click.prevent="exec('removeFormat')" title="Limpiar formato">✖</button>
                </div>

                <div
                  ref="editorRef"
                  class="editor"
                  contenteditable="true"
                  v-html="compose.content"
                  @input="onEditorInput"
                  aria-label="Editor de contenido del artículo o blog"
                ></div>

                <small class="form-help">Se guardará HTML seguro. Evita scripts o contenido malicioso.</small>
              </div>

              <textarea
                v-else
                v-model="compose.content"
                class="form-textarea"
                :placeholder="activeTab === 'threads' ? 'Describe tu duda o aporte con detalle...' : 'Escribe el contenido completo del blog/artículo...'"
                rows="6"
              ></textarea>
            </div>

            <p v-if="composeError" style="color: #f87171; font-size: 0.82rem; margin: 0">{{ composeError }}</p>
          </div>

          <div class="modal-footer">
            <button class="secondary" @click="showCompose = false">Cancelar</button>
            <button class="primary" @click="submitPost" :disabled="!compose.title.trim() || !compose.categoriaId || submittingPost">
              <svg viewBox="0 0 24 24" class="btn-icon"><line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              {{ submittingPost ? submitButtonPendingLabel : submitButtonLabel }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
    </div>

</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import { clearAuthSession, getAuthToken, getAuthUser, hasRole } from '../utils/authSession'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const BACKEND_BASE = API_BASE.replace(/\/api\/?$/, '')
const router = useRouter()

// ── Navbar ────────────────────────────────────────────────────────────────────
const navbarSearch = ref('')

const userInitials = computed(() => {
  const u = getAuthUser()
  if (!u?.nombre) return 'US'
  return u.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

const onNavbarSectionSelect = (section) => {
  if (section === 'dashboard') router.push('/dashboard')
  else if (section === 'upload') router.push('/upload-repo')
  else if (section === 'forum') router.push('/forum')
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

  const isStudent = hasRole('comun') || hasRole('estudiante') || hasRole('student')
  const hasEditorialPermission =
    hasRole('publicador_blog') ||
    hasRole('editor_blog') ||
    hasRole('autor_blog') ||
    hasRole('permiso_blog') ||
    hasRole('blog_writer')

  return isStudent && hasEditorialPermission
})

// ── UI state ──────────────────────────────────────────────────────────────────
const activeTab = ref('threads')
const selectedCategory = ref('all') // 'all' o id numérico como string
const searchQuery = ref('')
const sortBy = ref('hot')
const expandedThread = ref(null)
const showCompose = ref(false)
const isLoading = ref(false)
const submittingComment = ref(false)
const submittingPost = ref(false)
const editingBlogId = ref(null)
const composeError = ref('')
const hasMore = ref(false)
const currentPage = ref(1)
const newComments = reactive({})
const loadingComments = reactive({})

const compose = reactive({ title: '', categoriaId: '', tipoId: '', content: '', formato: 'blog' })

// Editor refs & helpers
const editorRef = ref(null)

function exec(command, value) {
  try {
    document.execCommand(command, false, value)
    // keep model in sync
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
  // read innerHTML and assign
  compose.content = editorRef.value.innerHTML || ''
}

// Light client-side sanitize to remove <script> and on* attributes.
function sanitizeHtmlLight(html) {
  if (!html) return ''
  // remove script tags
  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  // remove onxxx attributes
  html = html.replace(/ on\w+=\"[\s\S]*?\"/gi, '')
  html = html.replace(/ on\w+=\'[\s\S]*?\'/gi, '')
  return html
}

// ── Catálogos (cargados desde API) ────────────────────────────────────────────
const categoriasForo = ref([])   // [{ id, nombre }]
const tiposForo = ref([])        // [{ id, nombre }]

function isBlogLikeTypeName(name) {
  return /blog|art[íi]culo|tutorial|investigaci[oó]n/i.test(name ?? '')
}

function isArticleLikeTypeName(name) {
  return /art[íi]culo|investigaci[oó]n/i.test(name ?? '')
}

function isBlogFormatTypeName(name) {
  return /blog|tutorial/i.test(name ?? '')
}

function getEditorialKindFromTypeName(name) {
  return isArticleLikeTypeName(name) ? 'articulo' : 'blog'
}

function getEditorialLabel(kind) {
  return kind === 'articulo' ? 'Artículo' : 'Blog'
}

const blogTipoOptions = computed(() => tiposForo.value.filter(t => isBlogLikeTypeName(t.nombre)))
const forumTipoOptions = computed(() => tiposForo.value.filter(t => !isBlogLikeTypeName(t.nombre)))
const blogTipoOptionsByFormat = computed(() => {
  if (compose.formato === 'articulo') {
    return blogTipoOptions.value.filter(t => isArticleLikeTypeName(t.nombre))
  }
  return blogTipoOptions.value.filter(t => isBlogFormatTypeName(t.nombre))
})
const visibleTipoOptions = computed(() => activeTab.value === 'threads' ? forumTipoOptions.value : blogTipoOptionsByFormat.value)
const currentUserId = computed(() => Number(getAuthUser()?.id ?? 0))
const isEditingBlog = computed(() => activeTab.value === 'blogs' && editingBlogId.value !== null)
const modalTitle = computed(() => {
  if (activeTab.value === 'threads') return 'Nueva discusión'
  return isEditingBlog.value ? 'Editar blog/artículo' : 'Nuevo blog/artículo'
})
const submitButtonLabel = computed(() => {
  if (activeTab.value === 'threads') return 'Publicar'
  return isEditingBlog.value ? 'Guardar cambios' : 'Publicar'
})
const submitButtonPendingLabel = computed(() => {
  if (activeTab.value === 'threads') return 'Publicando...'
  return isEditingBlog.value ? 'Guardando...' : 'Publicando...'
})

// Categorías formateadas para el sidebar (incluye "Todo")
const categories = computed(() => {
  const all = [{ id: 'all', name: 'Todo', count: '' }]
  return all.concat(
    categoriasForo.value.map(c => ({ id: String(c.id), name: c.nombre, count: c.count ?? '' }))
  )
})

// ── Threads (desde API) ───────────────────────────────────────────────────────
const threads = ref([])

const sortOptions = [
  {
    value: 'hot',
    label: 'Popular',
    icon: '<path d="M12 2c0 6-6 8-6 13a6 6 0 0 0 12 0c0-5-6-7-6-13Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 12c0 3-2 4-2 6a2 2 0 0 0 4 0c0-2-2-3-2-6Z" fill="currentColor"/>'
  },
  {
    value: 'new',
    label: 'Reciente',
    icon: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  },
  {
    value: 'top',
    label: 'Más votos',
    icon: '<polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
]

// ── Blogs (desde API) ─────────────────────────────────────────────────────────
const blogs = ref([])
const isLoadingBlogs = ref(false)
const hasMoreBlogs = ref(false)
const currentBlogsPage = ref(1)
const expandedBlog = ref(null)
const newBlogComments = reactive({})
const loadingBlogComments = reactive({})
const editorialFilter = ref('all')
const editorialFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'blog', label: 'Blogs' },
  { value: 'articulo', label: 'Artículos' },
]

const blogGradients = [
  'linear-gradient(135deg, var(--accent-500) 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
]

const filteredBlogs = computed(() => blogs.value)
const firstBlog = computed(() => filteredBlogs.value[0] ?? null)
const restBlogs = computed(() => filteredBlogs.value.slice(1))

// ── HTTP helper ───────────────────────────────────────────────────────────────
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

// ── Normalizar hilo del backend al shape del template ─────────────────────────
function normalizeThread(h) {
  return {
    id: h.id,
    title: h.titulo,
    author: h.author,
    role: h.role,
    upvotes: h.upvotes,
    commentCount: h.commentCount,
    // Mostramos [Tipo] y [Categoría] como chips en thread.tags
    tags: [h.tipo, h.categoria].filter(Boolean),
    timeAgo: h.timeAgo,
    category: String(h.categoriaId ?? 'all'),
  hasUpvoted: Boolean(h.hasUpvoted),
  hasDownvoted: Boolean(h.hasDownvoted),
    isFeatured: h.isFeatured,
    isPinned: h.isPinned,
    hasReports: h.hasReports,
    comments: (h.comments ?? []).map(normalizeComment),
  }
}

function normalizeComment(c) {
  return {
    id: c.id,
    author: c.author,
    role: c.role,
    text: c.text,
    upvotes: c.upvotes,
    hasUpvoted: Boolean(c.hasUpvoted),
    hasDownvoted: Boolean(c.hasDownvoted),
    timeAgo: c.timeAgo,
  }
}

function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeBlog(h) {
  const content = h.contenido ?? ''
  const plain = stripHtml(content)
  const words = plain.trim() ? plain.trim().split(/\s+/).length : 0
  const readTime = Math.max(1, Math.ceil(words / 220))
  const editorialKind = h.kind ?? getEditorialKindFromTypeName(h.tipo)
  return {
    id: h.id,
    kind: h.kind ?? editorialKind,
    title: h.titulo,
    author: h.author,
    role: h.role,
    excerpt: plain.length > 220 ? `${plain.slice(0, 220)}...` : plain,
    content,
    upvotes: h.upvotes,
    commentCount: h.commentCount,
    readTime,
    timeAgo: h.timeAgo,
  createdAt: h.createdAt,
    category: h.categoria ?? 'General',
  tipo: h.tipo ?? null,
  tipoId: h.tipoId ?? null,
  authorId: Number(h.authorId ?? 0),
  coverImageUrl: h.coverImageUrl ?? null,
  editorialKind,
  editorialLabel: getEditorialLabel(editorialKind),
    hasUpvoted: Boolean(h.hasUpvoted),
    hasDownvoted: Boolean(h.hasDownvoted),
    comments: (h.comments ?? []).map(normalizeComment),
    coverGradient: blogGradients[h.id % blogGradients.length],
  }
}

function resolveCoverUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${BACKEND_BASE}${url}`
}

function getCoverStyle(blog) {
  if (blog?.coverImageUrl) {
    return {
      backgroundImage: `url(${resolveCoverUrl(blog.coverImageUrl)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { background: blog?.coverGradient }
}

function canEditBlog(blog) {
  const ownPost = Number(blog?.authorId ?? 0) === currentUserId.value
  return ownPost || canAuxiliar.value || canModerator.value
}

function openEditBlog(blog) {
  if (!blog?.id) return
  const kind = blog.kind ?? blog.editorialKind
  router.push({ path: `/blogs/${blog.id}/edit`, query: { kind } })
}

function openBlog(blog) {
  if (!blog?.id) return
  const kind = blog.kind ?? blog.editorialKind
  router.push({ path: `/blogs/${blog.id}`, query: { kind } })
}

// ── Cargar catálogos ──────────────────────────────────────────────────────────
async function loadCatalogos() {
  try {
    const [catsRes, tiposRes] = await Promise.all([
      api('/sysreddit/categorias'),
      api('/sysreddit/tipos'),
    ])
    categoriasForo.value = catsRes.categorias ?? []
    tiposForo.value = tiposRes.tipos ?? []
  } catch (e) {
    console.error('Error cargando catálogos del foro:', e)
  }
}

// ── Cargar hilos ──────────────────────────────────────────────────────────────
async function loadThreads(reset = true) {
  isLoading.value = true
  if (reset) {
    currentPage.value = 1
    threads.value = []
  }

  try {
    const params = new URLSearchParams({ sortBy: sortBy.value, page: currentPage.value })
    if (selectedCategory.value !== 'all') params.set('categoriaId', selectedCategory.value)
    if (searchQuery.value.trim()) params.set('search', searchQuery.value.trim())

    const data = await api(`/sysreddit/hilos?${params}`)
    const normalized = (data.hilos ?? []).map(normalizeThread)

    if (reset) {
      threads.value = normalized
    } else {
      threads.value.push(...normalized)
    }

    hasMore.value = (data.page ?? 1) < (data.pages ?? 1)
  } catch (e) {
    console.error('Error cargando hilos:', e)
  } finally {
    isLoading.value = false
  }
}

async function loadBlogs(reset = true) {
  isLoadingBlogs.value = true
  if (reset) {
    currentBlogsPage.value = 1
    blogs.value = []
  }

  try {
    const params = new URLSearchParams({ sortBy: sortBy.value, page: currentBlogsPage.value })
    if (selectedCategory.value !== 'all') params.set('categoriaId', selectedCategory.value)
    if (searchQuery.value.trim()) params.set('search', searchQuery.value.trim())
    const filter = editorialFilter.value

    if (filter === 'blog' || filter === 'articulo') {
      const endpoint = filter === 'blog' ? '/sysreddit/blogs' : '/sysreddit/articulos'
      const data = await api(`${endpoint}?${params}`)
      const normalized = (data.hilos ?? []).map(normalizeBlog)

      if (reset) {
        blogs.value = normalized
      } else {
        blogs.value.push(...normalized)
      }

      hasMoreBlogs.value = (data.page ?? 1) < (data.pages ?? 1)
    } else {
      const [blogsRes, articulosRes] = await Promise.all([
        api(`/sysreddit/blogs?${params}`),
        api(`/sysreddit/articulos?${params}`),
      ])
      const merged = [
        ...(blogsRes.hilos ?? []).map(normalizeBlog),
        ...(articulosRes.hilos ?? []).map(normalizeBlog),
      ]
      merged.sort((a, b) => {
        if (sortBy.value === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (sortBy.value === 'top') return (b.upvotes ?? 0) - (a.upvotes ?? 0)
        if ((b.upvotes ?? 0) !== (a.upvotes ?? 0)) return (b.upvotes ?? 0) - (a.upvotes ?? 0)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      if (reset) blogs.value = merged
      else blogs.value.push(...merged)

      hasMoreBlogs.value = (blogsRes.page ?? 1) < (blogsRes.pages ?? 1) || (articulosRes.page ?? 1) < (articulosRes.pages ?? 1)
    }
  } catch (e) {
    console.error('Error cargando blogs/artículos:', e)
  } finally {
    isLoadingBlogs.value = false
  }
}

function setEditorialFilter(value) {
  editorialFilter.value = value
  loadBlogs(true)
}

// ── Cargar comentarios de un hilo (lazy) ──────────────────────────────────────
async function loadComments(threadId) {
  loadingComments[threadId] = true
  try {
    const data = await api(`/sysreddit/hilos/${threadId}/comentarios`)
    const t = threads.value.find(t => t.id === threadId)
    if (t) t.comments = (data.comentarios ?? []).map(normalizeComment)
  } catch (e) {
    console.error('Error cargando comentarios:', e)
  } finally {
    loadingComments[threadId] = false
  }
}

// ── Acciones de UI que disparan recarga ───────────────────────────────────────
function selectCategory(catId) {
  selectedCategory.value = catId
  if (activeTab.value === 'threads') loadThreads()
  else loadBlogs()
}

function changeSortBy(value) {
  sortBy.value = value
  if (activeTab.value === 'threads') loadThreads()
  else loadBlogs()
}

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (activeTab.value === 'threads') loadThreads()
    else loadBlogs()
  }, 400)
}

function loadMore() {
  if (activeTab.value === 'threads') {
    currentPage.value++
    loadThreads(false)
    return
  }

  currentBlogsPage.value++
  loadBlogs(false)
}

// ── Toggle comments panel ─────────────────────────────────────────────────────
async function toggleComments(threadId) {
  if (expandedThread.value === threadId) {
    expandedThread.value = null
    return
  }
  expandedThread.value = threadId
  const t = threads.value.find(t => t.id === threadId)
  // cargar comentarios si aún no los tiene
  if (t && (!t.comments || t.comments.length === 0)) {
    await loadComments(threadId)
  }
}

// ── Votar hilo ────────────────────────────────────────────────────────────────
async function vote(threadId, isUp) {
  const t = threads.value.find(t => t.id === threadId)
  if (!t) return

  // Optimistic update
  const prevUpvotes = t.upvotes
  const prevHasUpvoted = t.hasUpvoted
  const prevHasDownvoted = t.hasDownvoted

  if (isUp) {
    if (t.hasUpvoted) {
      // quitar upvote
      t.hasUpvoted = false
      t.upvotes -= 1
    } else if (t.hasDownvoted) {
      // cambiar downvote -> upvote
      t.hasDownvoted = false
      t.hasUpvoted = true
      t.upvotes += 2
    } else {
      // nuevo upvote
      t.hasUpvoted = true
      t.upvotes += 1
    }
  } else {
    if (t.hasDownvoted) {
      // quitar downvote
      t.hasDownvoted = false
      t.upvotes += 1
    } else if (t.hasUpvoted) {
      // cambiar upvote -> downvote
      t.hasUpvoted = false
      t.hasDownvoted = true
      t.upvotes -= 2
    } else {
      // nuevo downvote
      t.hasDownvoted = true
      t.upvotes -= 1
    }
  }

  try {
    const data = await api(`/sysreddit/hilos/${threadId}/votar`, {
      method: 'POST',
      body: JSON.stringify({ isUp }),
    })
    // Sincronizar con respuesta real
    if (data.upvotes !== undefined) t.upvotes = data.upvotes
    if (data.hasUpvoted !== undefined) t.hasUpvoted = data.hasUpvoted
    if (data.hasDownvoted !== undefined) t.hasDownvoted = data.hasDownvoted
  } catch {
    // Revertir si falla
    t.upvotes = prevUpvotes
    t.hasUpvoted = prevHasUpvoted
    t.hasDownvoted = prevHasDownvoted
  }
}

// ── Votar comentario ──────────────────────────────────────────────────────────
async function voteComment(threadId, commentId, isUp) {
  const t = threads.value.find(t => t.id === threadId)
  const c = t?.comments?.find(c => c.id === commentId)
  if (!c) return

  const prev = c.upvotes
  const prevHasUpvoted = c.hasUpvoted
  const prevHasDownvoted = c.hasDownvoted

  if (isUp) {
    if (c.hasUpvoted) {
      c.hasUpvoted = false
      c.upvotes -= 1
    } else if (c.hasDownvoted) {
      c.hasDownvoted = false
      c.hasUpvoted = true
      c.upvotes += 2
    } else {
      c.hasUpvoted = true
      c.upvotes += 1
    }
  } else {
    if (c.hasDownvoted) {
      c.hasDownvoted = false
      c.upvotes += 1
    } else if (c.hasUpvoted) {
      c.hasUpvoted = false
      c.hasDownvoted = true
      c.upvotes -= 2
    } else {
      c.hasDownvoted = true
      c.upvotes -= 1
    }
  }

  try {
    const data = await api(`/sysreddit/comentarios/${commentId}/votar`, {
      method: 'POST',
      body: JSON.stringify({ isUp }),
    })
    if (data.upvotes !== undefined) c.upvotes = data.upvotes
    if (data.hasUpvoted !== undefined) c.hasUpvoted = data.hasUpvoted
    if (data.hasDownvoted !== undefined) c.hasDownvoted = data.hasDownvoted
  } catch {
    c.upvotes = prev
    c.hasUpvoted = prevHasUpvoted
    c.hasDownvoted = prevHasDownvoted
  }
}

function findBlog(blogId) {
  return blogs.value.find(b => b.id === blogId)
}

async function voteBlog(blogId, isUp) {
  const b = findBlog(blogId)
  if (!b) return

  const prevUpvotes = b.upvotes
  const prevHasUpvoted = b.hasUpvoted
  const prevHasDownvoted = b.hasDownvoted

  if (isUp) {
    if (b.hasUpvoted) {
      b.hasUpvoted = false
      b.upvotes -= 1
    } else if (b.hasDownvoted) {
      b.hasDownvoted = false
      b.hasUpvoted = true
      b.upvotes += 2
    } else {
      b.hasUpvoted = true
      b.upvotes += 1
    }
  } else {
    if (b.hasDownvoted) {
      b.hasDownvoted = false
      b.upvotes += 1
    } else if (b.hasUpvoted) {
      b.hasUpvoted = false
      b.hasDownvoted = true
      b.upvotes -= 2
    } else {
      b.hasDownvoted = true
      b.upvotes -= 1
    }
  }

  try {
    const kind = b.kind ?? b.editorialKind ?? 'blog'
    const endpoint = kind === 'articulo'
      ? `/sysreddit/articulos/${blogId}/votar`
      : `/sysreddit/blogs/${blogId}/votar?kind=blog`
    const data = await api(endpoint, {
      method: 'POST',
      body: JSON.stringify({ isUp }),
    })
    if (data.upvotes !== undefined) b.upvotes = data.upvotes
    if (data.hasUpvoted !== undefined) b.hasUpvoted = data.hasUpvoted
    if (data.hasDownvoted !== undefined) b.hasDownvoted = data.hasDownvoted
  } catch {
    b.upvotes = prevUpvotes
    b.hasUpvoted = prevHasUpvoted
    b.hasDownvoted = prevHasDownvoted
  }
}

async function loadBlogComments(blogId) {
  loadingBlogComments[blogId] = true
  try {
    const currentBlog = findBlog(blogId)
    const kind = currentBlog?.kind ?? currentBlog?.editorialKind ?? 'blog'
    const endpoint = kind === 'articulo'
      ? `/sysreddit/articulos/${blogId}/comentarios`
      : `/sysreddit/blogs/${blogId}/comentarios?kind=blog`
    const data = await api(endpoint)
    const targetBlog = findBlog(blogId)
    if (targetBlog) targetBlog.comments = (data.comentarios ?? []).map(normalizeComment)
  } catch (e) {
    console.error('Error cargando comentarios de blog:', e)
  } finally {
    loadingBlogComments[blogId] = false
  }
}

async function toggleBlogComments(blogId) {
  if (expandedBlog.value === blogId) {
    expandedBlog.value = null
    return
  }

  expandedBlog.value = blogId
  const blog = findBlog(blogId)
  if (blog && (!blog.comments || blog.comments.length === 0)) {
    await loadBlogComments(blogId)
  }
}

async function submitBlogComment(blogId) {
  const text = newBlogComments[blogId]?.trim()
  if (!text || submittingComment.value) return

  submittingComment.value = true
  try {
    const currentBlog = findBlog(blogId)
    const kind = currentBlog?.kind ?? currentBlog?.editorialKind ?? 'blog'
    const endpoint = kind === 'articulo'
      ? `/sysreddit/articulos/${blogId}/comentarios`
      : `/sysreddit/blogs/${blogId}/comentarios?kind=blog`
    const data = await api(endpoint, {
      method: 'POST',
      body: JSON.stringify({ texto: text }),
    })

    const targetBlog = findBlog(blogId)
    if (targetBlog) {
      if (!targetBlog.comments) targetBlog.comments = []
      targetBlog.comments.push(normalizeComment(data.comentario))
      targetBlog.commentCount++
    }

    newBlogComments[blogId] = ''
  } catch {
    alert('No se pudo publicar el comentario.')
  } finally {
    submittingComment.value = false
  }
}

// ── Moderar: destacar / fijar / reportar / eliminar ───────────────────────────
async function toggleFeatured(threadId) {
  const t = threads.value.find(t => t.id === threadId)
  if (!t) return
  t.isFeatured = !t.isFeatured
  try {
    await api(`/sysreddit/hilos/${threadId}/feature`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured: t.isFeatured }),
    })
  } catch { t.isFeatured = !t.isFeatured }
}

async function togglePinned(threadId) {
  const t = threads.value.find(t => t.id === threadId)
  if (!t) return
  t.isPinned = !t.isPinned
  try {
    await api(`/sysreddit/hilos/${threadId}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ isPinned: t.isPinned }),
    })
  } catch { t.isPinned = !t.isPinned }
}

async function reportThread(threadId) {
  const t = threads.value.find(t => t.id === threadId)
  if (!t) return
  t.hasReports = true
  try {
    await api(`/sysreddit/hilos/${threadId}/report`, {
      method: 'PATCH',
      body: JSON.stringify({ reportado: true }),
    })
  } catch { t.hasReports = false }
}

async function deleteThread(threadId) {
  if (!confirm('¿Eliminar este hilo?')) return
  try {
    await api(`/sysreddit/hilos/${threadId}`, { method: 'DELETE' })
    threads.value = threads.value.filter(t => t.id !== threadId)
  } catch (e) {
    alert('No se pudo eliminar el hilo.')
  }
}

async function deleteComment(threadId, commentId) {
  if (!confirm('¿Eliminar este comentario?')) return
  try {
    await api(`/sysreddit/comentarios/${commentId}`, { method: 'DELETE' })
    const t = threads.value.find(t => t.id === threadId)
    if (t) {
      t.comments = t.comments.filter(c => c.id !== commentId)
      t.commentCount = Math.max(0, t.commentCount - 1)
    }
  } catch {
    alert('No se pudo eliminar el comentario.')
  }
}

// ── Publicar comentario ───────────────────────────────────────────────────────
async function submitComment(threadId) {
  const text = newComments[threadId]?.trim()
  if (!text || submittingComment.value) return

  submittingComment.value = true
  try {
    const data = await api(`/sysreddit/hilos/${threadId}/comentarios`, {
      method: 'POST',
      body: JSON.stringify({ texto: text }),
    })
    const t = threads.value.find(t => t.id === threadId)
    if (t) {
      if (!t.comments) t.comments = []
      t.comments.push(normalizeComment(data.comentario))
      t.commentCount++
    }
    newComments[threadId] = ''
  } catch (e) {
    alert('No se pudo publicar el comentario.')
  } finally {
    submittingComment.value = false
  }
}

// ── Abrir y publicar nuevo hilo ───────────────────────────────────────────────
function openCompose() {
  if (activeTab.value === 'blogs' && !canPublishBlogs.value) {
    alert('No tienes permiso para publicar blogs/artículos.')
    return
  }

  if (activeTab.value === 'blogs') {
    router.push('/blogs/new')
    return
  }

  editingBlogId.value = null
  compose.title = ''
  compose.categoriaId = ''
  compose.tipoId = ''
  compose.content = ''
  compose.formato = activeTab.value === 'blogs' ? 'blog' : 'blog'
  composeError.value = ''
  showCompose.value = true
}

async function submitPost() {
  if (!compose.title.trim()) return
  if (!compose.categoriaId) { composeError.value = 'Debes seleccionar una categoría.'; return }
  if (!compose.content.trim()) { composeError.value = 'El contenido no puede estar vacío.'; return }

  composeError.value = ''
  submittingPost.value = true
  try {
    if (activeTab.value === 'blogs' && !canPublishBlogs.value) {
      composeError.value = 'No tienes permiso para publicar blogs/artículos.'
      return
    }

    let tipoId = compose.tipoId ? Number(compose.tipoId) : undefined
    if (activeTab.value === 'blogs' && !tipoId) {
      const blogTipo = blogTipoOptionsByFormat.value.find(t => compose.formato === 'articulo'
        ? isArticleLikeTypeName(t.nombre)
        : isBlogFormatTypeName(t.nombre))
        ?? blogTipoOptionsByFormat.value[0]
      tipoId = blogTipo?.id
    }

    if (activeTab.value === 'threads' && tipoId) {
      const selected = tiposForo.value.find(t => Number(t.id) === Number(tipoId))
      if (selected && isBlogLikeTypeName(selected.nombre)) {
        composeError.value = 'Ese tipo corresponde a Blogs/Artículos. En Foros usa un tipo de discusión.'
        return
      }
    }

    const body = {
      titulo: compose.title,
      contenido: activeTab.value === 'blogs' ? sanitizeHtmlLight(compose.content) : compose.content,
      categoriaId: Number(compose.categoriaId),
      tipoId,
      formato: activeTab.value === 'blogs' ? compose.formato : undefined,
    }

    if (activeTab.value === 'blogs' && editingBlogId.value !== null) {
      await api(`/sysreddit/hilos/${editingBlogId.value}`, {
        method: 'PATCH',
        body: JSON.stringify({
          titulo: body.titulo,
          contenido: body.contenido,
          categoriaId: body.categoriaId,
          tipoId: body.tipoId,
        }),
      })
      await loadBlogs(true)
    } else {
      const endpoint = activeTab.value === 'blogs' ? '/sysreddit/blogs' : '/sysreddit/hilos'
      const data = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (activeTab.value === 'blogs') {
        const blog = data.blog ?? data.hilo
        if (blog) blogs.value.unshift(normalizeBlog(blog))
      } else {
        threads.value.unshift(normalizeThread(data.hilo))
      }
    }

    editingBlogId.value = null
    showCompose.value = false
  } catch (e) {
    composeError.value = e.message ?? 'No se pudo publicar el hilo.'
  } finally {
    submittingPost.value = false
  }
}

// ── Inicialización ────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadCatalogos()
  await loadThreads()
})

watch(activeTab, async (tab) => {
  compose.tipoId = ''
  editingBlogId.value = null
  if (tab === 'blogs') compose.formato = 'blog'

  if (tab === 'threads') {
    if (!threads.value.length) await loadThreads()
    return
  }

  if (!blogs.value.length) await loadBlogs()
})

watch(() => compose.formato, (format) => {
  if (activeTab.value !== 'blogs') return

  if (!compose.tipoId) return
  const selected = tiposForo.value.find(t => Number(t.id) === Number(compose.tipoId))
  if (!selected) {
    compose.tipoId = ''
    return
  }

  const compatible =
    format === 'articulo'
      ? isArticleLikeTypeName(selected.nombre)
      : isBlogFormatTypeName(selected.nombre)

  if (!compatible) compose.tipoId = ''
})

// Sincroniza búsqueda entre navbar y buscador de la vista.
let syncingSearch = false
watch(navbarSearch, (value) => {
  if (syncingSearch || value === searchQuery.value) return
  syncingSearch = true
  searchQuery.value = value
  syncingSearch = false

  if (activeTab.value === 'threads') onSearch()
})

watch(searchQuery, (value) => {
  if (syncingSearch || value === navbarSearch.value) return
  syncingSearch = true
  navbarSearch.value = value
  syncingSearch = false
})
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────────── */
.sysreddit {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-primary);
}

.stats-bar {
  background: color-mix(in srgb, var(--bg-surface) 95%, transparent);
  border-bottom: 1px solid var(--border-color);
  padding: 0.6rem 1.5rem;
}

.stats-bar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.stat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
}

.stat-dot.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3rem;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* ── Sidebar ─────────────────────────────────────────────────────────────────── */
.sidebar {
  display: grid;
  gap: 1rem;
  position: sticky;
  top: 1.5rem;
}

.tab-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.tab-btn.active {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  color: var(--accent-contrast);
}

.tab-icon {
  width: 15px;
  height: 15px;
}

.sidebar-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
}

.sidebar-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.sidebar-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.sidebar-icon.accent {
  color: var(--accent-500);
}

.category-list {
  display: grid;
  gap: 0.2rem;
}

.cat-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.45rem 0.65rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  text-align: left;
}

.cat-btn:hover { background: var(--bg-surface-alt, rgba(255,255,255,0.05)); }

.cat-btn.active {
  background: var(--accent-soft, rgba(124,92,255,0.12));
  color: var(--accent-500);
  font-weight: 600;
}

.cat-count {
  background: var(--bg-surface-alt, rgba(255,255,255,0.07));
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.new-post-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.7rem;
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  border-radius: 12px;
  color: var(--accent-contrast, #fff);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.new-post-btn:hover { opacity: 0.88; }
.new-post-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.publish-lock-note {
  display: block;
  margin-top: 0.45rem;
  color: #f59e0b;
  font-size: 0.75rem;
  line-height: 1.3;
}

.btn-icon { width: 15px; height: 15px; }

.role-tools { border-color: color-mix(in srgb, var(--accent-500) 25%, var(--border-color)); }

.role-list { display: grid; gap: 0.5rem; }

.role-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  padding: 0.3rem 0;
}

.role-icon { width: 14px; height: 14px; }

.role-item.aux { color: #facc15; }
.role-item.mod { color: var(--accent-400, #a78bfa); }

.sort-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}

.sort-btn.active {
  background: var(--accent-soft, rgba(124,92,255,0.12));
  border-color: var(--accent-500);
  color: var(--accent-500);
  font-weight: 600;
}

.sort-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

/* ── Feed ─────────────────────────────────────────────────────────────────── */
.feed { min-width: 0; }

.feed-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.feed-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.feed-subtitle {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin: 0.25rem 0 0;
}

.search-wrap {
  position: relative;
  flex: 0 0 auto;
}

.search-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--text-muted);
}

.search-input {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.5rem 0.75rem 0.5rem 2.1rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  width: 220px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-500);
}

/* ── Thread Cards ─────────────────────────────────────────────────────────── */
.thread-feed { display: grid; gap: 1rem; }

.thread-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.1rem 1.25rem;
  transition: border-color 0.2s, transform 0.15s;
}

.thread-card:hover {
  border-color: color-mix(in srgb, var(--accent-500) 35%, var(--border-color));
  transform: translateY(-1px);
}

.thread-card.featured {
  border-color: rgba(250, 204, 21, 0.4);
  background: color-mix(in srgb, var(--bg-surface) 97%, #facc15);
}

.thread-card.pinned {
  border-left: 3px solid var(--accent-500);
}

.thread-card.reported {
  border-color: rgba(239, 68, 68, 0.35);
  background: color-mix(in srgb, var(--bg-surface) 97%, #ef4444);
}

.badge-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.thread-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

.badge-icon { width: 10px; height: 10px; }

.pinned-badge { background: var(--accent-soft, rgba(124,92,255,0.12)); color: var(--accent-500); }
.featured-badge { background: rgba(250, 204, 21, 0.18); color: #facc15; }
.report-badge { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.thread-body {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.vote-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-width: 38px;
}

.vote-btn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.vote-btn:hover { background: var(--bg-surface-alt, rgba(255,255,255,0.06)); }
.vote-btn svg { width: 16px; height: 16px; }

.vote-btn.up.voted { color: var(--accent-500); }
.vote-btn.up.voted svg { stroke: var(--accent-500); }
.vote-btn.down.voted { color: #f87171; }
.vote-btn.down.voted svg { stroke: #f87171; }

.vote-count {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-muted);
}

.vote-count.positive { color: var(--accent-500); }

.thread-content { flex: 1; min-width: 0; }

.thread-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  cursor: pointer;
  transition: color 0.15s;
  line-height: 1.4;
}

.thread-title:hover { color: var(--accent-500); }

.thread-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.55rem;
}

.thread-tag {
  background: var(--accent-soft, rgba(124,92,255,0.1));
  color: var(--accent-500);
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

.thread-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.65rem;
}

.author-name { color: var(--text-primary); font-weight: 600; }

.author-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.author-badge.student { background: var(--accent-soft, rgba(124,92,255,0.12)); color: var(--accent-500); }
.author-badge.auxiliar { background: rgba(250, 204, 21, 0.18); color: #facc15; }
.author-badge.moderador { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.author-badge.admin { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.meta-sep { color: var(--border-color); }
.time-ago { color: var(--text-muted); }

.comment-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.comment-toggle:hover { color: var(--accent-500); }
.meta-icon { width: 13px; height: 13px; }

.thread-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.1rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-soft);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover { background: var(--bg-surface-alt, rgba(255,255,255,0.05)); color: var(--text-primary); }
.action-icon { width: 13px; height: 13px; }
.action-btn.warn:hover { border-color: #f59e0b; color: #f59e0b; }
.action-btn.aux-btn { color: #facc15; border-color: rgba(250, 204, 21, 0.3); }
.action-btn.aux-btn:hover { background: rgba(250, 204, 21, 0.08); }
.action-btn.aux-btn.active { background: rgba(250, 204, 21, 0.12); }
.action-btn.mod-btn { color: var(--accent-400, #a78bfa); border-color: rgba(124,92,255, 0.3); }
.action-btn.delete-btn { color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
.action-btn.delete-btn:hover { background: rgba(239, 68, 68, 0.08); }

/* ── Comments Panel ──────────────────────────────────────────────────────── */
.comments-panel {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--border-color);
  display: grid;
  gap: 0.75rem;
}

.comments-list { display: grid; gap: 0.75rem; }

.comment-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-contrast, #fff);
  flex-shrink: 0;
}

.comment-avatar.self {
  background: linear-gradient(135deg, #22c55e, #0ea5e9);
  font-size: 0.55rem;
}

.comment-body { flex: 1; min-width: 0; }

.comment-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}

.comment-time { font-size: 0.75rem; color: var(--text-muted); }

.comment-text {
  font-size: 0.875rem;
  color: var(--text-soft);
  margin: 0 0 0.4rem;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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
  transition: background 0.15s, color 0.15s;
}

.comment-vote:hover { background: var(--bg-surface-alt, rgba(255,255,255,0.05)); color: var(--accent-500); }
.comment-vote.voted { color: var(--accent-500); }

.comment-reply-btn {
  background: none;
  border: none;
  color: var(--accent-500);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.15rem 0.4rem;
}

.new-comment {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.comment-input-wrap { flex: 1; }

.comment-textarea {
  width: 100%;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.comment-textarea:focus { outline: none; border-color: var(--accent-500); }

.comment-submit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.4rem;
}

.comment-hint { font-size: 0.75rem; color: var(--text-muted); }

.submit-comment-btn {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  border-radius: 8px;
  color: var(--accent-contrast, #fff);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-comment-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Blog Feed ─────────────────────────────────────────────────────────────── */
.blog-hero {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 220px;
  margin-bottom: 1.25rem;
  transition: border-color 0.2s;
}

.blog-hero:hover { border-color: color-mix(in srgb, var(--accent-500) 35%, var(--border-color)); }

.blog-hero-content {
  padding: 1.75rem 1.5rem;
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.blog-hero-meta { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }

.read-time {
  font-size: 0.78rem;
  color: var(--text-muted);
  background: var(--bg-surface-alt, rgba(255,255,255,0.05));
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.blog-hero-title { font-size: 1.3rem; font-weight: 800; margin: 0; line-height: 1.35; }
.blog-hero-excerpt { color: var(--text-soft); font-size: 0.9rem; line-height: 1.55; margin: 0; }
.blog-hero-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.25rem; }
.blog-author { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; }
.blog-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-500), var(--accent-400)); display: grid; place-items: center; font-size: 0.75rem; font-weight: 700; color: var(--accent-contrast, #fff); }
.blog-avatar.small { width: 22px; height: 22px; font-size: 0.65rem; }
.blog-hero-actions { display: flex; align-items: center; gap: 0.5rem; }

.vote-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-soft);
  font-size: 0.82rem;
  padding: 0.3rem 0.65rem;
  cursor: pointer;
  transition: all 0.15s;
}

.vote-inline:hover { border-color: var(--accent-500); color: var(--accent-500); }

.read-btn {
  background: linear-gradient(90deg, var(--accent-500), var(--accent-400));
  border: none;
  border-radius: 10px;
  color: var(--accent-contrast, #fff);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.45rem 1rem;
  cursor: pointer;
  transition: opacity 0.15s;
}

.read-btn:hover { opacity: 0.88; }

.content-kind-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.content-kind-badge.blog {
  background: color-mix(in srgb, #0ea5e9 18%, transparent);
  color: #38bdf8;
  border: 1px solid color-mix(in srgb, #0ea5e9 45%, transparent);
}

.content-kind-badge.articulo {
  background: color-mix(in srgb, #f59e0b 18%, transparent);
  color: #fbbf24;
  border: 1px solid color-mix(in srgb, #f59e0b 45%, transparent);
}

.edit-blog-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: color-mix(in srgb, var(--accent-500) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent-500) 45%, transparent);
  border-radius: 8px;
  color: var(--accent-300, #c4b5fd);
  font-size: 0.78rem;
  padding: 0.3rem 0.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.edit-blog-btn:hover {
  border-color: var(--accent-500);
  color: var(--accent-100, #ede9fe);
}

.blog-hero-cover { display: grid; place-items: center; min-height: 200px; }
.cover-illustration { width: 120px; }

.blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }

.blog-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.15s;
  display: flex;
  flex-direction: column;
}

.blog-card:hover { border-color: color-mix(in srgb, var(--accent-500) 35%, var(--border-color)); transform: translateY(-2px); }

.blog-cover { height: 100px; position: relative; display: flex; align-items: flex-start; padding: 0.6rem; }

.blog-cover-tag { background: rgba(0,0,0,0.4); color: #fff; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 999px; backdrop-filter: blur(4px); }

.blog-card-body { padding: 1rem; display: grid; gap: 0.5rem; flex: 1; }
.blog-card-meta { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
.blog-card-title { font-size: 0.95rem; font-weight: 700; margin: 0; line-height: 1.35; }
.blog-card-excerpt { font-size: 0.82rem; color: var(--text-muted); margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.blog-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border-color); }
.blog-author-name { font-size: 0.8rem; font-weight: 600; }
.blog-card-stats { display: flex; align-items: center; gap: 0.5rem; }
.comment-count-small { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.78rem; color: var(--text-muted); }

/* ── Empty state ─────────────────────────────────────────────────────────── */
.empty-feed { text-align: center; padding: 3rem; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 16px; }
.empty-icon { width: 48px; height: 48px; margin: 0 auto 1rem; display: block; }
.load-more-row { display: flex; justify-content: center; margin-top: 1.5rem; }

.editorial-filter { display: flex; gap: 0.6rem; flex-wrap: wrap; margin: 0.5rem 0 1rem; }
.filter-pill { border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-soft); padding: 0.35rem 0.9rem; border-radius: 999px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
.filter-pill.active { background: linear-gradient(90deg, var(--accent-500), var(--accent-400)); color: var(--accent-contrast); border-color: transparent; }
.load-more-btn { background: transparent; border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-soft); padding: 0.65rem 2rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.load-more-btn:hover { border-color: var(--accent-500); color: var(--accent-500); }

/* ── Compose Modal ───────────────────────────────────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 100; display: grid; place-items: center; padding: 1.5rem; }
.modal { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 20px; width: 100%; max-width: 560px; display: grid; gap: 0; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.4); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); font-weight: 700; font-size: 1.05rem; }
.modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; border-radius: 6px; display: grid; place-items: center; transition: color 0.15s; }
.modal-close:hover { color: var(--text-primary); }
.modal-close svg { width: 18px; height: 18px; }
.modal-body { padding: 1.25rem 1.5rem; display: grid; gap: 1rem; }
.form-group { display: grid; gap: 0.4rem; }
.form-label { font-size: 0.82rem; font-weight: 600; color: var(--text-soft); }
.form-input, .form-select, .form-textarea { background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.6rem 0.75rem; color: var(--text-primary); font-size: 0.88rem; width: 100%; box-sizing: border-box; font-family: inherit; transition: border-color 0.2s; }
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--accent-500); }
.form-select { cursor: pointer; }
.form-textarea { resize: vertical; }
.format-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.format-btn { border: 1px solid var(--border-color); background: var(--bg-app); color: var(--text-muted); padding: 0.55rem 0.7rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.format-btn.active { border-color: var(--accent-500); color: var(--accent-500); background: color-mix(in srgb, var(--accent-500) 14%, transparent); }
.form-help { display: block; margin-top: 0.35rem; color: var(--text-muted); font-size: 0.78rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); }

.primary { display: inline-flex; align-items: center; gap: 0.4rem; background: linear-gradient(90deg, var(--accent-500), var(--accent-400)); border: none; border-radius: 12px; color: var(--accent-contrast, #fff); font-weight: 700; padding: 0.65rem 1.25rem; cursor: pointer; transition: opacity 0.2s; font-size: 0.9rem; }
.primary:disabled { opacity: 0.4; cursor: not-allowed; }
.primary:hover:not(:disabled) { opacity: 0.88; }
.secondary { background: transparent; border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-soft); font-weight: 600; padding: 0.65rem 1.25rem; cursor: pointer; font-size: 0.9rem; transition: all 0.15s; }
.secondary:hover { border-color: var(--text-muted); color: var(--text-primary); }

/* ── Transitions ─────────────────────────────────────────────────────────── */
.thread-list-enter-active, .thread-list-leave-active { transition: all 0.25s ease; }
.thread-list-enter-from { opacity: 0; transform: translateY(-8px); }
.thread-list-leave-to { opacity: 0; transform: translateY(8px); }
.comments-slide-enter-active, .comments-slide-leave-active { transition: all 0.25s ease; overflow: hidden; }
.comments-slide-enter-from, .comments-slide-leave-to { opacity: 0; max-height: 0; }
.comments-slide-enter-to, .comments-slide-leave-from { max-height: 600px; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .tab-toggle { max-width: 280px; }
  .blog-hero { grid-template-columns: 1fr; }
  .blog-hero-cover { display: none; }
  .blog-grid { grid-template-columns: 1fr; }
  .feed-header { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .search-wrap { width: 100%; }
}
</style>