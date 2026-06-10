<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import WaveformPlaceholder from '@/components/WaveformPlaceholder.vue'
import TimeDistribution from '@/components/TimeDistribution.vue'
import { getSampleById } from '@/data/samples'
import { CATEGORY_LABELS } from '@/types/sample'

const props = defineProps<{
  id: string
}>()

const router = useRouter()

const sample = computed(() => getSampleById(props.id))
</script>

<template>
  <div v-if="sample" class="detail">
    <button type="button" class="detail__back btn" @click="router.push('/')">
      ← 返回地图
    </button>

    <header class="detail__header card">
      <div>
        <span class="detail__category">{{ CATEGORY_LABELS[sample.category] }}</span>
        <h1 class="detail__title">{{ sample.name }}</h1>
        <p class="detail__address">{{ sample.address }}</p>
        <p class="detail__desc">{{ sample.description }}</p>
      </div>
      <div class="detail__meta">
        <div class="detail__meta-item">
          <span class="detail__meta-label">录制时间</span>
          <span>{{ sample.recordedAt }}</span>
        </div>
        <div class="detail__meta-item">
          <span class="detail__meta-label">时长</span>
          <span>{{ sample.durationSec }} 秒</span>
        </div>
      </div>
    </header>

    <section class="detail__grid">
      <div class="detail__wave card">
        <WaveformPlaceholder
          :seed="sample.waveformSeed"
          :duration-sec="sample.durationSec"
        />
        <div class="detail__playback-mock">
          <button type="button" class="btn" disabled title="Mock 演示，无真实音频">
            ▶ 播放（Mock）
          </button>
          <span class="detail__mock-hint">无真实音频 API，仅展示波形占位</span>
        </div>
      </div>

      <div class="detail__side">
        <div class="card detail__tags-card">
          <h3>标签</h3>
          <div class="detail__tags">
            <span v-for="tag in sample.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="card detail__time-card">
          <TimeDistribution :slots="sample.timeDistribution" />
        </div>
      </div>
    </section>
  </div>

  <div v-else class="detail detail--empty">
    <p>未找到该采样点</p>
    <button type="button" class="btn btn--primary" @click="router.push('/')">
      返回首页
    </button>
  </div>
</template>

<style scoped>
.detail {
  padding: 20px 24px 32px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.detail--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 400px;
  color: var(--color-text-muted);
}

.detail__back {
  margin-bottom: 16px;
}

.detail__header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

.detail__category {
  display: inline-block;
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  margin-bottom: 8px;
}

.detail__title {
  margin: 0 0 6px;
  font-size: 1.6rem;
}

.detail__address {
  margin: 0 0 8px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.detail__desc {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.detail__meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 160px;
}

.detail__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: var(--color-surface-2);
  border-radius: 8px;
}

.detail__meta-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.detail__grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}

.detail__playback-mock {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 16px;
}

.detail__mock-hint {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.detail__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail__tags-card {
  padding: 16px 20px;
}

.detail__tags-card h3 {
  margin: 0 0 12px;
  font-size: 1rem;
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail__time-card {
  padding: 16px 20px;
}

@media (max-width: 800px) {
  .detail__header {
    flex-direction: column;
  }

  .detail__grid {
    grid-template-columns: 1fr;
  }
}
</style>
