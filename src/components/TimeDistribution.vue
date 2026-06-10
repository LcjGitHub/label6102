<script setup lang="ts">
import { computed } from 'vue'
import type { TimeSlot } from '@/types/sample'

const props = defineProps<{
  slots: TimeSlot[]
}>()

const maxCount = computed(() => Math.max(...props.slots.map((s) => s.count), 1))
</script>

<template>
  <div class="time-dist">
    <h3 class="time-dist__title">时段分布</h3>
    <p class="time-dist__hint">各时段采样次数（Mock 统计）</p>
    <ul class="time-dist__list">
      <li v-for="slot in slots" :key="slot.period" class="time-dist__row">
        <span class="time-dist__period">{{ slot.period }}</span>
        <div class="time-dist__bar-wrap">
          <div class="time-dist__bar" :style="{ width: `${(slot.count / maxCount) * 100}%` }" />
        </div>
        <span class="time-dist__count">{{ slot.count }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.time-dist__title {
  margin: 0 0 4px;
  font-size: 1rem;
}

.time-dist__hint {
  margin: 0 0 16px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.time-dist__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-dist__row {
  display: grid;
  grid-template-columns: 110px 1fr 36px;
  align-items: center;
  gap: 10px;
}

.time-dist__period {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.time-dist__bar-wrap {
  height: 10px;
  background: var(--color-surface-2);
  border-radius: 999px;
  overflow: hidden;
}

.time-dist__bar {
  height: 100%;
  background: linear-gradient(90deg, #2a6fd4, var(--color-tag));
  border-radius: 999px;
  min-width: 2px;
  transition: width 0.4s ease;
}

.time-dist__count {
  text-align: right;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
}
</style>
