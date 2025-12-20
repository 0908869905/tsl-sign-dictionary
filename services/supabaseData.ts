/**
 * Supabase 資料服務
 * 負責從 Supabase 預載字幕資料到記憶體
 */

import { supabase } from './supabase';

export interface TranscriptSource {
    videoId: string;
    date: string;
    title: string;
    rawText: string;
}

// 記憶體快取
let cachedTranscripts: TranscriptSource[] = [];
let isLoaded = false;

/**
 * 從 Supabase 載入所有字幕資料到記憶體
 * 應在應用啟動時呼叫一次
 */
export async function loadTranscriptsFromSupabase(): Promise<TranscriptSource[]> {
    if (isLoaded && cachedTranscripts.length > 0) {
        console.log('[supabaseData] 使用快取資料');
        return cachedTranscripts;
    }

    console.log('[supabaseData] 從 Supabase 載入字幕資料...');

    try {
        const { data, error } = await supabase
            .from('transcripts')
            .select('video_id, title, date, raw_text')
            .order('date', { ascending: false });

        if (error) {
            console.error('[supabaseData] 載入失敗:', error);
            return [];
        }

        // 轉換欄位名稱以符合 TranscriptSource 介面
        cachedTranscripts = (data || []).map(row => ({
            videoId: row.video_id,
            title: row.title,
            date: row.date,
            rawText: row.raw_text || ''
        }));

        isLoaded = true;
        console.log(`[supabaseData] 成功載入 ${cachedTranscripts.length} 筆字幕`);

        return cachedTranscripts;
    } catch (err) {
        console.error('[supabaseData] 載入錯誤:', err);
        return [];
    }
}

/**
 * 取得已載入的字幕資料（同步）
 * 需確保 loadTranscriptsFromSupabase() 已先被呼叫
 */
export function getCachedTranscripts(): TranscriptSource[] {
    return cachedTranscripts;
}

/**
 * 檢查資料是否已載入
 */
export function isDataLoaded(): boolean {
    return isLoaded;
}

/**
 * 強制重新載入資料
 */
export async function reloadTranscripts(): Promise<TranscriptSource[]> {
    isLoaded = false;
    cachedTranscripts = [];
    return loadTranscriptsFromSupabase();
}
