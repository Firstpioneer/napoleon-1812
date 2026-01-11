<template>
  <Teleport to="body">
    <Transition name="phase-fade">
      <div v-if="visible" class="phase-detail-overlay" @click.self="close">
        <div class="phase-detail-container" :class="{ 'entering': isEntering }">
          <!-- Close Button -->
          <button class="phase-close" @click="close">
            <span>&times;</span>
          </button>

          <!-- Immersive Background -->
          <div 
            class="phase-bg" 
            :style="{ backgroundImage: `url(${phase.backgroundImage})` }"
          >
            <div class="phase-bg-overlay" :class="phase.theme"></div>
          </div>

          <!-- Content Container -->
          <div class="phase-content-wrapper" ref="contentWrapper">
            <!-- Hero Section -->
            <section class="phase-hero">
              <div class="phase-hero-content">
                <span class="phase-number">{{ phase.number }}</span>
                <h1 class="phase-title">{{ phase.title }}</h1>
                <p class="phase-subtitle">{{ phase.titleEn }}</p>
                <div class="phase-meta">
                  <span v-if="phase.dateRange" class="phase-date">{{ phase.dateRange }}</span>
                  <span v-if="phase.location" class="phase-location">{{ phase.location }}</span>
                </div>
              </div>
              <div class="scroll-indicator">
                <span>滚动探索</span>
                <div class="scroll-arrow"></div>
              </div>
            </section>

            <!-- Overview Section -->
            <section class="phase-section overview-section">
              <div class="section-content">
                <h2 class="section-title">概述</h2>
                <p class="section-text" v-html="phase.overview"></p>
                
                <!-- Key Stats -->
                <div class="key-stats" v-if="phase.stats">
                  <div class="key-stat" v-if="phase.stats.troops">
                    <div class="stat-icon">&#9876;</div>
                    <div class="stat-number">{{ formatNumber(phase.stats.troops) }}</div>
                    <div class="stat-desc">兵力</div>
                  </div>
                  <div class="key-stat" v-if="phase.stats.casualties">
                    <div class="stat-icon">&#10013;</div>
                    <div class="stat-number casualties">{{ formatNumber(phase.stats.casualties) }}</div>
                    <div class="stat-desc">伤亡</div>
                  </div>
                  <div class="key-stat" v-if="phase.stats.days">
                    <div class="stat-icon">&#9201;</div>
                    <div class="stat-number">{{ phase.stats.days }}</div>
                    <div class="stat-desc">天数</div>
                  </div>
                  <div class="key-stat" v-if="phase.stats.temp !== undefined">
                    <div class="stat-icon">&#10052;</div>
                    <div class="stat-number temp">{{ phase.stats.temp }}°C</div>
                    <div class="stat-desc">气温</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Historical Context -->
            <section class="phase-section context-section" v-if="phase.context">
              <div class="section-content">
                <h2 class="section-title">历史背景</h2>
                <p class="section-text" v-html="phase.context"></p>
              </div>
            </section>

            <!-- Key Events Timeline -->
            <section class="phase-section events-section" v-if="phase.events && phase.events.length">
              <div class="section-content full-width">
                <h2 class="section-title">关键事件</h2>
                <div class="events-timeline">
                  <div 
                    v-for="(event, index) in phase.events" 
                    :key="index"
                    class="event-item"
                    :class="{ 'highlighted': event.important }"
                  >
                    <div class="event-date">{{ event.date }}</div>
                    <div class="event-dot"></div>
                    <div class="event-content">
                      <h3 class="event-title">{{ event.title }}</h3>
                      <p class="event-desc">{{ event.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Detailed Narrative -->
            <section class="phase-section narrative-section" v-if="phase.narrative">
              <div class="section-content">
                <h2 class="section-title">详细叙事</h2>
                <div class="narrative-blocks">
                  <div 
                    v-for="(block, index) in phase.narrative" 
                    :key="index"
                    class="narrative-block"
                  >
                    <h3 v-if="block.heading" class="narrative-heading">{{ block.heading }}</h3>
                    <p class="narrative-text" v-html="block.text"></p>
                    
                    <!-- Quote -->
                    <blockquote v-if="block.quote" class="narrative-quote">
                      <p>"{{ block.quote.text }}"</p>
                      <cite>— {{ block.quote.source }}</cite>
                    </blockquote>
                  </div>
                </div>
              </div>
            </section>

            <!-- Gallery -->
            <section class="phase-section gallery-section" v-if="phase.gallery && phase.gallery.length">
              <div class="section-content full-width">
                <h2 class="section-title">历史图像</h2>
                <div class="gallery-grid">
                  <div 
                    v-for="(img, index) in phase.gallery" 
                    :key="index"
                    class="gallery-item"
                    @click="openGalleryImage(img)"
                  >
                    <img :src="img.url" :alt="img.caption" />
                    <div class="gallery-caption">{{ img.caption }}</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Key Figures -->
            <section class="phase-section figures-section" v-if="phase.figures && phase.figures.length">
              <div class="section-content">
                <h2 class="section-title">关键人物</h2>
                <div class="figures-grid">
                  <div 
                    v-for="(figure, index) in phase.figures" 
                    :key="index"
                    class="figure-card"
                  >
                    <div class="figure-portrait">
                      <img :src="figure.image" :alt="figure.name" />
                    </div>
                    <div class="figure-info">
                      <h3 class="figure-name">{{ figure.name }}</h3>
                      <p class="figure-title">{{ figure.title }}</p>
                      <p class="figure-role">{{ figure.role }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Aftermath / Consequences -->
            <section class="phase-section aftermath-section" v-if="phase.aftermath">
              <div class="section-content">
                <h2 class="section-title">后果与影响</h2>
                <p class="section-text" v-html="phase.aftermath"></p>
              </div>
            </section>

            <!-- Wikipedia Source -->
            <section class="phase-section source-section">
              <div class="section-content">
                <div class="source-note">
                  <p>内容来源: <a href="https://en.wikipedia.org/wiki/French_invasion_of_Russia" target="_blank">维基百科 - 法国入侵俄罗斯</a></p>
                </div>
              </div>
            </section>

            <!-- Navigation -->
            <section class="phase-navigation">
              <button 
                v-if="hasPrevious" 
                class="nav-btn prev"
                @click="$emit('navigate', -1)"
              >
                <span class="nav-arrow">&larr;</span>
                <span class="nav-label">上一阶段</span>
              </button>
              <button class="nav-btn back" @click="close">
                <span class="nav-label">返回总览</span>
              </button>
              <button 
                v-if="hasNext" 
                class="nav-btn next"
                @click="$emit('navigate', 1)"
              >
                <span class="nav-label">下一阶段</span>
                <span class="nav-arrow">&rarr;</span>
              </button>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: Boolean,
  phase: Object,
  hasPrevious: Boolean,
  hasNext: Boolean
})

const emit = defineEmits(['close', 'navigate'])

const isEntering = ref(false)
const contentWrapper = ref(null)

watch(() => props.visible, (newVal) => {
  if (newVal) {
    isEntering.value = true
    document.body.style.overflow = 'hidden'
    setTimeout(() => {
      isEntering.value = false
    }, 800)
  } else {
    document.body.style.overflow = ''
  }
})

function close() {
  emit('close')
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'k'
  }
  return num.toLocaleString()
}

