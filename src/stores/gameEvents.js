// 游戏事件池 - 带连锁反应系统
// 设计原则：
// - 积极选择（派兵支援等）：当下损失大，但有长期收益
// - 消极选择（抛弃等）：当下损失小，但有负面后果
// troops: 固定数值损失
// troopsPct: 百分比损失
// chainEffect: 触发的连锁效果

// ==================== 节点事件 ====================
export const eventPool = {
  // ==================== 进攻阶段事件 ====================
  
  ADV_VILNA: {
    icon: '🏛️',
    title: '维尔纽斯的诱惑',
    type: 'logistics',
    story: '立陶宛贵族热情欢迎你，提供宴会和休息。但俄军正在远方集结，时间宝贵。',
    historicalNote: '历史上拿破仑在维尔纽斯停留了18天，这给了俄军宝贵的集结时间。',
    choiceA: {
      label: '停留休整3天',
      hint: '损失3000人，士气+15【但撤退时天气更冷】',
      effect: { discipline: 15, day: 3, troops: -3000 },
      chainEffect: { slowAdvance: true, delayDays: 3 },
      chainWarning: '⚠️ 延误将导致撤退时面临更严酷的寒冬'
    },
    choiceB: {
      label: '立即追击',
      hint: '损失8000人，保持进攻节奏',
      effect: { discipline: -5, troops: -8000 },
      chainEffect: { fastAdvance: true },
      chainBonus: '✓ 快速推进，撤退时有更多时间'
    }
  },

  ADV_SCORCHED: {
    icon: '🔥',
    title: '焦土政策的开始',
    type: 'logistics',
    story: '俄军撤退前烧毁了所有粮仓和村庄。前方50公里内没有任何补给。',
    historicalNote: '俄军的焦土政策是导致法军非战斗减员的主要原因之一。',
    choiceA: {
      label: '宰杀战马充饥',
      hint: '损失3000人【后续战斗损失+20%，被追击概率+50%】',
      effect: { troops: -3000, discipline: -3 },
      chainEffect: { horsesSlaughtered: true },
      chainWarning: '⚠️ 失去骑兵优势，后续战斗和撤退将更加艰难'
    },
    choiceB: {
      label: '强行军寻找补给',
      hint: '饿死5%兵力，但保留骑兵战力',
      effect: { troopsPct: -5, discipline: -8, day: 1 }
    }
  },

  ADV_SMOLENSK: {
    icon: '⚔️',
    title: '斯摩棱斯克攻城战',
    type: 'battle',
    story: '俄军据城死守。城墙坚固，火炮轰鸣。这是进攻阶段的第一次重大战斗。',
    historicalNote: '历史上这场战役持续3天，法军损失约10,000人，城市被大火摧毁。',
    choiceA: {
      label: '强攻城池',
      hint: '损失12000人，快速占领【俄军士气受挫】',
      effect: { troops: -12000, discipline: 5, health: -5 },
      chainEffect: { russiansMoraleDown: true },
      chainBonus: '✓ 俄军士气受挫，后续战斗损失-10%'
    },
    choiceB: {
      label: '围困等待',
      hint: '损失4000人，延误4天【撤退时天气更冷】',
      effect: { troops: -4000, day: 4, discipline: -10 },
      chainEffect: { slowAdvance: true, delayDays: 4 },
      chainWarning: '⚠️ 延误将导致撤退时面临更严酷的寒冬'
    }
  },

  ADV_BORODINO: {
    icon: '💀',
    title: '博罗季诺血战',
    type: 'battle',
    story: '库图佐夫终于决定迎战。这将是拿破仑战争中最血腥的一天。双方投入超过25万兵力。',
    historicalNote: '历史上这场战役造成约70,000人伤亡，是拿破仑战争中最血腥的单日战斗。',
    choiceA: {
      label: '全线进攻',
      hint: '损失28000人【减少撤退时骚扰50%】',
      effect: { troops: -28000, discipline: -5, health: -10 },
      chainEffect: { russiansCrushed: true },
      chainBonus: '✓ 俄军元气大伤，撤退时骚扰减少50%'
    },
    choiceB: {
      label: '投入近卫军',
      hint: '损失38000人，歼灭俄军【近卫军损耗严重】',
      effect: { troops: -38000, discipline: 10, health: -15 },
      chainEffect: { guardsUsedEarly: true, russiansCrushed: true },
      chainWarning: '⚠️ 近卫军损耗严重，别列津纳河断后将额外损失6000人'
    }
  },

  // ==================== 撤退阶段事件 ====================

  RET_MALOYAROSLAVETS: {
    icon: '🗺️',
    title: '南路还是北路？',
    type: 'critical',
    story: '库图佐夫封锁了南路。南路有未被掠夺的补给，但需要战斗。北路是来时的废墟。',
    historicalNote: '历史上拿破仑选择了北路，这意味着沿途没有任何补给。',
    choiceA: {
      label: '强攻南路',
      hint: '损失8000人【减少饥饿事件50%，冻死减少30%】',
      effect: { troops: -8000, discipline: -8, day: 2 },
      chainEffect: { tookSouthRoute: true, hasSupplies: true },
      chainBonus: '✓ 获得补给和冬装，饥饿和冻死大幅减少'
    },
    choiceB: {
      label: '走北路原路返回',
      hint: '损失3000人，但沿途无补给【饥饿冻死增加】',
      effect: { troops: -3000, discipline: -5 },
      chainEffect: { noSupplies: true },
      chainWarning: '⚠️ 沿途无补给，饥饿和冻死将大幅增加'
    }
  },

  RET_FIRST_SNOW: {
    icon: '❄️',
    title: '严寒降临',
    type: 'disaster',
    story: '温度骤降至-15°C，士兵们没有冬装，马匹在冰面上打滑。每天都有人冻死在路边。',
    historicalNote: '第一场大雪标志着灾难的真正开始。没有冬装的士兵开始成批冻死。',
    choiceA: {
      label: '剥死者衣物御寒',
      hint: '冻死3%兵力，士气-25【但后续冻死减少40%】',
      effect: { troopsPct: -3, discipline: -25 },
      chainEffect: { hasWarmClothes: true },
      chainBonus: '✓ 获得御寒衣物，后续冻死减少40%'
    },
    choiceB: {
      label: '加快行军速度',
      hint: '冻死6%兵力，士气-10【无长期收益】',
      effect: { troopsPct: -6, discipline: -10 }
    }
  },

  RET_COSSACKS: {
    icon: '🐎',
    title: '哥萨克的狼群战术',
    type: 'battle',
    story: '哥萨克骑兵像狼群一样围绕大军，不断袭击落单者和补给队。后卫部队请求支援。',
    historicalNote: '哥萨克骑兵的游击战术给撤退中的法军造成了巨大损失。',
    choiceA: {
      label: '派近卫军支援后卫',
      hint: '损失5000人【后续骚扰减少40%，士气+10】',
      effect: { troops: -5000, discipline: 10 },
      chainEffect: { rearguardProtected: true },
      chainBonus: '✓ 后卫得到保护，后续骚扰减少40%'
    },
    choiceB: {
      label: '抛弃后卫加速前进',
      hint: '损失2000人【哗变概率+30%，逃兵+50%】',
      effect: { troops: -2000, discipline: -20 },
      chainEffect: { abandonedRearguard: true },
      chainWarning: '⚠️ 抛弃战友的行为将导致哗变和逃兵大增'
    }
  },

  RET_KRASNOI: {
    icon: '💀',
    title: '克拉斯诺耶的绝境',
    type: 'critical',
    story: '内伊元帅的后卫被俄军包围。他请求支援，但回援可能让主力陷入险境。',
    historicalNote: '历史上内伊率领残部踏着冰河突围，被拿破仑称为"勇士中的勇者"。',
    choiceA: {
      label: '回援内伊',
      hint: '损失7000人【后续战斗损失-15%，士气+15】',
      effect: { troops: -7000, discipline: 15, health: -10 },
      chainEffect: { savedNey: true },
      chainBonus: '✓ 内伊的勇气鼓舞全军，后续战斗损失减少'
    },
    choiceB: {
      label: '放弃后卫继续撤退',
      hint: '损失3000人【士气-35，哗变概率+40%】',
      effect: { troops: -3000, discipline: -35 },
      chainEffect: { abandonedNey: true },
      chainWarning: '⚠️ 放弃英雄将严重打击士气，哗变风险大增'
    }
  },

  RET_BEREZINA: {
    icon: '🌊',
    title: '别列津纳河的噩梦',
    type: 'critical',
    story: '河水未完全封冻，三支俄军正在合围。工兵可以架桥，但需要有人断后。',
    historicalNote: '历史上约25,000人在渡河时死亡或被俘，这是撤退中最惨烈的时刻。',
    choiceA: {
      label: '老近卫军断后',
      hint: '损失8000人【保护主力安全渡河】',
      effect: { troops: -8000, discipline: -10, health: -15 },
      chainCondition: 'guardsUsedEarly',
      chainPenalty: { troops: -6000 },
      chainPenaltyHint: '（近卫军已损耗，额外损失6000人）'
    },
    choiceB: {
      label: '让非战斗人员断后',
      hint: '损失4000人【士气-40，人道灾难】',
      effect: { troops: -4000, discipline: -40 },
      chainEffect: { humanDisaster: true },
      chainWarning: '⚠️ 人道灾难将导致士气崩溃'
    }
  },

  RET_NAPOLEON_LEAVES: {
    icon: '🦅',
    title: '皇帝的抉择',
    type: 'critical',
    story: '12月5日，拿破仑决定秘密返回巴黎。他说："我只能从杜伊勒里宫引起欧洲的敬畏。"',
    historicalNote: '历史上拿破仑确实在此时离开了军队，将指挥权交给缪拉元帅。',
    choiceA: {
      label: '让他走',
      hint: '士气-30，逃兵5%【保住帝国】',
      effect: { discipline: -30, troopsPct: -5 },
      chainEffect: { napoleonLeft: true }
    },
    choiceB: {
      label: '恳求他留下',
      hint: '士气+10，皇帝健康-25【帝国可能崩溃】',
      effect: { discipline: 10, health: -25 },
      chainEffect: { napoleonStayed: true },
      chainBonus: '✓ 皇帝留下鼓舞士气'
    }
  }
}


