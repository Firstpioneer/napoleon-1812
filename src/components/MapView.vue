<template>
  <div class="map-section">
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import L from 'leaflet'
import { 
  napoleonAdvance, 
  napoleonRetreat, 
  schwarzenbergRoute,
  keyEvents,
  cityLabels,
  rivers 
} from '../stores/campaignData.js'

const props = defineProps({
  currentChapter: Object,
  showAdvance: Boolean,
  showRetreat: Boolean,
  showSchwarzenberg: Boolean
})

const emit = defineEmits(['event-click'])

const mapContainer = ref(null)
let map = null
let layers = {
  advance: [],
  retreat: [],
  schwarzenberg: null,
  markers: [],
  cities: []
}

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
    const width = Math.max(3, (start.survivors / maxTroops) * 20)
    
    const line = L.polyline(
      [[start.lat, start.lon], [end.lat, end.lon]],
      {
        color: '#D4A373',
        weight: width,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }
    ).addTo(map)
    
    layers.advance.push(line)
  }
}

function drawRetreatRoute() {
  const maxTroops = napoleonRetreat[0].survivors
  
  for (let i = 0; i < napoleonRetreat.length - 1; i++) {
    const start = napoleonRetreat[i]
    const end = napoleonRetreat[i + 1]
    const width = Math.max(2, (start.survivors / maxTroops) * 12)
    
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
    weight: 5,
    opacity: 0.7,
    dashArray: '10, 5',
    lineCap: 'round'
  }).addTo(map)
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
    
    const icon = L.divIcon({
      className: 'event-marker',
      html: `<span style="font-size: 22px; cursor: pointer;">${emoji}</span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
    
    const marker = L.marker(event.location, { icon })
      .addTo(map)
      .on('click', () => {
        emit('event-click', event)
      })
    
    marker.bindTooltip(event.name, {
      permanent: false,
      direction: 'top',
      className: 'event-tooltip'
    })
    
    layers.markers.push(marker)
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

// Expose methods
defineExpose({ flyTo })
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
</style>
