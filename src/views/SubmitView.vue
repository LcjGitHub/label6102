<script setup lang="ts">
import { reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import { useUserSamples } from '@/composables/useUserSamples'
import { CATEGORY_LABELS, ALL_TAGS } from '@/types/sample'
import type { SampleCategory, SamplePoint } from '@/types/sample'
import {
  validateSubmitForm,
  hasErrors,
  generateTimeDistribution,
  formatRecordedAt,
} from '@/composables/useSampleForm'
import type { SubmitFormData, SubmitFormErrors } from '@/composables/useSampleForm'

const router = useRouter()
const { addUserSample, generateId } = useUserSamples()

type FormData = SubmitFormData & { category: SampleCategory | '' }
type FormErrors = SubmitFormErrors

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

const SHANGHAI_CENTER: L.LatLngExpression = [31.2304, 121.4737]

function validate(): boolean {
  const validationErrors = validateSubmitForm(form)
  Object.assign(errors, validationErrors)

  if (!form.category) {
    errors.category = '请选择分类'
  }

  return !hasErrors(errors) && !!form.category
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

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true

  try {
    const latNum = parseFloat(form.lat)
    const lngNum = parseFloat(form.lng)
    const durationNum = parseInt(form.durationSec, 10)

    const newSample: SamplePoint = {
      id: generateId(),
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
      waveformSeed: Math.floor(Math.random() * 9999) + 100,
    }

    addUserSample(newSample)

    submitSuccess.value = true

    setTimeout(() => {
      router.push({ name: 'detail', params: { id: newSample.id } })
    }, 1500)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.category = ''
  form.lat = ''
  form.lng = ''
  form.address = ''
  form.description = ''
  form.tags = []
  form.recordedAt = ''
  form.durationSec = ''
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

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: SHANGHAI_CENTER,
    zoom: 12,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  map.on('click', onMapClick)
})

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="submit">
    <button type="button" class="submit__back btn" @click="router.push('/')">
      ← 返回首页
    </button>

    <div v-if="submitSuccess" class="submit__success card">
      <div class="submit__success-icon">✓</div>
      <h2>提交成功！</h2>
      <p>正在跳转到采样点详情页...</p>
    </div>

    <div v-else class="card submit__card">
      <header class="submit__header">
        <h1>提交采样点</h1>
        <p>分享你发现的城市声音采样点</p>
      </header>

      <form class="submit__form" @submit.prevent="handleSubmit" novalidate>
        <div class="submit__field">
          <label class="submit__label">
            采样点名称 <span class="submit__required">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="submit__input"
            placeholder="如：人民公园东门"
            maxlength="50"
          />
          <p v-if="errors.name" class="submit__error">{{ errors.name }}</p>
        </div>

        <div class="submit__field">
          <label class="submit__label">
            分类 <span class="submit__required">*</span>
          </label>
          <select v-model="form.category" class="submit__input submit__select">
            <option value="">请选择分类</option>
            <option
              v-for="(label, key) in CATEGORY_LABELS"
              :key="key"
              :value="key"
            >
              {{ label }}
            </option>
          </select>
          <p v-if="errors.category" class="submit__error">{{ errors.category }}</p>
        </div>

        <div class="submit__field">
          <label class="submit__label">
            经纬度 <span class="submit__required">*</span>
            <span class="submit__hint">（点击地图或手动输入）</span>
          </label>
          <div class="submit__latlng">
            <input
              v-model="form.lat"
              type="number"
              step="0.000001"
              class="submit__input"
              placeholder="纬度 (如: 31.2304)"
              @change="onLatLngInput"
            />
            <input
              v-model="form.lng"
              type="number"
              step="0.000001"
              class="submit__input"
              placeholder="经度 (如: 121.4737)"
              @change="onLatLngInput"
            />
          </div>
          <p v-if="errors.lat" class="submit__error">{{ errors.lat }}</p>
          <p v-if="errors.lng" class="submit__error">{{ errors.lng }}</p>
          <div ref="mapContainer" class="submit__map"></div>
        </div>

        <div class="submit__field">
          <label class="submit__label">
            地址 <span class="submit__required">*</span>
          </label>
          <input
            v-model="form.address"
            type="text"
            class="submit__input"
            placeholder="详细地址"
          />
          <p v-if="errors.address" class="submit__error">{{ errors.address }}</p>
        </div>

        <div class="submit__field">
          <label class="submit__label">
            描述 <span class="submit__required">*</span>
          </label>
          <textarea
            v-model="form.description"
            class="submit__input submit__textarea"
            rows="3"
            placeholder="描述这个采样点的声音环境特点"
            maxlength="500"
          ></textarea>
          <p v-if="errors.description" class="submit__error">{{ errors.description }}</p>
        </div>

        <div class="submit__field">
          <label class="submit__label">
            标签 <span class="submit__required">*</span>
            <span class="submit__hint">（可多选）</span>
          </label>
          <div class="submit__tags">
            <button
              v-for="tag in ALL_TAGS"
              :key="tag"
              type="button"
              class="submit__tag-btn"
              :class="{ 'tag--active': form.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
          <p v-if="errors.tags" class="submit__error">{{ errors.tags }}</p>
        </div>

        <div class="submit__row">
          <div class="submit__field submit__field--half">
            <label class="submit__label">
              录制时间 <span class="submit__required">*</span>
            </label>
            <input
              v-model="form.recordedAt"
              type="datetime-local"
              class="submit__input"
            />
            <p v-if="errors.recordedAt" class="submit__error">{{ errors.recordedAt }}</p>
          </div>

          <div class="submit__field submit__field--half">
            <label class="submit__label">
              时长（秒） <span class="submit__required">*</span>
              <span class="submit__hint">（5-600）</span>
            </label>
            <input
              v-model="form.durationSec"
              type="number"
              min="5"
              max="600"
              class="submit__input"
              placeholder="如：45"
            />
            <p v-if="errors.durationSec" class="submit__error">{{ errors.durationSec }}</p>
          </div>
        </div>

        <div class="submit__actions">
          <button type="button" class="btn" @click="resetForm">
            重置
          </button>
          <button type="submit" class="btn btn--primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交采样点' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.submit {
  padding: 20px 24px 32px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.submit__back {
  margin-bottom: 16px;
}

.submit__card {
  padding: 24px 28px;
}

.submit__header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.submit__header h1 {
  margin: 0 0 4px;
  font-size: 1.4rem;
}

.submit__header p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.submit__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.submit__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.submit__label {
  font-size: 0.9rem;
  font-weight: 600;
}

.submit__required {
  color: #ff6b6b;
}

.submit__hint {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 400;
  margin-left: 4px;
}

.submit__input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.15s;
}

