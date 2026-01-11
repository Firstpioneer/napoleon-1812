// 1812 Napoleon's Russian Campaign - Complete Data Store
// 基于 stdlib-js/datasets-minard-napoleons-march 和 Wikipedia 数据

// ============================================================
// Minard 原始数据 - 完整的48个点，包含3个division
// Division 1: 主力军团 (拿破仑直接指挥)
// Division 2: 第二纵队 (乌迪诺/圣西尔军团，北翼)
// Division 3: 第三纵队 (小分队)
// ============================================================

// Minard原始军队数据 - 完整版
export const minardArmyData = [
    // Division 1 - 主力军团进攻
    { lon: 24.0, lat: 54.9, size: 340000, direction: 'A', division: 1 },
    { lon: 24.5, lat: 55.0, size: 340000, direction: 'A', division: 1 },
    { lon: 25.5, lat: 54.5, size: 340000, direction: 'A', division: 1 },
    { lon: 26.0, lat: 54.7, size: 320000, direction: 'A', division: 1 },
    { lon: 27.0, lat: 54.8, size: 300000, direction: 'A', division: 1 },
    { lon: 28.0, lat: 54.9, size: 280000, direction: 'A', division: 1 },
    { lon: 28.5, lat: 55.0, size: 240000, direction: 'A', division: 1 },
    { lon: 29.0, lat: 55.1, size: 210000, direction: 'A', division: 1 },
    { lon: 30.0, lat: 55.2, size: 180000, direction: 'A', division: 1 },
    { lon: 30.3, lat: 55.3, size: 175000, direction: 'A', division: 1 },
    { lon: 32.0, lat: 54.8, size: 145000, direction: 'A', division: 1 },
    { lon: 33.2, lat: 54.9, size: 140000, direction: 'A', division: 1 },
    { lon: 34.4, lat: 55.5, size: 127100, direction: 'A', division: 1 },
    { lon: 35.5, lat: 55.4, size: 100000, direction: 'A', division: 1 },
    { lon: 36.0, lat: 55.5, size: 100000, direction: 'A', division: 1 },
    // Division 1 - 主力军团撤退
    { lon: 37.6, lat: 55.8, size: 100000, direction: 'R', division: 1 },
    { lon: 37.5, lat: 55.7, size: 98000, direction: 'R', division: 1 },
    { lon: 37.0, lat: 55.0, size: 97000, direction: 'R', division: 1 },
    { lon: 36.8, lat: 55.0, size: 96000, direction: 'R', division: 1 },
    { lon: 35.4, lat: 55.3, size: 87000, direction: 'R', division: 1 },
    { lon: 34.3, lat: 55.2, size: 55000, direction: 'R', division: 1 },
    { lon: 33.3, lat: 54.8, size: 37000, direction: 'R', division: 1 },
    { lon: 32.0, lat: 54.6, size: 24000, direction: 'R', division: 1 },
    { lon: 30.4, lat: 54.4, size: 20000, direction: 'R', division: 1 },
    { lon: 29.2, lat: 54.4, size: 20000, direction: 'R', division: 1 },
    { lon: 28.5, lat: 54.3, size: 20000, direction: 'R', division: 1 },
    { lon: 28.3, lat: 54.4, size: 20000, direction: 'R', division: 1 },
    // Division 2 - 北翼军团
    { lon: 24.0, lat: 55.1, size: 60000, direction: 'A', division: 2 },
    { lon: 24.5, lat: 55.2, size: 60000, direction: 'A', division: 2 },
    { lon: 25.5, lat: 54.7, size: 60000, direction: 'A', division: 2 },
    { lon: 26.6, lat: 55.7, size: 40000, direction: 'A', division: 2 },
    { lon: 27.4, lat: 55.6, size: 33000, direction: 'A', division: 2 },
    { lon: 28.7, lat: 55.5, size: 33000, direction: 'R', division: 2 },
    { lon: 29.2, lat: 54.3, size: 30000, direction: 'R', division: 2 },
    { lon: 28.5, lat: 54.2, size: 30000, direction: 'R', division: 2 },
    { lon: 28.3, lat: 54.3, size: 28000, direction: 'R', division: 2 },
    { lon: 27.5, lat: 54.5, size: 20000, direction: 'R', division: 2 },
    { lon: 26.8, lat: 54.3, size: 12000, direction: 'R', division: 2 },
    { lon: 26.4, lat: 54.4, size: 14000, direction: 'R', division: 2 },
    { lon: 24.6, lat: 54.5, size: 8000, direction: 'R', division: 2 },
    { lon: 24.4, lat: 54.4, size: 4000, direction: 'R', division: 2 },
    { lon: 24.2, lat: 54.4, size: 4000, direction: 'R', division: 2 },
    { lon: 24.1, lat: 54.3, size: 4000, direction: 'R', division: 2 },
    // Division 3 - 小分队
    { lon: 24.0, lat: 55.2, size: 22000, direction: 'A', division: 3 },
    { lon: 24.5, lat: 55.3, size: 22000, direction: 'A', division: 3 },
    { lon: 24.6, lat: 55.8, size: 6000, direction: 'R', division: 3 },
    { lon: 24.2, lat: 54.4, size: 6000, direction: 'R', division: 3 },
    { lon: 24.1, lat: 54.3, size: 6000, direction: 'R', division: 3 }
]

