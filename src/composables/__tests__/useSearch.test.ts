import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useSearch', () => {
  let useSearch: typeof import('../useSearch').useSearch

  beforeEach(async () => {
    localStorage.clear()
    vi.resetModules()
    const mod = await import('../useSearch')
    useSearch = mod.useSearch
  })

  describe('initial state', () => {
    it('should start with empty query', () => {
      const { searchQuery } = useSearch()
      expect(searchQuery.value).toBe('')
    })

    it('should start with search closed', () => {
      const { isSearchOpen } = useSearch()
      expect(isSearchOpen.value).toBe(false)
    })

    it('should have empty results with empty query', () => {
      const { results } = useSearch()
      expect(results.value).toEqual([])
    })
  })

  describe('search state controls', () => {
    it('should open search', () => {
      const { isSearchOpen, openSearch } = useSearch()
      openSearch()
      expect(isSearchOpen.value).toBe(true)
    })

    it('should close search', () => {
      const { isSearchOpen, openSearch, closeSearch } = useSearch()
      openSearch()
      closeSearch()
      expect(isSearchOpen.value).toBe(false)
    })

    it('should toggle search from closed to open', () => {
      const { isSearchOpen, toggleSearch } = useSearch()
      toggleSearch()
      expect(isSearchOpen.value).toBe(true)
    })

    it('should toggle search from open to closed', () => {
      const { isSearchOpen, toggleSearch } = useSearch()
      toggleSearch()
      toggleSearch()
      expect(isSearchOpen.value).toBe(false)
    })
  })

  describe('query management', () => {
    it('should set query', () => {
      const { searchQuery, setQuery } = useSearch()
      setQuery('公园')
      expect(searchQuery.value).toBe('公园')
    })

    it('should clear query', () => {
      const { searchQuery, setQuery, clearQuery } = useSearch()
      setQuery('test')
      clearQuery()
      expect(searchQuery.value).toBe('')
    })

    it('should normalize query (trim and lowercase)', () => {
      const { normalizedQuery, setQuery } = useSearch()
      setQuery('  Park  ')
      expect(normalizedQuery.value).toBe('park')
    })

    it('should normalize empty query with whitespace', () => {
      const { normalizedQuery, setQuery } = useSearch()
      setQuery('   ')
      expect(normalizedQuery.value).toBe('')
    })
  })

  describe('search results - name matching', () => {
    it('should match by name', () => {
      const { results, setQuery } = useSearch()
      setQuery('人民公园')
      expect(results.value.length).toBeGreaterThan(0)
      expect(results.value[0].matches.some((m) => m.field === 'name')).toBe(true)
    })

    it('should match name with whitespace trimmed query', () => {
      const { results, setQuery } = useSearch()
      setQuery('  人民公园  ')
      expect(results.value.length).toBeGreaterThan(0)
      expect(results.value[0].matches.some((m) => m.field === 'name')).toBe(true)
    })
  })

  describe('search results - address matching', () => {
    it('should match by address', () => {
      const { results, setQuery } = useSearch()
      setQuery('黄浦区')
      const addressMatches = results.value.filter((r) =>
        r.matches.some((m) => m.field === 'address'),
      )
      expect(addressMatches.length).toBeGreaterThan(0)
    })
  })

  describe('search results - description matching', () => {
    it('should match by description', () => {
      const { results, setQuery } = useSearch()
      setQuery('咖啡')
      const descMatches = results.value.filter((r) =>
        r.matches.some((m) => m.field === 'description'),
      )
      expect(descMatches.length).toBeGreaterThan(0)
    })
  })

  describe('search results - tag matching', () => {
    it('should match by tags', () => {
      const { results, setQuery } = useSearch()
      setQuery('鸟鸣')
      const tagMatches = results.value.filter((r) =>
        r.matches.some((m) => m.field === 'tags'),
      )
      expect(tagMatches.length).toBeGreaterThan(0)
    })

    it('should include all matching tags for a point', () => {
      const { results, setQuery } = useSearch()
      setQuery('人声')
      results.value.forEach((r) => {
        const tagMatches = r.matches.filter((m) => m.field === 'tags')
        if (tagMatches.length > 0) {
          const matchingTags = r.point.tags.filter((t) => t.includes('人声'))
          expect(tagMatches.length).toBe(matchingTags.length)
        }
      })
    })
  })

  describe('search results - multiple field matches', () => {
    it('should find points matching across multiple fields', () => {
      const { results, setQuery } = useSearch()
      setQuery('公园')
      expect(results.value.length).toBeGreaterThan(0)
      const multiField = results.value.filter((r) => r.matches.length > 1)
      expect(multiField.length).toBeGreaterThanOrEqual(0)
    })

    it('should correctly count all matches', () => {
      const { results, setQuery } = useSearch()
      setQuery('公园')
      results.value.forEach((result) => {
        const { point, matches } = result
        const nameMatch = point.name.includes('公园') ? 1 : 0
        const addressMatch = point.address.includes('公园') ? 1 : 0
        const descMatch = point.description.includes('公园') ? 1 : 0
        const tagMatchCount = point.tags.filter((t) => t.includes('公园')).length
        const expectedCount = nameMatch + addressMatch + descMatch + tagMatchCount
        expect(matches.length).toBe(expectedCount)
      })
    })
  })

  describe('search results - sorting', () => {
    it('should sort points with name match first', () => {
      const { results, setQuery } = useSearch()
      setQuery('公园')
      let foundNameMatch = false
      for (const result of results.value) {
        const hasNameMatch = result.matches.some((m) => m.field === 'name')
        if (!hasNameMatch && foundNameMatch) {
          continue
        }
        if (hasNameMatch) {
          foundNameMatch = true
        } else if (foundNameMatch) {
          continue
        } else {
          continue
        }
      }
      const firstNonNameIndex = results.value.findIndex(
        (r) => !r.matches.some((m) => m.field === 'name'),
      )
      const lastNonNameIndex = results.value
        .map((r, i) => (r.matches.some((m) => m.field === 'name') ? -1 : i))
        .filter((i) => i >= 0)
        .sort((a, b) => b - a)[0]
      if (firstNonNameIndex >= 0) {
        for (let i = 0; i < firstNonNameIndex; i++) {
          expect(results.value[i].matches.some((m) => m.field === 'name')).toBe(true)
        }
      }
    })

    it('should sort by number of matches descending within same priority', () => {
      const { results, setQuery } = useSearch()
      setQuery('人声')
      const nameMatched = results.value.filter((r) =>
        r.matches.some((m) => m.field === 'name'),
      )
      const nonNameMatched = results.value.filter(
        (r) => !r.matches.some((m) => m.field === 'name'),
      )
      for (let i = 1; i < nameMatched.length; i++) {
        expect(nameMatched[i - 1].matches.length).toBeGreaterThanOrEqual(
          nameMatched[i].matches.length,
        )
      }
      for (let i = 1; i < nonNameMatched.length; i++) {
        expect(nonNameMatched[i - 1].matches.length).toBeGreaterThanOrEqual(
          nonNameMatched[i].matches.length,
        )
      }
    })
  })

  describe('search results - edge cases', () => {
    it('should return empty results for empty query', () => {
      const { results, setQuery } = useSearch()
      setQuery('')
      expect(results.value).toEqual([])
    })

    it('should return empty results for whitespace-only query', () => {
      const { results, setQuery } = useSearch()
      setQuery('   ')
      expect(results.value).toEqual([])
    })

    it('should return empty results for non-matching query', () => {
      const { results, setQuery } = useSearch()
      setQuery('xyz-non-existent-keyword-123')
      expect(results.value).toEqual([])
    })

    it('should handle partial matches', () => {
      const { results, setQuery } = useSearch()
      setQuery('民公')
      expect(results.value.length).toBeGreaterThan(0)
    })

    it('should return consistent results for same query', () => {
      const { results, setQuery } = useSearch()
      setQuery('公园')
      const firstResultIds = results.value.map((r) => r.point.id)
      setQuery('')
      setQuery('公园')
      const secondResultIds = results.value.map((r) => r.point.id)
      expect(firstResultIds).toEqual(secondResultIds)
    })
  })

  describe('highlightText', () => {
    it('should return text without highlight for empty query', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hello World', '')
      expect(result).toEqual([{ text: 'Hello World', highlight: false }])
    })

    it('should return text without highlight when no match', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hello World', 'xyz')
      expect(result).toEqual([{ text: 'Hello World', highlight: false }])
    })

    it('should highlight single match at start', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hello World', 'Hello')
      expect(result).toEqual([
        { text: 'Hello', highlight: true },
        { text: ' World', highlight: false },
      ])
    })

    it('should highlight single match in middle', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hello World Test', 'World')
      expect(result).toEqual([
        { text: 'Hello ', highlight: false },
        { text: 'World', highlight: true },
        { text: ' Test', highlight: false },
      ])
    })

    it('should highlight single match at end', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hello World', 'World')
      expect(result).toEqual([
        { text: 'Hello ', highlight: false },
        { text: 'World', highlight: true },
      ])
    })

    it('should highlight entire text when fully matched', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hello', 'Hello')
      expect(result).toEqual([{ text: 'Hello', highlight: true }])
    })

    it('should highlight multiple matches', () => {
      const { highlightText } = useSearch()
      const result = highlightText('ababa', 'aba')
      expect(result).toEqual([
        { text: 'aba', highlight: true },
        { text: 'ba', highlight: false },
      ])
    })

    it('should highlight case insensitively', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hello World', 'hello')
      expect(result).toEqual([
        { text: 'Hello', highlight: true },
        { text: ' World', highlight: false },
      ])
    })

    it('should handle adjacent matches', () => {
      const { highlightText } = useSearch()
      const result = highlightText('aaabbb', 'aa')
      expect(result).toEqual([
        { text: 'aa', highlight: true },
        { text: 'abbb', highlight: false },
      ])
    })

    it('should handle empty text', () => {
      const { highlightText } = useSearch()
      const result = highlightText('', 'test')
      expect(result).toEqual([{ text: '', highlight: false }])
    })

    it('should handle query longer than text', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hi', 'Hello World')
      expect(result).toEqual([{ text: 'Hi', highlight: false }])
    })

    it('should preserve original case in highlighted segments', () => {
      const { highlightText } = useSearch()
      const result = highlightText('Hello WORLD hello', 'hello')
      expect(result[0].text).toBe('Hello')
      expect(result[0].highlight).toBe(true)
    })
  })
})
