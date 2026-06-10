<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink to="/" class="brand">
        <span class="brand-icon">🎙</span>
        <span class="brand-text">城市声音采样</span>
      </RouterLink>
      <p class="brand-sub">探索城市声景 · Mock 数据演示</p>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
