<template>
  <div class="reading-page">
    <!-- 返回首页 -->
    <router-link to="/" class="back-home">
      <span class="back-icon">←</span>
      <span class="back-text">首页</span>
    </router-link>

    <!-- 页面标题 -->
    <header class="reading-header">
      <h1>历史档案室 / Archives & Library</h1>
      <p class="subtitle">1812年拿破仑俄国远征详细记录</p>
    </header>

    <div class="reading-layout">
      <!-- 左侧目录 -->
      <nav class="toc-sidebar">
        <h3 class="toc-title">📜 目录</h3>
        <ul class="toc-list">
          <li 
            v-for="(section, index) in sections" 
            :key="index"
            :class="{ active: currentSection === index }"
            @click="scrollToSection(index)"
          >
            <span class="toc-date">{{ section.date }}</span>
            <span class="toc-name">{{ section.title }}</span>
          </li>
        </ul>
      </nav>

      <!-- 主阅读区 -->
      <main class="reading-content">
        <article 
          v-for="(section, index) in sections" 
          :key="index"
          :ref="el => sectionRefs[index] = el"
          class="content-section"
        >
          <div class="section-header">
            <span class="section-date">{{ section.date }}</span>
            <h2 class="section-title">{{ section.title }}</h2>
          </div>
          
          <div class="section-body" v-html="section.content"></div>

          <!-- 相关图片 -->
          <div v-if="section.images && section.images.length" class="section-gallery">
            <div 
              v-for="(img, imgIndex) in section.images" 
              :key="imgIndex"
              class="gallery-item"
              @click="openImageModal(img)"
            >
              <img :src="img.src" :alt="img.caption" />
              <span class="img-caption">{{ img.caption }}</span>
            </div>
          </div>

          <!-- 关键人物卡片 -->
          <div v-if="section.figures && section.figures.length" class="figures-row">
            <div 
              v-for="(figure, fIndex) in section.figures" 
              :key="fIndex"
              class="figure-card"
              @click="showFigureDetail(figure)"
            >
              <div class="figure-avatar">{{ figure.emoji || '👤' }}</div>
              <div class="figure-info">
                <strong>{{ figure.name }}</strong>
                <span>{{ figure.role }}</span>
              </div>
            </div>
          </div>
        </article>

        <!-- 参考资料 -->
        <section class="references">
          <h3>参考资料 / References</h3>
          <ul>
            <li>Charles Joseph Minard, Carte figurative (1869)</li>
            <li>Adam Zamoyski, 1812: Napoleon's Fatal March on Moscow</li>
            <li>Wikipedia: French invasion of Russia</li>
            <li>Dominic Lieven, Russia Against Napoleon</li>
          </ul>
        </section>
      </main>

      <!-- 右侧信息栏 -->
      <aside class="info-sidebar">
        <div class="quick-stats">
          <h3>📊 战役概要</h3>
          <div class="stat-item">
            <span class="stat-label">出征兵力</span>
            <span class="stat-value">422,000</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">幸存人数</span>
            <span class="stat-value warning">~10,000</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">战役时长</span>
            <span class="stat-value">197天</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">行军距离</span>
            <span class="stat-value">~2,400km</span>
          </div>
        </div>

        <div class="key-dates">
          <h3>📅 关键日期</h3>
          <div class="date-item" v-for="date in keyDates" :key="date.date">
            <span class="date">{{ date.date }}</span>
            <span class="event">{{ date.event }}</span>
          </div>
        </div>

        <div class="quick-nav">
          <button class="nav-btn" @click="$router.push('/visualization')">
            🗺 查看可视化
          </button>
        </div>
      </aside>
    </div>

    <!-- 图片模态框 -->
    <div v-if="imageModal.visible" class="image-modal" @click.self="closeImageModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeImageModal">×</button>
        <img :src="imageModal.src" :alt="imageModal.caption" />
        <p class="modal-caption">{{ imageModal.caption }}</p>
      </div>
    </div>

    <!-- 人物详情浮窗 -->
    <div v-if="figureDetail.visible" class="figure-modal" @click.self="closeFigureDetail">
      <div class="modal-content">
        <button class="close-btn" @click="closeFigureDetail">×</button>
        <div class="figure-header">
          <span class="figure-emoji">{{ figureDetail.data?.emoji || '👤' }}</span>
          <div>
            <h3>{{ figureDetail.data?.name }}</h3>
            <p>{{ figureDetail.data?.role }}</p>
          </div>
        </div>
        <div class="figure-bio" v-html="figureDetail.data?.bio"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const currentSection = ref(0)
