<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  seed: number
  durationSec: number
}>()

const bars = computed(() => {
  const count = 120
  const result: number[] = []

  for (let i = 0; i < count; i++) {
    const wave = Math.sin(i * 0.18 + props.seed * 0.01) * 0.35
    const noise = Math.sin(i * 0.73 + props.seed) * Math.cos(i * 0.31 + props.seed * 0.02) * 0.25
    const jitter = Math.sin(i * 1.7 + props.seed * 0.05) * 0.06
    const value = Math.min(1, Math.max(0.08, 0.5 + wave + noise + jitter))
    result.push(value)
  }

  return result
})
</script>

<template>
  <div class="waveform">
    <div class="waveform__header">
      <span class="waveform__label">波形预览（Mock）</span>
      <span class="waveform__duration">{{ durationSec }}s</span>
    </div>
    <div class="waveform__canvas" role="img" aria-label="音频波形占位图">
      <div
        v-for="(h, i) in bars"
        :key="i"
        class="waveform__bar"
        :style="{ height: `${h * 100}%` }"
      />
    </div>
    <div class="waveform__timeline">
      <span>0:00</span>
      <span>
        {{ Math.floor(durationSec / 60) }}:{{ String(durationSec % 60).padStart(2, '0') }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.waveform {
  padding: 16px;
}

.waveform__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.85rem;
}

.waveform__label {
  color: var(--color-text-muted);
}

.waveform__duration {
  color: var(--color-accent);
  font-weight: 600;
}

.waveform__canvas {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 120px;
  padding: 12px;
  background: #0a1018;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.waveform__bar {
  flex: 1;
  min-width: 2px;
  background: linear-gradient(to top, #2a8f85, var(--color-accent));
  border-radius: 2px 2px 0 0;
  opacity: 0.85;
}

.waveform__timeline {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
