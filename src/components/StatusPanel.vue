<template>
  <div class="status-panel" :class="phaseClass">
    <div class="status-item">
      <span class="status-label">日期</span>
      <span class="status-value date">{{ displayDate }}</span>
    </div>
    <div class="status-item">
      <span class="status-label">兵力</span>
      <span class="status-value troops">{{ formatTroops(displayTroops) }}</span>
    </div>
    <div class="status-item" v-if="displayTemp !== null">
      <span class="status-label">温度</span>
      <span class="status-value temp" :class="{ cold: displayTemp < 0, extreme: displayTemp < -20 }">
        {{ displayTemp }}°C
      </span>
    </div>
    <!-- 阶段指示器 -->
    <div class="phase-indicator" :class="currentPhase">
      <span class="phase-dot"></span>
      <span class="phase-text">{{ phaseLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  currentDateFormatted, 
  currentTroops, 
  currentTemp,
  currentPhase 
} from '../stores/globalState.js'

const props = defineProps({
  date: String,
  troops: Number,
  temp: [Number, null],
  useGlobalState: {
    type: Boolean,
    default: true
  }
})

// 使用全局状态或传入的props
const displayDate = computed(() => props.useGlobalState ? currentDateFormatted.value : props.date)
const displayTroops = computed(() => props.useGlobalState ? currentTroops.value : props.troops)
const displayTemp = computed(() => props.useGlobalState ? currentTemp.value : props.temp)

// 阶段样式类
const phaseClass = computed(() => currentPhase.value)

// 阶段标签
const phaseLabel = computed(() => {
  switch (currentPhase.value) {
    case 'advance': return '进攻中'
    case 'occupation': return '占领莫斯科'
    case 'retreat': return '撤退中'
    default: return ''
  }
})

function formatTroops(num) {
  if (!num) return '--'
  return num.toLocaleString()
}
</script>

<style scoped>
.status-panel {
  position: fixed;
  top: 25px;
  left: 25px;
  background: rgba(0,0,0,0.85);
  padding: 18px 28px;
  border-radius: 8px;
  z-index: 100;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  gap: 35px;
}

.status-item {
  text-align: center;
}

.status-label {
  display: block;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 5px;
}

.status-value {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 600;
}

.status-value.date { color: #F5F0E6; }
.status-value.troops { color: #D4A373; }
.status-value.temp { color: #4A90D9; }
.status-value.temp.cold { color: #4A90D9; font-weight: bold; }
.status-value.temp.extreme { color: #00BFFF; text-shadow: 0 0 10px rgba(0,191,255,0.5); }

/* 阶段指示器 */
.phase-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 20px;
  border-left: 1px solid rgba(255,255,255,0.1);
}

.phase-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #D4A373;
  animation: pulseDot 2s infinite;
}

.phase-indicator.occupation .phase-dot {
  background: #C0392B;
}

.phase-indicator.retreat .phase-dot {
  background: #4A90D9;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

.phase-text {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.05em;
}

/* 阶段背景变化 */
.status-panel.advance {
  border-color: rgba(212, 163, 115, 0.3);
}

.status-panel.occupation {
  border-color: rgba(192, 57, 43, 0.3);
}

.status-panel.retreat {
  border-color: rgba(74, 144, 217, 0.3);
}

@media (max-width: 768px) {
  .status-panel {
    top: 15px;
    left: 15px;
    padding: 12px 18px;
    gap: 20px;
  }
  
  .status-value {
    font-size: 1rem;
  }
}
</style>
