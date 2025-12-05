
import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import { SearchState } from './types';
import { checkLocalData } from './services/localData';
import { NO_RESULTS_MESSAGE } from './constants';
import { Info, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, query }));
    
    // Simulate a brief delay for better UX interactions
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

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>手語翻譯語料庫</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              搜尋疾管署影片，觀看<span className="text-teal-600">手語翻譯</span>示範
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              輸入您想查詢的詞彙，系統將搜尋「中央流行疫情指揮中心記者會」片段，
              協助您對照學習該詞彙的台灣手語（TSL）打法。
            </p>
            
            <SearchBar onSearch={handleSearch} isLoading={state.isLoading} />

            {/* Quick Tags Suggestion */}
            {!state.hasSearched && (
              <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm">
                <span className="text-gray-500 self-center">常查詞彙：</span>
                {["口罩", "降級", "解編", "1194天", "猴痘", "大角星", "XBB", "H3N8", "幼兒疫苗", "高端", "祈福餅乾"].map(tag => (
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
          </div>

          {/* Results Section */}
          {state.hasSearched && (
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
                    <p className="text-sm text-gray-400 max-w-md mx-auto mb-4">
                      系統嘗試搜尋了「{state.query}」，但在目前的資料庫中未找到匹配片段。
                    </p>
                    <button 
                      onClick={() => handleSearch("疫苗")}
                      className="text-teal-600 font-medium hover:underline px-4 py-2 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      試試看搜尋「疫苗」？
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;