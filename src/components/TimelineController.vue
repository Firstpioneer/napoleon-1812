<template>
  <div class="timeline-controller">
    <!-- 阶段控制面板 -->
    <div class="phase-controller">
      <div 
        v-for="phase in phases" 
        :key="phase.id"
        class="phase-segment"
        :class="{ 
          active: currentPhaseId === phase.id,
          completed: isPhaseCompleted(phase)
        }"
        :style="{ width: phase.width + '%' }"
        @click="jumpToPhase(phase)"
      >
        <div class="phase-fill" :style="{ width: getPhaseProgress(phase) + '%' }"></div>
        <span class="phase-label">{{ phase.label }}</span>
      </div>
    </div>

    <!-- 时间轴滑块 -->
    <div class="timeline-slider-container">
      <div class="timeline-track" ref="trackRef" @click="handleTrackClick">
        <!-- 温度背景 -->
        <div class="temp-gradient" :style="tempGradientStyle"></div>
        
        <!-- 事件标记 -->
        <div 
          v-for="event in timelineEvents" 
          :key="event.id"
          class="event-marker-small"
          :class="event.type"
          :style="{ left: event.position + '%' }"
          :title="event.name"
          @click.stop="$emit('event-click', event)"
        >
          <span class="event-dot"></span>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        
        <!-- 拖动手柄 -->
        <div 
          class="slider-handle"
          :style="{ left: progress + '%' }"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <div class="handle-tooltip">
            <span class="tooltip-date">{{ formattedDate }}</span>
            <span class="tooltip-troops">{{ formattedTroops }}</span>
            <span class="tooltip-temp" :class="{ cold: currentTemp < 0 }">{{ currentTemp }}°C</span>
          </div>
        </div>
      </div>
      
      <!-- 日期刻度 -->
      <div class="timeline-ticks">
        <div 
          v-for="tick in dateTicks" 
          :key="tick.date"
          class="tick"
          :style="{ left: tick.position + '%' }"
        >
          <span class="tick-label">{{ tick.label }}</span>
        </div>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="playback-controls">
      <button class="control-btn" @click="resetTime" title="重置">
        <span>⏮</span>
      </button>
      <button class="control-btn play-btn" @click="togglePlayback" :title="isPlaying ? '暂停' : '播放'">
        <span>{{ isPlaying ? '⏸' : '▶' }}</span>
      </button>
      <div class="speed-control">
        <span class="speed-label">速度</span>
        <select v-model.number="localSpeed" @change="updateSpeed">
          <option :value="0.5">0.5x</option>
          <option :value="1">1x</option>
          <option :value="2">2x</option>
          <option :value="4">4x</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  currentTime, 
  currentTroops, 
  currentTemp,
  currentDateFormatted,
  timeProgress,
  timeRange,
  isPlaying,
  playbackSpeed,
  startPlayback,
  stopPlayback,
  togglePlayback,
  resetTime,
  setTimeByProgress
} from '../stores/globalState.js'
import { keyEvents, temperatureData } from '../stores/campaignData.js'

const emit = defineEmits(['event-click', 'phase-change'])

const trackRef = ref(null)
const isDragging = ref(false)
const localSpeed = ref(playbackSpeed.value)

// 阶段定义
const phases = [
  { id: 'advance', label: '进攻', start: '1812-06-24', end: '1812-09-13', width: 45, color: '#D4A373' },
  { id: 'occupation', label: '莫斯科', start: '1812-09-14', end: '1812-10-18', width: 15, color: '#C0392B' },
  { id: 'retreat', label: '撤退', start: '1812-10-19', end: '1812-12-14', width: 40, color: '#4A90D9' }
]

// 当前阶段
const currentPhaseId = computed(() => {
  const time = currentTime.value
  for (const phase of phases) {
    const start = new Date(phase.start)
    const end = new Date(phase.end)
    if (time >= start && time <= end) return phase.id
  }
  return 'advance'
})

// 进度
const progress = computed(() => timeProgress.value)

// 格式化日期
const formattedDate = computed(() => currentDateFormatted.value)

// 格式化兵力
const formattedTroops = computed(() => {
  const troops = currentTroops.value
  if (troops >= 10000) return Math.round(troops / 1000) + 'k'
  return troops.toLocaleString()
})

// 日期刻度
const dateTicks = computed(() => {
  const ticks = [
    { date: '1812-06-24', label: '6月' },
    { date: '1812-07-15', label: '7月' },
    { date: '1812-08-15', label: '8月' },
    { date: '1812-09-15', label: '9月' },
    { date: '1812-10-15', label: '10月' },
    { date: '1812-11-15', label: '11月' },
    { date: '1812-12-14', label: '12月' }
  ]
  
  const total = timeRange.end - timeRange.start
  return ticks.map(t => ({
    ...t,
    position: ((new Date(t.date) - timeRange.start) / total) * 100
  }))
})

// 事件标记
const timelineEvents = computed(() => {
  const total = timeRange.end - timeRange.start
  return keyEvents
    .filter(e => e.type === 'battle' || e.type === 'city' || e.type === 'disaster')
    .map(e => ({
      ...e,
      position: ((new Date(e.date) - timeRange.start) / total) * 100
    }))
})

