// 1812年拿破仑俄国战役数据

// 行军路线数据 - 基于Minard原图
const napoleonAdvance = [
    { lon: 24.0, lat: 54.9, survivors: 422000, date: '1812-06-24', city: '科夫诺', event: 'start' },
    { lon: 24.5, lat: 55.0, survivors: 400000, date: '1812-06-28', city: null },
    { lon: 25.3, lat: 54.7, survivors: 400000, date: '1812-06-28', city: '维尔纽斯', event: 'city' },
    { lon: 26.0, lat: 54.7, survivors: 380000, date: '1812-07-08', city: null },
    { lon: 27.0, lat: 54.8, survivors: 340000, date: '1812-07-15', city: null },
    { lon: 28.0, lat: 54.9, survivors: 320000, date: '1812-07-20', city: null },
    { lon: 28.5, lat: 55.0, survivors: 300000, date: '1812-07-25', city: null },
    { lon: 30.2, lat: 55.2, survivors: 280000, date: '1812-07-28', city: '维捷布斯克', event: 'city' },
    { lon: 30.5, lat: 55.3, survivors: 260000, date: '1812-08-05', city: null },
    { lon: 31.0, lat: 55.2, survivors: 240000, date: '1812-08-10', city: null },
    { lon: 32.0, lat: 54.8, survivors: 210000, date: '1812-08-16', city: '斯摩棱斯克', event: 'battle' },
    { lon: 33.0, lat: 55.0, survivors: 195000, date: '1812-08-25', city: null },
    { lon: 34.0, lat: 55.2, survivors: 180000, date: '1812-09-01', city: null },
    { lon: 35.0, lat: 55.3, survivors: 165000, date: '1812-09-05', city: null },
    { lon: 35.8, lat: 55.5, survivors: 145000, date: '1812-09-07', city: '博罗季诺', event: 'battle' },
    { lon: 36.5, lat: 55.6, survivors: 120000, date: '1812-09-10', city: null },
    { lon: 37.6, lat: 55.75, survivors: 95000, date: '1812-09-14', city: '莫斯科', event: 'city' }
];

const napoleonRetreat = [
    { lon: 37.6, lat: 55.75, survivors: 95000, date: '1812-10-19', city: '莫斯科', event: 'retreat_start' },
    { lon: 36.6, lat: 55.5, survivors: 90000, date: '1812-10-22', city: null },
    { lon: 36.0, lat: 55.3, survivors: 87000, date: '1812-10-24', city: '小雅罗斯拉夫韦茨', event: 'battle' },
    { lon: 35.0, lat: 55.1, survivors: 80000, date: '1812-10-28', city: null },
    { lon: 34.4, lat: 55.2, survivors: 75000, date: '1812-11-01', city: '维亚济马', event: 'battle' },
    { lon: 33.2, lat: 55.0, survivors: 65000, date: '1812-11-06', city: null },
    { lon: 32.0, lat: 54.8, survivors: 50000, date: '1812-11-09', city: '斯摩棱斯克', event: 'city' },
    { lon: 31.0, lat: 54.6, survivors: 40000, date: '1812-11-15', city: '克拉斯诺耶', event: 'battle' },
    { lon: 30.0, lat: 54.5, survivors: 35000, date: '1812-11-18', city: null },
    { lon: 29.2, lat: 54.4, survivors: 32000, date: '1812-11-22', city: '奥尔沙', event: 'city' },
    { lon: 28.5, lat: 54.3, survivors: 28000, date: '1812-11-26', city: '别列津纳', event: 'battle' },
    { lon: 27.5, lat: 54.4, survivors: 20000, date: '1812-11-30', city: null },
    { lon: 26.8, lat: 54.5, survivors: 15000, date: '1812-12-03', city: '斯莫尔贡', event: 'city' },
    { lon: 26.0, lat: 54.6, survivors: 12000, date: '1812-12-06', city: '莫洛杰奇诺', event: 'cold' },
    { lon: 25.3, lat: 54.7, survivors: 10000, date: '1812-12-09', city: '维尔纽斯', event: 'city' },
    { lon: 24.0, lat: 54.9, survivors: 10000, date: '1812-12-14', city: '科夫诺', event: 'end' }
];

// 施瓦岑贝格军团南翼路线
const schwarzenbergRoute = [
    { lon: 23.8, lat: 53.7, survivors: 30000, date: '1812-06-24', city: '格罗德诺' },
    { lon: 25.0, lat: 53.5, survivors: 29500, date: '1812-07-10', city: null },
    { lon: 26.5, lat: 53.3, survivors: 29000, date: '1812-07-25', city: null },
    { lon: 28.0, lat: 53.0, survivors: 28500, date: '1812-08-08', city: '因科沃', event: 'battle' },
    { lon: 29.5, lat: 52.8, survivors: 28000, date: '1812-08-20', city: '戈罗杰奇诺', event: 'battle' },
    { lon: 28.5, lat: 52.5, survivors: 27500, date: '1812-09-15', city: null },
    { lon: 27.0, lat: 52.3, survivors: 27000, date: '1812-10-10', city: null },
    { lon: 25.5, lat: 52.0, survivors: 28000, date: '1812-11-01', city: null },
    { lon: 24.0, lat: 52.2, survivors: 30000, date: '1812-12-01', city: '布格河', event: 'end' }
];

