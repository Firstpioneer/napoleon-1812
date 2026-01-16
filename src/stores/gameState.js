// 游戏状态管理 - 集中管理所有游戏状态
// 根据改进总结2.0设计

import { ref, computed, reactive } from 'vue'

// ==================== 节点间距离配置 ====================
// 基于历史数据的行军天数
export const nodeDistances = {
  // 进攻阶段 (6月24日 - 9月14日，约82天)
  0: { days: 4, terrain: 'plain', from: '涅曼河', to: '维尔纽斯', desc: '穿越立陶宛平原' },
  1: { days: 17, terrain: 'forest', from: '维尔纽斯', to: '维捷布斯克', desc: '穿越白俄罗斯森林' },
  2: { days: 19, terrain: 'mixed', from: '维捷布斯克', to: '斯摩棱斯克', desc: '俄军焦土政策区域' },
  3: { days: 22, terrain: 'road', from: '斯摩棱斯克', to: '博罗季诺', desc: '通往莫斯科的大道' },
  4: { days: 7, terrain: 'road', from: '博罗季诺', to: '莫斯科', desc: '最后的冲刺' },
  // 撤退阶段 (10月19日 - 12月14日，约56天)
  5: { days: 5, terrain: 'road', from: '莫斯科', to: '小雅罗斯拉韦茨', desc: '被迫原路返回' },
  6: { days: 10, terrain: 'devastated', from: '小雅罗斯拉韦茨', to: '维亚兹马', desc: '已被摧毁的土地' },
  7: { days: 6, terrain: 'frozen', from: '维亚兹马', to: '斯摩棱斯克', desc: '严寒开始' },
  8: { days: 6, terrain: 'frozen', from: '斯摩棱斯克', to: '克拉斯诺耶', desc: '哥萨克骑兵袭扰' },
  9: { days: 11, terrain: 'frozen', from: '克拉斯诺耶', to: '别列津纳河', desc: '最艰难的路段' },
  10: { days: 9, terrain: 'frozen', from: '别列津纳河', to: '维尔纽斯', desc: '渡河后的溃败' },
  11: { days: 9, terrain: 'frozen', from: '维尔纽斯', to: '涅曼河', desc: '终点在望' }
}

// ==================== 疾病系统配置 ====================
export const diseases = {
  typhus: {
    name: '斑疹伤寒',
    icon: '🦠',
    baseInfectionRate: 0.015,
    deathRate: 0.045,
    recoveryRate: 0.008,
    modifiers: {
      crowding: 1.5,
      poorHygiene: 2.0,
      coldWeather: 1.3
    }
  },
  dysentery: {
    name: '痢疾',
    icon: '💧',
    baseInfectionRate: 0.02,
    deathRate: 0.025,
    recoveryRate: 0.015,
    modifiers: {
      badWater: 2.5,
      poorFood: 1.8,
      heat: 1.4
    }
  },
  frostbite: {
    name: '冻伤',
    icon: '❄️',
    baseInfectionRate: 0,
    deathRate: 0.06,
    recoveryRate: 0.003,
    tempTriggers: {
      below0: 0.03,
      below10: 0.10,
      below20: 0.25,
      below30: 0.45
    }
  },
  starvation: {
    name: '饥饿虚弱',
    icon: '🍞',
    baseInfectionRate: 0,
    deathRate: 0.035,
    recoveryRate: 0.025,
    supplyTriggers: {
      noSupply: 0.15,
      lowSupply: 0.06
    }
  }
}


