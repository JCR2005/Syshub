<template>
  <div class="admin-page">
    <header class="admin-header">
      <div class="brand-block">
        <div class="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="icon-svg">
            <path d="M12 2 4 5v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V5l-8-3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div>
          <h1>Admin Portal</h1>
          <p>Syshub Management</p>
        </div>
      </div>

      <div class="admin-header-actions">
        <button v-if="canAccessStudentMode" class="mode-switch-btn" type="button" @click="switchToStudentMode">
          Modo estudiante
        </button>
        <span class="admin-badge">Administrador</span>
        <button class="avatar" type="button" @click="goProfile" title="Ir a perfil">{{ avatarInitials }}</button>
      </div>
    </header>

    <main class="admin-content">
      <div class="tab-row" role="tablist">
        <button class="tab-btn" :class="{ active: activeTab === 'users' }" role="tab" type="button" @click="activeTab = 'users'">
          User Management
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'system' }" role="tab" type="button" @click="activeTab = 'system'">
          System Classification
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'forum' }" role="tab" type="button" @click="activeTab = 'forum'">
          Sys-Reddit
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'curadoria' }" role="tab" type="button" @click="activeTab = 'curadoria'">
          Curaduría Auxiliar
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'moderation' }" role="tab" type="button" @click="activeTab = 'moderation'">
          Global Moderation
          <span class="pending-pill">2</span>
        </button>
      </div>

      <!-- ── USERS ─────────────────────────────────────────────────────────── -->
      <section v-if="activeTab === 'users'" class="panel users-panel">
        <div class="panel-title-row">
          <div>
            <h2>User Management</h2>
            <p>Create, manage users, and assign roles</p>
          </div>
          <button class="create-btn" type="button" @click="openCreateUser">
            <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
              <path d="M12 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            Create User
          </button>
        </div>

        <label class="search-box">
          <svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true">
            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="m21 21-4.3-4.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <input v-model.trim="search" type="text" placeholder="Search users..." />
        </label>

        <p v-if="errorMessage" class="state error">{{ errorMessage }}</p>
        <p v-else-if="isLoading" class="state">Cargando usuarios...</p>

        <div v-else class="table-shell">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>ID</th><th>Roles</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'row-editing': editingUserId === user.id }">
                <td>
                  <strong>{{ user.nombre || 'Sin nombre' }}</strong>
                  <div class="muted">Usuario #{{ user.id }}</div>
                </td>
                <td class="muted">{{ user.correo }}</td>
                <td>{{ user.carnet || '—' }}</td>

                <!-- Roles + Rangos (modo vista / modo edición) -->
                <td>
                  <!-- MODO EDICIÓN: toggles de rango -->
                  <div v-if="editingUserId === user.id" class="rango-toggles">
                    <label class="rango-toggle" :class="{ active: (user.rangos ?? []).includes('Auxiliar') }">
                      <input
                        type="checkbox"
                        :checked="(user.rangos ?? []).includes('Auxiliar')"
                        :disabled="busyUserId === user.id"
                        @change="toggleRango(user, 'Auxiliar')"
                      />
                      <span class="toggle-track"></span>
                      <span class="toggle-label aux">Auxiliar</span>
                    </label>
                    <label class="rango-toggle" :class="{ active: (user.rangos ?? []).includes('Moderador') }">
                      <input
                        type="checkbox"
                        :checked="(user.rangos ?? []).includes('Moderador')"
                        :disabled="busyUserId === user.id"
                        @change="toggleRango(user, 'Moderador')"
                      />
                      <span class="toggle-track"></span>
                      <span class="toggle-label mod">Moderador</span>
                    </label>
                    <label class="rango-toggle" :class="{ active: user.roles.includes('admin') }">
                      <input
                        type="checkbox"
                        :checked="user.roles.includes('admin')"
                        :disabled="busyUserId === user.id"
                        @change="toggleAdmin(user)"
                      />
                      <span class="toggle-track"></span>
                      <span class="toggle-label admin-lbl">Admin</span>
                    </label>
                  </div>

                  <!-- MODO VISTA: badges -->
                  <div v-else class="roles-wrap">
                    <span class="role-chip student">Student</span>
                    <span v-if="user.roles.includes('admin')" class="role-chip admin">Admin</span>
                    <span v-if="(user.rangos ?? []).includes('Auxiliar')" class="role-chip aux">Auxiliar</span>
                    <span v-if="(user.rangos ?? []).includes('Moderador')" class="role-chip mod">Moderador</span>
                  </div>
                </td>

                <td>
                  <span class="status-pill" :class="user.bloqueado ? 'blocked' : 'active'">
                    {{ user.bloqueado ? 'blocked' : 'active' }}
                  </span>
                </td>

                <td>
                  <div class="actions-wrap">
                    <!-- Modo edición: botón Listo -->
                    <template v-if="editingUserId === user.id">
                      <button class="icon-btn success" type="button" @click="editingUserId = null" title="Listo">
                        <svg viewBox="0 0 24 24" class="mini-icon"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                      </button>
                    </template>

                    <!-- Modo vista: botones editar y bloquear -->
                    <template v-else>
                      <button
                        class="icon-btn"
                        type="button"
                        :disabled="busyUserId === user.id"
                        @click="editingUserId = user.id"
                        title="Editar rangos"
                      >
                        <svg viewBox="0 0 24 24" class="mini-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      </button>
                      <button
                        class="icon-btn danger"
                        type="button"
                        :disabled="busyUserId === user.id"
                        @click="toggleBlocked(user)"
                        :title="user.bloqueado ? 'Activar usuario' : 'Bloquear usuario'"
                      >
                        <svg v-if="user.bloqueado" viewBox="0 0 24 24" class="mini-icon"><path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        <svg v-else viewBox="0 0 24 24" class="mini-icon"><path d="M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /><path d="m6 6 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!filteredUsers.length" class="empty-state">No hay usuarios para mostrar.</p>
        </div>
      </section>

      <!-- ── SYSTEM CLASSIFICATION ──────────────────────────────────────────── -->
      <section v-else-if="activeTab === 'system'" class="system-layout">
        <article class="panel">
          <div class="panel-title-row">
            <div>
              <h2>System Classification</h2>
              <p>Organiza pensum, cursos y catálogos globales para toda la aplicación.</p>
            </div>
          </div>
          <p v-if="classificationError" class="state error">{{ classificationError }}</p>
          <p v-else-if="isClassificationLoading" class="state">Cargando clasificación...</p>
        </article>

        <article class="panel">
          <div class="block-header">
            <h3>Tech Areas</h3>
           <div class="inline-form">
  <input v-model.trim="newArea.nombre" placeholder="Nombre del área" />
  <input v-model.trim="newArea.descripcion" placeholder="Descripción (opcional)" />

  <select v-model.number="newArea.pensumId">
    <option :value="null">Selecciona un pensum</option>
    <option v-for="p in classification.pensums" 
            :key="p.id" 
            :value="p.id">
      {{ p.nombre }}
    </option>
  </select>

  <button class="create-btn" type="button" @click="createArea">
    Agregar
  </button>