// 温度数据
const temperatureData = [
    { date: '1812-10-18', temp: 0, lon: 37.6 },
    { date: '1812-10-24', temp: 0, lon: 36.0 },
    { date: '1812-11-09', temp: -9, lon: 33.2 },
    { date: '1812-11-14', temp: -21, lon: 32.0 },
    { date: '1812-11-24', temp: -11, lon: 29.2 },
    { date: '1812-11-28', temp: -20, lon: 28.5 },
    { date: '1812-12-01', temp: -26, lon: 27.5 },
    { date: '1812-12-06', temp: -37, lon: 26.0 },
    { date: '1812-12-07', temp: -30, lon: 25.3 }
];

// 关键事件数据
const keyEvents = [
    {
        id: 'neman',
        name: '渡过涅曼河',
        date: '1812-06-24',
        location: [54.9, 24.0],
        type: 'start',
        troops: 422000,
        temp: null,
        description: '1812年6月24日，拿破仑率领"大军"约42万人，在科夫诺附近渡过涅曼河，正式入侵俄罗斯帝国。这是欧洲历史上规模最大的军事行动。',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Napoleon_March_to_Russia.jpg/800px-Napoleon_March_to_Russia.jpg'
    },
    {
        id: 'vilnius',
        name: '占领维尔纽斯',
        date: '1812-06-28',
        location: [54.7, 25.3],
        type: 'city',
        troops: 400000,
        temp: null,
        description: '法军占领维尔纽斯，俄军执行焦土政策持续后撤，迫使法军深入敌境。拿破仑在此停留约18天，试图组织补给，但补给困难已开始显现，非战斗减员严重。',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Vilnius_1812.jpg/640px-Vilnius_1812.jpg'
    },
    {
        id: 'vitebsk',
        name: '维捷布斯克休整',
        date: '1812-07-28',
        location: [55.2, 30.2],
        type: 'city',
        troops: 280000,
        temp: null,
        description: '7月底，法军抵达维捷布斯克，拿破仑在此停留16天休整。他原希望在此迫使俄军决战，但俄军继续后撤。此时非战斗减员（疾病、逃亡、补给困难）已非常严重，兵力已降至28万。',
        image: null
    },
    {
        id: 'smolensk',
        name: '斯摩棱斯克战役',
        date: '1812-08-16',
        location: [54.8, 32.0],
        type: 'battle',
        troops: 210000,
        temp: null,
        description: '8月16-18日，法军与俄军在斯摩棱斯克展开激烈攻防战。法军约17.5万人攻城，俄军依托城墙顽强抵抗，最终放火烧城后撤离。法军虽占领城市，却未能歼灭俄军主力，伤亡约1.2万人。',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hess_Smolensk.jpg/800px-Hess_Smolensk.jpg'
    },
    {
        id: 'borodino',
        name: '博罗季诺战役',
        date: '1812-09-07',
        location: [55.5, 35.8],
        type: 'battle',
        troops: 145000,
        temp: null,
        description: '9月7日，法俄两军在博罗季诺展开关键决战，这是整场战役中规模最大、最血腥的单日会战。双方投入超过25万兵力，伤亡总计约7万人。法军战术上获胜但未能歼灭俄军，战略主动权开始丧失。',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Battle_of_Borodino_1812.png/800px-Battle_of_Borodino_1812.png'
    },
    {
        id: 'moscow',
        name: '进入莫斯科',
        date: '1812-09-14',
        location: [55.75, 37.6],
        type: 'city',
        troops: 95000,
        temp: null,
        description: '9月14日，拿破仑率领约9.5万人的疲惫之师进入莫斯科。他发现莫斯科几乎是一座空城，当夜开始燃起大火。俄国沙皇亚历山大一世拒绝和谈，拿破仑在此等待超过一个月却毫无结果。',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Fire_of_Moscow_1812.jpg/800px-Fire_of_Moscow_1812.jpg'
    },
    {
        id: 'retreat_start',
        name: '开始撤退',
        date: '1812-10-19',
        location: [55.75, 37.6],
        type: 'retreat',
        troops: 95000,
        temp: 0,
        description: '认识到求和无望，拿破仑下令从莫斯科开始撤退。大军携带了大量掠夺来的战利品，行军速度缓慢。此时气温仍在0°C左右，但严冬即将来临。',
        image: null
    },
    {
        id: 'maloyaroslavets',
        name: '小雅罗斯拉夫韦茨战役',
        date: '1812-10-24',
        location: [55.3, 36.0],
        type: 'battle',
        troops: 87000,
        temp: 0,
        description: '撤退中的法军与俄军发生激战。尽管法军战术上获胜，但此战迫使拿破仑放弃了南线较温暖的撤退路线，不得不沿北线原路撤回——这条路线已被彻底破坏。',
        image: null
    },
    {
        id: 'smolensk_retreat',
        name: '撤至斯摩棱斯克',
        date: '1812-11-09',
        location: [54.8, 32.0],
        type: 'cold',
        troops: 50000,
        temp: -9,
        description: '11月初，第一次降雪与严寒来临，气温骤降至-9°C。没有冬装的法军开始因冻伤、疾病和饥饿成批死亡，纪律彻底崩溃。到达斯摩棱斯克时，仅剩5万人。',
        image: null
    },
    {
        id: 'krasnoi',
        name: '克拉斯诺耶战役',
        date: '1812-11-15',
        location: [54.6, 31.0],
        type: 'battle',
        troops: 40000,
        temp: -21,
        description: '11月15-17日，法军在克拉斯诺耶与俄军激战，气温已降至-21°C。内伊元帅率后卫部队被困，不得不踏着第聂伯河的浮冰冒险突围，损失惨重。',
        image: null
    },
    {
        id: 'berezina',
        name: '别列津纳河战役',
        date: '1812-11-26',
        location: [54.3, 28.5],
        type: 'battle',
        troops: 28000,
        temp: -20,
        description: '11月26-29日，撤退中的法军被俄军包围在别列津纳河畔，气温-20°C。通过搭建浮桥和后卫部队的殊死抵抗，拿破仑及部分主力得以逃脱，但约有2.5万名士兵在渡河时死亡或被俘。此役标志着"大军"作为有组织力量的终结。',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Crossing_the_Berezina.jpg/800px-Crossing_the_Berezina.jpg'
    },
    {
        id: 'napoleon_leaves',
        name: '拿破仑离开军队',
        date: '1812-12-05',
        location: [54.5, 26.8],
        type: 'event',
        troops: 15000,
        temp: -37,
        description: '12月5日，在斯莫尔贡，气温降至-37°C。拿破仑将指挥权交给缪拉元帅，自己乘坐雪橇秘密返回巴黎，以保住皇位。',
        image: null
    },
    {
        id: 'end',
        name: '退出俄境',
        date: '1812-12-14',
        location: [54.9, 24.0],
        type: 'end',
        troops: 10000,
        temp: -30,
        description: '12月14日，法军残部（约不到1万人）最终渡过涅曼河，退出俄国国境。拿破仑的"大军"从42万人锐减至不足1万，几乎全军覆没。这是军事史上最惨烈的失败之一。',
        image: null
    }
];

