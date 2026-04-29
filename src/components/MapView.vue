<template>
  <div class="map-section" :class="{ 'map-playing': isPlaying }">
    <div id="map" ref="mapContainer"></div>
    <button
      class="follow-route-toggle"
      type="button"
      :class="{ active: followRoute }"
      :aria-pressed="followRoute"
      @click="followRoute = !followRoute"
    >
      跟随路线：{{ followRoute ? '开' : '关' }}
    </button>
    <!-- 冰霜覆盖滤镜 - P1: 环境视觉同步 -->
    <div 
      class="frost-overlay" 
      :class="{ active: showFrostOverlay }"
      :style="{ opacity: frostIntensity }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import { 
  napoleonAdvance, 
  napoleonRetreat, 
  schwarzenbergRoute,
  keyEvents,
  cityLabels,
  rivers 
} from '../stores/campaignData.js'
import { keyBattles } from '../stores/battlesData.js'
import { 
  currentTime,
  currentPhase,
  currentTemp,
  isPlaying
} from '../stores/globalState.js'

const router = useRouter()

const props = defineProps({
  currentChapter: Object,
  showAdvance: Boolean,
  showRetreat: Boolean,
  showSchwarzenberg: Boolean
})

const emit = defineEmits(['event-click'])

const mapContainer = ref(null)
const followRoute = ref(true)
let map = null
let lastPanAt = 0
const panThrottleMs = 700
const routeCache = {
  advance: napoleonAdvance.map(point => ({ ...point, timeMs: new Date(point.date).getTime() })),
  retreat: napoleonRetreat.map(point => ({ ...point, timeMs: new Date(point.date).getTime() }))
}
let layers = {
  advance: [],
  retreat: [],
  schwarzenberg: null,
  markers: [],
  cities: [],
  animatedPath: null,
  progressMarker: null
}

// P1: 冰霜覆盖效果 - 当温度降至0度以下时激活
const showFrostOverlay = computed(() => currentTemp.value < 0)
const frostIntensity = computed(() => {
  if (currentTemp.value >= 0) return 0
  // 温度越低，强度越高，最高0.5
  return Math.min(0.5, Math.abs(currentTemp.value) / 60)
})

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

function initMap() {
  map = L.map(mapContainer.value, {
    center: [55.0, 30.0],
    zoom: 5,
    minZoom: 4,
    maxZoom: 10,
    zoomControl: true,
    attributionControl: false
  })

  // Dark themed base map
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  // Draw elements
  drawRivers()
  drawAdvanceRoute()
  drawRetreatRoute()
  drawSchwarzenberRoute()
  drawCityLabels()
  drawEventMarkers()
}

function drawRivers() {
  rivers.forEach(river => {
    L.polyline(river.coords, {
      color: '#4A90D9',
      weight: 2,
      opacity: 0.4,
      dashArray: '5, 5'
    }).addTo(map)
  })
}

function drawAdvanceRoute() {
  // Draw with variable width based on troop count
  const maxTroops = napoleonAdvance[0].survivors
  
  for (let i = 0; i < napoleonAdvance.length - 1; i++) {
    const start = napoleonAdvance[i]
    const end = napoleonAdvance[i + 1]
    const width = Math.max(2, (start.survivors / maxTroops) * 12)
    
    const line = L.polyline(
      [[start.lat, start.lon], [end.lat, end.lon]],
      {
        color: '#D4A373',
        weight: width,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'animated-path advance-path'
      }
    ).addTo(map)
    
    // P1: 添加流光动画效果
    line.getElement()?.classList.add('flow-animation')
    
    layers.advance.push(line)
  }
  
  // P1: 创建进度标记
  createProgressMarker()
}