const sectionRefs = ref([])

const imageModal = reactive({
  visible: false,
  src: '',
  caption: ''
})

const figureDetail = reactive({
  visible: false,
  data: null
})

const keyDates = [
  { date: '6月24日', event: '渡过涅曼河' },
  { date: '8月16-18日', event: '斯摩棱斯克战役' },
  { date: '9月7日', event: '博罗季诺战役' },
  { date: '9月14日', event: '进入莫斯科' },
  { date: '10月19日', event: '撤离莫斯科' },
  { date: '11月26-29日', event: '别列津纳河渡河' },
  { date: '12月14日', event: '残部撤出俄国' }
]

const sections = [
  {
    date: '1812年6月',
    title: '渡过涅曼河 - 入侵开始',
    content: `
      <p>1812年6月24日，拿破仑率领由法国、意大利、波兰、德意志诸邦等组成的<strong>大军团（Grande Armée）</strong>，
      约<strong>422,000人</strong>渡过涅曼河，入侵俄罗斯帝国。</p>
      <p>这是拿破仑帝国最强大的军事力量展示，也是历史上规模最大的入侵行动之一。</p>
      <blockquote>"我来是为了结束北方巨人的命运。" — 拿破仑</blockquote>
      <p>然而，俄军统帅巴克莱·德·托利采取了<strong>战略撤退</strong>策略，避免与法军正面决战，
      同时实施焦土政策，烧毁沿途一切可被法军利用的物资。</p>
    `,
    figures: [
      { name: '拿破仑', role: '法兰西皇帝', emoji: '👑', bio: '<p>拿破仑·波拿巴，法兰西第一帝国皇帝，军事天才。1812年亲率大军入侵俄国，最终遭遇惨败。</p>' },
      { name: '巴克莱·德·托利', role: '俄军统帅', emoji: '⚔️', bio: '<p>俄国陆军元帅，战争初期的俄军总指挥，主张战略撤退与焦土政策。</p>' }
    ]
  },
  {
    date: '1812年8月',
    title: '斯摩棱斯克战役',
    content: `
      <p>8月16日至19日，法军围攻俄罗斯西部战略重镇<strong>斯摩棱斯克</strong>。</p>
      <p>法军投入约<strong>130,000人</strong>，俄军守城部队初期约<strong>45,000人</strong>，
      后巴格拉季昂亲王援军赶到，增至<strong>105,000人</strong>。</p>
      <p>经过三天激战，俄军决定实施焦土政策后有序撤离。法军虽占领斯摩棱斯克，
      但城市已被焚毁大半，无任何可补给物资。</p>
      <p><strong>伤亡统计：</strong></p>
      <ul>
        <li>法军伤亡约14,000人</li>
        <li>俄军伤亡约8,000人</li>
      </ul>
    `,
    figures: [
      { name: '达武元帅', role: '第1军指挥官', emoji: '🎖️', bio: '<p>路易·尼古拉·达武，法国元帅，被称为"铁元帅"，第1军指挥官。</p>' },
      { name: '巴格拉季昂亲王', role: '第2西方集团军司令', emoji: '⚔️', bio: '<p>彼得·巴格拉季昂，格鲁吉亚王族后裔，俄军名将，后在博罗季诺战役中阵亡。</p>' }
    ]
  },
  {
    date: '1812年9月7日',
    title: '博罗季诺战役 - 血战莫斯科门户',
    content: `
      <p>9月7日，在莫斯科以西约125公里的<strong>博罗季诺村</strong>，爆发了拿破仑侵俄战争中规模最大、最血腥的会战。</p>
      <p><strong>双方兵力：</strong></p>
      <ul>
        <li>法军约133,000人，配备587门火炮</li>
        <li>俄军约127,000人，配备640门火炮</li>
      </ul>
      <p>战役从清晨6时30分打响，双方围绕<strong>谢苗诺夫斯卡娅棱堡</strong>和<strong>拉耶夫斯基炮台</strong>
      展开反复争夺，战斗异常惨烈。</p>
      <p><strong>伤亡统计：</strong></p>
      <ul>
        <li>法军伤亡约37,000人</li>
        <li>俄军伤亡约38,000人</li>
      </ul>
      <p>从战术上看，法军取得胜利；但从战略上看，法军未能歼灭俄军主力，自身元气大伤。</p>
      <blockquote>"在所有我指挥过的战役中，莫斯科城下的战役是最可怕的。" — 拿破仑</blockquote>
    `,
    figures: [
      { name: '库图佐夫', role: '俄军总司令', emoji: '🎖️', bio: '<p>米哈伊尔·库图佐夫，俄国陆军元帅，博罗季诺战役后接替巴克莱成为俄军总司令。</p>' },
      { name: '内伊元帅', role: '第3军指挥官', emoji: '⚔️', bio: '<p>米歇尔·内伊，被称为"勇者中的勇者"，法国元帅，第3军指挥官。</p>' }
    ]
  },
  {
    date: '1812年9-10月',
    title: '莫斯科大火与撤退',
    content: `
      <p>9月14日，法军进入莫斯科，却发现这座城市已成为一座<strong>空城</strong>。</p>
      <p>当晚，莫斯科爆发大火，持续数日，大火烧毁了城市的三分之二，
      法军期望的补给和休整化为泡影。</p>
      <p>拿破仑在莫斯科等待了五周，希望沙皇亚历山大一世求和，但始终未得到回应。</p>
      <p>10月19日，拿破仑被迫下令撤退。此时法军约<strong>100,000人</strong>，
      但物资匮乏、士气低落。</p>
      <p>小雅罗斯拉韦茨战役后，南撤卡卢加的道路被俄军封锁，
      法军被迫沿来时已被焦土政策破坏的<strong>斯摩棱斯克大道</strong>撤退。</p>
    `
  },
  {
    date: '1812年11月',
    title: '严寒与灾难性撤退',
    content: `
      <p>11月6日，俄罗斯迎来第一场暴风雪，气温骤降至<strong>-20°C</strong>以下。</p>
      <p>缺乏冬装的法军士兵大量冻伤、冻死，非战斗减员远超战斗减员。</p>
      <h4>维亚济马战役 (11月3-4日)</h4>
      <p>法军损失约8,000人，撤退彻底演变为溃退。</p>
      <h4>克拉斯诺耶阻击战 (11月15-17日)</h4>
      <p>内伊元帅指挥的后卫部队几乎全军覆没，法军损失约20,000人。</p>
      <h4>别列津纳河渡河战 (11月26-29日)</h4>
      <p>在-25°C至-30°C的严寒中，法军工兵在冰冷的河水中架桥，
      大量工兵冻伤、溺亡。最终约20,000人成功渡河，
      留在东岸的约15,000人被俄军俘虏或冻死。</p>
      <p><strong>法军损失约30,000人</strong>（阵亡5,000人，被俘12,000人，冻死溺亡10,000人）</p>
    `
  },
  {
    date: '1812年12月',
    title: '战争结束 - 帝国的终结开始',
    content: `
      <p>12月1日，拿破仑得知巴黎政治危机，秘密离开残部返回巴黎。</p>
      <p>12月中旬，法军残部撤至涅曼河以西，彻底退出俄罗斯境内。</p>
      <h3>战争损失统计</h3>
      <table class="stats-table">
        <tr><td>法军出征兵力</td><td>~600,000人</td></tr>
        <tr><td>法军损失</td><td>~570,000人</td></tr>
        <tr><td>火炮损失</td><td>1,200余门</td></tr>
        <tr><td>俄军损失</td><td>~300,000人</td></tr>
      </table>
      <p>这场战争彻底打破了拿破仑帝国的军事霸权，为第六次反法同盟的形成
      和拿破仑最终的垮台埋下伏笔。</p>
      <blockquote>"从伟大到荒谬，只有一步之遥。" — 拿破仑</blockquote>
    `
  }
]

