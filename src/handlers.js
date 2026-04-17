const { drawCard, getSeriesInfo } = require('./cards');
const db = require('./db');

const MILESTONES = [
  { days: 3,  emoji: '🥉', title: '初心者', message: '3天了！宵夜開始怕你了。' },
  { days: 7,  emoji: '🥈', title: '一週勇士', message: '整整一週！你比外送平台更了解自己。' },
  { days: 14, emoji: '🥇', title: '兩週守門員', message: '14天！這已經不是運氣，是習慣了。' },
  { days: 21, emoji: '🏆', title: '21天達人', message: '21天！你的身體在謝謝你。' },
  { days: 30, emoji: '👑', title: '宵夜終結者', message: '30天！你贏了。不是贏過食物，是贏過那個衝動的自己。' },
];

function getMilestone(streak) {
  const sorted = [...MILESTONES].sort((a, b) => b.days - a.days);
  return sorted.find(m => streak === m.days) || null;
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/doctor10dollars/nightsnack-linebot/main/images';

const CARD_IMAGE_URLS = {
  'I-01':   `${GITHUB_RAW_BASE}/series1/l-01.png`,
  'I-02':   `${GITHUB_RAW_BASE}/series1/l-02.png`,
  'I-03':   `${GITHUB_RAW_BASE}/series1/l-03.png`,
  'I-04':   `${GITHUB_RAW_BASE}/series1/l-04.png`,
  'I-05':   `${GITHUB_RAW_BASE}/series1/l-05.png`,
  'I-06':   `${GITHUB_RAW_BASE}/series1/l-06.png`,
  'I-07':   `${GITHUB_RAW_BASE}/series1/l-07.png`,
  'I-08':   `${GITHUB_RAW_BASE}/series1/l-08.png`,
  'I-09':   `${GITHUB_RAW_BASE}/series1/l-09.png`,
  'I-10':   `${GITHUB_RAW_BASE}/series1/l-10.png`,
  'I-∞':    `${GITHUB_RAW_BASE}/series1/l-inf.png`,
  'II-01':  `${GITHUB_RAW_BASE}/series2/ll-01.png`,
  'II-02':  `${GITHUB_RAW_BASE}/series2/ll-02.png`,
  'II-03':  `${GITHUB_RAW_BASE}/series2/ll-03.png`,
  'II-04':  `${GITHUB_RAW_BASE}/series2/ll-04.png`,
  'II-05':  `${GITHUB_RAW_BASE}/series2/ll-05.png`,
  'II-06':  `${GITHUB_RAW_BASE}/series2/ll-06.png`,
  'II-07':  `${GITHUB_RAW_BASE}/series2/ll-07.png`,
  'II-08':  `${GITHUB_RAW_BASE}/series2/ll-08.png`,
  'II-09':  `${GITHUB_RAW_BASE}/series2/ll-09.png`,
  'II-10':  `${GITHUB_RAW_BASE}/series2/ll-10.png`,
  'II-∞':   `${GITHUB_RAW_BASE}/series2/ll-inf.png`,
  'III-01': `${GITHUB_RAW_BASE}/series3/lll-01.png`,
  'III-02': `${GITHUB_RAW_BASE}/series3/lll-02.png`,
  'III-03': `${GITHUB_RAW_BASE}/series3/lll-03.png`,
  'III-04': `${GITHUB_RAW_BASE}/series3/lll-04.png`,
  'III-05': `${GITHUB_RAW_BASE}/series3/lll-05.png`,
  'III-06': `${GITHUB_RAW_BASE}/series3/lll-06.png`,
  'III-07': `${GITHUB_RAW_BASE}/series3/lll-07.png`,
  'III-08': `${GITHUB_RAW_BASE}/series3/lll-08.png`,
  'III-09': `${GITHUB_RAW_BASE}/series3/lll-09.png`,
  'III-10': `${GITHUB_RAW_BASE}/series3/lll-10.png`,
  'III-∞':  `${GITHUB_RAW_BASE}/series3/lll-inf.png`,
};

async function sendCardImage(client, replyToken, card) {
  const imageUrl = CARD_IMAGE_URLS[card.id];
  if (!imageUrl) {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: `🎴 ${card.id}\n\n${card.body}\n\nCertified by 十元醫師`,
    });
    return;
  }
  const messages = [
    { type: 'image', originalContentUrl: imageUrl, previewImageUrl: imageUrl },
  ];
  if (card.isLimited) {
    messages.push({ type: 'text', text: `✨ 恭喜！你抽到了限量版 ${card.id}！` });
  }
  await client.replyMessage(replyToken, messages);
}

