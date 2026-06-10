<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import SampleMap from '@/components/SampleMap.vue'
import TagFilter from '@/components/TagFilter.vue'
import { useFavorites } from '@/composables/useFavorites'
import { samplePoints, getAllTags } from '@/data/samples'
import { CATEGORY_LABELS } from '@/types/sample'
import type { SamplePoint } from '@/types/sample'

const router = useRouter()
const { favorites } = useFavorites()
const allTags = getAllTags()
const selectedTags = ref<string[]>([])

const filteredPoints = computed(() => {
  if (!selectedTags.value.length) return samplePoints
  return samplePoints.filter((p) =>
    selectedTags.value.every((tag) => p.tags.includes(tag)),
  )
})

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function clearTags() {
  selectedTags.value = []
}

function goDetail(id: string) {
  router.push({ name: 'detail', params: { id } })
}

function categoryLabel(point: SamplePoint) {
  return CATEGORY_LABELS[point.category]
}
</script>

<template>
  <div class="home">
    <aside class="home__sidebar card">
      <TagFilter
        :tags="allTags"
        :selected="selectedTags"
        @toggle="toggleTag"
        @clear="clearTags"
      />

      <div class="home__stats">
        <span>共 {{ filteredPoints.length }} / {{ samplePoints.length }} 个采样点</span>
      </div>

      <div class="home__fav-link">
        <RouterLink to="/favorites" class="btn home__fav-btn">
          <svg class="home__fav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>我的收藏</span>
          <span v-if="favorites.length" class="home__fav-count">{{ favorites.length }}</span>
        </RouterLink>
      </div>

      <ul class="home__list">
        <li
          v-for="point in filteredPoints"
          :key="point.id"
          class="home__item"
          @click="goDetail(point.id)"
        >
          <div class="home__item-head">
            <strong>{{ point.name }}</strong>
            <span class="home__category">{{ categoryLabel(point) }}</span>
          </div>
          <p class="home__address">{{ point.address }}</p>
          <div class="home__tags">
            <span v-for="tag in point.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </li>
        <li v-if="!filteredPoints.length" class="home__empty">
          没有匹配的标签组合，请调整筛选条件
        </li>
      </ul>
    </aside>

    <section class="home__map card">
      <SampleMap :points="filteredPoints" @select="goDetail" />
    </section>
  </div>
</template>

<style scoped>
.home {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 16px;
  padding: 16px;
  flex: 1;
  min-height: 0;
}

.home__sidebar {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: calc(100vh - 80px);
}

.home__stats {
  padding: 0 16px 10px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.home__fav-link {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.home__fav-btn {
  width: 100%;
  justify-content: center;
}

.home__fav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.home__fav-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--color-accent);
  color: #0a1218;
  font-size: 0.72rem;
  font-weight: 700;
}

.home__list {
  list-style: none;
  margin: 0;
  padding: 8px;
  overflow-y: auto;
  flex: 1;
}

.home__item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.home__item:hover {
  background: var(--color-surface-2);
}

.home__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.home__category {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  white-space: nowrap;
}

.home__address {
  margin: 4px 0 8px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.home__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.home__empty {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.home__map {
  min-height: calc(100vh - 80px);
  overflow: hidden;
}

@media (max-width: 900px) {
  .home {
    grid-template-columns: 1fr;
    grid-template-rows: auto 420px;
  }

  .home__sidebar {
    max-height: 360px;
  }

  .home__map {
    min-height: 420px;
  }
}
</style>
