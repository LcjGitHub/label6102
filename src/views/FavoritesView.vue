<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import { useExport } from '@/composables/useExport'
import { samplePoints } from '@/data/samples'
import FavoriteList from '@/components/FavoriteList.vue'
import type { SamplePoint } from '@/types/sample'
import type { ExportFormat } from '@/composables/useExport'

const router = useRouter()
const { favorites } = useFavorites()
const { isExporting, exportProgress, exportSamples } = useExport()

const exportFormat = ref<ExportFormat>('json')
const showExportMenu = ref(false)

const favoriteSamples = computed<SamplePoint[]>(() => {
  return favorites.value
    .map((id) => samplePoints.value.find((p) => p.id === id))
    .filter((p): p is SamplePoint => p !== undefined)
})

function toggleExportMenu() {
  showExportMenu.value = !showExportMenu.value
}

function handleExport(format: ExportFormat) {
  showExportMenu.value = false
  exportSamples(favoriteSamples.value, format)
}

function closeExportMenu() {
  showExportMenu.value = false
}
</script>

<template>
  <div class="favorites" @click="showExportMenu && closeExportMenu()">
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
      <div class="favorites__export" @click.stop>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="isExporting || favoriteSamples.length === 0"
          @click="toggleExportMenu"
        >
          <svg class="favorites__export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {{ isExporting ? '导出中...' : '导出' }}
        </button>
        <div v-if="showExportMenu && favoriteSamples.length > 0" class="favorites__export-menu">
          <button
            type="button"
            class="favorites__export-option"
            :class="{ 'is-active': exportFormat === 'json' }"
            @click="handleExport('json')"
          >
            <span class="favorites__export-format-icon">📄</span>
            <span class="favorites__export-format-name">JSON 格式</span>
            <span class="favorites__export-format-desc">完整数据，适合备份</span>
          </button>
          <button
            type="button"
            class="favorites__export-option"
            :class="{ 'is-active': exportFormat === 'csv' }"
            @click="handleExport('csv')"
          >
            <span class="favorites__export-format-icon">📊</span>
            <span class="favorites__export-format-name">CSV 格式</span>
            <span class="favorites__export-format-desc">表格数据，适合 Excel</span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="isExporting && exportProgress" class="favorites__progress card">
      <div class="favorites__progress-header">
        <span class="favorites__progress-title">正在导出 {{ exportProgress.format.toUpperCase() }} 文件...</span>
        <span class="favorites__progress-percent">
          {{ Math.round((exportProgress.current / exportProgress.total) * 100) }}%
        </span>
      </div>
      <div class="favorites__progress-bar">
        <div
          class="favorites__progress-fill"
          :style="{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }"
        ></div>
      </div>
      <div class="favorites__progress-detail">
        {{ exportProgress.current }} / {{ exportProgress.total }} 个采样点
      </div>
    </div>

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

.favorites__export {
  position: relative;
  margin-left: auto;
}

.favorites__export-icon {
  width: 18px;
  height: 18px;
}

.favorites__export-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  z-index: 100;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.favorites__export-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.favorites__export-option:hover {
  background: var(--color-bg-hover);
}

.favorites__export-option.is-active {
  background: var(--color-accent-dim);
}

.favorites__export-format-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.favorites__export-format-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.favorites__export-format-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.favorites__progress {
  padding: 16px 20px;
  margin-bottom: 20px;
}

.favorites__progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.favorites__progress-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.favorites__progress-percent {
  font-size: 0.9rem;
  color: var(--color-accent);
  font-weight: 600;
}

.favorites__progress-bar {
  height: 8px;
  background: var(--color-bg-hover);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.favorites__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #ff8e53);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.favorites__progress-detail {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: right;
}
</style>