async function handleCheckin(userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const alreadyCheckedIn = await db.getTodayCheckin(user.id);

  if (alreadyCheckedIn) {
    const stats = await db.getUserStats(user.id);
    return `✅ 你今天已經打卡過了～\n\n目前連續：${stats.currentStreak} 天\n累積總天數：${stats.totalCheckins} 天\n\n繼續撐住，今晚別吃 🙂`;
  }

  const checkin = await db.doCheckin(user.id);
  const stats = await db.getUserStats(user.id);
  const milestone = getMilestone(checkin.streak_count);
  const seriesInfo = getSeriesInfo(stats.totalCheckins);

  let msg = `✅ 打卡成功！\n\n`;
  msg += `連續：${checkin.streak_count} 天 🔥\n`;
  msg += `累積：${stats.totalCheckins} 天\n`;

  if (milestone) {
    msg += `\n━━━━━━━━━━━━━━\n`;
    msg += `${milestone.emoji} 成就達成！\n【${milestone.title}】\n${milestone.message}\n`;
    msg += `━━━━━━━━━━━━━━\n`;
    msg += `\n截圖發限動，讓朋友也一起！\n#今晚別吃 #宵夜掰掰`;
  }

  if (stats.totalCheckins === 10) {
    msg += `\n\n🎉 Series II 已解鎖！\n輸入「抽卡」就能抽到新系列！`;
  } else if (stats.totalCheckins === 20) {
    msg += `\n\n🎉 Series III 已解鎖！`;
  } else if (seriesInfo.next) {
    msg += `\n\n📦 再累積 ${seriesInfo.nextAt - stats.totalCheckins} 天解鎖 Series ${seriesInfo.next}`;
  }

  return msg;
}

async function handleDraw(userId, displayName, client, replyToken) {
  const user = await db.getOrCreateUser(userId, displayName);
  const stats = await db.getUserStats(user.id);
  const alreadyDrew = await db.getTodayDraw(user.id);

  if (alreadyDrew) {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: `🎴 今天已經抽過卡了！\n明天再來拆包～\n\n每天報到都有機會抽卡 ✨`,
    });
    return;
  }

  const card = drawCard(stats.totalCheckins);
  await db.saveDraw(user.id, card.id);
  await sendCardImage(client, replyToken, card);
}

async function handleRecord(userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const stats = await db.getUserStats(user.id);
  const seriesInfo = getSeriesInfo(stats.totalCheckins);

  if (stats.totalCheckins === 0) {
    return `你還沒有打過卡！\n輸入「打卡」開始你的第一天 🌙`;
  }

  let msg = `📊 ${displayName} 的紀錄\n━━━━━━━━━━━━━━\n\n`;
  msg += `🔥 目前連續：${stats.currentStreak} 天\n`;
  msg += `📅 累積打卡：${stats.totalCheckins} 天\n`;
  msg += `🏅 最長連續：${stats.maxStreak} 天\n`;
  msg += `📦 解鎖系列：Series ${seriesInfo.current}\n`;

  if (seriesInfo.next) {
    msg += `\n再 ${seriesInfo.nextAt - stats.totalCheckins} 天解鎖 Series ${seriesInfo.next} ✨`;
  } else {
    msg += `\n🎉 全系列已解鎖！`;
  }

  if (!stats.hasTodayCheckin) {
    msg += `\n\n⚠️ 今天還沒打卡，快去打卡！`;
  }

  return msg;
}

