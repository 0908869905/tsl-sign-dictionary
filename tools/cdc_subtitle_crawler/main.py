"""
疾管署直播字幕爬蟲工具 (含 WebShare 代理支援)
抓取 @taiwancdc YouTube 頻道中所有「直播」影片的字幕。
自動跳過 Supabase 資料庫中已存在的影片。
支援代理輪換，遇到 IP 封鎖時自動切換代理。
"""

import os
import json
import subprocess
import sys

try:  # 可選：若安裝 python-dotenv，讀取專案根目錄的 .env
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
import urllib.request
import urllib.error
import random
import time
from datetime import datetime
from typing import Optional, Set, List, Dict

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
    from youtube_transcript_api.proxies import WebshareProxyConfig
except ImportError:
    print("請先安裝依賴: pip install -r requirements.txt")
    sys.exit(1)


# ==================== 設定區 ====================
CHANNEL_URL = "https://www.youtube.com/@taiwancdc/streams"
LIVE_KEYWORDS = ["直播", "記者會", "live"]
OUTPUT_FILE = "cdc_livestream_subtitles.json"

# Supabase 設定
SUPABASE_URL = "https://xbqupnpwmevtsqgfedtg.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")  # 從環境變數讀取，勿硬編碼

# WebShare 代理設定
WEBSHARE_API_KEY = os.environ.get("WEBSHARE_API_KEY", "")
USE_PROXY = True  # 設為 False 可關閉代理

# 延遲設定 (秒)
MIN_DELAY = 3
MAX_DELAY = 6


