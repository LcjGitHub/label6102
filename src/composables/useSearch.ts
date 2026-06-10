import { ref, computed } from 'vue'
import { samplePoints } from '@/data/samples'
import type { SamplePoint } from '@/types/sample'

export interface SearchMatch {
  field: 'name' | 'address' | 'description' | 'tags'
  matched: string
}

export interface SearchResult {
  point: SamplePoint
  matches: SearchMatch[]
}

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_SEARCH_HISTORY = 10

const searchQuery = ref('')
const isSearchOpen = ref(false)
const searchHistory = ref<string[]>([])

function loadSearchHistory() {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (
        Array.isArray(parsed) &&
        parsed.every((item: unknown) => typeof item === 'string')
      ) {
        searchHistory.value = parsed
      } else {
        searchHistory.value = []
        saveSearchHistory()
      }
    }
  } catch (e) {
    console.error('Failed to load search history:', e)
    searchHistory.value = []
  }
}

function saveSearchHistory() {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch (e) {
    console.error('Failed to save search history:', e)
  }
}

export function useSearch() {
  const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

  if (searchHistory.value.length === 0) {
    loadSearchHistory()
  }

  function addToSearchHistory(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return

    const existingIndex = searchHistory.value.indexOf(trimmed)
    if (existingIndex !== -1) {
      searchHistory.value.splice(existingIndex, 1)
    }

    searchHistory.value.unshift(trimmed)

    if (searchHistory.value.length > MAX_SEARCH_HISTORY) {
      searchHistory.value = searchHistory.value.slice(0, MAX_SEARCH_HISTORY)
    }

    saveSearchHistory()
  }

  function removeFromSearchHistory(query: string) {
    const index = searchHistory.value.indexOf(query)
    if (index !== -1) {
      searchHistory.value.splice(index, 1)
      saveSearchHistory()
    }
  }

  function clearSearchHistory() {
    searchHistory.value = []
    saveSearchHistory()
  }

  const results = computed<SearchResult[]>(() => {
    const query = normalizedQuery.value
    if (!query) return []

    return samplePoints.value
      .map((point) => {
        const matches: SearchMatch[] = []

        const nameLower = point.name.toLowerCase()
        if (nameLower.includes(query)) {
          matches.push({ field: 'name', matched: point.name })
        }

        const addressLower = point.address.toLowerCase()
        if (addressLower.includes(query)) {
          matches.push({ field: 'address', matched: point.address })
        }

        const descLower = point.description.toLowerCase()
        if (descLower.includes(query)) {
          matches.push({ field: 'description', matched: point.description })
        }

        const matchedTags = point.tags.filter((tag) =>
          tag.toLowerCase().includes(query),
        )
        if (matchedTags.length) {
          matchedTags.forEach((tag) => {
            matches.push({ field: 'tags', matched: tag })
          })
        }

        return { point, matches }
      })
      .filter((r) => r.matches.length > 0)
      .sort((a, b) => {
        const aName = a.matches.some((m) => m.field === 'name') ? 1 : 0
        const bName = b.matches.some((m) => m.field === 'name') ? 1 : 0
        if (aName !== bName) return bName - aName
        return b.matches.length - a.matches.length
      })
  })

  function openSearch() {
    isSearchOpen.value = true
  }

  function closeSearch() {
    isSearchOpen.value = false
  }

  function toggleSearch() {
    isSearchOpen.value = !isSearchOpen.value
  }

  function setQuery(q: string) {
    searchQuery.value = q
  }

  function clearQuery() {
    searchQuery.value = ''
  }

  function highlightText(text: string, query: string): Array<{ text: string; highlight: boolean }> {
    if (!query) return [{ text, highlight: false }]

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const segments: Array<{ text: string; highlight: boolean }> = []

    let lastIndex = 0
    let index = lowerText.indexOf(lowerQuery)

    while (index !== -1) {
      if (index > lastIndex) {
        segments.push({ text: text.slice(lastIndex, index), highlight: false })
      }
      segments.push({ text: text.slice(index, index + query.length), highlight: true })
      lastIndex = index + query.length
      index = lowerText.indexOf(lowerQuery, lastIndex)
    }

    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), highlight: false })
    }

    return segments.length ? segments : [{ text, highlight: false }]
  }

  return {
    searchQuery,
    normalizedQuery,
    isSearchOpen,
    searchHistory,
    results,
    openSearch,
    closeSearch,
    toggleSearch,
    setQuery,
    clearQuery,
    highlightText,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
  }
}