async function handleEncourage(userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const stats = await db.getUserStats(user.id);

  const encouragements = [
    '你不是餓，你只是今天很累。\n喝杯水，等10分鐘再決定。',
    '現在吃，很爽。\n明天後悔，更累。',
    '你已經撐這麼久了，\n不要在終點前放棄。',
    '嘴饞不是真的餓，\n是習慣在說話。\n你比習慣更強。',
    '先刷牙。\n刷完牙如果還想吃，再說。',
    '宵夜不值得你明天的後悔。\n你值得更好的感覺。',
    '睡覺是最好的宵夜替代品 🌙',
    '你現在感覺到的，\n只要撐過15分鐘就會消失。',
  ];

  const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
  let reply = `💪 宵夜掰掰說：\n\n${msg}`;
  if (stats.currentStreak > 0) {
    reply += `\n\n你已經連續 ${stats.currentStreak} 天了，\n不要斷掉！🔥`;
  }
  return reply;
}

function handleHelp() {
  return `👋 我是宵夜掰掰 🌙\n十元醫師的戒宵夜助手\n\n可用指令：\n\n📌 打卡\n今天沒吃宵夜，打個卡！\n\n🎴 抽卡\n每天抽一張愛自己小卡\n\n📊 我的紀錄\n查看你的連續天數\n\n💪 鼓勵\n快撐不住的時候叫我\n\n━━━━━━━━━━━━━━\n堅持最難的不是第一天，\n是第三天。\n\n今晚，別吃。🌙`;
}

function handleWelcome(displayName) {
  return `嗨 ${displayName}！我是宵夜掰掰 🌙\n\n十元醫師叫我來盯你\n晚上不要亂吃。\n\n只要做到一件事：\n今晚，別吃宵夜。\n\n─────────────\n輸入「打卡」開始第一天\n輸入「help」看全部指令\n─────────────\n\n不用節食，不用極端，\n先撐過今晚這一關。🙂`;
}

async function handleMessage(event, client) {
  const userId = event.source.userId;
  const text = event.message.text?.trim() || '';
  const replyToken = event.replyToken;

  let displayName = '朋友';
  try {
    const profile = await client.getProfile(userId);
    displayName = profile.displayName;
  } catch (e) {}

  const keywords = {
    checkin:   ['打卡', '報到', '簽到', '沒吃宵夜', '今天沒吃'],
    draw:      ['抽卡', '愛自己小卡', '今天的愛自己'],
    record:    ['我的紀錄', '紀錄', '查詢', '幾天了', '堅持了幾天', '成就'],
    encourage: ['鼓勵', '快撐不住', '好想吃', '想吃', '撐不住', '加油', '需要鼓勵'],
    help:      ['help', 'Help', 'HELP', '說明', '指令', '怎麼用', '怎麼玩'],
  };

  if (keywords.checkin.some(k => text.includes(k))) {
    const msg = await handleCheckin(userId, displayName);
    await client.replyMessage(replyToken, { type: 'text', text: msg });

  } else if (keywords.draw.some(k => text.includes(k))) {
    await handleDraw(userId, displayName, client, replyToken);

  } else if (keywords.record.some(k => text.includes(k))) {
    const msg = await handleRecord(userId, displayName);
    await client.replyMessage(replyToken, { type: 'text', text: msg });

  } else if (keywords.encourage.some(k => text.includes(k))) {
    const msg = await handleEncourage(userId, displayName);
    await client.replyMessage(replyToken, { type: 'text', text: msg });

  } else if (keywords.help.some(k => text.includes(k))) {
    await client.replyMessage(replyToken, { type: 'text', text: handleHelp() });

  } else {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: `輸入「help」看全部指令 🙂\n\n或者直接點下方選單！`,
    });
  }
}

async function handleFollow(event, client) {
  const userId = event.source.userId;
  let displayName = '朋友';
  try {
    const profile = await client.getProfile(userId);
    displayName = profile.displayName;
  } catch (e) {}

  await db.getOrCreateUser(userId, displayName);
  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: handleWelcome(displayName),
  });
}

module.exports = { handleMessage, handleFollow };
