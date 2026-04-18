const db = require('./db');
const { drawCard, getSeriesInfo, getTotalCardCount } = require('./cards');
const { reply, textMsg, imageMsg } = require('./line');
const {
  randomPick,
  startMessages,
  encouragementMessages,
  cravingMessages,
  stayWithMeMessages,
  waterMessages,
  stillCravingMessages,
  successMessages,
  breakMessages,
  restartTomorrowMessages,
  lessonMessages,
  newCardMessages,
  dupCardMessages,
} = require('./messages');

const MILESTONES = [
  { days: 3,  emoji: '🥉', title: '初心者' },
  { days: 7,  emoji: '🥈', title: '一週勇士' },
  { days: 14, emoji: '🥇', title: '兩週守門員' },
  { days: 21, emoji: '🏆', title: '21天達人' },
  { days: 30, emoji: '👑', title: '宵夜終結者' },
];

function getMilestone(streak) {
  return MILESTONES.find(m => streak === m.days) || null;
}

const T = {
  START:          '今晚開始',
  ENCOURAGE:      '撐不住了... 鼓勵我',
  RECORD:         '我沒吃宵夜的紀錄',
  CRAVING:        '我有點想吃',
  STAY:           '陪我一下',
  WATER:          '我去喝水',
  WATER_BACK:     '我回來了',
  STILL_CRAVING:  '還是想吃',
  SUCCESS:        '我撐住了',
  DRAW:           '抽今日愛自己小卡',
  BREAK:          '我... 破功了... 吃了',
  TOMORROW:       '明天再開始',
  MORE_ENCOURAGE: '再給我一句',
  AGAIN:          '再撐一下',
  LESSON:         '十元醫師小教室',
  AGAIN_DRAW:     '再抽一次',
  CHECKIN_LATER:  '晚點打卡',
  STILL_HERE:     '我還在撐',
  CHECKIN:        '今天沒吃宵夜打卡',
};

async function handleStart(event, client, userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  await db.setTodayStatus(user.id, 'started');
  await reply(client, event.replyToken, [
    textMsg(randomPick(startMessages), T.ENCOURAGE, T.CRAVING, T.CHECKIN_LATER),
  ]);
}

async function handleEncourage(event, client) {
  await reply(client, event.replyToken, [
    textMsg(randomPick(encouragementMessages), T.STILL_HERE, T.CRAVING, T.MORE_ENCOURAGE),
  ]);
}

async function handleCraving(event, client, userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const status = await db.getTodayStatus(user.id);
  if (!['success', 'break'].includes(status?.status)) {
    await db.setTodayStatus(user.id, 'struggling');
  }
  await reply(client, event.replyToken, [
    textMsg(randomPick(cravingMessages), T.STAY, T.WATER, T.DRAW, T.BREAK),
  ]);
}

async function handleStillCraving(event, client, userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const status = await db.getTodayStatus(user.id);
  if (!['success', 'break'].includes(status?.status)) {
    await db.setTodayStatus(user.id, 'struggling');
  }
  await reply(client, event.replyToken, [
    textMsg(randomPick(stillCravingMessages), T.DRAW, T.STAY, T.BREAK),
  ]);
}

async function handleStay(event, client) {
  await reply(client, event.replyToken, [
    textMsg(randomPick(stayWithMeMessages), T.AGAIN, T.DRAW, T.BREAK),
  ]);
}

async function handleWater(event, client) {
  await reply(client, event.replyToken, [
    textMsg(randomPick(waterMessages), T.WATER_BACK, T.SUCCESS, T.STILL_CRAVING),
  ]);
}

async function handleWaterBack(event, client) {
  await reply(client, event.replyToken, [
    textMsg('你回來了 🌙\n喝完水有好一點嗎？', T.SUCCESS, T.STILL_CRAVING, T.ENCOURAGE),
  ]);
}

async function handleSuccess(event, client, userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const todayStatus = await db.getTodayStatus(user.id);

  if (todayStatus?.status === 'success') {
    const stats = await db.getUserStats(user.id);
    await reply(client, event.replyToken, [
      textMsg(`✅ 今天已經記錄過了 🌙\n連續：${stats.current_streak} 天`, T.DRAW, T.RECORD, T.ENCOURAGE),
    ]);
    return;
  }

  if (todayStatus?.status === 'break') {
    await reply(client, event.replyToken, [
      textMsg('今天已經記錄破功了。\n沒關係，明天重新開始 🌙', T.ENCOURAGE, T.RECORD),
    ]);
    return;
  }

  const result = await db.doCheckin(user.id);
  await db.setTodayStatus(user.id, 'success');
  const stats = await db.getUserStats(user.id);
  const milestone = getMilestone(result.streak);
  const seriesInfo = getSeriesInfo(stats.total_checkins);

  let msg = randomPick(successMessages) + `\n\n連續：${result.streak} 天 🔥\n累積：${stats.total_checkins} 天`;
  if (milestone) msg += `\n\n${milestone.emoji} 成就達成！【${milestone.title}】`;
  if (seriesInfo.next) {
    msg += `\n\n再 ${seriesInfo.nextAt - stats.total_checkins} 天解鎖 Series ${seriesInfo.next} ✨`;
  } else {
    msg += `\n\n🎉 全系列已解鎖！`;
  }

  await reply(client, event.replyToken, [
    textMsg(msg, T.DRAW, T.RECORD, T.ENCOURAGE),
  ]);
}

