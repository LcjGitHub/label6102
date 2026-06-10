<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import type { SamplePoint } from '@/types/sample'
import { CATEGORY_LABELS } from '@/types/sample'

const props = defineProps<{
  points: SamplePoint[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null

const SHANGHAI_CENTER: L.LatLngExpression = [31.2304, 121.4737]

function createIcon(category: SamplePoint['category']) {
  const colors: Record<SamplePoint['category'], string> = {
    park: '#4caf50',
    metro: '#2196f3',
    market: '#ff9800',
    street: '#9c27b0',
    cafe: '#795548',
    school: '#e91e63',
    plaza: '#00bcd4',
  }

  const color = colors[category]

  return L.divIcon({
    className: 'sample-marker',
    html: `<div class="sample-marker__dot" style="background:${color};box-shadow:0 0 0 3px ${color}44"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function renderMarkers() {
  if (!map || !markerLayer) return

  markerLayer.clearLayers()

  props.points.forEach((point) => {
    const marker = L.marker([point.lat, point.lng], {
      icon: createIcon(point.category),
    })

    const popupHtml = `
      <div class="map-popup">
        <strong>${point.name}</strong>
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

:global(.sample-marker__dot) {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
}
</style>
