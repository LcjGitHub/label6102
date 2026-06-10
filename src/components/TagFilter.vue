<script setup lang="ts">
const props = defineProps<{
  tags: string[]
  selected: string[]
}>()

const emit = defineEmits<{
  toggle: [tag: string]
  clear: []
}>()

function isActive(tag: string) {
  return props.selected.includes(tag)
}
</script>

<template>
  <div class="tag-filter">
    <div class="tag-filter__header">
      <span class="tag-filter__label">按标签筛选</span>
      <button
        v-if="selected.length"
        type="button"
        class="tag-filter__clear"
        @click="emit('clear')"
      >
        清除
      </button>
    </div>
    <div class="tag-filter__tags">
      <button
        v-for="tag in tags"
        :key="tag"
        type="button"
        class="tag tag-filter__btn"
        :class="{ 'tag--active': isActive(tag) }"
        @click="emit('toggle', tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tag-filter {
  padding: 14px 16px;
}

.tag-filter__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tag-filter__label {
  font-size: 0.85rem;
  font-weight: 600;
}

.tag-filter__clear {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 0.8rem;
  padding: 0;
}

.tag-filter__clear:hover {
  text-decoration: underline;
}

.tag-filter__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-filter__btn {
  border: 1px solid rgba(91, 141, 239, 0.35);
  cursor: pointer;
  transition: all 0.15s;
}
</style>
