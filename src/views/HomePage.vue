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
          <div class="nav-card" @click="navigateTo('/game')">
            <span class="card-icon">🎮</span>
            <h4>绝望的行军</h4>
            <p>体验1812远征</p>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pageRef = ref(null)

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
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #0D0D0D;
  color: #E8E0D5;
}

/* 第一屏：欢迎内容 */
.welcome-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0D0D0D 0%, #1A1510 100%);
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
  .welcome-content {
    padding: 20px;
  }
  
  .hero-section {
    margin-bottom: 40px;
  }
  
  .hero-title {
    font-size: 4rem;
  }
  
  .hero-subtitle {
    font-size: 1.4rem;
  }
  
  .hero-desc {
    font-size: 1rem;
    line-height: 1.8;
  }
  
  .nav-cards {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .nav-card {
    width: 85%;
    max-width: 280px;
    padding: 20px 25px;
    min-width: unset;
  }
  
  .card-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  .nav-card h4 {
    font-size: 1rem;
  }
  
  .nav-card p {
    font-size: 0.8rem;
  }
  
  .info-content {
    margin: 20px;
    padding: 25px;
    max-width: calc(100% - 40px);
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-desc {
    font-size: 0.9rem;
  }
  
  .nav-card {
    width: 90%;
    padding: 18px 20px;
  }
}
</style>
