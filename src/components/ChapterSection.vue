<template>
  <section 
    class="chapter" 
    :data-chapter="chapter.id"
    ref="sectionRef"
  >
    <div class="chapter-content" :class="{ 'animate-in': isVisible }">
      <span class="chapter-number">{{ chapter.number }} / {{ chapter.titleEn }}</span>
      <h2 class="chapter-title">{{ chapter.title }}</h2>
      <p v-if="chapter.date" class="chapter-date">{{ chapter.date }}</p>
      <p class="chapter-text">{{ chapter.content }}</p>
      
      <!-- Quote Block -->
      <div v-if="chapter.quote" class="quote-block">
        <p class="quote-text">"{{ chapter.quote.text }}"</p>
        <p class="quote-source">— {{ chapter.quote.source }}</p>
      </div>
      
      <!-- Stats -->
      <div v-if="chapter.stats" class="chapter-stats">
        <div v-if="chapter.stats.troops" class="stat-item">
          <span class="stat-value troops">{{ formatNumber(chapter.stats.troops) }}</span>
          <span class="stat-label">兵力</span>
        </div>
        <div v-if="chapter.stats.casualties" class="stat-item">
          <span class="stat-value loss">{{ formatNumber(chapter.stats.casualties) }}</span>
          <span class="stat-label">伤亡</span>
        </div>
        <div v-if="chapter.stats.temp !== undefined && chapter.stats.temp !== null" class="stat-item">
          <span class="stat-value cold">{{ chapter.stats.temp }}°C</span>
          <span class="stat-label">温度</span>
        </div>
        <div v-if="chapter.stats.french && chapter.stats.russian" class="stat-item">
          <div style="display: flex; gap: 20px;">
            <div>
              <span class="stat-value troops">{{ formatNumber(chapter.stats.french) }}</span>
              <span class="stat-label">法军</span>
            </div>
            <div>
              <span class="stat-value" style="color: #E74C3C;">{{ formatNumber(chapter.stats.russian) }}</span>
              <span class="stat-label">俄军</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  chapter: Object,
  index: Number
})

const emit = defineEmits(['in-view'])

const sectionRef = ref(null)
const isVisible = ref(false)

let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = entry.isIntersecting
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        emit('in-view', props.chapter.id)
      }
    },
    { threshold: [0.3, 0.5, 0.7] }
  )
  
  if (sectionRef.value) {
    observer.observe(sectionRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'k'
  }
  return num.toLocaleString()
}
</script>

<style scoped>
.chapter {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  background: linear-gradient(
    90deg, 
    rgba(0,0,0,0.9) 0%, 
    rgba(0,0,0,0.7) 40%, 
    transparent 70%
  );
}

.chapter-content {
  max-width: 550px;
  padding: 60px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.chapter-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.chapter-number {
  font-family: 'Playfair Display', serif;
  font-size: 0.85rem;
  color: #C9A86C;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.chapter-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 1rem 0 1.5rem;
  color: #F5F0E6;
}

.chapter-date {
  font-size: 0.95rem;
  color: #C9A86C;
  margin-bottom: 1.5rem;
  letter-spacing: 0.1em;
}

.chapter-text {
  font-size: 1.05rem;
  line-height: 2;
  color: rgba(255,255,255,0.85);
  margin-bottom: 1.5rem;
}

.quote-block {
  border-left: 3px solid #C9A86C;
  padding: 20px 25px;
  margin: 25px 0;
  background: rgba(201, 168, 108, 0.08);
}

.quote-text {
  font-size: 1.1rem;
  line-height: 1.9;
  font-style: italic;
  color: rgba(255,255,255,0.9);
  margin-bottom: 12px;
}

.quote-source {
  font-size: 0.9rem;
  color: #C9A86C;
  font-style: normal;
}

.chapter-stats {
  display: flex;
  gap: 35px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 700;
  display: block;
}

.stat-value.troops { color: #D4A373; }
.stat-value.cold { color: #4A90D9; }
.stat-value.loss { color: #C0392B; }

.stat-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media (max-width: 768px) {
  .chapter-content {
    padding: 30px;
  }
  
  .chapter-title {
    font-size: 2rem;
  }
  
  .chapter-stats {
    gap: 25px;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
}
</style>