# ==================== 代理管理 ====================
class ProxyManager:
    """管理 WebShare 代理輪換"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.proxies: List[Dict] = []
        self.current_index = 0
        self.failed_count = 0
        self.max_failures = 3  # 連續失敗次數超過此值則切換代理
        
    def fetch_proxies(self) -> bool:
        """從 WebShare API 取得代理列表"""
        print("正在從 WebShare 取得代理列表...")
        
        url = "https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page=1&page_size=100"
        headers = {
            "Authorization": f"Token {self.api_key}"
        }
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode('utf-8'))
                
            if "results" in data and len(data["results"]) > 0:
                self.proxies = data["results"]
                print(f"  ✓ 取得 {len(self.proxies)} 個代理")
                return True
            else:
                print("  ✗ 無可用代理")
                return False
                
        except Exception as e:
            print(f"  ✗ 取得代理失敗: {e}")
            return False
    
    def get_current_proxy(self) -> Optional[Dict]:
        """取得當前代理"""
        if not self.proxies:
            return None
        return self.proxies[self.current_index % len(self.proxies)]
    
    def get_proxy_config(self) -> Optional[WebshareProxyConfig]:
        """取得用於 youtube-transcript-api 的代理設定"""
        proxy = self.get_current_proxy()
        if not proxy:
            return None
        
        try:
            return WebshareProxyConfig(
                proxy_username=proxy.get("username"),
                proxy_password=proxy.get("password")
            )
        except Exception as e:
            print(f"  ⚠ 建立代理設定失敗: {e}")
            return None
    
    def rotate(self):
        """切換到下一個代理"""
        if self.proxies:
            old_index = self.current_index
            self.current_index = (self.current_index + 1) % len(self.proxies)
            self.failed_count = 0
            proxy = self.get_current_proxy()
            print(f"  🔄 切換代理: #{old_index + 1} → #{self.current_index + 1} ({proxy.get('proxy_address', 'N/A')})")
    
    def report_failure(self) -> bool:
        """回報失敗，返回是否應該切換代理"""
        self.failed_count += 1
        if self.failed_count >= self.max_failures:
            self.rotate()
            return True
        return False
    
    def report_success(self):
        """回報成功"""
        self.failed_count = 0


# 全域代理管理器
proxy_manager: Optional[ProxyManager] = None


def init_proxy():
    """初始化代理管理器"""
    global proxy_manager
    if USE_PROXY and WEBSHARE_API_KEY:
        proxy_manager = ProxyManager(WEBSHARE_API_KEY)
        if not proxy_manager.fetch_proxies():
            print("警告: 無法取得代理，將不使用代理")
            proxy_manager = None


# ==================== 資料庫操作 ====================
def get_existing_video_ids() -> Set[str]:
    """從 Supabase 讀取已存在的 video_id 列表"""
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


def upload_to_supabase(video_id: str, title: str, raw_text: str) -> bool:
    """將字幕資料上傳到 Supabase"""
    import re
    date_match = re.search(r'(\d{4})[/\-]?(\d{1,2})[/\-]?(\d{1,2})', title)
    if date_match:
        year, month, day = date_match.groups()
        date_str = f"{year}-{int(month):02d}-{int(day):02d}"
    else:
        date_str = datetime.now().strftime("%Y-%m-%d")
    
    url = f"{SUPABASE_URL}/rest/v1/transcripts"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    payload = json.dumps({
        "video_id": video_id,
        "title": title,
        "date": date_str,
        "raw_text": raw_text,
        "source": "cdc_crawler"
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            return response.status == 201
    except urllib.error.HTTPError as e:
        if e.code == 409:
            print(f"    ⚠ 影片已存在，跳過")
        else:
            print(f"    ✗ 上傳失敗: {e.code} {e.reason}")
        return False
    except Exception as e:
        print(f"    ✗ 上傳失敗: {e}")
        return False


# ==================== YouTube 操作 ====================
def get_channel_videos() -> List[Dict]:
    """使用 yt-dlp 抓取頻道影片列表"""
    print(f"正在抓取頻道影片列表: {CHANNEL_URL}")
    
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--dump-json",
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


def filter_livestreams(videos: List[Dict]) -> List[Dict]:
    """過濾出直播影片"""
    livestreams = []
    for video in videos:
        title_lower = video["title"].lower()
        if any(keyword.lower() in title_lower for keyword in LIVE_KEYWORDS):
            livestreams.append(video)
    
    print(f"過濾後共 {len(livestreams)} 部直播影片")
    return livestreams


def get_transcript(video_id: str) -> tuple[Optional[str], bool]:
    """
    取得影片字幕，支援代理
    返回: (transcript, is_ip_blocked)
    - transcript: 字幕內容或 None
    - is_ip_blocked: 是否因 IP 被封鎖而失敗
    """
    global proxy_manager
    
    try:
        # 建立 API 實例，使用代理
        if proxy_manager:
            proxy_config = proxy_manager.get_proxy_config()
            if proxy_config:
                try:
                    ytt_api = YouTubeTranscriptApi(proxy_config=proxy_config)
                except Exception as e:
                    print(f"  ⚠ 代理設定失敗，使用直連: {e}")
                    ytt_api = YouTubeTranscriptApi()
            else:
                ytt_api = YouTubeTranscriptApi()
        else:
            ytt_api = YouTubeTranscriptApi()
        
        transcript_list = ytt_api.list(video_id)
        
        transcript = None
        
        # 優先人工字幕
        try:
            transcript = transcript_list.find_manually_created_transcript(['zh-TW', 'zh-Hant', 'zh'])
        except NoTranscriptFound:
            pass
        
        # 備用自動生成
        if not transcript:
            try:
                transcript = transcript_list.find_generated_transcript(['zh-TW', 'zh-Hant', 'zh', 'zh-Hans'])
            except NoTranscriptFound:
                pass
        
        if transcript:
            fetched = transcript.fetch()
            lines = []
            for snippet in fetched:
                start_seconds = int(snippet.start)
                minutes = start_seconds // 60
                seconds = start_seconds % 60
                text = snippet.text.replace("\n", " ").strip()
                if text:
                    lines.append(f"{minutes}:{seconds:02d} {text}")
            
            # 成功，回報
            if proxy_manager:
                proxy_manager.report_success()
            
            return "\n".join(lines), False
        
        # 沒有字幕，但不是 IP 封鎖
        return None, False
        
    except TranscriptsDisabled:
        return None, False
    except Exception as e:
        error_msg = str(e)
        
        # 檢查是否是 IP 封鎖 (特定錯誤訊息)
        if "blocking requests from your IP" in error_msg or "IP has been blocked" in error_msg:
            print(f"  🚫 IP 被封鎖！")
            return None, True  # IP 被封鎖
        else:
            # 其他錯誤，跳過這個影片
            print(f"  ⚠ 無法取得字幕: {error_msg[:80]}...")
            return None, False


# ==================== 主程式 ====================
def main():
    print("=" * 50)
    print("疾管署直播字幕爬蟲工具 (WebShare 代理版)")
    print("=" * 50)
    
    # 初始化代理
    init_proxy()
    
    # 取得已存在的影片 ID
    existing_ids = get_existing_video_ids()
    
    # 抓取頻道影片
    all_videos = get_channel_videos()
    
    # 過濾直播影片
    livestreams = filter_livestreams(all_videos)
    
    if not livestreams:
        print("找不到任何直播影片。")
        return
    
    # 去重
    new_livestreams = [v for v in livestreams if v["id"] not in existing_ids]
    skipped_count = len(livestreams) - len(new_livestreams)
    
    if skipped_count > 0:
        print(f"跳過 {skipped_count} 部已存在的影片")
    
    if not new_livestreams:
        print("所有直播影片都已存在，無需處理。")
        return
    
    print(f"將處理 {len(new_livestreams)} 部新影片")
    
    # 處理影片
    results = []
    uploaded_count = 0
    
    for i, video in enumerate(new_livestreams, 1):
        print(f"[{i}/{len(new_livestreams)}] 處理: {video['title'][:50]}...")
        
        # 隨機延遲
        delay = random.uniform(MIN_DELAY, MAX_DELAY)
        print(f"  ⏳ 等待 {delay:.1f} 秒...")
        time.sleep(delay)
        
        # 嘗試取得字幕
        transcript = None
        max_ip_retries = 5  # IP 被封鎖時最多切換代理重試次數
        
        for ip_retry in range(max_ip_retries):
            transcript, is_ip_blocked = get_transcript(video["id"])
            
            if transcript:
                # 成功取得字幕
                break
            elif is_ip_blocked:
                # IP 被封鎖，切換代理並重試
                if proxy_manager and ip_retry < max_ip_retries - 1:
                    proxy_manager.rotate()
                    print(f"  🔄 IP 封鎖，切換代理後重試... ({ip_retry + 1}/{max_ip_retries})")
                    time.sleep(3)  # 切換後等待
                else:
                    print(f"  ❌ 已嘗試 {max_ip_retries} 個代理，仍被封鎖，跳過此影片")
                    break
            else:
                # 正常失敗（無字幕、字幕被禁用等），直接跳過此影片
                break
        
        results.append({
            "title": video["title"],
            "url": video["url"],
            "video_id": video["id"],
            "transcript": transcript,
            "has_transcript": transcript is not None
        })
        
        if transcript:
            print(f"  ✓ 字幕長度: {len(transcript)} 字元")
            
            if upload_to_supabase(video["id"], video["title"], transcript):
                uploaded_count += 1
                print(f"    ✓ 已上傳至 Supabase")
        else:
            print(f"  ✗ 無法取得字幕，跳過")
    
    # 輸出結果
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
