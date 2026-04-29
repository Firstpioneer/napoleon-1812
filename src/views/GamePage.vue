<template>
  <div class="game-page" :class="[seasonClass, { shaking: isShaking }]">
    <!-- 顶部状态栏 - 参照Dashboard风格 -->
    <header class="stats-header" v-if="gamePhase !== 'INTRO'">
      <div class="stat-card">
        <div class="stat-value">{{ formatNumber(troops) }}</div>
        <div class="stat-label">兵力</div>
        <div class="stat-bar"><div class="stat-fill" :style="{ width: hpPercent + '%' }"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-value loss">-{{ formatNumber(422000 - troops) }}</div>
        <div class="stat-label">累计损失</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="{ warning: discipline < 50, danger: discipline < 30 }">{{ discipline }}</div>
        <div class="stat-label">纪律</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="{ cold: temperature < 0, extreme: temperature < -20 }">{{ temperature }}°C</div>
        <div class="stat-label">气温</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ currentDate }}</div>
        <div class="stat-label">日期</div>
      </div>
      <div class="phase-badge" :class="phase">{{ phase === 'ADVANCE' ? '进攻阶段' : '撤退阶段' }}</div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <aside class="left-panel" v-if="gamePhase === 'PLAY'">
        <div class="panel-section">
          <div class="section-title">📍 当前位置</div>
          <div class="location-name">{{ currentNode.name }}</div>
          <div class="location-desc">{{ currentNode.desc }}</div>
        </div>
        
        <div class="panel-section" v-if="currentMarchInfo">
          <div class="section-title">🚶 下一段行程</div>
          <div class="march-info">{{ currentMarchInfo.from }} → {{ currentMarchInfo.to }}</div>
          <div class="march-desc">{{ currentMarchInfo.desc }}</div>
          <div class="march-day">预计 {{ currentMarchInfo.days }} 天</div>
        </div>
        
        <div class="panel-section" v-if="marchPreview">
          <div class="section-title">⚖️ 行动预估</div>
          <div class="march-day">{{ marchPreview.days }} 天 · 预计损失 {{ formatNumber(marchPreview.loss) }} 人</div>
          <div class="march-desc">气温 {{ marchPreview.temperature }}°C · {{ marchPreview.risk }}</div>
        </div>

        <div class="panel-section" v-if="totalRestDays > 0">
          <div class="section-title">🏕️ 休整记录</div>
          <div class="rest-info" :class="{ warning: totalRestDays >= 10 }">
            已休整 {{ totalRestDays }} / {{ MAX_REST_DAYS }} 天
          </div>
          <div class="rest-hint" v-if="totalRestDays >= 10">⚠️ 士兵们开始不耐烦了</div>
        </div>

        <div class="panel-section logs">
          <div class="section-title">📜 行军日志</div>
          <div class="log-list">
            <div v-for="(log, i) in logs" :key="i" class="log-item" :class="log.type">
              <span class="log-date">{{ log.date }}</span>
              <span class="log-text">{{ log.text }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中央地图区 -->
      <main class="map-container" v-if="gamePhase === 'PLAY'">
        <svg class="campaign-map" viewBox="0 0 800 350">
          <path :d="fullPath" class="route-base" fill="none" stroke-width="4"/>
          <path :d="traveledPath" class="route-traveled" :class="phase" fill="none" stroke-width="4"/>
          <g v-for="(node, idx) in nodes" :key="node.id">
            <circle :cx="node.x" :cy="node.y" :r="idx === currentNodeIdx ? 12 : 6" :class="['node', getNodeState(idx)]"/>
            <text :x="node.x" :y="node.y + 22" text-anchor="middle" class="node-label" :class="{ active: idx === currentNodeIdx }">{{ node.name }}</text>
          </g>
          <g class="napoleon-marker" :style="{ transform: `translate(${napoleonX}px, ${napoleonY - 30}px)` }">
            <text x="0" y="0" text-anchor="middle" font-size="24">🦅</text>
          </g>
        </svg>
        
        <!-- 警告提示 -->
        <div class="warnings" v-if="hasWarnings">
          <div v-if="discipline < 30" class="warning-item">⚠️ 纪律崩溃</div>
          <div v-if="temperature < -25" class="warning-item">❄️ 极寒</div>
          <div v-if="troops < 50000" class="warning-item">💀 兵力告急</div>
        </div>
        
        <!-- 手机端操作按钮 -->
        <div class="mobile-actions" v-if="canAct">
          <button class="btn-mobile-primary" @click="continueMarch">
            {{ phase === 'ADVANCE' ? '继续行军 →' : '← 继续撤退' }}
            <span v-if="marchPreview" class="mobile-loss-hint">预计 -{{ formatNumber(marchPreview.loss) }}</span>
          </button>
          <button class="btn-mobile-secondary" @click="useSkill('restAndRecover')">🏕️ 休整</button>
          <button v-if="canInspire" class="btn-mobile-secondary" @click="useSkill('napoleonInspire')">👑 激励 ({{ inspiresLeft }})</button>
        </div>
      </main>

      <!-- 右侧操作面板 -->
      <aside class="right-panel" v-if="gamePhase === 'PLAY'">
        <div class="action-buttons" v-if="canAct">
          <button class="btn-primary" @click="continueMarch">
            {{ phase === 'ADVANCE' ? '继续行军 →' : '← 继续撤退' }}
          </button>
          <div v-if="marchPreview" class="loss-hint">
            预计本段损失: {{ formatNumber(marchPreview.loss) }} 人 · {{ marchPreview.days }} 天 · {{ marchPreview.temperature }}°C
          </div>
          <div v-if="marchPreview" class="risk-hint">{{ marchPreview.risk }}</div>
          <button class="btn-secondary" @click="useSkill('restAndRecover')">🏕️ 扎营休整</button>
          <button v-if="canInspire" class="btn-secondary" @click="useSkill('napoleonInspire')">
            👑 皇帝激励 ({{ inspiresLeft }})
          </button>
        </div>
        <div v-if="isAnimating" class="marching-hint">行军中...</div>
      </aside>
    </div>

    <!-- 伤害数字特效 -->
    <transition-group name="dmg" tag="div" class="damage-numbers">
      <div v-for="d in damages" :key="d.id" class="dmg-text" :class="d.type" :style="{ left: d.x + 'px', top: d.y + 'px' }">{{ d.text }}</div>
    </transition-group>

    <!-- Toast提示 -->
    <transition name="toast">
      <div v-if="toastMsg" class="toast" :class="toastType">{{ toastMsg }}</div>
    </transition>

    <!-- 开场界面 -->
    <div v-if="gamePhase === 'INTRO'" class="intro-overlay">
      <div class="intro-card">
        <h1>1812</h1>
        <h2>绝望的行军</h2>
        <p class="tagline">La Grande Armée</p>
        <div class="intro-text">
          <p>1812年6月，你率领422,000名士兵跨过涅曼河。</p>
          <p>目标：攻占莫斯科，迫使沙皇求和。</p>
          <p class="warning-text">然而，俄国的冬天正在等待...</p>
        </div>
        <div class="intro-buttons">
          <button class="btn-start" @click="startAdvance">开始远征</button>
          <button class="btn-back" @click="goHome">返回首页</button>
        </div>
      </div>
    </div>

    <!-- 莫斯科事件 -->
    <transition name="modal">
      <div v-if="showMoscowModal" class="modal-overlay">
        <div class="modal-card fire" role="dialog" aria-modal="true" aria-labelledby="moscow-title">
          <div class="modal-icon">🔥</div>
          <h2 id="moscow-title">莫斯科在燃烧</h2>
          <div class="moscow-story">
            <p>1812年9月14日，经过三个月的艰苦行军，你终于率军进入莫斯科...</p>
            <p class="highlight">但城市是空的。沙皇亚历山大一世拒绝投降，甚至拒绝谈判。</p>
            <p class="dramatic">火焰从四面八方升起！俄国总督罗斯托普钦下令焚城！</p>
            <div class="retreat-reasons">
              <h4>⚠️ 为什么必须撤退？</h4>
              <ul>
                <li>🏚️ <strong>城市被毁</strong>：莫斯科80%的建筑被烧毁，无法提供补给和住所</li>
                <li>❄️ <strong>冬天将至</strong>：俄国的冬天即将来临，气温将降至-30°C以下</li>
                <li>🍞 <strong>补给耗尽</strong>：军队的粮食和物资已经严重不足</li>
                <li>👑 <strong>沙皇拒降</strong>：亚历山大一世誓言"宁可退到西伯利亚也不投降"</li>
                <li>⚔️ <strong>俄军威胁</strong>：库图佐夫的俄军正在集结，准备切断退路</li>
              </ul>
              <p class="warning-text">在莫斯科多待一天，就意味着更多士兵将死于即将到来的严冬。</p>
            </div>
          </div>
          <button class="btn-confirm" @click="beginRetreat">开始撤退</button>
        </div>
      </div>
    </transition>

    <!-- 节点事件 -->
    <transition name="modal">
      <div v-if="currentEvent" class="modal-overlay">
        <div class="modal-card event" role="dialog" aria-modal="true" aria-labelledby="current-event-title">
          <div class="modal-icon">{{ currentEvent.icon }}</div>
          <h2 id="current-event-title">{{ currentEvent.title }}</h2>
          <p class="event-story">{{ currentEvent.story }}</p>
          <p v-if="currentEvent.historicalNote" class="historical-note">📜 {{ currentEvent.historicalNote }}</p>
          <div class="choices">
            <button class="choice-btn choice-a" @click="pickChoice('A')">
              <span class="choice-label">{{ currentEvent.choiceA.label }}</span>
              <span class="choice-hint">{{ currentEvent.choiceA.hint }}</span>
            </button>
            <button class="choice-btn choice-b" @click="pickChoice('B')">
              <span class="choice-label">{{ currentEvent.choiceB.label }}</span>
              <span class="choice-hint">{{ currentEvent.choiceB.hint }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 随机事件 -->
    <transition name="modal">
      <div v-if="betweenNodeEvent" class="modal-overlay">
        <div class="modal-card event" role="dialog" aria-modal="true" aria-labelledby="between-event-title">
          <div class="event-badge">随机事件</div>
          <div class="modal-icon">{{ betweenNodeEvent.icon }}</div>
          <h2 id="between-event-title">{{ betweenNodeEvent.title }}</h2>
          <p class="event-story">{{ betweenNodeEvent.story }}</p>
          <div class="choices">
            <button class="choice-btn choice-a" @click="pickBetweenNodeChoice('A')">
              <span class="choice-label">{{ betweenNodeEvent.choiceA.label }}</span>
              <span class="choice-hint">{{ betweenNodeEvent.choiceA.hint }}</span>
            </button>
            <button class="choice-btn choice-b" @click="pickBetweenNodeChoice('B')">
              <span class="choice-label">{{ betweenNodeEvent.choiceB.label }}</span>
              <span class="choice-hint">{{ betweenNodeEvent.choiceB.hint }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 哗变 -->
    <transition name="modal">
      <div v-if="showMutinyModal" class="modal-overlay">
        <div class="modal-card critical" role="dialog" aria-modal="true" aria-labelledby="mutiny-title">
          <div class="modal-icon">⚠️</div>
          <h2 id="mutiny-title">哗变！</h2>
          <p class="dramatic">纪律崩溃！士兵们开始互相抢劫，甚至攻击军官！</p>
          <button class="btn-confirm" @click="resolveMutiny">艰难恢复秩序</button>
        </div>
      </div>
    </transition>

    <!-- 皇帝病倒 -->
    <transition name="modal">
      <div v-if="showEmperorSickModal" class="modal-overlay">
        <div class="modal-card critical" role="dialog" aria-modal="true" aria-labelledby="emperor-sick-title">
          <div class="modal-icon">👑</div>
          <h2 id="emperor-sick-title">皇帝病倒了！</h2>
          <p class="dramatic">拿破仑因严寒和疲劳病倒，无法继续指挥。</p>
          <button class="btn-confirm" @click="closeEmperorSickModal">继续撤退</button>
        </div>
      </div>
    </transition>

    <!-- 结局 -->
    <div v-if="gamePhase === 'RESULT'" class="result-overlay">
      <div class="result-card">
        <h1>{{ endTitle }}</h1>
        <p class="result-subtitle">{{ endSubtitle }}</p>
        <div class="result-stats">
          <div class="result-row"><span>出发兵力</span><span>422,000</span></div>
          <div class="result-row"><span>归来兵力</span><span :class="{ zero: troops === 0 }">{{ formatNumber(troops) }}</span></div>
          <div class="result-row"><span>损失率</span><span class="loss">{{ lossPercent }}%</span></div>
        </div>
        <p class="result-quote">{{ endQuote }}</p>
        <div class="result-compare">
          <h4>与历史对比</h4>
          <div class="compare-bar"><span>你</span><div class="bar"><div class="fill you" :style="{ width: Math.max(1, hpPercent) + '%' }"></div></div><span>{{ formatNumber(troops) }}</span></div>
          <div class="compare-bar"><span>历史</span><div class="bar"><div class="fill history" style="width: 2.4%"></div></div><span>~10,000</span></div>
        </div>
        <div class="result-buttons">
          <button class="btn-primary" @click="restart">再试一次</button>
          <button class="btn-secondary" @click="goHome">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { eventPool, advanceRandomEvents, retreatRandomEvents, randomEvents } from '../stores/gameEvents.js'
import { BALANCE_CONFIG, calculateLoss, calculateDisciplineChange, calculateDailyLoss, calculateDiseaseSpread, calculateSupplyConsumption, checkMutiny, checkEmperorSick, canUseSkill } from '../stores/gameConfig.js'
import { nodeDistances, commanderSkills } from '../stores/gameState.js'

const router = useRouter()

// ==================== 游戏状态 ====================
const gamePhase = ref('INTRO')
const phase = ref('ADVANCE')
const isAnimating = ref(false)
const isShaking = ref(false)
const isMarching = ref(false)

// ==================== 核心资源 ====================
const troops = ref(422000)
const discipline = ref(100)
const napoleonHealth = ref(100)
const inspiresLeft = ref(3)

// ==================== 真实日期系统 ====================
// 历史起始日期：1812年6月24日
const startDate = new Date(1812, 5, 24) // 月份从0开始，5=6月
const currentGameDate = ref(new Date(1812, 5, 24))
const totalRestDays = ref(0) // 累计休整天数
const MAX_REST_DAYS = 15 // 最大休整天数阈值

function dateVariance(date, range) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return Math.floor((value - Math.floor(value)) * range)
}

function getTemperatureForDate(date) {
  const month = date.getMonth()
  const day = date.getDate()

  if (month === 5) return 22 + dateVariance(date, 4)
  if (month === 6) return 24 + dateVariance(date, 5)
  if (month === 7) return 20 + dateVariance(date, 6)
  if (month === 8) return 12 + dateVariance(date, 6)
  if (month === 9) {
    const progress = day / 31
    return Math.floor(5 - progress * 10 + dateVariance(date, 4))
  }
  if (month === 10) {
    const progress = day / 30
    return Math.floor(-5 - progress * 20 + dateVariance(date, 5))
  }
  if (month === 11) {
    const progress = day / 31
    return Math.floor(-20 - progress * 15 + dateVariance(date, 5))
  }
  return -30
}

// 根据日期计算气温
const temperature = computed(() => getTemperatureForDate(currentGameDate.value))

// 格式化日期显示
const currentDate = computed(() => {
  const d = currentGameDate.value
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日`
})

// 计算已过天数
const daysPassed = computed(() => {
  return Math.floor((currentGameDate.value - startDate) / (1000 * 60 * 60 * 24))
})

// ==================== 补给系统（后台计算，不显示） ====================
const supplies = reactive({ food: 100, ammunition: 100, medicine: 100, clothing: 100 })

// ==================== 疾病系统（后台计算，不显示） ====================
const armyHealth = reactive({
  healthy: 380000,
  infected: { typhus: 30000, dysentery: 10000, frostbite: 0, starvation: 2000 }
})

// ==================== 行军系统 ====================
const totalMarchDays = ref(0)

// ==================== 技能系统 ====================
const skillCooldowns = reactive({})
const skillUseCounts = reactive({})

// ==================== 事件系统 ====================
const currentEvent = ref(null)
const betweenNodeEvent = ref(null)
const eventTriggeredThisStep = ref(false)
const triggeredEventIds = ref(new Set())
const showMoscowModal = ref(false)
const showMutinyModal = ref(false)
const showEmperorSickModal = ref(false)

// ==================== 连锁反应系统 ====================
// 记录玩家的关键决策，影响后续事件
const chainEffects = reactive({
  // 进攻阶段决策
  horsesSlaughtered: false,      // 宰杀战马 → 后续战斗损失+20%，被追击+50%
  russiansCrushed: false,        // 击溃俄军 → 减少骚扰事件50%
  russiansMoraleDown: false,     // 俄军士气受挫 → 战斗损失-10%
  guardsUsedEarly: false,        // 投入近卫军 → 别列津纳额外损失8000
  slowAdvance: false,            // 延误 → 撤退时天气更冷
  fastAdvance: false,            // 快速推进 → 撤退时有更多时间
  diseaseControlled: false,      // 控制疫情 → 后续疾病减少
  diseaseSpread: false,          // 疫情扩散 → 后续疾病+50%
  strictDiscipline: false,       // 严明军纪 → 逃兵-50%
  looseDiscipline: false,        // 军纪涣散 → 逃兵+50%
  hasIntel: false,               // 有情报 → 发现补给站概率+50%
  
  // 撤退阶段决策
  tookSouthRoute: false,         // 选择南路 → 饥饿-50%，冻死-30%
  noSupplies: false,             // 无补给 → 饥饿+50%
  hasSupplies: false,            // 有补给 → 减少饥饿冻死
  hasWarmClothes: false,         // 有御寒衣物 → 冻死-40%
  abandonedRearguard: false,     // 抛弃后卫 → 哗变+30%，逃兵+50%
  rearguardProtected: false,     // 保护后卫 → 骚扰-40%
  savedNey: false,               // 救援内伊 → 战斗损失-15%
  abandonedNey: false,           // 放弃内伊 → 哗变+40%
  humanDisaster: false,          // 人道灾难 → 士气崩溃
  foundFood: false,              // 找到食物 → 减少饥饿
  napoleonLeft: false,           // 拿破仑离开
  napoleonStayed: false,         // 拿破仑留下
  
  // 累计效果
  totalDelayDays: 0,             // 累计延误天数
})

// 计算连锁效果对损失的影响
function getChainEffectMultiplier() {
  let multiplier = 1.0
  
  // 宰杀战马 → 战斗损失增加20%
  if (chainEffects.horsesSlaughtered) {
    multiplier *= 1.20
  }
  
  // 俄军士气受挫 → 战斗损失减少10%
  if (chainEffects.russiansMoraleDown) {
    multiplier *= 0.90
  }
  
  // 救援内伊 → 战斗损失减少15%
  if (chainEffects.savedNey) {
    multiplier *= 0.85
  }
  
  // 抛弃后卫/内伊 → 基础损失增加（士气低落）
  if (chainEffects.abandonedRearguard || chainEffects.abandonedNey) {
    multiplier *= 1.10
  }
  
  return multiplier
}

// ==================== 游戏统计 ====================
const gameStats = ref({ majorDecisions: 0, battles: 0, lowestTemp: 22, totalCasualties: 0 })

// ==================== 推进日期函数 ====================
function advanceDays(days) {
  const newDate = new Date(currentGameDate.value)
  newDate.setDate(newDate.getDate() + days)
  currentGameDate.value = newDate
  // 更新最低温度记录
  gameStats.value.lowestTemp = Math.min(gameStats.value.lowestTemp, temperature.value)
}

// ==================== 计算属性 ====================
const totalInfected = computed(() => Object.values(armyHealth.infected).reduce((a, b) => a + b, 0))
const infectionRate = computed(() => troops.value > 0 ? (totalInfected.value / troops.value * 100).toFixed(1) : 0)
const overallSupply = computed(() => Math.floor(supplies.food * 0.4 + supplies.ammunition * 0.2 + supplies.medicine * 0.2 + supplies.clothing * 0.2))
const currentMarchInfo = computed(() => currentNodeIdx.value < nodes.length - 1 ? nodeDistances[currentNodeIdx.value] || null : null)
const canAct = computed(() => !isAnimating.value && !currentEvent.value && !betweenNodeEvent.value)
const canInspire = computed(() => napoleonHealth.value > 30 && inspiresLeft.value > 0)
const hasWarnings = computed(() => discipline.value < 30 || temperature.value < -25 || troops.value < 50000)

// ==================== 地图节点 ====================
const nodes = [
  { id: 0, name: '涅曼河', x: 80, y: 280, desc: '出发点' },
  { id: 1, name: '维尔纽斯', x: 150, y: 240, desc: '立陶宛首府', event: 'ADV_VILNA' },
  { id: 2, name: '维捷布斯克', x: 230, y: 200, desc: '俄军后撤', event: 'ADV_SCORCHED' },
  { id: 3, name: '斯摩棱斯克', x: 340, y: 160, desc: '攻城战', event: 'ADV_SMOLENSK' },
  { id: 4, name: '博罗季诺', x: 470, y: 120, desc: '血腥会战', event: 'ADV_BORODINO' },
  { id: 5, name: '莫斯科', x: 620, y: 80, desc: '燃烧的首都' },
  { id: 6, name: '小雅罗斯拉韦茨', x: 520, y: 140, desc: '被迫原路', event: 'RET_MALOYAROSLAVETS' },
  { id: 7, name: '维亚兹马', x: 400, y: 180, desc: '严寒降临', event: 'RET_FIRST_SNOW' },
  { id: 8, name: '斯摩棱斯克', x: 300, y: 210, desc: '废墟无补给', event: 'RET_COSSACKS' },
  { id: 9, name: '克拉斯诺耶', x: 220, y: 240, desc: '内伊的绝境', event: 'RET_KRASNOI' },
  { id: 10, name: '别列津纳河', x: 150, y: 270, desc: '最后屏障', event: 'RET_BEREZINA' },
  { id: 11, name: '维尔纽斯', x: 100, y: 290, desc: '终点在望', event: 'RET_NAPOLEON_LEAVES' },
  { id: 12, name: '涅曼河', x: 80, y: 310, desc: '归来' }
]

const moscowIdx = 5
const currentNodeIdx = ref(0)
const currentNode = computed(() => nodes[currentNodeIdx.value])
const napoleonX = computed(() => nodes[currentNodeIdx.value].x)
const napoleonY = computed(() => nodes[currentNodeIdx.value].y)

// ==================== 路径 ====================
const fullPath = computed(() => {
  let d = `M ${nodes[0].x} ${nodes[0].y}`
  for (let i = 1; i < nodes.length; i++) d += ` L ${nodes[i].x} ${nodes[i].y}`
  return d
})
const traveledPath = computed(() => {
  if (currentNodeIdx.value === 0) return ''
  let d = `M ${nodes[0].x} ${nodes[0].y}`
  for (let i = 1; i <= currentNodeIdx.value; i++) d += ` L ${nodes[i].x} ${nodes[i].y}`
  return d
})

// ==================== 视觉效果 ====================
const hpPercent = computed(() => (troops.value / 422000) * 100)
const seasonClass = computed(() => {
  const month = currentGameDate.value.getMonth()
  if (month >= 5 && month <= 7) return 'summer' // 6-8月
  if (month >= 8 && month <= 9) return 'autumn' // 9-10月
  return 'winter' // 11月及以后
})
const lossPercent = computed(() => ((422000 - troops.value) / 422000 * 100).toFixed(1))

// ==================== 日志系统 ====================
const logs = ref([])
function addLog(text, type = 'normal') {
  logs.value.unshift({ date: currentDate.value, text, type })
  if (logs.value.length > 6) logs.value.pop()
}

// ==================== 伤害显示 ====================
const damages = ref([])
let dmgId = 0
const timeoutIds = new Set()

function scheduleTimeout(callback, delay) {
  const id = setTimeout(() => {
    timeoutIds.delete(id)
    callback()
  }, delay)
  timeoutIds.add(id)
  return id
}

function clearScheduledTimeouts() {
  timeoutIds.forEach(id => clearTimeout(id))
  timeoutIds.clear()
}

function showDamage(text, type = 'loss') {
  const id = dmgId++
  damages.value.push({ id, text, type, x: 400 + Math.random() * 100, y: 150 + Math.random() * 50 })
  scheduleTimeout(() => {
    damages.value = damages.value.filter(d => d.id !== id)
  }, 1500)
  isShaking.value = true
  scheduleTimeout(() => isShaking.value = false, 300)
}

// ==================== Toast ====================
const toastMsg = ref('')
const toastType = ref('')
function showToast(msg, type = '') {
  toastMsg.value = msg
  toastType.value = type
  scheduleTimeout(() => toastMsg.value = '', 2000)
}

// ==================== 工具函数 ====================
function formatNumber(n) { return n.toLocaleString() }
function getNodeState(idx) {
  if (idx === currentNodeIdx.value) return 'current'
  if (idx < currentNodeIdx.value) return 'visited'
  return 'future'
}

function estimateDailyLoss() {
  const currentTemp = temperature.value
  const marchInfo = nodeDistances[currentNodeIdx.value]
  if (!marchInfo) return 0

  const result = calculateDailyLoss({
    phase: phase.value,
    troops: troops.value,
    temperature: currentTemp,
    discipline: discipline.value,
    napoleonHealth: napoleonHealth.value,
    supplies,
    armyHealth
  })
  return result.total
}

const marchPreview = computed(() => {
  const marchInfo = nodeDistances[currentNodeIdx.value]
  if (!marchInfo) return null

  const loss = estimateDailyLoss()
  const risks = []
  if (temperature.value < -20) risks.push('极寒会显著增加伤亡')
  else if (temperature.value < 0) risks.push('低温将消耗衣物与士气')
  if (overallSupply.value < 35) risks.push('补给不足')
  if (discipline.value < 45) risks.push('纪律风险偏高')

  return {
    days: marchInfo.days,
    loss,
    temperature: temperature.value,
    risk: risks.length ? risks.join('，') : '风险可控'
  }
})

// ==================== 每日结算 ====================
function processDailyMarch() {
  const currentTemp = temperature.value // 获取当前计算的气温
  const lossResult = calculateDailyLoss({ phase: phase.value, troops: troops.value, temperature: currentTemp, discipline: discipline.value, napoleonHealth: napoleonHealth.value, supplies, armyHealth })
  const diseaseResult = calculateDiseaseSpread({ troops: troops.value, temperature: currentTemp, supplies, armyHealth })
  const supplyConsumption = calculateSupplyConsumption({ troops: troops.value, temperature: currentTemp, phase: phase.value, isForceMarching: false, inBattle: false })
  
  troops.value = Math.max(0, troops.value - lossResult.total)
  gameStats.value.totalCasualties += lossResult.total
  
  for (const disease of Object.keys(diseaseResult.newInfections)) {
    armyHealth.infected[disease] = Math.max(0, armyHealth.infected[disease] + diseaseResult.newInfections[disease] - diseaseResult.recoveries[disease])
  }
  armyHealth.healthy = Math.max(0, troops.value - totalInfected.value)
  
  supplies.food = Math.max(0, supplies.food - supplyConsumption.food / 10)
  supplies.ammunition = Math.max(0, supplies.ammunition - supplyConsumption.ammunition / 10)
  supplies.medicine = Math.max(0, supplies.medicine - supplyConsumption.medicine / 10)
  supplies.clothing = Math.max(0, supplies.clothing - supplyConsumption.clothing / 10)
  
  const discChange = calculateDisciplineChange({ phase: phase.value, temperature: currentTemp, troops: troops.value, discipline: discipline.value, napoleonHealth: napoleonHealth.value })
  discipline.value = Math.max(0, Math.min(100, discipline.value + discChange))
  
  // 撤退阶段：寒冷对拿破仑健康的影响
  if (phase.value === 'RETREAT' && currentTemp < 0) {
    napoleonHealth.value = Math.max(0, napoleonHealth.value - BALANCE_CONFIG.NAPOLEON_HEALTH.COLD_DAMAGE)
  }
  
  // 推进1天
  advanceDays(1)
  return lossResult
}

// ==================== 技能系统 ====================
function useSkill(skillId) {
  const skill = commanderSkills[skillId]
  if (!skill) return
  
  if (skillId === 'restAndRecover') {
    executeRestAndRecover()
    return
  }
  
  if (skillId === 'napoleonInspire') {
    napoleonHealth.value -= BALANCE_CONFIG.NAPOLEON_HEALTH.INSPIRE_COST
    discipline.value = Math.min(100, discipline.value + 20)
    inspiresLeft.value--
    showToast('拿破仑亲自激励士气！', 'inspire')
    addLog('皇帝亲自巡视，士气回升', 'important')
  }
}

function executeRestAndRecover() {
  // 检查是否超过休整上限
  if (totalRestDays.value >= MAX_REST_DAYS) {
    showToast('军队已无法继续休整，必须行动！', 'warning')
    addLog('⚠️ 士兵们已经厌倦了等待，必须行动！', 'critical')
    return
  }
  
  totalRestDays.value++
  advanceDays(1) // 休整1天
  discipline.value = Math.min(100, discipline.value + 5)
  
  for (const disease of Object.keys(armyHealth.infected)) {
    const recovered = Math.floor(armyHealth.infected[disease] * 0.15)
    armyHealth.infected[disease] = Math.max(0, armyHealth.infected[disease] - recovered)
  }
  armyHealth.healthy = Math.max(0, troops.value - totalInfected.value)
  
  supplies.food = Math.max(0, supplies.food - 3)
  supplies.clothing = Math.max(0, supplies.clothing - 1)
  
  let restReport = `扎营休整一天（已休整${totalRestDays.value}/${MAX_REST_DAYS}天）。`
  let totalLoss = 0
  const currentTemp = temperature.value
  
  if (phase.value === 'RETREAT' && Math.random() < 0.30) {
    const raidLoss = Math.floor(troops.value * 0.015)
    troops.value -= raidLoss
    totalLoss += raidLoss
    discipline.value = Math.max(0, discipline.value - 8)
    restReport += ` 哥萨克骑兵夜袭！损失${formatNumber(raidLoss)}人。`
    addLog('⚔️ 哥萨克骑兵夜袭营地！', 'critical')
  }
  
  if (currentTemp < -15) {
    const coldLoss = Math.floor(troops.value * Math.abs(currentTemp) / 1000)
    troops.value -= coldLoss
    totalLoss += coldLoss
    restReport += ` 严寒中冻死${formatNumber(coldLoss)}人。`
  }
  
  if (Math.random() < 0.25) {
    const newInfected = Math.floor(armyHealth.healthy * 0.02)
    armyHealth.infected.typhus += newInfected
    armyHealth.healthy -= newInfected
    restReport += ` 营地拥挤导致${formatNumber(newInfected)}人感染。`
  }
  
  if (supplies.food < 30 && Math.random() < 0.20) {
    discipline.value = Math.max(0, discipline.value - 12)
    const fightLoss = Math.floor(troops.value * 0.005)
    troops.value -= fightLoss
    totalLoss += fightLoss
    restReport += ` 士兵为争夺食物发生械斗。`
  }
  
  // 休整过多的惩罚
  if (totalRestDays.value >= 10) {
    discipline.value = Math.max(0, discipline.value - 5)
    restReport += ` 士兵们开始质疑指挥官的决策。`
  }
  
  if (totalLoss > 0) {
    showDamage(`-${formatNumber(totalLoss)}`)
    gameStats.value.totalCasualties += totalLoss
  }
  
  showToast(restReport, totalLoss > 0 ? 'warning' : 'inspire')
  addLog(`🏕️ ${restReport}`, totalLoss > 0 ? 'critical' : 'event')
  
  // 检查特殊结局：休整过多
  if (totalRestDays.value >= MAX_REST_DAYS && phase.value === 'RETREAT') {
    addLog('⚠️ 过度休整导致俄军完成包围！', 'critical')
  }
  
  if (troops.value <= 0) { troops.value = 0; gamePhase.value = 'RESULT' }
}

// ==================== 效果应用 ====================
function applyEffect(eff, choiceData = null) {
  // 应用连锁效果乘数
  let troopMultiplier = getChainEffectMultiplier()
  
  if (eff.troops) {
    let loss = Math.abs(eff.troops)
    // 战斗损失受连锁效果影响
    loss = Math.floor(loss * troopMultiplier)
    troops.value = Math.max(0, troops.value - loss)
    gameStats.value.totalCasualties += loss
    showDamage(`-${formatNumber(loss)}`)
  }
  if (eff.troopsPct) {
    const loss = Math.floor(troops.value * Math.abs(eff.troopsPct) / 100)
    troops.value = Math.max(0, troops.value - loss)
    gameStats.value.totalCasualties += loss
    showDamage(`-${formatNumber(loss)} (${Math.abs(eff.troopsPct)}%)`)
  }
  if (eff.discipline) {
    let discChange = eff.discipline
    // 抛弃后卫的永久士气惩罚
    if (chainEffects.abandonedRearguard && discChange > 0) {
      discChange = Math.floor(discChange * 0.8) // 士气恢复效果-20%
    }
    discipline.value = Math.max(0, Math.min(100, discipline.value + discChange))
  }
  if (eff.health) napoleonHealth.value = Math.max(0, napoleonHealth.value + eff.health)
  if (eff.day) advanceDays(eff.day)
  
  // 处理连锁效果
  if (choiceData?.chainEffect) {
    const ce = choiceData.chainEffect
    // 进攻阶段效果
    if (ce.horsesSlaughtered) chainEffects.horsesSlaughtered = true
    if (ce.russiansCrushed) chainEffects.russiansCrushed = true
    if (ce.russiansMoraleDown) chainEffects.russiansMoraleDown = true
    if (ce.guardsUsedEarly) chainEffects.guardsUsedEarly = true
    if (ce.slowAdvance) chainEffects.slowAdvance = true
    if (ce.fastAdvance) chainEffects.fastAdvance = true
    if (ce.diseaseControlled) chainEffects.diseaseControlled = true
    if (ce.diseaseSpread) chainEffects.diseaseSpread = true
    if (ce.strictDiscipline) chainEffects.strictDiscipline = true
    if (ce.looseDiscipline) chainEffects.looseDiscipline = true
    if (ce.hasIntel) chainEffects.hasIntel = true
    
    // 撤退阶段效果
    if (ce.tookSouthRoute) chainEffects.tookSouthRoute = true
    if (ce.noSupplies) chainEffects.noSupplies = true
    if (ce.hasSupplies) chainEffects.hasSupplies = true
    if (ce.hasWarmClothes) chainEffects.hasWarmClothes = true
    if (ce.abandonedRearguard) chainEffects.abandonedRearguard = true
    if (ce.rearguardProtected) chainEffects.rearguardProtected = true
    if (ce.savedNey) chainEffects.savedNey = true
    if (ce.abandonedNey) chainEffects.abandonedNey = true
    if (ce.humanDisaster) chainEffects.humanDisaster = true
    if (ce.foundFood) chainEffects.foundFood = true
    if (ce.napoleonLeft) chainEffects.napoleonLeft = true
    if (ce.napoleonStayed) chainEffects.napoleonStayed = true
    
    if (ce.delayDays) chainEffects.totalDelayDays += ce.delayDays
    
    // 显示连锁效果提示
    if (choiceData.chainWarning) {
      addLog(choiceData.chainWarning, 'critical')
    }
    if (choiceData.chainBonus) {
      addLog(choiceData.chainBonus, 'important')
    }
  }
  
  // 处理条件性额外惩罚（如别列津纳河近卫军断后）
  if (choiceData?.chainCondition && chainEffects[choiceData.chainCondition] && choiceData.chainPenalty) {
    const penalty = choiceData.chainPenalty
    if (penalty.troops) {
      const extraLoss = Math.abs(penalty.troops)
      troops.value = Math.max(0, troops.value - extraLoss)
      gameStats.value.totalCasualties += extraLoss
      showDamage(`-${formatNumber(extraLoss)}`)
      addLog(`${choiceData.chainPenaltyHint || '额外损失'}`, 'critical')
    }
  }
}

// ==================== 随机事件检查 ====================
function checkRandomEvents() {
  const currentTemp = temperature.value
  const state = { phase: phase.value, temperature: currentTemp, discipline: discipline.value, troops: troops.value, napoleonHealth: napoleonHealth.value }
  for (const event of randomEvents) {
    // 传入连锁效果状态
    if (event.trigger(state, chainEffects)) {
      applyEffect(event.effect)
      showToast(event.message, 'warning')
      addLog(event.message, 'event')
      break
    }
  }
}

function checkBetweenNodeEvents() {
  if (eventTriggeredThisStep.value || betweenNodeEvent.value) return
  const currentTemp = temperature.value
  const state = { phase: phase.value, temperature: currentTemp, discipline: discipline.value, troops: troops.value, napoleonHealth: napoleonHealth.value }
  const pool = phase.value === 'ADVANCE' ? advanceRandomEvents : retreatRandomEvents
  const availableEvents = pool.filter(event => {
    if (triggeredEventIds.value.has(event.id)) return false
    // 传入连锁效果状态给trigger函数
    if (!event.trigger(state, chainEffects)) return false
    return true
  })
  if (availableEvents.length > 0) {
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)]
    if (event.isAutoTrigger) {
      applyEffect(event.effect)
      showToast(event.message, 'warning')
      addLog(event.message, 'event')
      triggeredEventIds.value.add(event.id)
    } else {
      betweenNodeEvent.value = event
    }
    eventTriggeredThisStep.value = true
  }
}

function pickBetweenNodeChoice(choice) {
  const evt = betweenNodeEvent.value
  const choiceData = choice === 'A' ? evt.choiceA : evt.choiceB
  const eff = choiceData.effect
  gameStats.value.majorDecisions++
  addLog(`${evt.title}：${choiceData.label}`, 'event')
  applyEffect(eff, choiceData)
  triggeredEventIds.value.add(evt.id)
  betweenNodeEvent.value = null
  eventTriggeredThisStep.value = false
  if (troops.value <= 0) { troops.value = 0; gamePhase.value = 'RESULT'; return }
  showToast('选择完成，点击继续行军推进', '')
}

function finishRetreatStep() {
  const currentTemp = temperature.value
  if (checkEmperorSick({ napoleonHealth: napoleonHealth.value }) && !showEmperorSickModal.value) {
    showEmperorSickModal.value = true
    addLog('皇帝身体状况危急！', 'critical')
  }
  if (checkMutiny({ discipline: discipline.value })) { showMutinyModal.value = true; return }
  currentNodeIdx.value++
  if (currentNodeIdx.value >= nodes.length - 1) { gamePhase.value = 'RESULT'; addLog('残军渡过涅曼河...远征结束。', 'critical'); return }
  const node = nodes[currentNodeIdx.value]
  if (node.event && eventPool[node.event]) currentEvent.value = eventPool[node.event]
}

// ==================== 游戏流程 ====================
let advanceTimer = null
let retreatTimer = null

function startAdvance() {
  gamePhase.value = 'PLAY'
  phase.value = 'ADVANCE'
  isMarching.value = false
  addLog('大军跨过涅曼河，开始远征！', 'important')
}

function continueMarch() {
  if (isAnimating.value || currentEvent.value || betweenNodeEvent.value) return
  
  // 获取当前节点到下一节点的行军天数
  const marchInfo = nodeDistances[currentNodeIdx.value]
  if (!marchInfo) return
  
  const marchDays = marchInfo.days
  isMarching.value = true
  
  // 推进日期（一次性推进所有天数）
  const startTemp = temperature.value
  advanceDays(marchDays)
  const endTemp = temperature.value
  const avgTemp = (startTemp + endTemp) / 2
  
  // 使用百分比计算损失
  const lossResult = calculateDailyLoss({ 
    phase: phase.value, 
    troops: troops.value, 
    temperature: avgTemp, 
    discipline: discipline.value, 
    napoleonHealth: napoleonHealth.value, 
    supplies, 
    armyHealth 
  })
  
  // 直接使用百分比计算的损失（已包含随机波动）
  const totalLoss = lossResult.total
  
  // 应用损失
  troops.value = Math.max(0, troops.value - totalLoss)
  gameStats.value.totalCasualties += totalLoss
  
  // 更新补给（简化）
  const supplyRate = marchDays / 20 // 每20天消耗约100%补给
  supplies.food = Math.max(0, supplies.food - supplyRate * 15)
  supplies.ammunition = Math.max(0, supplies.ammunition - supplyRate * 5)
  supplies.medicine = Math.max(0, supplies.medicine - supplyRate * 8)
  supplies.clothing = Math.max(0, supplies.clothing - supplyRate * (avgTemp < 0 ? 12 : 5))
  
  // 更新纪律
  const discChange = calculateDisciplineChange({ 
    phase: phase.value, 
    temperature: avgTemp, 
    troops: troops.value, 
    discipline: discipline.value 
  })
  discipline.value = Math.max(0, Math.min(100, discipline.value + discChange))
  
  // 撤退阶段：寒冷对拿破仑健康的影响
  if (phase.value === 'RETREAT' && avgTemp < 0) {
    const coldDamage = Math.abs(avgTemp) / 5 // 温度越低伤害越大
    napoleonHealth.value = Math.max(0, napoleonHealth.value - coldDamage)
  }
  
  // 显示损失（包含百分比）
  const lossPercent = ((totalLoss / (troops.value + totalLoss)) * 100).toFixed(1)
  showDamage(`-${formatNumber(totalLoss)} (${lossPercent}%)`, phase.value === 'ADVANCE' ? 'minor' : 'loss')
  addLog(`行军${marchDays}天，损失${formatNumber(totalLoss)}人(${lossPercent}%)，气温${Math.round(avgTemp)}°C`, phase.value === 'ADVANCE' ? 'move' : 'critical')
  
  // 检查游戏结束条件
  if (troops.value <= 0) { 
    troops.value = 0
    isMarching.value = false
    gamePhase.value = 'RESULT'
    addLog('全军覆没...', 'critical')
    return 
  }
  
  if (checkMutiny({ discipline: discipline.value })) { 
    isMarching.value = false
    showMutinyModal.value = true
    return 
  }
  
  if (phase.value === 'RETREAT' && checkEmperorSick({ napoleonHealth: napoleonHealth.value }) && !showEmperorSickModal.value) {
    isMarching.value = false
    showEmperorSickModal.value = true
    addLog('皇帝身体状况危急！', 'critical')
    return
  }
  
  // 检查随机事件（行军途中可能触发）
  checkRandomEvents()
  checkBetweenNodeEvents()
  
  if (betweenNodeEvent.value) { 
    isMarching.value = false
    return 
  }
  
  // 直接到达下一个节点
  arriveAtNode()
}

function arriveAtNode() {
  isMarching.value = false
  
  if (phase.value === 'ADVANCE') {
    currentNodeIdx.value++
    if (currentNodeIdx.value >= moscowIdx) { showMoscowModal.value = true; return }
    showToast(`抵达 ${currentNode.value.name}！`)
    addLog(`抵达${currentNode.value.name}`, 'move')
    const node = nodes[currentNodeIdx.value]
    if (node.event && eventPool[node.event]) currentEvent.value = eventPool[node.event]
  } else {
    currentNodeIdx.value++
    if (currentNodeIdx.value >= nodes.length - 1) { gamePhase.value = 'RESULT'; addLog('残军渡过涅曼河...远征结束。', 'critical'); return }
    addLog(`撤退至${currentNode.value.name}，气温${temperature.value}°C`, 'move')
    const node = nodes[currentNodeIdx.value]
    if (node.event && eventPool[node.event]) currentEvent.value = eventPool[node.event]
  }
}

function continueAdvance() {
  isAnimating.value = true
  eventTriggeredThisStep.value = false
  advanceTimer = setInterval(() => {
    if (currentNodeIdx.value >= moscowIdx) { clearInterval(advanceTimer); isAnimating.value = false; showMoscowModal.value = true; return }
    currentNodeIdx.value++
    advanceDays(1)
    const currentTemp = temperature.value
    const loss = calculateLoss({ phase: 'ADVANCE', troops: troops.value, temperature: currentTemp, discipline: discipline.value, napoleonHealth: napoleonHealth.value })
    troops.value = Math.max(0, troops.value - loss); gameStats.value.totalCasualties += loss
    showDamage(`-${formatNumber(loss)}`, 'minor')
    showToast(`攻占 ${currentNode.value.name}！`)
    addLog(`抵达${currentNode.value.name}，损失${formatNumber(loss)}人`, 'move')
    discipline.value = Math.max(0, discipline.value + BALANCE_CONFIG.DISCIPLINE.ADVANCE_DECREASE)
    checkRandomEvents(); checkBetweenNodeEvents()
    if (betweenNodeEvent.value) { clearInterval(advanceTimer); isAnimating.value = false; return }
    const node = nodes[currentNodeIdx.value]
    if (node.event && eventPool[node.event]) { clearInterval(advanceTimer); isAnimating.value = false; currentEvent.value = eventPool[node.event] }
  }, 1200)
}

function beginRetreat() {
  showMoscowModal.value = false
  phase.value = 'RETREAT'
  // 设置撤退开始日期为10月19日（历史日期）
  currentGameDate.value = new Date(1812, 9, 19) // 10月19日
  discipline.value = Math.max(0, discipline.value - 20)
  supplies.food = Math.max(0, supplies.food - 30)
  supplies.clothing = Math.max(0, supplies.clothing - 20)
  addLog('莫斯科大火！被迫撤退！', 'critical')
  inspiresLeft.value = 3
  eventTriggeredThisStep.value = false
}

function continueRetreat() {
  isAnimating.value = true
  eventTriggeredThisStep.value = false
  retreatTimer = setInterval(() => {
    if (currentNodeIdx.value >= nodes.length - 1) { clearInterval(retreatTimer); retreatTimer = null; isAnimating.value = false; gamePhase.value = 'RESULT'; addLog('残军渡过涅曼河...远征结束。', 'critical'); return }
    advanceDays(1)
    const currentTemp = temperature.value
    gameStats.value.lowestTemp = Math.min(gameStats.value.lowestTemp, currentTemp)
    const loss = calculateLoss({ phase: 'RETREAT', troops: troops.value, temperature: currentTemp, discipline: discipline.value, napoleonHealth: napoleonHealth.value })
    troops.value = Math.max(0, troops.value - loss); gameStats.value.totalCasualties += loss
    if (currentTemp < -10) armyHealth.infected.frostbite += Math.floor(troops.value * 0.02)
    showDamage(`-${formatNumber(loss)}`)
    const discChange = calculateDisciplineChange({ phase: phase.value, temperature: currentTemp, troops: troops.value, discipline: discipline.value, napoleonHealth: napoleonHealth.value })
    discipline.value = Math.max(0, discipline.value + discChange)
    if (currentTemp < 0) napoleonHealth.value = Math.max(0, napoleonHealth.value - BALANCE_CONFIG.NAPOLEON_HEALTH.COLD_DAMAGE)
    supplies.food = Math.max(0, supplies.food - 2); supplies.clothing = Math.max(0, supplies.clothing - 1); supplies.medicine = Math.max(0, supplies.medicine - 1)
    currentNodeIdx.value++
    addLog(`撤退至${currentNode.value.name}，气温${currentTemp}°C，损失${formatNumber(loss)}人`, 'move')
    if (troops.value <= 0) { clearInterval(retreatTimer); retreatTimer = null; troops.value = 0; isAnimating.value = false; gamePhase.value = 'RESULT'; addLog('全军覆没...', 'critical'); return }
    checkRandomEvents(); checkBetweenNodeEvents()
    if (betweenNodeEvent.value) { clearInterval(retreatTimer); retreatTimer = null; isAnimating.value = false; return }
    if (checkEmperorSick({ napoleonHealth: napoleonHealth.value }) && !showEmperorSickModal.value) { clearInterval(retreatTimer); retreatTimer = null; isAnimating.value = false; showEmperorSickModal.value = true; addLog('皇帝身体状况危急！', 'critical'); return }
    if (checkMutiny({ discipline: discipline.value })) { clearInterval(retreatTimer); retreatTimer = null; isAnimating.value = false; showMutinyModal.value = true; return }
    const node = nodes[currentNodeIdx.value]
    if (node.event && eventPool[node.event]) { clearInterval(retreatTimer); retreatTimer = null; isAnimating.value = false; currentEvent.value = eventPool[node.event] }
  }, 1500)
}

function pickChoice(choice) {
  const evt = currentEvent.value
  const choiceData = choice === 'A' ? evt.choiceA : evt.choiceB
  const eff = choiceData.effect
  gameStats.value.majorDecisions++
  if (evt.type === 'battle') gameStats.value.battles++
  addLog(`${evt.title}：${choiceData.label}`, 'event')
  applyEffect(eff, choiceData)
  currentEvent.value = null
  eventTriggeredThisStep.value = false
  if (troops.value <= 0) { troops.value = 0; gamePhase.value = 'RESULT'; return }
  showToast('选择完成，点击继续行军推进', '')
}

function resolveMutiny() {
  const loss = Math.floor(troops.value * 0.15)
  troops.value -= loss; gameStats.value.totalCasualties += loss; discipline.value = 40
  showDamage(`-${formatNumber(loss)} 哗变`)
  addLog('哗变平息，但损失惨重', 'critical')
  showMutinyModal.value = false
  if (troops.value <= 0) { troops.value = 0; gamePhase.value = 'RESULT'; return }
  // 不自动推进
}

function closeEmperorSickModal() { showEmperorSickModal.value = false }

// ==================== 结局 ====================
const endTitle = computed(() => {
  // 特殊结局：休整过多
  if (totalRestDays.value >= MAX_REST_DAYS && troops.value > 0) return '犹豫的代价'
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.S_RANK) return '帝国余晖'
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.A_RANK) return '历史重现'
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.B_RANK) return '惨痛代价'
  return '全军覆没'
})
const endSubtitle = computed(() => {
  if (totalRestDays.value >= MAX_REST_DAYS && troops.value > 0) return '过度谨慎的指挥官'
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.S_RANK) return '超越历史的奇迹'
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.A_RANK) return '与历史相当'
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.B_RANK) return '勉强幸存'
  return '法兰西的悲剧'
})
const endQuote = computed(() => {
  if (totalRestDays.value >= MAX_REST_DAYS && troops.value > 0) {
    return `你在${totalRestDays.value}天的休整中消耗了宝贵的时间和补给。虽然保存了${formatNumber(troops.value)}人，但过度的犹豫让俄军有了充足的准备时间。历史会记住这位"谨慎"的指挥官。`
  }
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.S_RANK) return '你做到了历史上拿破仑都未能做到的事。保住了超过2万人，这是一个军事奇迹。但帝国的衰落已经无法阻止。'
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.A_RANK) return '约1万人幸存，这与历史上拿破仑的结果相当。在俄国的冬天面前，这已经是人力所能达到的极限。'
  if (troops.value >= BALANCE_CONFIG.ENDING_THRESHOLDS.B_RANK) return '只有几千人活着回来。这场灾难比历史更加惨烈，法兰西帝国的精锐几乎全军覆没。'
  return '没有人活着回来。422,000名法兰西的年轻人，全部消失在俄罗斯无尽的雪原中。这是人类历史上最惨烈的军事灾难之一。'
})

function restart() {
  if (advanceTimer) clearInterval(advanceTimer)
  if (retreatTimer) clearInterval(retreatTimer)
  clearScheduledTimeouts()
  advanceTimer = null; retreatTimer = null
  troops.value = 422000; discipline.value = 100; napoleonHealth.value = 100
  currentGameDate.value = new Date(1812, 5, 24) // 重置为6月24日
  totalRestDays.value = 0 // 重置休整天数
  currentNodeIdx.value = 0; phase.value = 'ADVANCE'; isMarching.value = false
  supplies.food = 100; supplies.ammunition = 100; supplies.medicine = 100; supplies.clothing = 100
  armyHealth.healthy = 380000; armyHealth.infected.typhus = 30000; armyHealth.infected.dysentery = 10000; armyHealth.infected.frostbite = 0; armyHealth.infected.starvation = 2000
  Object.keys(skillCooldowns).forEach(k => delete skillCooldowns[k])
  Object.keys(skillUseCounts).forEach(k => delete skillUseCounts[k])
  logs.value = []; damages.value = []; currentEvent.value = null; betweenNodeEvent.value = null; showMoscowModal.value = false; showMutinyModal.value = false; showEmperorSickModal.value = false
  inspiresLeft.value = 3; eventTriggeredThisStep.value = false; triggeredEventIds.value = new Set()
  gameStats.value = { majorDecisions: 0, battles: 0, lowestTemp: 22, totalCasualties: 0 }
  // 重置连锁效果
  chainEffects.horsesSlaughtered = false
  chainEffects.russiansCrushed = false
  chainEffects.russiansMoraleDown = false
  chainEffects.guardsUsedEarly = false
  chainEffects.slowAdvance = false
  chainEffects.fastAdvance = false
  chainEffects.diseaseControlled = false
  chainEffects.diseaseSpread = false
  chainEffects.strictDiscipline = false
  chainEffects.looseDiscipline = false
  chainEffects.hasIntel = false
  chainEffects.tookSouthRoute = false
  chainEffects.noSupplies = false
  chainEffects.hasSupplies = false
  chainEffects.hasWarmClothes = false
  chainEffects.abandonedRearguard = false
  chainEffects.rearguardProtected = false
  chainEffects.savedNey = false
  chainEffects.abandonedNey = false
  chainEffects.humanDisaster = false
  chainEffects.foundFood = false
  chainEffects.napoleonLeft = false
  chainEffects.napoleonStayed = false
  chainEffects.totalDelayDays = 0
  gamePhase.value = 'INTRO'
}

function goHome() { router.push('/') }

onUnmounted(() => {
  if (advanceTimer) clearInterval(advanceTimer)
  if (retreatTimer) clearInterval(retreatTimer)
  clearScheduledTimeouts()
})
</script>

<style scoped>
/* 基础布局 - 参照Dashboard风格 */
.game-page {
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Noto Serif SC', serif;
  color: #e0d6c8;
}
.game-page.shaking { animation: shake 0.3s ease-in-out; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

/* 顶部状态栏 */
.stats-header {
  height: 70px;
  background: linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(15,15,15,0.9) 100%);
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
  display: flex;
  align-items: center;
  padding: 0 30px;
  gap: 40px;
}
.stat-card { text-align: center; min-width: 80px; }
.stat-value { font-size: 1.4rem; font-weight: bold; color: #D4A373; }
.stat-value.loss { color: #C0392B; }
.stat-value.warning { color: #E67E22; }
.stat-value.danger { color: #C0392B; }
.stat-value.cold { color: #4A90D9; }
.stat-value.extreme { color: #3498DB; text-shadow: 0 0 10px rgba(52, 152, 219, 0.5); }
.stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
.stat-bar { width: 80px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 4px; }
.stat-fill { height: 100%; background: linear-gradient(90deg, #D4A373, #B8860B); border-radius: 2px; transition: width 0.3s; }
.phase-badge { margin-left: auto; padding: 6px 16px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
.phase-badge.ADVANCE { background: rgba(212, 163, 115, 0.2); color: #D4A373; border: 1px solid rgba(212, 163, 115, 0.4); }
.phase-badge.RETREAT { background: rgba(192, 57, 43, 0.2); color: #E74C3C; border: 1px solid rgba(192, 57, 43, 0.4); }

/* 主内容区 */
.main-content { flex: 1; display: flex; min-height: 0; }

/* 左侧面板 */
.left-panel {
  width: 240px;
  background: rgba(20,20,20,0.8);
  border-right: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 15px;
}
.panel-section { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; }
.section-title { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
.location-name { font-size: 1.1rem; color: #D4A373; font-weight: bold; }
.location-desc { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 4px; }
.march-info { font-size: 0.85rem; color: #e0d6c8; margin-bottom: 4px; }
.march-desc { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 6px; font-style: italic; }
.march-day { font-size: 0.8rem; color: #D4A373; text-align: center; margin-top: 6px; }
.rest-info { font-size: 0.85rem; color: #D4A373; }
.rest-info.warning { color: #E67E22; }
.rest-hint { font-size: 0.75rem; color: #E74C3C; margin-top: 4px; }

/* 日志列表 */
.panel-section.logs { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.log-list { flex: 1; overflow-y: auto; }
.log-item { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 2px; }
.log-date { font-size: 0.65rem; color: rgba(255,255,255,0.4); }
.log-text { font-size: 0.8rem; color: rgba(255,255,255,0.7); }
.log-item.important .log-text { color: #D4A373; }
.log-item.critical .log-text { color: #E74C3C; }
.log-item.event .log-text { color: #9B59B6; }
.log-item.move .log-text { color: #3498DB; }

/* 中央地图 */
.map-container { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; padding: 20px; }
.campaign-map { width: 100%; max-width: 800px; height: auto; }
.route-base { stroke: rgba(255,255,255,0.15); }
.route-traveled.ADVANCE { stroke: #D4A373; filter: drop-shadow(0 0 4px rgba(212, 163, 115, 0.5)); }
.route-traveled.RETREAT { stroke: #4A90D9; stroke-dasharray: 6 3; filter: drop-shadow(0 0 4px rgba(74, 144, 217, 0.5)); }
.node { transition: all 0.3s; }
.node.current { fill: #D4A373; stroke: #fff; stroke-width: 2; filter: drop-shadow(0 0 8px rgba(212, 163, 115, 0.8)); }
.node.visited { fill: #555; stroke: #666; stroke-width: 1; }
.node.future { fill: #222; stroke: #333; stroke-width: 1; }
.node-label { fill: rgba(255,255,255,0.5); font-size: 9px; }
.node-label.active { fill: #D4A373; font-weight: bold; }
.napoleon-marker { transition: transform 0.6s ease; }
.warnings { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; }
.warning-item { background: rgba(192, 57, 43, 0.9); color: #fff; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

/* 手机端操作按钮 - 默认隐藏 */
.mobile-actions {
  display: none;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  gap: 10px;
  z-index: 50;
}

.btn-mobile-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #D4A373, #B8860B);
  border: none;
  color: #0a0a0a;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.btn-mobile-secondary {
  padding: 12px 20px;
  background: rgba(30,30,30,0.9);
  border: 1px solid rgba(212, 163, 115, 0.5);
  color: #D4A373;
  font-size: 0.9rem;
  border-radius: 25px;
  cursor: pointer;
}

/* 右侧操作面板 */
.right-panel {
  width: 200px;
  background: rgba(20,20,20,0.8);
  border-left: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  padding: 20px;
  justify-content: center;
}
.action-buttons { display: flex; flex-direction: column; gap: 10px; }
.btn-primary { padding: 14px 20px; background: linear-gradient(135deg, #D4A373, #B8860B); border: none; color: #0a0a0a; font-size: 1rem; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(212, 163, 115, 0.4); }
.btn-secondary { padding: 10px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.3); color: rgba(255,255,255,0.8); font-size: 0.85rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { border-color: #D4A373; color: #D4A373; }
.loss-hint { font-size: 0.75rem; color: rgba(255,255,255,0.55); text-align: center; line-height: 1.5; }
.risk-hint { font-size: 0.72rem; color: #E67E22; text-align: center; line-height: 1.4; }
.mobile-loss-hint { display: block; font-size: 0.7rem; font-weight: normal; opacity: 0.75; margin-top: 2px; }
.marching-hint { text-align: center; color: #D4A373; font-style: italic; }

/* 伤害数字 */
.damage-numbers { position: fixed; inset: 0; pointer-events: none; z-index: 100; }
.dmg-text { position: absolute; font-size: 1.6rem; font-weight: bold; color: #C0392B; text-shadow: 2px 2px 4px #000; animation: floatUp 1.5s ease-out forwards; }
.dmg-text.minor { font-size: 1.2rem; color: #E67E22; }
@keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-60px) scale(0.8); opacity: 0; } }

/* Toast */
.toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: rgba(212, 163, 115, 0.95); color: #0a0a0a; padding: 10px 24px; border-radius: 6px; font-weight: bold; z-index: 200; }
.toast.warning { background: rgba(230, 126, 34, 0.95); }
.toast.inspire { background: rgba(155, 89, 182, 0.95); color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-20px); }

/* 开场界面 */
.intro-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 300; }
.intro-card { background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(184, 134, 11, 0.4); border-radius: 8px; padding: 50px; text-align: center; max-width: 450px; }
.intro-card h1 { font-size: 4rem; color: #D4A373; margin: 0; letter-spacing: 8px; text-shadow: 0 4px 20px rgba(212, 163, 115, 0.4); }
.intro-card h2 { font-size: 1.4rem; color: rgba(255,255,255,0.7); margin: 10px 0 20px; font-weight: normal; letter-spacing: 3px; }
.intro-card .tagline { color: rgba(255,255,255,0.4); font-style: italic; margin-bottom: 30px; }
.intro-text { line-height: 1.8; margin-bottom: 30px; color: rgba(255,255,255,0.7); }
.intro-text .warning-text { color: #C0392B; margin-top: 10px; }
.intro-buttons { display: flex; gap: 15px; justify-content: center; }
.btn-start { padding: 14px 40px; background: linear-gradient(135deg, #D4A373, #B8860B); border: none; color: #0a0a0a; font-size: 1rem; font-weight: bold; border-radius: 6px; cursor: pointer; }
.btn-start:hover { box-shadow: 0 4px 20px rgba(212, 163, 115, 0.5); }
.btn-back { padding: 12px 30px; background: transparent; border: 1px solid rgba(255,255,255,0.3); color: rgba(255,255,255,0.6); border-radius: 6px; cursor: pointer; }
.btn-back:hover { border-color: rgba(255,255,255,0.5); color: rgba(255,255,255,0.8); }

/* 模态框 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 300; }
.modal-card { background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(184, 134, 11, 0.4); border-radius: 8px; padding: 40px; text-align: center; max-width: 480px; position: relative; }
.modal-card.fire { border-color: rgba(192, 57, 43, 0.6); max-width: 550px; }
.modal-card.critical { border-color: rgba(192, 57, 43, 0.8); }
.modal-icon { font-size: 3rem; margin-bottom: 15px; }
.modal-card h2 { color: #D4A373; margin: 0 0 20px; font-size: 1.4rem; letter-spacing: 2px; }
.modal-card p { color: rgba(255,255,255,0.7); line-height: 1.7; margin: 10px 0; }
.modal-card .highlight { color: #D4A373; }
.modal-card .dramatic { color: #E74C3C; }

/* 莫斯科事件特殊样式 */
.moscow-story { text-align: left; }
.moscow-story p { margin: 8px 0; }
.retreat-reasons { background: rgba(0,0,0,0.4); border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 3px solid #E74C3C; }
.retreat-reasons h4 { color: #E74C3C; margin: 0 0 12px; font-size: 1rem; }
.retreat-reasons ul { list-style: none; padding: 0; margin: 0; }
.retreat-reasons li { padding: 6px 0; color: rgba(255,255,255,0.8); font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.retreat-reasons li:last-child { border-bottom: none; }
.retreat-reasons li strong { color: #D4A373; }
.retreat-reasons .warning-text { color: #E74C3C; font-weight: bold; margin-top: 12px; font-size: 0.95rem; }

.event-story { font-style: italic; border-left: 2px solid rgba(184, 134, 11, 0.4); padding-left: 15px; text-align: left; margin: 20px 0; }
.historical-note { background: rgba(212, 163, 115, 0.1); border-left: 3px solid #D4A373; padding: 10px 12px; margin: 15px 0; font-size: 0.85rem; color: #D4A373; text-align: left; }
.event-badge { position: absolute; top: 15px; right: 15px; background: rgba(230, 126, 34, 0.9); color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
.choices { display: flex; flex-direction: column; gap: 10px; margin-top: 25px; }
.choice-btn { padding: 14px 18px; border-radius: 6px; cursor: pointer; text-align: left; transition: all 0.2s; display: flex; flex-direction: column; gap: 4px; }
.choice-label { font-size: 0.95rem; font-weight: bold; }
.choice-hint { font-size: 0.8rem; opacity: 0.7; }
.choice-a { background: rgba(192, 57, 43, 0.15); border: 1px solid rgba(192, 57, 43, 0.4); color: #e0d6c8; }
.choice-a:hover { background: rgba(192, 57, 43, 0.25); border-color: rgba(192, 57, 43, 0.6); }
.choice-b { background: rgba(39, 174, 96, 0.15); border: 1px solid rgba(39, 174, 96, 0.4); color: #e0d6c8; }
.choice-b:hover { background: rgba(39, 174, 96, 0.25); border-color: rgba(39, 174, 96, 0.6); }
.btn-confirm { margin-top: 25px; padding: 12px 40px; background: linear-gradient(135deg, #8B0000, #A52A2A); border: none; color: #fff; font-size: 1rem; font-weight: bold; border-radius: 6px; cursor: pointer; }
.btn-confirm:hover { box-shadow: 0 4px 15px rgba(139, 0, 0, 0.4); }
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

/* 结局界面 */
.result-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 300; }
.result-card { background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(184, 134, 11, 0.4); border-radius: 8px; padding: 50px; text-align: center; max-width: 450px; }
.result-card h1 { font-size: 2.2rem; color: #D4A373; margin: 0 0 5px; }
.result-subtitle { color: rgba(255,255,255,0.5); font-style: italic; margin-bottom: 25px; }
.result-stats { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; }
.result-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
.result-row:last-child { border-bottom: none; }
.result-row span:last-child { font-weight: bold; color: #D4A373; }
.result-row .zero { color: #C0392B; }
.result-row .loss { color: #C0392B; }
.result-quote { color: rgba(255,255,255,0.6); line-height: 1.7; font-style: italic; margin-bottom: 25px; font-size: 0.9rem; }
.result-compare { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 25px; }
.result-compare h4 { color: #D4A373; margin: 0 0 12px; font-size: 0.9rem; }
.compare-bar { display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 0.8rem; color: rgba(255,255,255,0.6); }
.compare-bar span:first-child { width: 30px; text-align: right; }
.compare-bar span:last-child { width: 60px; color: rgba(255,255,255,0.8); }
.compare-bar .bar { flex: 1; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; }
.compare-bar .fill { height: 100%; transition: width 1s; }
.compare-bar .fill.you { background: linear-gradient(90deg, #D4A373, #B8860B); }
.compare-bar .fill.history { background: linear-gradient(90deg, #C0392B, #E74C3C); }
.result-buttons { display: flex; gap: 15px; justify-content: center; }

/* 季节效果 */
.summer { --season-tint: rgba(50, 40, 20, 0.1); }
.autumn { --season-tint: rgba(40, 30, 15, 0.15); }
.winter { --season-tint: rgba(20, 30, 50, 0.2); }

/* 响应式 - 平板 */
@media (max-width: 900px) {
  .left-panel, .right-panel { display: none; }
  .stats-header { gap: 20px; padding: 0 15px; }
  .stat-value { font-size: 1.1rem; }
}

/* 响应式 - 手机 */
@media (max-width: 768px) {
  .stats-header {
    height: auto;
    flex-wrap: wrap;
    padding: 10px 15px;
    gap: 10px;
  }
  
  .stat-card {
    min-width: 60px;
  }
  
  .stat-value {
    font-size: 1rem;
  }
  
  .stat-label {
    font-size: 0.6rem;
  }
  
  .stat-bar {
    width: 60px;
  }
  
  .phase-badge {
    font-size: 0.7rem;
    padding: 4px 10px;
  }
  
  .map-container {
    padding: 10px;
    padding-bottom: 80px; /* 为底部按钮留空间 */
  }
  
  .campaign-map {
    max-width: 100%;
  }
  
  .node-label {
    font-size: 7px;
  }
  
  .warnings {
    flex-direction: column;
    gap: 5px;
  }
  
  .warning-item {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
  
  /* 显示手机端操作按钮 */
  .mobile-actions {
    display: flex;
  }
  
  /* 开场界面手机适配 */
  .intro-card {
    margin: 15px;
    padding: 30px 20px;
    max-width: calc(100% - 30px);
  }
  
  .intro-card h1 {
    font-size: 2.5rem;
    letter-spacing: 4px;
  }
  
  .intro-card h2 {
    font-size: 1.1rem;
    letter-spacing: 2px;
  }
  
  .intro-text {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  
  .intro-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-start, .btn-back {
    width: 100%;
    padding: 12px 20px;
  }
  
  /* 模态框手机适配 */
  .modal-card {
    margin: 15px;
    padding: 25px 20px;
    max-width: calc(100% - 30px);
    max-height: 85vh;
    overflow-y: auto;
  }
  
  .modal-card.fire {
    max-width: calc(100% - 30px);
  }
  
  .modal-icon {
    font-size: 2.5rem;
  }
  
  .modal-card h2 {
    font-size: 1.2rem;
  }
  
  .modal-card p {
    font-size: 0.9rem;
  }
  
  .retreat-reasons {
    padding: 12px;
  }
  
  .retreat-reasons li {
    font-size: 0.8rem;
  }
  
  .choice-btn {
    padding: 12px 14px;
  }
  
  .choice-label {
    font-size: 0.9rem;
  }
  
  .choice-hint {
    font-size: 0.75rem;
  }
  
  .btn-confirm {
    padding: 10px 30px;
    font-size: 0.9rem;
  }
  
  /* 结局界面手机适配 */
  .result-card {
    margin: 15px;
    padding: 30px 20px;
    max-width: calc(100% - 30px);
  }
  
  .result-card h1 {
    font-size: 1.8rem;
  }
  
  .result-quote {
    font-size: 0.85rem;
  }
  
  .result-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .result-buttons .btn-primary,
  .result-buttons .btn-secondary {
    width: 100%;
  }
  
  /* Toast手机适配 */
  .toast {
    top: 70px;
    left: 10px;
    right: 10px;
    transform: none;
    text-align: center;
    font-size: 0.85rem;
    padding: 8px 15px;
  }
  
  .toast-enter-from, .toast-leave-to {
    transform: translateY(-20px);
  }
  
  .dmg-text {
    font-size: 1.2rem;
  }
}

/* 响应式 - 小手机 */
@media (max-width: 480px) {
  .stats-header {
    justify-content: space-around;
  }
  
  .stat-card {
    min-width: 50px;
  }
  
  .stat-value {
    font-size: 0.9rem;
  }
  
  .intro-card h1 {
    font-size: 2rem;
  }
  
  .node-label {
    font-size: 6px;
  }
}
</style>
