// 10个关键战役数据 - 基于拿破仑进攻俄国.md
export const keyBattles = [
  {
    id: 'ostrovono',
    title: '奥斯特罗夫诺战役',
    titleEn: 'Battle of Ostrovono',
    date: '1812年6月25日-26日',
    location: { lat: 55.4, lon: 26.5 },
    type: 'battle',
    phase: 'advance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Napoleon_March_to_Russia.jpg/800px-Napoleon_March_to_Russia.jpg',
    overview: '拿破仑大军渡过涅曼河后的首场正式战役，奠定了俄军"战略撤退"的基调。',
    stats: {
      frenchTroops: 18000,
      russianTroops: 12000,
      frenchCasualties: 2300,
      russianCasualties: 1300,
      temperature: '25-28°C'
    },
    commanders: {
      french: ['达武元帅'],
      russian: ['冯·席尔将军', '巴克莱·德·托利']
    },
    content: `
      <h3>战役背景</h3>
      <p>此役为拿破仑大军渡过涅曼河后的首场正式战役，发生于俄属立陶宛境内的奥斯特罗夫诺村，距涅曼河约80公里，是法军东进维尔诺的必经之路。</p>
      
      <h3>气候条件</h3>
      <p>典型的东欧平原夏季气候，日均气温25-28℃，空气潮湿闷热。6月26日午后突发雷阵雨，持续2小时，导致战场泥泞，骑兵冲锋受阻。</p>
      
      <h3>战役经过</h3>
      <p>6月25日清晨，法军前卫第5步兵师先头部队与俄军前哨在村外树林遭遇，双方展开小规模交火。当日午后，达武元帅下令主力展开进攻，法军以密集步兵纵队冲击俄军左翼高地，双方陷入僵持。</p>
      <p>6月26日清晨，法军调整战术，以轻骑兵迂回俄军右翼，同时集中火炮轰击俄军中央阵地，俄军侧翼受袭后防线动摇，席尔将军为避免被包围，下令逐步后撤至维尔诺方向。</p>
      
      <h3>战役影响</h3>
      <p>法军虽占领奥斯特罗夫诺，但未能歼灭俄军前卫。此役让巴克莱·德·托利认清法军兵力优势，坚定了"避免决战、战略撤退、消耗敌军"的核心策略。</p>
    `
  },
  {
    id: 'krasny1',
    title: '克拉斯诺耶遭遇战',
    titleEn: 'Battle of Krasny (August)',
    date: '1812年8月14日',
    location: { lat: 54.7, lon: 32.1 },
    type: 'battle',
    phase: 'advance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/IV_corpo_durante_la_campagna_di_Russia.jpg/800px-IV_corpo_durante_la_campagna_di_Russia.jpg',
    overview: '典型前卫遭遇战，明确暴露了拿破仑企图与俄军主力决战的战略意图。',
    stats: {
      frenchTroops: 12000,
      russianTroops: 8000,
      frenchCasualties: 1500,
      russianCasualties: 800,
      temperature: '30°C以上'
    },
    commanders: {
      french: ['内伊元帅'],
      russian: ['多赫图罗夫将军']
    },
    content: `
      <h3>战役背景</h3>
      <p>发生于俄罗斯西部斯摩棱斯克州克拉斯诺耶村附近，地处斯摩棱斯克以西约60公里，是连接明斯克与斯摩棱斯克的交通要道。</p>
      
      <h3>气候条件</h3>
      <p>正值东欧平原盛夏酷暑期，日均气温达30℃以上，空气湿度大，体感闷热难耐。当日正午至傍晚出现雷暴天气，导致土路泥泞不堪。</p>
      
      <h3>战役经过</h3>
      <p>8月14日清晨6时许，法军前卫侦察分队发现俄军后卫踪迹，随即发起试探性进攻。上午9时，内伊元帅率步兵主力赶到，下令以步兵纵队分两路进攻。俄军依托地形顽强抵抗，哥萨克骑兵多次发动反冲锋。</p>
      <p>雷暴天气降临后，战场泥泞加剧，法军火炮无法有效机动，进攻势头减弱，俄军趁机逐步后撤。</p>
      
      <h3>战役影响</h3>
      <p>此战明确暴露了拿破仑"集中主力直扑斯摩棱斯克"的战略意图，巴克莱·德·托利据此调整部署，同时下令沿途实施初步焦土政策。</p>
    `
  },
  {
    id: 'smolensk',
    title: '斯摩棱斯克攻城战',
    titleEn: 'Battle of Smolensk',
    date: '1812年8月16日-19日',
    location: { lat: 54.8, lon: 32.0 },
    type: 'siege',
    phase: 'advance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hess_Smolensk.jpg/800px-Hess_Smolensk.jpg',
    overview: '法军东进莫斯科的关键战役，俄军实施焦土政策后撤离，城市被焚毁大半。',
    stats: {
      frenchTroops: 130000,
      russianTroops: 105000,
      frenchCasualties: 14000,
      russianCasualties: 8000,
      temperature: '28-31°C'
    },
    commanders: {
      french: ['拿破仑', '达武元帅', '内伊元帅'],
      russian: ['巴克莱·德·托利', '巴格拉季昂亲王']
    },
    content: `
      <h3>战役背景</h3>
      <p>围绕俄罗斯西部战略重镇斯摩棱斯克展开，该城坐落于第聂伯河左岸，城墙高大坚固，是法军东进莫斯科的必经之地。</p>
      
      <h3>战役经过</h3>
      <p>8月16日清晨7时，法军发起首轮进攻，集中火炮轰击城南城墙。俄军依托城墙工事顽强反击。</p>
      <p>8月17日，拿破仑调整战术，将重型攻城炮部署于城东高地，法军火炮总计发射炮弹超12000发，城东城墙被轰开多处缺口。巴格拉季昂亲王率援军赶到，击退法军进攻，稳住防线。</p>
      <p>8月18日凌晨，俄军决定实施焦土政策后有序撤离，烧毁城内粮食、弹药库及可被法军利用的建筑。</p>
      
      <h3>战役影响</h3>
      <p>法军虽占领斯摩棱斯克，但城市已被焚毁大半，无任何可补给物资。法军未能实现围歼俄军主力的战略目标，后勤压力进一步加剧。</p>
    `
  },
  {
    id: 'polotsk',
    title: '波洛茨克战役',
    titleEn: 'Battle of Polotsk',
    date: '1812年8月17日-18日',
    location: { lat: 55.5, lon: 28.8 },
    type: 'battle',
    phase: 'advance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Napoleon_March_to_Russia.jpg/800px-Napoleon_March_to_Russia.jpg',
    overview: '北翼战场的关键战役，法军暂时稳定了北翼安全，保障主力东进。',
    stats: {
      frenchTroops: 25000,
      russianTroops: 22000,
      frenchCasualties: 2500,
      russianCasualties: 4000,
      temperature: '27-30°C'
    },
    commanders: {
      french: ['圣西尔元帅'],
      russian: ['维特根施泰因将军']
    },
    content: `
      <h3>战役背景</h3>
      <p>发生在北部战线重镇波洛茨克，该城坐落于西德维纳河畔，是法军北翼补给线的关键节点。</p>
      
      <h3>战役经过</h3>
      <p>8月17日清晨8时，俄军率先发起进攻，步兵分两路冲击法军阵地，哥萨克骑兵迂回至法军右翼。圣西尔元帅早有防备，双方在城外围陷入僵持。</p>
      <p>8月18日清晨，圣西尔元帅主动调整战术，发起反击，以第6军主力从正面猛攻俄军中央阵地，俄军防线动摇，被迫逐步后撤。</p>
      
      <h3>战役影响</h3>
      <p>此役暂时稳定了法军北翼安全，保障了主力向斯摩棱斯克、莫斯科方向推进，但俄军仍在北翼持续活动，为后续法军撤退时北翼被袭埋下隐患。</p>
    `
  },
  {
    id: 'borodino',
    title: '博罗季诺战役',
    titleEn: 'Battle of Borodino',
    date: '1812年9月7日',
    location: { lat: 55.5, lon: 35.8 },
    type: 'major_battle',
    phase: 'advance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/%D0%9A%D0%BE%D0%BD%D0%B5%D1%86_%D0%91%D0%BE%D1%80%D0%BE%D0%B4%D0%B8%D0%BD%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B1%D0%BE%D1%8F.jpg/800px-%D0%9A%D0%BE%D0%BD%D0%B5%D1%86_%D0%91%D0%BE%D1%80%D0%BE%D0%B4%D0%B8%D0%BD%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B1%D0%BE%D1%8F.jpg',
    overview: '拿破仑侵俄战争中规模最大、最血腥的会战，双方伤亡约75000人。',
    stats: {
      frenchTroops: 133000,
      russianTroops: 127000,
      frenchCasualties: 37000,
      russianCasualties: 38000,
      temperature: '18-22°C'
    },
    commanders: {
      french: ['拿破仑', '达武元帅', '内伊元帅'],
      russian: ['库图佐夫公爵', '巴格拉季昂亲王']
    },
    content: `
      <h3>战役背景</h3>
      <p>在莫斯科以西约125公里的博罗季诺村附近展开，战场横跨科洛查河两岸，俄军依托谢苗诺夫斯卡娅棱堡、拉耶夫斯基炮台等工事构建防御体系。</p>
      
      <h3>战役经过</h3>
      <p>战役于9月7日清晨6时30分打响，法军率先以密集炮群轰击俄军左翼谢苗诺夫斯卡娅棱堡，双方炮战持续1小时。法军第5军、第8军向棱堡发起猛攻，俄军顽强抵抗，棱堡多次易手。</p>
      <p>上午10时，拿破仑命令达武元帅率第1军进攻俄军中央阵地，内伊元帅再次冲击棱堡。拉耶夫斯基炮台成为双方争夺的核心据点，法军多次冲上炮台均被俄军击退。</p>
      <p>中午12时，法军终于占领谢苗诺夫斯卡娅棱堡，但俄军迅速收缩防线继续抵抗。下午2时许，拿破仑拒绝投入近卫军，法军进攻势头减弱。</p>
      
      <h3>战役影响</h3>
      <p>从战术上看，法军取得胜利；从战略上看，法军未能歼灭俄军主力，自身元气大伤。9月7日夜，库图佐夫下令俄军有序撤离，拿破仑于9月14日进入已被俄军焚毁的莫斯科。</p>
    `
  },
  {
    id: 'maloyaroslavets',
    title: '小雅罗斯拉韦茨战役',
    titleEn: 'Battle of Maloyaroslavets',
    date: '1812年10月24日',
    location: { lat: 55.0, lon: 36.5 },
    type: 'battle',
    phase: 'retreat',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Retreat_of_Napoleon_Army_from_Moscow_1812.jpg/800px-Retreat_of_Napoleon_Army_from_Moscow_1812.jpg',
    overview: '城池先后易手8次，直接决定了法军后续灾难性的撤退命运。',
    stats: {
      frenchTroops: 110000,
      russianTroops: 90000,
      frenchCasualties: 8000,
      russianCasualties: 6000,
      temperature: '5-8°C'
    },
    commanders: {
      french: ['拿破仑', '缪拉元帅'],
      russian: ['库图佐夫', '乌瓦罗夫']
    },
    content: `
      <h3>战役背景</h3>
      <p>位于莫斯科西南，是连接莫斯科与卡卢加的交通要道。卡卢加地区物资充足，是拿破仑计划南撤获取补给的关键节点。此时俄罗斯已进入深秋，日均气温降至5-8℃。</p>
      
      <h3>战役经过</h3>
      <p>10月24日清晨7时，法军先头部队与俄军守城部队遭遇，双方迅速陷入巷战。由于城池狭小，只能逐街、逐屋争夺，战斗异常惨烈。</p>
      <p>上午9时，法军冲击城南城门，突破俄军防线，城池首次易手。上午11时，俄军援军从城北发起反击，城池第二次易手。此后城池先后易手8次，街道上堆满尸体。</p>
      <p>下午4时许，法军凭借兵力优势攻占核心区域，但俄军已在城南、城西部署重兵，南进卡卢加的道路已被彻底阻断。</p>
      
      <h3>战役影响</h3>
      <p>拿破仑被迫放弃南撤计划，下令沿来时已被焦土政策破坏的斯摩棱斯克大道撤退，这条路线成为法军的"死亡之路"。</p>
    `
  },
  {
    id: 'vyazma',
    title: '维亚济马战役',
    titleEn: 'Battle of Vyazma',
    date: '1812年11月3日-4日',
    location: { lat: 55.2, lon: 34.3 },
    type: 'battle',
    phase: 'retreat',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Retreat_of_Napoleon_Army_from_Moscow_1812.jpg/800px-Retreat_of_Napoleon_Army_from_Moscow_1812.jpg',
    overview: '法军撤退后的首次大规模阻击战，法军撤退彻底演变为溃退。',
    stats: {
      frenchTroops: 37500,
      russianTroops: 23000,
      frenchCasualties: 8000,
      russianCasualties: 1500,
      temperature: '-5°C至0°C'
    },
    commanders: {
      french: ['拿破仑'],
      russian: ['米洛拉多维奇将军', '普拉托夫将军']
    },
    content: `
      <h3>战役背景</h3>
      <p>发生在撤退要道维亚济马，该城是斯摩棱斯克大道上的关键节点。已进入俄罗斯严冬初期，日均气温降至-5℃至0℃，夜间气温低至-10℃，法军士兵缺乏冬装，大量士兵冻伤。</p>
      
      <h3>战役经过</h3>
      <p>11月3日上午10时，俄军哥萨克骑兵率先对法军后卫发起袭击，法军后卫仓促抵抗，很快陷入被动。米洛拉多维奇将军趁机从侧翼冲击法军主力纵队，俄军逐步分割法军阵型。</p>
      <p>11月4日清晨，法军主力试图救援后卫，但拿破仑为避免主力被围，下令放弃后卫部队，率主力强行突围。俄军趁机发起总攻，法军撤退彻底演变为溃退。</p>
      
      <h3>战役影响</h3>
      <p>法军丢失火炮30门、辎重车辆200余辆，粮食与弹药几乎耗尽。此战严重打击了法军士气，部队纪律崩溃，为后续惨败埋下伏笔。</p>
    `
  },
  {
    id: 'krasny2',
    title: '克拉斯诺耶阻击战',
    titleEn: 'Battle of Krasny (November)',
    date: '1812年11月15日-17日',
    location: { lat: 54.7, lon: 32.1 },
    type: 'battle',
    phase: 'retreat',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Louvre-peinture-francaise-Ney-a-Kowno-p1020309.jpg/800px-Louvre-peinture-francaise-Ney-a-Kowno-p1020309.jpg',
    overview: '内伊元帅指挥后卫苦战突围，后卫部队几乎全军覆没。',
    stats: {
      frenchTroops: 55000,
      russianTroops: 80000,
      frenchCasualties: 20000,
      russianCasualties: 4000,
      temperature: '-12°C至-8°C'
    },
    commanders: {
      french: ['拿破仑', '内伊元帅'],
      russian: ['库图佐夫']
    },
    content: `
      <h3>战役背景</h3>
      <p>与8月14日遭遇战为同一区域，此时已被严寒覆盖。处于暴风雪后的严寒初期，日均气温低至-12℃至-8℃，夜间气温可达-18℃，每日非战斗减员超1000人。</p>
      
      <h3>战役经过</h3>
      <p>11月15日清晨，俄军三路纵队同时发起进攻，重点打击内伊元帅指挥的法军后卫。内伊元帅下令部队依托雪地地形构建临时防御工事，顽强抵抗。当日下午，法军后卫被俄军分割为两段。</p>
      <p>11月16日，内伊元帅指挥后卫与俄军展开白刃战，部队从25000人锐减至8000人。拿破仑亲率近卫军试图救援，但无法突破，被迫下令主力向别列津纳河方向撤退。</p>
      <p>11月17日清晨，内伊元帅率剩余8000人发起最后突围，最终仅率约1000名残兵与主力汇合。</p>
      
      <h3>战役影响</h3>
      <p>内伊元帅的后卫部队几乎全军覆没，丢失火炮50门。法军进一步减员，战斗力几乎丧失。</p>
    `
  },
  {
    id: 'berezina',
    title: '别列津纳河渡河战',
    titleEn: 'Battle of Berezina',
    date: '1812年11月26日-29日',
    location: { lat: 54.3, lon: 28.5 },
    type: 'major_battle',
    phase: 'retreat',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Biarezina._%D0%91%D1%8F%D1%80%D1%8D%D0%B7%D1%96%D0%BD%D0%B0_%28V._Adam%2C_1801-50%29.jpg/800px-Biarezina._%D0%91%D1%8F%D1%80%D1%8D%D0%B7%D1%96%D0%BD%D0%B0_%28V._Adam%2C_1801-50%29.jpg',
    overview: '法军撤退的最后天然屏障，约3万人在渡河时死亡或被俘。',
    stats: {
      frenchTroops: 50000,
      russianTroops: 65000,
      frenchCasualties: 30000,
      russianCasualties: 3000,
      temperature: '-25°C至-20°C'
    },
    commanders: {
      french: ['拿破仑', '维克托元帅'],
      russian: ['维特根施泰因', '奇恰戈夫']
    },
    content: `
      <h3>战役背景</h3>
      <p>在白俄罗斯的别列津纳河畔斯图江卡渡口，别列津纳河是法军撤退至波兰境内的最后一道天然屏障。极端严寒天气，日均气温低至-25℃至-20℃，部分时段降至-30℃以下。</p>
      
      <h3>战役经过</h3>
      <p>11月26日清晨，法军发现俄军已控制两岸渡口，拿破仑紧急下令工兵在渡口上游2公里处架桥。法军工兵在-25℃的严寒中，跳入冰冷的河水中作业，大量工兵冻伤、溺亡，经过12小时苦战，终于架起两座浮桥。</p>
      <p>11月27日，法军主力开始渡河，渡河秩序极度混乱，浮桥多次因超载而晃动，部分士兵坠入河中溺亡或冻死。当日夜间，约15000人成功渡河。</p>
      <p>11月29日上午，拿破仑下令烧毁浮桥，留在东岸的约15000名掉队人员被俄军俘虏或冻死、溺亡。</p>
      
      <h3>战役影响</h3>
      <p>仅约20000人成功渡河，火炮丢失60门，辎重全部丢失。别列津纳河渡河战被视为拿破仑杰出的战术挽救行动，避免了全军覆没，但法军已彻底失去战斗力。</p>
    `
  },
  {
    id: 'finale',
    title: '战争收尾',
    titleEn: 'The End of Campaign',
    date: '1812年12月',
    location: { lat: 54.9, lon: 24.0 },
    type: 'retreat',
    phase: 'retreat',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Minard.png/800px-Minard.png',
    overview: '法军残部撤出俄国，60万入侵大军近乎覆灭。',
    stats: {
      frenchTroops: 30000,
      russianTroops: null,
      frenchCasualties: 570000,
      russianCasualties: 300000,
      temperature: '-30°C以下'
    },
    commanders: {
      french: ['缪拉元帅'],
      russian: ['库图佐夫']
    },
    content: `
      <h3>战争结束</h3>
      <p>12月1日，拿破仑得知巴黎爆发政治危机，秘密离开残部，乘坐雪橇返回巴黎，委托缪拉元帅指挥剩余部队撤退。</p>
      <p>12月中旬，法军残部撤至涅曼河以西，彻底退出俄罗斯境内，1812年拿破仑侵俄战争正式结束。</p>
      
      <h3>战争损失统计</h3>
      <ul>
        <li>法军损失兵力超57万人（阵亡、受伤、被俘、失踪）</li>
        <li>火炮丢失1200余门</li>
        <li>辎重全部丧失</li>
        <li>俄军损失约30万人</li>
      </ul>
      
      <h3>历史影响</h3>
      <p>拿破仑帝国的军事霸权彻底崩塌，为后续第六次反法同盟的形成与拿破仑的垮台埋下伏笔。</p>
    `
  }
]

export default keyBattles
