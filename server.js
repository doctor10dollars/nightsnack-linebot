require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const { handleMessage, handleFollow } = require('./handlers');

// 啟動 scheduler（整合在同一個 process）
require('./scheduler');

const app = express();

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  res.status(200).send('OK');

  const events = req.body.events;
  for (const event of events) {
    try {
      if (event.type === 'message' && event.message.type === 'text') {
        await handleMessage(event, client);
      } else if (event.type === 'follow') {
        await handleFollow(event, client);
      }
    } catch (err) {
      console.error('Event handling error:', err.message);
    }
  }
});

app.get('/', (req, res) => {
  res.send('🌙 宵夜掰掰 Bot 運行中');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌙 宵夜掰掰 Bot 啟動！Port: ${PORT}`);
});
