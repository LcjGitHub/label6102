<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SamplePoint } from '@/types/sample'

type ToastType = 'success' | 'error'
interface ToastState {
  visible: boolean
  type: ToastType
  message: string
}

const props = defineProps<{
  visible: boolean
  sample: SamplePoint
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const wechatExpanded = ref(false)
const toast = ref<ToastState>({
  visible: false,
  type: 'success',
  message: '',
})
let toastTimer: ReturnType<typeof setTimeout> | null = null

const shareUrl = computed(() => {
  return `${window.location.origin}/sample/${props.sample.id}`
})

const fullShareText = computed(() => {
  return `${props.sample.name}\n${props.sample.address}\n${props.sample.description}\n\n${shareUrl.value}`
})

const shareTitle = computed(() => {
  return `${props.sample.name} - ${props.sample.address}`
})

const shareSummary = computed(() => {
  return props.sample.description
})

const qrCodeUrl = computed(() => {
  const encoded = encodeURIComponent(shareUrl.value)
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encoded}`
})

const weiboShareUrl = computed(() => {
  const title = encodeURIComponent(`${shareTitle.value}\n${shareSummary.value}`)
  const url = encodeURIComponent(shareUrl.value)
  return `https://service.weibo.com/share/share.php?url=${url}&title=${title}`
})

const qqShareUrl = computed(() => {
  const title = encodeURIComponent(shareTitle.value)
  const url = encodeURIComponent(shareUrl.value)
  const summary = encodeURIComponent(shareSummary.value)
  const desc = encodeURIComponent(props.sample.address)
  return `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&summary=${summary}&desc=${desc}`
})

function showToast(type: ToastType, message: string) {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  toast.value = { visible: true, type, message }
  toastTimer = setTimeout(() => {
    toast.value.visible = false
    toastTimer = null
  }, 2500)
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    showToast('success', '链接已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    showToast('error', '复制失败，请重试')
  }
}

function toggleWechat() {
  wechatExpanded.value = !wechatExpanded.value
}

async function copyWechatText() {
  try {
    await navigator.clipboard.writeText(fullShareText.value)
    showToast('success', '微信分享文案已复制')
  } catch (err) {
    console.error('复制失败:', err)
    showToast('error', '复制失败，请重试')
  }
}

function openWeibo() {
  try {
    window.open(weiboShareUrl.value, '_blank', 'width=600,height=500')
    showToast('success', '已打开微博分享页面')
  } catch (err) {
    console.error('打开失败:', err)
    showToast('error', '打开失败，请重试')
  }
}

function openQQ() {
  try {
    window.open(qqShareUrl.value, '_blank', 'width=600,height=500')
    showToast('success', '已打开QQ分享页面')
  } catch (err) {
    console.error('打开失败:', err)
    showToast('error', '打开失败，请重试')
  }
}

function handleOverlayClick() {
  emit('close')
}

