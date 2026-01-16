// 游戏平衡配置 - 目标：最终幸存约1万人
// 
// 损失计算（基于历史）：
// 进攻阶段：422,000 → 130,000（损失约69%，5个节点）
//   - 每节点行军损失：约8-12%（含疾病）
//   - 事件损失：约80,000人（战役为主）
// 
// 撤退阶段：130,000 → 10,000（损失约92%，7个节点）
//   - 每节点行军损失：约5-12%（含冻死）
//   - 事件损失：约40,000人

export const BALANCE_CONFIG = {
  // ==================== 进攻阶段配置 ====================
  ADVANCE: {
    // 每段行军的固定基础损失
    BASE_LOSS: 3000,
    // 疾病损失（百分比）- 降低以平衡
    DISEASE_LOSS_PERCENT: 0.04,   // 4%
    // 逃兵损失（百分比）
    DESERTION_PERCENT: 0.01,      // 1%
  },

  // ==================== 撤退阶段配置 ====================
  RETREAT: {
    // 每段行军的固定基础损失
    BASE_LOSS: 1500,
    // 冻死损失（百分比，根据温度）- 降低以平衡
    FROST_LOSS_PERCENT: {
      NORMAL: 0,        // 0°C以上
      MILD: 0.02,       // 0到-10°C: 2%
      COLD: 0.04,       // -10到-20°C: 4%
      SEVERE: 0.07,     // -20到-30°C: 7%
      EXTREME: 0.10     // -30°C以下: 10%
    },
    // 纪律对损失的乘数
    DISCIPLINE_MULTIPLIER: {
      EXCELLENT: 0.8,   // 纪律80+
      GOOD: 1.0,        // 纪律50-80
      LOW: 1.15,        // 纪律30-50
      CRITICAL: 1.3,    // 纪律10-30
      COLLAPSE: 1.5     // 纪律<10
    },
  },

  // ==================== 纪律系统 ====================
  DISCIPLINE: {
    ADVANCE_DECREASE: -2,
    RETREAT_DECREASE: -3,
    COLD_PENALTY: { MILD: -1, SEVERE: -2, EXTREME: -4 },
    TROOPS_PENALTY: { LOW: -1, CRITICAL: -2, COLLAPSE: -3 },
    MUTINY_THRESHOLD: 12,
    MUTINY_PROBABILITY: 0.35,
  },

  // ==================== 拿破仑健康系统 ====================
  NAPOLEON_HEALTH: {
    INSPIRE_COST: 10,
    COLD_DAMAGE: 2,
    SICK_THRESHOLD: 20,
  },

  // ==================== 死亡螺旋（撤退阶段生效）====================
  DEATH_SPIRAL: {
    THRESHOLD_1: 80000, MULTIPLIER_1: 1.02,
    THRESHOLD_2: 50000, MULTIPLIER_2: 1.05,
    THRESHOLD_3: 25000, MULTIPLIER_3: 1.08,
    THRESHOLD_4: 10000, MULTIPLIER_4: 1.10,
  },

  // ==================== 随机波动 ====================
  RANDOM_VARIANCE: { MIN: 0.90, MAX: 1.10 },

  // ==================== 结局评级 ====================
  ENDING_THRESHOLDS: {
    S_RANK: 20000,    // 超过2万是奇迹
    A_RANK: 8000,     // 8千-2万是历史水平
    B_RANK: 2000,     // 2千以上勉强及格
  }
}

// ==================== 计算每段行军损失 ====================
export function calculateDailyLoss(state, config = BALANCE_CONFIG) {
  const { phase, troops, temperature, discipline } = state
  
  let fixedLoss = 0      // 固定数值损失
  let percentLoss = 0    // 百分比损失
  
  if (phase === 'ADVANCE') {
    // 进攻阶段
    fixedLoss = config.ADVANCE.BASE_LOSS
    percentLoss = config.ADVANCE.DISEASE_LOSS_PERCENT + config.ADVANCE.DESERTION_PERCENT
  } else {
    // 撤退阶段
    fixedLoss = config.RETREAT.BASE_LOSS
    
    // 冻死损失（百分比）
    if (temperature < -30) {
      percentLoss = config.RETREAT.FROST_LOSS_PERCENT.EXTREME
    } else if (temperature < -20) {
      percentLoss = config.RETREAT.FROST_LOSS_PERCENT.SEVERE
    } else if (temperature < -10) {
      percentLoss = config.RETREAT.FROST_LOSS_PERCENT.COLD
    } else if (temperature < 0) {
      percentLoss = config.RETREAT.FROST_LOSS_PERCENT.MILD
    }
    
    // 纪律系数影响固定损失
    let discMult = config.RETREAT.DISCIPLINE_MULTIPLIER.GOOD
    if (discipline >= 80) discMult = config.RETREAT.DISCIPLINE_MULTIPLIER.EXCELLENT
    else if (discipline >= 50) discMult = config.RETREAT.DISCIPLINE_MULTIPLIER.GOOD
    else if (discipline >= 30) discMult = config.RETREAT.DISCIPLINE_MULTIPLIER.LOW
    else if (discipline >= 10) discMult = config.RETREAT.DISCIPLINE_MULTIPLIER.CRITICAL
    else discMult = config.RETREAT.DISCIPLINE_MULTIPLIER.COLLAPSE
    
    fixedLoss = Math.floor(fixedLoss * discMult)
    
    // 死亡螺旋影响百分比损失
    percentLoss *= getDeathSpiralMultiplier(troops, config)
  }
  
  // 随机波动
  const randomMult = getRandomVariance(config)
  
  // 计算总损失 = 固定损失 + 百分比损失
  const totalLoss = Math.floor((fixedLoss + troops * percentLoss) * randomMult)
  
  return { 
    total: totalLoss, 
    fixedLoss: Math.floor(fixedLoss * randomMult),
    percentLoss: percentLoss,
    percentLossActual: Math.floor(troops * percentLoss * randomMult)
  }
}

