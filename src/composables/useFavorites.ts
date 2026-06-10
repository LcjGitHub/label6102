import { ref, watch } from 'vue'

const STORAGE_KEY = 'city-sound-favorites'

const favorites = ref<string[]>([])

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        favorites.value = parsed.filter((id) => typeof id === 'string')
        return
      }
    }
  } catch {
  }
  favorites.value = []
}

function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
  } catch {
  }
}

loadFavorites()

watch(favorites, saveFavorites, { deep: true })

export function useFavorites() {
  function isFavorite(id: string) {
    return favorites.value.includes(id)
  }

  function toggleFavorite(id: string) {
    const idx = favorites.value.indexOf(id)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.push(id)
    }
  }

  function addFavorite(id: string) {
    if (!isFavorite(id)) {
      favorites.value.push(id)
    }
  }

  function removeFavorite(id: string) {
    const idx = favorites.value.indexOf(id)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    }
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  }
}
