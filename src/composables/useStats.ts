import { ref, computed, watch } from 'vue'
import { samplePoints } from '@/data/samples'
import { CATEGORY_LABELS, type SampleCategory } from '@/types/sample'

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

const TIME_PERIODS = [
  { label: '06:00-09:00', start: 6, end: 9 },
  { label: '09:00-12:00', start: 9, end: 12 },
  { label: '12:00-15:00', start: 12, end: 15 },
  { label: '15:00-18:00', start: 15, end: 18 },
  { label: '18:00-21:00', start: 18, end: 21 },
  { label: '21:00-24:00', start: 21, end: 24 },
] as const

const refreshNonce = ref(0)
const lastUpdated = ref(new Date())

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m > 0) {
    return `${m}分${s}秒`
  }
  return `${s}秒`
}

function getPeriodFromRecordedAt(recordedAt: string): string {
  const match = recordedAt.match(/ (\d{1,2}):(\d{2})/)
  if (!match) return TIME_PERIODS[0].label
  const hour = parseInt(match[1], 10)
  const period = TIME_PERIODS.find((p) => hour >= p.start && hour < p.end)
  return period ? period.label : TIME_PERIODS[0].label
}

watch(
  samplePoints,
  () => {
    lastUpdated.value = new Date()
    refreshNonce.value++
  },
  { deep: true },
)

export function useStats() {
  const isRefreshing = ref(false)

  const totalCount = computed(() => {
    refreshNonce.value
    return samplePoints.value.length
  })

  const categoryStats = computed<CategoryStats[]>(() => {
    refreshNonce.value
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
    refreshNonce.value
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
    refreshNonce.value
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
    refreshNonce.value
    const counts: Record<string, number> = {}
    TIME_PERIODS.forEach((p) => {
      counts[p.label] = 0
    })
    samplePoints.value.forEach((p) => {
      const period = getPeriodFromRecordedAt(p.recordedAt)
      counts[period] = (counts[period] || 0) + 1
    })
    return TIME_PERIODS.map((p) => ({
      period: p.label,
      count: counts[p.label],
    }))
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
    refreshNonce.value++
    lastUpdated.value = new Date()
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
