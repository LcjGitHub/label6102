<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import WaveformPlaceholder from '@/components/WaveformPlaceholder.vue'
import TimeDistribution from '@/components/TimeDistribution.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import ShareModal from '@/components/ShareModal.vue'
import { getSampleById } from '@/data/samples'
import { CATEGORY_LABELS } from '@/types/sample'
import { useUserSamples } from '@/composables/useUserSamples'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const { isUserSample } = useUserSamples()

const sample = computed(() => getSampleById(props.id))

const shareModalVisible = ref(false)

function openShareModal() {
  shareModalVisible.value = true
}

function closeShareModal() {
  shareModalVisible.value = false
}
</script>

<template>
  <div v-if="sample" class="detail">
    <button type="button" class="detail__back btn" @click="router.push('/')">
      ← 返回地图
    </button>

    <header class="detail__header card">
      <div class="detail__header-main">
        <div>
          <span class="detail__category">{{ CATEGORY_LABELS[sample.category] }}</span>
          <div class="detail__title-row">
            <h1 class="detail__title">{{ sample.name }}</h1>
            <span v-if="isUserSample(sample.id)" class="detail__new-badge">新</span>
            <div class="detail__actions">
              <FavoriteButton :sample-id="sample.id" />
              <button
                type="button"
                class="share-btn"
                title="分享"
                @click="openShareModal"
              >
                <svg
                  class="share-btn__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span class="share-btn__text">分享</span>
              </button>
            </div>
          </div>
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

  <ShareModal
    v-if="sample"
    :visible="shareModalVisible"
    :sample="sample"
    @close="closeShareModal"
  />
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
  padding: 20px 24px;
  margin-bottom: 16px;
}

.detail__header-main {
  display: flex;
  justify-content: space-between;
  gap: 24px;
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

.detail__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.detail__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.share-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.share-btn__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.share-btn__text {
  font-size: 0.85rem;
}

.detail__title {
  margin: 0;
  font-size: 1.6rem;
}

.detail__new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: 5px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  animation: detailBadgePulse 2s ease-in-out infinite;
}

@keyframes detailBadgePulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(255, 107, 107, 0);
  }
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
  .detail__header-main {
    flex-direction: column;
  }

  .detail__title-row {
    flex-wrap: wrap;
  }

  .detail__grid {
    grid-template-columns: 1fr;
  }
}
</style>