// 叙事文本
const narrativeTexts = {
    phase1: {
        title: '第一阶段：入侵',
        dateRange: '1812年6月',
        content: '1812年6月24日，拿破仑率领欧洲史上最大规模的军队——约42万人，渡过涅曼河，开始了对俄国的入侵。法军士气高昂，拿破仑计划在30天内结束战役。然而，俄军执行焦土政策，不断后撤，迫使法军深入敌境。'
    },
    phase2: {
        title: '第二阶段：追击与消耗',
        dateRange: '1812年7月-8月',
        content: '法军追击俄军深入俄国腹地，补给线越拉越长。疾病、饥饿、逃亡使非战斗减员急剧增加。8月在斯摩棱斯克，法军终于追上俄军，但未能实现决战目标，俄军再次成功撤离。'
    },
    phase3: {
        title: '第三阶段：决战与占领',
        dateRange: '1812年9月',
        content: '9月7日，博罗季诺战役爆发，这是整场战役中最血腥的单日会战。双方伤亡约7万人。法军战术上获胜，但俄军主力未被歼灭。9月14日，拿破仑进入莫斯科，却发现这是一座燃烧的空城。沙皇拒绝和谈，拿破仑陷入困境。'
    },
    phase4: {
        title: '第四阶段：大撤退',
        dateRange: '1812年10月-12月',
        content: '10月19日，拿破仑被迫下令撤退。11月初，严寒来临，气温骤降至零下二三十度。没有冬装的法军在冰雪中艰难跋涉，每天都有数千人冻死、饿死。别列津纳河战役成为最后的噩梦，约2.5万人在渡河时丧生。最终，仅有不到1万人活着离开俄国。'
    }
};

// 城市标签数据
const cityLabels = [
    { name: '科夫诺', lat: 54.9, lon: 24.0 },
    { name: '维尔纽斯', lat: 54.7, lon: 25.3 },
    { name: '维捷布斯克', lat: 55.2, lon: 30.2 },
    { name: '斯摩棱斯克', lat: 54.8, lon: 32.0 },
    { name: '博罗季诺', lat: 55.5, lon: 35.8 },
    { name: '莫斯科', lat: 55.75, lon: 37.6 },
    { name: '别列津纳', lat: 54.3, lon: 28.5 }
];

// 河流数据（简化）
const rivers = [
    { name: '涅曼河', coords: [[55.5, 23.5], [54.5, 24.5], [54.0, 25.0]] },
    { name: '第聂伯河', coords: [[55.5, 30.0], [54.5, 31.0], [53.5, 32.0], [52.5, 33.0]] },
    { name: '别列津纳河', coords: [[55.0, 28.5], [54.0, 28.5], [53.0, 28.5]] }
];
