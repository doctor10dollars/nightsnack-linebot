// 愛自己小卡 - Begin to love myself 系列
// Certified by 十元醫師

const CARDS = {
  series1: {
    name: 'Begin to love myself',
    label: 'Series I',
    regular: [
      { id: 'I-01', body: '我不必完美，\n也可以很美。' },
      { id: 'I-02', body: '從這一刻起，\n我選擇愛自己。' },
      { id: 'I-03', body: '美，不是變成誰，\n是找回我自己。' },
      { id: 'I-04', body: '被愛之前，\n我選擇先愛自己。' },
      { id: 'I-05', body: '我知道自己值得，\n一直都值得。' },
      { id: 'I-06', body: '美，\n是被自己真心喜歡。' },
      { id: 'I-07', body: '我願意對自己好，\n這件事本就很美。' },
      { id: 'I-08', body: '取悅自己，\n比取悅世界更重要。' },
      { id: 'I-09', body: '每一個我，\n都是值得被珍惜的版本。' },
      { id: 'I-10', body: '我不需要變成\n別人眼中的美。' },
    ],
    limited: [
      { id: 'I-∞', body: '我值得被疼愛，\n也值得被自己擁抱。', isLimited: true },
    ]
  },
  series2: {
    name: 'Own my glow',
    label: 'Series II',
    regular: [
      { id: 'II-01', body: '我不炫耀，\n只是自然地發光。' },
      { id: 'II-02', body: '我的存在，\n本身就足夠閃耀。' },
      { id: 'II-03', body: '我不追光，\n因為我本身就是光。' },
      { id: 'II-04', body: '我不追求美，\n我成為美本身。' },
      { id: 'II-05', body: '我不需要被定義，\n我定義自己的美。' },
      { id: 'II-06', body: '美不是虛榮，\n是一種生活態度。' },
      { id: 'II-07', body: '我不害怕太亮，\n因為我天生如此。' },
      { id: 'II-08', body: '我不證明價值，\n我就是價值。' },
      { id: 'II-09', body: '我不模仿誰，\n我就是範本。' },
      { id: 'II-10', body: '我不取悅誰，\n我只取悅自己。' },
    ],
    limited: [
      { id: 'II-∞', body: '我不證明美，\n我只存在於美之中。', isLimited: true },
    ]
  },
  series3: {
    name: 'Be the muse of my own story',
    label: 'Series III',
    regular: [
      { id: 'III-01', body: '我的美，\n是一種影響力。' },
      { id: 'III-02', body: '我的美，\n從不止於外表。' },
      { id: 'III-03', body: '我的美，\n不需要被定義。' },
      { id: 'III-04', body: '我的美，\n因我選擇做自己。' },
      { id: 'III-05', body: '我的美，\n來自真實的我。' },
      { id: 'III-06', body: '我的美，\n是用優雅取代焦慮。' },
      { id: 'III-07', body: '我的美，\n是有界線的善良。' },
      { id: 'III-08', body: '我的美，\n是由內而外的力量。' },
      { id: 'III-09', body: '我的存在，\n就是一種美。' },
      { id: 'III-10', body: '我的美，\n不完美，但自在。' },
    ],
    limited: [
      { id: 'III-∞', body: '我的美，是從容、\n不焦慮、不取悅。', isLimited: true },
    ]
  }
};

// 根據用戶等級決定可抽哪些卡
// 解鎖條件：累積打卡天數
// Series I：預設解鎖
// Series II：累積10天解鎖
// Series III：累積20天解鎖

function getAvailableCards(totalCheckins) {
  let available = [...CARDS.series1.regular];
  let availableLimited = [...CARDS.series1.limited];

  if (totalCheckins >= 10) {
    available = [...available, ...CARDS.series2.regular];
    availableLimited = [...availableLimited, ...CARDS.series2.limited];
  }

  if (totalCheckins >= 20) {
    available = [...available, ...CARDS.series3.regular];
    availableLimited = [...availableLimited, ...CARDS.series3.limited];
  }

  return { regular: available, limited: availableLimited };
}

function drawCard(totalCheckins) {
  const { regular, limited } = getAvailableCards(totalCheckins);
  
  // 限量卡機率：約14%（1/7）
  const isLimitedDraw = Math.random() < 0.14;
  
  if (isLimitedDraw && limited.length > 0) {
    return {
      ...limited[Math.floor(Math.random() * limited.length)],
      isLimited: true
    };
  }
  
  return {
    ...regular[Math.floor(Math.random() * regular.length)],
    isLimited: false
  };
}

function getSeriesInfo(totalCheckins) {
  if (totalCheckins >= 20) return { current: 3, next: null, nextAt: null };
  if (totalCheckins >= 10) return { current: 2, next: 3, nextAt: 20 };
  return { current: 1, next: 2, nextAt: 10 };
}

module.exports = { drawCard, getSeriesInfo, CARDS };
