import { ref, computed } from 'vue'
import { samplePoints } from '@/data/samples'
import { CATEGORY_LABELS, type SampleCategory, type TimeSlot } from '@/types/sample'

export interface CategoryStats {
  category: SampleCategory
  label: string
  count: number
  percentage: number
}

export interface TagStats {
  tag: string
  count: number
  percentage: number
}

export interface DurationStats {
  avgSec: number
  maxSec: number
  minSec: number
  avgLabel: string
  maxLabel: string
  minLabel: string
}

export interface TimeDistributionStats {
  period: string
  count: number
}

export interface StatsData {
  totalCount: number
  categoryStats: CategoryStats[]
  tagStats: TagStats[]
  durationStats: DurationStats
  timeDistribution: TimeDistributionStats[]
  lastUpdated: Date
}

const refreshTrigger = ref(0)

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m > 0) {
    return `${m}分${s}秒`
  }
  return `${s}秒`
}

export function useStats() {
  const isRefreshing = ref(false)

  const totalCount = computed(() => {
    refreshTrigger.value
    return samplePoints.value.length
  })

  const categoryStats = computed<CategoryStats[]>(() => {
    refreshTrigger.value
    const counts: Record<SampleCategory, number> = {
      park: 0,
      metro: 0,
      market: 0,
      street: 0,
      cafe: 0,
      school: 0,
      plaza: 0,
    }
    samplePoints.value.forEach((p) => {
      counts[p.category]++
    })
    const total = samplePoints.value.length || 1
    return (Object.keys(counts) as SampleCategory[])
      .map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        count: counts[cat],
        percentage: Math.round((counts[cat] / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  })

  const tagStats = computed<TagStats[]>(() => {
    refreshTrigger.value
    const tagCounts: Record<string, number> = {}
    samplePoints.value.forEach((p) => {
      p.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1
      })
    })
    const total = samplePoints.value.length || 1
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  })

  const durationStats = computed<DurationStats>(() => {
    refreshTrigger.value
    const durations = samplePoints.value.map((p) => p.durationSec)
    if (!durations.length) {
      return {
        avgSec: 0,
        maxSec: 0,
        minSec: 0,
        avgLabel: '0秒',
        maxLabel: '0秒',
        minLabel: '0秒',
      }
    }
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    const max = Math.max(...durations)
    const min = Math.min(...durations)
    return {
      avgSec: avg,
      maxSec: max,
      minSec: min,
      avgLabel: formatDuration(avg),
      maxLabel: formatDuration(max),
      minLabel: formatDuration(min),
    }
  })

  const timeDistribution = computed<TimeDistributionStats[]>(() => {
    refreshTrigger.value
    const merged: Record<string, number> = {}
    samplePoints.value.forEach((p) => {
      p.timeDistribution.forEach((slot: TimeSlot) => {
        merged[slot.period] = (merged[slot.period] || 0) + slot.count
      })
    })
    return Object.entries(merged)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period))
  })

  const lastUpdated = computed(() => {
    refreshTrigger.value
    return new Date()
  })

  const stats = computed<StatsData>(() => ({
    totalCount: totalCount.value,
    categoryStats: categoryStats.value,
    tagStats: tagStats.value,
    durationStats: durationStats.value,
    timeDistribution: timeDistribution.value,
    lastUpdated: lastUpdated.value,
  }))

  async function refresh(): Promise<void> {
    isRefreshing.value = true
    await new Promise((resolve) => setTimeout(resolve, 400))
    refreshTrigger.value++
    isRefreshing.value = false
  }

  return {
    stats,
    totalCount,
    categoryStats,
    tagStats,
    durationStats,
    timeDistribution,
    lastUpdated,
    isRefreshing,
    refresh,
  }
}