// ==================== 指挥官技能配置 ====================
export const commanderSkills = {
  napoleonInspire: {
    id: 'napoleonInspire',
    name: '皇帝亲临',
    icon: '👑',
    description: '拿破仑亲自巡视部队，极大提升士气',
    effect: { discipline: 25, morale: 30, napoleonHealth: -15 },
    cooldown: 5,
    maxUses: 3,
    requirement: { napoleonHealth: 30 }
  },
  napoleonTactics: {
    id: 'napoleonTactics',
    name: '战术天才',
    icon: '🎯',
    description: '拿破仑亲自指挥战斗，减少战斗损失',
    effect: { battleLossReduction: 0.3, napoleonHealth: -10 },
    cooldown: 3,
    maxUses: 5,
    requirement: { napoleonHealth: 20, inBattle: true }
  },
  forceMarching: {
    id: 'forceMarching',
    name: '强行军',
    icon: '🏃',
    description: '加快行军速度，但增加疲劳和疾病',
    effect: { marchSpeed: 1.5, diseaseRate: 1.3, discipline: -5 },
    cooldown: 2,
    maxUses: -1,
    requirement: { discipline: 40 }
  },
  restAndRecover: {
    id: 'restAndRecover',
    name: '扎营休整',
    icon: '🏕️',
    description: '停止行军，让部队休息恢复',
    effect: { marchDays: 1, recoveryRate: 2.0, discipline: 5, diseaseRate: 0.7 },
    cooldown: 0,
    maxUses: -1,
    requirement: {}
  },
  quarantine: {
    id: 'quarantine',
    name: '隔离病患',
    icon: '🏥',
    description: '将病患隔离，减缓疾病传播',
    effect: { infectionRate: 0.5, marchSpeed: 0.7, morale: -10 },
    cooldown: 3,
    maxUses: -1,
    requirement: { infectionRate: 10 }
  },
  forage: {
    id: 'forage',
    name: '就地征粮',
    icon: '🌾',
    description: '派遣部队搜集食物和补给',
    effect: { supplies: 20, discipline: -8 },
    cooldown: 2,
    maxUses: -1,
    requirement: { phase: 'ADVANCE' }
  },
  sacrificeRearguard: {
    id: 'sacrificeRearguard',
    name: '牺牲后卫',
    icon: '⚔️',
    description: '留下后卫部队断后，主力加速撤退',
    effect: { troops: -5000, pursuitReduction: 0.7, marchSpeed: 1.3, discipline: -15 },
    cooldown: 5,
    maxUses: 3,
    requirement: { troops: 20000, phase: 'RETREAT' }
  },
  distributeReserves: {
    id: 'distributeReserves',
    name: '分发储备',
    icon: '📦',
    description: '打开储备物资，提升士气',
    effect: { supplies: -30, morale: 20, discipline: 10 },
    cooldown: 4,
    maxUses: 2,
    requirement: { supplies: 30 }
  }
}

// ==================== 补给系统配置 ====================
export const supplyConfig = {
  consumption: {
    base: { food: 2.0, ammunition: 0.3, medicine: 0.8, clothing: 0.2 },
    battle: { ammunition: 4.0, medicine: 1.5 },
    cold: { food: 1.4, clothing: 1.8 },
    disease: { medicine: 2.5 },
    forcedMarch: { food: 1.3 }
  },
  penalties: {
    food: {
      below50: { morale: -5, starvationRate: 0.08 },
      below20: { morale: -15, starvationRate: 0.20 },
      zero: { dailyDeath: 0.05, disciplineCollapse: true }
    },
    ammunition: {
      below50: { battleLoss: 1.2 },
      below20: { battleLoss: 1.5 },
      zero: { cannotFight: true }
    },
    medicine: {
      below50: { diseaseDeathRate: 1.3 },
      below20: { diseaseDeathRate: 1.8 },
      zero: { diseaseDeathRate: 3.0 }
    },
    clothing: {
      below50: { frostbiteRate: 1.2 },
      below20: { frostbiteRate: 1.5 },
      zero: { coldDailyDeath: 0.10 }
    }
  }
}

// ==================== 创建游戏状态 ====================
export function createGameState() {
  // 核心资源
  const troops = ref(422000)
  const discipline = ref(100)
  const morale = ref(100)
  const napoleonHealth = ref(100)
  const temperature = ref(22)
  
  // 补给系统
  const supplies = reactive({
    food: 100,
    ammunition: 100,
    medicine: 100,
    clothing: 100
  })
  
  // 疾病系统
  const armyHealth = reactive({
    healthy: 380000,
    infected: {
      typhus: 30000,
      dysentery: 10000,
      frostbite: 0,
      starvation: 2000
    }
  })
  
  // 行军系统
  const marchState = reactive({
    currentNodeIdx: 0,
    currentMarchDay: 0,
    totalMarchDays: 0,
    isMarching: false,
    pendingEvent: null
  })
  
  // 技能系统
  const skillState = reactive({
    cooldowns: {},
    useCounts: {},
    activeEffects: []
  })
  
  // 游戏阶段
  const gamePhase = ref('INTRO')
  const phase = ref('ADVANCE')
  const dayIndex = ref(0)
  
  // 计算属性
  const totalInfected = computed(() => 
    Object.values(armyHealth.infected).reduce((a, b) => a + b, 0)
  )
  
  const infectionRate = computed(() => 
    troops.value > 0 ? (totalInfected.value / troops.value * 100).toFixed(1) : 0
  )
  
  const overallSupply = computed(() => 
    (supplies.food * 0.4 + supplies.ammunition * 0.2 + 
     supplies.medicine * 0.2 + supplies.clothing * 0.2).toFixed(0)
  )
  
  return {
    troops, discipline, morale, napoleonHealth, temperature,
    supplies, armyHealth, marchState, skillState,
    gamePhase, phase, dayIndex,
    totalInfected, infectionRate, overallSupply
  }
}

export default { nodeDistances, diseases, commanderSkills, supplyConfig, createGameState }