</div>
          </div>
          <div class="table-shell">
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Descripción</th>
        <th>Pensum</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="area in classification.areas" 
          :key="`area-${area.id}`">

        <td class="area-name">
          <span 
            class="color-bar"
            :style="{ backgroundColor: area.color || '#ccc' }">
          </span>
          {{ area.nombre }}
        </td>

        <td class="muted">
          {{ area.descripcion || '—' }}
        </td>

        <td>
          {{ area.pensumNombre || '—' }}
        </td>

        <td>
          <button 
            class="icon-btn danger" 
            type="button" 
            @click="deleteArea(area.id)">
            ✕
          </button>
        </td>

      </tr>
    </tbody>
  </table>
</div>
        </article>

        <article class="panel">
          <div class="double-grid">
            <section>
              <div class="block-header">
                <h3>Stacks</h3>
                <div class="inline-form">
                  <input v-model.trim="newStack" placeholder="Nuevo stack" />
                  <button class="create-btn" type="button" @click="createStack">Agregar</button>
                </div>
              </div>
              <div class="chip-list-wrap compact">
                <span v-for="stack in classification.stacks" :key="`stack-${stack.id}`" class="role-chip student">
                  {{ stack.nombre }}
                  <button class="chip-remove" type="button" @click="deleteStack(stack.id)">✕</button>
                </span>
              </div>
            </section>

            <section>
              <div class="block-header">
                <h3>Tags</h3>
                <div class="inline-form">
                  <input v-model.trim="newTag" placeholder="Nuevo tag" />
                  <button class="create-btn" type="button" @click="createTag">Agregar</button>
                </div>
              </div>
              <div class="chip-list-wrap compact">
                <span v-for="tag in classification.tags" :key="`tag-${tag.id}`" class="role-chip admin">
                  {{ tag.nombre }}
                  <button class="chip-remove" type="button" @click="deleteTag(tag.id)">✕</button>
                </span>
              </div>
            </section>
          </div>
        </article>

        <article class="panel">
  <div class="block-header">
    <h3>Carreras</h3>
    <div class="inline-form">
      <input v-model.trim="newCarrera.nombre" placeholder="Ingeniería en Sistemas" />
      <label class="color-field">
        <span>Color</span>
        <input v-model.trim="newCarrera.color" type="color" />
      </label>
      <input v-model.trim="newCarrera.color" placeholder="#22c55e" class="color-code" />
      <button class="create-btn" type="button" @click="createCarrera">Agregar</button>
    </div>
  </div>

 <div class="table-shell">
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="carrera in classification.carreras" 
          :key="`carrera-${carrera.id}`"
          class="carrera-row">

        <td class="carrera-name">
          <span 
            class="color-bar"
            :style="{ backgroundColor: carrera.color || '#ccc' }">
          </span>
          {{ carrera.nombre }}
        </td>

        <td>
          <button 
            class="icon-btn danger" 
            type="button" 
            @click="deleteCarrera(carrera.id)">
            ✕
          </button>
        </td>

      </tr>
    </tbody>
  </table>
</div>
</article>
        <article class="panel">
          <div class="block-header">
            <h3>Pensum</h3>
            <div class="inline-form">
  <input v-model.trim="newPensum.nombre" placeholder="Pensum 2026" />
  <input v-model.trim="newPensum.descripcion" placeholder="Descripción (opcional)" />

  <select v-model.number="newPensum.carreraId">
  <option :value="null">Selecciona una carrera</option>
    <option v-for="c in classification.carreras" 
            :key="c.id" 
            :value="c.id">
      {{ c.nombre }}
    </option>
  </select>

  <button class="create-btn" type="button" @click="createPensum">
    Agregar
  </button>
</div>
          </div>
          <div class="table-shell">
            <table>
              <thead><tr><th>Nombre</th><th>Descripción</th><th>Vigente</th><th>Acciones</th></tr></thead>
              <tbody>
                <tr v-for="pensum in classification.pensums" :key="`pensum-${pensum.id}`">
                  <td class="pensum-name">
  <span 
    class="color-bar"
    :style="{ backgroundColor: pensum.color || '#ccc' }">
  </span>
  {{ pensum.nombre }}