// 为兼容现有代码，保留原有格式的进攻/撤退数据
// 使用Minard数据中的Division 1，并添加日期估算
export const napoleonAdvance = [
    { lon: 24.0, lat: 54.9, survivors: 422000, date: '1812-06-24', city: '科夫诺', event: 'start' },
    { lon: 24.5, lat: 55.0, survivors: 400000, date: '1812-06-26', city: null },
    { lon: 25.3, lat: 54.7, survivors: 396000, date: '1812-06-27', city: null },
    { lon: 25.5, lat: 54.5, survivors: 392000, date: '1812-06-28', city: '维尔纽斯', event: 'city' },
    { lon: 26.0, lat: 54.7, survivors: 375000, date: '1812-07-08', city: null },
    { lon: 26.5, lat: 54.75, survivors: 362000, date: '1812-07-12', city: null },
    { lon: 27.0, lat: 54.8, survivors: 350000, date: '1812-07-15', city: null },
    { lon: 27.5, lat: 54.85, survivors: 340000, date: '1812-07-18', city: null },
    { lon: 28.0, lat: 54.9, survivors: 330000, date: '1812-07-20', city: null },
    { lon: 28.5, lat: 55.0, survivors: 300000, date: '1812-07-25', city: null },
    { lon: 29.0, lat: 55.1, survivors: 265000, date: '1812-07-26', city: '奥斯特罗夫诺', event: 'battle' },
    { lon: 29.5, lat: 55.15, survivors: 250000, date: '1812-07-27', city: null },
    { lon: 30.0, lat: 55.2, survivors: 235000, date: '1812-07-28', city: '维捷布斯克', event: 'city' },
    { lon: 30.3, lat: 55.3, survivors: 220000, date: '1812-08-05', city: null },
    { lon: 31.0, lat: 55.1, survivors: 200000, date: '1812-08-10', city: null },
    { lon: 32.0, lat: 54.8, survivors: 185000, date: '1812-08-17', city: '斯摩棱斯克', event: 'battle' },
    { lon: 32.6, lat: 54.85, survivors: 180000, date: '1812-08-18', city: null },
    { lon: 33.2, lat: 54.9, survivors: 175000, date: '1812-08-19', city: '瓦卢蒂诺', event: 'battle' },
    { lon: 33.8, lat: 55.2, survivors: 168000, date: '1812-08-25', city: null },
    { lon: 34.4, lat: 55.5, survivors: 160000, date: '1812-09-01', city: '维亚济马' },
    { lon: 35.0, lat: 55.45, survivors: 145000, date: '1812-09-03', city: null },
    { lon: 35.5, lat: 55.4, survivors: 134000, date: '1812-09-05', city: '舍瓦尔季诺', event: 'battle' },
    { lon: 35.8, lat: 55.5, survivors: 130000, date: '1812-09-07', city: '博罗季诺', event: 'battle' },
    { lon: 36.0, lat: 55.5, survivors: 108000, date: '1812-09-10', city: '莫扎伊斯克' },
    { lon: 36.8, lat: 55.65, survivors: 104000, date: '1812-09-12', city: null },
    { lon: 37.6, lat: 55.8, survivors: 100000, date: '1812-09-14', city: '莫斯科', event: 'city' }
]

export const napoleonRetreat = [
    { lon: 37.6, lat: 55.8, survivors: 100000, date: '1812-10-19', city: '莫斯科', event: 'retreat_start' },
    { lon: 37.5, lat: 55.7, survivors: 98000, date: '1812-10-20', city: null },
    { lon: 37.2, lat: 55.4, survivors: 97500, date: '1812-10-21', city: null },
    { lon: 37.0, lat: 55.0, survivors: 97000, date: '1812-10-22', city: null },
    { lon: 36.8, lat: 55.0, survivors: 96000, date: '1812-10-23', city: null },
    { lon: 36.5, lat: 55.0, survivors: 90000, date: '1812-10-24', city: '小雅罗斯拉夫韦茨', event: 'battle' },
    { lon: 36.0, lat: 55.15, survivors: 88000, date: '1812-10-26', city: null },
    { lon: 35.4, lat: 55.3, survivors: 87000, date: '1812-10-28', city: null },
    { lon: 34.8, lat: 55.25, survivors: 70000, date: '1812-10-31', city: null },
    { lon: 34.3, lat: 55.2, survivors: 55000, date: '1812-11-03', city: '维亚济马', event: 'battle' },
    { lon: 33.8, lat: 55.0, survivors: 45000, date: '1812-11-04', city: null },
    { lon: 33.3, lat: 54.8, survivors: 37000, date: '1812-11-06', city: '多罗戈布日' },
    { lon: 32.6, lat: 54.7, survivors: 30000, date: '1812-11-07', city: null },
    { lon: 32.0, lat: 54.6, survivors: 24000, date: '1812-11-09', city: '斯摩棱斯克', event: 'city' },
    { lon: 31.5, lat: 54.5, survivors: 22000, date: '1812-11-13', city: null },
    { lon: 31.0, lat: 54.4, survivors: 20000, date: '1812-11-17', city: '克拉斯诺耶', event: 'battle' },
    { lon: 30.7, lat: 54.4, survivors: 20000, date: '1812-11-18', city: null },
    { lon: 30.4, lat: 54.4, survivors: 20000, date: '1812-11-19', city: '奥尔沙' },
    { lon: 29.8, lat: 54.4, survivors: 20000, date: '1812-11-20', city: null },
    { lon: 29.2, lat: 54.4, survivors: 20000, date: '1812-11-22', city: '博布尔' },
    { lon: 28.8, lat: 54.35, survivors: 20000, date: '1812-11-24', city: null },
    { lon: 28.5, lat: 54.3, survivors: 20000, date: '1812-11-26', city: '斯图坚卡', event: 'battle' },
    { lon: 28.3, lat: 54.4, survivors: 20000, date: '1812-11-29', city: '别列津纳', event: 'battle' },
    { lon: 27.9, lat: 54.45, survivors: 17000, date: '1812-11-30', city: null },
    { lon: 27.5, lat: 54.5, survivors: 14000, date: '1812-12-01', city: null },
    { lon: 27.1, lat: 54.4, survivors: 13000, date: '1812-12-02', city: null },
    { lon: 26.8, lat: 54.3, survivors: 12000, date: '1812-12-03', city: '莫洛杰奇诺' },
    { lon: 26.6, lat: 54.35, survivors: 11000, date: '1812-12-04', city: null },
    { lon: 26.4, lat: 54.4, survivors: 10000, date: '1812-12-05', city: '斯莫尔贡', event: 'event' },
    { lon: 25.9, lat: 54.5, survivors: 9000, date: '1812-12-07', city: null },
    { lon: 25.3, lat: 54.7, survivors: 8000, date: '1812-12-09', city: '维尔纽斯', event: 'city' },
    { lon: 24.9, lat: 54.6, survivors: 7000, date: '1812-12-10', city: null },
    { lon: 24.6, lat: 54.5, survivors: 6000, date: '1812-12-12', city: null },
    { lon: 24.3, lat: 54.7, survivors: 5000, date: '1812-12-13', city: null },
    { lon: 24.0, lat: 55.0, survivors: 4000, date: '1812-12-14', city: '科夫诺', event: 'end' }
]