function scrollToSection(index) {
  currentSection.value = index
  const el = sectionRefs.value[index]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function openImageModal(img) {
  imageModal.src = img.src
  imageModal.caption = img.caption
  imageModal.visible = true
}

function closeImageModal() {
  imageModal.visible = false
}

function showFigureDetail(figure) {
  figureDetail.data = figure
  figureDetail.visible = true
}

function closeFigureDetail() {
  figureDetail.visible = false
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = sectionRefs.value.findIndex(el => el === entry.target)
          if (index !== -1) {
            currentSection.value = index
          }
        }
      })
    },
    { threshold: 0.3 }
  )

  sectionRefs.value.forEach(el => {
    if (el) observer.observe(el)
  })
})
</script>

<style scoped>
.reading-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
  color: #E8E0D5;
}

.back-home {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(184, 134, 11, 0.5);
  border-radius: 25px;
  color: #B8860B;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.back-home:hover {
  background: rgba(184, 134, 11, 0.2);
  border-color: #B8860B;
}

.reading-header {
  text-align: center;
  padding: 80px 20px 40px;
  background: linear-gradient(180deg, rgba(184, 134, 11, 0.1) 0%, transparent 100%);
}

.reading-header h1 {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 2.5rem;
  color: #B8860B;
  margin: 0 0 10px;
}