// 温度渐变样式
const tempGradientStyle = computed(() => {
  const stops = temperatureData.map((t, i) => {
    const total = timeRange.end - timeRange.start
    const pos = ((new Date(t.date) - timeRange.start) / total) * 100
    const intensity = t.temp < 0 ? Math.min(1, Math.abs(t.temp) / 40) : 0
    const color = t.temp < 0 
      ? `rgba(74, 144, 217, ${intensity * 0.5})` 
      : `rgba(212, 163, 115, ${(25 - t.temp) / 50 * 0.3})`
    return `${color} ${pos}%`
  })
  return { background: `linear-gradient(to right, ${stops.join(', ')})` }
})

// 阶段是否完成
function isPhaseCompleted(phase) {
  return currentTime.value > new Date(phase.end)
}

// 获取阶段内进度
function getPhaseProgress(phase) {
  const time = currentTime.value
  const start = new Date(phase.start)
  const end = new Date(phase.end)
  
  if (time < start) return 0
  if (time > end) return 100
  return ((time - start) / (end - start)) * 100
}

// 跳转到阶段
function jumpToPhase(phase) {
  const phaseStart = new Date(phase.start)
  const total = timeRange.end - timeRange.start
  const progress = ((phaseStart - timeRange.start) / total) * 100
  setTimeByProgress(progress)
  emit('phase-change', phase.id)
}

// 更新播放速度
function updateSpeed() {
  playbackSpeed.value = localSpeed.value
}

// 拖动逻辑
function startDrag(e) {
  e.preventDefault()
  isDragging.value = true
  stopPlayback()
  
  const handleMove = (moveEvent) => {
    if (!isDragging.value || !trackRef.value) return
    
    const rect = trackRef.value.getBoundingClientRect()
    const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX
    const x = clientX - rect.left
    const progress = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setTimeByProgress(progress)
  }
  
  const handleEnd = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

// 点击轨道跳转
function handleTrackClick(e) {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const progress = Math.max(0, Math.min(100, (x / rect.width) * 100))
  setTimeByProgress(progress)
}
</script>

<style scoped>
.timeline-controller {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.9) 80%, transparent 100%);
  padding: 15px 40px 20px;
  z-index: 100;
}

/* 阶段控制面板 */
.phase-controller {
  display: flex;
  margin-bottom: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.phase-segment {
  position: relative;
  height: 28px;
  background: rgba(255,255,255,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.phase-segment:not(:last-child) {
  border-right: 1px solid rgba(0,0,0,0.3);
}

.phase-segment:hover {
  background: rgba(255,255,255,0.15);
}

.phase-segment.active {
  background: rgba(255,255,255,0.2);
}

.phase-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(212, 163, 115, 0.4);
  transition: width 0.3s ease;
}

.phase-segment:nth-child(2) .phase-fill {
  background: rgba(192, 57, 43, 0.4);
}

.phase-segment:nth-child(3) .phase-fill {
  background: rgba(74, 144, 217, 0.4);
}

.phase-label {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.8);
  letter-spacing: 0.1em;
}

/* 时间轴滑块 */
.timeline-slider-container {
  margin-bottom: 10px;
}

.timeline-track {
  position: relative;
  height: 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
}

.temp-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #D4A373 0%, #C9A86C 100%);
  border-radius: 6px 0 0 6px;
  transition: width 0.1s ease;
}

.slider-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #F5F0E6;
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  z-index: 10;
}

.slider-handle:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.1);
}

.handle-tooltip {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.95);
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.slider-handle:hover .handle-tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip-date {
  font-size: 0.85rem;
  color: #C9A86C;
}

.tooltip-troops {
  font-size: 1rem;
  font-weight: bold;
  color: #D4A373;
}

.tooltip-temp {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}

.tooltip-temp.cold {
  color: #4A90D9;
}

/* 事件标记 */
.event-marker-small {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  cursor: pointer;
  z-index: 5;
}

.event-dot {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transition: transform 0.2s ease;
}

.event-marker-small.battle .event-dot {
  background: #C0392B;
}

.event-marker-small.city .event-dot {
  background: #C9A86C;
}

.event-marker-small.disaster .event-dot {
  background: #E74C3C;
}

.event-marker-small:hover .event-dot {
  transform: scale(1.5);
}

/* 日期刻度 */
.timeline-ticks {
  position: relative;
  height: 20px;
  margin-top: 5px;
}

.tick {
  position: absolute;
  transform: translateX(-50%);
}

.tick-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
}

/* 播放控制 */
.playback-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #F5F0E6;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255,255,255,0.2);
}

.play-btn {
  width: 44px;
  height: 44px;
  background: #C9A86C;
  border-color: #C9A86C;
  color: #1a1a1a;
  font-size: 1.2rem;
}

.play-btn:hover {
  background: #D4A373;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.speed-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
}

.speed-control select {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #F5F0E6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .timeline-controller {
    padding: 10px 20px 15px;
  }
  
  .phase-label {
    font-size: 0.7rem;
  }
  
  .playback-controls {
    gap: 10px;
  }
  
  .control-btn {
    width: 32px;
    height: 32px;
  }
  
  .play-btn {
    width: 38px;
    height: 38px;
  }
}
</style>
