import type { TimeSlot } from '@/types/sample'

export interface SubmitFormData {
  name: string
  category: string
  lat: string
  lng: string
  address: string
  description: string
  tags: string[]
  recordedAt: string
  durationSec: string
}

export interface EditFormData {
  name: string
  address: string
  description: string
  tags: string[]
}

export interface SubmitFormErrors {
  name: string
  category: string
  lat: string
  lng: string
  address: string
  description: string
  tags: string
  recordedAt: string
  durationSec: string
}

export interface EditFormErrors {
  name: string
  address: string
  description: string
  tags: string
}

export function generateTimeDistribution(recordedAtStr: string): TimeSlot[] {
  const hour = new Date(recordedAtStr).getHours()

  const distributions: Record<string, TimeSlot[]> = {
    morning: [
      { period: '06:00-09:00', count: 22 },
      { period: '09:00-12:00', count: 14 },
      { period: '12:00-15:00', count: 8 },
      { period: '15:00-18:00', count: 10 },
      { period: '18:00-21:00', count: 5 },
      { period: '21:00-24:00', count: 2 },
    ],
    forenoon: [
      { period: '06:00-09:00', count: 14 },
      { period: '09:00-12:00', count: 24 },
      { period: '12:00-15:00', count: 16 },
      { period: '15:00-18:00', count: 12 },
      { period: '18:00-21:00', count: 6 },
      { period: '21:00-24:00', count: 3 },
    ],
    noon: [
      { period: '06:00-09:00', count: 8 },
      { period: '09:00-12:00', count: 18 },
      { period: '12:00-15:00', count: 26 },
      { period: '15:00-18:00', count: 18 },
      { period: '18:00-21:00', count: 10 },
      { period: '21:00-24:00', count: 4 },
    ],
    afternoon: [
      { period: '06:00-09:00', count: 6 },
      { period: '09:00-12:00', count: 12 },
      { period: '12:00-15:00', count: 20 },
      { period: '15:00-18:00', count: 28 },
      { period: '18:00-21:00', count: 16 },
      { period: '21:00-24:00', count: 6 },
    ],
    evening: [
      { period: '06:00-09:00', count: 4 },
      { period: '09:00-12:00', count: 8 },
      { period: '12:00-15:00', count: 12 },
      { period: '15:00-18:00', count: 22 },
      { period: '18:00-21:00', count: 30 },
      { period: '21:00-24:00', count: 14 },
    ],
    night: [
      { period: '06:00-09:00', count: 2 },
      { period: '09:00-12:00', count: 4 },
      { period: '12:00-15:00', count: 6 },
      { period: '15:00-18:00', count: 12 },
      { period: '18:00-21:00', count: 24 },
      { period: '21:00-24:00', count: 28 },
    ],
    lateNight: [
      { period: '06:00-09:00', count: 3 },
      { period: '09:00-12:00', count: 3 },
      { period: '12:00-15:00', count: 4 },
      { period: '15:00-18:00', count: 6 },
      { period: '18:00-21:00', count: 14 },
      { period: '21:00-24:00', count: 32 },
    ],
  }

  let key: string
  if (hour >= 6 && hour < 9) {
    key = 'morning'
  } else if (hour >= 9 && hour < 12) {
    key = 'forenoon'
  } else if (hour >= 12 && hour < 15) {
    key = 'noon'
  } else if (hour >= 15 && hour < 18) {
    key = 'afternoon'
  } else if (hour >= 18 && hour < 21) {
    key = 'evening'
  } else if (hour >= 21 && hour < 24) {
    key = 'night'
  } else {
    key = 'lateNight'
  }

  return distributions[key]
}

export function formatRecordedAt(dateStr: string): string {
  const d = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatRecordedAtForInput(dateStr: string): string {
  const d = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function validateSubmitForm(form: SubmitFormData): SubmitFormErrors {
  const errors: SubmitFormErrors = {
    name: '',
    category: '',
    lat: '',
    lng: '',
    address: '',
    description: '',
    tags: '',
    recordedAt: '',
    durationSec: '',
  }

  if (!form.name.trim()) {
    errors.name = '请输入采样点名称'
  } else if (form.name.trim().length > 50) {
    errors.name = '名称不能超过 50 个字符'
  }

  if (!form.category) {
    errors.category = '请选择分类'
  }

  const latNum = parseFloat(form.lat)
  const lngNum = parseFloat(form.lng)

  if (form.lat === '' || isNaN(latNum)) {
    errors.lat = '请输入有效的纬度'
  } else if (latNum < -90 || latNum > 90) {
    errors.lat = '纬度范围应在 -90 到 90 之间'
  }

  if (form.lng === '' || isNaN(lngNum)) {
    errors.lng = '请输入有效的经度'
  } else if (lngNum < -180 || lngNum > 180) {
    errors.lng = '经度范围应在 -180 到 180 之间'
  }

  if (!form.address.trim()) {
    errors.address = '请输入地址'
  }

  if (!form.description.trim()) {
    errors.description = '请输入描述'
  } else if (form.description.trim().length > 500) {
    errors.description = '描述不能超过 500 个字符'
  }

  if (form.tags.length === 0) {
    errors.tags = '请至少选择一个标签'
  }

  if (!form.recordedAt) {
    errors.recordedAt = '请选择录制时间'
  }

  const durationNum = parseInt(form.durationSec, 10)
  if (form.durationSec === '' || isNaN(durationNum)) {
    errors.durationSec = '请输入有效的时长'
  } else if (durationNum < 5 || durationNum > 600) {
    errors.durationSec = '时长范围应在 5 到 600 秒之间'
  }

  return errors
}

export function validateEditForm(form: EditFormData): EditFormErrors {
  const errors: EditFormErrors = {
    name: '',
    address: '',
    description: '',
    tags: '',
  }

  if (!form.name.trim()) {
    errors.name = '请输入采样点名称'
  } else if (form.name.trim().length > 50) {
    errors.name = '名称不能超过 50 个字符'
  }

  if (!form.address.trim()) {
    errors.address = '请输入地址'
  }

  if (!form.description.trim()) {
    errors.description = '请输入描述'
  } else if (form.description.trim().length > 500) {
    errors.description = '描述不能超过 500 个字符'
  }

  if (form.tags.length === 0) {
    errors.tags = '请至少选择一个标签'
  }

  return errors
}

export function hasErrors(errors: SubmitFormErrors | EditFormErrors): boolean {
  return Object.values(errors).some((v) => v !== '')
}
