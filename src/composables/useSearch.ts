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

const searchQuery = ref('')
const isSearchOpen = ref(false)

export function useSearch() {
  const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

  const results = computed<SearchResult[]>(() => {
    const query = normalizedQuery.value
    if (!query) return []

    return samplePoints
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
    results,
    openSearch,
    closeSearch,
    toggleSearch,
    setQuery,
    clearQuery,
    highlightText,
  }
}
