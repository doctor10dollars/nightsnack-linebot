# 🌙 晚安嘴巴 LINE Bot
## 今晚別吃｜宵夜掰掰

> 十元醫師的戒宵夜陪跑機器人
> Certified by 十元醫師

---

## 功能

| 指令 | 功能 |
|------|------|
| 打卡 / 報到 | 記錄今天沒吃宵夜 |
| 抽卡 | 抽一張愛自己小卡（每天限一次）|
| 我的紀錄 | 查看連續天數、累積天數 |
| 鼓勵 / 快撐不住 | 得到即時鼓勵 |
| help | 查看所有指令 |

## 小卡系統

- **Series I**（預設解鎖）：Begin to love myself
- **Series II**（累積10天解鎖）：I am enough
- **Series III**（累積20天解鎖）：Be myself
- **限量版 ∞**：每個系列都有，隨機出現，機率約14%

---

## 部署步驟

### 第一步：準備 .env 環境變數

複製 `.env.example` 為 `.env`，填入你的資料：

```
LINE_CHANNEL_ACCESS_TOKEN=你的token
LINE_CHANNEL_SECRET=你的secret
SUPABASE_URL=https://beehunlnodygwdmxrdbb.supabase.co
SUPABASE_ANON_KEY=你的anon_key
```

### 第二步：部署到 Railway

1. 去 railway.app 用 GitHub 登入
2. 新建專案 → 從 GitHub repo 部署
3. 在 Variables 貼入四個環境變數
4. 部署完成後拿到網址（例如：https://nightsnack.railway.app）

### 第三步：設定 LINE Webhook

1. 去 LINE Developers
2. Messaging API → Webhook URL
3. 填入：`https://你的railway網址/webhook`
4. 按 Verify，應該顯示 Success

---

## Supabase 資料表

已在 Supabase 建好的資料表：
- `users`：用戶資料
- `checkins`：打卡紀錄
- `cards`：小卡內容（目前用程式碼管理）
- `draws`：抽卡紀錄

---

## 成就系統

| 連續天數 | 成就 |
|---------|------|
| 3天 | 🥉 初心者 |
| 7天 | 🥈 一週勇士 |
| 14天 | 🥇 兩週守門員 |
| 21天 | 🏆 21天達人 |
| 30天 | 👑 宵夜終結者 |

---

Made with 🌙 by 十元醫師