// 施瓦岑贝格军团南翼路线 (奥地利辅助军团，约34000人)
export const schwarzenbergRoute = [
    { lon: 22.0, lat: 52.2, survivors: 34000, date: '1812-07-02', city: '德罗希钦', event: 'start' },
    { lon: 23.8, lat: 53.1, survivors: 33500, date: '1812-07-15', city: '格罗德诺' },
    { lon: 25.0, lat: 52.8, survivors: 33000, date: '1812-07-25', city: null },
    { lon: 26.0, lat: 52.5, survivors: 32500, date: '1812-08-08', city: '因科沃', event: 'battle' },
    { lon: 27.5, lat: 52.2, survivors: 32000, date: '1812-08-12', city: '戈罗杰奇诺', event: 'battle' },
    { lon: 28.0, lat: 52.0, survivors: 31500, date: '1812-09-15', city: null },
    { lon: 27.0, lat: 52.3, survivors: 31000, date: '1812-10-10', city: null },
    { lon: 26.0, lat: 52.5, survivors: 30500, date: '1812-11-01', city: null },
    { lon: 24.5, lat: 52.7, survivors: 30000, date: '1812-11-15', city: null },
    { lon: 22.5, lat: 52.3, survivors: 30000, date: '1812-12-14', city: '布格河', event: 'end' }
]

// 温度数据 - 基于Minard原图（已从Réaumur转换为摄氏度，乘以1.25）
// 注意：Minard原图的温度单位是Réaumur，需要 ×1.25 转为摄氏度
export const temperatureData = [
    { date: '1812-06-24', temp: 22, lon: 24.0, description: '温暖的夏日', phase: 'advance' },
    { date: '1812-07-15', temp: 28, lon: 27.0, description: '炎热酷暑', phase: 'advance' },
    { date: '1812-07-29', temp: 25, lon: 30.0, description: '暴风雨后', phase: 'advance' },
    { date: '1812-08-17', temp: 20, lon: 32.0, description: '温和', phase: 'advance' },
    { date: '1812-09-07', temp: 15, lon: 35.8, description: '凉爽', phase: 'advance' },
    { date: '1812-09-14', temp: 10, lon: 37.6, description: '初秋', phase: 'advance' },
    { date: '1812-10-18', temp: 0, lon: 37.6, description: '霜冻开始', phase: 'retreat' },
    { date: '1812-10-24', temp: 0, lon: 36.0, description: '寒冷', phase: 'retreat' },
    { date: '1812-11-09', temp: -11, lon: 33.2, description: '严寒来临 (Réaumur: -9°)', phase: 'retreat' },
    { date: '1812-11-14', temp: -26, lon: 32.0, description: '酷寒 (Réaumur: -21°)', phase: 'retreat' },
    { date: '1812-11-24', temp: -14, lon: 29.2, description: '短暂回暖 (Réaumur: -11°)', phase: 'retreat' },
    { date: '1812-11-28', temp: -25, lon: 28.5, description: '刺骨寒冷 (Réaumur: -20°)', phase: 'retreat' },
    { date: '1812-12-01', temp: -30, lon: 27.2, description: '极寒 (Réaumur: -24°)', phase: 'retreat' },
    { date: '1812-12-06', temp: -38, lon: 26.7, description: '致命严寒 (Réaumur: -30°)', phase: 'retreat' },
    { date: '1812-12-07', temp: -33, lon: 25.3, description: '持续低温 (Réaumur: -26°)', phase: 'retreat' }
]

