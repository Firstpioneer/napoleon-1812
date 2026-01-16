<template>
  <div class="dashboard-page">
    <!-- 顶部统计卡片 -->
    <header class="stats-header">
      <div class="stat-card">
        <div class="stat-value">{{ formatNumber(currentStats.troops) }}</div>
        <div class="stat-label">当前兵力</div>
      </div>
      <div class="stat-card">
        <div class="stat-value highlight-loss">-{{ formatNumber(422000 - currentStats.troops) }}</div>
        <div class="stat-label">累计损失</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="{ 'highlight-cold': currentStats.temp < 0 }">
          {{ currentStats.temp !== null ? currentStats.temp + '°C' : '--' }}
        </div>
        <div class="stat-label">温度</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ currentStats.day }}</div>
        <div class="stat-label">第N天</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ currentStats.phase }}</div>
        <div class="stat-label">阶段</div>
      </div>
      <router-link to="/visualization" class="nav-link">← 返回叙事版</router-link>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：兵力曲线图 -->
      <aside class="left-panel">
        <div class="panel-title">兵力变化</div>
        <div class="troops-chart" ref="troopsChartRef"></div>
      </aside>

      <!-- 中央：地图 -->
      <main class="map-container">
        <div id="dashboard-map" ref="mapRef"></div>
        <!-- 悬停信息卡 -->
        <div 
          v-if="hoverInfo" 
          class="hover-card"
          :style="{ left: hoverInfo.x + 'px', top: hoverInfo.y + 'px' }"
        >
          <div class="hover-title">{{ hoverInfo.city || hoverInfo.event || '行军中' }}</div>
          <div class="hover-date">{{ hoverInfo.date }}</div>
          <div class="hover-stat">兵力: {{ formatNumber(hoverInfo.troops) }}</div>
          <div class="hover-stat" v-if="hoverInfo.temp !== null">温度: {{ hoverInfo.temp }}°C</div>
        </div>
      </main>

      <!-- 右侧：战役列表（可折叠） -->
      <aside class="right-panel" :class="{ collapsed: rightPanelCollapsed, hidden: rightPanelHidden }">
        <!-- 折叠按钮 -->
        <button class="panel-toggle-btn" @click="rightPanelCollapsed = !rightPanelCollapsed" v-show="!rightPanelHidden">
          {{ toggleIcon }}
        </button>
        
        <div class="panel-content" v-show="!rightPanelCollapsed && !rightPanelHidden">
          <!-- 选区统计信息 -->
          <div v-if="brushSelection" class="selection-stats">
            <div class="panel-title">
              选区统计
              <button class="clear-selection-btn" @click="clearBrushSelection">清除</button>
            </div>
            <div class="selection-info">
              <div class="selection-stat">
                <span class="label">时间范围</span>
                <span class="value">{{ brushSelection.startDate }} ~ {{ brushSelection.endDate }}</span>
              </div>
              <div class="selection-stat">
                <span class="label">起始兵力</span>
                <span class="value troops">{{ formatNumber(brushSelection.startTroops) }}</span>
              </div>
              <div class="selection-stat">
                <span class="label">结束兵力</span>
                <span class="value troops">{{ formatNumber(brushSelection.endTroops) }}</span>
              </div>
              <div class="selection-stat">
                <span class="label">兵力损失</span>
                <span class="value loss">-{{ formatNumber(brushSelection.startTroops - brushSelection.endTroops) }}</span>
              </div>
              <div class="selection-stat">
                <span class="label">损失率</span>
                <span class="value loss">{{ ((brushSelection.startTroops - brushSelection.endTroops) / brushSelection.startTroops * 100).toFixed(1) }}%</span>
              </div>
              <div class="selection-stat" v-if="brushSelection.minTemp !== null">
                <span class="label">温度范围</span>
                <span class="value temp">{{ brushSelection.minTemp }}°C ~ {{ brushSelection.maxTemp }}°C</span>
              </div>
            </div>
          </div>
          <div class="panel-title">
            关键战役
            <button class="close-panel-btn" @click="rightPanelHidden = true">×</button>
          </div>
          <div class="battles-list">
            <div 
              v-for="battle in keyBattlesList" 
              :key="battle.id"
              class="battle-item"
              :class="{ active: selectedBattle?.id === battle.id, [battle.phase]: true }"
              @click="selectBattle(battle)"
              @mouseenter="highlightBattle(battle)"
              @mouseleave="unhighlightBattle()"
            >
              <div class="battle-icon">{{ getBattleIcon(battle.type) }}</div>
              <div class="battle-info">
                <div class="battle-name">{{ battle.title }}</div>
                <div class="battle-date">{{ battle.date }}</div>
              </div>
              <div class="battle-troops">{{ formatNumber(battle.stats?.frenchTroops || 0) }}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 底部：温度图 + 时间轴 -->
    <footer class="bottom-panel">
      <div class="temp-chart" ref="tempChartRef"></div>
      <div class="timeline-control">
        <button class="control-btn" @click="togglePlay">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="control-btn" @click="resetTimeline">⏮</button>
        <input 
          type="range" 
          class="timeline-slider"
          :min="0" 
          :max="timelineData.length - 1" 
          v-model="currentIndex"
          @input="onTimelineChange"
        />
        <span class="timeline-date">{{ currentDateDisplay }}</span>
      </div>
    </footer>

    <!-- 战役详情弹窗 -->
    <div v-if="selectedBattle" class="battle-modal" @click.self="selectedBattle = null">
      <div class="modal-content">
        <button class="modal-close" @click="selectedBattle = null">×</button>
        <h2>{{ selectedBattle.title }}</h2>
        <p class="modal-subtitle">{{ selectedBattle.titleEn }} | {{ selectedBattle.date }}</p>
        <p class="modal-overview">{{ selectedBattle.overview }}</p>
        <div class="modal-stats">
          <div class="modal-stat">
            <span class="stat-label">法军兵力</span>
            <span class="stat-value">{{ formatNumber(selectedBattle.stats?.frenchTroops || 0) }}</span>
          </div>
          <div class="modal-stat">
            <span class="stat-label">俄军兵力</span>
            <span class="stat-value">{{ formatNumber(selectedBattle.stats?.russianTroops || 0) }}</span>
          </div>
          <div class="modal-stat" v-if="selectedBattle.stats?.frenchCasualties">
            <span class="stat-label">法军伤亡</span>
            <span class="stat-value loss">{{ formatNumber(selectedBattle.stats.frenchCasualties) }}</span>
          </div>
          <div class="modal-stat" v-if="selectedBattle.stats?.russianCasualties">
            <span class="stat-label">俄军伤亡</span>
            <span class="stat-value loss">{{ formatNumber(selectedBattle.stats.russianCasualties) }}</span>
          </div>
        </div>
        <router-link 
          :to="`/battle/${selectedBattle.id}`" 
          class="modal-detail-link"
        >
          查看详细介绍 →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import L from 'leaflet'