</td>
                  <td class="muted">{{ pensum.descripcion || '—' }}</td>
                  <td>
                    <span class="status-pill" :class="pensum.vigente ? 'active' : 'blocked'">
                      {{ pensum.vigente ? 'sí' : 'no' }}
                    </span>
                  </td>
                  <td>
                    <div class="actions-wrap">
                      <button class="icon-btn" type="button" @click="togglePensum(pensum.id)">↻</button>
                      <button class="icon-btn danger" type="button" @click="deletePensum(pensum.id)">✕</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="panel">
          <div class="block-header">
            <h3>Courses</h3>
            <div class="inline-form large">
              <input v-model.trim="newCourse.codigo" placeholder="0000" />
              <input v-model.trim="newCourse.nombre" placeholder="Nombre del curso" />
              <input v-model.number="newCourse.semestre" type="number" min="1" max="20" placeholder="Semestre" />
              <select v-model.number="newCourse.pensumId">
                <option :value="null">Pensum</option>
                <option v-for="pensum in classification.pensums" :key="`p-opt-${pensum.id}`" :value="pensum.id">{{ pensum.nombre }}</option>
              </select>
              <select v-model.number="newCourse.areaId">
                <option :value="null">Área</option>
                <option v-for="area in classification.areas" :key="`a-opt-${area.id}`" :value="area.id">{{ area.nombre }}</option>
              </select>
              <button class="create-btn" type="button" @click="createCourse">Add Course</button>
            </div>
          </div>
          <div class="table-shell">
            <table>
              <thead><tr><th>Código</th><th>Nombre</th><th>Área</th><th>Semestre</th><th>Pensum</th><th>Acciones</th></tr></thead>
              <tbody>
                <tr v-for="course in classification.courses" :key="`course-${course.id}`">
                  <td>{{ course.codigo }}</td>
                  <td>{{ course.nombre }}</td>
                  <td><span class="role-chip" :class="course.area ? 'student' : ''">{{ course.area || '—' }}</span></td>
                  <td>{{ course.semestre }}</td>
                  <td>{{ course.pensum || '—' }}</td>
                  <td>
                    <button class="icon-btn danger" type="button" @click="deleteCourse(course.id)">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <!-- ── SYSREDDIT ──────────────────────────────────────────────────────── -->
      <section v-else-if="activeTab === 'forum'" class="system-layout">

        <!-- Header -->
        <article class="panel">
          <div class="panel-title-row">
            <div class="sysreddit-header">
              <div class="sysreddit-logo">
                <svg viewBox="0 0 24 24" class="sysreddit-logo-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <div>
                <h2 style="margin:0">Sys-Reddit</h2>
                <p style="margin:0.2rem 0 0;color:var(--text-muted);font-size:0.88rem">Gestión de categorías y tipos de publicación del foro social.</p>
              </div>
            </div>
          </div>
          <p v-if="forumError" class="state error">{{ forumError }}</p>
          <p v-else-if="isForumLoading" class="state">Cargando...</p>
        </article>

        <!-- ── Categorías compartidas ─────────────────────────────────────── -->
        <article class="panel">
          <div class="block-header">
            <div>
              <div class="section-badge-row">
                <h3 style="margin:0">Categorías</h3>
                <span class="scope-badge scope-shared">
                  <svg viewBox="0 0 24 24" style="width:10px;height:10px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                  Foros · Blogs · Artículos
                </span>
              </div>
              <p class="muted" style="margin:0.35rem 0 0; font-size:0.82rem">
                Compartidas por todo Sys-Reddit. Los usuarios las eligen al crear hilos, blogs y artículos.
              </p>
            </div>
            <div class="inline-form">
              <input v-model.trim="newCategoria" placeholder="Ej: Desarrollo Web" />
              <button class="create-btn" type="button" @click="createCategoria" :disabled="!newCategoria.trim()">
                Agregar
              </button>
            </div>
          </div>

          <div v-if="!categoriasForo.length && !isForumLoading" class="empty-state" style="margin-top:0.5rem">
            No hay categorías. Agrega las primeras para que el foro funcione.
          </div>

          <div class="chip-list-wrap" style="margin-top:0.5rem">
            <span
              v-for="cat in categoriasForo"
              :key="`cat-${cat.id}`"
              class="role-chip forum-chip"
            >
              <svg viewBox="0 0 24 24" style="width:11px;height:11px;margin-right:3px"><path d="M4 6h16M4 12h16M4 18h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              {{ cat.nombre }}
              <span class="chip-count" v-if="cat.count !== undefined">({{ cat.count }})</span>
              <button class="chip-remove" type="button" @click="deleteCategoria(cat.id)" :title="cat.count ? 'Tiene hilos, no se puede eliminar' : 'Eliminar'">✕</button>
            </span>
          </div>

          <div class="quick-seed" v-if="!categoriasForo.length">
            <p class="muted" style="font-size:0.82rem;margin:0.75rem 0 0.4rem">Carga rápida de categorías predeterminadas:</p>
            <button class="create-btn" type="button" @click="seedCategorias" style="font-size:0.82rem">
              Cargar predeterminadas
            </button>
          </div>
        </article>

        <!-- ── Tipos de foro — SOLO para hilos ────────────────────────────── -->
        <article class="panel">
          <div class="block-header">
            <div>
              <div class="section-badge-row">
                <h3 style="margin:0">Tipo de foro</h3>
                <span class="scope-badge scope-forum">
                  <svg viewBox="0 0 24 24" style="width:10px;height:10px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                  Solo foros
                </span>
              </div>
              <p class="muted" style="margin:0.35rem 0 0; font-size:0.82rem">
                Solo aplican a hilos del foro. Los blogs y artículos usan formato fijo (Blog / Artículo).
              </p>
            </div>
            <div class="inline-form">
              <input v-model.trim="newTipo" placeholder="Ej: Pregunta" />
              <button class="create-btn" type="button" @click="createTipo" :disabled="!newTipo.trim()">
                Agregar
              </button>
            </div>
          </div>

          <div v-if="!tiposForo.length && !isForumLoading" class="empty-state" style="margin-top:0.5rem">
            No hay tipos de hilo.
          </div>

          <div class="chip-list-wrap" style="margin-top:0.5rem">
            <span
              v-for="tipo in tiposForo"
              :key="`tipo-${tipo.id}`"
              class="role-chip tipo-chip"
            >
              {{ tipo.nombre }}
              <button class="chip-remove" type="button" @click="deleteTipo(tipo.id)">✕</button>
            </span>
          </div>

          <div class="quick-seed" v-if="!tiposForo.length">
            <p class="muted" style="font-size:0.82rem;margin:0.75rem 0 0.4rem">Tipos predeterminados:</p>
            <button class="create-btn" type="button" @click="seedTipos" style="font-size:0.82rem">
              Cargar predeterminados
            </button>
          </div>
        </article>

        <!-- ── Blogs y Artículos — info de solo lectura ───────────────────── -->
        <article class="panel">
          <div class="block-header">
            <div>
              <div class="section-badge-row">
                <h3 style="margin:0">Formato Blog / Artículo</h3>
                <span class="scope-badge scope-static">
                  <svg viewBox="0 0 24 24" style="width:10px;height:10px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                  Estático · Solo lectura
                </span>
              </div>
              <p class="muted" style="margin:0.35rem 0 0; font-size:0.82rem">
                El tipo de publicación en blogs y artículos es fijo. El autor elige al crear.
              </p>
            </div>
          </div>
          <div class="static-types-row">
            <div class="static-type-chip">
              <svg viewBox="0 0 24 24" class="static-type-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <div>
                <strong>Blog</strong>
                <p>Tutorial o guía práctica</p>
              </div>
            </div>
            <div class="static-type-chip">
              <svg viewBox="0 0 24 24" class="static-type-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <div>
                <strong>Artículo</strong>
                <p>Investigación o análisis</p>
              </div>
            </div>
          </div>
        </article>

      </section>

      <section v-else-if="activeTab === 'curadoria'" class="system-layout">

        <!-- Header -->
        <article class="panel">
          <div class="panel-title-row">
            <div class="sysreddit-header">
              <div class="sysreddit-logo">
                <svg viewBox="0 0 24 24" class="sysreddit-logo-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="10" y1="9" x2="8" y2="9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h2 style="margin:0">Curaduría Auxiliar</h2>
                <p style="margin:0.2rem 0 0;color:var(--text-muted);font-size:0.88rem">Tipos de recursos disponibles para auxiliares (PDFs, Videos, Repositorios, etc.)</p>
              </div>
            </div>
          </div>
          <p v-if="curaduriaError" class="state error">{{ curaduriaError }}</p>
          <p v-else-if="isCuraduriaLoading" class="state">Cargando tipos de recursos...</p>
        </article>

        <!-- Crear Tipo de Recurso -->
        <article class="panel">
          <div class="block-header">
            <div>
              <div class="section-badge-row">
                <h3 style="margin:0">Nuevo Tipo de Recurso</h3>
                <span class="scope-badge scope-shared">Auxiliar</span>
              </div>
              <p class="muted" style="margin:0.35rem 0 0;font-size:0.82rem">
                Completa los campos y elige un ícono. El slug se genera automáticamente.
              </p>
            </div>
          </div>

          <!-- Form grid -->
          <div class="curaduria-form-grid">
            <div class="form-field">
              <label class="field-label">Nombre del recurso <span class="field-required">*</span></label>
              <input
                v-model.trim="newTipoRecurso.nombre_recurso"
                placeholder="Ej: Documento PDF"
                class="field-input"
              />
            </div>
            <div class="form-field">
              <label class="field-label">
                Slug
                <span class="field-badge">auto</span>
              </label>
              <div class="field-slug-preview">
                <svg viewBox="0 0 24 24" style="width:13px;height:13px;flex-shrink:0;color:var(--text-muted)">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <code>{{ newTipoRecurso.slug || 'se-genera-al-escribir' }}</code>
              </div>
            </div>
            <div class="form-field form-field--full">
              <label class="field-label">Descripción</label>
              <input
                v-model.trim="newTipoRecurso.descripcion"
                placeholder="Ej: PDFs, presentaciones y guías de estudio"
                class="field-input"
              />
            </div>
          </div>

          <!-- Icon picker -->
          <div class="icon-picker-section">
            

            <!-- Search results -->
            <template v-if="iconResults.length">
              <div class="catalog-section" style="margin-bottom:0.5rem">
                <h4>Resultados de búsqueda ({{ iconResults.length }})</h4>
                <div class="icon-grid">
                  <button
                    v-for="iconId in iconResults"
                    :key="`sr-${iconId}`"
                    type="button"
                    class="icon-selector-btn"
                    :class="{ active: newTipoRecurso.icono_svg === iconId }"
                    @click="selectIcon(iconId)"
                  >
                    <img :src="`https://api.iconify.design/${iconId}.svg`" style="width:22px;height:22px" />
                    <span>{{ iconId.split(':')[1] }}</span>
                  </button>
                </div>
              </div>
            </template>
            <p v-else-if="iconSearch.length >= 2 && !isSearching" class="muted" style="margin:0.2rem 0 0.8rem">
              Sin resultados. Prueba con otro término o elige un icono del catálogo.
            </p>

            <!-- Library catalog -->
            <div class="icon-catalog-container">
              <div v-for="(icons, category) in iconLibrary" :key="category" class="catalog-section">
                <h4>{{ category }}</h4>
                <div class="icon-grid">
                  <button
                    v-for="icon in icons"
                    :key="icon.id"
                    type="button"
                    class="icon-selector-btn"
                    :class="{ active: newTipoRecurso.icono_svg === icon.id }"
                    @click="selectIcon(icon.id)"
                  >
                    <img :src="`https://api.iconify.design/${icon.id}.svg`" style="width:22px;height:22px" />
                    <span>{{ icon.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div style="margin-top:1rem;display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap">
            <button
              class="create-btn"
              type="button"
              @click="createTipoRecurso"
              :disabled="!canSaveTipoRecurso || isSavingRecurso"
            >
              <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ isSavingRecurso ? 'Guardando...' : 'Guardar Tipo de Recurso' }}
            </button>
          </div>
        </article>

        <!-- Tipos Registrados -->
        <article class="panel">
          <div class="block-header">
            <h3>Tipos Registrados</h3>
            <span class="muted" style="font-size:0.82rem">{{ tiposRecursos.length }} tipo{{ tiposRecursos.length !== 1 ? 's' : '' }}</span>
          </div>

          <div v-if="!tiposRecursos.length && !isCuraduriaLoading" class="empty-state">
            No hay tipos de recursos aún. Crea el primero arriba.
          </div>

          <div v-else class="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Ícono</th>
                  <th>Nombre / Slug</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tipo in tiposRecursos" :key="tipo.id_tipo_recurso">
                  <td style="width:56px">
                    <div class="tipo-icon-cell">
                      <img
                        v-if="tipo.icono_svg"
                        :src="`https://api.iconify.design/${tipo.icono_svg}.svg?color=%23f97316`"
                        style="width:22px;height:22px"
                      />
                      <svg v-else viewBox="0 0 24 24" style="width:22px;height:22px;color:var(--text-muted)">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </td>
                  <td>
                    <strong>{{ tipo.nombre_recurso }}</strong>
                    <code class="muted" style="display:block;margin-top:0.15rem">{{ tipo.slug }}</code>
                  </td>
                  <td class="muted">{{ tipo.descripcion || '—' }}</td>
                  <td>
                    <button class="icon-btn danger" type="button" @click="deleteTipoRecurso(tipo.id_tipo_recurso)" title="Eliminar tipo">
                      <svg viewBox="0 0 24 24" class="mini-icon"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

      </section>
      <!-- ── MODERATION ─────────────────────────────────────────────────────── -->
      <section v-else class="panel placeholder-panel">
        <h2>Global Moderation</h2>
        <p>Este módulo se habilita después de integrar reportes reales.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  hasRole,
  hasValidSession,
  setActiveMode,
} from '../utils/authSession'

