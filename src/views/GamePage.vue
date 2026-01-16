<template>
  <div class="game-container" :class="[seasonClass, { shaking: isShaking }]">
    <!-- 第0层：背景 -->
    <div class="layer-0-background"></div>
    
    <!-- 第1层：游戏层 -->
    <div class="layer-1-gameboard">
      <!-- HUD状态栏 -->
      <div class="status-hud" v-if="gamePhase !== 'INTRO'">
        <div class="hud-item">
          <span class="hud-icon">⚔️</span>
          <div class="hud-content">
            <span class="hud-label">兵力</span>
            <span class="hud-value">{{ formatNumber(troops) }}</span>
            <div class="hp-bar" :class="hpBarClass">
              <div class="hp-fill" :style="{ width: hpPercent + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="hud-item">
          <span class="hud-icon">📏</span>
          <div class="hud-content">
            <span class="hud-label">纪律</span>
            <span class="hud-value" :class="{ danger: discipline < 30 }">{{ discipline }}</span>
            <div class="stat-bar discipline">
              <div class="stat-fill" :style="{ width: discipline + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="hud-item">
          <span class="hud-icon">👑</span>
          <div class="hud-content">
            <span class="hud-label">皇帝</span>
            <span class="hud-value" :class="{ danger: napoleonHealth < 30 }">{{ napoleonHealth }}</span>
            <div class="stat-bar health">
              <div class="stat-fill" :style="{ width: napoleonHealth + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="hud-item">
          <span class="hud-icon">🌡️</span>
          <div class="hud-content">
            <span class="hud-label">气温</span>
            <span class="hud-value" :class="{ frozen: temperature < 0 }">{{ temperature }}°C</span>
          </div>
        </div>
        <div class="hud-item">
          <span class="hud-icon">📅</span>
          <div class="hud-content">
            <span class="hud-label">日期</span>
            <span class="hud-value">{{ currentDate }}</span>
          </div>
        </div>
        <div class="hud-badge">
          <span :class="['badge', phase]">{{ phase === 'ADVANCE' ? '进攻' : '撤退' }}</span>
        </div>
      </div>

      <!-- 地图 -->
      <div class="map-area" v-if="gamePhase !== 'INTRO' && gamePhase !== 'RESULT'">
        <svg class="campaign-map" viewBox="0 0 800 350">
          <path :d="fullPath" class="route-base" fill="none" stroke="#333" stroke-width="6"/>
          <path :d="traveledPath" class="route-traveled" :class="phase" fill="none" stroke-width="5"/>
          <g v-for="(node, idx) in nodes" :key="node.id">
            <circle :cx="node.x" :cy="node.y" :r="idx === currentNodeIdx ? 14 : 8" :class="['node', getNodeState(idx)]"/>
            <text :x="node.x" :y="node.y + 28" text-anchor="middle" class="node-name" :class="{ active: idx === currentNodeIdx }">{{ node.name }}</text>
          </g>
          <g class="napoleon" :style="{ transform: `translate(${napoleonX}px, ${napoleonY - 35}px)` }">
            <text x="0" y="0" text-anchor="middle" font-size="28">🦅</text>
          </g>
        </svg>
      </div>

      <!-- 左侧日志 -->
      <div class="log-panel" v-if="gamePhase !== 'INTRO' && gamePhase !== 'RESULT'" :class="logPanelClass">
        <h3>📜 行军日志</h3>
        <div class="log-list">
          <div v-for="(log, i) in logs" :key="i" class="log-item" :class="log.type">
            <span class="log-date">{{ log.date }}</span>
            <p class="log-text">{{ log.text }}</p>
          </div>
        </div>
        <div class="current-pos">
          <h4>📍 {{ currentNode.name }}</h4>
          <p>{{ currentNode.desc }}</p>
        </div>
        <div class="action-area" v-if="gamePhase === 'PLAY' && phase === 'RETREAT' && !isAnimating">
          <button class="btn-retreat" @click="doRetreatStep">← 继续撤退</button>
          <p class="hint">预计损失: {{ formatNumber(estimateLoss()) }} 人</p>
          <button v-if="napoleonHealth > 20" class="btn-inspire" @click="napoleonInspire">
            👑 拿破仑亲自激励 (消耗健康)
          </button>
        </div>
        <div v-if="isAnimating" class="animating-hint">行军中...</div>
      </div>
    </div>

    <!-- 第2层：特效 -->
    <div class="layer-2-effects">
      <div class="vignette"></div>
      <div class="snow-overlay" v-if="phase === 'RETREAT'" :style="{ opacity: snowOpacity }"></div>
      <div class="frost-frame" :style="{ opacity: frostOpacity }"></div>
      <transition-group name="dmg" tag="div" class="damage-numbers">
        <div v-for="d in damages" :key="d.id" class="dmg-text" :class="d.type" :style="{ left: d.x + 'px', top: d.y + 'px' }">{{ d.text }}</div>
      </transition-group>
      <transition name="toast">
        <div v-if="toastMsg" class="toast" :class="toastType">{{ toastMsg }}</div>
      </transition>
    </div>

    <!-- 第3层：UI弹窗 -->
    <div class="layer-3-ui">
      <!-- 开场 -->
      <div v-if="gamePhase === 'INTRO'" class="intro-modal">
        <div class="intro-card">
          <h1>1812</h1>
          <h2>绝望的行军</h2>
          <p class="tagline">La Grande Armée</p>
          <div class="intro-body">
            <p>1812年6月，你率领422,000名士兵跨过涅曼河。</p>
            <p>目标：攻占莫斯科，迫使沙皇求和。</p>
            <p class="warning">然而，俄国的冬天正在等待...</p>
          </div>
          <button class="btn-start" @click="startAdvance">开始远征</button>
          <button class="btn-home" @click="goHome">返回首页</button>
        </div>
      </div>

      <!-- 莫斯科 -->
      <transition name="modal">
        <div v-if="showMoscowModal" class="event-overlay fire-effect">
          <div class="event-modal moscow">
            <div class="modal-icon">🔥</div>
            <h2>莫斯科在燃烧</h2>
            <p>1812年9月14日，你终于进入莫斯科...</p>
            <p class="highlight">但城市是空的。沙皇拒绝投降。</p>
            <p class="dramatic">火焰从四面八方升起！俄国人烧毁了自己的首都！</p>
            <p>所有补给化为灰烬。冬天即将来临。</p>
            <button class="btn-confirm" @click="beginRetreat">开始撤退</button>
          </div>
        </div>
      </transition>

      <!-- 事件卡片 -->
      <transition name="modal">
        <div v-if="currentEvent" class="event-overlay">
          <div class="event-modal" :class="currentEvent.type">
            <div class="modal-icon">{{ currentEvent.icon }}</div>
            <h2>{{ currentEvent.title }}</h2>
            <p class="event-story">{{ currentEvent.story }}</p>
            <div class="choices">
              <button class="choice choice-a" @click="pickChoice('A')">
                <strong>{{ currentEvent.choiceA.label }}</strong>
                <span>{{ currentEvent.choiceA.hint }}</span>
              </button>
              <button class="choice choice-b" @click="pickChoice('B')">
                <strong>{{ currentEvent.choiceB.label }}</strong>
                <span>{{ currentEvent.choiceB.hint }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 纪律崩溃 -->
      <transition name="modal">
        <div v-if="showMutinyModal" class="event-overlay mutiny">
          <div class="event-modal critical">
            <div class="modal-icon">⚠️</div>
            <h2>哗变！</h2>
            <p class="dramatic">纪律崩溃！士兵们开始互相抢劫，甚至攻击军官！</p>
            <p>混乱中，大量士兵逃散或被杀。</p>
            <button class="btn-confirm" @click="resolveMutiny">艰难恢复秩序</button>
          </div>
        </div>
      </transition>

      <!-- 结局 -->
      <div v-if="gamePhase === 'RESULT'" class="result-modal">
        <div class="result-card">
          <h1>{{ endTitle }}</h1>
          <p class="end-subtitle">{{ endSubtitle }}</p>
          <div class="stats">
            <div class="stat-row"><span>出发</span><span>422,000</span></div>
            <div class="stat-row"><span>归来</span><span :class="{ zero: troops === 0 }">{{ formatNumber(troops) }}</span></div>
            <div class="stat-row"><span>损失</span><span class="loss">{{ lossPercent }}%</span></div>
          </div>
          <p class="end-quote">{{ endQuote }}</p>
          <div class="compare">
            <h4>与历史对比</h4>
            <div class="bar-row"><span>你</span><div class="bar"><div class="fill you" :style="{ width: Math.max(1, hpPercent) + '%' }"></div></div><span>{{ formatNumber(troops) }}</span></div>
            <div class="bar-row"><span>历史</span><div class="bar"><div class="fill history" style="width: 2.4%"></div></div><span>~10,000</span></div>
          </div>
          <div class="result-btns">
            <button @click="restart">再试一次</button>
            <button class="secondary" @click="goHome">返回首页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 游戏状态
const gamePhase = ref('INTRO')
const phase = ref('ADVANCE')
const isAnimating = ref(false)
const isShaking = ref(false)

// 核心资源
const troops = ref(422000)
const discipline = ref(100)
const napoleonHealth = ref(100)
const temperature = ref(20)
const dayIndex = ref(0)

// 日期系统
const dates = [
  '6月24日', '7月1日', '7月15日', '8月1日', '8月17日', '9月7日', '9月14日', // 进攻
  '10月19日', '10月24日', '11月3日', '11月9日', '11月14日', '11月26日', '12月5日', '12月14日'
]
const currentDate = computed(() => dates[Math.min(dayIndex.value, dates.length - 1)])

// 地图节点
const nodes = [
  { id: 0, name: '涅曼河', x: 80, y: 280, desc: '出发点' },
  { id: 1, name: '维尔纳', x: 150, y: 240, desc: '立陶宛首府' },
  { id: 2, name: '维捷布斯克', x: 230, y: 200, desc: '俄军后撤' },
  { id: 3, name: '斯摩棱斯克', x: 340, y: 160, desc: '攻城战', event: 'ADV_1' },
  { id: 4, name: '博罗季诺', x: 470, y: 120, desc: '血腥会战', event: 'ADV_2' },
  { id: 5, name: '莫斯科', x: 620, y: 80, desc: '燃烧的首都' },
  { id: 6, name: '小雅罗斯拉韦茨', x: 520, y: 140, desc: '被迫原路', event: 'RET_1' },
  { id: 7, name: '维亚兹马', x: 400, y: 180, desc: '严寒降临', event: 'RET_2' },
  { id: 8, name: '斯摩棱斯克', x: 300, y: 210, desc: '废墟无补给', event: 'RET_3' },
  { id: 9, name: '奥尔沙', x: 220, y: 240, desc: '饥寒交迫', event: 'RET_4' },
  { id: 10, name: '贝雷津纳河', x: 150, y: 270, desc: '最后屏障', event: 'BEREZINA' },
  { id: 11, name: '维尔纳', x: 100, y: 290, desc: '终点在望', event: 'RET_5' },
  { id: 12, name: '涅曼河', x: 80, y: 310, desc: '归来' }
]

const moscowIdx = 5
const currentNodeIdx = ref(0)
const currentNode = computed(() => nodes[currentNodeIdx.value])
const napoleonX = computed(() => nodes[currentNodeIdx.value].x)
const napoleonY = computed(() => nodes[currentNodeIdx.value].y)

// 路径
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

// 视觉效果
const hpPercent = computed(() => (troops.value / 422000) * 100)
const hpBarClass = computed(() => {
  if (hpPercent.value < 20) return 'critical'
  if (hpPercent.value < 50) return 'low'
  return 'normal'
})
const seasonClass = computed(() => {
  if (dayIndex.value <= 5) return 'summer'
  if (dayIndex.value <= 9) return 'autumn'
  return 'winter'
})
const snowOpacity = computed(() => phase.value === 'RETREAT' ? Math.min(0.8, (dayIndex.value - 7) * 0.15) : 0)
const frostOpacity = computed(() => temperature.value < 0 ? Math.min(0.7, Math.abs(temperature.value) / 25) : 0)
const logPanelClass = computed(() => {
  if (hpPercent.value < 20) return 'bloody'
  if (hpPercent.value < 50) return 'messy'
  return ''
})

// 事件系统
const eventPool = {
  ADV_1: {
    icon: '⚔️', title: '斯摩棱斯克攻城战', type: 'battle',
    story: '俄军据城死守。城墙坚固，火炮轰鸣。',
    choiceA: { label: '强攻城池', hint: '损失15,000人', effect: { troops: -15000 } },
    choiceB: { label: '围困等待', hint: '损失5,000人，消耗时间', effect: { troops: -5000, day: 1 } }
  },
  ADV_2: {
    icon: '💀', title: '博罗季诺会战', type: 'battle',
    story: '库图佐夫终于迎战。这将是拿破仑战争中最血腥的一天。',
    choiceA: { label: '全线进攻', hint: '损失30,000人，击溃俄军', effect: { troops: -30000 } },
    choiceB: { label: '稳步推进', hint: '损失20,000人', effect: { troops: -20000 } }
  },
  RET_1: {
    icon: '🎒', title: '满载的马车', type: 'logistics',
    story: '军官们的马车塞满了莫斯科抢来的金银，严重拖慢行军速度。',
    choiceA: { label: '强令抛弃财物', hint: '纪律+10，速度恢复', effect: { discipline: 10 } },
    choiceB: { label: '默许携带', hint: '行军减速，多冻一天', effect: { day: 1, temp: -3 } }
  },
  RET_2: {
    icon: '🤕', title: '伤员的恳求', type: 'moral',
    story: '数千名博罗季诺的伤员恳求大部队带上他们。',
    choiceA: { label: '带上他们', hint: '减速，补给消耗大', effect: { troops: -5000, day: 1 } },
    choiceB: { label: '抛弃他们', hint: '纪律-20，全速前进', effect: { discipline: -20 } }
  },
  RET_3: {
    icon: '🐴', title: '冻结的战马', type: 'logistics',
    story: '战马因路面结冰不断摔断腿。士兵们饥渴地盯着死马。',
    choiceA: { label: '宰杀战马充饥', hint: '减少饥饿损耗', effect: { troops: -2000 } },
    choiceB: { label: '保护战马', hint: '士兵因饥饿逃跑-5%', effect: { troopsPct: -5 } }
  },
  RET_4: {
    icon: '🦴', title: '人肉交易', type: 'horror',
    story: '有士兵私下售卖"可疑的肉排"。大家都知道那是什么，但太饿了。',
    choiceA: { label: '严厉禁止并处决', hint: '纪律+20，兵力-100', effect: { discipline: 20, troops: -100 } },
    choiceB: { label: '睁一只眼闭一只眼', hint: '纪律-30', effect: { discipline: -30 } }
  },
  RET_5: {
    icon: '🏃', title: '抛弃皇帝？', type: 'critical',
    story: '谣传巴黎发生政变。拿破仑打算独自骑快马冲回法国。',
    choiceA: { label: '让他走', hint: '纪律归零，军队溃散', effect: { discipline: -100, troopsPct: -20 } },
    choiceB: { label: '强留皇帝', hint: '皇帝健康-30，士气回升', effect: { health: -30, discipline: 20 } }
  },
  BEREZINA: {
    icon: '🌊', title: '贝雷津纳河的断桥', type: 'critical',
    story: '后有追兵，前有冰河。桥已被毁。必须选一批人去死。',
    choiceA: { label: '工兵自我牺牲', hint: '工兵全灭，踩踏死10,000人', effect: { troops: -10000 } },
    choiceB: { label: '派老近卫军断后', hint: '精锐全灭，皇帝健康-20', effect: { troops: -8000, health: -20 } }
  }
}

const currentEvent = ref(null)
const showMoscowModal = ref(false)
const showMutinyModal = ref(false)

// 日志
const logs = ref([])
function addLog(text, type = 'normal') {
  logs.value.unshift({ date: currentDate.value, text, type })
  if (logs.value.length > 8) logs.value.pop()
}

// 伤害显示
const damages = ref([])
let dmgId = 0
function showDamage(text, type = 'loss') {
  damages.value.push({ id: dmgId++, text, type, x: 350 + Math.random() * 100, y: 150 + Math.random() * 50 })
  setTimeout(() => damages.value.shift(), 1500)
  isShaking.value = true
  setTimeout(() => isShaking.value = false, 300)
}

// Toast
const toastMsg = ref('')
const toastType = ref('')
function showToast(msg, type = '') {
  toastMsg.value = msg
  toastType.value = type
  setTimeout(() => toastMsg.value = '', 2000)
}

// 工具
function formatNumber(n) { return n.toLocaleString() }
function estimateLoss() {
  const base = 2000
  const coldMult = temperature.value < 0 ? 1 + Math.abs(temperature.value) * 0.1 : 1
  const disciplineMult = discipline.value < 50 ? 1.5 : 1
  return Math.floor(base * coldMult * disciplineMult)
}
const lossPercent = computed(() => ((422000 - troops.value) / 422000 * 100).toFixed(1))

// 游戏流程
let advanceTimer = null

function startAdvance() {
  gamePhase.value = 'PLAY'
  phase.value = 'ADVANCE'
  isAnimating.value = true
  addLog('大军跨过涅曼河，开始远征！', 'important')
  
  advanceTimer = setInterval(() => {
    if (currentNodeIdx.value >= moscowIdx) {
      clearInterval(advanceTimer)
      isAnimating.value = false
      showMoscowModal.value = true
      return
    }
    currentNodeIdx.value++
    dayIndex.value++
    const loss = Math.floor(troops.value * 0.015)
    troops.value -= loss
    showDamage(`-${formatNumber(loss)}`, 'minor')
    showToast(`攻占 ${currentNode.value.name}！`)
    addLog(`抵达${currentNode.value.name}`, 'move')
    
    const node = nodes[currentNodeIdx.value]
    if (node.event && eventPool[node.event]) {
      clearInterval(advanceTimer)
      isAnimating.value = false
      currentEvent.value = eventPool[node.event]
    }
  }, 1200)
}

function beginRetreat() {
  showMoscowModal.value = false
  phase.value = 'RETREAT'
  temperature.value = -5
  dayIndex.value = 7
  addLog('莫斯科大火！被迫撤退！', 'critical')
}

function doRetreatStep() {
  if (isAnimating.value) return
  isAnimating.value = true
  
  // 天气恶化（毒圈）
  temperature.value -= 2
  dayIndex.value++
  
  // 寒冷损耗
  const loss = estimateLoss()
  troops.value = Math.max(0, troops.value - loss)
  showDamage(`-${formatNumber(loss)}`)
  addLog(`撤退中，气温${temperature.value}°C，损失${formatNumber(loss)}人`, 'move')
  
  // 纪律下降
  discipline.value = Math.max(0, discipline.value - 5)
  
  setTimeout(() => {
    isAnimating.value = false
    
    if (troops.value <= 0) {
      troops.value = 0
      gamePhase.value = 'RESULT'
      return
    }
    
    // 纪律崩溃检测
    if (discipline.value < 30 && Math.random() < 0.5) {
      showMutinyModal.value = true
      return
    }
    
    currentNodeIdx.value++
    
    if (currentNodeIdx.value >= nodes.length - 1) {
      gamePhase.value = 'RESULT'
      return
    }
    
    const node = nodes[currentNodeIdx.value]
    if (node.event && eventPool[node.event]) {
      currentEvent.value = eventPool[node.event]
    }
  }, 600)
}

function napoleonInspire() {
  napoleonHealth.value -= 15
  discipline.value = Math.min(100, discipline.value + 20)
  showToast('拿破仑亲自激励士气！', 'inspire')
  addLog('皇帝亲自巡视，士气回升', 'important')
  if (napoleonHealth.value < 30) {
    addLog('皇帝身体状况堪忧...', 'critical')
  }
}

function pickChoice(choice) {
  const evt = currentEvent.value
  const eff = choice === 'A' ? evt.choiceA.effect : evt.choiceB.effect
  addLog(`${evt.title}：${choice === 'A' ? evt.choiceA.label : evt.choiceB.label}`, 'event')
  
  if (eff.troops) {
    troops.value = Math.max(0, troops.value + eff.troops)
    showDamage(`${eff.troops.toLocaleString()}`)
  }
  if (eff.troopsPct) {
    const loss = Math.floor(troops.value * Math.abs(eff.troopsPct) / 100)
    troops.value = Math.max(0, troops.value - loss)
    showDamage(`-${formatNumber(loss)}`)
  }
  if (eff.discipline) discipline.value = Math.max(0, Math.min(100, discipline.value + eff.discipline))
  if (eff.health) napoleonHealth.value = Math.max(0, napoleonHealth.value + eff.health)
  if (eff.day) dayIndex.value += eff.day
  if (eff.temp) temperature.value += eff.temp
  
  currentEvent.value = null
  
  if (troops.value <= 0) {
    troops.value = 0
    gamePhase.value = 'RESULT'
    return
  }
  
  if (phase.value === 'ADVANCE') {
    isAnimating.value = true
    advanceTimer = setInterval(() => {
      if (currentNodeIdx.value >= moscowIdx) {
        clearInterval(advanceTimer)
        isAnimating.value = false
        showMoscowModal.value = true
        return
      }
      currentNodeIdx.value++
      dayIndex.value++
      const loss = Math.floor(troops.value * 0.015)
      troops.value -= loss
      showDamage(`-${formatNumber(loss)}`, 'minor')
      showToast(`攻占 ${currentNode.value.name}！`)
      addLog(`抵达${currentNode.value.name}`, 'move')
      
      const node = nodes[currentNodeIdx.value]
      if (node.event && eventPool[node.event]) {
        clearInterval(advanceTimer)
        isAnimating.value = false
        currentEvent.value = eventPool[node.event]
      }
    }, 1200)
  }
}

function resolveMutiny() {
  const loss = Math.floor(troops.value * 0.15)
  troops.value -= loss
  discipline.value = 40
  showDamage(`-${formatNumber(loss)} 哗变`)
  addLog('哗变平息，但损失惨重', 'critical')
  showMutinyModal.value = false
  
  if (troops.value <= 0) {
    troops.value = 0
    gamePhase.value = 'RESULT'
  }
}

function getNodeState(idx) {
  if (idx === currentNodeIdx.value) return 'current'
  if (idx < currentNodeIdx.value) return 'visited'
  return 'future'
}

// 结局
const endTitle = computed(() => {
  if (troops.value >= 30000) return '帝国余晖'
  if (troops.value >= 5000) return '历史重现'
  return '全军覆没'
})
const endSubtitle = computed(() => {
  if (troops.value >= 30000) return '军事奇迹'
  if (troops.value >= 5000) return '与拿破仑相当'
  return '法兰西的悲剧'
})
const endQuote = computed(() => {
  if (troops.value >= 30000) return '你做到了不可能的事。即使是你，也只能保下这些人。'
  if (troops.value >= 5000) return '你尽力了。这与拿破仑本人的结果相差无几，证明了在俄国的冬天面前，人力是多么渺小。'
  return '即使是你，也无法战胜俄罗斯的冬天。422,000名法兰西的年轻人，消失在无尽的雪原中。'
})

function restart() {
  troops.value = 422000
  discipline.value = 100
  napoleonHealth.value = 100
  temperature.value = 20
  dayIndex.value = 0
  currentNodeIdx.value = 0
  phase.value = 'ADVANCE'
  logs.value = []
  damages.value = []
  currentEvent.value = null
  showMoscowModal.value = false
  showMutinyModal.value = false
  gamePhase.value = 'INTRO'
}

function goHome() { router.push('/') }

onUnmounted(() => { if (advanceTimer) clearInterval(advanceTimer) })
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  font-family: 'Georgia', serif;
}
.game-container.shaking { animation: shake 0.3s ease-in-out; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.layer-0-background {
  position: fixed;
  inset: 0;
  background: linear-gradient(rgba(30,25,20,0.8), rgba(30,25,20,0.8)),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%231a1815' width='100' height='100'/%3E%3Cpath d='M0 50h100M50 0v100' stroke='%23252015'/%3E%3C/svg%3E");
  background-color: #1a1815;
}
.summer .layer-0-background { filter: sepia(0.3) brightness(1.1); }
.autumn .layer-0-background { filter: sepia(0.2) brightness(0.85); }
.winter .layer-0-background { filter: grayscale(0.6) brightness(0.5); }

.layer-1-gameboard { position: relative; z-index: 10; width: 100%; height: 100%; display: flex; }

.status-hud {
  position: fixed;
  top: 0; left: 0; right: 0;
  display: flex;
  justify-content: center;
  gap: 25px;
  padding: 10px 20px;
  background: rgba(20, 18, 15, 0.95);
  border-bottom: 2px solid rgba(180, 140, 80, 0.4);
  z-index: 50;
  flex-wrap: wrap;
}
.hud-item { display: flex; align-items: center; gap: 8px; }
.hud-icon { font-size: 1.2rem; }
.hud-content { display: flex; flex-direction: column; }
.hud-label { font-size: 0.65rem; color: #8a7a6a; text-transform: uppercase; letter-spacing: 1px; }
.hud-value { font-size: 1.1rem; font-weight: bold; color: #d4a017; }
.hud-value.frozen { color: #6ab7d6; }
.hud-value.danger { color: #c0392b; animation: pulse 1s infinite; }

.hp-bar, .stat-bar { width: 100px; height: 6px; background: rgba(0,0,0,0.4); border-radius: 3px; overflow: hidden; margin-top: 2px; }
.hp-fill, .stat-fill { height: 100%; transition: width 0.5s; }
.hp-bar.normal .hp-fill { background: linear-gradient(90deg, #d4a017, #f0c040); }
.hp-bar.low .hp-fill { background: linear-gradient(90deg, #b87333, #d4a017); }
.hp-bar.critical .hp-fill { background: linear-gradient(90deg, #8b0000, #c0392b); animation: pulse 1s infinite; }
.stat-bar.discipline .stat-fill { background: linear-gradient(90deg, #3498db, #5dade2); }
.stat-bar.health .stat-fill { background: linear-gradient(90deg, #9b59b6, #af7ac5); }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.hud-badge { display: flex; align-items: center; }
.badge { padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold; }
.badge.ADVANCE { background: rgba(212, 160, 23, 0.3); color: #d4a017; }
.badge.RETREAT { background: rgba(192, 57, 43, 0.3); color: #e74c3c; }

.map-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 70px 20px 20px; }
.campaign-map { width: 100%; max-width: 850px; height: auto; }
.route-base { opacity: 0.3; }
.route-traveled.ADVANCE { stroke: #d4a017; filter: drop-shadow(0 0 6px rgba(212,160,23,0.6)); }
.route-traveled.RETREAT { stroke: #6ab7d6; stroke-dasharray: 8 4; }
.node { transition: all 0.3s; }
.node.current { fill: #d4a017; stroke: #fff; stroke-width: 3; filter: drop-shadow(0 0 8px #d4a017); }
.node.visited { fill: #5a5040; stroke: #3a3030; stroke-width: 1; }
.node.future { fill: #2a2520; stroke: #4a4540; stroke-width: 1; }
.node-name { fill: #7a6a5a; font-size: 10px; }
.node-name.active { fill: #d4a017; font-weight: bold; }
.napoleon { transition: transform 0.6s ease; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5)); }

.log-panel {
  position: fixed;
  left: 0; top: 55px; bottom: 0;
  width: 260px;
  background: rgba(20, 18, 15, 0.92);
  border-right: 1px solid rgba(180, 140, 80, 0.3);
  padding: 15px;
  display: flex;
  flex-direction: column;
  z-index: 40;
}
.log-panel h3 { color: #d4a017; margin: 0 0 10px; font-size: 0.95rem; }
.log-list { flex: 1; overflow-y: auto; margin-bottom: 10px; }
.log-item { padding: 6px 8px; border-bottom: 1px solid rgba(180, 140, 80, 0.1); border-left: 3px solid transparent; }
.log-item.important { border-left-color: #d4a017; }
.log-item.critical { border-left-color: #c0392b; }
.log-item.event { border-left-color: #9b59b6; }
.log-item.move { border-left-color: #3498db; }
.log-date { font-size: 0.65rem; color: #6a5a4a; }
.log-text { margin: 3px 0 0; font-size: 0.8rem; color: #c9b896; }
.log-panel.messy .log-text { font-style: italic; }
.log-panel.bloody { border-right-color: rgba(139, 0, 0, 0.5); }
.log-panel.bloody .log-text { color: #d4a0a0; }

.current-pos { padding: 10px; background: rgba(212, 160, 23, 0.1); border: 1px solid rgba(212, 160, 23, 0.3); border-radius: 6px; margin-bottom: 10px; }
.current-pos h4 { color: #d4a017; margin: 0 0 4px; font-size: 0.9rem; }
.current-pos p { color: #a09080; margin: 0; font-size: 0.8rem; }

.action-area { margin-top: auto; }
.btn-retreat { width: 100%; padding: 12px; background: linear-gradient(135deg, #8b0000, #c0392b); border: none; color: #fff; font-size: 1rem; font-weight: bold; border-radius: 6px; cursor: pointer; }
.btn-retreat:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(192, 57, 43, 0.4); }
.btn-inspire { width: 100%; margin-top: 8px; padding: 10px; background: rgba(155, 89, 182, 0.3); border: 1px solid #9b59b6; color: #af7ac5; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-inspire:hover { background: rgba(155, 89, 182, 0.5); }
.hint { text-align: center; color: #c0392b; font-size: 0.8rem; margin: 6px 0; }
.animating-hint { text-align: center; color: #d4a017; padding: 15px; font-style: italic; }

.layer-2-effects { position: fixed; inset: 0; pointer-events: none; z-index: 20; }
.vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%); }
.snow-overlay { position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle fill='%23fff' cx='10' cy='10' r='1'/%3E%3Ccircle fill='%23fff' cx='50' cy='30' r='1.5'/%3E%3Ccircle fill='%23fff' cx='80' cy='60' r='1'/%3E%3Ccircle fill='%23fff' cx='30' cy='80' r='1.2'/%3E%3C/svg%3E"); animation: snowfall 8s linear infinite; }
@keyframes snowfall { 0% { background-position: 0 0; } 100% { background-position: 100px 300px; } }
.frost-frame { position: absolute; inset: 0; border: 20px solid rgba(180, 210, 230, 0.25); box-shadow: inset 0 0 60px rgba(180, 210, 230, 0.15); }

.damage-numbers { position: absolute; inset: 0; }
.dmg-text { position: absolute; font-size: 1.8rem; font-weight: 800; color: #c0392b; text-shadow: 2px 2px 4px #000; animation: floatUp 1.5s ease-out forwards; }
.dmg-text.minor { font-size: 1.2rem; color: #e67e22; }
@keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-80px) scale(0.8); opacity: 0; } }
.dmg-enter-active { animation: floatUp 1.5s ease-out; }

.toast { position: fixed; top: 70px; left: 50%; transform: translateX(-50%); background: rgba(212, 160, 23, 0.95); color: #1a1612; padding: 10px 25px; border-radius: 20px; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
.toast.inspire { background: rgba(155, 89, 182, 0.95); color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-20px); }

.layer-3-ui { position: fixed; inset: 0; z-index: 100; pointer-events: none; }
.layer-3-ui > * { pointer-events: auto; }

.intro-modal, .result-modal { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.6); }
.intro-card, .result-card { background: linear-gradient(135deg, #2a2520, #1a1815); border: 2px solid rgba(180, 140, 80, 0.5); border-radius: 12px; padding: 40px; text-align: center; max-width: 450px; }
.intro-card h1 { font-size: 4.5rem; color: #d4a017; margin: 0; text-shadow: 0 4px 20px rgba(212, 160, 23, 0.5); }
.intro-card h2 { font-size: 1.8rem; color: #c9b896; margin: 5px 0 10px; }
.intro-card .tagline { color: #7a6a5a; font-style: italic; margin-bottom: 25px; }
.intro-body { line-height: 1.9; margin-bottom: 25px; color: #c9b896; }
.intro-body .warning { color: #c0392b; font-weight: bold; font-size: 1.05rem; }
.btn-start { padding: 14px 45px; background: linear-gradient(135deg, #d4a017, #b8860b); border: none; color: #1a1612; font-size: 1.1rem; font-weight: bold; border-radius: 6px; cursor: pointer; margin: 5px; }
.btn-start:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(212, 160, 23, 0.5); }
.btn-home, .secondary { padding: 10px 25px; background: transparent; border: 1px solid #5a5040; color: #8a7a6a; border-radius: 6px; cursor: pointer; margin: 5px; }
.btn-home:hover, .secondary:hover { border-color: #8a7a6a; color: #c9b896; }

.event-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.85); }
.event-overlay.fire-effect { background: radial-gradient(ellipse at center, rgba(139, 0, 0, 0.3), rgba(0, 0, 0, 0.9)); }
.event-overlay.mutiny { background: radial-gradient(ellipse at center, rgba(192, 57, 43, 0.3), rgba(0, 0, 0, 0.9)); }
.event-modal { background: linear-gradient(135deg, #2a2520, #1a1815); border: 2px solid rgba(180, 140, 80, 0.5); border-radius: 12px; padding: 35px; max-width: 480px; text-align: center; }
.event-modal.moscow { border-color: rgba(192, 57, 43, 0.6); }
.event-modal.critical { border-color: rgba(192, 57, 43, 0.8); }
.event-modal.horror { border-color: rgba(100, 50, 50, 0.8); }
.modal-icon { font-size: 3.5rem; margin-bottom: 10px; }
.event-modal h2 { color: #d4a017; margin: 0 0 15px; font-size: 1.6rem; }
.event-modal p { color: #c9b896; line-height: 1.7; margin: 10px 0; }
.event-modal .highlight { color: #e8dcc8; font-weight: bold; }
.event-modal .dramatic { color: #e74c3c; font-weight: bold; }
.event-story { font-style: italic; border-left: 3px solid rgba(180, 140, 80, 0.4); padding-left: 12px; margin: 15px 0; text-align: left; }

.choices { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.choice { padding: 15px; border-radius: 8px; cursor: pointer; text-align: left; transition: all 0.3s; border: none; }
.choice strong { display: block; font-size: 1rem; margin-bottom: 4px; }
.choice span { font-size: 0.85rem; opacity: 0.8; }
.choice-a { background: rgba(192, 57, 43, 0.25); border: 1px solid rgba(192, 57, 43, 0.5); color: #e8dcc8; }
.choice-a:hover { background: rgba(192, 57, 43, 0.4); transform: translateX(6px); }
.choice-b { background: rgba(39, 174, 96, 0.2); border: 1px solid rgba(39, 174, 96, 0.4); color: #e8dcc8; }
.choice-b:hover { background: rgba(39, 174, 96, 0.35); transform: translateX(6px); }
.btn-confirm { margin-top: 20px; padding: 14px 40px; background: linear-gradient(135deg, #8b0000, #c0392b); border: none; color: #fff; font-size: 1.1rem; font-weight: bold; border-radius: 6px; cursor: pointer; }
.btn-confirm:hover { transform: scale(1.02); }

.result-card h1 { font-size: 2.5rem; color: #d4a017; margin: 0 0 5px; }
.end-subtitle { color: #8a7a6a; font-style: italic; margin-bottom: 20px; }
.stats { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px; }
.stat-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(180, 140, 80, 0.15); color: #c9b896; }
.stat-row:last-child { border-bottom: none; }
.stat-row span:last-child { font-weight: bold; color: #d4a017; }
.stat-row .zero { color: #c0392b; }
.stat-row .loss { color: #c0392b; }
.end-quote { color: #c9b896; line-height: 1.7; font-style: italic; margin-bottom: 20px; font-size: 0.95rem; }

.compare { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; }
.compare h4 { color: #d4a017; margin: 0 0 12px; font-size: 0.95rem; }
.bar-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; font-size: 0.85rem; color: #a09080; }
.bar-row span:first-child { width: 35px; text-align: right; }
.bar-row span:last-child { width: 65px; color: #c9b896; }
.bar { flex: 1; height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
.fill { height: 100%; transition: width 1s; }
.fill.you { background: linear-gradient(90deg, #d4a017, #f0c040); }
.fill.history { background: linear-gradient(90deg, #c0392b, #e74c3c); }
.result-btns { display: flex; justify-content: center; gap: 12px; }
.result-btns button { padding: 12px 30px; background: linear-gradient(135deg, #d4a017, #b8860b); border: none; color: #1a1612; font-size: 0.95rem; font-weight: bold; border-radius: 6px; cursor: pointer; }
.result-btns button:hover { transform: translateY(-2px); }

.modal-enter-active, .modal-leave-active { transition: all 0.4s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.9); }

.log-list::-webkit-scrollbar { width: 4px; }
.log-list::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
.log-list::-webkit-scrollbar-thumb { background: rgba(180, 140, 80, 0.4); border-radius: 2px; }

@media (max-width: 900px) {
  .log-panel { display: none; }
  .status-hud { gap: 15px; padding: 8px 10px; }
  .hud-value { font-size: 0.95rem; }
  .hp-bar, .stat-bar { width: 70px; }
}
</style>
