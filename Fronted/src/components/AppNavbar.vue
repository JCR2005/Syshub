<template>
  <nav class="topbar">
    <div class="topbar-inner">
      <div class="brand" @click="emit('section-select', 'dashboard')">
        <div class="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="icon-svg" style="color: white;">
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M22 10v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
        <span class="brand-text">Syshub</span>
      </div>

      <div class="nav-links">
        <button class="nav-link" :class="{ active: activeSection === 'dashboard' }" @click="emit('section-select', 'dashboard')">
          Dashboard
        </button>
        <button class="nav-link" :class="{ active: activeSection === 'forum' }" @click="emit('section-select', 'forum')">
          Sysreditt
        </button>
        <button class="nav-link" :class="{ active: activeSection === 'upload' }" @click="emit('section-select', 'upload')">
          Crear Proyecto
        </button>
     
      </div>

      <div class="nav-actions">
        <div v-if="showSearch" class="search">
          <span class="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="icon-svg">
              <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2" />
              <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <input :value="searchValue" type="text" :placeholder="searchPlaceholder" @input="onSearchInput" />
        </div>

        <button class="icon-btn" aria-label="Notificaciones" @click="emit('notifications')">
          <svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 17a3 3 0 0 0 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="notify-dot" />
        </button>

        <button class="avatar" @click="emit('profile')" aria-label="Perfil" style="color: white;">
          <img v-if="avatarSrc" :src="avatarSrc" alt="Avatar" />
          <span v-else>{{ avatarInitials }}</span>
        </button>

        <button v-if="showLogout" class="logout-btn" @click="emit('logout')">Salir</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  activeSection: {
    type: String,
    default: 'dashboard',
  },
  avatarSrc: {
    type: String,
    default: '',
  },
  avatarInitials: {
    type: String,
    default: 'US',
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  searchValue: {
    type: String,
    default: '',
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  showLogout: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['section-select', 'logout', 'profile', 'notifications', 'update:searchValue'])

const onSearchInput = (event) => {
  emit('update:searchValue', event.target.value)
}
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-surface) 90%, transparent);
  backdrop-filter: blur(8px);
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.brand-text {
  font-size: 1.2rem;
  background: linear-gradient(130deg, var(--accent-500), var(--accent-400));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.nav-link {
  background: transparent;
  border: none;
  color: var(--text-soft);
  cursor: pointer;
  font-weight: 600;
  padding: 0.35rem 0.55rem;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search {
  position: relative;
}

.search input {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  color: inherit;
}

.search-icon {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  color: var(--text-muted);
}

.icon-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: inherit;
  padding: 0.5rem;
  cursor: pointer;
  position: relative;
}

.notify-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent-400);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-500), var(--accent-400));
  display: grid;
  place-items: center;
  font-weight: 700;
  border: none;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-soft);
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .nav-actions {
    width: 100%;
    justify-content: space-between;
  }

  .search {
    flex: 1;
  }

  .search input {
    width: 100%;
  }
}
</style>