// P1: 创建当前位置标记
function createProgressMarker() {
  const icon = L.divIcon({
    className: 'progress-marker',
    html: `<div class="marker-pulse"></div><div class="marker-dot"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
  
  layers.progressMarker = L.marker([napoleonAdvance[0].lat, napoleonAdvance[0].lon], { 
    icon,
    zIndexOffset: 1000
  }).addTo(map)
}

// P0: 根据时间更新进度标记位置
function updateProgressMarker() {
  if (!layers.progressMarker) return

  const timeMs = currentTime.value.getTime()
  const phase = currentPhase.value
  const data = phase === 'retreat' ? routeCache.retreat : routeCache.advance

  let prev = data[0]
  let next = data[1] || data[0]

  for (let i = 0; i < data.length - 1; i++) {
    if (timeMs >= data[i].timeMs && timeMs <= data[i + 1].timeMs) {
      prev = data[i]
      next = data[i + 1]
      break
    }

    if (timeMs > data[i + 1].timeMs) {
      prev = data[i + 1]
      next = data[i + 2] || data[i + 1]
    }
  }

  const progress = next.timeMs > prev.timeMs
    ? (timeMs - prev.timeMs) / (next.timeMs - prev.timeMs)
    : 0
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const lat = prev.lat + (next.lat - prev.lat) * clampedProgress
  const lon = prev.lon + (next.lon - prev.lon) * clampedProgress

  layers.progressMarker.setLatLng([lat, lon])
}

function drawRetreatRoute() {
  const maxTroops = napoleonRetreat[0].survivors
  
  for (let i = 0; i < napoleonRetreat.length - 1; i++) {
    const start = napoleonRetreat[i]
    const end = napoleonRetreat[i + 1]
    const width = Math.max(1.5, (start.survivors / maxTroops) * 8)
    
    const line = L.polyline(
      [[start.lat, start.lon], [end.lat, end.lon]],
      {
        color: '#2D2D2D',
        weight: width,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }
    ).addTo(map)
    
    layers.retreat.push(line)
  }
}

function drawSchwarzenberRoute() {
  const coords = schwarzenbergRoute.map(p => [p.lat, p.lon])
  
  layers.schwarzenberg = L.polyline(coords, {
    color: '#2A9D8F',
    weight: 3,
    opacity: 0.7,
    dashArray: '10, 5',
    lineCap: 'round'
  }).addTo(map)
  
  // 为施瓦岑贝格军团添加战役标记
  const schwarzenbergBattles = [
    { name: '因科沃战役', location: [52.5, 26.0], date: '1812年8月8日' },
    { name: '戈罗杰奇诺战役', location: [52.2, 27.5], date: '1812年8月12日' }
  ]
  
  schwarzenbergBattles.forEach(battle => {
    const icon = L.divIcon({
      className: 'event-marker schwarzenberg-battle',
      html: `<span style="font-size: 18px; cursor: pointer;">⚔️</span>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
    
    const marker = L.marker(battle.location, { icon })
      .addTo(map)
      .on('click', () => {
        emit('event-click', {
          name: battle.name,
          date: battle.date,
          location: battle.location,
          type: 'battle',
          description: `施瓦岑贝格奥地利辅助军团（约34000人）在南翼的战役。`
        })
      })
    
    marker.bindTooltip(battle.name, {
      permanent: false,
      direction: 'top',
      className: 'event-tooltip'
    })
    
    layers.markers.push(marker)
  })
}

function drawCityLabels() {
  cityLabels.forEach(city => {
    const icon = L.divIcon({
      className: 'city-marker',
      html: `<span>${city.name}</span>`,
      iconSize: null
    })
    
    const marker = L.marker([city.lat, city.lon], { icon }).addTo(map)
    layers.cities.push(marker)
  })
}

