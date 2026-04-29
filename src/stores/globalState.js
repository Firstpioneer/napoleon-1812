// 全局状态管理 - P0: 驱动所有视图同步更新
import { ref, computed, watch } from 'vue'
import { napoleonAdvance, napoleonRetreat, temperatureData, keyEvents } from './campaignData.js'

// 全局当前时间状态
export const currentTime = ref(new Date('1812-06-24'))

// 时间范围
export const timeRange = {
  start: new Date('1812-06-24'),
  end: new Date('1812-12-14')
}

const timeRangeStartMs = timeRange.start.getTime()
const timeRangeEndMs = timeRange.end.getTime()
const timeRangeTotalMs = timeRangeEndMs - timeRangeStartMs
const minPlaybackFrameMs = 80
const playbackDayMs = 24 * 60 * 60 * 1000

// 当前阶段
export const currentPhase = computed(() => {
  const time = currentTime.value
  if (time < new Date('1812-09-14')) return 'advance'
  if (time < new Date('1812-10-19')) return 'occupation'
  return 'retreat'
})

// 根据当前时间计算兵力
export const currentTroops = computed(() => {
  const time = currentTime.value
  const allData = [...napoleonAdvance, ...napoleonRetreat]
  
  // 找到最接近当前时间的数据点
  let closest = allData[0]
  let minDiff = Infinity
  
  for (const point of allData) {
    const pointDate = new Date(point.date)
    const diff = Math.abs(pointDate - time)
    if (diff < minDiff) {
      minDiff = diff
      closest = point
    }
  }
  
  return closest.survivors || closest.size || 0
})

// 根据当前时间计算温度
export const currentTemp = computed(() => {
  const time = currentTime.value
  
  let closest = temperatureData[0]
  let minDiff = Infinity
  
  for (const point of temperatureData) {
    const pointDate = new Date(point.date)
    const diff = Math.abs(pointDate - time)
    if (diff < minDiff) {
      minDiff = diff
      closest = point
    }
  }
  
  return closest.temp
})

// 根据当前时间获取位置
export const currentLocation = computed(() => {
  const time = currentTime.value
  const phase = currentPhase.value
  const data = phase === 'retreat' ? napoleonRetreat : napoleonAdvance
  
  let closest = data[0]
  let minDiff = Infinity
  
  for (const point of data) {
    const pointDate = new Date(point.date)
    const diff = Math.abs(pointDate - time)
    if (diff < minDiff) {
      minDiff = diff
      closest = point
    }
  }
  
  return [closest.lat, closest.lon]
})

// 当前日期格式化
export const currentDateFormatted = computed(() => {
  const d = currentTime.value
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${year}年${month}月${day}日`
})

// 进度百分比 (0-100)
export const timeProgress = computed(() => {
  const current = currentTime.value.getTime() - timeRangeStartMs
  return Math.max(0, Math.min(100, (current / timeRangeTotalMs) * 100))
})

// 设置时间的方法
export function setTime(date) {
  if (date instanceof Date) {
    currentTime.value = date
  } else {
    currentTime.value = new Date(date)
  }
}

// 根据进度设置时间
export function setTimeByProgress(progress) {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  const newTime = new Date(timeRangeStartMs + timeRangeTotalMs * (clampedProgress / 100))
  currentTime.value = newTime
}

// 动画播放状态
export const isPlaying = ref(false)
export const playbackSpeed = ref(1) // 倍速

let animationFrame = null
let lastPlaybackTime = 0
let pendingPlaybackMs = 0

export function startPlayback() {
  if (isPlaying.value) return
  isPlaying.value = true
  lastPlaybackTime = performance.now()
  pendingPlaybackMs = 0

  const animate = (timestamp) => {
    if (!isPlaying.value) return

    const elapsed = timestamp - lastPlaybackTime
    lastPlaybackTime = timestamp
    pendingPlaybackMs += elapsed

    if (pendingPlaybackMs >= minPlaybackFrameMs) {
      const increment = pendingPlaybackMs * playbackSpeed.value * playbackDayMs / 120
      pendingPlaybackMs = 0
      const newTimeMs = currentTime.value.getTime() + increment

      if (newTimeMs >= timeRangeEndMs) {
        currentTime.value = timeRange.end
        stopPlayback()
        return
      }

      currentTime.value = new Date(newTimeMs)
    }

    animationFrame = requestAnimationFrame(animate)
  }

  animationFrame = requestAnimationFrame(animate)
}

export function stopPlayback() {
  isPlaying.value = false
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

export function togglePlayback() {
  if (isPlaying.value) {
    stopPlayback()
  } else {
    startPlayback()
  }
}

// 重置到起点
export function resetTime() {
  stopPlayback()
  currentTime.value = timeRange.start
}

// 获取当前时间附近的事件
export const nearbyEvents = computed(() => {
  const time = currentTime.value
  const threshold = 3 * 24 * 60 * 60 * 1000 // 3天内的事件
  
  return keyEvents.filter(event => {
    const eventDate = new Date(event.date)
    return Math.abs(eventDate - time) < threshold
  })
})
