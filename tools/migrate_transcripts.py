"""
遷移腳本：將 localData.ts 的字幕資料寫入 Supabase transcripts 表格
使用 urllib (無需額外套件)
"""

import re
import os
import json

try:  # 可選：若安裝 python-dotenv，讀取專案根目錄的 .env
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
import urllib.request
import urllib.error

# Supabase 設定
SUPABASE_URL = "https://xbqupnpwmevtsqgfedtg.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")  # 從環境變數讀取，勿硬編碼

# 手動定義要遷移的資料 (從 localData.ts 提取)
TRANSCRIPTS_TO_MIGRATE = [
    {
        "video_id": "xlLcVJ4ny9A",
        "title": "2023/02/16 指揮中心記者會 (馬堡病毒/口罩鬆綁)",
        "date": "2023-02-16",
        "source": "manual"
    },
    {
        "video_id": "yS5PQhhz1AU",
        "title": "2023/03/30 指揮中心記者會 (BQ.1/XBB/疫苗效力)",
        "date": "2023-03-30",
        "source": "manual"
    },
    {
        "video_id": "OtCj_MvtsNM",
        "title": "2023/04/13 指揮中心記者會 (H3N8/幼兒疫苗/BA.2.75)",
        "date": "2023-04-13",
        "source": "manual"
    },
    {
        "video_id": "FHBYy2pAKA0",
        "title": "2023/04/20 指揮中心記者會 (XBB.1.16大角星/猴痘)",
        "date": "2023-04-20",
        "source": "manual"
    }
]

def extract_raw_text_from_ts(file_path: str) -> dict:
    """
    從 localData.ts 讀取並提取每個影片的 rawText
    返回 {video_id: raw_text} 的字典
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 使用正則表達式匹配每個 transcript 物件
    pattern = r'videoId:\s*"([^"]+)".*?rawText:\s*`([^`]+)`'
    matches = re.findall(pattern, content, re.DOTALL)
    
    result = {}
    for video_id, raw_text in matches:
        result[video_id] = raw_text.strip()
        print(f"  找到影片: {video_id} (字幕長度: {len(raw_text)} 字元)")
    
    return result


def upload_to_supabase(data: dict) -> bool:
    """使用 urllib 上傳資料到 Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/transcripts"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            return response.status in (200, 201)
    except urllib.error.HTTPError as e:
        if e.code == 409:  # Conflict - already exists
            print(f"    ⚠ 已存在於資料庫 (更新)")
            return True
        print(f"    ✗ 上傳失敗: {e.code} {e.reason}")
        return False
    except Exception as e:
        print(f"    ✗ 上傳失敗: {e}")
        return False


def main():
    print("=" * 50)
    print("字幕資料遷移至 Supabase (使用 urllib)")
    print("=" * 50)
    
    # 1. 讀取 localData.ts 的 rawText
    local_data_path = os.path.join(os.path.dirname(__file__), '..', 'services', 'localData.ts')
    local_data_path = os.path.abspath(local_data_path)
    
    print(f"\n讀取資料來源: {local_data_path}")
    raw_texts = extract_raw_text_from_ts(local_data_path)
    
    if not raw_texts:
        print("錯誤: 無法從 localData.ts 提取資料")
        return
    
    # 2. 逐筆寫入
    print(f"\n連接 Supabase: {SUPABASE_URL}")
    success_count = 0
    for item in TRANSCRIPTS_TO_MIGRATE:
        video_id = item["video_id"]
        raw_text = raw_texts.get(video_id)
        
        if not raw_text:
            print(f"  ⚠ 跳過 {video_id}: 找不到對應的字幕內容")
            continue
        
        data = {
            "video_id": video_id,
            "title": item["title"],
            "date": item["date"],
            "raw_text": raw_text,
            "source": item["source"]
        }
        
        print(f"  上傳: {item['title'][:40]}...")
        if upload_to_supabase(data):
            print(f"    ✓ 成功")
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"完成! 成功寫入 {success_count}/{len(TRANSCRIPTS_TO_MIGRATE)} 筆資料")


if __name__ == "__main__":
    main()
