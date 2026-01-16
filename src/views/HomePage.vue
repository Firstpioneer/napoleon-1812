<template>
  <div class="home-page" ref="pageRef">
    <!-- 第一屏：欢迎内容 -->
    <section class="welcome-screen" :class="{ 'fade-out': isMapMode }">
      <div class="welcome-content">
        <div class="hero-section">
          <h1 class="hero-title">1812</h1>
          <h2 class="hero-subtitle">拿破仑俄国远征</h2>
          <p class="hero-desc">
            探索历史上最具悲剧性的军事行动<br/>
            422,000人出发，仅10,000人生还
          </p>
        </div>

        <div class="nav-cards">
          <div class="nav-card featured" @click="navigateTo('/game')">
            <span class="card-icon">🎮</span>
            <h4>绝望的行军</h4>
            <p>体验1812远征</p>
          </div>
          <div class="nav-card" @click="navigateTo('/dashboard')">
            <span class="card-icon">📊</span>
            <h4>单屏仪表盘</h4>
            <p>多视图联动分析</p>
          </div>
          <div class="nav-card" @click="navigateTo('/visualization')">
            <span class="card-icon">🗺</span>
            <h4>滚动叙事</h4>
            <p>交互式地图故事</p>
          </div>
          <div class="nav-card" @click="navigateTo('/reading')">
            <span class="card-icon">📖</span>
            <h4>历史档案</h4>
            <p>详细战役记录</p>
          </div>
        </div>

        <!-- 滚动提示 -->
        <div class="scroll-hint">
          <span>向下滚动探索战役地图</span>
          <div class="scroll-arrow">↓</div>
        </div>
      </div>
    </section>

    <!-- 第二屏：全屏交互地图 -->
    <section class="map-screen" :class="{ 'active': isMapMode }">
      <div class="map-container" ref="mapContainer"></div>
      
      <!-- 地图模式下的导航栏 -->
      <div class="map-nav" :class="{ 'visible': isMapMode }">
        <button class="nav-btn back-top" @click="scrollToTop">
          ↑ 返回顶部
        </button>
        <div class="nav-links">
          <router-link to="/visualization" class="nav-link">可视化分析</router-link>
          <router-link to="/reading" class="nav-link">历史档案</router-link>
        </div>
      </div>

      <!-- 地图说明面板 -->
      <div class="map-info-panel" :class="{ 'visible': isMapMode }">
        <h3>1812年俄国战役</h3>
        <p>点击地图上的标记点查看战役详情</p>
        <div class="legend">
          <div class="legend-item">
            <span class="dot advance"></span>进攻阶段战役
          </div>
          <div class="legend-item">
            <span class="dot retreat"></span>撤退阶段战役
          </div>
          <div class="legend-item">
            <span class="line advance"></span>进攻路线
          </div>
          <div class="legend-item">
            <span class="line retreat"></span>撤退路线
          </div>
        </div>
      </div>

      <!-- 战役快捷列表 -->
      <div class="battle-list" :class="{ 'visible': isMapMode }">
        <h4>关键战役</h4>
        <div class="battle-items">
          <div 
            v-for="battle in keyBattles" 
            :key="battle.id"
            class="battle-item"
            :class="battle.phase"
            @click="goToBattle(battle.id)"
            @mouseenter="highlightBattle(battle)"
            @mouseleave="unhighlightBattle()"
          >
            <span class="battle-date">{{ battle.date.split('年')[1] || battle.date }}</span>
            <span class="battle-name">{{ battle.title }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 信息浮窗 -->
    <div v-if="infoPanel.visible" class="info-panel" @click.self="closeInfoPanel">
      <div class="info-content">
        <button class="close-btn" @click="closeInfoPanel">×</button>
        <h3>{{ infoPanel.title }}</h3>
        <div v-html="infoPanel.content"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { napoleonAdvance, napoleonRetreat } from '../stores/campaignData.js'
import { keyBattles } from '../stores/battlesData.js'

const router = useRouter()
const pageRef = ref(null)
const mapContainer = ref(null)
let map = null
let battleMarkers = {}

const isMapMode = ref(false)

const infoPanel = reactive({
  visible: false,
  title: '',
  content: ''
})

const infoData = {
  corps: {
    title: '军团编制 / Order of Battle',
    content: `
      <p><strong>大军团 (Grande Armée) 1812年编制：</strong></p>
      <ul>
        <li>帝国近卫军 - 47,000人</li>
        <li>第1军(达武) - 72,000人</li>
        <li>第2军(乌迪诺) - 37,000人</li>
        <li>第3军(内伊) - 39,000人</li>
        <li>第4军(欧仁) - 45,000人</li>
        <li>骑兵预备队 - 40,000人</li>
      </ul>
      <p>总计约422,000人参与进攻</p>
    `
  }
}

function handleScroll() {
  const scrollY = window.scrollY
  const windowHeight = window.innerHeight
  
  // 当滚动超过半个屏幕高度时切换到地图模式
  if (scrollY > windowHeight * 0.3) {
    if (!isMapMode.value) {
      isMapMode.value = true
      nextTick(() => {
        if (!map && mapContainer.value) {
          initMap()
        } else if (map) {
          map.invalidateSize()
        }
      })
    }
  } else {
    isMapMode.value = false
  }
}

function initMap() {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: [54.5, 31],
    zoom: 5,
    zoomControl: true,
    attributionControl: false,
    minZoom: 4,
    maxZoom: 12
  })

  // 深色主题瓦片
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  // 绘制进攻路线
  const advanceCoords = napoleonAdvance.map(p => [p.lat, p.lon])
  L.polyline(advanceCoords, {
    color: '#D4A017',
    weight: 5,
    opacity: 0.9
  }).addTo(map)

  // 绘制撤退路线
  const retreatCoords = napoleonRetreat.map(p => [p.lat, p.lon])
  L.polyline(retreatCoords, {
    color: '#C0392B',
    weight: 4,
    opacity: 0.8,
    dashArray: '12, 8'
  }).addTo(map)

  // 添加战役标记点
  keyBattles.forEach(battle => {
    const isAdvance = battle.phase === 'advance'
    const markerColor = isAdvance ? '#D4A017' : '#C0392B'
    const markerSize = battle.type === 'major_battle' ? 14 : 10

    const marker = L.circleMarker([battle.location.lat, battle.location.lon], {
      radius: markerSize,
      fillColor: markerColor,
      color: '#FFF',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(map)

    // Tooltip
    marker.bindTooltip(`
      <div class="map-tooltip">
        <strong>${battle.title}</strong><br/>
        <span>${battle.date}</span><br/>
        <em>点击查看详情</em>
      </div>
    `, {
      direction: 'top',
      offset: [0, -12],
      className: 'custom-tooltip'
    })

    // 点击跳转
    marker.on('click', () => {
      router.push(`/battle/${battle.id}`)
    })

    // 悬停效果
    marker.on('mouseover', function() {
      this.setRadius(markerSize + 5)
      this.setStyle({ weight: 3 })
    })
    marker.on('mouseout', function() {
      this.setRadius(markerSize)
      this.setStyle({ weight: 2 })
    })

    battleMarkers[battle.id] = marker
  })

  // 添加城市标签
  const cities = [
    { name: '莫斯科', lat: 55.8, lon: 37.6 },
    { name: '斯摩棱斯克', lat: 54.8, lon: 32.0 },
    { name: '维尔纽斯', lat: 54.7, lon: 25.3 }
  ]

  cities.forEach(city => {
    L.marker([city.lat, city.lon], {
      icon: L.divIcon({
        className: 'city-label',
        html: `<span>${city.name}</span>`,
        iconSize: [80, 20]
      })
    }).addTo(map)
  })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function highlightBattle(battle) {
  const marker = battleMarkers[battle.id]
  if (marker && map) {
    marker.setRadius(18)
    marker.setStyle({ fillColor: '#FFD700', weight: 3 })
    map.panTo([battle.location.lat, battle.location.lon], { animate: true })
  }
}

function unhighlightBattle() {
  keyBattles.forEach(battle => {
    const marker = battleMarkers[battle.id]
    if (marker) {
      const isAdvance = battle.phase === 'advance'
      const markerSize = battle.type === 'major_battle' ? 14 : 10
      marker.setRadius(markerSize)
      marker.setStyle({ 
        fillColor: isAdvance ? '#D4A017' : '#C0392B',
        weight: 2 
      })
    }
  })
}

function goToBattle(id) {
  router.push(`/battle/${id}`)
}

function navigateTo(path) {
  router.push(path)
}

function showInfo(type) {
  const data = infoData[type]
  if (data) {
    infoPanel.title = data.title
    infoPanel.content = data.content
    infoPanel.visible = true
  }
}

function closeInfoPanel() {
  infoPanel.visible = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 页面初始化时检查滚动位置
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.home-page {
  min-height: 200vh;
  background: #0D0D0D;
  color: #E8E0D5;
}

/* 第一屏：欢迎内容 */
.welcome-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #0D0D0D 0%, #1A1510 100%);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.welcome-screen.fade-out {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-30px);
}

.welcome-content {
  text-align: center;
  padding: 40px;
}

.hero-section {
  margin-bottom: 60px;
}

.hero-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 8rem;
  font-weight: 700;
  color: #B8860B;
  margin: 0;
  text-shadow: 0 4px 20px rgba(184, 134, 11, 0.3);
  letter-spacing: 0.1em;
}

.hero-subtitle {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 2.5rem;
  font-weight: 400;
  color: #D4C4B0;
  margin: 15px 0;
}

.hero-desc {
  font-size: 1.2rem;
  line-height: 2;
  color: #A09080;
}

/* 导航卡片 */
.nav-cards {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-bottom: 60px;
}

.nav-card {
  background: rgba(45, 45, 45, 0.6);
  border: 1px solid rgba(184, 134, 11, 0.3);
  border-radius: 12px;
  padding: 25px 35px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 160px;
}

.nav-card:hover {
  background: rgba(184, 134, 11, 0.15);
  border-color: #B8860B;
  transform: translateY(-5px);
}

.nav-card.featured {
  border-color: #B8860B;
  background: rgba(184, 134, 11, 0.1);
}

.nav-card.featured:hover {
  background: rgba(184, 134, 11, 0.25);
  box-shadow: 0 0 20px rgba(184, 134, 11, 0.3);
}

.card-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
}

