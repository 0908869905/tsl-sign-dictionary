
import { VideoResult } from '../types';

interface TranscriptSource {
  videoId: string;
  date: string;
  title: string;
  rawText: string;
}

const TRANSCRIPTS: TranscriptSource[] = [
  {
    videoId: "xlLcVJ4ny9A",
    date: "2023-02-16",
    title: "2023/02/16 指揮中心記者會 (馬堡病毒/口罩鬆綁)",
    rawText: `
7:43 大家好各位朋友們 大家午安
8:05 我們昨天新確認了本土病例 有16477位
8:51 其中年齡都在50多歲以上我們今天沒有 少兒或更年輕的死亡人數
9:25 我們做了一些調整跟大家做報告 昨天我們的醫療應變小組會議呢 有針對六區
10:08 我們本週將先訂出以下區域的天花板 讓這個醫院能夠適應時的減少一些這個多開的病床
11:50 好那在住宿式機構的積極率呢 上一周 也就是說2月6號到2月12號呢
13:42 謝謝指揮稍早提到那位指揮中心記者以後改 一個禮拜一次
13:52 從第五類改成降成第四類
14:02 那個戴著口罩的運動 會不會被霸凌等等的問題
16:30 謝謝指揮官想問雙北 目前打疫苗可以領到500元 禮券未來有可能不會是全國的討價還價
18:19 民視指揮官您好請教有媒體說致死率88%的馬堡 病毒在國外的發展狀況
18:38 基本上是以非洲為主 他跟伊波拉都算同一個家族 都是絲狀病毒蠶絲或絲線的這個絲
`
  },
  {
    videoId: "yS5PQhhz1AU",
    date: "2023-03-30",
    title: "2023/03/30 指揮中心記者會 (BQ.1/XBB/疫苗效力)",
    rawText: `
7:53 在本土的這個部分呢 BQ.1 跟XBB 這兩個新興的變異株 都有明顯增加的一個狀況
9:51 特別是針對免疫力比較低下的民眾 所以在今天早上 我們的專家諮詢小組會議 也有針對這個單株抗體
10:43 以及就是所有的 有重大傷病卡的器官移植病患 也包括骨髓移植的病患在內
14:10 會再有一個新的一輪 所以提醒民眾 如果還是有這個購買快篩的這個需求的話 從4月1號開始 又有新的一輪
17:27 國際上關於這Covid-19疫苗的一個新的資訊 有新的報告 所以在這邊 跟提出來跟大家分享
18:40 我們特別關注的是65歲以上的長者 他接種兩劑完之後 兩個月內保護效益 預防住院 是77%
22:23 那我這邊就是給大家看一下 這是發表在刺胳針這個 最新發表 新加坡整個國家疫苗 施打效益的一個分析
28:09 他說當時中國的抗疫成果很不錯 做到初步初步的控制 沒有大幅向外擴張
28:37 這樣 我在想 我自己 個人 個人認為 我覺得馬前總統說的這些話是 應該是他以他自己是一個中國人的角度來說的
`
  },
  {
    videoId: "OtCj_MvtsNM",
    date: "2023-04-13",
    title: "2023/04/13 指揮中心記者會 (H3N8/幼兒疫苗/BA.2.75)",
    rawText: `
9:28 BA.2.75為主的 這個流行的趨勢 大概從春節開始 到現在 經歷了春節跟春假 其實都沒有明顯的改變
14:21 事實上是在3月22號 我們的ACIP 的專家會議 有討論過這個 幼兒的這個疫苗的追加劑
15:08 來提供 滿6個月到未滿6歲 然後已經完成莫德納基礎劑接種的幼兒 來作為 這個 追加劑的使用
17:41 不知道規則 那不是很清楚 那我想很簡單地說 就是現在規定要戴的地方 就是醫療長照機構 那其他地方都是這個自主佩戴
18:56 然後另外想要問一下H3N8的 這個部分 應該中國有出現首例 人類感染 然後死亡的個案
20:04 有3例的H3N8的這個 人類病例 都是從 中國這邊通報出來的 包含兩例重症 其中有1例是死亡
20:30 都顯示跟這 個禽類有接觸史 目前看起來就是禽 傳人的這個傳播途徑 還沒有從這3個案例的疫情調查 也發現說 有人傳人
`
  },
  {
    videoId: "FHBYy2pAKA0",
    date: "2023-04-20",
    title: "2023/04/20 指揮中心記者會 (XBB.1.16大角星/猴痘)",
    rawText: `
8:49 目前慢慢在增加的 是這個俗稱 外界俗稱叫大角星的這一個 比較新的一個變異株 叫做XBB.1.16
14:12 猴痘 送馬偕 請問有掌握嗎 文章中還有寫到說 他只有和老人家去市場 卻感染上病症
14:41 那經過我們 向這個醫院及所在地的衛生局 查證之後 這個網傳的是一個錯誤
15:13 在我們這一波 仍然是 以這個人與人之間的親密接觸 那這個而導致的 並不是說 這樣去逛市場
16:12 就是說 散佈不實的 各種傳染病 不是只有COVID-19 那對傳染病有不實的這個散佈謠言
`
  },
  {
    videoId: "p38arL6bCXs",
    date: "2023-04-27",
    title: "2023/04/27 指揮中心記者會 (宣布降級解編)",
    rawText: `
8:01 它從法定傳染病的第五類改成第四類 那第二件事情是 指揮中心就解編
10:35 那麼我們在這個中間 我們也去檢討了 這些相關的這個工作 其實我們 從去年的10月那開始 邊境開始逐漸解封
11:59 那我們會成立一個COVID-19 防治聯繫會報 那我們每個月會開一次
15:34 所以我們決定在5月1號開始 就會將這個實名制家用快篩的販售來退場
35:30 效期是到什麼時候 以及清冠1號的EUA 是到什麼時候 那清冠1號的EUA是 之前是不是有延長
53:08 所以投標廠商增加為 增加為4家 那由於各家廠商 他們的疫苗製程 還有核准適用的年齡 單價
54:35 我想 一向 就是 我們如果是在國內合格的廠商 那關於這個流感疫苗 如果是有證的 那我們都是複數決標
55:31 第四家是高端 高端是最後一個序位 我想大致上的情形是這樣子
`
  },
  {
    videoId: "oyflMvGjH7w",
    date: "2023-04-27",
    title: "2023/04/27 指揮中心終場記者會 (感恩儀式)",
    rawText: `
7:13 好 各位媒體朋友 還有各位嘉賓大家好 歡迎來參加最終場的記者會
12:19 就是我們的中央流行疫情指揮中心將解編 那疫苗接種假也會隨之退場
32:27 就是我們的這個 陳宗彥 前副指揮官 今天因為他有事情 他沒有辦法來
37:53 指揮官請 請公佈答案 1194天 對
38:26 開了960場 謝謝陳前指揮官 那我們請先回座休息一下
39:08 李召集人您的答案是 這答案不太精確 將近7000張 謝謝你
42:17 哇 那我們可以看到背板已經更新成功囉 象徵從今天起 準備邁向新生活
48:44 請唱名到的長官 跟著工作人員引導到定位點 發送祈福餅乾
`
  }
];

