"""
疾管署直播字幕爬蟲工具
抓取 @taiwancdc YouTube 頻道中所有「直播」影片的字幕。
自動跳過 Supabase 資料庫中已存在的影片。
"""

import json
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime
from typing import Optional, Set

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
except ImportError:
    print("請先安裝依賴: pip install -r requirements.txt")
    sys.exit(1)




CHANNEL_URL = "https://www.youtube.com/@taiwancdc/streams"
LIVE_KEYWORDS = ["直播", "記者會", "live"]  # 用於過濾直播影片的關鍵字
OUTPUT_FILE = "cdc_livestream_subtitles.json"

# Supabase 設定
SUPABASE_URL = "https://xbqupnpwmevtsqgfedtg.supabase.co"
SUPABASE_KEY = "***REMOVED***"






def get_existing_video_ids() -> Set[str]:
    """
    從 Supabase 讀取已存在的 video_id 列表，用於去重。
    """
    print("檢查 Supabase 中已存在的影片...")
    
    url = f"{SUPABASE_URL}/rest/v1/transcripts?select=video_id"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            existing_ids = {item["video_id"] for item in data}
            print(f"  已存在 {len(existing_ids)} 部影片，將跳過這些。")
            return existing_ids
    except Exception as e:
        print(f"  警告: 無法讀取 Supabase ({e})，將不進行去重。")
        return set()


def get_channel_videos() -> list[dict]:
    """
    使用 yt-dlp 抓取頻道所有影片的基本資訊。
    返回包含 id, title, url 的字典列表。
    """
    print(f"正在抓取頻道影片列表: {CHANNEL_URL}")
    
    cmd = [
        "yt-dlp",
        "--flat-playlist",      # 不下載，只列出
        "--dump-json",          # 輸出 JSON
        "--no-warnings",
        CHANNEL_URL
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, encoding='utf-8')
    except FileNotFoundError:
        print("錯誤: 找不到 yt-dlp，請先安裝: pip install yt-dlp")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"錯誤: yt-dlp 執行失敗: {e.stderr}")
        sys.exit(1)
    
    videos = []
    for line in result.stdout.strip().split('\n'):
        if line:
            try:
                data = json.loads(line)
                videos.append({
                    "id": data.get("id"),
                    "title": data.get("title", ""),
                    "url": f"https://www.youtube.com/watch?v={data.get('id')}"
                })
            except json.JSONDecodeError:
                continue
    
    print(f"共找到 {len(videos)} 部影片")
    return videos


def filter_livestreams(videos: list[dict]) -> list[dict]:
    """
    過濾出標題包含直播關鍵字的影片。
    """
    livestreams = []
    for video in videos:
        title_lower = video["title"].lower()
        if any(keyword.lower() in title_lower for keyword in LIVE_KEYWORDS):
            livestreams.append(video)
    
    print(f"過濾後共 {len(livestreams)} 部直播影片")
    return livestreams


def get_transcript(video_id: str) -> Optional[str]:
    """
    取得影片字幕，優先人工字幕，備用自動生成。
    返回格式：每行為 "分:秒 字幕文字"，例如 "7:43 好 我們各位好朋友們"
    """
    try:
        # 新版 API: 實例化後調用方法
        ytt_api = YouTubeTranscriptApi()
        
        # 取得所有可用字幕列表
        transcript_list = ytt_api.list(video_id)
        
        transcript = None
        
        # 優先嘗試人工上傳的繁體中文字幕
        try:
            transcript = transcript_list.find_manually_created_transcript(['zh-TW', 'zh-Hant', 'zh'])
        except NoTranscriptFound:
            pass
        
        # 備用：自動生成的字幕
        if not transcript:
            try:
                transcript = transcript_list.find_generated_transcript(['zh-TW', 'zh-Hant', 'zh', 'zh-Hans'])
            except NoTranscriptFound:
                pass
        
        if transcript:
            fetched = transcript.fetch()
            # 格式化為 "分:秒 文字" 格式，與 localData.ts 的格式一致
            lines = []
            for snippet in fetched:
                start_seconds = int(snippet.start)
                minutes = start_seconds // 60
                seconds = start_seconds % 60
                text = snippet.text.replace("\n", " ").strip()
                if text:
                    lines.append(f"{minutes}:{seconds:02d} {text}")
            return "\n".join(lines)
        
        return None
        
    except TranscriptsDisabled:
        return None
    except Exception as e:
        print(f"  警告: 無法取得字幕 ({video_id}): {e}")
        return None


