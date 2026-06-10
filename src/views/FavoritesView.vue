<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import { samplePoints } from '@/data/samples'
import { CATEGORY_LABELS } from '@/types/sample'
import type { SamplePoint } from '@/types/sample'

const router = useRouter()
const { favorites, removeFavorite } = useFavorites()

const favoriteSamples = computed<SamplePoint[]>(() => {
  return favorites.value
    .map((id) => samplePoints.find((p) => p.id === id))
    .filter((p): p is SamplePoint => p !== undefined)
})

function goDetail(id: string) {
  router.push({ name: 'detail', params: { id } })
}

function categoryLabel(point: SamplePoint) {
  return CATEGORY_LABELS[point.category]
}

function handleRemove(e: Event, id: string) {
  e.stopPropagation()
  removeFavorite(id)
}
</script>

<template>
  <div class="favorites">
    <header class="favorites__header">
      <button type="button" class="btn" @click="router.push('/')">
        ← 返回地图
      </button>
      <h2 class="favorites__title">
        <span class="favorites__title-icon">❤️</span>
        我的收藏
        <span class="favorites__count">（{{ favoriteSamples.length }}）</span>
      </h2>
    </header>

    <div v-if="favoriteSamples.length" class="favorites__grid">
      <div
        v-for="point in favoriteSamples"
        :key="point.id"
        class="favorites__card card"
        @click="goDetail(point.id)"
      >
        <div class="favorites__card-head">
          <strong class="favorites__card-title">{{ point.name }}</strong>
          <span class="favorites__category">{{ categoryLabel(point) }}</span>
        </div>
        <p class="favorites__address">{{ point.address }}</p>
        <p class="favorites__desc">{{ point.description }}</p>
        <div class="favorites__tags">
          <span v-for="tag in point.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="favorites__card-foot">
          <span class="favorites__meta">
            🎙 {{ point.durationSec }} 秒 · {{ point.recordedAt }}
          </span>
          <button
            type="button"
            class="favorites__remove-btn"
            title="取消收藏"
            @click="(e) => handleRemove(e, point.id)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            取消收藏
          </button>
        </div>
      </div>
    </div>

    <div v-else class="favorites__empty card">
      <div class="favorites__empty-icon">💔</div>
      <h3>还没有收藏任何采样点</h3>
      <p>在采样点详情页点击❤️按钮，即可将喜欢的采样点加入收藏</p>
      <button type="button" class="btn btn--primary" @click="router.push('/')">
        去探索采样点
      </button>
    </div>
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
  font-size: 1.3rem;
}

.favorites__count {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: 1rem;
}

.favorites__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.favorites__card {
  padding: 18px 20px;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.favorites__card:hover {
  transform: translateY(-2px);
  border-color: var(--color-accent);
}

.favorites__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.favorites__card-title {
  font-size: 1.05rem;
}

.favorites__category {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  white-space: nowrap;
  flex-shrink: 0;
}

.favorites__address {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.favorites__desc {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--color-text);
  opacity: 0.9;
}

.favorites__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.favorites__card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.favorites__meta {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.favorites__remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 77, 109, 0.4);
  background: rgba(255, 77, 109, 0.1);
  color: #ff4d6d;
  font-size: 0.78rem;
  transition: all 0.15s;
}

.favorites__remove-btn:hover {
  background: rgba(255, 77, 109, 0.2);
}

.favorites__remove-btn svg {
  width: 14px;
  height: 14px;
}

.favorites__empty {
  padding: 60px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.favorites__empty-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.favorites__empty h3 {
  margin: 0;
  font-size: 1.2rem;
}

.favorites__empty p {
  margin: 0;
  color: var(--color-text-muted);
  max-width: 400px;
}

.favorites__empty .btn {
  margin-top: 12px;
}
</style>