function openGalleryImage(img) {
  window.open(img.url, '_blank')
}

function handleKeydown(e) {
  if (!props.visible) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft' && props.hasPrevious) emit('navigate', -1)
  if (e.key === 'ArrowRight' && props.hasNext) emit('navigate', 1)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.phase-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5000;
  background: #0a0a0a;
}

.phase-detail-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.phase-detail-container.entering {
  animation: containerEnter 0.8s ease-out;
}

@keyframes containerEnter {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.phase-close {
  position: fixed;
  top: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 5100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.phase-close:hover {
  background: rgba(255,255,255,0.1);
  transform: scale(1.1);
}

/* Background */
.phase-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.phase-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(10,10,10,0.3) 0%,
    rgba(10,10,10,0.7) 40%,
    rgba(10,10,10,0.95) 70%,
    rgba(10,10,10,1) 100%
  );
}

.phase-bg-overlay.advance {
  background: linear-gradient(
    to bottom,
    rgba(30,20,10,0.4) 0%,
    rgba(10,10,10,0.8) 50%,
    rgba(10,10,10,1) 100%
  );
}

.phase-bg-overlay.retreat {
  background: linear-gradient(
    to bottom,
    rgba(20,25,35,0.4) 0%,
    rgba(10,10,10,0.85) 50%,
    rgba(10,10,10,1) 100%
  );
}

.phase-bg-overlay.battle {
  background: linear-gradient(
    to bottom,
    rgba(40,15,15,0.4) 0%,
    rgba(10,10,10,0.8) 50%,
    rgba(10,10,10,1) 100%
  );
}

/* Hero Section */
.phase-hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  padding: 60px;
}

.phase-hero-content {
  max-width: 900px;
}

.phase-number {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  color: #C9A86C;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  margin-bottom: 20px;
  display: block;
}

.phase-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 4.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 15px;
  color: #F5F0E6;
  text-shadow: 0 4px 30px rgba(0,0,0,0.5);
}

.phase-subtitle {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: rgba(255,255,255,0.7);
  font-style: italic;
  margin-bottom: 30px;
}

.phase-meta {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.phase-date, .phase-location {
  font-size: 1.1rem;
  color: #C9A86C;
  letter-spacing: 0.1em;
}

.scroll-indicator {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  animation: float 2s ease-in-out infinite;
}

.scroll-arrow {
  width: 20px;
  height: 20px;
  border-right: 2px solid rgba(255,255,255,0.5);
  border-bottom: 2px solid rgba(255,255,255,0.5);
  transform: rotate(45deg);
}

@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

/* Sections */
.phase-section {
  padding: 100px 60px;
  position: relative;
}

.section-content {
  max-width: 800px;
  margin: 0 auto;
}

.section-content.full-width {
  max-width: 1200px;
}

.section-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 2.2rem;
  color: #C9A86C;
  margin-bottom: 40px;
  position: relative;
  padding-bottom: 20px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: #C9A86C;
}