// Helper to convert MM:SS to seconds
const parseTime = (timeStr: string): number => {
  const parts = timeStr.trim().split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
};

// Parse raw transcripts into searchable segments
const parseTranscripts = () => {
  let allSegments: { 
    videoId: string; 
    date: string; 
    title: string; 
    text: string; 
    timestamp: number; 
  }[] = [];

  TRANSCRIPTS.forEach(source => {
    // Regex to match lines starting with timestamp like "7:43" or "12:05"
    const lines = source.rawText.split('\n');
    let currentTime = 0;

    lines.forEach(line => {
      const timeMatch = line.match(/^(\d{1,2}:\d{2})\s+(.*)/);
      if (timeMatch) {
        currentTime = parseTime(timeMatch[1]);
        const text = timeMatch[2].trim();
        if (text) {
          allSegments.push({
            videoId: source.videoId,
            date: source.date,
            title: source.title,
            text: text,
            timestamp: currentTime
          });
        }
      } else if (line.trim() && currentTime > 0) {
        // Append to previous segment for context
        if (allSegments.length > 0 && allSegments[allSegments.length - 1].videoId === source.videoId) {
           allSegments[allSegments.length - 1].text += " " + line.trim();
        }
      }
    });
  });

  return allSegments;
};

const DATABASE = parseTranscripts();

// Update to accept multiple queries (original + synonyms)
export const checkLocalData = (queries: string[]): VideoResult[] => {
  const normalizedQueries = [...new Set(queries.map(q => q.toLowerCase().trim()).filter(q => q))];
  
  if (normalizedQueries.length === 0) return [];

  const results: VideoResult[] = [];
  const addedIds = new Set<string>();
  
  DATABASE.forEach((segment, index) => {
    const textLower = segment.text.toLowerCase();
    
    // Check if any of the queries match this segment
    for (const query of normalizedQueries) {
      if (textLower.includes(query)) {
        const id = `local-${segment.videoId}-${index}`;
        
        // Avoid duplicates
        if (!addedIds.has(id)) {
          results.push({
            id,
            youtubeId: segment.videoId,
            title: segment.title,
            date: segment.date,
            timestamp: segment.timestamp,
            transcriptSnippet: segment.text,
            matchedTerm: query, // Record which term matched
            matchIndex: textLower.indexOf(query),
            matchLength: query.length
          });
          addedIds.add(id);
        }
        // If matched one synonym, no need to check others for this segment
        break; 
      }
    }
  });

  return results;
};
