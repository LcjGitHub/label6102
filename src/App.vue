<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'

const { favorites } = useFavorites()
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink to="/" class="brand">
        <span class="brand-icon">🎙</span>
        <span class="brand-text">城市声音采样</span>
      </RouterLink>
      <p class="brand-sub">探索城市声景 · Mock 数据演示</p>
      <nav class="app-nav">
        <RouterLink to="/favorites" class="nav-link">
          <svg class="nav-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>收藏夹</span>
          <span v-if="favorites.length" class="nav-link__badge">
            {{ favorites.length }}
          </span>
        </RouterLink>
      </nav>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-header {
  position: relative;
}

.app-nav {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  font-size: 0.9rem;
  transition: all 0.15s;
}

.nav-link:hover {
  background: var(--color-border);
  border-color: var(--color-accent);
}

.nav-link__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-link__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--color-accent);
  color: #0a1218;
  font-size: 0.72rem;
  font-weight: 700;
}
</style>
