<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserSamples } from '@/composables/useUserSamples'
import { ALL_TAGS, CATEGORY_LABELS } from '@/types/sample'
import type { SamplePoint } from '@/types/sample'
import { validateEditForm, hasErrors } from '@/composables/useSampleForm'
import type { EditFormData, EditFormErrors } from '@/composables/useSampleForm'

const router = useRouter()
const route = useRoute()
const { getUserSampleById, updateUserSample, isUserSample } = useUserSamples()

const sampleId = computed(() => route.params.id as string)
const originalSample = computed(() => getUserSampleById(sampleId.value))
const canEdit = computed(() => isUserSample(sampleId.value))

const form = reactive<EditFormData>({
  name: '',
  address: '',
  description: '',
  tags: [],
})

const errors = reactive<EditFormErrors>({
  name: '',
  address: '',
  description: '',
  tags: '',
})

const submitting = ref(false)
const submitSuccess = ref(false)
const saveError = ref('')

function loadSampleData() {
  if (!originalSample.value) return
  const s = originalSample.value
  form.name = s.name
  form.address = s.address
  form.description = s.description
  form.tags = [...s.tags]
}

function clearError(field: keyof EditFormErrors) {
  errors[field] = ''
  saveError.value = ''
}

watch(
  () => form.name,
  () => clearError('name'),
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

function toggleTag(tag: string) {
  const idx = form.tags.indexOf(tag)
  if (idx >= 0) {
    form.tags.splice(idx, 1)
  } else {
    form.tags.push(tag)
  }
}

async function handleSubmit() {
  saveError.value = ''
  const validationErrors = validateEditForm(form)
  Object.assign(errors, validationErrors)

  if (hasErrors(validationErrors) || !canEdit.value) return

  submitting.value = true

  try {
    const updates: Partial<SamplePoint> = {
      name: form.name.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
      tags: [...form.tags],
    }

    const success = updateUserSample(sampleId.value, updates)

    if (success) {
      submitSuccess.value = true
      setTimeout(() => {
        router.push({ name: 'detail', params: { id: sampleId.value } })
      }, 1500)
    } else {
      saveError.value = '保存失败，请稍后重试'
    }
  } catch {
    saveError.value = '保存失败，发生了未知错误'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  loadSampleData()
  Object.keys(errors).forEach((k) => {
    ;(errors as any)[k] = ''
  })
  saveError.value = ''
}

function goBack() {
  if (originalSample.value) {
    router.push({ name: 'detail', params: { id: sampleId.value } })
  } else {
    router.push('/')
  }
}

loadSampleData()
</script>

<template>
  <div class="edit">
    <button type="button" class="edit__back btn" @click="goBack">← 返回</button>

    <div v-if="!canEdit" class="edit__empty card">
      <div class="edit__empty-icon">🔒</div>
      <h2>无权编辑该采样点</h2>
      <p>您只能编辑自己提交的采样点</p>
      <div class="edit__empty-actions">
        <button type="button" class="btn" @click="router.back()">返回上一页</button>
        <button type="button" class="btn btn--primary" @click="router.push('/')">返回首页</button>
      </div>
    </div>

    <div v-else-if="!originalSample" class="edit__empty card">
      <div class="edit__empty-icon">❓</div>
      <h2>采样点不存在</h2>
      <p>未找到该采样点的相关信息</p>
      <div class="edit__empty-actions">
        <button type="button" class="btn" @click="router.back()">返回上一页</button>
        <button type="button" class="btn btn--primary" @click="router.push('/')">返回首页</button>
      </div>
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

      <div v-if="originalSample" class="edit__sample-info">
        <div class="edit__sample-info-item">
          <span class="edit__sample-info-label">分类</span>
          <span class="edit__sample-info-value">
            {{ CATEGORY_LABELS[originalSample.category] }}
          </span>
        </div>
        <div class="edit__sample-info-item">
          <span class="edit__sample-info-label">录制时间</span>
          <span class="edit__sample-info-value">{{ originalSample.recordedAt }}</span>
        </div>
        <div class="edit__sample-info-item">
          <span class="edit__sample-info-label">时长</span>
          <span class="edit__sample-info-value">{{ originalSample.durationSec }} 秒</span>
        </div>
      </div>

      <form class="edit__form" novalidate @submit.prevent="handleSubmit">
        <div class="edit__field">
          <label class="edit__label">
            采样点名称
            <span class="edit__required">*</span>
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
            地址
            <span class="edit__required">*</span>
          </label>
          <input v-model="form.address" type="text" class="edit__input" placeholder="详细地址" />
          <p v-if="errors.address" class="edit__error">{{ errors.address }}</p>
        </div>

        <div class="edit__field">
          <label class="edit__label">
            描述
            <span class="edit__required">*</span>
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
            标签
            <span class="edit__required">*</span>
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

        <div v-if="saveError" class="edit__save-error">
          {{ saveError }}
        </div>

        <div class="edit__actions">
          <button type="button" class="btn" @click="resetForm">重置</button>
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
  max-width: 700px;
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
  margin-bottom: 20px;
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

.edit__sample-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--color-surface-2);
  border-radius: 8px;
}

.edit__sample-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}

.edit__sample-info-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.edit__sample-info-value {
  font-size: 0.9rem;
  font-weight: 500;
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

.edit__textarea {
  resize: vertical;
  min-height: 80px;
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

.edit__error {
  margin: 0;
  font-size: 0.8rem;
  color: #ff6b6b;
}

.edit__save-error {
  padding: 12px 16px;
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.35);
  border-radius: 8px;
  color: #ff8a8a;
  font-size: 0.9rem;
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
  gap: 12px;
  min-height: 300px;
  color: var(--color-text-muted);
  padding: 48px 32px;
  text-align: center;
}

.edit__empty-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.edit__empty h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.2rem;
}

.edit__empty p {
  margin: 0 0 16px;
}

.edit__empty-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
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

  .edit__actions {
    flex-direction: column-reverse;
  }

  .edit__actions .btn {
    width: 100%;
  }

  .edit__empty-actions {
    flex-direction: column-reverse;
    width: 100%;
  }

  .edit__empty-actions .btn {
    width: 100%;
  }
}
</style>