import { napoleonAdvance, napoleonRetreat, schwarzenbergRoute, temperatureData } from '../stores/campaignData.js'
import { keyBattles } from '../stores/battlesData.js'

// Refs
const mapRef = ref(null)
const troopsChartRef = ref(null)
const tempChartRef = ref(null)
const currentIndex = ref(0)
const isPlaying = ref(false)
const selectedBattle = ref(null)
const hoverInfo = ref(null)
const highlightedPoint = ref(null)
const brushSelection = ref(null)
const brushRange = ref(null)
const rightPanelCollapsed = ref(false)
const rightPanelHidden = ref(false)
const isMobile = ref(false)

let map = null
let routeSegments = { advance: [], retreat: [] }
let highlightLayer = null
let playInterval = null
let troopsSvg = null
let tempSvg = null
let markers = { advance: [], retreat: [], battles: [], progressMarker: null }

// 检测是否为手机端
function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

// 折叠按钮图标
const toggleIcon = computed(() => {
  if (isMobile.value) {
    return rightPanelCollapsed.value ? '▲' : '▼'
  }
  return rightPanelCollapsed.value ? '◀' : '▶'
})

// 合并进攻和撤退数据形成完整时间线
const timelineData = computed(() => {
  const advance = napoleonAdvance.map(p => ({ ...p, phase: 'advance' }))
  const retreat = napoleonRetreat.slice(1).map(p => ({ ...p, phase: 'retreat' }))
  return [...advance, ...retreat]
})

// 关键战役列表
const keyBattlesList = computed(() => {
  return keyBattles.filter(b => 
    ['battle', 'major_battle', 'siege'].includes(b.type)
  )
})

// 当前状态
const currentStats = computed(() => {
  const point = timelineData.value[currentIndex.value]
  if (!point) return { troops: 422000, temp: null, day: 1, phase: '进攻' }
  
  const startDate = new Date('1812-06-24')
  const currentDate = new Date(point.date)
  const day = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  
  // 查找对应温度
  const tempRecord = temperatureData.find(t => t.date === point.date) ||
    temperatureData.reduce((prev, curr) => {
      const currDate = new Date(curr.date)
      const pointDate = new Date(point.date)
      if (currDate <= pointDate) return curr
      return prev
    }, temperatureData[0])
  
  return {
    troops: point.survivors,
    temp: tempRecord?.temp ?? null,
    day,
    phase: point.phase === 'advance' ? '进攻' : '撤退'
  }
})

const currentDateDisplay = computed(() => {
  const point = timelineData.value[currentIndex.value]
  return point?.date || '1812-06-24'
})

// 格式化数字
function formatNumber(num) {
  if (num >= 1000) return Math.round(num / 1000) + 'k'
  return num
}

// 获取战役图标
function getBattleIcon(type) {
  const icons = {
    battle: '⚔️',
    major_battle: '🔥',
    siege: '🏰',
    city: '🏛️',
    start: '🚩',
    end: '🏁',
    event: '📍',
    disaster: '💀'
  }
  return icons[type] || '📍'
}

