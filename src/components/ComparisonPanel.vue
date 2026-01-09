<template>
  <div class="comparison-panel">
    <h4 class="comparison-title">兵力对比 / Force Comparison</h4>
    
    <!-- Napoleon's Force -->
    <div class="comparison-bar">
      <div class="comparison-label">
        <span>拿破仑主力</span>
        <span class="comparison-value">{{ formatNumber(currentTroops) }}</span>
      </div>
      <div class="comparison-track">
        <div 
          class="comparison-fill advance" 
          :style="{ width: napoleonPercent + '%' }"
        ></div>
      </div>
    </div>
    
    <!-- Schwarzenberg's Force -->
    <div class="comparison-bar">
      <div class="comparison-label">
        <span>施瓦岑贝格军团</span>
        <span class="comparison-value">{{ formatNumber(schwarzenbergTroops) }}</span>
      </div>
      <div class="comparison-track">
        <div 
          class="comparison-fill schwarzenberg" 
          :style="{ width: schwarzenbergPercent + '%' }"
        ></div>
      </div>
    </div>
    
    <!-- Loss Rate Comparison -->
    <div class="comparison-stats">
      <div class="stat-row">
        <span class="stat-name">拿破仑损失率</span>
        <span class="stat-percent loss">{{ napoleonLossPercent }}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-name">施瓦岑贝格损失率</span>
        <span class="stat-percent safe">{{ schwarzenbergLossPercent }}%</span>
      </div>
    </div>
    
    <!-- Insight -->
    <div class="comparison-insight" v-if="phase === 'retreat'">
      <p>施瓦岑贝格在南翼采取了保守战术，避免了主力军团遭遇的灾难性损失。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentTroops: {
    type: Number,
    default: 422000
  },
  phase: String
})

const initialNapoleon = 422000
const initialSchwarzenberg = 30000

const schwarzenbergTroops = computed(() => {
  // Schwarzenberg's troops remained relatively stable
  if (props.phase === 'retreat') {
    return 28000
  }
  return 29000
})

const napoleonPercent = computed(() => {
  return Math.round((props.currentTroops / initialNapoleon) * 100)
})

const schwarzenbergPercent = computed(() => {
  return Math.round((schwarzenbergTroops.value / initialSchwarzenberg) * 100)
})

const napoleonLossPercent = computed(() => {
  return Math.round(((initialNapoleon - props.currentTroops) / initialNapoleon) * 100)
})

const schwarzenbergLossPercent = computed(() => {
  return Math.round(((initialSchwarzenberg - schwarzenbergTroops.value) / initialSchwarzenberg) * 100)
})

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'k'
  }
  return num.toLocaleString()
}
</script>

<style scoped>
.comparison-panel {
  position: fixed;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  width: 260px;
  background: rgba(0,0,0,0.85);
  border-radius: 10px;
  padding: 22px;
  z-index: 100;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.comparison-title {
  font-family: 'Playfair Display', serif;
  font-size: 0.85rem;
  color: #C9A86C;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.comparison-bar {
  margin: 18px 0;
}

.comparison-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-bottom: 8px;
  color: rgba(255,255,255,0.8);
}

.comparison-value {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
}

.comparison-track {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.comparison-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

.comparison-fill.advance { background: #D4A373; }
.comparison-fill.schwarzenberg { background: #2A9D8F; }

.comparison-stats {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  font-size: 0.8rem;
}

.stat-name {
  color: rgba(255,255,255,0.6);
}

.stat-percent {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
}

.stat-percent.loss { color: #C0392B; }
.stat-percent.safe { color: #2A9D8F; }

.comparison-insight {
  margin-top: 15px;
  padding: 12px;
  background: rgba(42, 157, 143, 0.15);
  border-radius: 6px;
  border-left: 3px solid #2A9D8F;
}

.comparison-insight p {
  font-size: 0.75rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.8);
  margin: 0;
}

@media (max-width: 1200px) {
  .comparison-panel {
    display: none;
  }
}
</style>
