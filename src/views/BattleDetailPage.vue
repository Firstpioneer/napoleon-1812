<template>
  <div class="battle-detail-page">
    <!-- 返回按钮 -->
    <div class="nav-bar">
      <router-link to="/" class="back-btn">← 首页</router-link>
      <div class="battle-nav">
        <button 
          v-if="prevBattle" 
          @click="goToBattle(prevBattle.id)" 
          class="nav-arrow"
        >← {{ prevBattle.title }}</button>
        <button 
          v-if="nextBattle" 
          @click="goToBattle(nextBattle.id)" 
          class="nav-arrow"
        >{{ nextBattle.title }} →</button>
      </div>
    </div>

    <!-- 战役头部 -->
    <header class="battle-header" :style="{ backgroundImage: `url(${battle?.image})` }">
      <div class="header-overlay">
        <div class="header-content">
          <span class="battle-type" :class="battle?.phase">
            {{ battle?.phase === 'advance' ? '进攻阶段' : '撤退阶段' }}
          </span>
          <h1 class="battle-title">{{ battle?.title }}</h1>
          <h2 class="battle-title-en">{{ battle?.titleEn }}</h2>
          <p class="battle-date">{{ battle?.date }}</p>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="battle-main" v-if="battle">
      <div class="content-grid">
        <!-- 左侧内容 -->
        <div class="content-left">
          <!-- 概述 -->
          <section class="overview-section">
            <p class="overview-text">{{ battle.overview }}</p>
          </section>

          <!-- 详细内容 -->
          <section class="detail-section">
            <div v-html="battle.content"></div>
          </section>
        </div>

        <!-- 右侧信息栏 -->
        <aside class="content-right">
          <!-- 统计数据 -->
          <div class="stats-card">
            <h3>📊 战役数据</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">法军兵力</span>
                <span class="stat-value french">{{ formatNumber(battle.stats.frenchTroops) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">俄军兵力</span>
                <span class="stat-value russian">{{ formatNumber(battle.stats.russianTroops) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">法军伤亡</span>
                <span class="stat-value casualty">{{ formatNumber(battle.stats.frenchCasualties) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">俄军伤亡</span>
                <span class="stat-value casualty">{{ formatNumber(battle.stats.russianCasualties) }}</span>
              </div>
              <div class="stat-item full">
                <span class="stat-label">气温</span>
                <span class="stat-value temp">{{ battle.stats.temperature }}</span>
              </div>
            </div>
          </div>

          <!-- 指挥官 -->
          <div class="commanders-card">
            <h3>⚔ 指挥官</h3>
            <div class="commanders-group">
              <div class="commander-side french">
                <span class="side-label">法军</span>
                <ul>
                  <li v-for="cmd in battle.commanders.french" :key="cmd">{{ cmd }}</li>
                </ul>
              </div>
              <div class="commander-side russian">
                <span class="side-label">俄军</span>
                <ul>
                  <li v-for="cmd in battle.commanders.russian" :key="cmd">{{ cmd }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 地图位置 -->
          <div class="location-card">
            <h3>📍 战役位置</h3>
            <div class="mini-map" ref="miniMapRef"></div>
          </div>

          <!-- 导航按钮 -->
          <div class="action-card">
            <router-link to="/visualization" class="action-btn primary">
              🗺 查看完整可视化
            </router-link>
            <router-link to="/reading" class="action-btn secondary">
              📖 阅读历史档案
            </router-link>
          </div>
        </aside>
      </div>
    </main>

    <!-- 相关战役 -->
    <section class="related-battles" v-if="relatedBattles.length">
      <h2>相关战役</h2>
      <div class="battles-grid">
        <div 
          v-for="b in relatedBattles" 
          :key="b.id" 
          class="battle-card"
          @click="goToBattle(b.id)"
        >
          <div class="card-image" :style="{ backgroundImage: `url(${b.image})` }">
            <span class="card-phase" :class="b.phase">
              {{ b.phase === 'advance' ? '进攻' : '撤退' }}
            </span>
          </div>
          <div class="card-content">
            <h4>{{ b.title }}</h4>
            <p>{{ b.date }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { keyBattles } from '../stores/battlesData.js'

const route = useRoute()
const router = useRouter()
const miniMapRef = ref(null)
let miniMap = null

const battleId = computed(() => route.params.id)

const battle = computed(() => {
  return keyBattles.find(b => b.id === battleId.value)
})

const battleIndex = computed(() => {
  return keyBattles.findIndex(b => b.id === battleId.value)
})

const prevBattle = computed(() => {
  return battleIndex.value > 0 ? keyBattles[battleIndex.value - 1] : null
})

const nextBattle = computed(() => {
  return battleIndex.value < keyBattles.length - 1 ? keyBattles[battleIndex.value + 1] : null
})

const relatedBattles = computed(() => {
  if (!battle.value) return []
  return keyBattles
    .filter(b => b.id !== battleId.value && b.phase === battle.value.phase)
    .slice(0, 3)
})

function formatNumber(num) {
  if (!num) return '-'
  return num.toLocaleString()
}

function goToBattle(id) {
  router.push(`/battle/${id}`)
}

function initMiniMap() {
  if (!miniMapRef.value || !battle.value) return
  
  if (miniMap) {
    miniMap.remove()
  }

  miniMap = L.map(miniMapRef.value, {
    center: [battle.value.location.lat, battle.value.location.lon],
    zoom: 6,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd'
  }).addTo(miniMap)

  L.circleMarker([battle.value.location.lat, battle.value.location.lon], {
    radius: 10,
    fillColor: battle.value.phase === 'advance' ? '#D4A017' : '#8B0000',
    color: '#FFD700',
    weight: 3,
    fillOpacity: 0.8
  }).addTo(miniMap)
}

onMounted(() => {
  initMiniMap()
})

onUnmounted(() => {
  if (miniMap) {
    miniMap.remove()
  }
})

watch(battleId, () => {
  setTimeout(initMiniMap, 100)
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.battle-detail-page {
  min-height: 100vh;
  background: #1A1A1A;
  color: #E8E0D5;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
}

.back-btn {
  color: #B8860B;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #D4A017;
}

.battle-nav {
  display: flex;
  gap: 20px;
}

.nav-arrow {
  background: none;
  border: 1px solid rgba(184, 134, 11, 0.5);
  color: #B8860B;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.nav-arrow:hover {
  background: rgba(184, 134, 11, 0.2);
  border-color: #B8860B;
}

.battle-header {
  height: 50vh;
  min-height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
  margin-top: 60px;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26, 26, 26, 1) 0%, rgba(26, 26, 26, 0.5) 50%, rgba(26, 26, 26, 0.3) 100%);
  display: flex;
  align-items: flex-end;
  padding: 60px;
}

.header-content {
  max-width: 800px;
}

.battle-type {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-bottom: 15px;
}

.battle-type.advance {
  background: rgba(212, 160, 23, 0.3);
  color: #D4A017;
  border: 1px solid #D4A017;
}

.battle-type.retreat {
  background: rgba(139, 0, 0, 0.3);
  color: #CD5C5C;
  border: 1px solid #8B0000;
}

.battle-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 3rem;
  color: #E8E0D5;
  margin: 0 0 10px;
}

.battle-title-en {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  color: #A09080;
  font-weight: 400;
  margin: 0 0 15px;
}

.battle-date {
  font-size: 1.2rem;
  color: #B8860B;
}

.battle-main {
  padding: 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 50px;
}

.overview-section {
  margin-bottom: 40px;
  padding: 30px;
  background: rgba(184, 134, 11, 0.1);
  border-left: 4px solid #B8860B;
  border-radius: 0 10px 10px 0;
}

.overview-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #D4C4B0;
  margin: 0;
}

.detail-section {
  line-height: 1.9;
  font-size: 1.05rem;
}

.detail-section :deep(h3) {
  font-family: 'Playfair Display', Georgia, serif;
  color: #B8860B;
  font-size: 1.4rem;
  margin: 35px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
}

.detail-section :deep(p) {
  margin-bottom: 18px;
  color: #D4C4B0;
}

.detail-section :deep(ul) {
  padding-left: 25px;
  margin: 15px 0;
}

.detail-section :deep(li) {
  margin-bottom: 10px;
  color: #D4C4B0;
}

/* 右侧卡片 */
.content-right > div {
  background: rgba(45, 45, 45, 0.8);
  border: 1px solid rgba(184, 134, 11, 0.3);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
}

.content-right h3 {
  font-family: 'Playfair Display', Georgia, serif;
  color: #B8860B;
  margin: 0 0 20px;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item.full {
  grid-column: 1 / -1;
}

.stat-label {
  font-size: 0.8rem;
  color: #A09080;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-value.french { color: #D4A017; }
.stat-value.russian { color: #6B8E9F; }
.stat-value.casualty { color: #CD5C5C; }
.stat-value.temp { color: #87CEEB; }

.commanders-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.commander-side ul {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}

.commander-side li {
  padding: 5px 0;
  font-size: 0.95rem;
}

.side-label {
  font-size: 0.85rem;
  padding: 3px 10px;
  border-radius: 10px;
}

.commander-side.french .side-label {
  background: rgba(212, 160, 23, 0.2);
  color: #D4A017;
}

.commander-side.russian .side-label {
  background: rgba(107, 142, 159, 0.2);
  color: #6B8E9F;
}

.mini-map {
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
}

.action-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.action-btn {
  display: block;
  text-align: center;
  padding: 14px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #B8860B 0%, #8B6914 100%);
  color: #1A1A1A;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #D4A017 0%, #B8860B 100%);
}

.action-btn.secondary {
  background: transparent;
  color: #B8860B;
  border: 2px solid #B8860B;
}

.action-btn.secondary:hover {
  background: rgba(184, 134, 11, 0.1);
}

/* 相关战役 */
.related-battles {
  padding: 60px;
  background: rgba(45, 45, 45, 0.5);
}

.related-battles h2 {
  font-family: 'Playfair Display', Georgia, serif;
  color: #B8860B;
  text-align: center;
  margin-bottom: 40px;
}

.battles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
}

.battle-card {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(184, 134, 11, 0.3);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.battle-card:hover {
  transform: translateY(-5px);
  border-color: #B8860B;
}

.card-image {
  height: 150px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.card-phase {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.card-phase.advance {
  background: rgba(212, 160, 23, 0.9);
  color: #1A1A1A;
}

.card-phase.retreat {
  background: rgba(139, 0, 0, 0.9);
  color: #FFF;
}

.card-content {
  padding: 18px;
}

.card-content h4 {
  font-family: 'Playfair Display', Georgia, serif;
  color: #E8E0D5;
  margin: 0 0 8px;
}

.card-content p {
  color: #A09080;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .battles-grid {
    grid-template-columns: 1fr;
  }
  
  .battle-header {
    height: 40vh;
  }
  
  .header-overlay {
    padding: 30px;
  }
  
  .battle-title {
    font-size: 2rem;
  }
  
  .battle-main {
    padding: 30px;
  }
}
</style>
