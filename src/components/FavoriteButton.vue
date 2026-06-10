<script setup lang="ts">
import { computed } from 'vue'
import { useFavorites } from '@/composables/useFavorites'

const props = defineProps<{
  sampleId: string
}>()

const { isFavorite, toggleFavorite } = useFavorites()

const favorited = computed(() => isFavorite(props.sampleId))

function handleClick() {
  toggleFavorite(props.sampleId)
}
</script>

<template>
  <button
    type="button"
    class="fav-btn"
    :class="{ 'fav-btn--active': favorited }"
    :title="favorited ? '取消收藏' : '收藏'"
    @click="handleClick"
  >
    <svg
      v-if="favorited"
      class="fav-btn__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
    <svg
      v-else
      class="fav-btn__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
    <span class="fav-btn__text">{{ favorited ? '已收藏' : '收藏' }}</span>
  </button>
</template>

<style scoped>
.fav-btn {
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

.fav-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.fav-btn--active {
  color: #ff4d6d;
  border-color: rgba(255, 77, 109, 0.5);
  background: rgba(255, 77, 109, 0.12);
}

.fav-btn--active:hover {
  background: rgba(255, 77, 109, 0.22);
}

.fav-btn__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.fav-btn__text {
  font-size: 0.85rem;
}
</style>