// 章节数据 - 参考1812.tass.ru的多章节叙事结构
export const chapters = [
    {
        id: 'prologue',
        number: '00',
        title: 'Minard的经典图表',
        titleEn: 'The Minard Map',
        date: null,
        location: [55.0, 30.0],
        zoom: 5,
        content: `1869年，退休的法国土木工程师Charles Joseph Minard绘制了一张地图，总结了目击者对1812年拿破仑俄国战役的描述。根据Minard的统计，在这场持续197天的血腥战争中，拿破仑的军队从42.2万人锐减至仅剩1万人。`,
        quote: null,
        stats: null,
        phase: 'overview'
    },
    {
        id: 'tilsit',
        number: '01',
        title: '从蒂尔西特和约到战争',
        titleEn: 'From the Peace of Tilsit to War',
        date: '1812年5月-6月',
        location: [54.9, 24.0],
        zoom: 6,
        content: `战争的到来并非意外。自1810年以来，紧张局势持续升温。俄法两国的分歧不仅是政治性的，更是经济性的。俄罗斯帝国参与对英国的大陆封锁是1807年拿破仑与亚历山大一世在提尔西特签订和平条约的关键条款之一。`,
        quote: {
            text: '在蒂尔西特，俄国发誓与法国永久结盟，并与英国开战。她公然违背了誓言......',
            source: '拿破仑在俄国战役开始时对大军团的讲话，1812年6月22日'
        },
        stats: { troops: 422000, temp: null },
        phase: 'prewar'
    },
    {
        id: 'supremacy',
        number: '02',
        title: '优势的幻觉',
        titleEn: 'Feeling of Supremacy',
        date: '1812年6月',
        location: [54.7, 25.0],
        zoom: 6,
        content: `拿破仑的大军团，由几乎所有欧洲国家的部队组成，确实名副其实。根据Minard的数据，战争前夕其兵力为42.2万人。而根据现代历史学家的研究，实际规模更大：不包括预备队为46.65万人，包括预备队则超过64.7万人。`,
        quote: {
            text: '我们被胜利的荣耀所引领，即将进入这片富饶广袤的土地......我们眼前是普世的和平、对宇宙的征服和壮丽的英雄荣光......',
            source: '切萨雷·德·劳热尔中尉，意大利副王军团'
        },
        stats: { french: 422000, russian: 252000 },
        phase: 'advance'
    },
    {
        id: 'neman',
        number: '03',
        title: '渡过涅曼河',
        titleEn: 'The Neman River Crossing',
        date: '1812年6月24日',
        location: [54.9, 24.0],
        zoom: 7,
        content: `奇怪的是，战争恰好在五年前签订和平条约的地方开始——涅曼河。6月24日，拿破仑的军队搭建了几座浮桥开始渡河。此时，军队分成了几路。几个军团向圣彼得堡进发，南翼追击第二西方军，而主力则向维尔纽斯挺进。`,
        quote: null,
        stats: { troops: 422000, temp: 20 },
        phase: 'advance'
    },
    {
        id: 'scythian',
        number: '04',
        title: '斯基泰战术',
        titleEn: 'Scythian Tactics',
        date: '1812年7月',
        location: [55.2, 28.0],
        zoom: 6,
        content: `有人说拿破仑的军事荣耀给他带来了巨大的不利——他的同时代人有足够的时间详细研究他的战术。俄罗斯帝国以所谓的"斯基泰计划"来对抗法皇对速度和激进进攻的依赖——缓慢撤退深入国土，目的是耗尽敌军的体力，消耗其储备和资源。`,
        quote: {
            text: '我们将打一场持久战，因为鉴于拿破仑在实力和战术上的明显优势，这是我们唯一能指望成功的机会。',
            source: '亚历山大一世的一封信'
        },
        stats: { troops: 280000, temp: 25 },
        phase: 'advance'
    },
    {
        id: 'smolensk',
        number: '05',
        title: '斯摩棱斯克战役',
        titleEn: 'Battle of Smolensk',
        date: '1812年8月16-18日',
        location: [54.8, 32.0],
        zoom: 7,
        content: `8月3日，第一和第二西方军在斯摩棱斯克附近会合。拿破仑未能阻止这一会合，主要是因为他将行动指挥权交给了他的弟弟，威斯特法利亚国王热罗姆。在激烈的战斗中，这座城市几乎被夷为平地。2250座房屋中只有不到350座幸存下来。`,
        quote: {
            text: '如果你读到这些文字，你应该知道某人的命运已经决定：要么拿破仑被击退，要么通往俄国的大门被打开！',
            source: '俄国军官费奥多尔·格林卡的一封信'
        },
        stats: { troops: 210000, casualties: 20000, temp: 18 },
        phase: 'advance'
    },
    {
        id: 'pursuit',
        number: '06',
        title: '追逐大决战',
        titleEn: 'In Pursuit of a Grand Battle',
        date: '1812年8月',
        location: [55.0, 34.0],
        zoom: 6,
        content: `拿破仑战役的下一阶段可以用一个词来描述——匆忙。从斯摩棱斯克到加加林的行军对士兵们来说是一次极其疲惫的经历。过长的补给线成了真正的灾难。超负荷的车队远远落在主力后面，主力部队遭受着食物短缺和夏季酷热的煎熬。`,
        quote: {
            text: '我们马蹄踢起滚烫的沙子，像灰尘一样细，覆盖我们到几乎认不出制服的颜色。沙子进入我们的眼睛，造成剧烈的疼痛。我几乎无法呼吸。',
            source: '米歇尔·孔布中尉，第8骑兵团'
        },
        stats: { troops: 165000, temp: 15 },
        phase: 'advance'
    },
    {
        id: 'borodino',
        number: '07',
        title: '博罗季诺战役',
        titleEn: 'Battle of Borodino',
        date: '1812年9月5-7日',
        location: [55.5, 35.8],
        zoom: 8,
        content: `这是整场战役中规模最大、最血腥的单日会战。双方投入超过25万兵力。到那时，拿破仑的军队已经消耗了大部分原始力量。他直接指挥下约有13.5万人。俄罗斯帝国的军队有15万人（包括民兵）。战斗的每个小时，双方各有约2500人阵亡。`,
        quote: {
            text: '在博罗季诺附近发生了多么可怕的战斗！法国人说他们发射了6万发炮弹，损失了40位将军！',
            source: '俄国军官费奥多尔·格林卡的一封信'
        },
        stats: { troops: 145000, casualties: 70000, temp: 12 },
        phase: 'battle'
    },
    {
        id: 'moscow',
        number: '08',
        title: '莫斯科大火',
        titleEn: 'Moscow on Fire',
        date: '1812年9月14日 - 10月19日',
        location: [55.75, 37.6],
        zoom: 8,
        content: `当面临军队和城市之间的选择时，选择军队。这正是9月13日费利军事会议上做出的决定。库图佐夫下令不战而撤离莫斯科。9月14日，法军进入了几乎空无一人的城市。当晚，大火开始蔓延。仅四天内，四分之三的城市化为灰烬：9158座住宅中超过6500座被烧毁。`,
        quote: {
            text: '失去莫斯科，俄国还没有失去，但失去军队，俄国就完了。',
            source: '米哈伊尔·库图佐夫'
        },
        stats: { troops: 95000, temp: 8 },
        phase: 'occupation'
    },
    {
        id: 'retreat',
        number: '09',
        title: '"他们会像来时那样离开"',
        titleEn: '"They\'ll Go Just as They Came"',
        date: '1812年10月-11月',
        location: [55.3, 34.0],
        zoom: 6,
        content: `在和谈失败和塔鲁蒂诺战役（法军前卫被击败）之后，拿破仑不得不放弃进军圣彼得堡的准备，转而向俄军进发。小雅罗斯拉夫韦茨战役后，库图佐夫迫使法军沿旧斯摩棱斯克大道撤退，穿越已被战争蹂躏的地区。`,
        quote: {
            text: '毫无疑问，如果皇帝按照他的意愿在黎明前出发，他就会发现自己身处哥萨克群中......皇帝肯定会被杀死或俘获。',
            source: '法国外交官阿尔芒·德·科兰古的回忆录'
        },
        stats: { troops: 80000, temp: 0 },
        phase: 'retreat'
    },
    {
        id: 'frost',
        number: '10',
        title: '真的有"冬将军"吗？',
        titleEn: 'Was There a General Frost?',
        date: '1812年11月',
        location: [54.8, 32.0],
        zoom: 6,
        content: `此前，大军团一直在追求大决战，现在却不得不自卫并仓促撤退。法军四面受敌。哥萨克骑兵紧随其后，游击队从侧翼打击，先锋队遭到农民民兵的攻击。俄军多次追上拿破仑的后卫并给予沉重打击。`,
        quote: {
            text: '在整个法军从莫斯科到别列津纳的行军中，即二十六天里，虽然严寒但并非特别严酷（从-12°C到-17°C），持续时间不超过三天。',
            source: '丹尼斯·达维多夫，游击队指挥官'
        },
        stats: { troops: 50000, temp: -21 },
        phase: 'retreat'
    },
    {
        id: 'berezina',
        number: '11',
        title: '别列津纳河之战',
        titleEn: 'The Berezina River Crossing',
        date: '1812年11月26-29日',
        location: [54.3, 28.5],
        zoom: 7,
        content: `在法语中，别列津纳这个俄罗斯河流的名字成了灾难性失败的同义词。在历史上，它是拿破仑战术才能的一个例证。在克拉斯诺耶战役胜利后，俄军本可以包围法皇残部并将其歼灭。但拿破仑设法"智胜"俄国指挥部，约1.9万主力部队得以渡河逃脱。`,
        quote: {
            text: '任何东西，无论多么恶心，都是可以吃的，不会阻止他们吞咽......有时人们啃咬自己的肉，手掌和手指来解渴。',
            source: '符腾堡中尉海因里希·冯·沃斯勒的回忆录'
        },
        stats: { troops: 28000, casualties: 25000, temp: -20 },
        phase: 'retreat'
    },
    {
        id: 'departure',
        number: '12',
        title: '拿破仑返回巴黎',
        titleEn: 'Napoleon Goes to Paris',
        date: '1812年12月5日',
        location: [54.5, 26.8],
        zoom: 7,
        content: `12月3日，在莫洛杰奇诺逗留期间，拿破仑收到了马莱将军在巴黎发动政变未遂的消息。同一天，他决定离开他的残部，说在这种情况下，他只能"从杜伊勒里宫引起欧洲的敬畏"。12月5日晚7点30分，在斯莫尔贡停留期间，拿破仑将军队指挥权移交给那不勒斯国王若阿基姆·缪拉。`,
        quote: {
            text: '伊斯特里亚公爵......公开向拿破仑提出离开的问题。后者立即勃然大怒......说只有他的死敌才会建议在军队处于这种状态时离开。',
            source: '让-巴蒂斯特·贝西埃元帅副官的回忆录'
        },
        stats: { troops: 15000, temp: -37 },
        phase: 'retreat'
    },
    {
        id: 'epilogue',
        number: '13',
        title: '野心的代价',
        titleEn: 'The Price of Ambition',
        date: '1812年12月',
        location: [54.9, 24.0],
        zoom: 6,
        content: `违反拿破仑的命令，法军未能守住维尔纽斯。在俄军的压力下，他们不得不逃离城市，留下运输工具、剩余火炮和国库。在科夫诺（现考纳斯）附近，只有一小群俄国战役的参与者渡过了涅曼河。战争使许多人面目全非。`,
        quote: {
            text: '大军团已不复存在。',
            source: '路易-亚历山大·贝尔蒂埃，拿破仑麾下战争部长兼参谋长'
        },
        stats: { 
            initial: 422000, 
            final: 10000, 
            lossRate: '97.6%',
            russianLoss: 300000
        },
        phase: 'end'
    }
]

