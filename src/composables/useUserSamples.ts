import { ref, watch } from 'vue'
import type { SamplePoint } from '@/types/sample'

const STORAGE_KEY = 'city-sound-user-samples'

const userSamples = ref<SamplePoint[]>([])

function loadUserSamples() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        userSamples.value = parsed.filter(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.name === 'string',
        )
        return
      }
    }
  } catch {
  }
  userSamples.value = []
}

function saveUserSamples() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userSamples.value))
  } catch {
  }
}

loadUserSamples()

watch(userSamples, saveUserSamples, { deep: true })

export function useUserSamples() {
  function isUserSample(id: string): boolean {
    return userSamples.value.some((s) => s.id === id)
  }

  function addUserSample(sample: SamplePoint): void {
    userSamples.value.unshift(sample)
  }

  function getUserSampleById(id: string): SamplePoint | undefined {
    return userSamples.value.find((s) => s.id === id)
  }

  function generateId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  return {
    userSamples,
    isUserSample,
    addUserSample,
    getUserSampleById,
    generateId,
  }
}
