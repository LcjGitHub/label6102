<script setup lang="ts">
import { computed } from 'vue'
import { useStats } from '@/composables/useStats'

const {
  totalCount,
  categoryStats,
  tagStats,
  durationStats,
  timeDistribution,
  lastUpdated,
  isRefreshing,
  refresh,
} = useStats()

const maxTimeCount = computed(() => Math.max(...timeDistribution.value.map((t) => t.count), 1))

const maxTagCount = computed(() => Math.max(...tagStats.value.map((t) => t.count), 1))

const pieColors = ['#3dd6c6', '#5b8def', '#f5a623', '#ff6b6b', '#a855f7', '#22c55e', '#ec4899']

const pieData = computed(() => {
  const total = totalCount.value || 1
  let cumulativeAngle = 0
  return categoryStats.value.map((cat, i) => {
    const angle = (cat.count / total) * 360
    const startAngle = cumulativeAngle
    cumulativeAngle += angle
    const endAngle = cumulativeAngle
    return {
      ...cat,
      color: pieColors[i % pieColors.length],
      startAngle,
      endAngle,
    }
  })
})

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

function tagSize(count: number): string {
  const ratio = count / maxTagCount.value
  if (ratio >= 0.8) return '1.4rem'
  if (ratio >= 0.6) return '1.2rem'
  if (ratio >= 0.4) return '1rem'
  if (ratio >= 0.2) return '0.9rem'
  return '0.8rem'
}

function formatTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
</script>