// 初始化地图
function initMap() {
  map = L.map(mapRef.value, {
    center: [54.5, 30.0],
    zoom: 5,
    minZoom: 4,
    maxZoom: 10,
    zoomControl: false,
    attributionControl: false
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  drawRoutes()
  drawBattleMarkers()
  createProgressMarker()
}

// 绘制路线
function drawRoutes() {
  const maxTroops = napoleonAdvance[0].survivors
  routeSegments = { advance: [], retreat: [] }

  // 进攻路线
  for (let i = 0; i < napoleonAdvance.length - 1; i++) {
    const start = napoleonAdvance[i]
    const end = napoleonAdvance[i + 1]
    const width = Math.max(2, (start.survivors / maxTroops) * 10)

    const segment = L.polyline([[start.lat, start.lon], [end.lat, end.lon]], {
      color: '#D4A373',
      weight: width,
      opacity: 0.8,
      lineCap: 'round'
    }).addTo(map)
    routeSegments.advance.push({ segment, index: i, start, end })
  }

  // 撤退路线
  const maxRetreat = napoleonRetreat[0].survivors
  for (let i = 0; i < napoleonRetreat.length - 1; i++) {
    const start = napoleonRetreat[i]
    const end = napoleonRetreat[i + 1]
    const width = Math.max(1.5, (start.survivors / maxRetreat) * 6)

    const segment = L.polyline([[start.lat, start.lon], [end.lat, end.lon]], {
      color: '#2D2D2D',
      weight: width,
      opacity: 0.9,
      lineCap: 'round'
    }).addTo(map)
    routeSegments.retreat.push({ segment, index: i + napoleonAdvance.length - 1, start, end })
  }

  // 施瓦岑贝格路线
  const schwarzenbergCoords = schwarzenbergRoute.map(p => [p.lat, p.lon])
  L.polyline(schwarzenbergCoords, {
    color: '#2A9D8F',
    weight: 2,
    opacity: 0.6,
    dashArray: '8, 4'
  }).addTo(map)
  
  // 创建高亮图层
  highlightLayer = L.layerGroup().addTo(map)
}

// 绘制战役标记
function drawBattleMarkers() {
  keyBattles.forEach(battle => {
    const icon = L.divIcon({
      className: 'battle-marker',
      html: `<span class="marker-icon">${getBattleIcon(battle.type)}</span>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    const marker = L.marker([battle.location.lat, battle.location.lon], { icon })
      .addTo(map)
      .on('click', () => selectBattle(battle))

    marker.bindTooltip(battle.title, {
      permanent: false,
      direction: 'top',
      className: 'battle-tooltip'
    })

    markers.battles.push({ marker, battle })
  })
}

// 创建进度标记
function createProgressMarker() {
  const icon = L.divIcon({
    className: 'progress-marker',
    html: '<div class="marker-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  markers.progressMarker = L.marker([napoleonAdvance[0].lat, napoleonAdvance[0].lon], {
    icon,
    zIndexOffset: 1000
  }).addTo(map)
}

// 更新进度标记位置
function updateProgressMarker() {
  const point = timelineData.value[currentIndex.value]
  if (point && markers.progressMarker) {
    markers.progressMarker.setLatLng([point.lat, point.lon])
  }
}

// 初始化兵力图表
function initTroopsChart() {
  const container = troopsChartRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  const margin = { top: 20, right: 20, bottom: 30, left: 50 }

  troopsSvg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const data = timelineData.value

  const xScale = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([margin.left, width - margin.right])

  const yScale = d3.scaleLinear()
    .domain([0, 450000])
    .range([height - margin.bottom, margin.top])

  // 面积图
  const area = d3.area()
    .x((d, i) => xScale(i))
    .y0(height - margin.bottom)
    .y1(d => yScale(d.survivors))
    .curve(d3.curveMonotoneX)

  // 渐变
  const gradient = troopsSvg.append('defs')
    .append('linearGradient')
    .attr('id', 'troops-gradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%')

  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#D4A373').attr('stop-opacity', 0.8)
  gradient.append('stop').attr('offset', '100%').attr('stop-color', '#D4A373').attr('stop-opacity', 0.1)

  troopsSvg.append('path')
    .datum(data)
    .attr('class', 'troops-area')
    .attr('fill', 'url(#troops-gradient)')
    .attr('d', area)

  // 线条
  const line = d3.line()
    .x((d, i) => xScale(i))
    .y(d => yScale(d.survivors))
    .curve(d3.curveMonotoneX)

  troopsSvg.append('path')
    .datum(data)
    .attr('class', 'troops-line')
    .attr('fill', 'none')
    .attr('stroke', '#D4A373')
    .attr('stroke-width', 2)
    .attr('d', line)

  // 高亮选区
  troopsSvg.append('rect')
    .attr('class', 'troops-highlight')
    .attr('fill', 'rgba(212, 163, 115, 0.3)')
    .attr('stroke', '#D4A373')
    .attr('stroke-width', 2)
    .attr('display', 'none')

  // Y轴
  troopsSvg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d / 1000 + 'k'))
    .attr('color', 'rgba(255,255,255,0.5)')

  // 当前位置指示线
  troopsSvg.append('line')
    .attr('class', 'indicator-line')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,4')

  // 当前点
  troopsSvg.append('circle')
    .attr('class', 'indicator-dot')
    .attr('r', 6)
    .attr('fill', '#D4A373')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)

  // 添加brush
  const brush = d3.brushX()
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on('brush', (event) => onTroopsBrush(event, xScale, data))
    .on('end', (event) => onTroopsBrushEnd(event, xScale, data))

  troopsSvg.append('g')
    .attr('class', 'troops-brush')
    .call(brush)

  updateTroopsChart()
}

// 更新兵力图表
function updateTroopsChart() {
  if (!troopsSvg) return
  
  const container = troopsChartRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  const margin = { top: 20, right: 20, bottom: 30, left: 50 }

  const data = timelineData.value
  const xScale = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([margin.left, width - margin.right])

  const yScale = d3.scaleLinear()
    .domain([0, 450000])
    .range([height - margin.bottom, margin.top])

  const x = xScale(currentIndex.value)
  const y = yScale(data[currentIndex.value].survivors)

  troopsSvg.select('.indicator-line')
    .attr('x1', x).attr('y1', margin.top)
    .attr('x2', x).attr('y2', height - margin.bottom)

  troopsSvg.select('.indicator-dot')
    .attr('cx', x).attr('cy', y)
}

// 初始化温度图表
function initTempChart() {
  const container = tempChartRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  const margin = { top: 10, right: 30, bottom: 25, left: 50 }

  tempSvg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const data = temperatureData

  const xScale = d3.scaleLinear()
    .domain([24, 38])
    .range([margin.left, width - margin.right])

  const yScale = d3.scaleLinear()
    .domain([-40, 30])
    .range([height - margin.bottom, margin.top])

  // 零度线
  tempSvg.append('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', yScale(0))
    .attr('y2', yScale(0))
    .attr('stroke', 'rgba(255,255,255,0.3)')
    .attr('stroke-dasharray', '4,4')

  // 温度线
  const line = d3.line()
    .x(d => xScale(d.lon))
    .y(d => yScale(d.temp))
    .curve(d3.curveMonotoneX)

  tempSvg.append('path')
    .datum(data)
    .attr('class', 'temp-line')
    .attr('fill', 'none')
    .attr('stroke', '#4A90D9')
    .attr('stroke-width', 2)
    .attr('d', line)

  // 高亮选区（用于显示从兵力图同步过来的选区）
  tempSvg.append('rect')
    .attr('class', 'temp-highlight')
    .attr('fill', 'rgba(74, 144, 217, 0.3)')
    .attr('stroke', '#4A90D9')
    .attr('stroke-width', 2)
    .attr('display', 'none')

  // 数据点
  tempSvg.selectAll('.temp-dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'temp-dot')
    .attr('cx', d => xScale(d.lon))
    .attr('cy', d => yScale(d.temp))
    .attr('r', 4)
    .attr('fill', d => d.temp < 0 ? '#4A90D9' : '#E67E22')

  // X轴 (经度)
  tempSvg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(7).tickFormat(d => d + '°E'))
    .attr('color', 'rgba(255,255,255,0.5)')

  // Y轴 (温度)
  tempSvg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + '°C'))
    .attr('color', 'rgba(255,255,255,0.5)')

  // 当前位置指示
  tempSvg.append('line')
    .attr('class', 'temp-indicator')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,4')

  // 提示文字
  tempSvg.append('text')
    .attr('class', 'temp-hint')
    .attr('x', width - margin.right - 5)
    .attr('y', margin.top + 12)
    .attr('text-anchor', 'end')
    .attr('fill', 'rgba(255,255,255,0.4)')
    .attr('font-size', '10px')
    .text('从兵力图框选同步')

  updateTempChart()
}

// 更新温度图表
function updateTempChart() {
  if (!tempSvg) return

  const container = tempChartRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  const margin = { top: 10, right: 30, bottom: 25, left: 50 }

  const point = timelineData.value[currentIndex.value]
  const xScale = d3.scaleLinear()
    .domain([24, 38])
    .range([margin.left, width - margin.right])

  const x = xScale(point.lon)

  tempSvg.select('.temp-indicator')
    .attr('x1', x).attr('y1', margin.top)
    .attr('x2', x).attr('y2', height - margin.bottom)
}

// 播放控制
function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    playInterval = setInterval(() => {
      if (currentIndex.value < timelineData.value.length - 1) {
        currentIndex.value++
      } else {
        isPlaying.value = false
        clearInterval(playInterval)
      }
    }, 200)
  } else {
    clearInterval(playInterval)
  }
}

function resetTimeline() {
  isPlaying.value = false
  clearInterval(playInterval)
  currentIndex.value = 0
}

function onTimelineChange() {
  updateProgressMarker()
  updateTroopsChart()
  updateTempChart()
}

// 战役交互
function selectBattle(battle) {
  selectedBattle.value = battle
  if (map) {
    map.flyTo([battle.location.lat, battle.location.lon], 7, { duration: 0.5 })
  }
}

function highlightBattle(battle) {
  const markerObj = markers.battles.find(m => m.battle.id === battle.id)
  if (markerObj) {
    markerObj.marker.openTooltip()
  }
}

function unhighlightBattle() {
  markers.battles.forEach(m => m.marker.closeTooltip())
}

// Brush处理 - 兵力图表
function onTroopsBrush(event, xScale, data) {
  if (!event.selection) return
  const [x0, x1] = event.selection
  const startIdx = Math.round(xScale.invert(x0))
  const endIdx = Math.round(xScale.invert(x1))
  brushRange.value = { startIdx, endIdx }
  updateHighlights(startIdx, endIdx, data)
}

function onTroopsBrushEnd(event, xScale, data) {
  if (!event.selection) {
    clearBrushSelection()
    return
  }
  const [x0, x1] = event.selection
  const startIdx = Math.max(0, Math.round(xScale.invert(x0)))
  const endIdx = Math.min(data.length - 1, Math.round(xScale.invert(x1)))
  
  if (startIdx === endIdx) {
    clearBrushSelection()
    return
  }
  
  brushRange.value = { startIdx, endIdx }
  updateBrushSelection(startIdx, endIdx, data)
  updateHighlights(startIdx, endIdx, data)
  updateTempChartHighlight(startIdx, endIdx, data)
}

// Brush处理 - 温度图表
function onTempBrush(event, xScale, data) {
  if (!event.selection) return
  const [x0, x1] = event.selection
  const startLon = xScale.invert(x0)
  const endLon = xScale.invert(x1)
  
  const timelinePoints = timelineData.value
  let startIdx = 0, endIdx = timelinePoints.length - 1
  
  for (let i = 0; i < timelinePoints.length; i++) {
    if (timelinePoints[i].lon >= startLon && startIdx === 0) startIdx = i
    if (timelinePoints[i].lon <= endLon) endIdx = i
  }
  
  brushRange.value = { startIdx, endIdx }
  updateHighlights(startIdx, endIdx, timelinePoints)
}

function onTempBrushEnd(event, xScale, data) {
  if (!event.selection) {
    clearBrushSelection()
    return
  }
  const [x0, x1] = event.selection
  const startLon = xScale.invert(x0)
  const endLon = xScale.invert(x1)
  
  const timelinePoints = timelineData.value
  let startIdx = 0, endIdx = timelinePoints.length - 1
  
  for (let i = 0; i < timelinePoints.length; i++) {
    if (timelinePoints[i].lon >= startLon && startIdx === 0) startIdx = i
    if (timelinePoints[i].lon <= endLon) endIdx = i
  }
  
  if (startIdx >= endIdx) {
    clearBrushSelection()
    return
  }
  
  brushRange.value = { startIdx, endIdx }
  updateBrushSelection(startIdx, endIdx, timelinePoints)
  updateHighlights(startIdx, endIdx, timelinePoints)
  updateTroopsChartHighlight(startIdx, endIdx, timelinePoints)
}

// 新的温度图brush处理（使用时间索引）
function onTempBrushNew(event, xScale, data) {
  if (!event.selection) return
  const [x0, x1] = event.selection
  const startIdx = Math.round(xScale.invert(x0))
  const endIdx = Math.round(xScale.invert(x1))
  brushRange.value = { startIdx, endIdx }
  updateHighlights(startIdx, endIdx, data)
}

function onTempBrushEndNew(event, xScale, data) {
  if (!event.selection) {
    clearBrushSelection()
    return
  }
  const [x0, x1] = event.selection
  const startIdx = Math.max(0, Math.round(xScale.invert(x0)))
  const endIdx = Math.min(data.length - 1, Math.round(xScale.invert(x1)))
  
  if (startIdx === endIdx) {
    clearBrushSelection()
    return
  }
  
  brushRange.value = { startIdx, endIdx }
  updateBrushSelection(startIdx, endIdx, data)
  updateHighlights(startIdx, endIdx, data)
  updateTroopsChartHighlight(startIdx, endIdx, data)
}

// 更新选区统计数据
function updateBrushSelection(startIdx, endIdx, data) {
  const startPoint = data[startIdx]
  const endPoint = data[endIdx]
  
  // 获取温度范围
  const selectedPoints = data.slice(startIdx, endIdx + 1)
  let minTemp = null, maxTemp = null
  
  selectedPoints.forEach(p => {
    const tempRecord = temperatureData.find(t => t.date === p.date) ||
      temperatureData.reduce((prev, curr) => {
        const currDate = new Date(curr.date)
        const pointDate = new Date(p.date)
        if (currDate <= pointDate) return curr
        return prev
      }, temperatureData[0])
    
    if (tempRecord && tempRecord.temp !== null) {
      if (minTemp === null || tempRecord.temp < minTemp) minTemp = tempRecord.temp
      if (maxTemp === null || tempRecord.temp > maxTemp) maxTemp = tempRecord.temp
    }
  })
  
  brushSelection.value = {
    startDate: startPoint.date,
    endDate: endPoint.date,
    startTroops: startPoint.survivors,
    endTroops: endPoint.survivors,
    minTemp,
    maxTemp,
    startIdx,
    endIdx
  }
}

// 清除选区
function clearBrushSelection() {
  brushSelection.value = null
  brushRange.value = null
  
  // 清除地图高亮
  if (highlightLayer) highlightLayer.clearLayers()
  
  // 重置路线透明度
  routeSegments.advance.forEach(s => s.segment.setStyle({ opacity: 0.8 }))
  routeSegments.retreat.forEach(s => s.segment.setStyle({ opacity: 0.9 }))
  
  // 清除图表高亮
  if (troopsSvg) {
    troopsSvg.select('.troops-highlight').attr('display', 'none')
    troopsSvg.select('.troops-brush').call(d3.brushX().move, null)
  }
  if (tempSvg) {
    tempSvg.select('.temp-highlight').attr('display', 'none')
  }
}

// 更新高亮显示
function updateHighlights(startIdx, endIdx, data) {
  if (!highlightLayer) return
  highlightLayer.clearLayers()
  
  // 降低非选中路线的透明度
  routeSegments.advance.forEach(s => {
    if (s.index >= startIdx && s.index < endIdx) {
      s.segment.setStyle({ opacity: 1 })
    } else {
      s.segment.setStyle({ opacity: 0.2 })
    }
  })
  
  const retreatStartIdx = napoleonAdvance.length - 1
  routeSegments.retreat.forEach(s => {
    const actualIdx = s.index
    if (actualIdx >= startIdx && actualIdx < endIdx) {
      s.segment.setStyle({ opacity: 1 })
    } else {
      s.segment.setStyle({ opacity: 0.2 })
    }
  })
  
  // 在地图上绘制高亮路线
  const highlightCoords = []
  for (let i = startIdx; i <= endIdx && i < data.length; i++) {
    highlightCoords.push([data[i].lat, data[i].lon])
  }
  
  if (highlightCoords.length > 1) {
    L.polyline(highlightCoords, {
      color: '#FFD700',
      weight: 6,
      opacity: 0.8,
      lineCap: 'round'
    }).addTo(highlightLayer)
    
    // 添加起点和终点标记
    L.circleMarker(highlightCoords[0], {
      radius: 8,
      fillColor: '#00FF00',
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).addTo(highlightLayer)
    
    L.circleMarker(highlightCoords[highlightCoords.length - 1], {
      radius: 8,
      fillColor: '#FF4444',
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).addTo(highlightLayer)
  }
}

// 更新温度图表高亮
function updateTempChartHighlight(startIdx, endIdx, data) {
  if (!tempSvg) return
  
  const container = tempChartRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  const margin = { top: 10, right: 30, bottom: 25, left: 50 }
  
  const xScale = d3.scaleLinear()
    .domain([24, 38])
    .range([margin.left, width - margin.right])
  
  // 获取选区的经度范围
  const startLon = data[startIdx].lon
  const endLon = data[endIdx].lon
  const x0 = xScale(Math.min(startLon, endLon))
  const x1 = xScale(Math.max(startLon, endLon))
  
  tempSvg.select('.temp-highlight')
    .attr('x', x0)
    .attr('y', margin.top)
    .attr('width', Math.max(x1 - x0, 4))
    .attr('height', height - margin.top - margin.bottom)
    .attr('display', 'block')
}

// 更新兵力图表高亮
function updateTroopsChartHighlight(startIdx, endIdx, data) {
  if (!troopsSvg) return
  
  const container = troopsChartRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  const margin = { top: 20, right: 20, bottom: 30, left: 50 }
  
  const xScale = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([margin.left, width - margin.right])
  
  const x0 = xScale(startIdx)
  const x1 = xScale(endIdx)
  
  troopsSvg.select('.troops-highlight')
    .attr('x', x0)
    .attr('y', margin.top)
    .attr('width', x1 - x0)
    .attr('height', height - margin.top - margin.bottom)
    .attr('display', 'block')
}

// 监听索引变化
watch(currentIndex, () => {
  updateProgressMarker()
  updateTroopsChart()
  updateTempChart()
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  initMap()
  setTimeout(() => {
    initTroopsChart()
    initTempChart()
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (playInterval) clearInterval(playInterval)
  if (map) map.remove()
})
</script>

<style scoped>
.dashboard-page {
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Noto Serif SC', serif;
}

/* 顶部统计栏 */
.stats-header {
  height: 70px;
  background: linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(15,15,15,0.9) 100%);
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 30px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #D4A373;
  font-family: 'Playfair Display', serif;
}

.stat-value.highlight-loss {
  color: #C0392B;
}

.stat-value.highlight-cold {
  color: #4A90D9;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
  margin-top: 2px;
}

.nav-link {
  margin-left: auto;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 8px 16px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #D4A373;
  border-color: #D4A373;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* 左侧面板 */
.left-panel {
  width: 200px;
  background: rgba(20,20,20,0.8);
  border-right: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.panel-title {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.troops-chart {
  flex: 1;
  min-height: 0;
}

/* 地图容器 */
.map-container {
  flex: 1;
  position: relative;
}

#dashboard-map {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
}

/* 悬停卡片 */
.hover-card {
  position: absolute;
  background: rgba(0,0,0,0.9);
  border: 1px solid rgba(184, 134, 11, 0.5);
  border-radius: 8px;
  padding: 12px;
  pointer-events: none;
  z-index: 1000;
  min-width: 150px;
}

.hover-title {
  font-weight: bold;
  color: #D4A373;
  margin-bottom: 4px;
}

.hover-date {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
}

.hover-stat {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.8);
}

/* 右侧面板 */
.right-panel {
  width: 240px;
  background: rgba(20,20,20,0.8);
  border-left: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  padding: 10px;
  position: relative;
  transition: width 0.3s ease;
}

.right-panel.collapsed {
  width: 40px;
  padding: 10px 5px;
}

.panel-toggle-btn {
  position: absolute;
  left: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 50px;
  background: rgba(20,20,20,0.95);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px 0 0 8px;
  color: #D4A373;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.panel-toggle-btn:hover {
  background: rgba(212, 163, 115, 0.2);
  border-color: #D4A373;
}

.panel-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* 选区统计样式 */
.selection-stats {
  background: rgba(212, 163, 115, 0.1);
  border: 1px solid rgba(212, 163, 115, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
}

.selection-stats .panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.clear-selection-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.6);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-selection-btn:hover {
  border-color: #D4A373;
  color: #D4A373;
}

.close-panel-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: all 0.2s;
}

.close-panel-btn:hover {
  color: #C0392B;
}

.right-panel.hidden {
  display: none;
}

.selection-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selection-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.selection-stat .label {
  color: rgba(255,255,255,0.6);
}

.selection-stat .value {
  color: rgba(255,255,255,0.9);
  font-weight: 500;
}

.selection-stat .value.troops {
  color: #D4A373;
}

.selection-stat .value.loss {
  color: #C0392B;
}

.selection-stat .value.temp {
  color: #4A90D9;
}

.battles-list {
  flex: 1;
  overflow-y: auto;
}

.battle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.battle-item:hover {
  background: rgba(255,255,255,0.05);
}

.battle-item.active {
  background: rgba(184, 134, 11, 0.2);
  border-left-color: #D4A373;
}

.battle-item.advance {
  border-left-color: #D4A373;
}

.battle-item.retreat {
  border-left-color: #4A90D9;
}

.battle-icon {
  font-size: 1.2rem;
}

.battle-info {
  flex: 1;
  min-width: 0;
}

.battle-name {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.battle-date {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
}

.battle-troops {
  font-size: 0.8rem;
  color: #D4A373;
  font-weight: bold;
}

/* 底部面板 */
.bottom-panel {
  height: 140px;
  background: rgba(20,20,20,0.9);
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
}

.temp-chart {
  flex: 1;
  padding: 0 20px;
}

.timeline-control {
  height: 45px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.control-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255,255,255,0.3);
  background: transparent;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: #D4A373;
}

.timeline-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  cursor: pointer;
}

.timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #D4A373;
  border-radius: 50%;
  cursor: pointer;
}

.timeline-date {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  min-width: 100px;
  text-align: right;
}

/* 战役弹窗 */
.battle-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  border: 1px solid rgba(184, 134, 11, 0.5);
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-close:hover {
  color: #fff;
}

.modal-content h2 {
  color: #D4A373;
  margin: 0 0 5px;
  font-size: 1.5rem;
}

.modal-subtitle {
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
  margin-bottom: 15px;
}

.modal-overview {
  color: rgba(255,255,255,0.8);
  line-height: 1.6;
  margin-bottom: 20px;
}

.modal-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.modal-stat {
  background: rgba(255,255,255,0.05);
  padding: 12px;
  border-radius: 6px;
}

.modal-stat .stat-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 4px;
}

.modal-stat .stat-value {
  font-size: 1.2rem;
  color: #D4A373;
}

.modal-stat .stat-value.loss {
  color: #C0392B;
}

.modal-detail-link {
  display: block;
  margin-top: 20px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #D4A373 0%, #B8956C 100%);
  color: #1a1a1a;
  text-decoration: none;
  text-align: center;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.modal-detail-link:hover {
  background: linear-gradient(135deg, #E5B484 0%, #C9A67D 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 163, 115, 0.4);
}

/* 地图标记样式 */
:deep(.battle-marker) {
  background: transparent;
}

:deep(.marker-icon) {
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

:deep(.progress-marker) {
  background: transparent;
}

:deep(.marker-dot) {
  width: 12px;
  height: 12px;
  background: #D4A373;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(212, 163, 115, 0.8);
  position: relative;
  left: 4px;
  top: 4px;
}

:deep(.battle-tooltip) {
  background: rgba(0,0,0,0.9);
  border: 1px solid rgba(184, 134, 11, 0.5);
  color: #F5F0E6;
  font-family: 'Noto Serif SC', serif;
  padding: 6px 10px;
  border-radius: 4px;
}

/* 滚动条 */
.battles-list::-webkit-scrollbar {
  width: 4px;
}

.battles-list::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
}

.battles-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}

/* Brush样式 */
:deep(.troops-brush .selection),
:deep(.temp-brush .selection) {
  fill: rgba(255, 215, 0, 0.2);
  stroke: #FFD700;
  stroke-width: 1;
}

:deep(.troops-brush .handle),
:deep(.temp-brush .handle) {
  fill: #FFD700;
}

:deep(.troops-brush .overlay),
:deep(.temp-brush .overlay) {
  cursor: crosshair;
}

/* 响应式 - 手机端 */
@media (max-width: 768px) {
  .dashboard-page {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }
  
  .stats-header {
    height: auto;
    flex-wrap: wrap;
    padding: 10px 15px;
    gap: 8px;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .stat-card {
    min-width: 55px;
  }
  
  .stat-value {
    font-size: 1rem;
  }
  
  .stat-label {
    font-size: 0.6rem;
  }
  
  .nav-link {
    font-size: 0.7rem;
    padding: 5px 10px;
  }
  
  /* 手机端主内容区改为垂直布局 */
  .main-content {
    flex-direction: column;
    flex: none;
  }
  
  /* 左侧面板在手机端变为顶部横条 */
  .left-panel {
    width: 100%;
    height: 120px;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 8px;
  }
  
  .left-panel .panel-title {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    padding: 0 5px;
    margin: 0;
    border-bottom: none;
    border-right: 1px solid rgba(255,255,255,0.1);
  }
  
  .troops-chart {
    flex: 1;
    height: 100%;
  }
  
  /* 地图容器在手机端固定高度 */
  .map-container {
    height: 45vh;
    min-height: 280px;
    flex: none;
  }
  
  /* 右侧面板在手机端变为底部可折叠区域 */
  .right-panel {
    width: 100%;
    height: auto;
    max-height: 250px;
    border-left: none;
    border-top: 1px solid rgba(255,255,255,0.1);
    flex-direction: column;
    position: relative;
  }
  
  .right-panel.collapsed {
    width: 100%;
    height: 45px;
    max-height: 45px;
    padding: 5px 10px;
  }
  
  .panel-toggle-btn {
    position: absolute;
    left: 50%;
    top: -15px;
    transform: translateX(-50%);
    width: 50px;
    height: 25px;
    border-radius: 8px 8px 0 0;
    font-size: 0.75rem;
  }
  
  .right-panel.collapsed .panel-toggle-btn {
    top: 10px;
  }
  
  .panel-content {
    padding-top: 15px;
  }
  
  .right-panel .panel-title {
    font-size: 0.8rem;
    text-align: center;
  }
  
  .battles-list {
    max-height: 180px;
    overflow-y: auto;
  }
  
  .battle-item {
    padding: 8px;
    gap: 8px;
  }
  
  .battle-icon {
    font-size: 1rem;
  }
  
  .battle-name {
    font-size: 0.8rem;
  }
  
  .battle-date {
    font-size: 0.65rem;
  }
  
  .battle-troops {
    font-size: 0.75rem;
  }
  
  /* 底部面板 */
  .bottom-panel {
    height: 110px;
    flex-shrink: 0;
  }
  
  .temp-chart {
    padding: 0 10px;
  }
  
  .timeline-control {
    height: 38px;
    gap: 8px;
    padding: 0 10px;
  }
  
  .control-btn {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .timeline-date {
    font-size: 0.7rem;
    min-width: 70px;
  }
  
  .modal-content {
    padding: 20px;
    margin: 15px;
  }
  
  .modal-content h2 {
    font-size: 1.2rem;
  }
  
  .modal-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  /* 选区统计在手机端 */
  .selection-stats {
    padding: 8px;
    margin-bottom: 10px;
  }
  
  .selection-stat {
    font-size: 0.75rem;
  }
}

/* 响应式 - 小手机 */
@media (max-width: 480px) {
  .stat-card {
    min-width: 50px;
  }
  
  .stat-value {
    font-size: 0.9rem;
  }
  
  .map-container {
    height: 40vh;
    min-height: 250px;
  }
  
  .left-panel {
    height: 100px;
  }
  
  .right-panel {
    max-height: 220px;
  }
  
  .battles-list {
    max-height: 150px;
  }
}
</style>
