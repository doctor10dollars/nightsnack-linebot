const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/doctor10dollars/nightsnack-linebot/main/images';

const CARDS = {
  series1: {
    name: 'Begin to love myself',
    label: 'Series I',
    unlockAt: 0,
    regular: [
      { id: 'I-01', body: '我不必完美，\n也可以很美。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-01.png` },
      { id: 'I-02', body: '從這一刻起，\n我選擇愛自己。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-02.png` },
      { id: 'I-03', body: '美，不是變成誰，\n是找回我自己。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-03.png` },
      { id: 'I-04', body: '被愛之前，\n我選擇先愛自己。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-04.png` },
      { id: 'I-05', body: '我知道自己值得，\n一直都值得。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-05.png` },
      { id: 'I-06', body: '美，\n是被自己真心喜歡。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-06.png` },
      { id: 'I-07', body: '我願意對自己好，\n這件事本就很美。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-07.png` },
      { id: 'I-08', body: '取悅自己，\n比取悅世界更重要。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-08.png` },
      { id: 'I-09', body: '每一個我，\n都是值得被珍惜的版本。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-09.png` },
      { id: 'I-10', body: '我不需要變成\n別人眼中的美。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-10.png` },
    ],
    limited: [
      { id: 'I-∞', body: '我值得被疼愛，\n也值得被自己擁抱。', imageUrl: `${GITHUB_RAW_BASE}/series1/s1-inf.png`, isLimited: true },
    ],
  },
  series2: {
    name: 'Own my glow',
    label: 'Series II',
    unlockAt: 10,
    regular: [
      { id: 'II-01', body: '我不炫耀，\n只是自然地發光。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-01.png` },
      { id: 'II-02', body: '我的存在，\n本身就足夠閃耀。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-02.png` },
      { id: 'II-03', body: '我不追光，\n因為我本身就是光。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-03.png` },
      { id: 'II-04', body: '我不追求美，\n我成為美本身。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-04.png` },
      { id: 'II-05', body: '我不需要被定義，\n我定義自己的美。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-05.png` },
      { id: 'II-06', body: '美不是虛榮，\n是一種生活態度。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-06.png` },
      { id: 'II-07', body: '我不害怕太亮，\n因為我天生如此。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-07.png` },
      { id: 'II-08', body: '我不證明價值，\n我就是價值。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-08.png` },
      { id: 'II-09', body: '我不模仿誰，\n我就是範本。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-09.png` },
      { id: 'II-10', body: '我不取悅誰，\n我只取悅自己。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-10.png` },
    ],
    limited: [
      { id: 'II-∞', body: '我不證明美，\n我只存在於美之中。', imageUrl: `${GITHUB_RAW_BASE}/series2/s2-inf.png`, isLimited: true },
    ],
  },
  series3: {
    name: 'Be the muse of my own story',
    label: 'Series III',
    unlockAt: 20,
    regular: [
      { id: 'III-01', body: '我的美，\n是一種影響力。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-01.png` },
      { id: 'III-02', body: '我的美，\n從不止於外表。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-02.png` },
      { id: 'III-03', body: '我的美，\n不需要被定義。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-03.png` },
      { id: 'III-04', body: '我的美，\n因我選擇做自己。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-04.png` },
      { id: 'III-05', body: '我的美，\n來自真實的我。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-05.png` },
      { id: 'III-06', body: '我的美，\n是用優雅取代焦慮。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-06.png` },
      { id: 'III-07', body: '我的美，\n是有界線的善良。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-07.png` },
      { id: 'III-08', body: '我的美，\n是由內而外的力量。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-08.png` },
      { id: 'III-09', body: '我的存在，\n就是一種美。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-09.png` },
      { id: 'III-10', body: '我的美，\n不完美，但自在。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-10.png` },
    ],
    limited: [
      { id: 'III-∞', body: '我的美，是從容、\n不焦慮、不取悅。', imageUrl: `${GITHUB_RAW_BASE}/series3/s3-inf.png`, isLimited: true },
    ],
  },
};

function getAvailableCards(totalCheckins) {
  let regular = [...CARDS.series1.regular];
  let limited = [...CARDS.series1.limited];

  if (totalCheckins >= 10) {
    regular = [...regular, ...CARDS.series2.regular];
    limited = [...limited, ...CARDS.series2.limited];
  }
  if (totalCheckins >= 20) {
    regular = [...regular, ...CARDS.series3.regular];
    limited = [...limited, ...CARDS.series3.limited];
  }

  return { regular, limited };
}

function drawCard(totalCheckins) {
  const { regular, limited } = getAvailableCards(totalCheckins);
  const X = 1 / (regular.length + 0.3);
  const limitedProb = 0.3 * X;
  const roll = Math.random();

  if (roll < limitedProb && limited.length > 0) {
    return { ...limited[Math.floor(Math.random() * limited.length)], isLimited: true };
  }
  return { ...regular[Math.floor(Math.random() * regular.length)], isLimited: false };
}

function getSeriesInfo(totalCheckins) {
  if (totalCheckins >= 20) return { current: 3, next: null, nextAt: null };
  if (totalCheckins >= 10) return { current: 2, next: 3, nextAt: 20 };
  return { current: 1, next: 2, nextAt: 10 };
}

function getTotalCardCount(totalCheckins) {
  const { regular, limited } = getAvailableCards(totalCheckins);
  return regular.length + limited.length;
}

module.exports = { drawCard, getSeriesInfo, getTotalCardCount, CARDS };