// ==================== 节点间随机事件（进攻阶段）====================
export const advanceRandomEvents = [
  {
    id: 'ADV_RANDOM_TYPHUS',
    title: '伤寒爆发',
    icon: '🦠',
    type: 'disaster',
    probability: 0.25,
    trigger: (state) => state.phase === 'ADVANCE',
    story: '军营中爆发伤寒。医生建议隔离病患，但这会拖慢行军速度。',
    historicalNote: '伤寒和痢疾是法军最大的杀手，造成的死亡人数超过战斗。',
    choiceA: {
      label: '隔离治疗',
      hint: '病死2%兵力，延误2天【但疫情得到控制】',
      effect: { troopsPct: -2, day: 2, discipline: 5 },
      chainEffect: { diseaseControlled: true },
      chainBonus: '✓ 疫情得到控制，后续疾病事件减少'
    },
    choiceB: {
      label: '继续前进',
      hint: '病死4%兵力【疫情扩散，后续病死增加】',
      effect: { troopsPct: -4, discipline: -8 },
      chainEffect: { diseaseSpread: true },
      chainWarning: '⚠️ 疫情扩散，后续疾病损失增加50%'
    }
  },

  {
    id: 'ADV_RANDOM_SUPPLY_RAID',
    title: '补给车队被袭',
    icon: '🎯',
    type: 'raid',
    probability: 0.20,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'ADVANCE') return false
      const modifier = chainEffects?.russiansCrushed ? 0.5 : 1.0
      return Math.random() < 0.20 * modifier
    },
    story: '哥萨克骑兵袭击了补给车队。是否派兵护送？',
    choiceA: {
      label: '派骑兵追击',
      hint: '损失2000人【缴获俄军情报】',
      effect: { troops: -2000, discipline: 8 },
      chainEffect: { hasIntel: true },
      chainBonus: '✓ 获得俄军情报，后续伏击概率降低'
    },
    choiceB: {
      label: '放弃追击',
      hint: '损失500人，丢失补给',
      effect: { troops: -500, discipline: -5 }
    }
  },
  {
    id: 'ADV_RANDOM_DESERTION',
    title: '逃兵潮',
    icon: '🏃',
    type: 'moral',
    probability: 0.15,
    trigger: (state) => state.phase === 'ADVANCE' && state.discipline < 60,
    story: '大量士兵趁夜色逃跑。是否追捕？',
    choiceA: {
      label: '追捕处决',
      hint: '损失500人【恢复纪律，震慑逃兵】',
      effect: { troops: -500, discipline: 15 },
      chainEffect: { strictDiscipline: true },
      chainBonus: '✓ 严明军纪，后续逃兵减少50%'
    },
    choiceB: {
      label: '放任不管',
      hint: '逃兵3%【后续逃兵增加】',
      effect: { troopsPct: -3, discipline: -10 },
      chainEffect: { looseDiscipline: true },
      chainWarning: '⚠️ 军纪涣散，后续逃兵增加50%'
    }
  },
  {
    id: 'ADV_RANDOM_CAVALRY_ADVANTAGE',
    title: '骑兵追击战',
    icon: '🐎',
    type: 'battle',
    probability: 0.15,
    trigger: (state, chainEffects) => {
      return state.phase === 'ADVANCE' && !chainEffects?.horsesSlaughtered
    },
    story: '侦察骑兵发现俄军后卫落单，是否追击？',
    choiceA: {
      label: '骑兵追击',
      hint: '损失1500人【俘获俄军补给】',
      effect: { troops: -1500, discipline: 12 },
      chainBonus: '✓ 缴获补给，士气大振'
    },
    choiceB: {
      label: '保持阵型',
      hint: '无损失，错过机会',
      effect: { discipline: -3 }
    }
  }
]


