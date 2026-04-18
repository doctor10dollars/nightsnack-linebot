require('dotenv').config();
const cron = require('node-cron');
const line = require('@line/bot-sdk');
const db = require('./db');
const { push, textMsg } = require('./line');
const {
  randomPick,
  push19Messages,
  push2130ActiveMessages,
  push2130IdleMessages,
} = require('./messages');
const { T } = require('./handlers');

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// 19:00 推播給所有人
cron.schedule('0 19 * * *', async () => {
  console.log('🌙 [19:00] 推播開始...');
  const users = await db.getAllUsers();

  for (const user of users) {
    try {
      await push(client, user.line_user_id, [
        textMsg(randomPick(push19Messages), T.START, T.CRAVING),
      ]);
    } catch (e) {
      console.error(`推播失敗 ${user.line_user_id}:`, e.message);
    }
  }
  console.log(`✅ [19:00] 推播完成，共 ${users.length} 人`);
}, { timezone: 'Asia/Taipei' });

// 21:30 推播（依狀態分流）
cron.schedule('30 21 * * *', async () => {
  console.log('🌙 [21:30] 推播開始...');
  const users = await db.getAllUsers();

  for (const user of users) {
    try {
      const todayStatus = await db.getTodayStatus(user.id);
      const status = todayStatus?.status || 'idle';

      if (status === 'success' || status === 'break') continue;

      let msg;
      if (status === 'started' || status === 'struggling') {
        // 給掙扎中的人：我還在撐、我有點想吃、我破功了
        msg = textMsg(
          randomPick(push2130ActiveMessages),
          T.STILL_HERE, T.CRAVING, T.BREAK
        );
      } else {
        // idle 輕提醒
        msg = textMsg(randomPick(push2130IdleMessages), T.START, T.ENCOURAGE);
      }

      await push(client, user.line_user_id, [msg]);
    } catch (e) {
      console.error(`推播失敗 ${user.line_user_id}:`, e.message);
    }
  }
  console.log(`✅ [21:30] 推播完成`);
}, { timezone: 'Asia/Taipei' });

console.log('⏰ Scheduler 啟動，等待推播時間...');
