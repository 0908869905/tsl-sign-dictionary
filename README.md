<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 台灣手語影音辭典（TSL Sign Dictionary）

> 台灣手語在 2019 年成為國家語言，但聽障朋友想查「疫苗接種」的手語怎麼打，幾乎沒有工具。本系統把疾管署記者會的手語翻譯影像變成可檢索的語料庫：**輸入口語詞 → 直接跳到影片中手譯員打出該詞的秒數**，支援 0.5–2 倍速、循環播放與放大，方便反覆觀看手語動作細節。
>
> 🌐 **上線運作中**：https://signlanguage-tw.vercel.app

| | |
|---|---|
| 作者 | 李昌侑（Rick Lee）— 系統開發（爬蟲／前端／資料庫）全部獨立完成；團隊分工為組員負責報告與資料整理 |
| 期間 | 2025/11 – 2026/02（46 commits） |
| 成果 | 校內專題研究競賽初賽 **特優**（2026/1）・班級科展 電腦與資訊學科 **特優**（2026/4） |
| 規模 | 約 3,900 行；同義詞擴充 59 組根詞／287 擴充詞；Python 爬蟲（yt-dlp＋字幕＋Whisper）→ Supabase 全文檢索 |

**開發方式（AI 協作聲明）**：本專案以「與 AI 結對開發」完成：問題定義、架構設計、實驗設計與驗證由我負責，程式碼由我與 AI（Claude Code）協作產出；每個模組做什麼、為什麼選這個方案、哪裡會失效，由我判斷並負責。`PROGRESS.md`／`FINDINGS.md`／`ERROR.md` 為開發期間的真實工作紀錄。

**相關專案**：[科展・電腦視覺計分](https://github.com/0908869905/scoring-analyzer) ・ [影像標註平台](https://github.com/0908869905/frc-train-review) ・ [偵察 App](https://github.com/0908869905/frc-scouting-pass) ・ [偵察掃描與 OPR](https://github.com/0908869905/frc-scout-scanner) ・ [報帳系統](https://github.com/0908869905/frc-expense-money) ・ [台灣手語影音辭典](https://github.com/0908869905/tsl-sign-dictionary) ・ [園遊會點餐系統](https://github.com/0908869905/ordering-system)

---

# 台灣手語語料庫搜尋系統 (TSL Corpus Search)（使用說明）

一個可搜尋疾管署記者會手譯員使用的台灣手語詞彙的網頁應用程式。

🌐 **線上版本**: [https://signlanguage-tw.vercel.app](https://signlanguage-tw.vercel.app)

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