.section-text {
  font-size: 1.15rem;
  line-height: 2.2;
  color: rgba(255,255,255,0.85);
}

/* Key Stats */
.key-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 60px;
  flex-wrap: wrap;
}

.key-stat {
  text-align: center;
  padding: 30px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  min-width: 140px;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 15px;
  opacity: 0.6;
}

.stat-number {
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 700;
  color: #D4A373;
  margin-bottom: 8px;
}

.stat-number.casualties { color: #C0392B; }
.stat-number.temp { color: #4A90D9; }

.stat-desc {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Events Timeline */
.events-timeline {
  position: relative;
  padding-left: 150px;
}

.events-timeline::before {
  content: '';
  position: absolute;
  left: 130px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(201,168,108,0.3);
}

.event-item {
  position: relative;
  padding: 30px 0 30px 50px;
}

.event-item.highlighted .event-dot {
  background: #C9A86C;
  box-shadow: 0 0 20px rgba(201,168,108,0.5);
}

.event-date {
  position: absolute;
  left: -150px;
  top: 32px;
  width: 120px;
  text-align: right;
  font-size: 0.9rem;
  color: #C9A86C;
  font-family: 'Playfair Display', serif;
}

.event-dot {
  position: absolute;
  left: -8px;
  top: 35px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  border: 2px solid #C9A86C;
}

.event-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 1.3rem;
  color: #F5F0E6;
  margin-bottom: 10px;
}

.event-desc {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255,255,255,0.7);
}

/* Narrative */
.narrative-blocks {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.narrative-heading {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 1.5rem;
  color: #F5F0E6;
  margin-bottom: 20px;
}

.narrative-text {
  font-size: 1.1rem;
  line-height: 2.1;
  color: rgba(255,255,255,0.85);
}

.narrative-quote {
  border-left: 4px solid #C9A86C;
  padding: 25px 35px;
  margin: 30px 0;
  background: rgba(201,168,108,0.08);
  font-style: italic;
}

.narrative-quote p {
  font-size: 1.2rem;
  line-height: 1.9;
  color: rgba(255,255,255,0.9);
  margin-bottom: 15px;
}

.narrative-quote cite {
  font-size: 0.95rem;
  color: #C9A86C;
  font-style: normal;
}

/* Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.02);
}

.gallery-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.9));
  font-size: 0.9rem;
  color: rgba(255,255,255,0.9);
}

/* Figures */
.figures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.figure-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}

.figure-portrait {
  flex-shrink: 0;
}

.figure-portrait img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #C9A86C;
}

.figure-name {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 1.2rem;
  color: #F5F0E6;
  margin-bottom: 5px;
}

.figure-title {
  font-size: 0.9rem;
  color: #C9A86C;
  margin-bottom: 8px;
}

.figure-role {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
}

/* Source */
.source-section {
  padding: 60px;
  background: rgba(0,0,0,0.3);
}

.source-note {
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.5);
}

.source-note a {
  color: #C9A86C;
  text-decoration: none;
}

.source-note a:hover {
  text-decoration: underline;
}

/* Navigation */
.phase-navigation {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 80px 60px;
  background: rgba(0,0,0,0.5);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 35px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: #F5F0E6;
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: #C9A86C;
}

.nav-btn.back {
  background: #C9A86C;
  border-color: #C9A86C;
  color: #1a1a1a;
}

.nav-btn.back:hover {
  background: #D4A373;
}

.nav-arrow {
  font-size: 1.5rem;
}

/* Transitions */
.phase-fade-enter-active {
  transition: all 0.6s ease-out;
}

.phase-fade-leave-active {
  transition: all 0.4s ease-in;
}

.phase-fade-enter-from {
  opacity: 0;
}

.phase-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .phase-hero {
    padding: 40px 30px;
  }

  .phase-title {
    font-size: 2.5rem;
  }

  .phase-subtitle {
    font-size: 1.1rem;
  }

  .phase-section {
    padding: 60px 30px;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .key-stats {
    gap: 20px;
  }

  .key-stat {
    min-width: 100px;
    padding: 20px;
  }

  .stat-number {
    font-size: 2rem;
  }

  .events-timeline {
    padding-left: 30px;
  }

  .events-timeline::before {
    left: 8px;
  }

  .event-date {
    position: static;
    width: auto;
    text-align: left;
    margin-bottom: 8px;
  }

  .event-dot {
    left: -26px;
  }

  .phase-navigation {
    flex-direction: column;
    gap: 15px;
    padding: 40px 30px;
  }

  .nav-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
