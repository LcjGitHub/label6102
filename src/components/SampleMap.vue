<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import type { SamplePoint } from '@/types/sample'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/sample'
import { useUserSamples } from '@/composables/useUserSamples'

const props = defineProps<{
  points: SamplePoint[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { isUserSample } = useUserSamples()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null

const SHANGHAI_CENTER: L.LatLngExpression = [31.2304, 121.4737]

function createIcon(point: SamplePoint) {
  const iconConfig = CATEGORY_ICONS[point.category]
  const color = iconConfig.color
  const isNew = isUserSample(point.id)

  const size = isNew ? 42 : 34
  const tailHeight = 12

  const badgeHtml = isNew ? `<div class="sample-marker__badge">新</div>` : ''

  const svgHtml = `
    <svg class="sample-marker__icon" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      ${iconConfig.svg}
    </svg>
  `

  return L.divIcon({
    className: 'sample-marker',
    html: `<div class="sample-marker__pin" style="--pin-size:${size}px;--pin-color:${color};--tail-height:${tailHeight}px">
        <div class="sample-marker__icon-wrap">${svgHtml}</div>${badgeHtml}
      </div>`,
    iconSize: [size, size + tailHeight],
    iconAnchor: [size / 2, size + tailHeight],
    popupAnchor: [0, -(size + tailHeight)],
  })
}

function renderMarkers() {
  if (!map || !markerLayer) return

  markerLayer.clearLayers()

  props.points.forEach((point) => {
    const marker = L.marker([point.lat, point.lng], {
      icon: createIcon(point),
    })

    const isNew = isUserSample(point.id)
    const newBadgeHtml = isNew
      ? '<span style="display:inline-block;margin-left:6px;padding:1px 6px;border-radius:4px;background:linear-gradient(135deg,#ff6b6b,#ff8e53);color:#fff;font-size:11px;font-weight:700">新</span>'
      : ''

    const popupHtml = `
      <div class="map-popup">
        <div style="display:flex;align-items:center">
          <strong>${point.name}</strong>${newBadgeHtml}
        </div>
        <div style="font-size:12px;color:#8b9cb3;margin:4px 0">${CATEGORY_LABELS[point.category]}</div>
        <div style="font-size:12px;margin-bottom:8px">${point.tags.map((t) => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:1px 6px;border-radius:999px;background:rgba(91,141,239,0.2);font-size:11px">${t}</span>`).join('')}</div>
        <a href="#" class="popup-link">查看详情 →</a>
      </div>
    `

    marker.bindPopup(popupHtml)
    marker.on('popupopen', () => {
      const link = document.querySelector('.popup-link') as HTMLAnchorElement | null
      link?.addEventListener('click', (e) => {
        e.preventDefault()
        emit('select', point.id)
      })
    })
    marker.on('click', () => emit('select', point.id))
    marker.addTo(markerLayer!)
  })

  if (props.points.length === 1) {
    map.setView([props.points[0].lat, props.points[0].lng], 14)
  } else if (props.points.length > 1) {
    const bounds = L.latLngBounds(props.points.map((p) => [p.lat, p.lng] as L.LatLngTuple))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
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

  markerLayer = L.layerGroup().addTo(map)
  renderMarkers()
})

watch(
  () => props.points,
  () => renderMarkers(),
  { deep: true },
)

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapContainer" class="map-view" />
</template>

<style scoped>
.map-view {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: var(--radius);
  overflow: hidden;
}

:global(.sample-marker) {
  background: transparent;
  border: none;
}

:global(.sample-marker__pin) {
  position: relative;
  width: var(--pin-size);
  height: calc(var(--pin-size) + var(--tail-height));
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

:global(.sample-marker__pin::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: calc(var(--tail-height) * 0.5) solid transparent;
  border-right: calc(var(--tail-height) * 0.5) solid transparent;
  border-top: var(--tail-height) solid var(--pin-color);
}

:global(.sample-marker__icon-wrap) {
  position: relative;
  width: var(--pin-size);
  height: var(--pin-size);
  background: #fff;
  border-radius: 50%;
  border: 2.5px solid var(--pin-color);
  padding: 4px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(.sample-marker__icon) {
  width: 100%;
  height: 100%;
}

:global(.sample-marker__badge) {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 4px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: 2px solid #fff;
  animation: mapBadgePulse 2s ease-in-out infinite;
  z-index: 1000;
}

@keyframes mapBadgePulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.5);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(255, 107, 107, 0);
  }
}
</style>
