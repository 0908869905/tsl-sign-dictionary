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


CHANNEL_URL = "https://www.youtube.com/@taiwancdc/videos"
LIVE_KEYWORDS = ["直播", "記者會", "live"]  # 用於過濾直播影片的關鍵字
OUTPUT_FILE = "cdc_livestream_subtitles.json"

# Supabase 設定
SUPABASE_URL = "https://wlmpsblaiuxwrllqutlp.supabase.co"
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
    """
    try:
        # 取得所有可用字幕列表
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
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
            # 將字幕片段合併為完整文字
            segments = transcript.fetch()
            full_text = " ".join([seg["text"] for seg in segments])
            return full_text
        
        return None
        
    except TranscriptsDisabled:
        return None
    except Exception as e:
        print(f"  警告: 無法取得字幕 ({video_id}): {e}")
        return None


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
    for i, video in enumerate(new_livestreams, 1):
        print(f"[{i}/{len(new_livestreams)}] 處理: {video['title'][:50]}...")
        
        transcript = get_transcript(video["id"])
        
        results.append({
            "title": video["title"],
            "url": video["url"],
            "video_id": video["id"],
            "transcript": transcript,
            "has_transcript": transcript is not None
        })
        
        if transcript:
            print(f"  ✓ 字幕長度: {len(transcript)} 字元")
        else:
            print(f"  ✗ 無可用字幕")
    
    # 4. 輸出結果
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # 統計
    with_transcript = sum(1 for r in results if r["has_transcript"])
    print("\n" + "=" * 50)
    print(f"完成! 共處理 {len(results)} 部直播影片")
    print(f"  - 有字幕: {with_transcript} 部")
    print(f"  - 無字幕: {len(results) - with_transcript} 部")
    print(f"輸出檔案: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
