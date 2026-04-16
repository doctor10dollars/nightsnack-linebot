const { drawCard, getSeriesInfo } = require('./cards');
const db = require('./db');

// 成就獎盃設定
const MILESTONES = [
  { days: 3,  emoji: '🥉', title: '初心者', message: '3天了！宵夜開始怕你了。' },
  { days: 7,  emoji: '🥈', title: '一週勇士', message: '整整一週！你比外送平台更了解自己。' },
  { days: 14, emoji: '🥇', title: '兩週守門員', message: '14天！這已經不是運氣，是習慣了。' },
  { days: 21, emoji: '🏆', title: '21天達人', message: '21天！你的身體在謝謝你。' },
  { days: 30, emoji: '👑', title: '宵夜終結者', message: '30天！你贏了。不是贏過食物，是贏過那個衝動的自己。' },
];

function getMilestone(streak) {
  // 從大到小找，回傳最符合的
  const sorted = [...MILESTONES].sort((a, b) => b.days - a.days);
  return sorted.find(m => streak === m.days) || null;
}

// 處理「打卡」指令
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

  // 成就達成
  if (milestone) {
    msg += `\n━━━━━━━━━━━━━━\n`;
    msg += `${milestone.emoji} 成就達成！\n`;
    msg += `【${milestone.title}】\n`;
    msg += `${milestone.message}\n`;
    msg += `━━━━━━━━━━━━━━\n`;
    msg += `\n截圖發限動，讓朋友也一起！\n#今晚別吃 #宵夜掰掰`;
  }

  // 系列解鎖提示
  if (stats.totalCheckins === 10) {
    msg += `\n\n🎉 Series II 已解鎖！\n輸入「抽卡」就能抽到新系列！`;
  } else if (stats.totalCheckins === 20) {
    msg += `\n\n🎉 Series III 已解鎖！`;
  } else if (seriesInfo.next) {
    const remaining = seriesInfo.nextAt - stats.totalCheckins;
    msg += `\n\n📦 再累積 ${remaining} 天解鎖 Series ${seriesInfo.next}`;
  }

  return msg;
}

// 處理「抽卡」指令
async function handleDraw(userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const stats = await db.getUserStats(user.id);
  const alreadyDrew = await db.getTodayDraw(user.id);

  if (alreadyDrew) {
    return `🎴 今天已經抽過卡了！\n明天再來拆包～\n\n每天報到都有機會抽卡 ✨`;
  }

  const card = drawCard(stats.totalCheckins);
  await db.saveDraw(user.id, card.id);

  let msg = `🎴 今日愛自己小卡\n`;
  msg += `━━━━━━━━━━━━━━\n\n`;
  msg += `${card.body}\n\n`;
  msg += `━━━━━━━━━━━━━━\n`;
  msg += `${card.id}  Certified by 十元醫師`;

  if (card.isLimited) {
    msg += `\n\n✨ 恭喜！你抽到了限量版 ${card.id}！`;
  }

  return msg;
}

// 處理「我的紀錄」指令
async function handleRecord(userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const stats = await db.getUserStats(user.id);
  const seriesInfo = getSeriesInfo(stats.totalCheckins);

  if (stats.totalCheckins === 0) {
    return `你還沒有打過卡！\n輸入「打卡」開始你的第一天 🌙`;
  }

  let msg = `📊 ${displayName} 的紀錄\n`;
  msg += `━━━━━━━━━━━━━━\n\n`;
  msg += `🔥 目前連續：${stats.currentStreak} 天\n`;
  msg += `📅 累積打卡：${stats.totalCheckins} 天\n`;
  msg += `🏅 最長連續：${stats.maxStreak} 天\n`;
  msg += `📦 解鎖系列：Series ${seriesInfo.current}\n`;

  if (seriesInfo.next) {
    const remaining = seriesInfo.nextAt - stats.totalCheckins;
    msg += `\n再 ${remaining} 天解鎖 Series ${seriesInfo.next} ✨`;
  } else {
    msg += `\n🎉 全系列已解鎖！`;
  }

  if (!stats.hasTodayCheckin) {
    msg += `\n\n⚠️ 今天還沒打卡，快去輸入「打卡」！`;
  }

  return msg;
}

// 處理「鼓勵」或「快撐不住」指令
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
  
  let reply = `💪 晚安嘴巴說：\n\n${msg}`;
  
  if (stats.currentStreak > 0) {
    reply += `\n\n你已經連續 ${stats.currentStreak} 天了，\n不要斷掉！🔥`;
  }

  return reply;
}

// 處理「help」指令
function handleHelp() {
  return `👋 我是晚安嘴巴\n十元醫師的戒宵夜助手\n\n可用指令：\n\n📌 打卡\n今天沒吃宵夜，打個卡！\n\n🎴 抽卡\n每天抽一張愛自己小卡\n\n📊 我的紀錄\n查看你的連續天數\n\n💪 鼓勵\n快撐不住的時候叫我\n\n━━━━━━━━━━━━━━\n堅持最難的不是第一天，\n是第三天。\n\n今晚，別吃。🌙`;
}

// 處理歡迎新用戶
function handleWelcome(displayName) {
  return `嗨 ${displayName}！我是晚安嘴巴 🌙\n\n十元醫師叫我來盯你\n晚上不要亂吃。\n\n只要做到一件事：\n今晚，別吃宵夜。\n\n─────────────\n輸入「打卡」開始第一天\n輸入「help」看全部指令\n─────────────\n\n不用節食，不用極端，\n先撐過今晚這一關。🙂`;
}

// 主要訊息處理器
async function handleMessage(event, client) {
  const userId = event.source.userId;
  const text = event.message.text?.trim() || '';

  // 取得用戶名字
  let displayName = '朋友';
  try {
    const profile = await client.getProfile(userId);
    displayName = profile.displayName;
  } catch (e) {
    // 群組裡可能拿不到，不影響功能
  }

  let replyText = '';

  const keywords = {
    checkin: ['打卡', '報到', '今天打卡', '簽到'],
    draw: ['抽卡', '抽', '今天抽卡'],
    record: ['我的紀錄', '紀錄', '查詢', '幾天了'],
    encourage: ['鼓勵', '快撐不住', '好想吃', '想吃宵夜', '撐不住了', '加油'],
    help: ['help', 'Help', 'HELP', '說明', '指令', '怎麼用', '怎麼玩'],
  };

  if (keywords.checkin.some(k => text.includes(k))) {
    replyText = await handleCheckin(userId, displayName);
  } else if (keywords.draw.some(k => text.includes(k))) {
    replyText = await handleDraw(userId, displayName);
  } else if (keywords.record.some(k => text.includes(k))) {
    replyText = await handleRecord(userId, displayName);
  } else if (keywords.encourage.some(k => text.includes(k))) {
    replyText = await handleEncourage(userId, displayName);
  } else if (keywords.help.some(k => text.includes(k))) {
    replyText = handleHelp();
  } else {
    // 預設回覆（不要太多，避免打擾群組）
    replyText = `輸入「help」看全部指令 🙂\n\n或者直接說：\n「打卡」「抽卡」「我的紀錄」「鼓勵」`;
  }

  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}

// 處理加好友事件
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