// 关键事件数据 - 用于地图标记和详情卡片
export const keyEvents = [
    {
        id: 'neman_crossing',
        name: '渡过涅曼河',
        nameEn: 'Neman River Crossing',
        date: '1812-06-24',
        location: [54.9, 24.0],
        type: 'start',
        troops: 422000,
        temp: 20,
        description: '1812年6月24日，拿破仑率领"大军团"约42万人，在科夫诺附近渡过涅曼河，正式入侵俄罗斯帝国。这是欧洲历史上规模最大的军事行动。',
        quote: {
            text: '士兵们！第二次波兰战争开始了！',
            source: '拿破仑对大军团的宣言'
        },
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Napoleon_March_to_Russia.jpg/800px-Napoleon_March_to_Russia.jpg'
    },
    {
        id: 'vilnius',
        name: '占领维尔纽斯',
        nameEn: 'Capture of Vilnius',
        date: '1812-06-28',
        location: [54.7, 25.3],
        type: 'city',
        troops: 400000,
        temp: 22,
        description: '法军占领维尔纽斯，俄军执行焦土政策持续后撤。拿破仑在此停留约18天，试图组织补给，但补给困难已开始显现，非战斗减员严重。',
        quote: null,
        image: null
    },
    {
        id: 'vitebsk',
        name: '维捷布斯克休整',
        nameEn: 'Vitebsk Halt',
        date: '1812-07-28',
        location: [55.2, 30.2],
        type: 'city',
        troops: 280000,
        temp: 25,
        description: '7月底，法军抵达维捷布斯克，拿破仑在此停留16天休整。此时非战斗减员已非常严重，兵力已降至28万。',
        quote: {
            text: '我在这里停下。我想在这里休整军队，重新组织，让波兰从他们的战争中喘口气。1813年的战役将完成剩下的事情。',
            source: '拿破仑，1812年7月28日'
        },
        image: null
    },
    {
        id: 'smolensk_battle',
        name: '斯摩棱斯克战役',
        nameEn: 'Battle of Smolensk',
        date: '1812-08-16',
        location: [54.8, 32.0],
        type: 'battle',
        troops: 210000,
        casualties: 20000,
        temp: 18,
        description: '8月16-18日，法军与俄军在斯摩棱斯克展开激烈攻防战。法军约17.5万人攻城，俄军依托城墙顽强抵抗，最终放火烧城后撤离。',
        quote: {
            text: '我不知道还有什么能比这更加残酷的了',
            source: '拿破仑，看着燃烧的斯摩棱斯克'
        },
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hess_Smolensk.jpg/800px-Hess_Smolensk.jpg'
    },
    {
        id: 'borodino_battle',
        name: '博罗季诺战役',
        nameEn: 'Battle of Borodino',
        date: '1812-09-07',
        location: [55.5, 35.8],
        type: 'battle',
        troops: 145000,
        casualties: 70000,
        temp: 12,
        description: '9月7日，法俄两军在博罗季诺展开关键决战。双方投入超过25万兵力，伤亡总计约7万人。法军战术上获胜但未能歼灭俄军。',
        quote: {
            text: '在我打过的所有战役中，莫斯科城下的那场是最可怕的。法国人展示了自己值得取胜，而俄国人赢得了不可战胜的权利。',
            source: '拿破仑'
        },
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Battle_of_Borodino_1812.png/800px-Battle_of_Borodino_1812.png'
    },
    {
        id: 'moscow_entry',
        name: '进入莫斯科',
        nameEn: 'Entry into Moscow',
        date: '1812-09-14',
        location: [55.75, 37.6],
        type: 'city',
        troops: 95000,
        temp: 8,
        description: '9月14日，拿破仑率领约9.5万人的疲惫之师进入莫斯科。他发现莫斯科几乎是一座空城，当夜开始燃起大火。',
        quote: {
            text: '莫斯科是空的！难以置信！必须告诉我......带来波雅尔人（贵族）！',
            source: '拿破仑，进入莫斯科时'
        },
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Fire_of_Moscow_1812.jpg/800px-Fire_of_Moscow_1812.jpg'
    },
    {
        id: 'moscow_fire',
        name: '莫斯科大火',
        nameEn: 'The Great Fire of Moscow',
        date: '1812-09-15',
        location: [55.75, 37.6],
        type: 'disaster',
        troops: 95000,
        temp: 6,
        description: '9月15日夜间，莫斯科燃起大火，持续数日。四分之三的城市被烧毁：9158座住宅中超过6500座化为灰烬。拿破仑失去了期望的冬季营地。',
        quote: {
            text: '多么可怕的景象！是他们自己干的！多少宫殿！多么非凡的决心！什么样的人！这是斯基泰人！',
            source: '拿破仑，目睹大火时'
        },
        image: null
    },
    {
        id: 'retreat_start',
        name: '开始撤退',
        nameEn: 'Beginning of Retreat',
        date: '1812-10-19',
        location: [55.75, 37.6],
        type: 'retreat',
        troops: 95000,
        temp: 0,
        description: '认识到求和无望，拿破仑下令从莫斯科开始撤退。大军携带了大量掠夺来的战利品，行军速度缓慢。',
        quote: null,
        image: null
    },
    {
        id: 'maloyaroslavets',
        name: '小雅罗斯拉夫韦茨战役',
        nameEn: 'Battle of Maloyaroslavets',
        date: '1812-10-24',
        location: [55.3, 36.0],
        type: 'battle',
        troops: 87000,
        temp: 0,
        description: '撤退中的法军与俄军发生激战。此战迫使拿破仑放弃了南线较温暖的撤退路线，不得不沿北线原路撤回。',
        quote: null,
        image: null
    },
    {
        id: 'first_frost',
        name: '严寒来临',
        nameEn: 'First Severe Frost',
        date: '1812-11-09',
        location: [54.8, 32.0],
        type: 'cold',
        troops: 50000,
        temp: -9,
        description: '11月初，第一次降雪与严寒来临，气温骤降至-9°C。没有冬装的法军开始因冻伤、疾病和饥饿成批死亡。',
        quote: {
            text: '雪像厚毯子一样覆盖了大地，马匹在冰上打滑摔倒，无法再站起来。',
            source: '法军士兵回忆录'
        },
        image: null
    },
    {
        id: 'krasnoi',
        name: '克拉斯诺耶战役',
        nameEn: 'Battle of Krasnoi',
        date: '1812-11-15',
        location: [54.6, 31.0],
        type: 'battle',
        troops: 40000,
        temp: -21,
        description: '11月15-17日，法军在克拉斯诺耶与俄军激战，气温已降至-21°C。内伊元帅率后卫部队被困，损失惨重。',
        quote: {
            text: '内伊元帅是大军团中最后一个离开俄国土地的人。',
            source: '历史记载'
        },
        image: null
    },
    {
        id: 'berezina_battle',
        name: '别列津纳河战役',
        nameEn: 'Battle of Berezina',
        date: '1812-11-26',
        location: [54.3, 28.5],
        type: 'battle',
        troops: 28000,
        casualties: 25000,
        temp: -20,
        description: '11月26-29日，撤退中的法军被俄军包围在别列津纳河畔。约有2.5万名士兵在渡河时死亡或被俘。此役标志着大军团作为有组织力量的终结。',
        quote: {
            text: '我宁愿千次死在战场上，也不愿再经历那两天的恐怖。',
            source: '一位法国军官'
        },
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Crossing_the_Berezina.jpg/800px-Crossing_the_Berezina.jpg'
    },
    {
        id: 'extreme_cold',
        name: '致命严寒',
        nameEn: 'Extreme Cold',
        date: '1812-12-06',
        location: [54.6, 26.0],
        type: 'cold',
        troops: 12000,
        temp: -37,
        description: '12月6日，气温降至-37°C，这是整个战役中记录的最低温度。在这种极端条件下，士兵们成批死亡。',
        quote: {
            text: '寒冷如此刺骨，仿佛每一次呼吸都在吸入刀片。',
            source: '法军幸存者'
        },
        image: null
    },
    {
        id: 'napoleon_leaves',
        name: '拿破仑离开军队',
        nameEn: 'Napoleon Leaves the Army',
        date: '1812-12-05',
        location: [54.5, 26.8],
        type: 'event',
        troops: 15000,
        temp: -37,
        description: '12月5日，在斯莫尔贡，拿破仑将指挥权交给缪拉元帅，自己乘坐雪橇秘密返回巴黎，以保住皇位。',
        quote: {
            text: '在目前的形势下，我只能从杜伊勒里宫引起欧洲的敬畏。',
            source: '拿破仑'
        },
        image: null
    },
    {
        id: 'campaign_end',
        name: '退出俄境',
        nameEn: 'Exit from Russia',
        date: '1812-12-14',
        location: [54.9, 24.0],
        type: 'end',
        troops: 10000,
        temp: -30,
        description: '12月14日，法军残部（约不到1万人）最终渡过涅曼河，退出俄国国境。拿破仑的"大军团"从42万人锐减至不足1万，几乎全军覆没。',
        quote: {
            text: '大军团已不复存在。',
            source: '贝尔蒂埃元帅'
        },
        image: null
    }
]