function handleContentClick(e: Event) {
  e.stopPropagation()
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      wechatExpanded.value = false
      toast.value.visible = false
      if (toastTimer) {
        clearTimeout(toastTimer)
        toastTimer = null
      }
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="share-modal" @click="handleOverlayClick">
        <div class="share-modal__content card" @click="handleContentClick">
          <div class="share-modal__header">
            <h3 class="share-modal__title">分享采样点</h3>
            <button
              type="button"
              class="share-modal__close"
              @click="emit('close')"
              aria-label="关闭"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <Transition name="toast">
            <div
              v-if="toast.visible"
              class="share-modal__toast"
              :class="`share-modal__toast--${toast.type}`"
            >
              <svg v-if="toast.type === 'success'" class="share-modal__toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg v-else class="share-modal__toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{{ toast.message }}</span>
            </div>
          </Transition>

          <div class="share-modal__info">
            <div class="share-modal__info-name">{{ sample.name }}</div>
            <div class="share-modal__info-address">{{ sample.address }}</div>
          </div>

          <div class="share-modal__options">
            <button
              type="button"
              class="share-modal__option"
              @click="copyLink"
            >
              <div class="share-modal__icon share-modal__icon--link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <span class="share-modal__label">复制链接</span>
            </button>

            <button
              type="button"
              class="share-modal__option"
              :class="{ 'share-modal__option--active': wechatExpanded }"
              @click="toggleWechat"
            >
              <div class="share-modal__icon share-modal__icon--wechat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                </svg>
              </div>
              <span class="share-modal__label">微信</span>
              <svg class="share-modal__chevron" :class="{ 'share-modal__chevron--up': wechatExpanded }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <button
              type="button"
              class="share-modal__option"
              @click="openWeibo"
            >
              <div class="share-modal__icon share-modal__icon--weibo">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.388-1.032.42-1.92.003-2.553-.792-1.2-2.986-1.162-5.533-.032 0 0-.772.339-.574-.274.382-1.217.324-2.232-.27-2.829-1.348-1.352-4.937.051-8.017 3.133C.638 11.095-.598 13.462.255 15.406c1.633 3.727 6.284 5.996 11.883 5.996 7.353 0 12.249-4.283 12.249-7.69 0-2.054-1.736-3.225-3.278-3.763zm1.594-5.322c-.988-1.168-2.43-1.821-4.019-1.821v-.003h-.003c-.161 0-.299.117-.34.277-.04.161.05.325.213.372.047.014 1.326.368 2.247 1.175.894.793 1.422 1.91 1.486 3.072.007.15.095.284.229.336.043.017.089.025.134.025.107 0 .208-.057.265-.155.061-.106.092-.22.088-.335-.03-.678-.312-1.352-.797-1.943zm-2.007-2.948c-1.393-1.604-3.371-2.527-5.582-2.527h-.004c-.166 0-.306.126-.338.29-.032.165.067.33.23.385.051.017 1.88.541 3.159 1.758 1.237 1.177 1.97 2.78 2.062 4.488.012.201.161.368.351.399.047.008.096.008.143-.006.165-.051.272-.208.25-.382-.052-1.037-.307-2.096-.737-3.053a6.08 6.08 0 0 0-1.534-2.35z" />
                </svg>
              </div>
              <span class="share-modal__label">微博</span>
            </button>

            <button
              type="button"
              class="share-modal__option"
              @click="openQQ"
            >
              <div class="share-modal__icon share-modal__icon--qq">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.396.014-.396 0-4.636-3.023-8.398-7.527-8.398-4.504 0-7.527 3.762-7.527 8.398 0 .239.02.536.02.536l-1.113 2.783a40.543 40.543 0 0 0-.746 2.143c-.123.421-.12.795.008 1.069.242.522 1.021.833 2.078.833.699 0 1.368-.171 1.94-.458.123.357.259.7.408 1.028.559 1.236 1.355 2.202 2.285 2.777l.001.002c.037.023.074.046.112.067-.093.239-.14.488-.14.751 0 1.113.672 1.775 1.758 1.775.37 0 .71-.075 1.008-.21.298.135.638.21 1.007.21 1.086 0 1.758-.662 1.758-1.775 0-.263-.047-.512-.14-.751.038-.021.075-.044.112-.067.001-.001.003-.003.004-.005.93-.575 1.726-1.541 2.285-2.777.149-.328.285-.671.408-1.028.572.287 1.241.458 1.94.458 1.057 0 1.836-.311 2.078-.833.128-.274.132-.647.008-1.069zM12.001 1.97c3.59 0 6.528 3.052 6.528 7.74 0 .645-.069 1.267-.193 1.858-.076-.043-.155-.086-.235-.126-.345-.174-.71-.307-1.09-.397-.335-.078-.683-.126-1.037-.143-.617-1.728-2.095-2.97-3.973-2.97-1.878 0-3.356 1.242-3.973 2.97-.354.017-.702.065-1.037.143-.38.09-.745.223-1.09.397-.08.04-.159.083-.235.126-.124-.591-.193-1.213-.193-1.858 0-4.688 2.938-7.74 6.528-7.74z" />
                </svg>
              </div>
              <span class="share-modal__label">QQ</span>
            </button>
          </div>

          <Transition name="expand">
            <div v-if="wechatExpanded" class="share-modal__wechat">
              <div class="share-modal__qr-wrapper">
                <img :src="qrCodeUrl" alt="微信扫码" class="share-modal__qr" referrerpolicy="no-referrer" />
                <div class="share-modal__qr-tip">使用微信扫一扫</div>
              </div>
              <div class="share-modal__wechat-actions">
                <button
                  type="button"
                  class="btn btn--primary share-modal__wechat-copy"
                  @click="copyWechatText"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  复制分享文案
                </button>
              </div>
            </div>
          </Transition>

          <div class="share-modal__footer">
            <button
              type="button"
              class="btn share-modal__cancel"
              @click="emit('close')"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.share-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.share-modal__content {
  width: 90%;
  max-width: 440px;
  padding: 24px;
  position: relative;
}

.share-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.share-modal__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.share-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.share-modal__close:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.share-modal__close svg {
  width: 20px;
  height: 20px;
}

.share-modal__toast {
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  z-index: 10;
  white-space: nowrap;
}

.share-modal__toast--success {
  background: rgba(7, 193, 96, 0.95);
  color: #fff;
}

.share-modal__toast--error {
  background: rgba(255, 77, 109, 0.95);
  color: #fff;
}

.share-modal__toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.share-modal__info {
  padding: 14px 16px;
  background: var(--color-surface-2);
  border-radius: var(--radius);
  margin-bottom: 20px;
}

.share-modal__info-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.share-modal__info-address {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.share-modal__options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.share-modal__option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface-2);
  color: var(--color-text);
  transition: all 0.15s;
}

