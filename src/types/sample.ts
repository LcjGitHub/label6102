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

export interface CategoryIconConfig {
  svg: string
  color: string
}

export const CATEGORY_ICONS: Record<SampleCategory, CategoryIconConfig> = {
  park: {
    svg: '<path d="M12 2C9 2 6.5 4.5 6.5 7.5c0 1.5.5 2.8 1.4 3.8H5c-.6 0-1 .4-1 1s.4 1 1 1h6v7c0 .6.4 1 1 1s1-.4 1-1v-7h6c.6 0 1-.4 1-1s-.4-1-1-1h-2.9c.9-1 1.4-2.3 1.4-3.8C17.5 4.5 15 2 12 2zm0 2c1.9 0 3.5 1.6 3.5 3.5S13.9 11 12 11 8.5 9.4 8.5 7.5 10.1 4 12 4z"/>',
    color: '#4caf50',
  },
  metro: {
    svg: '<path d="M12 2C7.6 2 4 5.6 4 10v8c0 1.1.9 2 2 2h2v-6H6v-4c0-3.3 2.7-6 6-6s6 2.7 6 6v4h-2v6h2c1.1 0 2-.9 2-2v-8c0-4.4-3.6-8-8-8zm-2 14v4h4v-4h-4z"/>',
    color: '#2196f3',
  },
  market: {
    svg: '<path d="M18 6h-2c0-2.2-1.8-4-4-4S8 3.8 8 6H6c-1.1 0-2 .9-2 2v1c0 3.9 3.1 7 7 7s7-3.1 7-7V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm1 11.9V18h2v2H9v-2h2v-2.1c-3.4-.5-6-3.4-6-6.9h2c0 2.8 2.2 5 5 5s5-2.2 5-5h2c0 3.5-2.6 6.4-6 6.9z"/>',
    color: '#ff9800',
  },
  street: {
    svg: '<path d="M7 2L5 22h14l-2-20h-2l1.5 18H9.5L11 2H9l-1.5 16h9L15 2h-2l-1.5 12h-3L8 2H7zM11 6h2v3h-2V6zm0 6h2v3h-2v-3z"/>',
    color: '#9c27b0',
  },
  cafe: {
    svg: '<path d="M20 3H6c-1.1 0-2 .9-2 2v8c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4v-2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 6h-2V5h2v4zM4 19h16v2H4z"/>',
    color: '#795548',
  },
  school: {
    svg: '<path d="M5 13.2v4l7 3.8 7-3.8v-4L12 17l-7-3.8zM12 2L1 8l11 6 9-4.9V17h2V8L12 2z"/>',
    color: '#e91e63',
  },
  plaza: {
    svg: '<path d="M12 2L3 8v13h5v-6h8v6h5V8L12 2zm0 2.3L17 8H7l5-3.7zM8 10h8v2H8v-2zm0 4h8v5H8v-5z"/>',
    color: '#00bcd4',
  },
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