// 历史人物数据
export const historicalFigures = [
    {
        id: 'napoleon',
        name: '拿破仑·波拿巴',
        nameEn: 'Napoleon Bonaparte',
        title: '法兰西帝国皇帝',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/200px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg',
        description: '法兰西第一帝国缔造者，欧洲最伟大的军事统帅之一。'
    },
    {
        id: 'alexander',
        name: '亚历山大一世',
        nameEn: 'Alexander I',
        title: '俄罗斯帝国沙皇',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Alexander_I_of_Russia.jpg/200px-Alexander_I_of_Russia.jpg',
        description: '1801-1825年在位，在卫国战争中领导俄国抵抗拿破仑入侵。'
    },
    {
        id: 'kutuzov',
        name: '米哈伊尔·库图佐夫',
        nameEn: 'Mikhail Kutuzov',
        title: '俄军总司令',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Mikhail_Kutuzov_by_R.M.Volkov.jpg/200px-Mikhail_Kutuzov_by_R.M.Volkov.jpg',
        description: '俄国元帅，1812年卫国战争中俄军总司令，采用消耗战术击败拿破仑。'
    },
    {
        id: 'barclay',
        name: '巴克莱·德·托利',
        nameEn: 'Barclay de Tolly',
        title: '第一西方军司令',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Michael_Andreas_Barclay_de_Tolly.jpg/200px-Michael_Andreas_Barclay_de_Tolly.jpg',
        description: '俄国元帅，战争初期的俄军总指挥，坚持战略撤退战术。'
    },
    {
        id: 'bagration',
        name: '彼得·巴格拉季昂',
        nameEn: 'Pyotr Bagration',
        title: '第二西方军司令',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Bagration_P_I.jpg/200px-Bagration_P_I.jpg',
        description: '俄国将军，博罗季诺战役中身负重伤，不久后去世。'
    },
    {
        id: 'davout',
        name: '路易-尼古拉·达武',
        nameEn: 'Louis-Nicolas Davout',
        title: '法国元帅',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Louis-Nicolas_Davout.jpg/200px-Louis-Nicolas_Davout.jpg',
        description: '"铁元帅"，拿破仑最能干的元帅之一，指挥第一军团。'
    },
    {
        id: 'ney',
        name: '米歇尔·内伊',
        nameEn: 'Michel Ney',
        title: '法国元帅',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Marshal_Ney.jpg/200px-Marshal_Ney.jpg',
        description: '"勇士中的勇士"，在撤退中指挥后卫，是最后离开俄国的法军将领。'
    }
]

