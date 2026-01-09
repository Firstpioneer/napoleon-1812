<template>
  <div id="napoleon-app">
    <!-- Splash Screen -->
    <SplashScreen 
      v-if="!splashDismissed" 
      @enter="dismissSplash" 
    />

    <!-- Main Application -->
    <template v-else>
      <!-- Fixed Map Background -->
      <MapView 
        ref="mapView"
        :current-chapter="currentChapter"
        :show-advance="showAdvance"
        :show-retreat="showRetreat"
        :show-schwarzenberg="showSchwarzenberg"
        @event-click="showEventDetail"
      />

      <!-- Chapter Navigation Dots -->
      <ChapterNav 
        :chapters="chapters"
        :current-index="currentChapterIndex"
        @navigate="navigateToChapter"
      />

      <!-- Status Panel -->
      <StatusPanel 
        :date="currentStatus.date"
        :troops="currentStatus.troops"
        :temp="currentStatus.temp"
      />

      <!-- Map Legend -->
      <MapLegend 
        v-model:show-advance="showAdvance"
        v-model:show-retreat="showRetreat"
        v-model:show-schwarzenberg="showSchwarzenberg"
      />

      <!-- Scrolling Content -->
      <div class="scroll-container" ref="scrollContainer">
        <!-- Prologue: Minard Map -->
        <section class="chapter minard-section" data-chapter="prologue">
          <div class="minard-content">
            <span class="chapter-number">序章 / PROLOGUE</span>
            <h2 class="chapter-title">Minard的经典图表</h2>
            <p class="chapter-text">
              1869年，退休的法国土木工程师Charles Joseph Minard绘制了一张被称为"有史以来最好的统计图表"。
              这张图表浓缩了1812年拿破仑俄国战役的全部悲剧——42.2万大军如何在197天内锐减至仅剩1万人。
            </p>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/29/Minard.png" 
              alt="Minard's Map"
              class="minard-image"
            />
            <p class="chapter-text">
              Minard用线条宽度表示兵力，用颜色区分进攻与撤退，并在下方叠加了温度曲线。
              我们将在现代地图上重现这一经典，并通过多视角叙事带你深入了解这场战役的每一个关键时刻。
            </p>
          </div>
        </section>

        <!-- Narrative Chapters -->
        <ChapterSection
          v-for="(chapter, index) in narrativeChapters"
          :key="chapter.id"
          :chapter="chapter"
          :index="index"
          @in-view="handleChapterInView"
        />

        <!-- Epilogue -->
        <section class="chapter epilogue-section" data-chapter="epilogue">
          <div class="epilogue-content">
            <span class="chapter-number">尾声 / EPILOGUE</span>
            <h2 class="epilogue-title">野心的代价</h2>
            <p class="chapter-text">
              俄罗斯帝国的损失约为30万人（包括战时征召）。
              而大军团的损失，根据Minard的图表，拿破仑的计划付出了超过40万条生命的代价。
            </p>
            <div class="epilogue-stats">
              <div class="epilogue-stat">
                <div class="epilogue-stat-value">422,000</div>
                <div class="epilogue-stat-label">出发时兵力</div>
              </div>
              <div class="epilogue-stat">
                <div class="epilogue-stat-value" style="color: #C0392B;">~10,000</div>
                <div class="epilogue-stat-label">幸存人数</div>
              </div>
              <div class="epilogue-stat">
                <div class="epilogue-stat-value">97.6%</div>
                <div class="epilogue-stat-label">损失率</div>
              </div>
            </div>
            <div class="quote-block" style="max-width: 600px; margin: 40px auto;">
              <p class="quote-text">"大军团已不复存在。"</p>
              <p class="quote-source">— 路易-亚历山大·贝尔蒂埃，战争部长兼参谋长</p>
            </div>
          </div>
        </section>

        <!-- Sources -->
        <section class="sources-section">
          <h3 class="sources-title">参考资料 / Sources</h3>
          <ul class="sources-list">
            <li>Charles Joseph Minard, Carte figurative (1869)</li>
            <li>Adam Zamoyski, 1812: Napoleon's Fatal March on Moscow</li>
            <li>Dominic Lieven, Russia Against Napoleon</li>
            <li>TASS: 1812 - When Napoleon Ventured East</li>
            <li>Clausewitz, The Russian Campaign of 1812</li>
            <li>Armand de Caulaincourt, With Napoleon in Russia</li>
            <li>Britannica: Schwarzenberg's Austrian Corps</li>
          </ul>
        </section>
      </div>

      <!-- Timeline -->
      <TimelineChart 
        :current-date="currentStatus.date"
        @date-select="handleDateSelect"
      />

      <!-- Event Detail Modal -->
      <EventModal 
        v-if="selectedEvent"
        :event="selectedEvent"
        @close="selectedEvent = null"
      />

      <!-- Comparison Panel (shown on certain chapters) -->
      <ComparisonPanel 
        v-if="showComparison"
        :current-troops="currentStatus.troops"
        :phase="currentChapter?.phase"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { chapters, keyEvents } from './stores/campaignData.js'

