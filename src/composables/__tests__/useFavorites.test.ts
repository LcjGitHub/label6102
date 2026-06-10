import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'

const STORAGE_KEY = 'city-sound-favorites'

describe('useFavorites', () => {
  let useFavorites: typeof import('../useFavorites').useFavorites

  beforeEach(async () => {
    localStorage.clear()
    vi.resetModules()
    const mod = await import('../useFavorites')
    useFavorites = mod.useFavorites
  })

  async function flush() {
    await nextTick()
    await nextTick()
  }


  describe('initial state', () => {
    it('should start with empty favorites', () => {
      const { favorites } = useFavorites()
      expect(favorites.value).toEqual([])
    })

    it('should load favorites from localStorage on init', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['id-1', 'id-2']))
      vi.resetModules()
      return import('../useFavorites').then((mod) => {
        const { favorites } = mod.useFavorites()
        expect(favorites.value).toEqual(['id-1', 'id-2'])
      })
    })

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json')
      vi.resetModules()
      return import('../useFavorites').then((mod) => {
        const { favorites } = mod.useFavorites()
        expect(favorites.value).toEqual([])
      })
    })

    it('should handle non-array value in localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
      vi.resetModules()
      return import('../useFavorites').then((mod) => {
        const { favorites } = mod.useFavorites()
        expect(favorites.value).toEqual([])
      })
    })

    it('should filter out non-string values from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['valid', 123, null, 'also-valid', undefined]))
      vi.resetModules()
      return import('../useFavorites').then((mod) => {
        const { favorites } = mod.useFavorites()
        expect(favorites.value).toEqual(['valid', 'also-valid'])
      })
    })
  })

  describe('isFavorite', () => {
    it('should return false for non-existent id', () => {
      const { isFavorite } = useFavorites()
      expect(isFavorite('nonexistent')).toBe(false)
    })

    it('should return true for existing id', () => {
      const { addFavorite, isFavorite } = useFavorites()
      addFavorite('test-id')
      expect(isFavorite('test-id')).toBe(true)
    })
  })

  describe('addFavorite', () => {
    it('should add a new favorite', () => {
      const { favorites, addFavorite } = useFavorites()
      addFavorite('id-1')
      expect(favorites.value).toEqual(['id-1'])
    })

    it('should not add duplicate favorites', () => {
      const { favorites, addFavorite } = useFavorites()
      addFavorite('id-1')
      addFavorite('id-1')
      expect(favorites.value).toEqual(['id-1'])
    })

    it('should add multiple different favorites', () => {
      const { favorites, addFavorite } = useFavorites()
      addFavorite('id-1')
      addFavorite('id-2')
      addFavorite('id-3')
      expect(favorites.value).toEqual(['id-1', 'id-2', 'id-3'])
    })

    it('should persist to localStorage after adding', async () => {
      const { addFavorite } = useFavorites()
      addFavorite('persist-id')
      await flush()
      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toBe(JSON.stringify(['persist-id']))
    })

    it('should handle empty string id', () => {
      const { favorites, addFavorite, isFavorite } = useFavorites()
      addFavorite('')
      expect(favorites.value).toEqual([''])
      expect(isFavorite('')).toBe(true)
    })
  })

  describe('removeFavorite', () => {
    it('should remove an existing favorite', () => {
      const { favorites, addFavorite, removeFavorite } = useFavorites()
      addFavorite('id-1')
      addFavorite('id-2')
      removeFavorite('id-1')
      expect(favorites.value).toEqual(['id-2'])
    })

    it('should do nothing when removing non-existent favorite', () => {
      const { favorites, removeFavorite } = useFavorites()
      removeFavorite('nonexistent')
      expect(favorites.value).toEqual([])
    })

    it('should persist to localStorage after removing', async () => {
      const { addFavorite, removeFavorite } = useFavorites()
      addFavorite('id-1')
      await flush()
      removeFavorite('id-1')
      await flush()
      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toBe(JSON.stringify([]))
    })

    it('should remove the last favorite', () => {
      const { favorites, addFavorite, removeFavorite } = useFavorites()
      addFavorite('only-one')
      removeFavorite('only-one')
      expect(favorites.value).toEqual([])
    })
  })

  describe('toggleFavorite', () => {
    it('should add when toggling a non-favorite', () => {
      const { favorites, toggleFavorite } = useFavorites()
      toggleFavorite('new-id')
      expect(favorites.value).toEqual(['new-id'])
    })

    it('should remove when toggling an existing favorite', () => {
      const { favorites, addFavorite, toggleFavorite } = useFavorites()
      addFavorite('toggle-id')
      toggleFavorite('toggle-id')
      expect(favorites.value).toEqual([])
    })

    it('should toggle multiple times correctly', () => {
      const { favorites, toggleFavorite } = useFavorites()
      toggleFavorite('test-id')
      expect(favorites.value).toEqual(['test-id'])
      toggleFavorite('test-id')
      expect(favorites.value).toEqual([])
      toggleFavorite('test-id')
      expect(favorites.value).toEqual(['test-id'])
    })
  })

  describe('favorites reactivity', () => {
    it('should have reactive favorites array', () => {
      const { favorites, addFavorite } = useFavorites()
      expect(favorites.value.length).toBe(0)
      addFavorite('reactive-id')
      expect(favorites.value.length).toBe(1)
    })
  })
})
