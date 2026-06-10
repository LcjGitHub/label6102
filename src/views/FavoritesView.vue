<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import { samplePoints } from '@/data/samples'
import FavoriteList from '@/components/FavoriteList.vue'
import type { SamplePoint } from '@/types/sample'

const router = useRouter()
const { favorites } = useFavorites()

const favoriteSamples = computed<SamplePoint[]>(() => {
  return favorites.value
    .map((id) => samplePoints.find((p) => p.id === id))
    .filter((p): p is SamplePoint => p !== undefined)
})
</script>

<template>
  <div class="favorites">
    <header class="favorites__header">
      <button type="button" class="btn" @click="router.push('/')">
        ← 返回地图
      </button>
      <h2 class="favorites__title">
        <svg class="favorites__title-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        我的收藏
        <span class="favorites__count">（{{ favoriteSamples.length }}）</span>
      </h2>
    </header>

    <FavoriteList :samples="favoriteSamples" />
  </div>
</template>

<style scoped>
.favorites {
  padding: 20px 24px 32px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.favorites__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.favorites__title {
  margin: 0;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.favorites__title-icon {
  width: 24px;
  height: 24px;
  color: #ff4d6d;
}

.favorites__count {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: 1rem;
}
</style>