.nav-card h4 {
  font-family: 'Playfair Display', 'Georgia', serif;
  margin: 0 0 8px;
  color: #E8E0D5;
  font-size: 1.1rem;
}

.nav-card p {
  margin: 0;
  font-size: 0.85rem;
  color: #A09080;
}

/* 滚动提示 */
.scroll-hint {
  animation: bounce 2s infinite;
}

.scroll-hint span {
  display: block;
  font-size: 0.95rem;
  color: #B8860B;
  margin-bottom: 10px;
}

.scroll-arrow {
  font-size: 1.5rem;
  color: #B8860B;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

/* 第二屏：地图 */
.map-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s ease;
}

.map-screen.active {
  opacity: 1;
  pointer-events: auto;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* 地图导航栏 */
.map-nav {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 25px;
  background: rgba(13, 13, 13, 0.9);
  border: 1px solid rgba(184, 134, 11, 0.4);
  border-radius: 30px;
  backdrop-filter: blur(10px);
  opacity: 0;
  transition: opacity 0.4s ease 0.3s;
  z-index: 1000;
}

.map-nav.visible {
  opacity: 1;
}

.nav-btn {
  background: none;
  border: 1px solid rgba(184, 134, 11, 0.5);
  color: #B8860B;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: rgba(184, 134, 11, 0.2);
}

.nav-links {
  display: flex;
  gap: 15px;
}

.nav-link {
  color: #D4C4B0;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 8px 15px;
  border-radius: 15px;
  transition: all 0.3s;
}

.nav-link:hover {
  background: rgba(184, 134, 11, 0.2);
  color: #B8860B;
}

/* 地图信息面板 */
.map-info-panel {
  position: absolute;
  top: 80px;
  left: 20px;
  background: rgba(13, 13, 13, 0.9);
  border: 1px solid rgba(184, 134, 11, 0.4);
  border-radius: 12px;
  padding: 20px;
  max-width: 220px;
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.4s ease 0.4s;
  z-index: 1000;
}

.map-info-panel.visible {
  opacity: 1;
  transform: translateX(0);
}

.map-info-panel h3 {
  font-family: 'Playfair Display', 'Georgia', serif;
  color: #B8860B;
  margin: 0 0 10px;
  font-size: 1.1rem;
}

.map-info-panel p {
  color: #A09080;
  font-size: 0.85rem;
  margin: 0 0 15px;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  color: #D4C4B0;
}

.legend-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #FFF;
}