.subtitle {
  color: #A09080;
  font-size: 1.1rem;
}

.reading-layout {
  display: grid;
  grid-template-columns: 250px 1fr 280px;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

/* 左侧目录 */
.toc-sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.toc-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  color: #B8860B;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  padding: 12px 15px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.toc-list li:hover,
.toc-list li.active {
  background: rgba(184, 134, 11, 0.1);
  border-left-color: #B8860B;
}

.toc-date {
  display: block;
  font-size: 0.75rem;
  color: #A09080;
  margin-bottom: 3px;
}

.toc-name {
  font-size: 0.9rem;
}

/* 主阅读区 */
.reading-content {
  background: rgba(45, 45, 45, 0.5);
  border-radius: 15px;
  padding: 40px;
}

.content-section {
  margin-bottom: 60px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(184, 134, 11, 0.2);
}

.content-section:last-of-type {
  border-bottom: none;
}

.section-header {
  margin-bottom: 25px;
}

.section-date {
  display: inline-block;
  background: rgba(184, 134, 11, 0.2);
  color: #B8860B;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.section-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.8rem;
  color: #E8E0D5;
  margin: 0;
}

.section-body {
  line-height: 1.9;
  font-size: 1.05rem;
}

.section-body :deep(p) {
  margin-bottom: 16px;
}

.section-body :deep(blockquote) {
  border-left: 4px solid #B8860B;
  padding-left: 20px;
  margin: 25px 0;
  font-style: italic;
  color: #D4C4B0;
}

.section-body :deep(ul) {
  padding-left: 25px;
  margin: 15px 0;
}

.section-body :deep(li) {
  margin-bottom: 8px;
}

.section-body :deep(.stats-table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.section-body :deep(.stats-table td) {
  padding: 12px;
  border: 1px solid rgba(184, 134, 11, 0.3);
}

.section-body :deep(.stats-table td:first-child) {
  background: rgba(184, 134, 11, 0.1);
  font-weight: 600;
}

/* 人物卡片 */
.figures-row {
  display: flex;
  gap: 15px;
  margin-top: 25px;
  flex-wrap: wrap;
}

.figure-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(184, 134, 11, 0.3);
  border-radius: 10px;
  padding: 12px 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.figure-card:hover {
  border-color: #B8860B;
  background: rgba(184, 134, 11, 0.1);
}

.figure-avatar {
  font-size: 2rem;
}

.figure-info strong {
  display: block;
  color: #E8E0D5;
}

.figure-info span {
  font-size: 0.85rem;
  color: #A09080;
}

/* 右侧信息栏 */
.info-sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
}

.info-sidebar > div {
  background: rgba(45, 45, 45, 0.8);
  border: 1px solid rgba(184, 134, 11, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-sidebar h3 {
  font-family: 'Playfair Display', 'Georgia', serif;
  color: #B8860B;
  margin: 0 0 15px;
  font-size: 1.1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #A09080;
}

.stat-value {
  font-weight: 600;
  color: #E8E0D5;
}

.stat-value.warning {
  color: #C0392B;
}

.date-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  font-size: 0.9rem;
}

.date-item .date {
  color: #B8860B;
  min-width: 70px;
}

.nav-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #B8860B 0%, #8B6914 100%);
  border: none;
  border-radius: 8px;
  color: #1A1A1A;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: linear-gradient(135deg, #D4A017 0%, #B8860B 100%);
}

/* 参考资料 */
.references {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(184, 134, 11, 0.3);
}

.references h3 {
  font-family: 'Playfair Display', 'Georgia', serif;
  color: #B8860B;
  margin-bottom: 15px;
}

.references ul {
  padding-left: 20px;
  color: #A09080;
}

.references li {
  margin-bottom: 8px;
}

/* 模态框 */
.image-modal,
.figure-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #2D2D2D;
  border: 2px solid #B8860B;
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
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

.figure-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.figure-emoji {
  font-size: 3rem;
}

.figure-header h3 {
  margin: 0;
  color: #B8860B;
}

.figure-header p {
  margin: 5px 0 0;
  color: #A09080;
}

@media (max-width: 1024px) {
  .reading-layout {
    grid-template-columns: 1fr;
  }
  
  .toc-sidebar,
  .info-sidebar {
    position: static;
    display: none;
  }
}
</style>