const router = useRouter()
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

// ── UI state ──────────────────────────────────────────────────────────────────
const activeTab = ref('users')
const search = ref('')

// ── Users ─────────────────────────────────────────────────────────────────────
const users = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const busyUserId = ref(null)
const editingUserId = ref(null)

// ── System classification ─────────────────────────────────────────────────────
const classificationError = ref('')
const isClassificationLoading = ref(false)
const classification = ref({ areas: [], tags: [], stacks: [], pensums: [], courses: [] })
const newArea = ref({ nombre: '', descripcion: '', pensumId: null })
const newCarrera = ref({ nombre: '', color: '#22c55e' })
const newPensum = ref({ nombre: '', descripcion: '', carreraId: null })
const newCourse = ref({ codigo: '', nombre: '', semestre: 1, pensumId: null, areaId: null })
const newStack = ref('')
const newTag = ref('')

// ── Forum config ──────────────────────────────────────────────────────────────
const categoriasForo = ref([])
const tiposForo = ref([])
const isForumLoading = ref(false)
const forumError = ref('')
const newCategoria = ref('')
const newTipo = ref('')

// ── Computed ──────────────────────────────────────────────────────────────────
const canAccessStudentMode = computed(() => hasRole('comun'))

const avatarInitials = computed(() => {
  const user = getAuthUser()
  const name = user?.nombre || 'AD'
  return name.split(' ').map(c => c[0]).slice(0, 2).join('').toUpperCase()
})

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return users.value
  return users.value.filter(user => {
    return (user.nombre || '').toLowerCase().includes(query) ||
      (user.correo || '').toLowerCase().includes(query) ||
      (user.carnet || '').toLowerCase().includes(query)
  })
})
const tiposRecursos = ref([])
const isCuraduriaLoading = ref(false)
const curaduriaError = ref('')
const isSavingRecurso = ref(false)
const newTipoRecurso = ref({
  nombre_recurso: '',
  slug: '',
  descripcion: '',
  icono_svg: ''
})
const canSaveTipoRecurso = computed(() => {
  return Boolean(newTipoRecurso.value.nombre_recurso?.trim()) && Boolean(newTipoRecurso.value.icono_svg)
})
const slugify = (value) => {
  return (value ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}
watch(
  () => newTipoRecurso.value.nombre_recurso,
  (name) => {
    newTipoRecurso.value.slug = slugify(name)
  }
)
const loadCuradoria = async () => {
  isCuraduriaLoading.value = true
  curaduriaError.value = ''
  try {
    // Ajusta la ruta según tu API
    const data = await callAdminApi('/recursos/tipos', { method: 'GET' })
    tiposRecursos.value = (data?.tipos ?? []).map((t) => ({
      id_tipo_recurso: t.id_tipo_recurso ?? t.id,
      nombre_recurso: t.nombre_recurso ?? t.nombre,
      slug: t.slug,
      descripcion: t.descripcion,
      icono_svg: t.icono_svg,
    }))
  } catch (e) {
    curaduriaError.value = e?.message ?? 'Error cargando tipos de recursos'
  } finally {
    isCuraduriaLoading.value = false
  }
}

// 3. Función para crear
const createTipoRecurso = async () => {
  if (!canSaveTipoRecurso.value) {
    curaduriaError.value = 'Completa el nombre y selecciona un ícono antes de guardar.'
    return
  }
  isSavingRecurso.value = true
  curaduriaError.value = ''
  try {
    await callAdminApi('/recursos/tipos', {
      method: 'POST',
      body: JSON.stringify({
        nombre: newTipoRecurso.value.nombre_recurso,
        slug: newTipoRecurso.value.slug,
        descripcion: newTipoRecurso.value.descripcion,
        icono_svg: newTipoRecurso.value.icono_svg,
      })
    })
    newTipoRecurso.value = { nombre_recurso: '', slug: '', descripcion: '', icono_svg: '' }
    await loadCuradoria()
  } catch (e) {
    curaduriaError.value = e?.message ?? 'Error al crear tipo de recurso'
  } finally {
    isSavingRecurso.value = false
  }
}

// 4. Función para eliminar
const deleteTipoRecurso = async (id) => {
  if(!confirm("¿Eliminar este tipo?")) return
  await callAdminApi(`/recursos/tipos/${id}`, { method: 'DELETE' })
  await loadCuradoria()
}

// 5. Watcher para cargar los datos al entrar al tab
watch(activeTab, (tab) => {
  if (tab === 'forum') loadForumConfig()
  if (tab === 'curadoria') loadCuradoria() // <--- Añadir esto
})
// ── HTTP helper ───────────────────────────────────────────────────────────────
const handleUnauthorized = async () => {
  clearAuthSession()
  if (router.currentRoute.value.name !== 'login') await router.push('/login')
}

const callAdminApi = async (path, options = {}) => {
  const token = getAuthToken()
  if (!token || !hasValidSession()) {
    await handleUnauthorized()
    throw new Error('Sesión expirada')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    if (response.status === 401) { await handleUnauthorized(); throw new Error('Sesión expirada') }
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message ?? 'Operación no permitida')
  }

  return response.json().catch(() => null)
}

