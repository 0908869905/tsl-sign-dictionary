<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 台灣手語語料庫搜尋系統 (TSL Corpus Search)

一個可搜尋疾管署記者會手譯員使用的台灣手語詞彙的網頁應用程式。

🌐 **線上版本**: [https://你的-vercel-url.vercel.app](https://你的-vercel-url.vercel.app)

---

## ✨ 功能特色

- **全文搜尋** - 搜尋疾管署直播影片字幕中的關鍵詞
- **時間戳跳轉** - 點擊搜尋結果直接跳至影片對應時間點
- **書籤收藏** - 登入後可雲端同步收藏的詞彙
- **分類篩選** - 依「醫學」或「日常」分類過濾結果
- **多語言支援** - 中文/英文介面切換
- **使用者回饋** - 整合意見回饋功能

---

## 🛠️ 技術棧

| 類別 | 技術 |
|------|------|
| 前端框架 | React + TypeScript |
| 樣式 | TailwindCSS |
| 建構工具 | Vite |
| 後端 | Supabase (資料庫 + 認證) |
| 字幕抓取 | Python (yt-dlp + youtube-transcript-api + Whisper) |

---

## 📁 專案結構

```
手語/
├── App.tsx                 # 主應用程式元件
├── components/             # React UI 元件
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SearchBar.tsx
│   ├── VideoCard.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── contexts/               # React Context (語言、認證)
├── services/               # API 服務層
│   ├── supabase.ts         # Supabase 客戶端
│   ├── supabaseData.ts     # 資料載入
│   └── localData.ts        # 本地搜尋邏輯
├── tools/
│   └── cdc_subtitle_crawler/
│       ├── main.py         # 字幕爬蟲主程式
│       └── requirements.txt
└── ...
```

---

## 🚀 本地開發

**前置需求:** Node.js 18+

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數 (複製並填寫 .env)
cp .env.example .env

# 3. 啟動開發伺服器
npm run dev
```

---

## 🔧 字幕爬蟲工具

位於 `tools/cdc_subtitle_crawler/`，用於抓取疾管署 YouTube 頻道的直播字幕。

```bash
# 安裝 Python 依賴
pip install -r tools/cdc_subtitle_crawler/requirements.txt

# 執行爬蟲 (自動上傳到 Supabase)
python tools/cdc_subtitle_crawler/main.py
```

**功能:**
- 自動抓取 `@taiwancdc` 頻道的直播影片
- 優先使用 YouTube 字幕，無字幕時使用 Whisper 語音辨識
- 自動去重，跳過已存在於 Supabase 的影片

---

## 📊 Supabase 資料表

| 表格 | 說明 |
|------|------|
| `transcripts` | 影片字幕資料 (video_id, title, date, raw_text) |
| `bookmarks` | 使用者書籤 (user_id, video_id, video_data) |
| `feedback` | 使用者回饋 |

---

## 📄 授權

MIT License
