export type SampleCategory =
  | 'park'
  | 'metro'
  | 'market'
  | 'street'
  | 'cafe'
  | 'school'
  | 'plaza'

export interface TimeSlot {
  period: string
  count: number
}

export interface SamplePoint {
  id: string
  name: string
  category: SampleCategory
  tags: string[]
  lat: number
  lng: number
  address: string
  description: string
  durationSec: number
  recordedAt: string
  timeDistribution: TimeSlot[]
  waveformSeed: number
}

export const CATEGORY_LABELS: Record<SampleCategory, string> = {
  park: '公园',
  metro: '地铁口',
  market: '菜市场',
  street: '街道',
  cafe: '咖啡馆',
  school: '学校',
  plaza: '广场',
}

export const ALL_TAGS = [
  '人声',
  '交通',
  '自然',
  '商业',
  '施工',
  '鸟鸣',
  '雨声',
  '夜间',
  '早高峰',
  '晚高峰',
] as const

export type SampleTag = (typeof ALL_TAGS)[number]