<template>
  <div class="stats">
    <header class="stats__header card">
      <div class="stats__header-left">
        <h1 class="stats__title">
          <svg
            class="stats__title-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          数据统计
        </h1>
        <p class="stats__subtitle">实时统计采样点数据概览</p>
      </div>
      <div class="stats__header-right">
        <span class="stats__updated">更新于 {{ formatTime(lastUpdated) }}</span>
        <button
          type="button"
          class="btn stats__refresh-btn"
          :disabled="isRefreshing"
          @click="refresh"
        >
          <svg
            class="stats__refresh-icon"
            :class="{ 'stats__refresh-icon--spinning': isRefreshing }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>{{ isRefreshing ? '刷新中...' : '刷新数据' }}</span>
        </button>
      </div>
    </header>

    <section class="stats__cards">
      <div class="stats__card card">
        <div class="stats__card-icon stats__card-icon--total">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="stats__card-body">
          <span class="stats__card-label">总采样点</span>
          <span class="stats__card-value">{{ totalCount }}</span>
        </div>
      </div>

      <div class="stats__card card">
        <div class="stats__card-icon stats__card-icon--avg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stats__card-body">
          <span class="stats__card-label">平均时长</span>
          <span class="stats__card-value">{{ durationStats.avgLabel }}</span>
        </div>
      </div>

      <div class="stats__card card">
        <div class="stats__card-icon stats__card-icon--max">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        </div>
        <div class="stats__card-body">
          <span class="stats__card-label">最长时长</span>
          <span class="stats__card-value">{{ durationStats.maxLabel }}</span>
        </div>
      </div>

      <div class="stats__card card">
        <div class="stats__card-icon stats__card-icon--min">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
            <polyline points="17 18 23 18 23 12"></polyline>
          </svg>
        </div>
        <div class="stats__card-body">
          <span class="stats__card-label">最短时长</span>
          <span class="stats__card-value">{{ durationStats.minLabel }}</span>
        </div>
      </div>
    </section>

    <section class="stats__charts">
      <div class="stats__chart card">
        <h2 class="stats__chart-title">分类分布</h2>
        <div class="stats__chart-body stats__pie-wrap">
          <svg class="stats__pie" viewBox="0 0 200 200" aria-hidden="true">
            <path
              v-for="(slice, i) in pieData"
              :key="i"
              :d="describeArc(100, 100, 80, slice.startAngle, slice.endAngle)"
              :fill="slice.color"
              class="stats__pie-slice"
            />
            <circle cx="100" cy="100" r="44" :fill="'var(--color-surface)'" />
            <text x="100" y="92" text-anchor="middle" class="stats__pie-center-label">总计</text>
            <text x="100" y="115" text-anchor="middle" class="stats__pie-center-value">
              {{ totalCount }}
            </text>
          </svg>
          <ul class="stats__pie-legend">
            <li v-for="(slice, i) in pieData" :key="i" class="stats__legend-item">
              <span class="stats__legend-dot" :style="{ background: slice.color }"></span>
              <span class="stats__legend-label">{{ slice.label }}</span>
              <span class="stats__legend-count">{{ slice.count }}</span>
              <span class="stats__legend-pct">{{ slice.percentage }}%</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="stats__chart card">
        <h2 class="stats__chart-title">时段分布统计</h2>
        <div class="stats__chart-body">
          <div class="stats__time-bars">
            <div v-for="slot in timeDistribution" :key="slot.period" class="stats__time-col">
              <div class="stats__time-bar-wrap">
                <div
                  class="stats__time-bar"
                  :style="{ height: `${(slot.count / maxTimeCount) * 100}%` }"
                >
                  <span class="stats__time-bar-value">{{ slot.count }}</span>
                </div>
              </div>
              <span class="stats__time-label">{{ slot.period }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stats__chart card stats__chart--tags">
        <h2 class="stats__chart-title">热门标签</h2>
        <div class="stats__chart-body">
          <div class="stats__tag-cloud">
            <span
              v-for="tag in tagStats"
              :key="tag.tag"
              class="stats__tag-item"
              :style="{ fontSize: tagSize(tag.count) }"
              :title="`${tag.tag}: ${tag.count}次`"
            >
              {{ tag.tag }}
              <span class="stats__tag-count">{{ tag.count }}</span>
            </span>
          </div>
          <ol class="stats__tag-ranking">
            <li v-for="(tag, i) in tagStats.slice(0, 5)" :key="tag.tag" class="stats__ranking-item">
              <span class="stats__ranking-index" :class="`stats__ranking-index--${i + 1}`">
                {{ i + 1 }}
              </span>
              <span class="stats__ranking-tag">{{ tag.tag }}</span>
              <span class="stats__ranking-bar-wrap">
                <span
                  class="stats__ranking-bar"
                  :style="{ width: `${(tag.count / maxTagCount) * 100}%` }"
                ></span>
              </span>
              <span class="stats__ranking-count">{{ tag.count }}</span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stats {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.stats__header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stats__title {
  margin: 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats__title-icon {
  width: 22px;
  height: 22px;
  color: var(--color-accent);
}

.stats__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.stats__header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats__updated {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.stats__refresh-btn {
  gap: 6px;
}

.stats__refresh-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.stats__refresh-icon--spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.stats__cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stats__card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
}

.stats__card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats__card-icon svg {
  width: 24px;
  height: 24px;
}

.stats__card-icon--total {
  background: rgba(61, 214, 198, 0.15);
  color: var(--color-accent);
}

.stats__card-icon--avg {
  background: rgba(91, 141, 239, 0.15);
  color: var(--color-tag);
}

.stats__card-icon--max {
  background: rgba(245, 166, 35, 0.15);
  color: var(--color-warn);
}

.stats__card-icon--min {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.stats__card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stats__card-label {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.stats__card-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.stats__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stats__chart {
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  min-height: 0;
}

.stats__chart--tags {
  grid-column: 1 / -1;
}

.stats__chart-title {
  margin: 0 0 14px;
  font-size: 1.05rem;
  font-weight: 600;
}

.stats__chart-body {
  flex: 1;
  min-height: 0;
}

.stats__pie-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.stats__pie {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.stats__pie-slice {
  transition: opacity 0.2s;
}

.stats__pie-slice:hover {
  opacity: 0.85;
}

.stats__pie-center-label {
  fill: var(--color-text-muted);
  font-size: 12px;
}

.stats__pie-center-value {
  fill: var(--color-text);
  font-size: 22px;
  font-weight: 700;
}

.stats__pie-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 160px;
}

.stats__legend-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
}

.stats__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.stats__legend-label {
  color: var(--color-text);
}

.stats__legend-count {
  font-weight: 600;
  color: var(--color-accent);
}

.stats__legend-pct {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  min-width: 36px;
  text-align: right;
}

.stats__time-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  height: 220px;
  padding-top: 20px;
}

.stats__time-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  height: 100%;
  min-width: 0;
}

.stats__time-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.stats__time-bar {
  width: 70%;
  max-width: 44px;
  min-height: 4px;
  background: linear-gradient(180deg, var(--color-accent), var(--color-tag));
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: height 0.5s ease;
}

.stats__time-bar-value {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-accent);
  white-space: nowrap;
}

.stats__time-label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-align: center;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.stats__tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  padding: 8px 4px 16px;
  min-height: 80px;
}

