<script setup lang="ts">
import { reactive, ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import L from 'leaflet'
import { useUserSamples } from '@/composables/useUserSamples'
import { CATEGORY_LABELS, ALL_TAGS } from '@/types/sample'
import type { SampleCategory, SamplePoint, TimeSlot } from '@/types/sample'

const router = useRouter()
const route = useRoute()
const { getUserSampleById, updateUserSample, isUserSample } = useUserSamples()

const sampleId = computed(() => route.params.id as string)
const originalSample = computed(() => getUserSampleById(sampleId.value))
const canEdit = computed(() => isUserSample(sampleId.value))

interface FormData {
  name: string
  category: SampleCategory | ''
  lat: string
  lng: string
  address: string
  description: string
  tags: string[]
  recordedAt: string
  durationSec: string
}

interface FormErrors {
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

const form = reactive<FormData>({
  name: '',
  category: '',
  lat: '',
  lng: '',
  address: '',
  description: '',
  tags: [],
  recordedAt: '',
  durationSec: '',
})

const errors = reactive<FormErrors>({
  name: '',
  category: '',
  lat: '',
  lng: '',
  address: '',
  description: '',
  tags: '',
  recordedAt: '',
  durationSec: '',
})

const submitting = ref(false)
const submitSuccess = ref(false)

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let pickerMarker: L.Marker | null = null

function loadSampleData() {
  if (!originalSample.value) return
  const s = originalSample.value
  form.name = s.name
  form.category = s.category
  form.lat = s.lat.toString()
  form.lng = s.lng.toString()
  form.address = s.address
  form.description = s.description
  form.tags = [...s.tags]
  form.recordedAt = formatRecordedAtForInput(s.recordedAt)
  form.durationSec = s.durationSec.toString()
}

function formatRecordedAtForInput(dateStr: string): string {
  const d = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function validate(): boolean {
  let valid = true

  errors.name = ''
  errors.category = ''
  errors.lat = ''
  errors.lng = ''
  errors.address = ''
  errors.description = ''
  errors.tags = ''
  errors.recordedAt = ''
  errors.durationSec = ''

  if (!form.name.trim()) {
    errors.name = '请输入采样点名称'
    valid = false
  } else if (form.name.trim().length > 50) {
    errors.name = '名称不能超过 50 个字符'
    valid = false
  }

  if (!form.category) {
    errors.category = '请选择分类'
    valid = false
  }

  const latNum = parseFloat(form.lat)
  const lngNum = parseFloat(form.lng)

  if (form.lat === '' || isNaN(latNum)) {
    errors.lat = '请输入有效的纬度'
    valid = false
  } else if (latNum < -90 || latNum > 90) {
    errors.lat = '纬度范围应在 -90 到 90 之间'
    valid = false
  }

  if (form.lng === '' || isNaN(lngNum)) {
    errors.lng = '请输入有效的经度'
    valid = false
  } else if (lngNum < -180 || lngNum > 180) {
    errors.lng = '经度范围应在 -180 到 180 之间'
    valid = false
  }

  if (!form.address.trim()) {
    errors.address = '请输入地址'
    valid = false
  }

  if (!form.description.trim()) {
    errors.description = '请输入描述'
    valid = false
  } else if (form.description.trim().length > 500) {
    errors.description = '描述不能超过 500 个字符'
    valid = false
  }

  if (form.tags.length === 0) {
    errors.tags = '请至少选择一个标签'
    valid = false
  }

  if (!form.recordedAt) {
    errors.recordedAt = '请选择录制时间'
    valid = false
  }

  const durationNum = parseInt(form.durationSec, 10)
  if (form.durationSec === '' || isNaN(durationNum)) {
    errors.durationSec = '请输入有效的时长'
    valid = false
  } else if (durationNum < 5 || durationNum > 600) {
    errors.durationSec = '时长范围应在 5 到 600 秒之间'
    valid = false
  }

  return valid
}

function clearError(field: keyof FormErrors) {
  errors[field] = ''
}

watch(
  () => form.name,
  () => clearError('name'),
)
watch(
  () => form.category,
  () => clearError('category'),
)
watch(
  () => form.lat,
  () => clearError('lat'),
)
watch(
  () => form.lng,
  () => clearError('lng'),
)
watch(
  () => form.address,
  () => clearError('address'),
)
watch(
  () => form.description,
  () => clearError('description'),
)
watch(
  () => form.tags.length,
  () => clearError('tags'),
)
watch(
  () => form.recordedAt,
  () => clearError('recordedAt'),
)
watch(
  () => form.durationSec,
  () => clearError('durationSec'),
)

function toggleTag(tag: string) {
  const idx = form.tags.indexOf(tag)
  if (idx >= 0) {
    form.tags.splice(idx, 1)
  } else {
    form.tags.push(tag)
  }
}

function generateTimeDistribution(recordedAtStr: string): TimeSlot[] {
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

function formatRecordedAt(dateStr: string): string {
  const d = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function handleSubmit() {
  if (!validate() || !canEdit.value) return

  submitting.value = true

  try {
    const latNum = parseFloat(form.lat)
    const lngNum = parseFloat(form.lng)
    const durationNum = parseInt(form.durationSec, 10)

    const updates: Partial<SamplePoint> = {
      name: form.name.trim(),
      category: form.category as SampleCategory,
      tags: [...form.tags],
      lat: latNum,
      lng: lngNum,
      address: form.address.trim(),
      description: form.description.trim(),
      durationSec: durationNum,
      recordedAt: formatRecordedAt(form.recordedAt),
      timeDistribution: generateTimeDistribution(form.recordedAt),
    }

    const success = updateUserSample(sampleId.value, updates)

    if (success) {
      submitSuccess.value = true
      setTimeout(() => {
        router.push({ name: 'detail', params: { id: sampleId.value } })
      }, 1500)
    }
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  loadSampleData()
  Object.keys(errors).forEach((k) => {
    ;(errors as any)[k] = ''
  })
}

function onMapClick(e: L.LeafletMouseEvent) {
  const { lat, lng } = e.latlng
  form.lat = lat.toFixed(6)
  form.lng = lng.toFixed(6)
  updatePickerMarker(lat, lng)
}

function updatePickerMarker(lat: number, lng: number) {
  if (!map) return
  if (pickerMarker) {
    pickerMarker.setLatLng([lat, lng])
  } else {
    pickerMarker = L.marker([lat, lng], {
      draggable: true,
      title: '拖动调整位置',
    }).addTo(map)
    pickerMarker.on('dragend', (ev) => {
      const m = ev.target as L.Marker
      const pos = m.getLatLng()
      form.lat = pos.lat.toFixed(6)
      form.lng = pos.lng.toFixed(6)
    })
  }
}

function onLatLngInput() {
  const lat = parseFloat(form.lat)
  const lng = parseFloat(form.lng)
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    updatePickerMarker(lat, lng)
    map?.panTo([lat, lng])
  }
}

function goBack() {
  router.push({ name: 'detail', params: { id: sampleId.value } })
}

onMounted(() => {
  if (!canEdit.value) {
    router.push('/')
    return
  }

  loadSampleData()

  if (!mapContainer.value || !originalSample.value) return

  map = L.map(mapContainer.value, {
    center: [originalSample.value.lat, originalSample.value.lng],
    zoom: 14,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  updatePickerMarker(originalSample.value.lat, originalSample.value.lng)

  map.on('click', onMapClick)
})

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="edit">
    <button type="button" class="edit__back btn" @click="goBack">
      ← 返回详情
    </button>

    <div v-if="!canEdit" class="edit__empty card">
      <p>无权编辑该采样点</p>
      <button type="button" class="btn btn--primary" @click="router.push('/')">
        返回首页
      </button>
    </div>

    <div v-else-if="submitSuccess" class="edit__success card">
      <div class="edit__success-icon">✓</div>
      <h2>保存成功！</h2>
      <p>正在返回采样点详情页...</p>
    </div>

    <div v-else class="card edit__card">
      <header class="edit__header">
        <h1>编辑采样点</h1>
        <p>修改采样点的信息</p>
      </header>

      <form class="edit__form" @submit.prevent="handleSubmit" novalidate>
        <div class="edit__field">
          <label class="edit__label">
            采样点名称 <span class="edit__required">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="edit__input"
            placeholder="如：人民公园东门"
            maxlength="50"
          />
          <p v-if="errors.name" class="edit__error">{{ errors.name }}</p>
        </div>

        <div class="edit__field">
          <label class="edit__label">
            分类 <span class="edit__required">*</span>
          </label>
          <select v-model="form.category" class="edit__input edit__select">
            <option value="">请选择分类</option>
            <option
              v-for="(label, key) in CATEGORY_LABELS"
              :key="key"
              :value="key"
            >
              {{ label }}
            </option>
          </select>
          <p v-if="errors.category" class="edit__error">{{ errors.category }}</p>
        </div>

        <div class="edit__field">
          <label class="edit__label">
            经纬度 <span class="edit__required">*</span>
            <span class="edit__hint">（点击地图或手动输入）</span>
          </label>
          <div class="edit__latlng">
            <input
              v-model="form.lat"
              type="number"
              step="0.000001"
              class="edit__input"
              placeholder="纬度 (如: 31.2304)"
              @change="onLatLngInput"
            />
            <input
              v-model="form.lng"
              type="number"
              step="0.000001"
              class="edit__input"
              placeholder="经度 (如: 121.4737)"
              @change="onLatLngInput"
            />
          </div>
          <p v-if="errors.lat" class="edit__error">{{ errors.lat }}</p>
          <p v-if="errors.lng" class="edit__error">{{ errors.lng }}</p>
          <div ref="mapContainer" class="edit__map"></div>
        </div>

        <div class="edit__field">
          <label class="edit__label">
            地址 <span class="edit__required">*</span>
          </label>
          <input
            v-model="form.address"
            type="text"
            class="edit__input"
            placeholder="详细地址"
          />
          <p v-if="errors.address" class="edit__error">{{ errors.address }}</p>
        </div>

        <div class="edit__field">
          <label class="edit__label">
            描述 <span class="edit__required">*</span>
          </label>
          <textarea
            v-model="form.description"
            class="edit__input edit__textarea"
            rows="3"
            placeholder="描述这个采样点的声音环境特点"
            maxlength="500"
          ></textarea>
          <p v-if="errors.description" class="edit__error">{{ errors.description }}</p>
        </div>

        <div class="edit__field">
          <label class="edit__label">
            标签 <span class="edit__required">*</span>
            <span class="edit__hint">（可多选）</span>
          </label>
          <div class="edit__tags">
            <button
              v-for="tag in ALL_TAGS"
              :key="tag"
              type="button"
              class="edit__tag-btn"
              :class="{ 'tag--active': form.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
          <p v-if="errors.tags" class="edit__error">{{ errors.tags }}</p>
        </div>

        <div class="edit__row">
          <div class="edit__field edit__field--half">
            <label class="edit__label">
              录制时间 <span class="edit__required">*</span>
            </label>
            <input
              v-model="form.recordedAt"
              type="datetime-local"
              class="edit__input"
            />
            <p v-if="errors.recordedAt" class="edit__error">{{ errors.recordedAt }}</p>
          </div>

          <div class="edit__field edit__field--half">
            <label class="edit__label">
              时长（秒） <span class="edit__required">*</span>
              <span class="edit__hint">（5-600）</span>
            </label>
            <input
              v-model="form.durationSec"
              type="number"
              min="5"
              max="600"
              class="edit__input"
              placeholder="如：45"
            />
            <p v-if="errors.durationSec" class="edit__error">{{ errors.durationSec }}</p>
          </div>
        </div>

        <div class="edit__actions">
          <button type="button" class="btn" @click="resetForm">
            重置
          </button>
          <button type="submit" class="btn btn--primary" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit {
  padding: 20px 24px 32px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.edit__back {
  margin-bottom: 16px;
}

.edit__card {
  padding: 24px 28px;
}

.edit__header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.edit__header h1 {
  margin: 0 0 4px;
  font-size: 1.4rem;
}

.edit__header p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.edit__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.edit__label {
  font-size: 0.9rem;
  font-weight: 600;
}

.edit__required {
  color: #ff6b6b;
}

.edit__hint {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 400;
  margin-left: 4px;
}

.edit__input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.15s;
}

.edit__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.edit__input::placeholder {
  color: var(--color-text-muted);
}

.edit__select {
  cursor: pointer;
}

.edit__textarea {
  resize: vertical;
  min-height: 80px;
}

.edit__latlng {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.edit__map {
  width: 100%;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 4px;
}

.edit__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.edit__tag-btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  background: rgba(91, 141, 239, 0.18);
  color: #a8c4ff;
  border: 1px solid rgba(91, 141, 239, 0.35);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.edit__tag-btn:hover {
  background: rgba(91, 141, 239, 0.3);
}

.edit__tag-btn.tag--active {
  background: var(--color-accent-dim);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.edit__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.edit__error {
  margin: 0;
  font-size: 0.8rem;
  color: #ff6b6b;
}

.edit__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.edit__actions .btn {
  min-width: 120px;
}

.edit__success {
  padding: 48px 32px;
  text-align: center;
  animation: editFadeIn 0.3s ease;
}

.edit__success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #0a1218;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit__success h2 {
  margin: 0 0 8px;
  color: var(--color-accent);
}

.edit__success p {
  margin: 0;
  color: var(--color-text-muted);
}

.edit__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 300px;
  color: var(--color-text-muted);
  padding: 48px 32px;
  text-align: center;
}

@keyframes editFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .edit {
    padding: 16px;
  }

  .edit__card {
    padding: 20px 16px;
  }

  .edit__latlng,
  .edit__row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .edit__actions {
    flex-direction: column-reverse;
  }

  .edit__actions .btn {
    width: 100%;
  }
}
</style>
