<template>
  <div class="status-panel">
    <div class="status-item">
      <span class="status-label">日期</span>
      <span class="status-value date">{{ date }}</span>
    </div>
    <div class="status-item">
      <span class="status-label">兵力</span>
      <span class="status-value troops">{{ formatTroops(troops) }}</span>
    </div>
    <div class="status-item" v-if="temp !== null">
      <span class="status-label">温度</span>
      <span class="status-value temp">{{ temp }}°C</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  date: String,
  troops: Number,
  temp: [Number, null]
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