// Components
import SplashScreen from './components/SplashScreen.vue'
import MapView from './components/MapView.vue'
import ChapterNav from './components/ChapterNav.vue'
import ChapterSection from './components/ChapterSection.vue'
import StatusPanel from './components/StatusPanel.vue'
import MapLegend from './components/MapLegend.vue'
import TimelineChart from './components/TimelineChart.vue'
import EventModal from './components/EventModal.vue'
import ComparisonPanel from './components/ComparisonPanel.vue'

// State
const splashDismissed = ref(false)
const currentChapterIndex = ref(0)
const selectedEvent = ref(null)
const showAdvance = ref(true)
const showRetreat = ref(true)
const showSchwarzenberg = ref(true)
const scrollContainer = ref(null)
const mapView = ref(null)

// Computed
const narrativeChapters = computed(() => chapters.slice(1, -1))

const currentChapter = computed(() => chapters[currentChapterIndex.value])

const currentStatus = computed(() => {
  const chapter = currentChapter.value
  return {
    date: chapter?.date || '1812年',
    troops: chapter?.stats?.troops || chapter?.stats?.initial || 422000,
    temp: chapter?.stats?.temp ?? null
  }
})

const showComparison = computed(() => {
  const phase = currentChapter.value?.phase
  return phase && ['advance', 'retreat', 'battle'].includes(phase)
})

// Methods
function dismissSplash() {
  splashDismissed.value = true
}

function handleChapterInView(chapterId) {
  const index = chapters.findIndex(c => c.id === chapterId)
  if (index !== -1 && index !== currentChapterIndex.value) {
    currentChapterIndex.value = index
    updateMapView(chapters[index])
  }
}

function navigateToChapter(index) {
  currentChapterIndex.value = index
  const chapter = chapters[index]
  
  // Scroll to chapter
  const element = document.querySelector(`[data-chapter="${chapter.id}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  
  updateMapView(chapter)
}

function updateMapView(chapter) {
  if (mapView.value && chapter.location) {
    mapView.value.flyTo(chapter.location, chapter.zoom || 6)
  }
}

function showEventDetail(event) {
  selectedEvent.value = event
}

function handleDateSelect(date) {
  // Find corresponding event or chapter
  const event = keyEvents.find(e => e.date === date)
  if (event) {
    showEventDetail(event)
  }
}

// Scroll Observer
let observer = null

onMounted(() => {
  // Setup Intersection Observer for chapters
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const chapterId = entry.target.dataset.chapter
          if (chapterId) {
            handleChapterInView(chapterId)
          }
        }
      })
    },
    { threshold: [0.5] }
  )

  // Observe all chapters after splash dismissed
  setTimeout(() => {
    document.querySelectorAll('.chapter').forEach(el => {
      observer.observe(el)
    })
  }, 100)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Watch for chapter changes to update map
watch(currentChapterIndex, (newIndex) => {
  const chapter = chapters[newIndex]
  if (chapter && mapView.value) {
    updateMapView(chapter)
  }
})
</script>

<style>
#napoleon-app {
  width: 100%;
  min-height: 100vh;
}

.scroll-container {
  position: relative;
  z-index: 10;
  pointer-events: none;
}

.scroll-container > * {
  pointer-events: auto;
}

.chapter {
  pointer-events: auto;
}
</style>
