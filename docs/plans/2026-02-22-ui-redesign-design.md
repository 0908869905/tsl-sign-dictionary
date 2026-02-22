# UI Redesign: 清新文青風 (墨與松)

> Designed by Gemini 3.1 Pro + Claude Opus 4.6
> Date: 2026-02-22

## 配色方案：墨與松 (Ink & Pine)

| 角色 | 色碼 | Tailwind |
|------|------|----------|
| Primary | `#09090B` | `zinc-950` |
| Secondary | `#71717A` | `zinc-500` |
| Background | `#FFFFFF` | `white` |
| Text | `#27272A` | `zinc-800` |
| Accent | `#2F4F4F` | custom `accent` |
| Border | `#E4E4E7` | `zinc-200` |
| Card | `#FAFAFA` | `neutral-50` |

## 字體系統

- **標題 (Serif)**: Noto Serif TC + Lora
- **內文 (Sans)**: Noto Sans TC + Inter
- **等寬**: JetBrains Mono (詞性標籤用)

### 字體層級

| 層級 | Tailwind |
|------|----------|
| H1 | `font-serif text-4xl md:text-5xl tracking-tight leading-tight` |
| H2 | `font-serif text-2xl md:text-3xl tracking-tight leading-snug` |
| H3 | `font-sans text-lg font-medium tracking-wide` |
| Body | `font-sans text-base leading-[1.8] tracking-[0.02em]` |
| Caption | `font-sans text-sm text-secondary` |

## 元件設計

### Header
- 極簡白底，無陰影，僅底部 1px 細線
- `bg-white border-b border-zinc-200 h-16 sticky top-0 z-50`
- Logo 用 Serif 字體，不用圖標

### SearchBar
- 寬大、大器，搜尋 icon 融入框內
- `border border-zinc-200 rounded-md py-4 pl-12 pr-4 text-lg`
- `focus:border-accent focus:ring-1 focus:ring-accent`
- 捨棄實體搜尋按鈕，Enter 送出

### VideoCard
- 平扁卡片，無陰影，hover 時邊框變強調色
- `bg-card border border-zinc-200 rounded-md overflow-hidden group`
- `hover:border-accent transition-colors`
- 功能鍵 hover 才浮現

### Category Tabs
- Medium 風格底線切換，非藥丸按鈕
- Active: `border-b-2 border-accent text-primary font-medium`
- Inactive: `border-b-2 border-transparent text-secondary hover:text-primary`

### Quick Tags
- 字典索引風格，純白底線框
- `border border-zinc-200 bg-transparent px-3 py-1.5 rounded text-sm`
- `hover:text-accent hover:border-accent transition-all`

### Footer
- 大面積留白，一條橫線 + 簡單版權
- `mt-24 pt-8 border-t border-zinc-200 text-sm text-secondary pb-12`

### 空狀態
- 大字 Serif「查無相符詞彙」+ Quick Tags 建議

## 佈局

- 最大寬度: `max-w-5xl` (1024px)
- Section 間距: `py-16` 或 `py-24`
- Grid: Mobile 1 欄 / Tablet 2 欄 / Desktop 2-3 欄
- 響應式: sm:640px / md:768px / lg:1024px

## 獨特設計元素

1. **詞典式排版**: 搜尋結果旁加 `[名詞]` 等詞性標籤
2. **底線延展動畫**: hover 底線從左到右畫出
3. **Swiss Design 細線分割**: 貫穿螢幕的 1px 分隔線

## 實作清單

1. [ ] 更新 Google Fonts (加入 Noto Serif TC, Lora, Inter)
2. [ ] 配置 Tailwind 自定義色彩和字體
3. [ ] 重寫 Header 元件
4. [ ] 重寫 SearchBar 元件
5. [ ] 重寫 VideoCard 元件
6. [ ] 更新 App.tsx 佈局和 Hero Section
7. [ ] 更新 Category Tabs 和 Quick Tags
8. [ ] 重寫 Footer 元件
9. [ ] 加入底線延展動畫 CSS
10. [ ] 加入詞典式排版細節
11. [ ] 加入 Swiss Design 細線分割元素
12. [ ] 響應式測試