// ==================== 节点间随机事件（撤退阶段）====================
export const retreatRandomEvents = [
  {
    id: 'RET_RANDOM_FROZEN',
    title: '冻死潮',
    icon: '🧊',
    type: 'disaster',
    probability: 0.30,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT' || state.temperature >= -15) return false
      // 有御寒衣物减少概率
      const modifier = chainEffects?.hasWarmClothes ? 0.6 : 1.0
      // 选择南路有补给也减少
      const supplyMod = chainEffects?.tookSouthRoute ? 0.7 : 1.0
      return Math.random() < 0.30 * modifier * supplyMod
    },
    story: '路边又多了数百具冻僵的尸体。士兵们麻木地走过，不再有人停下。',
    isAutoTrigger: true,
    effect: { troopsPct: -3, discipline: -5 },
    message: '严寒夺走了更多生命...冻死3%兵力'
  },

  {
    id: 'RET_RANDOM_COSSACK_RAID',
    title: '哥萨克袭击',
    icon: '🐎',
    type: 'raid',
    probability: 0.25,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT') return false
      let modifier = 1.0
      if (chainEffects?.russiansCrushed) modifier *= 0.5
      if (chainEffects?.rearguardProtected) modifier *= 0.6
      return Math.random() < 0.25 * modifier
    },
    story: '哥萨克骑兵突然袭击了队伍侧翼！',
    choiceA: {
      label: '组织防御',
      hint: '损失2500人，击退敌军',
      effect: { troops: -2500, discipline: 5 }
    },
    choiceB: {
      label: '加速逃跑',
      hint: '损失1500人，丢弃辎重',
      effect: { troops: -1500, discipline: -12 }
    }
  },
  {
    id: 'RET_RANDOM_PURSUIT',
    title: '俄军追击',
    icon: '⚔️',
    type: 'pursuit',
    probability: 0.20,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT') return false
      let modifier = 1.0
      if (chainEffects?.horsesSlaughtered) modifier *= 1.5
      if (chainEffects?.russiansCrushed) modifier *= 0.6
      return Math.random() < 0.20 * modifier
    },
    story: '俄军正规军追上了撤退的队伍！',
    choiceA: {
      label: '组织防御战',
      hint: '损失4000人，击退追兵',
      effect: { troops: -4000, discipline: 8 }
    },
    choiceB: {
      label: '丢弃辎重逃跑',
      hint: '损失2000人，丢失补给',
      effect: { troops: -2000, discipline: -15 }
    }
  },
  {
    id: 'RET_RANDOM_FOOD_OUT',
    title: '食物耗尽',
    icon: '🍖',
    type: 'supply',
    probability: 0.25,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT') return false
      let modifier = 1.0
      if (chainEffects?.tookSouthRoute) modifier *= 0.5
      if (chainEffects?.noSupplies) modifier *= 1.5
      return Math.random() < 0.25 * modifier
    },
    story: '最后的口粮已经吃完。士兵们饥肠辘辘。',
    choiceA: {
      label: '强行觅食',
      hint: '饿死2%兵力【但获得食物，减少后续饥饿】',
      effect: { troopsPct: -2, discipline: -5 },
      chainEffect: { foundFood: true },
      chainBonus: '✓ 找到食物，后续饥饿事件减少'
    },
    choiceB: {
      label: '继续前进',
      hint: '饿死4%兵力，不停留',
      effect: { troopsPct: -4, discipline: -8 }
    }
  },

  {
    id: 'RET_RANDOM_MUTINY_SMALL',
    title: '士兵互相残杀',
    icon: '⚔️',
    type: 'horror',
    probability: 0.20,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT' || state.discipline >= 40) return false
      let modifier = 1.0
      if (chainEffects?.abandonedRearguard) modifier *= 1.5
      if (chainEffects?.abandonedNey) modifier *= 1.4
      if (chainEffects?.humanDisaster) modifier *= 1.3
      return Math.random() < 0.20 * modifier
    },
    story: '为了争夺食物和衣物，士兵们开始互相残杀。',
    choiceA: {
      label: '严厉镇压',
      hint: '损失1000人，恢复秩序',
      effect: { troops: -1000, discipline: 12 }
    },
    choiceB: {
      label: '睁眼闭眼',
      hint: '损失2%兵力，混乱加剧',
      effect: { troopsPct: -2, discipline: -18 }
    }
  },
  {
    id: 'RET_RANDOM_DESERTION',
    title: '大规模逃亡',
    icon: '🏃',
    type: 'moral',
    probability: 0.20,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT' || state.discipline >= 50) return false
      let modifier = 1.0
      if (chainEffects?.abandonedRearguard) modifier *= 1.5
      if (chainEffects?.looseDiscipline) modifier *= 1.5
      if (chainEffects?.strictDiscipline) modifier *= 0.5
      return Math.random() < 0.20 * modifier
    },
    story: '大批士兵趁夜色逃散，消失在雪原中。',
    isAutoTrigger: true,
    effect: { troopsPct: -3, discipline: -8 },
    message: '又有3%士兵逃散，消失在雪原中...'
  },
  {
    id: 'RET_RANDOM_SUPPLY_FOUND',
    title: '发现俄军补给站',
    icon: '🎁',
    type: 'logistics',
    probability: 0.10,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT') return false
      const modifier = chainEffects?.hasIntel ? 1.5 : 1.0
      return Math.random() < 0.10 * modifier
    },
    story: '侦察兵发现了一个被遗弃的俄军补给站！',
    isAutoTrigger: true,
    effect: { discipline: 15 },
    message: '发现俄军补给站！士气大振！'
  },
  {
    id: 'RET_RANDOM_NEY_RALLY',
    title: '内伊的鼓舞',
    icon: '⚔️',
    type: 'morale',
    probability: 0.20,
    trigger: (state, chainEffects) => {
      return state.phase === 'RETREAT' && chainEffects?.savedNey
    },
    story: '内伊元帅亲自走在队伍最后，用他的勇气鼓舞着每一个士兵。',
    isAutoTrigger: true,
    effect: { discipline: 12 },
    message: '内伊元帅的勇气鼓舞了全军！士气+12'
  },
  {
    id: 'RET_RANDOM_DISEASE_OUTBREAK',
    title: '疫病再次爆发',
    icon: '🦠',
    type: 'disaster',
    probability: 0.15,
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT') return false
      let modifier = 1.0
      if (chainEffects?.diseaseSpread) modifier *= 1.5
      if (chainEffects?.diseaseControlled) modifier *= 0.5
      return Math.random() < 0.15 * modifier
    },
    story: '伤寒和痢疾再次在军中蔓延。',
    isAutoTrigger: true,
    effect: { troopsPct: -2, discipline: -5 },
    message: '疫病蔓延，病死2%兵力...'
  }
]