function drawEventMarkers() {
  keyEvents.forEach(event => {
    let emoji = '📍'
    
    switch (event.type) {
      case 'battle': emoji = '⚔️'; break
      case 'cold': emoji = '❄️'; break
      case 'city': emoji = '🏛️'; break
      case 'start': emoji = '🚩'; break
      case 'end': emoji = '🏁'; break
      case 'retreat': emoji = '↩️'; break
      case 'disaster': emoji = '🔥'; break
      case 'event': emoji = '👤'; break
    }
    
    // 检查是否有对应的战役详情页
    const battleInfo = findBattleByEvent(event)
    const hasBattlePage = !!battleInfo
    
    const icon = L.divIcon({
      className: 'event-marker' + (hasBattlePage ? ' clickable-battle' : ''),
      html: `<span style="font-size: 22px; cursor: pointer;">${emoji}</span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
    
    const marker = L.marker(event.location, { icon })
      .addTo(map)
      .on('click', () => {
        if (hasBattlePage) {
          // 跳转到战役详情页
          router.push(`/battle/${battleInfo.id}`)
        } else {
          emit('event-click', event)
        }
      })
    
    marker.bindTooltip(event.name + (hasBattlePage ? ' (点击查看详情)' : ''), {
      permanent: false,
      direction: 'top',
      className: 'event-tooltip'
    })
    
    layers.markers.push(marker)
  })
}

// 根据事件查找对应的战役
function findBattleByEvent(event) {
  if (event.type !== 'battle') return null
  
  // 通过名称或位置匹配战役
  const eventNameLower = event.name.toLowerCase()
  const eventNameCn = event.name
  
  return keyBattles.find(battle => {
    const titleLower = battle.title.toLowerCase()
    const titleEnLower = battle.titleEn.toLowerCase()
    
    // 名称匹配
    if (eventNameCn.includes(battle.title.replace('战役', '').replace('攻城战', '').replace('渡河战', '').replace('遭遇战', '').replace('阻击战', ''))) {
      return true
    }
    if (eventNameLower.includes(titleEnLower.replace('battle of ', '').replace(' (august)', '').replace(' (november)', ''))) {
      return true
    }
    
    // 位置匹配
    if (battle.location && event.location) {
      const latDiff = Math.abs(battle.location.lat - event.location[0])
      const lonDiff = Math.abs(battle.location.lon - event.location[1])
      if (latDiff < 0.5 && lonDiff < 0.5) {
        return true
      }
    }
    
    return false
  })
}

// Public method to fly to location
function flyTo(location, zoom = 6) {
  if (map) {
    map.flyTo(location, zoom, { duration: 1.5 })
  }
}

// Watch visibility toggles
watch(() => props.showAdvance, (show) => {
  layers.advance.forEach(line => {
    line.setStyle({ opacity: show ? 0.85 : 0 })
  })
})

watch(() => props.showRetreat, (show) => {
  layers.retreat.forEach(line => {
    line.setStyle({ opacity: show ? 0.9 : 0 })
  })
})

watch(() => props.showSchwarzenberg, (show) => {
  if (layers.schwarzenberg) {
    layers.schwarzenberg.setStyle({ opacity: show ? 0.7 : 0 })
  }
})

// P0: 监听全局时间变化，更新进度标记和地图视角
watch(currentTime, () => {
  updateProgressMarker()

  if (!map || !layers.progressMarker || !followRoute.value) return

  const now = performance.now()
  if (now - lastPanAt < panThrottleMs) return

  const latlng = layers.progressMarker.getLatLng()
  const currentCenter = map.getCenter()
  const distance = currentCenter.distanceTo(latlng)

  if (distance > 50000) {
    lastPanAt = now
    map.panTo(latlng, { duration: 0.5, animate: true })
  }
}, { immediate: true })

// Expose methods
defineExpose({ flyTo, updateProgressMarker })
</script>

<style scoped>
.map-section {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

#map {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
}

.follow-route-toggle {
  position: absolute;
  top: 80px;
  right: 18px;
  z-index: 500;
  padding: 8px 12px;
  background: rgba(0,0,0,0.78);
  border: 1px solid rgba(212, 163, 115, 0.45);
  border-radius: 999px;
  color: #F5F0E6;
  font-family: 'Noto Serif SC', serif;
  font-size: 0.78rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.follow-route-toggle.active {
  color: #D4A373;
  box-shadow: 0 0 10px rgba(212, 163, 115, 0.25);
}

.follow-route-toggle:focus-visible {
  outline: 2px solid #D4A373;
  outline-offset: 2px;
}

/* P1: 冰霜覆盖滤镜 */
.frost-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(
    135deg,
    rgba(74, 144, 217, 0.1) 0%,
    rgba(150, 200, 240, 0.15) 50%,
    rgba(74, 144, 217, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 1s ease;
}

.frost-overlay.active {
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(200, 220, 255, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(180, 210, 255, 0.25) 0%, transparent 50%),
    linear-gradient(135deg, rgba(74, 144, 217, 0.2) 0%, rgba(150, 200, 240, 0.25) 100%);
}

/* P1: 进度标记动画 */
:deep(.progress-marker) {
  pointer-events: none;
}

:deep(.marker-dot) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #D4A373;
  border: 3px solid #F5F0E6;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(212, 163, 115, 0.8);
}

:deep(.marker-pulse) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: rgba(212, 163, 115, 0.4);
  border-radius: 50%;
  animation: pulse 2s infinite;
  animation-play-state: paused;
}

.map-playing :deep(.marker-pulse) {
  animation-play-state: running;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

/* P1: 路径流光动画 */
:deep(.animated-path) {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
}

:deep(.flow-animation) {
  animation: flowPath 3s linear infinite;
  animation-play-state: paused;
}

.map-playing :deep(.flow-animation) {
  animation-play-state: running;
}

@keyframes flowPath {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

:deep(.city-marker) {
  font-family: 'Playfair Display', serif;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.8);
  text-shadow: 0 0 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7);
  white-space: nowrap;
  pointer-events: none;
}

:deep(.event-marker) {
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  transition: transform 0.2s ease;
}

:deep(.event-marker:hover) {
  transform: scale(1.3);
}

:deep(.event-marker.clickable-battle) {
  filter: drop-shadow(0 0 8px rgba(192, 57, 43, 0.8));
}

:deep(.event-marker.clickable-battle:hover) {
  transform: scale(1.5);
  filter: drop-shadow(0 0 12px rgba(192, 57, 43, 1));
}

:deep(.event-tooltip) {
  background: rgba(0,0,0,0.9);
  border: 1px solid rgba(255,255,255,0.2);
  color: #F5F0E6;
  font-family: 'Noto Serif SC', serif;
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 4px;
}

:deep(.leaflet-control-zoom) {
  border: none !important;
}

:deep(.leaflet-control-zoom a) {
  background: rgba(0,0,0,0.8) !important;
  color: #F5F0E6 !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
}

@media (prefers-reduced-motion: reduce) {
  :deep(.marker-pulse),
  :deep(.flow-animation) {
    animation: none;
  }

  .frost-overlay {
    transition: none;
  }
}
</style>
