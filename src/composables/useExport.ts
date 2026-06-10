import { ref } from 'vue'
import type { SamplePoint } from '@/types/sample'

export type ExportFormat = 'json' | 'csv'

export interface ExportProgress {
  current: number
  total: number
  format: ExportFormat
}

export interface ExportSuccess {
  show: boolean
  format: ExportFormat
  filename: string
}

export function useExport() {
  const isExporting = ref(false)
  const exportProgress = ref<ExportProgress | null>(null)
  const exportSuccess = ref<ExportSuccess | null>(null)

  const FORMAT_LABELS: Record<ExportFormat, string> = {
    json: '结构化文本',
    csv: '表格文本',
  }

  function toCSV(samples: SamplePoint[]): string {
    const headers = [
      '标识',
      '名称',
      '类别',
      '标签',
      '纬度',
      '经度',
      '地址',
      '描述',
      '时长(秒)',
      '录制时间',
      '时间分布',
      '波形种子',
    ]

    const escape = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const rows = samples.map((sample) => {
      return [
        sample.id,
        sample.name,
        sample.category,
        sample.tags.join('|'),
        sample.lat.toString(),
        sample.lng.toString(),
        sample.address,
        sample.description,
        sample.durationSec.toString(),
        sample.recordedAt,
        JSON.stringify(sample.timeDistribution),
        sample.waveformSeed.toString(),
      ].map((val) => escape(val)).join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  function toJSON(samples: SamplePoint[]): string {
    return JSON.stringify(samples, null, 2)
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function simulateProgress(total: number, format: ExportFormat) {
    const stepDuration = 800 / Math.max(total, 10)
    exportProgress.value = { current: 0, total, format }
    for (let i = 1; i <= total; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration))
      exportProgress.value = { current: i, total, format }
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  async function exportSamples(samples: SamplePoint[], format: ExportFormat) {
    if (isExporting.value || samples.length === 0) return

    isExporting.value = true
    exportSuccess.value = null

    try {
      await simulateProgress(samples.length, format)

      let content: string
      let filename: string
      let mimeType: string

      const dateStr = new Date().toISOString().slice(0, 10)

      if (format === 'json') {
        content = toJSON(samples)
        filename = `favorites-${dateStr}.json`
        mimeType = 'application/json'
      } else {
        content = '\uFEFF' + toCSV(samples)
        filename = `favorites-${dateStr}.csv`
        mimeType = 'text/csv;charset=utf-8;'
      }

      downloadFile(content, filename, mimeType)

      exportSuccess.value = { show: true, format, filename }
      setTimeout(() => {
        exportSuccess.value = null
      }, 3000)
    } finally {
      isExporting.value = false
      exportProgress.value = null
    }
  }

  function clearExportSuccess() {
    exportSuccess.value = null
  }

  return {
    isExporting,
    exportProgress,
    exportSuccess,
    exportSamples,
    toCSV,
    toJSON,
    FORMAT_LABELS,
    clearExportSuccess,
  }
}
