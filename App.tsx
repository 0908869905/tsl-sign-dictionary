
import React, { useState, useEffect } from 'react';
import { HashRouter, useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import { SearchState, VideoResult } from './types';
import { checkLocalData } from './services/localData';
import { NO_RESULTS_MESSAGE } from './constants';
import { Info, BookOpen, History, X, Bookmark, Star } from 'lucide-react';

// Inner component to use Router hooks
const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<VideoResult[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // 1. Load History and Bookmarks on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('tsl_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }

    const savedBookmarks = localStorage.getItem('tsl_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  // 2. Deep Linking: Check URL for query on mount
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam && !state.hasSearched) {
       // Avoid infinite loop if already searched same query
       if (queryParam !== state.query) {
         performSearch(queryParam);
       }
    }
  }, [searchParams]); // Re-run if URL changes (e.g. back button)

  const updateHistory = (newQuery: string) => {
    const prevHistory = [...searchHistory];
    const filtered = prevHistory.filter(item => item !== newQuery);
    const updated = [newQuery, ...filtered].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('tsl_search_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('tsl_search_history');
  };

  const toggleBookmark = (video: VideoResult) => {
    let newBookmarks;
    if (bookmarks.some(b => b.id === video.id)) {
      newBookmarks = bookmarks.filter(b => b.id !== video.id);
    } else {
      newBookmarks = [video, ...bookmarks];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('tsl_bookmarks', JSON.stringify(newBookmarks));
  };

  const performSearch = (query: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, query }));
    
    // Update URL without reloading
    setSearchParams({ q: query });
    
    // Simulate delay
    setTimeout(() => {
      try {
        const results = checkLocalData([query]);
        setState({
          query,
          results,
          isLoading: false,
          error: null,
          hasSearched: true,
        });
      } catch (err) {
        console.error("Search failed:", err);
        setState({
          query,
          results: [],
          isLoading: false,
          error: "搜尋發生錯誤，請稍後再試。",
          hasSearched: true,
        });
      }
    }, 300);
  };

  const handleSearch = (query: string) => {
    setShowBookmarks(false); // Switch back to search view if searching
    updateHistory(query);
    performSearch(query);
  };

  // Determine what to display
  const displayedResults = showBookmarks ? bookmarks : state.results;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>手語翻譯語料庫</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            搜尋疾管署影片，觀看<span className="text-teal-600">手語翻譯</span>示範
          </h2>
          
          <SearchBar onSearch={handleSearch} isLoading={state.isLoading} />

          {/* Controls Bar: History & Bookmarks Toggle */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 max-w-3xl mx-auto">
             {/* History */}
             <div className="flex-1 w-full md:w-auto flex justify-center md:justify-start">
                {searchHistory.length > 0 && !state.hasSearched && !showBookmarks && (
                  <div className="flex flex-wrap items-center gap-2 text-sm animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-1 text-gray-500 mr-1">
                      <History className="w-3.5 h-3.5" />
                      <span>最近：</span>
                    </div>
                    {searchHistory.map(term => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="text-gray-600 hover:text-teal-700 hover:bg-white bg-gray-100 border border-gray-200 px-3 py-1 rounded-full transition-all text-xs"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
             </div>

             {/* Bookmark Toggle */}
             <div className="flex-shrink-0">
               <button
                 onClick={() => setShowBookmarks(!showBookmarks)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all text-sm ${
                   showBookmarks 
                     ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm' 
                     : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                 }`}
               >
                 <Star className={`w-4 h-4 ${showBookmarks ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                 {showBookmarks ? '返回搜尋' : `我的單字本 (${bookmarks.length})`}
               </button>
             </div>
          </div>
        </div>

        {/* View: Bookmarks */}
        {showBookmarks && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-end justify-between border-b border-gray-200 pb-3">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  已收藏的單字片段
                </h3>
             </div>
             
             {bookmarks.length > 0 ? (
               <div className="grid grid-cols-1 gap-8">
                 {bookmarks.map((result) => (
                   <VideoCard 
                     key={result.id} 
                     result={result} 
                     searchQuery="" 
                     isBookmarked={true}
                     onToggleBookmark={() => toggleBookmark(result)}
                   />
                 ))}
               </div>
             ) : (
               <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">您目前沒有收藏任何片段。</p>
                  <p className="text-sm text-gray-400">在搜尋結果中點擊星星圖示即可收藏。</p>
               </div>
             )}
           </div>
        )}

        {/* View: Search Results */}
        {!showBookmarks && state.hasSearched && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 pb-3 gap-3">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  搜尋結果：
                  <span className="text-teal-700">"{state.query}"</span>
                </h3>
              </div>
              <span className="text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                找到 {state.results.length} 個手語片段
              </span>
            </div>

            {state.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                {state.error}
              </div>
            )}

            {state.results.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {state.results.map((result) => (
                  <VideoCard 
                    key={result.id} 
                    result={result} 
                    searchQuery={state.query} 
                    isBookmarked={bookmarks.some(b => b.id === result.id)}
                    onToggleBookmark={() => toggleBookmark(result)}
                  />
                ))}
              </div>
            ) : (
              !state.isLoading && !state.error && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Info className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-600 mb-2">{NO_RESULTS_MESSAGE}</p>
                  <button 
                    onClick={() => handleSearch("疫苗")}
                    className="text-teal-600 font-medium hover:underline mt-2"
                  >
                    試試看搜尋「疫苗」？
                  </button>
                </div>
              )
            )}
          </div>
        )}
        
        {/* Quick Suggestions (Only show when idle) */}
        {!state.hasSearched && !showBookmarks && (
          <div className="flex flex-wrap justify-center gap-2 text-sm mt-8">
            <span className="text-gray-500 self-center">常查詞彙：</span>
            {["口罩", "快篩", "疫苗", "猴痘", "流感", "解編", "降級", "馬堡病毒", "清冠一號"].map(tag => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="text-teal-700 hover:text-teal-900 hover:bg-teal-100 bg-white border border-teal-100 px-3 py-1.5 rounded-full transition-all shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <HashRouter>
      <SearchPage />
    </HashRouter>
  );
};

export default App;