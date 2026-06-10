<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import { useUserSamples } from '@/composables/useUserSamples'
import { CATEGORY_LABELS } from '@/types/sample'
import type { SamplePoint } from '@/types/sample'

defineProps<{
  samples: SamplePoint[]
}>()

const router = useRouter()
const { removeFavorite } = useFavorites()
const { isUserSample } = useUserSamples()

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
  <div v-if="samples.length" class="fav-list__grid">
    <div
      v-for="point in samples"
      :key="point.id"
      class="fav-list__card card"
      @click="goDetail(point.id)"
    >
      <div class="fav-list__card-head">
        <div class="fav-list__card-title-wrap">
          <strong class="fav-list__card-title">{{ point.name }}</strong>
          <span v-if="isUserSample(point.id)" class="fav-list__new-badge">新</span>
        </div>
        <span class="fav-list__category">{{ categoryLabel(point) }}</span>
      </div>
      <p class="fav-list__address">{{ point.address }}</p>
      <p class="fav-list__desc">{{ point.description }}</p>
      <div class="fav-list__tags">
        <span v-for="tag in point.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="fav-list__card-foot">
        <span class="fav-list__meta">🎙 {{ point.durationSec }} 秒 · {{ point.recordedAt }}</span>
        <button
          type="button"
          class="fav-list__remove-btn"
          title="取消收藏"
          @click="(e) => handleRemove(e, point.id)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          取消收藏
        </button>
      </div>
    </div>
  </div>

  <div v-else class="fav-list__empty card">
    <svg
      class="fav-list__empty-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
    <h3>还没有收藏任何采样点</h3>
    <p>在详情页点击收藏按钮即可加入收藏</p>
    <button type="button" class="btn btn--primary" @click="router.push('/')">去探索采样点</button>
  </div>
</template>

<style scoped>
.fav-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.fav-list__card {
  padding: 18px 20px;
  cursor: pointer;
  transition:
    transform 0.15s,
    border-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fav-list__card:hover {
  transform: translateY(-2px);
  border-color: var(--color-accent);
}

.fav-list__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fav-list__card-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.fav-list__card-title {
  font-size: 1.05rem;
}

.fav-list__new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
  animation: favNewBadgePulse 2s ease-in-out infinite;
}

@keyframes favNewBadgePulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(255, 107, 107, 0);
  }
}

.fav-list__category {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  white-space: nowrap;
  flex-shrink: 0;
}

.fav-list__address {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.fav-list__desc {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--color-text);
  opacity: 0.9;
}

.fav-list__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.fav-list__card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.fav-list__meta {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.fav-list__remove-btn {
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

.fav-list__remove-btn:hover {
  background: rgba(255, 77, 109, 0.2);
}

.fav-list__remove-btn svg {
  width: 14px;
  height: 14px;
}

.fav-list__empty {
  padding: 60px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.fav-list__empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.fav-list__empty h3 {
  margin: 0;
  font-size: 1.2rem;
}

.fav-list__empty p {
  margin: 0;
  color: var(--color-text-muted);
  max-width: 400px;
}

.fav-list__empty .btn {
  margin-top: 12px;
}
</style>