// ==================== 简单随机事件（无选择）====================
export const randomEvents = [
  {
    id: 'RANDOM_FROZEN',
    icon: '🧊',
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT' || state.temperature >= -15) return false
      let prob = 0.20
      if (chainEffects?.hasWarmClothes) prob *= 0.6
      if (chainEffects?.tookSouthRoute) prob *= 0.7
      return Math.random() < prob
    },
    effect: { discipline: -5, troopsPct: -1.5 },
    message: '路边又多了数百具冻僵的尸体...冻死1.5%'
  },
  {
    id: 'RANDOM_GUERRILLA',
    icon: '🔪',
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT') return false
      const modifier = chainEffects?.russiansCrushed ? 0.5 : 1.0
      return Math.random() < 0.15 * modifier
    },
    effect: { troops: -1000, discipline: -3 },
    message: '游击队袭击了补给队，损失1000人。'
  },
  {
    id: 'RANDOM_FROSTBITE',
    icon: '❄️',
    trigger: (state, chainEffects) => {
      if (state.phase !== 'RETREAT' || state.temperature >= -25) return false
      let prob = 0.25
      if (chainEffects?.hasWarmClothes) prob *= 0.6
      return Math.random() < prob
    },
    effect: { troopsPct: -2, discipline: -5 },
    message: '极寒天气！冻死2%兵力...'
  }
]

export default { eventPool, advanceRandomEvents, retreatRandomEvents, randomEvents }