// ── Users ─────────────────────────────────────────────────────────────────────
const loadUsers = async () => {
  if (!hasValidSession()) { await handleUnauthorized(); return }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await callAdminApi('/users/admin/management', { method: 'GET' })
    users.value = Array.isArray(data?.users) ? data.users : []
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Error inesperado'
  } finally {
    isLoading.value = false
  }
}

const toggleAdmin = async (user) => {
  const token = getAuthToken()
  if (!token) return
  busyUserId.value = user.id
  errorMessage.value = ''
  try {
    const response = await fetch(`${API_BASE}/users/admin/${user.id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: 'admin', enabled: !user.roles.includes('admin') }),
    })
    if (!response.ok) { const d = await response.json().catch(() => null); throw new Error(d?.message ?? 'Error') }
    const updated = await response.json().catch(() => null)
    users.value = users.value.map(r => r.id === updated?.id ? updated : r)
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Error inesperado'
  } finally {
    busyUserId.value = null
  }
}

const toggleBlocked = async (user) => {
  const token = getAuthToken()
  if (!token) return
  busyUserId.value = user.id
  errorMessage.value = ''
  try {
    const response = await fetch(`${API_BASE}/users/admin/${user.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ bloqueado: !user.bloqueado }),
    })
    if (!response.ok) { const d = await response.json().catch(() => null); throw new Error(d?.message ?? 'Error') }
    const updated = await response.json().catch(() => null)
    users.value = users.value.map(r => r.id === updated?.id ? updated : r)
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Error inesperado'
  } finally {
    busyUserId.value = null
  }
}

const toggleRango = async (user, rangoNombre) => {
  const token = getAuthToken()
  if (!token) return
  busyUserId.value = user.id
  errorMessage.value = ''
  try {
    const enabled = !(user.rangos ?? []).includes(rangoNombre)
    const response = await fetch(`${API_BASE}/users/admin/${user.id}/rango`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rango: rangoNombre, enabled }),
    })
    if (!response.ok) {
      const d = await response.json().catch(() => null)
      throw new Error(d?.message ?? 'No se pudo actualizar el rango')
    }
    const updated = await response.json().catch(() => null)
    users.value = users.value.map(r => r.id === updated?.id ? updated : r)
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Error inesperado'
  } finally {
    busyUserId.value = null
  }
}

const openCreateUser = () => router.push('/login')
const goProfile = () => router.push('/profile')
const switchToStudentMode = async () => {
  const changed = setActiveMode('student')
  if (!changed) { await handleUnauthorized(); return }
  await router.push('/dashboard')
}

// ── System classification ─────────────────────────────────────────────────────
const loadSystemClassification = async () => {
  classificationError.value = ''
  isClassificationLoading.value = true
  try {
    const payload = await callAdminApi('/users/admin/classification', { method: 'GET' })
    classification.value = payload?.classification || { areas: [], tags: [], stacks: [], pensums: [], courses: [], carreras: [] }
  } catch (e) {
    classificationError.value = e instanceof Error ? e.message : 'Error'
  } finally {
    isClassificationLoading.value = false
  }
}

const createArea = async () => {
  if (!newArea.value.nombre.trim() || !newArea.value.pensumId) return
  await callAdminApi('/users/admin/classification/areas', {
    method: 'POST',
    body: JSON.stringify({
      nombre: newArea.value.nombre,
      descripcion: newArea.value.descripcion,
      pensumId: newArea.value.pensumId,
    }),
  })
  newArea.value = { nombre: '', descripcion: '', pensumId: null }
  await loadSystemClassification()
}
const deleteArea = async (id) => {
  await callAdminApi(`/users/admin/classification/areas/${id}`, { method: 'DELETE' })
  await loadSystemClassification()
}
const createPensum = async () => {
  if (!newPensum.value.nombre.trim() || !newPensum.value.carreraId) return
  await callAdminApi('/users/admin/classification/pensums', {
    method: 'POST',
    body: JSON.stringify({
      nombre: newPensum.value.nombre,
      descripcion: newPensum.value.descripcion,
      carreraId: newPensum.value.carreraId,
    }),
  })
  newPensum.value = { nombre: '', descripcion: '', carreraId: null }
  await loadSystemClassification()
}
const createCarrera = async () => {
  if (!newCarrera.value.nombre.trim()) return
  await callAdminApi('/users/admin/classification/carreras', {
    method: 'POST',
    body: JSON.stringify({
      nombre: newCarrera.value.nombre,
      color: newCarrera.value.color,
    }),
  })
  newCarrera.value = { nombre: '', color: '#22c55e' }
  await loadSystemClassification()
}