function getDeathSpiralMultiplier(troops, config) {
  if (troops < config.DEATH_SPIRAL.THRESHOLD_4) return config.DEATH_SPIRAL.MULTIPLIER_4
  if (troops < config.DEATH_SPIRAL.THRESHOLD_3) return config.DEATH_SPIRAL.MULTIPLIER_3
  if (troops < config.DEATH_SPIRAL.THRESHOLD_2) return config.DEATH_SPIRAL.MULTIPLIER_2
  if (troops < config.DEATH_SPIRAL.THRESHOLD_1) return config.DEATH_SPIRAL.MULTIPLIER_1
  return 1.0
}

function getRandomVariance(config) {
  return config.RANDOM_VARIANCE.MIN + 
    Math.random() * (config.RANDOM_VARIANCE.MAX - config.RANDOM_VARIANCE.MIN)
}

// ==================== 纪律变化 ====================
export function calculateDisciplineChange(state, config = BALANCE_CONFIG) {
  let change = state.phase === 'ADVANCE' 
    ? config.DISCIPLINE.ADVANCE_DECREASE 
    : config.DISCIPLINE.RETREAT_DECREASE
  
  if (state.phase === 'RETREAT') {
    if (state.temperature < -10) change += config.DISCIPLINE.COLD_PENALTY.MILD
    if (state.temperature < -20) change += config.DISCIPLINE.COLD_PENALTY.SEVERE
    if (state.temperature < -30) change += config.DISCIPLINE.COLD_PENALTY.EXTREME
    
    if (state.troops < 50000) change += config.DISCIPLINE.TROOPS_PENALTY.LOW
    if (state.troops < 25000) change += config.DISCIPLINE.TROOPS_PENALTY.CRITICAL
    if (state.troops < 10000) change += config.DISCIPLINE.TROOPS_PENALTY.COLLAPSE
  }
  
  return change
}

// ==================== 计算疾病传播（简化版）====================
export function calculateDiseaseSpread(state, config = BALANCE_CONFIG) {
  const newInfections = { typhus: 0, dysentery: 0, frostbite: 0, starvation: 0 }
  const recoveries = { typhus: 0, dysentery: 0, frostbite: 0, starvation: 0 }
  return { newInfections, recoveries }
}

// ==================== 计算补给消耗 ====================
export function calculateSupplyConsumption(state, config = BALANCE_CONFIG) {
  const { troops, temperature } = state
  const troopUnits = troops / 10000
  
  const consumption = {
    food: troopUnits * 1.0,
    ammunition: troopUnits * 0.2,
    medicine: troopUnits * 0.3,
    clothing: troopUnits * 0.1
  }
  
  if (temperature < 0) {
    consumption.food *= 1.3
    consumption.clothing *= 1.5
  }
  
  return consumption
}

// ==================== 检查哗变 ====================
export function checkMutiny(state, config = BALANCE_CONFIG) {
  if (state.discipline < config.DISCIPLINE.MUTINY_THRESHOLD) {
    return Math.random() < config.DISCIPLINE.MUTINY_PROBABILITY
  }
  return false
}

// ==================== 检查皇帝生病 ====================
export function checkEmperorSick(state, config = BALANCE_CONFIG) {
  return state.napoleonHealth < config.NAPOLEON_HEALTH.SICK_THRESHOLD && state.napoleonHealth > 0
}

// ==================== 检查技能可用性 ====================
export function canUseSkill(skill, state, skillState) {
  if (skillState.cooldowns[skill.id] > 0) return { canUse: false, reason: '技能冷却中' }
  if (skill.maxUses > 0 && (skillState.useCounts[skill.id] || 0) >= skill.maxUses) {
    return { canUse: false, reason: '使用次数已达上限' }
  }
  return { canUse: true }
}

// ==================== 旧版兼容函数 ====================
export function calculateLoss(state, config = BALANCE_CONFIG) {
  return calculateDailyLoss(state, config).total
}

export default BALANCE_CONFIG
