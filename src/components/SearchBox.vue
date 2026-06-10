<script setup lang="ts">
import { ref } from 'vue'
import { useSearch } from '@/composables/useSearch'

const { searchQuery, isSearchOpen, openSearch, setQuery, clearQuery, addToSearchHistory } = useSearch()

const inputRef = ref<HTMLInputElement | null>(null)

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  setQuery(target.value)
}

function onClear() {
  clearQuery()
  inputRef.value?.focus()
}

function onSubmit(e: Event) {
  e.preventDefault()
  const trimmed = searchQuery.value.trim()
  if (trimmed) {
    addToSearchHistory(trimmed)
  }
  openSearch()
}
</script>

<template>
  <form class="search-box" @submit="onSubmit" role="search">
    <div class="search-box__inner">
      <svg class="search-box__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        ref="inputRef"
        type="search"
        class="search-box__input"
        :value="searchQuery"
        placeholder="搜索名称、地址、描述、标签..."
        @input="onInput"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="search-box__clear"
        @click="onClear"
        aria-label="清除搜索"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <button
        type="submit"
        class="search-box__btn"
        :class="{ 'search-box__btn--open': isSearchOpen }"
        aria-label="搜索"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>搜索</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.search-box {
  flex: 1;
  max-width: 520px;
  margin: 0 auto;
}

.search-box__inner {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0 6px 0 12px;
  height: 40px;
  transition: border-color 0.15s, background 0.15s;
}

.search-box__inner:focus-within {
  border-color: var(--color-accent);
  background: var(--color-surface);
}

.search-box__icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-box__input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.92rem;
  padding: 0 10px;
  outline: none;
  height: 100%;
  min-width: 0;
}

.search-box__input::placeholder {
  color: var(--color-text-muted);
}

.search-box__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.search-box__clear:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.search-box__clear svg {
  width: 16px;
  height: 16px;
}

.search-box__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: var(--color-accent);
  color: #0a1218;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s;
  flex-shrink: 0;
}

.search-box__btn:hover {
  filter: brightness(1.08);
}

.search-box__btn svg {
  width: 15px;
  height: 15px;
}

@media (max-width: 480px) {
  .search-box__btn span {
    display: none;
  }

  .search-box__btn {
    padding: 0 10px;
  }
}
</style>