const deleteCarrera = async (id) => {
  await callAdminApi(`/users/admin/classification/carreras/${id}`, { method: 'DELETE' })
  await loadSystemClassification()
}
const togglePensum = async (id) => {
  await callAdminApi(`/users/admin/classification/pensums/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({}) })
  await loadSystemClassification()
}
const deletePensum = async (id) => {
  await callAdminApi(`/users/admin/classification/pensums/${id}`, { method: 'DELETE' })
  await loadSystemClassification()
}
const createStack = async () => {
  if (!newStack.value.trim()) return
  await callAdminApi('/users/admin/classification/stacks', { method: 'POST', body: JSON.stringify({ nombre: newStack.value }) })
  newStack.value = ''
  await loadSystemClassification()
}
const deleteStack = async (id) => {
  await callAdminApi(`/users/admin/classification/stacks/${id}`, { method: 'DELETE' })
  await loadSystemClassification()
}
const createTag = async () => {
  if (!newTag.value.trim()) return
  await callAdminApi('/users/admin/classification/tags', { method: 'POST', body: JSON.stringify({ nombre: newTag.value }) })
  newTag.value = ''
  await loadSystemClassification()
}
const deleteTag = async (id) => {
  await callAdminApi(`/users/admin/classification/tags/${id}`, { method: 'DELETE' })
  await loadSystemClassification()
}
const createCourse = async () => {
  if (!newCourse.value.codigo.trim() || !newCourse.value.nombre.trim() || !newCourse.value.pensumId) return
  await callAdminApi('/users/admin/classification/courses', { method: 'POST', body: JSON.stringify(newCourse.value) })
  newCourse.value = { codigo: '', nombre: '', semestre: 1, pensumId: null, areaId: null }
  await loadSystemClassification()
}
const deleteCourse = async (id) => {
  await callAdminApi(`/users/admin/classification/courses/${id}`, { method: 'DELETE' })
  await loadSystemClassification()
}

// ── Forum config ──────────────────────────────────────────────────────────────
const loadForumConfig = async () => {
  isForumLoading.value = true
  forumError.value = ''
  try {
    const [catsRes, tiposRes] = await Promise.all([
      callAdminApi('/sysreddit/categorias', { method: 'GET' }),
      callAdminApi('/sysreddit/tipos', { method: 'GET' }),
    ])
    categoriasForo.value = (catsRes?.categorias ?? []).map(c => ({ id: c.id, nombre: c.nombre, count: c.count }))
    tiposForo.value = (tiposRes?.tipos ?? []).map(t => ({ id: t.id, nombre: t.nombre }))
  } catch (e) {
    forumError.value = e instanceof Error ? e.message : 'Error cargando configuración del foro'
  } finally {
    isForumLoading.value = false
  }
}

const createCategoria = async () => {
  if (!newCategoria.value.trim()) return
  try {
    await callAdminApi('/sysreddit/admin/categorias', {
      method: 'POST',
      body: JSON.stringify({ categoria: newCategoria.value }),
    })
    newCategoria.value = ''
    await loadForumConfig()
  } catch (e) {
    forumError.value = e instanceof Error ? e.message : 'Error'
  }
}

const deleteCategoria = async (id) => {
  try {
    await callAdminApi(`/sysreddit/admin/categorias/${id}`, { method: 'DELETE' })
    await loadForumConfig()
  } catch (e) {
    forumError.value = e instanceof Error ? e.message : 'No se pudo eliminar'
  }
}

const createTipo = async () => {
  if (!newTipo.value.trim()) return
  try {
    await callAdminApi('/sysreddit/admin/tipos', {
      method: 'POST',
      body: JSON.stringify({ tipo: newTipo.value }),
    })
    newTipo.value = ''
    await loadForumConfig()
  } catch (e) {
    forumError.value = e instanceof Error ? e.message : 'Error'
  }
}

const deleteTipo = async (id) => {
  try {
    await callAdminApi(`/sysreddit/admin/tipos/${id}`, { method: 'DELETE' })
    await loadForumConfig()
  } catch (e) {
    forumError.value = e instanceof Error ? e.message : 'No se pudo eliminar'
  }
}

// Seed rápido de categorías predeterminadas
const CATEGORIAS_DEFAULT = ['Desarrollo Web', 'Bases de Datos', 'Redes', 'Algoritmos', 'Desarrollo Móvil', 'DevOps', 'General']
const TIPOS_DEFAULT = ['Pregunta', 'Discusión', 'Tutorial', 'Anuncio']

const seedCategorias = async () => {
  for (const cat of CATEGORIAS_DEFAULT) {
    try {
      await callAdminApi('/sysreddit/admin/categorias', {
        method: 'POST',
        body: JSON.stringify({ categoria: cat }),
      })
    } catch { /* ignorar duplicados */ }
  }
  await loadForumConfig()
}

const seedTipos = async () => {
  for (const tipo of TIPOS_DEFAULT) {
    try {
      await callAdminApi('/sysreddit/admin/tipos', {
        method: 'POST',
        body: JSON.stringify({ tipo }),
      })
    } catch { /* ignorar duplicados */ }
  }
  await loadForumConfig()
}

// Cargar foro cuando cambia al tab
watch(activeTab, (tab) => {
  if (tab === 'forum') loadForumConfig()
})

onMounted(async () => {
  await loadUsers()
  await loadSystemClassification()
})
const iconLibrary = {
  "Documentos y Archivos": [
    { id: "lucide:file-text", label: "Texto" },
    { id: "lucide:file-code", label: "Código" },
    { id: "lucide:book-open", label: "Libro/Guía" },
    { id: "lucide:clipboard-list", label: "Tarea" },
    { id: "lucide:archive", label: "Repositorio" },
    { id: "lucide:file-signature", label: "Examen/Prueba" },
    { id: "lucide:files", label: "Recursos Varios" }
  ],
  "Multimedia y Video": [
    { id: "lucide:video", label: "Clase Grabada" },
    { id: "lucide:play-circle", label: "Demo" },
    { id: "lucide:mic", label: "Podcast/Audio" },
    { id: "lucide:image", label: "Infografía" },
    { id: "lucide:monitor-play", label: "Streaming" },
    { id: "lucide:headphones", label: "Material Escucha" }
  ],
  "Programación y Tech": [
    { id: "lucide:terminal", label: "Consola" },
    { id: "lucide:cpu", label: "Sistemas" },
    { id: "lucide:database", label: "Base de Datos" },
    { id: "lucide:github", label: "GitHub" },
    { id: "lucide:layers", label: "Fullstack" },
    { id: "lucide:braces", label: "JSON/Data" },
    { id: "lucide:binary", label: "Lógica" },
    { id: "lucide:cloud", label: "Cloud Computing" }
  ],
  "Ciencias y Matemáticas": [
    { id: "lucide:calculator", label: "Cálculo" },
    { id: "lucide:microscope", label: "Laboratorio" },
    { id: "lucide:flask-conical", label: "Química" },
    { id: "lucide:atom", label: "Física" },
    { id: "lucide:function-square", label: "Algoritmos" },
    { id: "lucide:pi", label: "Matemáticas" }
  ],
  "Comunicación y Enlaces": [
    { id: "lucide:link", label: "Enlace Externo" },
    { id: "lucide:message-square", label: "Foro" },
    { id: "lucide:globe", label: "Sitio Web" },
    { id: "lucide:mail", label: "Contacto" },
    { id: "lucide:share-2", label: "Compartir" },
    { id: "lucide:slack", label: "Comunidad" }
  ],
  "Negocios y Gestión": [
    { id: "lucide:briefcase", label: "Proyecto" },
    { id: "lucide:trending-up", label: "Análisis" },
    { id: "lucide:presentation", label: "Exposición" },
    { id: "lucide:pie-chart", label: "Estadísticas" },
    { id: "lucide:calendar", label: "Cronograma" },
    { id: "lucide:users", label: "Trabajo en Equipo" }
  ],
  "Diseño y Creatividad": [
    { id: "lucide:palette", label: "Diseño" },
    { id: "lucide:pen-tool", label: "Ilustración" },
    { id: "lucide:framer", label: "Prototipado" },
    { id: "lucide:shapes", label: "Geometría/UX" },
    { id: "lucide:layout", label: "Wireframes" }
  ]
};

const iconSearch = ref('') // Lo que el usuario escribe
const iconResults = ref([]) // Resultados de la API
const isSearching = ref(false)
const searchIcons = async () => {
  if (iconSearch.value.length < 2) return;
  isSearching.value = true;

  try {
    // 1. Traducimos la búsqueda de ES a EN usando una API libre (MyMemory)
    const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${iconSearch.value}&langpair=es|en`);
    const transData = await transRes.json();
    const translatedQuery = transData.responseData.translatedText;

    // 2. Buscamos el icono con la palabra ya traducida
    const res = await fetch(`https://api.iconify.design/search?query=${translatedQuery}&prefixes=lucide&limit=30`);
    const data = await res.json();
    
    iconResults.value = data.icons || [];
  } catch (e) {
    // Si la traducción falla, intentamos con el texto original como plan B
    const res = await fetch(`https://api.iconify.design/search?query=${iconSearch.value}&prefixes=lucide&limit=30`);
    const data = await res.json();
    iconResults.value = data.icons || [];
  } finally {
    isSearching.value = false;
  }
};
// Al seleccionar uno, guardamos el nombre completo (prefijo:nombre)
const selectIcon = (iconName) => {
  newTipoRecurso.value.icono_svg = iconName
}
</script>

