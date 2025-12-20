
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
import { Info, BookOpen, History, X, Star, MessageSquare, Lock } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import { supabase } from './services/supabase';
import { loadTranscriptsFromSupabase } from './services/supabaseData';

// Inner component to use Router & Language hooks
const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const { user } = useAuth(); // Get user from context

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

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // 0. 預載 Supabase 字幕資料（應用啟動時執行一次）
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

  // 1. Load History on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('tsl_search_history');
    if (savedHistory) {
      try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) { }
    }
  }, []);

  // 2. Bookmarks Logic: Sync & Load
  useEffect(() => {
    const loadBookmarks = async () => {
      if (user) {
        // LOGIC: Logged In -> Sync Local to Remote, then Fetch Remote
        const local = localStorage.getItem('tsl_bookmarks');
        if (local) {
          try {
            const localBookmarks: VideoResult[] = JSON.parse(local);
            if (localBookmarks.length > 0) {
              console.log("Syncing local bookmarks to cloud...", localBookmarks.length);

              // 1. Fetch existing remote IDs to avoid duplicates
              const { data: existing } = await supabase.from('bookmarks').select('video_id');
              const existingIds = new Set(existing?.map(e => e.video_id) || []);

              // 2. Filter out what's already in cloud
              const toInsert = localBookmarks
                .filter(b => !existingIds.has(b.id))
                .map(b => ({
                  user_id: user.id,
                  video_id: b.id,
                  video_data: b
                }));

              // 3. Insert new ones
              if (toInsert.length > 0) {
                await supabase.from('bookmarks').insert(toInsert);
              }

              // 4. Clear local storage after sync
              localStorage.removeItem('tsl_bookmarks');
            }
          } catch (e) {
            console.error("Sync failed:", e);
          }
        }

        // Fetch user's bookmarks from Supabase
        const { data, error } = await supabase
          .from('bookmarks')
          .select('video_data')
          .order('created_at', { ascending: false });

        if (data) {
          setBookmarks(data.map(row => row.video_data));
        }
      } else {
        // LOGIC: Logged Out -> Read LocalStorage
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

  // 3. Deep Linking
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam && !state.hasSearched) {
      if (queryParam !== state.query) {
        performSearch(queryParam);
      }
    }
  }, [searchParams]);

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

  const toggleBookmark = async (video: VideoResult) => {
    // Determine new state first for Optimistic UI
    const isBookmarked = bookmarks.some(b => b.id === video.id);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b.id !== video.id);
    } else {
      newBookmarks = [video, ...bookmarks];
    }

    // Update UI immediately
    setBookmarks(newBookmarks);

    if (user) {
      // Cloud Storage
      try {
        if (isBookmarked) {
          await supabase.from('bookmarks').delete().eq('video_id', video.id);
        } else {
          await supabase.from('bookmarks').insert({
            user_id: user.id,
            video_id: video.id,
            video_data: video
          });
        }
      } catch (err) {
        console.error("Cloud bookmark error:", err);
        // Revert on error? For now just log.
      }
    } else {
      // Local Storage
      localStorage.setItem('tsl_bookmarks', JSON.stringify(newBookmarks));
    }
  };

  const performSearch = (query: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, query }));
    setSearchParams({ q: query });

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
        setState({
          query,
          results: [],
          isLoading: false,
          error: "Error",
          hasSearched: true,
        });
      }
    }, 300);
  };

  const handleSearch = (query: string) => {
    setShowBookmarks(false);
    updateHistory(query);
    performSearch(query);
  };

  // Filter Results by Category
  const displayedResults = showBookmarks ? bookmarks : state.results;
  const filteredResults = activeCategory === 'all'
    ? displayedResults
    : displayedResults.filter(r => r.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Header onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero Section */}
        <div className="text-center mb-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>TSL Corpus</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {t('title')}
          </h2>

          <SearchBar onSearch={handleSearch} isLoading={state.isLoading} />

          {/* Categories & Controls */}
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">

            {/* Category Tabs */}
            <div className="flex justify-center border-b border-gray-200">
              <nav className="flex -mb-px space-x-6" aria-label="Tabs">
                {[
                  { id: 'all', label: t('all') },
                  { id: 'medical', label: t('medical') },
                  { id: 'daily', label: t('daily') },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as any)}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeCategory === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* History */}
              <div className="flex-1 w-full md:w-auto flex justify-center md:justify-start min-h-[30px]">
                {searchHistory.length > 0 && !state.hasSearched && !showBookmarks && (
                  <div className="flex flex-wrap items-center gap-2 text-sm animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-1 text-gray-500 mr-1">
                      <History className="w-3.5 h-3.5" />
                      <span>{t('history')}:</span>
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
                    <button onClick={clearHistory} className="ml-1 text-gray-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bookmark Toggle */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all text-sm ${showBookmarks
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <Star className={`w-4 h-4 ${showBookmarks ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  {showBookmarks ? t('backToSearch') : `${t('myVocabulary')} (${bookmarks.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View: Bookmarks Header */}
        {showBookmarks && (
          <div className="mb-6 flex items-end justify-between border-b border-gray-200 pb-3">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              {t('bookmarked')}
            </h3>
          </div>
        )}

        {/* View: Results */}
        {(state.hasSearched || showBookmarks) && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!showBookmarks && (
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 pb-3 gap-3">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    {t('resultsFound', { count: filteredResults.length })}
                    <span className="text-teal-700 text-base font-normal ml-2">"{state.query}"</span>
                  </h3>
                </div>
              </div>
            )}

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
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
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    {showBookmarks ? <Star className="w-8 h-8 text-gray-400" /> : <Info className="w-8 h-8 text-gray-400" />}
                  </div>
                  <p className="text-lg text-gray-600 mb-2">
                    {showBookmarks ? t('noBookmarks') : t('noResults')}
                  </p>
                  {showBookmarks ? (
                    <p className="text-sm text-gray-400">{t('noBookmarksHint')}</p>
                  ) : (
                    <button
                      onClick={() => handleSearch("疫苗")}
                      className="text-teal-600 font-medium hover:underline mt-2"
                    >
                      {t('trySearching')}
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Quick Suggestions */}
        {!state.hasSearched && !showBookmarks && (
          <div className="flex flex-wrap justify-center gap-2 text-sm mt-8">
            <span className="text-gray-500 self-center">{t('commonTerms')}:</span>
            {["疫苗", "確診", "隔離", "快篩", "口罩", "長新冠", "流感", "猴痘", "解編", "副作用"].map(tag => (
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

        {/* User Feedback Section */}
        <div className="mt-20 border-t border-gray-200 pt-10">
          <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm text-teal-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t('feedbackTitle')}</h3>
                <p className="text-gray-600 max-w-md">
                  {t('feedbackDesc')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="whitespace-nowrap px-6 py-3 bg-white text-teal-700 font-medium rounded-lg border border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all shadow-sm block text-center cursor-pointer"
            >
              {t('feedbackButton')}
            </button>
          </div>
        </div>

      </main>

      <Footer />

      {/* Visible Admin Button */}
      <button
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-teal-600 text-white hover:bg-teal-700 rounded-full shadow-lg transition-all z-40"
        title={t('adminLogin')}
      >
        <Lock className="w-4 h-4" />
      </button>

      {/* Modals */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

// Root App Component wrapped with Provider
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
