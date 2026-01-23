# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

台灣手語語料庫搜尋系統 (TSL Corpus Search) - 一個可搜尋疾管署記者會手譯員使用的台灣手語詞彙的網頁應用程式。

## Development Commands

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構生產版本
npm run build

# 預覽生產版本
npm run preview
```

### Python 字幕爬蟲工具

```bash
# 安裝 Python 依賴
pip install -r tools/cdc_subtitle_crawler/requirements.txt

# 執行爬蟲 (自動上傳到 Supabase)
python tools/cdc_subtitle_crawler/main.py
```

## Architecture

### Frontend (React + TypeScript + Vite)

- **進入點**: `index.tsx` -> `App.tsx`
- **路由**: 使用 `HashRouter` (react-router-dom)
- **狀態管理**: React Context
  - `AuthContext`: 處理 Supabase 認證 (signIn, signUp, signOut)
  - `LanguageContext`: 中英文切換，翻譯在 `constants.ts` 的 `TRANSLATIONS`

### Data Flow

1. **啟動時預載**: `App.tsx` 的 `useEffect` 呼叫 `loadTranscriptsFromSupabase()`
2. **字幕資料快取**: `services/supabaseData.ts` 將資料存在記憶體
3. **本地搜尋**: `services/localData.ts` 的 `checkLocalData()` 在前端進行全文搜尋
4. **同義詞擴展**: `localData.ts` 內的 `SYNONYM_MAP` 自動擴展搜尋詞

### Key Services

| 檔案 | 功能 |
|------|------|
| `services/supabase.ts` | Supabase 客戶端初始化 |
| `services/supabaseData.ts` | 從 Supabase 預載字幕到記憶體快取 |
| `services/localData.ts` | 本地全文搜尋、同義詞映射、分類邏輯 |

### Supabase Tables

- `transcripts`: 字幕資料 (video_id, title, date, raw_text)
- `bookmarks`: 使用者書籤 (user_id, video_id, video_data)
- `feedback`: 使用者回饋
- `profiles`: 使用者個人資料

### Environment Variables

需要在 `.env` 設定：
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Code Patterns

### VideoResult 結構 (types.ts)

搜尋結果的核心資料結構，包含 `youtubeId`, `timestamp`, `transcriptSnippet`, `category` 等欄位。

### 分類邏輯

搜尋結果分為 `medical` 或 `daily` 兩類，由 `localData.ts` 的 `DAILY_LIFE_KEYWORDS` 判斷。

### 書籤同步

- 未登入：存在 localStorage (`tsl_bookmarks`)
- 登入後：自動同步本地書籤到 Supabase，然後清除本地