.stats__tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-weight: 500;
  cursor: default;
  transition: all 0.15s;
}

.stats__tag-item:hover {
  background: var(--color-accent-dim);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.stats__tag-count {
  font-size: 0.72em;
  color: var(--color-text-muted);
  background: var(--color-bg);
  padding: 1px 6px;
  border-radius: 999px;
}

.stats__tag-item:hover .stats__tag-count {
  color: var(--color-accent);
  background: rgba(0, 0, 0, 0.2);
}

.stats__tag-ranking {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stats__ranking-item {
  display: grid;
  grid-template-columns: 28px 70px 1fr 36px;
  align-items: center;
  gap: 10px;
}

.stats__ranking-index {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  background: var(--color-surface-2);
  color: var(--color-text-muted);
}

.stats__ranking-index--1 {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #0a1218;
}

.stats__ranking-index--2 {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #0a1218;
}

.stats__ranking-index--3 {
  background: linear-gradient(135deg, #cd7f32, #a0622c);
  color: #0a1218;
}

.stats__ranking-tag {
  font-size: 0.88rem;
  color: var(--color-text);
}

.stats__ranking-bar-wrap {
  height: 16px;
  background: var(--color-surface-2);
  border-radius: 4px;
  overflow: hidden;
}

.stats__ranking-bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--color-tag), var(--color-accent));
  border-radius: 4px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.stats__ranking-count {
  text-align: right;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-accent);
}

@media (max-width: 1100px) {
  .stats__cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .stats__charts {
    grid-template-columns: 1fr;
  }

  .stats__pie-wrap {
    justify-content: center;
  }

  .stats__chart--tags {
    grid-column: auto;
  }
}

@media (max-width: 700px) {
  .stats__time-bars {
    gap: 6px;
  }

  .stats__time-col {
    gap: 8px;
  }

  .stats__time-label {
    font-size: 0.72rem;
  }
}

@media (max-width: 600px) {
  .stats {
    padding: 12px;
    gap: 12px;
  }

  .stats__header {
    padding: 14px 16px;
  }

  .stats__cards {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stats__card {
    padding: 14px;
    gap: 10px;
  }

  .stats__card-icon {
    width: 40px;
    height: 40px;
  }

  .stats__card-icon svg {
    width: 20px;
    height: 20px;
  }

  .stats__card-value {
    font-size: 1.25rem;
  }

  .stats__charts {
    gap: 12px;
  }

  .stats__chart {
    padding: 14px;
  }

  .stats__pie {
    width: 160px;
    height: 160px;
  }

  .stats__time-bars {
    height: 200px;
    gap: 4px;
  }

  .stats__time-col {
    gap: 6px;
  }

  .stats__time-label {
    font-size: 0.72rem;
    letter-spacing: -0.01em;
  }

  .stats__ranking-item {
    grid-template-columns: 24px 60px 1fr 30px;
    gap: 8px;
  }
}

@media (max-width: 440px) {
  .stats__time-bars {
    height: 180px;
    gap: 3px;
  }

  .stats__time-label {
    font-size: 0.65rem;
    letter-spacing: -0.02em;
    white-space: normal;
    line-height: 1.2;
  }

  .stats__time-bar {
    max-width: 32px;
  }
}
</style>