<style scoped>
.admin-page { min-height: 100vh; background: var(--bg-app); color: var(--text-primary); }

.admin-header {
  position: sticky; top: 0; z-index: 25;
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  padding: 1rem 1.4rem;
  border-bottom: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-surface) 92%, transparent);
  backdrop-filter: blur(7px);
}

.brand-block { display: flex; align-items: center; gap: 0.8rem; }
.brand-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #ef4444, #f97316); display: grid; place-items: center; color: #fff; }
.icon-svg { width: 20px; height: 20px; }
.brand-block h1 { margin: 0; font-size: 1.28rem; }
.brand-block p { margin: 0; color: var(--text-muted); font-size: 0.8rem; }
.admin-header-actions { display: flex; align-items: center; gap: 0.8rem; }

.mode-switch-btn { border: 1px solid var(--border-color); background: var(--bg-muted); color: var(--text-soft); border-radius: 999px; padding: 0.3rem 0.7rem; font-size: 0.78rem; cursor: pointer; }
.mode-switch-btn:hover { border-color: var(--accent-500); color: var(--accent-500); }

.admin-badge { border: 1px solid color-mix(in srgb, var(--error) 40%, transparent); background: color-mix(in srgb, var(--error) 20%, transparent); color: #fb7185; border-radius: 999px; padding: 0.25rem 0.7rem; font-size: 0.75rem; font-weight: 700; }

.avatar { border: none; width: 34px; height: 34px; border-radius: 50%; color: #fff; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #ef4444, #f97316); }

.admin-content { max-width: 1200px; margin: 0 auto; padding: 1.2rem; display: grid; gap: 1rem; }

.tab-row { display: flex; gap: 0.6rem; flex-wrap: wrap; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; }

.tab-btn { border: none; cursor: pointer; background: transparent; color: var(--text-muted); padding: 0.55rem 0.35rem; font-weight: 600; position: relative; display: inline-flex; align-items: center; gap: 0.35rem; }
.tab-btn.active { color: var(--text-primary); }
.tab-btn.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -0.41rem; height: 2px; background: linear-gradient(135deg, #ef4444, #f97316); }

.pending-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: color-mix(in srgb, #ef4444 20%, transparent); color: #fb7185; }

.panel { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 16px; padding: 1rem; }

.panel-title-row { display: flex; justify-content: space-between; gap: 1rem; align-items: center; flex-wrap: wrap; }
.panel-title-row h2 { margin: 0; }
.panel-title-row p { margin: 0.2rem 0 0; color: var(--text-muted); font-size: 0.9rem; }

.create-btn { border: none; border-radius: 10px; color: #fff; background: linear-gradient(135deg, #ef4444, #f97316); padding: 0.55rem 0.8rem; display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer; }
.create-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-icon { width: 16px; height: 16px; }

.search-box { margin-top: 0.8rem; position: relative; display: block; }
.search-box input { width: 100%; background: var(--bg-muted); border: 1px solid var(--border-color); color: inherit; border-radius: 12px; padding: 0.65rem 0.8rem 0.65rem 2.1rem; }
.search-icon { width: 16px; height: 16px; position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

.state { margin: 0.8rem 0 0; color: var(--text-muted); }
.state.error { color: var(--error); }

.table-shell { margin-top: 0.8rem; border: 1px solid var(--border-color); border-radius: 12px; overflow: auto; }
table { width: 100%; border-collapse: collapse; min-width: 780px; }
th, td { text-align: left; padding: 0.8rem; border-bottom: 1px solid var(--border-color); }
th { background: color-mix(in srgb, var(--bg-muted) 75%, transparent); font-size: 0.82rem; color: var(--text-soft); }
.muted { color: var(--text-muted); font-size: 0.82rem; }

.roles-wrap { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.role-chip { border-radius: 999px; font-size: 0.72rem; padding: 0.18rem 0.55rem; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 0.25rem; }
.role-chip.student { border-color: color-mix(in srgb, #3b82f6 35%, transparent); background: color-mix(in srgb, #3b82f6 16%, transparent); color: #60a5fa; }
.role-chip.admin { border-color: color-mix(in srgb, #ec4899 35%, transparent); background: color-mix(in srgb, #ec4899 16%, transparent); color: #f472b6; }
.role-chip.forum-chip { border-color: color-mix(in srgb, var(--accent-500) 35%, transparent); background: color-mix(in srgb, var(--accent-500) 12%, transparent); color: var(--accent-500); font-size: 0.8rem; padding: 0.3rem 0.7rem; }
.role-chip.tipo-chip { border-color: color-mix(in srgb, #f59e0b 35%, transparent); background: color-mix(in srgb, #f59e0b 12%, transparent); color: #fbbf24; font-size: 0.8rem; padding: 0.3rem 0.7rem; }

.chip-count { font-size: 0.7rem; opacity: 0.7; }

.status-pill { border-radius: 999px; font-size: 0.72rem; padding: 0.18rem 0.55rem; border: 1px solid transparent; }
.status-pill.active { border-color: color-mix(in srgb, #22c55e 35%, transparent); background: color-mix(in srgb, #22c55e 16%, transparent); color: #4ade80; }
.status-pill.blocked { border-color: color-mix(in srgb, #ef4444 35%, transparent); background: color-mix(in srgb, #ef4444 16%, transparent); color: #f87171; }

.actions-wrap { display: flex; gap: 0.35rem; }
.icon-btn { border: 1px solid var(--border-color); border-radius: 8px; width: 32px; height: 32px; display: grid; place-items: center; background: var(--bg-muted); color: var(--text-soft); cursor: pointer; }
.icon-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.icon-btn.danger { color: #f87171; }
.mini-icon { width: 14px; height: 14px; }

.empty-state { margin: 0; padding: 1rem; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 10px; text-align: center; font-size: 0.88rem; }

.placeholder-panel h2 { margin-top: 0; }
.placeholder-panel p { color: var(--text-soft); }

.system-layout { display: grid; gap: 0.9rem; }

.block-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 0.7rem; }
.block-header h3 { margin: 0; }

.inline-form { display: inline-flex; gap: 0.45rem; flex-wrap: wrap; }
.inline-form input, .inline-form select { border: 1px solid var(--border-color); background: var(--bg-muted); border-radius: 8px; color: inherit; padding: 0.45rem 0.6rem; }
.inline-form.large input, .inline-form.large select { min-width: 120px; }

.color-field {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
}

.color-field input[type='color'] {
  width: 32px;
  height: 28px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.color-code {
  min-width: 96px;
}

.chip-list-wrap { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.chip-list-wrap.compact { max-height: 170px; overflow: auto; padding-right: 0.2rem; }
.chip-remove { border: none; background: transparent; color: inherit; cursor: pointer; margin-left: 0.35rem; font-size: 0.78rem; opacity: 0.7; }
.chip-remove:hover { opacity: 1; }

.double-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }

/* ── Curaduría: Nuevo Tipo de Recurso ─────────────────────────────────────── */
.curaduria-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 0.6rem;
}

.form-field { display: flex; flex-direction: column; gap: 0.45rem; }
.form-field--full { grid-column: 1 / -1; }

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-soft);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.field-required { color: #fb7185; font-weight: 700; }

.field-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-muted);
  color: inherit;
  padding: 0.7rem 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input:focus {
  outline: none;
  border-color: var(--accent-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-500) 18%, transparent);
}

.field-badge {
  font-size: 0.65rem;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent-500) 18%, transparent);
  color: var(--accent-500);
  font-weight: 700;
  text-transform: uppercase;
}

.field-slug-preview {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 0.8rem;
  border-radius: 12px;
  border: 1px dashed var(--border-color);
  background: color-mix(in srgb, var(--bg-muted) 85%, transparent);
  font-size: 0.78rem;
  color: var(--text-muted);
}

.icon-picker-section {
  margin-top: 1.2rem;
  display: grid;
  gap: 0.9rem;
}

.icon-picker-header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.icon-search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.5rem 0.7rem;
  background: var(--bg-muted);
}

.icon-search-box input {
  flex: 1;
  border: none;
  background: transparent;
  color: inherit;
}

.icon-search-box input:focus { outline: none; }

.icon-search-run {
  border: none;
  border-radius: 10px;
  padding: 0.35rem 0.7rem;
  background: color-mix(in srgb, var(--accent-500) 20%, transparent);
  color: var(--accent-500);
  font-weight: 600;
  cursor: pointer;
}

.icon-search-run:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Rango toggles ─────────────────────────────────────────────────────────── */
tr.row-editing { background: color-mix(in srgb, var(--accent-500) 4%, transparent); }

.rango-toggles { display: grid; gap: 0.5rem; }

.rango-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.rango-toggle input { display: none; }

.toggle-track {
  width: 34px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--bg-muted);
  position: relative;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.toggle-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: transform 0.2s, background 0.2s;
}

.rango-toggle.active .toggle-track {
  background: color-mix(in srgb, var(--accent-500) 20%, transparent);
  border-color: var(--accent-500);
}

.rango-toggle.active .toggle-track::after {
  transform: translateX(16px);
  background: var(--accent-500);
}

.toggle-label { font-size: 0.78rem; font-weight: 600; color: var(--text-soft); }
.toggle-label.aux { color: #facc15; }
.toggle-label.mod { color: #a78bfa; }
.toggle-label.admin-lbl { color: #f472b6; }

/* New role chips */
.role-chip.aux { border-color: rgba(250,204,21,0.35); background: rgba(250,204,21,0.12); color: #facc15; }
.role-chip.mod { border-color: rgba(167,139,250,0.35); background: rgba(167,139,250,0.12); color: #a78bfa; }

.icon-btn.success { color: #4ade80; }
.icon-btn.success:hover { background: color-mix(in srgb, #22c55e 12%, transparent); }

.quick-seed { margin-top: 0.5rem; }

/* ── Sysreddit admin section ───────────────────────────────────────────────── */
.sysreddit-header { display: flex; align-items: center; gap: 0.9rem; }

.sysreddit-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.sysreddit-logo-icon { width: 22px; height: 22px; color: var(--accent-contrast, #fff); }

.section-badge-row { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }

.scope-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.scope-shared {
  background: color-mix(in srgb, var(--accent-500) 10%, transparent);
  border-color: color-mix(in srgb, var(--accent-500) 25%, transparent);
  color: var(--accent-500);
}

.scope-forum {
  background: color-mix(in srgb, #f59e0b 10%, transparent);
  border-color: color-mix(in srgb, #f59e0b 25%, transparent);
  color: #f59e0b;
}

.scope-static {
  background: color-mix(in srgb, #6b7280 10%, transparent);
  border-color: color-mix(in srgb, #6b7280 25%, transparent);
  color: #9ca3af;
}

.static-types-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.static-type-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
  background: var(--bg-muted);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  flex: 1;
  min-width: 160px;
}

.static-type-icon { width: 20px; height: 20px; color: var(--text-muted); flex-shrink: 0; }

.static-type-chip strong { font-size: 0.875rem; display: block; }
.static-type-chip p { font-size: 0.75rem; color: var(--text-muted); margin: 0.1rem 0 0; }


.icon-catalog-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--bg-muted);
  padding: 1.2rem;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  max-height: 400px;
  overflow-y: auto;
}

.catalog-section h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.8rem;
  letter-spacing: 0.05rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.6rem;
}

.icon-selector-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.8rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-selector-btn:hover {
  border-color: var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 5%, var(--bg-surface));
}

.icon-selector-btn.active {
  border-color: var(--accent-500);
  background: color-mix(in srgb, var(--accent-500) 10%, var(--bg-surface));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-500) 20%, transparent);
}


.icon-selector-btn span {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-soft);
}
.carrera-name {
  display: flex;
  align-items: center;
  gap: 10px;
}


.pensum-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-bar {
  width: 6px;
  height: 20px;
  border-radius: 4px;
}

.area-name {
  display: flex;
  align-items: center;
  gap: 10px;
}


</style>