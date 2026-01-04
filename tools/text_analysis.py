"""
字幕資料清洗與斷詞分析工具
使用 Pandas 進行資料清洗，Jieba 進行中文斷詞
"""

import re
import os

# ===== 1. 資料載入與清洗 (Pandas) =====
try:
    import pandas as pd
except ImportError:
    print("請安裝 pandas: pip install pandas")
    exit(1)

def load_from_typescript(ts_path: str) -> pd.DataFrame:
    """從 localData.ts 提取字幕資料"""
    with open(ts_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 正則匹配 videoId 和 rawText
    pattern = r'videoId:\s*"([^"]+)".*?rawText:\s*`([^`]+)`'
    matches = re.findall(pattern, content, re.DOTALL)
    
    data = [{"video_id": vid, "transcript": text.strip()} for vid, text in matches]
    return pd.DataFrame(data)

def clean_transcript(raw: str) -> str:
    """移除時間戳記，保留純文字"""
    lines = raw.split("\n")
    return " ".join([re.sub(r"^\d+:\d+\s*", "", line) for line in lines if line.strip()])


# ===== 2. 中文斷詞 (Jieba) =====
try:
    import jieba
    from collections import Counter
except ImportError:
    print("請安裝 jieba: pip install jieba")
    exit(1)

# 新增專業詞彙
for word in ["次世代疫苗", "快篩陽性", "莫德納", "BNT", "Paxlovid"]:
    jieba.add_word(word)

STOPWORDS = {"的", "是", "在", "了", "有", "就", "不", "也", "這", "那", "我們", "這個"}

def segment_and_count(texts: list) -> Counter:
    """斷詞並統計詞頻"""
    all_words = []
    for text in texts:
        tokens = jieba.cut(text)
        filtered = [w for w in tokens if w not in STOPWORDS and len(w) > 1]
        all_words.extend(filtered)
    return Counter(all_words)


# ===== 主程式 =====
if __name__ == "__main__":
    ts_path = os.path.join(os.path.dirname(__file__), '..', 'services', 'localData.ts')
    
    print("=" * 40)
    print("字幕資料清洗與斷詞分析")
    print("=" * 40)
    
    # 1. 載入與清洗
    df = load_from_typescript(ts_path)
    df["clean_text"] = df["transcript"].apply(clean_transcript)
    print(f"\n✓ 載入 {len(df)} 部影片字幕")
    
    # 2. 斷詞與詞頻
    word_freq = segment_and_count(df["clean_text"].tolist())
    
    # 3. 輸出 TOP 15
    print("\n【高頻詞彙 TOP 15】")
    for word, freq in word_freq.most_common(15):
        print(f"  {word}: {freq}")