.legend-item .dot.advance { background: #D4A017; }
.legend-item .dot.retreat { background: #C0392B; }

.legend-item .line {
  width: 25px;
  height: 4px;
}

.legend-item .line.advance { background: #D4A017; }
.legend-item .line.retreat { 
  background: repeating-linear-gradient(90deg, #C0392B 0, #C0392B 8px, transparent 8px, transparent 12px);
}

/* 战役列表 */
.battle-list {
  position: absolute;
  top: 80px;
  right: 20px;
  background: rgba(13, 13, 13, 0.9);
  border: 1px solid rgba(184, 134, 11, 0.4);
  border-radius: 12px;
  padding: 15px;
  max-width: 260px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.4s ease 0.5s;
  z-index: 1000;
}

.battle-list.visible {
  opacity: 1;
  transform: translateX(0);
}

.battle-list h4 {
  font-family: 'Playfair Display', 'Georgia', serif;
  color: #B8860B;
  margin: 0 0 12px;
  font-size: 1rem;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
}

.battle-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.battle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.battle-item:hover {
  background: rgba(184, 134, 11, 0.15);
}

.battle-item.advance {
  border-left-color: #D4A017;
}

.battle-item.retreat {
  border-left-color: #C0392B;
}

.battle-date {
  font-size: 0.75rem;
  color: #A09080;
  min-width: 65px;
}

.battle-name {
  font-size: 0.9rem;
  color: #E8E0D5;
}

/* 信息浮窗 */
.info-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.info-content {
  background: #1A1A1A;
  border: 2px solid #B8860B;
  border-radius: 15px;
  padding: 35px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.info-content h3 {
  font-family: 'Playfair Display', 'Georgia', serif;
  color: #B8860B;
  margin-top: 0;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #A09080;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover {
  color: #E8E0D5;
}

.info-content :deep(ul) {
  padding-left: 20px;
}

.info-content :deep(li) {
  margin-bottom: 8px;
}

/* Leaflet 自定义样式 */
:deep(.custom-tooltip) {
  background: rgba(13, 13, 13, 0.95) !important;
  border: 1px solid #B8860B !important;
  border-radius: 8px !important;
  padding: 12px 16px !important;
  color: #E8E0D5 !important;
  font-size: 0.9rem !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
}

:deep(.map-tooltip strong) {
  color: #B8860B;
  font-size: 1rem;
  display: block;
  margin-bottom: 4px;
}

:deep(.map-tooltip span) {
  color: #A09080;
}

:deep(.map-tooltip em) {
  color: #D4A017;
  font-size: 0.8rem;
}

:deep(.city-label) {
  background: transparent !important;
  border: none !important;
}

:deep(.city-label span) {
  color: #D4C4B0;
  font-size: 0.85rem;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

:deep(.leaflet-control-zoom) {
  border: 1px solid rgba(184, 134, 11, 0.5) !important;
  border-radius: 8px !important;
  overflow: hidden;
}

:deep(.leaflet-control-zoom a) {
  background: rgba(13, 13, 13, 0.9) !important;
  color: #B8860B !important;
  border-bottom: 1px solid rgba(184, 134, 11, 0.3) !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: rgba(184, 134, 11, 0.2) !important;
}

/* 滚动条样式 */
.battle-list::-webkit-scrollbar {
  width: 6px;
}

.battle-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.battle-list::-webkit-scrollbar-thumb {
  background: rgba(184, 134, 11, 0.5);
  border-radius: 3px;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 5rem;
  }
  
  .hero-subtitle {
    font-size: 1.8rem;
  }
  
  .nav-cards {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-card {
    width: 200px;
  }
  
  .map-info-panel,
  .battle-list {
    display: none;
  }
  
  .map-nav {
    padding: 10px 15px;
  }
}
</style>
