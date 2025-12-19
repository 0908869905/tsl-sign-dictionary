
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Key is missing. Check your .env file or deployment settings.');
    // 避免白屏，但會在控制台報錯。也可以選擇 alert 提示。
    if (typeof window !== 'undefined') {
        // alert('Supabase 設定缺失，請檢查 Console');
    }
}

// 即使變數缺失也嘗試建立，讓錯誤在呼叫時才發生，而不是 import 時就 crash
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
