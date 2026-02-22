
import React, { useState, useEffect } from 'react';
import { HashRouter, useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import AdminDashboard from './components/AdminDashboard';
import FeedbackModal from './components/FeedbackModal';
import { SearchState, VideoResult } from './types';
import { checkLocalData, setTranscriptsSource } from './services/localData';
import { Info, Star, History, X, MessageSquare, Lock } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import { supabase } from './services/supabase';
import { loadTranscriptsFromSupabase } from './services/supabaseData';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();

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
  const [activeCategory, setActiveCategory] = useState<'all' | 'medical' | 'daily'>('all');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const preloadData = async () => {
      try {
        const transcripts = await loadTranscriptsFromSupabase();
        if (transcripts.length > 0) {
          setTranscriptsSource(transcripts);
        }
      } catch (err) {
        console.error('[App] 預載字幕資料失敗:', err);
      }
    };
    preloadData();
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem('tsl_search_history');
    if (savedHistory) {
      try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) { }
    }
  }, []);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (user) {
        const local = localStorage.getItem('tsl_bookmarks');
        if (local) {
          try {
            const localBookmarks: VideoResult[] = JSON.parse(local);
            if (localBookmarks.length > 0) {
              const { data: existing } = await supabase.from('bookmarks').select('video_id');
              const existingIds = new Set(existing?.map(e => e.video_id) || []);
              const toInsert = localBookmarks
                .filter(b => !existingIds.has(b.id))
                .map(b => ({ user_id: user.id, video_id: b.id, video_data: b }));
              if (toInsert.length > 0) {
                await supabase.from('bookmarks').insert(toInsert);
              }
              localStorage.removeItem('tsl_bookmarks');
            }
          } catch (e) {
            console.error("Sync failed:", e);
          }
        }
        const { data } = await supabase
          .from('bookmarks')
          .select('video_data')
          .order('created_at', { ascending: false });
        if (data) setBookmarks(data.map(row => row.video_data));
      } else {
        const savedBookmarks = localStorage.getItem('tsl_bookmarks');
        if (savedBookmarks) {
          try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) { }
        } else {
          setBookmarks([]);
        }
      }
    };
    loadBookmarks();
  }, [user]);

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam && !state.hasSearched) {
      if (queryParam !== state.query) {
        performSearch(queryParam);
      }
    }
  }, [searchParams]);

  const updateHistory = (newQuery: string) => {
    const filtered = searchHistory.filter(item => item !== newQuery);
    const updated = [newQuery, ...filtered].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('tsl_search_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('tsl_search_history');
  };

  const toggleBookmark = async (video: VideoResult) => {
    const isBookmarked = bookmarks.some(b => b.id === video.id);
    const newBookmarks = isBookmarked
      ? bookmarks.filter(b => b.id !== video.id)
      : [video, ...bookmarks];
    setBookmarks(newBookmarks);

    if (user) {
      try {
        if (isBookmarked) {
          await supabase.from('bookmarks').delete().eq('video_id', video.id);
        } else {
          await supabase.from('bookmarks').insert({
            user_id: user.id, video_id: video.id, video_data: video
          });
        }
      } catch (err) {
        console.error("Cloud bookmark error:", err);
      }
    } else {
      localStorage.setItem('tsl_bookmarks', JSON.stringify(newBookmarks));
    }
  };

  const performSearch = (query: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, query }));
    setSearchParams({ q: query });
    setTimeout(() => {
      try {
        const results = checkLocalData([query]);
        setState({ query, results, isLoading: false, error: null, hasSearched: true });
      } catch (err) {
        setState({ query, results: [], isLoading: false, error: "Error", hasSearched: true });
      }
    }, 300);
  };

  const handleSearch = (query: string) => {
    setShowBookmarks(false);
    updateHistory(query);
    performSearch(query);
  };

  const displayedResults = showBookmarks ? bookmarks : state.results;
  const filteredResults = activeCategory === 'all'
    ? displayedResults
    : displayedResults.filter(r => r.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <Header onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-16">

        {/* Hero Section — 清新文青風 */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-zinc-950 tracking-tight leading-tight mb-3">
            {t('title')}
          </h2>
          <p className="text-zinc-500 text-base tracking-wide">
            {t('subtitle')}
          </p>

          <SearchBar onSearch={handleSearch} isLoading={state.isLoading} />

          {/* Swiss Design 分隔線 */}
          <div className="relative mt-8">
            <div className="border-t border-zinc-200 w-full" />
            <span className="absolute right-0 -top-3 text-[10px] text-zinc-300 tracking-widest uppercase font-mono">
              Taiwan Sign Language Corpus &mdash; 2026
            </span>
          </div>
        </div>

        {/* Category Tabs — Medium 底線風格 */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex gap-6">
            {[
              { id: 'all', label: t('all') },
              { id: 'medical', label: t('medical') },
              { id: 'daily', label: t('daily') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                  activeCategory === tab.id
                    ? 'border-accent text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`flex items-center gap-2 text-sm transition-colors ${
              showBookmarks
                ? 'text-amber-600'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <Star className={`w-4 h-4 ${showBookmarks ? 'fill-amber-400' : ''}`} />
            {showBookmarks ? t('backToSearch') : `${t('myVocabulary')} (${bookmarks.length})`}
          </button>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !state.hasSearched && !showBookmarks && (
          <div className="flex flex-wrap items-center gap-2 text-sm mb-8">
            <div className="flex items-center gap-1 text-zinc-400">
              <History className="w-3.5 h-3.5" />
              <span>{t('history')}:</span>
            </div>
            {searchHistory.map(term => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="text-zinc-500 hover:text-accent border border-zinc-200 bg-transparent px-3 py-1 rounded text-sm hover:border-accent transition-all"
              >
                {term}
              </button>
            ))}
            <button onClick={clearHistory} className="text-zinc-300 hover:text-red-500 ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bookmarks Header */}
        {showBookmarks && (
          <div className="mb-8 pb-3 border-b border-zinc-200">
            <h3 className="font-display text-2xl font-semibold text-zinc-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              {t('bookmarked')}
            </h3>
          </div>
        )}

        {/* Results */}
        {(state.hasSearched || showBookmarks) && (
          <div className="space-y-6">
            {!showBookmarks && (
              <div className="pb-3 border-b border-zinc-200 mb-6">
                <h3 className="text-lg text-zinc-900">
                  {t('resultsFound', { count: filteredResults.length })}
                  <span className="text-accent font-display italic ml-2">"{state.query}"</span>
                </h3>
              </div>
            )}

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResults.map((result) => (
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
              !state.isLoading && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="font-display text-2xl text-zinc-300 mb-4">
                    {showBookmarks ? t('noBookmarks') : '查無相符詞彙'}
                  </p>
                  {showBookmarks ? (
                    <p className="text-sm text-zinc-400">{t('noBookmarksHint')}</p>
                  ) : (
                    <div className="flex gap-2 mt-4">
                      {['疫苗', '口罩', '隔離'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleSearch(tag)}
                          className="border border-zinc-200 text-zinc-500 px-3 py-1.5 rounded text-sm hover:text-accent hover:border-accent transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Quick Tags */}
        {!state.hasSearched && !showBookmarks && (
          <div className="flex flex-wrap justify-center gap-2 text-sm mt-12">
            <span className="text-zinc-400 self-center mr-2">{t('commonTerms')}</span>
            {["疫苗", "確診", "隔離", "快篩", "口罩", "長新冠", "流感", "猴痘", "解編", "副作用"].map(tag => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="border border-zinc-200 bg-transparent text-zinc-500 px-3 py-1.5 rounded text-sm hover:text-accent hover:border-accent transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Feedback Section */}
        <div className="mt-24 pt-8 border-t border-zinc-200">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-display text-lg font-semibold text-zinc-900 mb-1">{t('feedbackTitle')}</h3>
                <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
                  {t('feedbackDesc')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="whitespace-nowrap text-sm text-accent border border-accent px-5 py-2 rounded hover:bg-accent hover:text-white transition-all"
            >
              {t('feedbackButton')}
            </button>
          </div>
        </div>

      </main>

      <Footer />

      {/* Admin Button */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-4 right-4 p-2.5 text-zinc-400 hover:text-accent bg-white border border-zinc-200 rounded-full transition-all z-40"
        title={t('adminLogin')}
      >
        <Lock className="w-3.5 h-3.5" />
      </button>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <HashRouter>
          <SearchPage />
        </HashRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