// 城市标签 - 基于Minard原图的20个城市 + 补充
export const cityLabels = [
    // Minard原图城市
    { name: '科夫诺', nameEn: 'Kowno', lat: 55.0, lon: 24.0 },
    { name: '维尔纽斯', nameEn: 'Wilna', lat: 54.7, lon: 25.3 },
    { name: '斯莫尔贡', nameEn: 'Smorgoni', lat: 54.4, lon: 26.4 },
    { name: '莫洛杰奇诺', nameEn: 'Molodexno', lat: 54.3, lon: 26.8 },
    { name: '格卢博科耶', nameEn: 'Gloubokoe', lat: 55.2, lon: 27.7 },
    { name: '明斯克', nameEn: 'Minsk', lat: 53.9, lon: 27.6 },
    { name: '斯图坚卡', nameEn: 'Studienska', lat: 54.3, lon: 28.5 },
    { name: '波洛茨克', nameEn: 'Polotzk', lat: 55.5, lon: 28.7 },
    { name: '博布尔', nameEn: 'Bobr', lat: 54.4, lon: 29.2 },
    { name: '维捷布斯克', nameEn: 'Witebsk', lat: 55.3, lon: 30.2 },
    { name: '奥尔沙', nameEn: 'Orscha', lat: 54.5, lon: 30.4 },
    { name: '莫吉廖夫', nameEn: 'Mohilow', lat: 53.9, lon: 30.4 },
    { name: '斯摩棱斯克', nameEn: 'Smolensk', lat: 54.8, lon: 32.0 },
    { name: '多罗戈布日', nameEn: 'Dorogobouge', lat: 54.9, lon: 33.2 },
    { name: '维亚济马', nameEn: 'Wixma', lat: 55.2, lon: 34.3 },
    { name: '恰特', nameEn: 'Chjat', lat: 55.5, lon: 34.4 },
    { name: '莫扎伊斯克', nameEn: 'Mojaisk', lat: 55.5, lon: 36.0 },
    { name: '莫斯科', nameEn: 'Moscow', lat: 55.75, lon: 37.6 },
    { name: '塔鲁蒂诺', nameEn: 'Tarantino', lat: 55.3, lon: 36.6 },
    { name: '小雅罗斯拉夫韦茨', nameEn: 'Maloyaroslavets', lat: 55.0, lon: 36.5 },
    // 补充城市
    { name: '博罗季诺', nameEn: 'Borodino', lat: 55.5, lon: 35.8 },
    { name: '别列津纳', nameEn: 'Berezina', lat: 54.3, lon: 28.5 },
    { name: '克拉斯诺耶', nameEn: 'Krasnoi', lat: 54.4, lon: 31.0 },
    { name: '圣彼得堡', nameEn: 'St. Petersburg', lat: 59.9, lon: 30.3 }
]

// 河流数据
export const rivers = [
    { 
        name: '涅曼河', 
        coords: [[55.5, 23.5], [55.0, 24.0], [54.5, 24.5], [54.0, 25.0]] 
    },
    { 
        name: '第聂伯河', 
        coords: [[55.5, 30.0], [55.0, 31.0], [54.5, 31.5], [54.0, 32.0], [53.5, 32.5]] 
    },
    { 
        name: '别列津纳河', 
        coords: [[55.0, 28.5], [54.5, 28.5], [54.0, 28.5], [53.5, 28.5]] 
    },
    {
        name: '莫斯科河',
        coords: [[56.0, 37.5], [55.75, 37.6], [55.5, 37.7]]
    }
]
