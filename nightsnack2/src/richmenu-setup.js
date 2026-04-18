require('dotenv').config();

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

async function createRichMenu() {
  const body = {
    size: { width: 2500, height: 1686 },
    selected: true,
    name: '宵夜掰掰選單',
    chatBarText: '今晚別吃 🌙',
    areas: [
      { bounds: { x: 0,    y: 0,    width: 833, height: 843 }, action: { type: 'message', text: '今晚開始' } },
      { bounds: { x: 833,  y: 0,    width: 834, height: 843 }, action: { type: 'message', text: '抽卡' } },
      { bounds: { x: 1667, y: 0,    width: 833, height: 843 }, action: { type: 'message', text: '我的紀錄' } },
      { bounds: { x: 0,    y: 843,  width: 833, height: 843 }, action: { type: 'message', text: '鼓勵我' } },
      { bounds: { x: 833,  y: 843,  width: 834, height: 843 }, action: { type: 'message', text: '我破功了' } },
      { bounds: { x: 1667, y: 843,  width: 833, height: 843 }, action: { type: 'message', text: '十元醫師小教室' } },
    ],
  };

  const res = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.richMenuId) {
    console.error('❌ 建立失敗：', data);
    process.exit(1);
  }

  console.log('✅ Rich Menu 建立成功，ID：', data.richMenuId);
  return data.richMenuId;
}

async function uploadImage(richMenuId) {
  const fs = require('fs');
  const path = require('path');
  const imagePath = path.join(__dirname, '..', 'richmenu.png');

  if (!fs.existsSync(imagePath)) {
    console.error('❌ 找不到 richmenu.png，請放在專案根目錄');
    process.exit(1);
  }

  const image = fs.readFileSync(imagePath);
  const res = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'image/png',
    },
    body: image,
  });

  if (res.status !== 200) {
    console.error('❌ 上傳失敗：', await res.text());
    process.exit(1);
  }
  console.log('✅ 圖片上傳成功');
}

async function setDefault(richMenuId) {
  await fetch(`https://api.line.me/v2/bot/richmenu/default`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ richMenuId }),
  });
  console.log('✅ 已設為預設選單');
}

async function main() {
  console.log('🌙 設定 Rich Menu...\n');
  const id = await createRichMenu();
  await uploadImage(id);
  await setDefault(id);
  console.log('\n🎉 完成！');
}

main();