.share-modal__option:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
  transform: translateY(-2px);
}

.share-modal__option--active {
  border-color: rgba(7, 193, 96, 0.6);
  background: rgba(7, 193, 96, 0.12);
}

.share-modal__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 0;
}

.share-modal__icon svg {
  width: 28px;
  height: 28px;
}

.share-modal__icon--link {
  background: rgba(61, 214, 198, 0.15);
  color: var(--color-accent);
}

.share-modal__icon--wechat {
  background: rgba(7, 193, 96, 0.15);
  color: #07c160;
}

.share-modal__icon--weibo {
  background: rgba(230, 16, 29, 0.15);
  color: #e6101d;
}

.share-modal__icon--qq {
  background: rgba(18, 150, 219, 0.15);
  color: #1296db;
}

.share-modal__label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.share-modal__option:hover .share-modal__label {
  color: var(--color-text);
}

.share-modal__chevron {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
  transition: transform 0.2s ease;
}

.share-modal__chevron--up {
  transform: rotate(180deg);
}

.share-modal__wechat {
  background: var(--color-surface-2);
  border: 1px solid rgba(7, 193, 96, 0.3);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 20px;
}

.share-modal__qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.share-modal__qr {
  width: 180px;
  height: 180px;
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  box-sizing: content-box;
}

.share-modal__qr-tip {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.share-modal__wechat-actions {
  display: flex;
  justify-content: center;
}

.share-modal__wechat-copy {
  min-width: 160px;
}

.share-modal__wechat-copy svg {
  width: 16px;
  height: 16px;
}

.share-modal__footer {
  display: flex;
  justify-content: center;
}

.share-modal__cancel {
  min-width: 120px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .share-modal__content,
.modal-leave-active .share-modal__content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .share-modal__content,
.modal-leave-to .share-modal__content {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .share-modal__content {
    padding: 20px;
  }

  .share-modal__options {
    gap: 10px;
  }

  .share-modal__option {
    padding: 12px 4px;
  }

  .share-modal__icon {
    width: 42px;
    height: 42px;
  }

  .share-modal__icon svg {
    width: 24px;
    height: 24px;
  }

  .share-modal__qr {
    width: 160px;
    height: 160px;
  }
}
</style>
