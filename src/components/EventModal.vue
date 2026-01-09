<template>
  <div class="event-modal-overlay" :class="{ active: event }" @click.self="$emit('close')">
    <div class="event-card" :class="{ active: event }">
      <button class="card-close" @click="$emit('close')">×</button>
      
      <div 
        class="card-image" 
        :style="{ backgroundImage: event.image ? `url(${event.image})` : 'linear-gradient(135deg, #5D4E37 0%, #8B7355 100%)' }"
      >
        <span class="card-type">{{ getTypeName(event.type) }}</span>
      </div>
      
      <div class="card-body">
        <h3 class="card-title">{{ event.name }}</h3>
        <p class="card-subtitle">{{ event.nameEn }}</p>
        <p class="card-date">{{ event.date }}</p>
        
        <p class="card-description">{{ event.description }}</p>
        
        <!-- Quote -->
        <div v-if="event.quote" class="card-quote">
          <p class="card-quote-text">"{{ event.quote.text }}"</p>
          <p class="card-quote-source">— {{ event.quote.source }}</p>
        </div>
        
        <!-- Stats -->
        <div class="card-stats">
          <div class="card-stat" v-if="event.troops">
            <span class="card-stat-value troops">{{ formatNumber(event.troops) }}</span>
            <span class="card-stat-label">兵力</span>
          </div>
          <div class="card-stat" v-if="event.casualties">
            <span class="card-stat-value loss">{{ formatNumber(event.casualties) }}</span>
            <span class="card-stat-label">伤亡</span>
          </div>
          <div class="card-stat" v-if="event.temp !== undefined && event.temp !== null">
            <span class="card-stat-value temp">{{ event.temp }}°C</span>
            <span class="card-stat-label">温度</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  event: Object
})

defineEmits(['close'])

function getTypeName(type) {
  const typeMap = {
    battle: '战役',
    city: '城市',
    cold: '极寒',
    start: '开始',
    end: '结束',
    retreat: '撤退',
    disaster: '灾难',
    event: '事件'
  }
  return typeMap[type] || type
}

function formatNumber(num) {
  return num.toLocaleString()
}
</script>

<style scoped>
.event-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  z-index: 2000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.event-card {
  width: 520px;
  max-width: 90vw;
  max-height: 85vh;
  background: #F5F0E6;
  color: #3D3D3D;
  border-radius: 12px;
  overflow: hidden;
  overflow-y: auto;
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.event-card.active {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.card-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;
}

.card-close:hover {
  background: rgba(0,0,0,0.8);
  transform: scale(1.1);
}

.card-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.card-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(transparent, rgba(0,0,0,0.4));
}

.card-type {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 5px 12px;
  background: #C9A86C;
  color: white;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 3px;
}

.card-body {
  padding: 25px 30px 30px;
}

.card-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: #3D3D3D;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 5px;
  font-style: italic;
}

.card-date {
  font-size: 0.9rem;
  color: #C9A86C;
  margin-bottom: 20px;
  letter-spacing: 0.05em;
}

.card-description {
  font-size: 1rem;
  line-height: 1.9;
  margin-bottom: 20px;
}

.card-quote {
  border-left: 3px solid #C9A86C;
  padding: 15px 20px;
  margin: 20px 0;
  background: rgba(201, 168, 108, 0.1);
}

.card-quote-text {
  font-size: 0.95rem;
  line-height: 1.7;
  font-style: italic;
  margin-bottom: 10px;
}

.card-quote-source {
  font-size: 0.85rem;
  color: #C9A86C;
  font-style: normal;
}

.card-stats {
  display: flex;
  gap: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  margin-top: 20px;
}

.card-stat {
  text-align: center;
  flex: 1;
}

.card-stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 700;
  display: block;
}

.card-stat-value.troops { color: #D4A373; }
.card-stat-value.temp { color: #4A90D9; }
.card-stat-value.loss { color: #C0392B; }

.card-stat-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media (max-width: 768px) {
  .card-image {
    height: 150px;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
  
  .card-stats {
    gap: 15px;
  }
  
  .card-stat-value {
    font-size: 1.4rem;
  }
}
</style>