.submit__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.submit__input::placeholder {
  color: var(--color-text-muted);
}

.submit__select {
  cursor: pointer;
}

.submit__textarea {
  resize: vertical;
  min-height: 80px;
}

.submit__latlng {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.submit__map {
  width: 100%;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 4px;
}

.submit__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.submit__tag-btn {
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

.submit__tag-btn:hover {
  background: rgba(91, 141, 239, 0.3);
}

.submit__tag-btn.tag--active {
  background: var(--color-accent-dim);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.submit__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.submit__error {
  margin: 0;
  font-size: 0.8rem;
  color: #ff6b6b;
}

.submit__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.submit__actions .btn {
  min-width: 120px;
}

.submit__success {
  padding: 48px 32px;
  text-align: center;
  animation: submitFadeIn 0.3s ease;
}

.submit__success-icon {
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

.submit__success h2 {
  margin: 0 0 8px;
  color: var(--color-accent);
}

.submit__success p {
  margin: 0;
  color: var(--color-text-muted);
}

@keyframes submitFadeIn {
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
  .submit {
    padding: 16px;
  }

  .submit__card {
    padding: 20px 16px;
  }

  .submit__latlng,
  .submit__row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .submit__actions {
    flex-direction: column-reverse;
  }

  .submit__actions .btn {
    width: 100%;
  }
}
</style>
