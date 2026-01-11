<template>
  <div class="phases-container">
    <h2 class="phases-title">探索战役阶段</h2>
    <p class="phases-subtitle">点击卡片深入了解每个阶段的详细故事</p>
    
    <div class="phases-grid">
      <div 
        v-for="(phase, index) in phases" 
        :key="phase.id"
        class="phase-card"
        :class="{ 'active': hoveredIndex === index }"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
        @click="$emit('select', phase, index)"
      >
        <!-- Background Image -->
        <div 
          class="phase-card-bg" 
          :style="{ backgroundImage: `url(${phase.backgroundImage})` }"
        ></div>
        
        <!-- Overlay -->
        <div class="phase-card-overlay" :class="phase.theme"></div>
        
        <!-- Content -->
        <div class="phase-card-content">
          <span class="phase-card-number">{{ phase.number }}</span>
          <h3 class="phase-card-title">{{ phase.title }}</h3>
          <p class="phase-card-subtitle">{{ phase.titleEn }}</p>
          <p class="phase-card-date">{{ phase.dateRange }}</p>
          
          <!-- Stats Preview -->
          <div class="phase-card-stats" v-if="phase.stats">
            <div class="mini-stat" v-if="phase.stats.troops">
              <span class="mini-stat-value">{{ formatTroops(phase.stats.troops) }}</span>
              <span class="mini-stat-label">兵力</span>
            </div>
            <div class="mini-stat" v-if="phase.stats.casualties">
              <span class="mini-stat-value casualties">{{ formatTroops(phase.stats.casualties) }}</span>
              <span class="mini-stat-label">伤亡</span>
            </div>
            <div class="mini-stat" v-if="phase.stats.temp !== undefined">
              <span class="mini-stat-value temp">{{ phase.stats.temp }}°</span>
              <span class="mini-stat-label">气温</span>
            </div>
          </div>
          
          <!-- Enter Button -->
          <div class="phase-card-enter">
            <span>进入场景</span>
            <span class="enter-arrow">&rarr;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  phases: {
    type: Array,
    required: true
  }
})

defineEmits(['select'])

const hoveredIndex = ref(null)

function formatTroops(num) {
  if (num >= 1000) {
    return Math.round(num / 1000) + 'k'
  }
  return num
}
</script>

<style scoped>
.phases-container {
  padding: 100px 60px;
  background: linear-gradient(to bottom, rgba(10,10,10,0.95), rgba(20,15,10,0.98));
  position: relative;
}

.phases-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 2.5rem;
  color: #C9A86C;
  text-align: center;
  margin-bottom: 15px;
}

.phases-subtitle {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.6);
  text-align: center;
  margin-bottom: 60px;
}

.phases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.phase-card {
  position: relative;
  height: 420px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.phase-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.phase-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s ease;
}

.phase-card:hover .phase-card-bg {
  transform: scale(1.1);
}

.phase-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.95) 0%,
    rgba(0,0,0,0.7) 40%,
    rgba(0,0,0,0.4) 100%
  );
  transition: background 0.4s ease;
}

.phase-card-overlay.advance {
  background: linear-gradient(
    to top,
    rgba(30,20,10,0.95) 0%,
    rgba(30,20,10,0.6) 40%,
    rgba(30,20,10,0.3) 100%
  );
}

.phase-card-overlay.retreat {
  background: linear-gradient(
    to top,
    rgba(15,20,30,0.95) 0%,
    rgba(15,20,30,0.6) 40%,
    rgba(15,20,30,0.3) 100%
  );
}

.phase-card-overlay.battle {
  background: linear-gradient(
    to top,
    rgba(40,15,15,0.95) 0%,
    rgba(40,15,15,0.6) 40%,
    rgba(40,15,15,0.3) 100%
  );
}

.phase-card:hover .phase-card-overlay {
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.85) 0%,
    rgba(0,0,0,0.5) 50%,
    rgba(0,0,0,0.3) 100%
  );
}

.phase-card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  z-index: 10;
}

.phase-card-number {
  font-family: 'Playfair Display', serif;
  font-size: 0.8rem;
  color: #C9A86C;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: block;
}

.phase-card-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 1.8rem;
  color: #F5F0E6;
  margin-bottom: 5px;
  line-height: 1.2;
}

.phase-card-subtitle {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  font-style: italic;
  margin-bottom: 10px;
}

.phase-card-date {
  font-size: 0.9rem;
  color: #C9A86C;
  margin-bottom: 20px;
}

.phase-card-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease 0.1s;
}

.phase-card:hover .phase-card-stats {
  opacity: 1;
  transform: translateY(0);
}

.mini-stat {
  text-align: center;
}

.mini-stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #D4A373;
  display: block;
}

.mini-stat-value.casualties {
  color: #C0392B;
}

.mini-stat-value.temp {
  color: #4A90D9;
}

.mini-stat-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.phase-card-enter {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #C9A86C;
  letter-spacing: 0.1em;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease 0.2s;
}

.phase-card:hover .phase-card-enter {
  opacity: 1;
  transform: translateX(0);
}

.enter-arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.phase-card:hover .enter-arrow {
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .phases-container {
    padding: 60px 20px;
  }

  .phases-title {
    font-size: 1.8rem;
  }

  .phases-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .phase-card {
    height: 350px;
  }

  .phase-card-stats {
    opacity: 1;
    transform: translateY(0);
  }

  .phase-card-enter {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