def upload_to_supabase(video_id: str, title: str, raw_text: str) -> bool:
    """
    將字幕資料上傳到 Supabase transcripts 表。
    """
    # 從標題提取日期 (格式: YYYY/MM/DD 或 YYYYMMDD)
    import re
    date_match = re.search(r'(\d{4})[/\-]?(\d{2})[/\-]?(\d{2})', title)
    if date_match:
        date_str = f"{date_match.group(1)}-{date_match.group(2)}-{date_match.group(3)}"
    else:
        date_str = datetime.now().strftime("%Y-%m-%d")
    
    data = {
        "video_id": video_id,
        "title": title,
        "date": date_str,
        "raw_text": raw_text,
        "source": "cdc_crawler"
    }
    
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
            print(f"    ⚠ 已存在於資料庫")
            return True
        print(f"    ✗ 上傳失敗: {e.code} {e.reason}")
        return False
    except Exception as e:
        print(f"    ✗ 上傳失敗: {e}")
        return False


def main():
    print("=" * 50)
    print("疾管署直播字幕爬蟲工具")
    print("=" * 50)
    
    # 0. 先取得已存在的影片 ID (去重用)
    existing_ids = get_existing_video_ids()
    
    # 1. 取得頻道所有影片
    all_videos = get_channel_videos()
    
    # 2. 過濾直播影片
    livestreams = filter_livestreams(all_videos)
    
    if not livestreams:
        print("找不到任何直播影片。")
        return
    
    # 2.5 去重：排除已存在的影片
    new_livestreams = [v for v in livestreams if v["id"] not in existing_ids]
    skipped_count = len(livestreams) - len(new_livestreams)
    
    if skipped_count > 0:
        print(f"跳過 {skipped_count} 部已存在的影片")
    
    if not new_livestreams:
        print("所有直播影片都已存在，無需處理。")
        return
    
    print(f"將處理 {len(new_livestreams)} 部新影片")
    
    # 3. 下載字幕
    results = []
    uploaded_count = 0
    import time
    import random
    
    for i, video in enumerate(new_livestreams, 1):
        print(f"[{i}/{len(new_livestreams)}] 處理: {video['title'][:50]}...")
        
        # 加入隨機延遲避免被 YouTube 限速 (2-5 秒)
        delay = random.uniform(2, 5)
        print(f"  ⏳ 等待 {delay:.1f} 秒...")
        time.sleep(delay)
        
        # 嘗試取得 YouTube 字幕 (最多重試 3 次)
        transcript = None
        for attempt in range(3):
            try:
                transcript = get_transcript(video["id"])
                break
            except Exception as e:
                print(f"  ⚠ 嘗試 {attempt + 1}/3 失敗: {e}")
                if attempt < 2:
                    time.sleep(3)  # 重試前等待
        
        results.append({
            "title": video["title"],
            "url": video["url"],
            "video_id": video["id"],
            "transcript": transcript,
            "has_transcript": transcript is not None
        })
        
        if transcript:
            print(f"  ✓ 字幕長度: {len(transcript)} 字元")
            # 自動上傳到 Supabase
            if upload_to_supabase(video["id"], video["title"], transcript):
                uploaded_count += 1
                print(f"    ✓ 已上傳至 Supabase")
        else:
            print(f"  ✗ 無法取得字幕")
    
    # 4. 輸出結果
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # 統計
    with_transcript = sum(1 for r in results if r["has_transcript"])
    print("\n" + "=" * 50)
    print(f"完成! 共處理 {len(results)} 部直播影片")
    print(f"  - 有字幕: {with_transcript} 部")
    print(f"  - 無字幕: {len(results) - with_transcript} 部")
    print(f"  - 已上傳至 Supabase: {uploaded_count} 部")
    print(f"輸出檔案: {OUTPUT_FILE}")



if __name__ == "__main__":
    main()