async function handleDraw(event, client, userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const stats = await db.getUserStats(user.id);
  const alreadyDrew = await db.getTodayDraw(user.id);

  if (alreadyDrew) {
    await reply(client, event.replyToken, [
      textMsg('🎴 今天已經抽過卡了！\n明天再來拆包～', T.RECORD, T.ENCOURAGE),
    ]);
    return;
  }

  const card = drawCard(stats.total_checkins);
  await db.saveDraw(user.id, card.id);

  const { isNew } = await db.collectCard(user.id, card.id);

  const messages = [];
  if (card.imageUrl) messages.push(imageMsg(card.imageUrl));

  const cardStatus = isNew ? randomPick(newCardMessages) : randomPick(dupCardMessages);
  messages.push(textMsg(`🎴 ${card.id}\n${cardStatus}`, T.SUCCESS, T.RECORD, T.ENCOURAGE));

  await reply(client, event.replyToken, messages);
}

async function handleBreak(event, client, userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const result = await db.doBreak(user.id);

  if (result.alreadyBroke) {
    await reply(client, event.replyToken, [
      textMsg('今天已經記錄過破功了。\n明天重新開始 🌙', T.ENCOURAGE, T.RECORD),
    ]);
    return;
  }

  const stats = await db.getUserStats(user.id);
  await reply(client, event.replyToken, [
    textMsg(
      randomPick(breakMessages) + `\n\n累積天數：${stats.total_checkins} 天（保留）`,
      T.TOMORROW, T.ENCOURAGE, T.RECORD
    ),
  ]);
}

async function handleTomorrow(event, client) {
  await reply(client, event.replyToken, [
    textMsg(randomPick(restartTomorrowMessages), T.ENCOURAGE, T.RECORD),
  ]);
}

async function handleRecord(event, client, userId, displayName) {
  const user = await db.getOrCreateUser(userId, displayName);
  const stats = await db.getUserStats(user.id);
  const todayStatus = await db.getTodayStatus(user.id);
  const seriesInfo = getSeriesInfo(stats.total_checkins);
  const collectedCount = await db.getCollectedCardCount(user.id);
  const totalCards = getTotalCardCount(stats.total_checkins);

  const statusMap = {
    idle: '尚未開始',
    started: '今晚已開始 💪',
    struggling: '有點掙扎中... 加油',
    success: '今晚成功 ✅',
    break: '今晚破功 💔',
  };

  const statusText = statusMap[todayStatus?.status || 'idle'];

  const msg = `📊 ${displayName} 的紀錄
──────
今日狀態：${statusText}
🔥 連續天數：${stats.current_streak} 天
🏅 最長紀錄：${stats.max_streak} 天
📅 累積天數：${stats.total_checkins} 天
💔 破功次數：${stats.break_count} 次
📦 解鎖系列：Series ${seriesInfo.current}
🎴 蒐集卡片：${collectedCount} / ${totalCards} 張${seriesInfo.next ? `\n\n再 ${seriesInfo.nextAt - stats.total_checkins} 天解鎖 Series ${seriesInfo.next} ✨` : '\n\n🎉 全系列已解鎖！'}`;

  await reply(client, event.replyToken, [
    textMsg(msg, T.START, T.DRAW, T.ENCOURAGE),
  ]);
}

async function handleLesson(event, client) {
  await reply(client, event.replyToken, [
    textMsg(randomPick(lessonMessages), T.ENCOURAGE, T.START, T.SUCCESS),
  ]);
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

  switch (text) {
    case T.CHECKIN:
    case '打卡':                return handleSuccess(event, client, userId, displayName);
    case T.START:               return handleStart(event, client, userId, displayName);
    case T.ENCOURAGE:
    case T.MORE_ENCOURAGE:
    case T.AGAIN:
    case T.STILL_HERE:          return handleEncourage(event, client);
    case T.RECORD:              return handleRecord(event, client, userId, displayName);
    case T.CRAVING:             return handleCraving(event, client, userId, displayName);
    case T.STILL_CRAVING:       return handleStillCraving(event, client, userId, displayName);
    case T.STAY:                return handleStay(event, client);
    case T.WATER:               return handleWater(event, client);
    case T.WATER_BACK:          return handleWaterBack(event, client);
    case T.SUCCESS:
    case T.CHECKIN_LATER:       return handleSuccess(event, client, userId, displayName);
    case T.DRAW:
    case T.AGAIN_DRAW:          return handleDraw(event, client, userId, displayName);
    case T.BREAK:               return handleBreak(event, client, userId, displayName);
    case T.TOMORROW:            return handleTomorrow(event, client);
    case T.LESSON:              return handleLesson(event, client);
    default:
      await reply(client, replyToken, [
        textMsg('點下方選單就可以囉 🌙', T.START, T.ENCOURAGE, T.RECORD),
      ]);
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
}

module.exports = { handleMessage, handleFollow, T };
