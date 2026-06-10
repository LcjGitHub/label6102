<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch } from '@/composables/useSearch'
import { CATEGORY_LABELS } from '@/types/sample'

const router = useRouter()
const { searchQuery, isSearchOpen, results, closeSearch, clearQuery, highlightText } = useSearch()

const query = computed(() => searchQuery.value.trim())

function goDetail(id: string) {
  closeSearch()
  clearQuery()
  router.push({ name: 'detail', params: { id } })
}

function onClose() {
  closeSearch()
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    onClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isSearchOpen" class="search-overlay" @click="onOverlayClick">
        <div class="search-results" role="dialog" aria-modal="true" aria-label="搜索结果">
          <header class="search-results__header">
            <span class="search-results__title">搜索结果</span>
            <span v-if="query" class="search-results__count">
              找到 {{ results.length }} 个匹配「{{ query }}」的结果
            </span>
            <button type="button" class="search-results__close" @click="onClose" aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div v-if="!query" class="search-results__hint">
            <svg class="search-results__hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>输入关键词开始搜索</p>
            <p class="search-results__hint-sub">支持搜索采样点的名称、地址、描述和标签</p>
          </div>

          <ul v-else-if="results.length" class="search-results__list">
            <li
              v-for="result in results"
              :key="result.point.id"
              class="search-result"
              @click="goDetail(result.point.id)"
            >
              <div class="search-result__main">
                <div class="search-result__head">
                  <h3 class="search-result__name">
                    <template v-for="(seg, idx) in highlightText(result.point.name, query)" :key="idx">
                      <mark v-if="seg.highlight" class="hl">{{ seg.text }}</mark>
                      <span v-else>{{ seg.text }}</span>
                    </template>
                  </h3>
                  <span class="search-result__category">{{ CATEGORY_LABELS[result.point.category] }}</span>
                </div>
                <p class="search-result__address">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <template v-for="(seg, idx) in highlightText(result.point.address, query)" :key="idx">
                    <mark v-if="seg.highlight" class="hl">{{ seg.text }}</mark>
                    <span v-else>{{ seg.text }}</span>
                  </template>
                </p>
                <p v-if="result.matches.some(m => m.field === 'description')" class="search-result__desc">
                  <template v-for="(seg, idx) in highlightText(result.point.description, query)" :key="idx">
                    <mark v-if="seg.highlight" class="hl">{{ seg.text }}</mark>
                    <span v-else>{{ seg.text }}</span>
                  </template>
                </p>
                <div class="search-result__tags">
                  <span v-for="tag in result.point.tags" :key="tag" class="tag" :class="{ 'tag--matched': tag.toLowerCase().includes(query.toLowerCase()) }">
                    <template v-for="(seg, idx) in highlightText(tag, query)" :key="idx">
                      <mark v-if="seg.highlight" class="hl">{{ seg.text }}</mark>
                      <span v-else>{{ seg.text }}</span>
                    </template>
                  </span>
                </div>
              </div>
              <svg class="search-result__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </li>
          </ul>

          <div v-else class="search-results__empty">
            <svg class="search-results__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p>未找到与「{{ query }}」相关的采样点</p>
            <ul class="search-results__tips">
              <li>尝试使用更简单或不同的关键词</li>
              <li>检查是否有错别字</li>
              <li>可以尝试搜索标签，如「人声」「自然」「交通」等</li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 16px 16px;
  backdrop-filter: blur(4px);
}

.search-results {
  width: 100%;
  max-width: 640px;
  max-height: calc(100vh - 100px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-results__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.search-results__title {
  font-weight: 600;
  font-size: 0.95rem;
}

.search-results__count {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.search-results__close {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.search-results__close:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.search-results__close svg {
  width: 18px;
  height: 18px;
}

.search-results__list {
  list-style: none;
  margin: 0;
  padding: 8px;
  overflow-y: auto;
  flex: 1;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.search-result:hover {
  background: var(--color-surface-2);
}

.search-result__main {
  flex: 1;
  min-width: 0;
}

.search-result__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.search-result__name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.search-result__category {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  white-space: nowrap;
  flex-shrink: 0;
}

.search-result__address {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 6px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.search-result__address svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.search-result__desc {
  margin: 0 0 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.search-result__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.search-result__arrow {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.15s, color 0.15s;
}

.search-result:hover .search-result__arrow {
  transform: translateX(2px);
  color: var(--color-accent);
}

.search-results__hint,
.search-results__empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-muted);
}

.search-results__hint-icon,
.search-results__empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.search-results__hint p,
.search-results__empty p {
  margin: 0;
  font-size: 0.95rem;
}

.search-results__hint-sub {
  margin-top: 6px !important;
  font-size: 0.82rem !important;
}

.search-results__tips {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  text-align: left;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.search-results__tips li {
  padding: 4px 0 4px 20px;
  position: relative;
  font-size: 0.82rem;
}

.search-results__tips li::before {
  content: '·';
  position: absolute;
  left: 8px;
  color: var(--color-accent);
  font-weight: 700;
}

:deep(.hl) {
  background: rgba(61, 214, 198, 0.25);
  color: var(--color-accent);
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 600;
}

.tag--matched {
  background: var(--color-accent-dim);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
