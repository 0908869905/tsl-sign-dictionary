
import React, { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const { t } = useLanguage();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  }, [inputValue, onSearch]);

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <form onSubmit={handleSubmit} className="relative flex items-center w-full shadow-lg rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-teal-500 transition-all bg-white group">
        <div className="pl-4 sm:pl-6 text-gray-400 group-focus-within:text-teal-500 transition-colors">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('searchPlaceholder')}
          disabled={isLoading}
          className="w-full h-14 sm:h-16 px-4 text-base sm:text-lg text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="h-14 sm:h-16 px-6 sm:px-8 bg-teal-600 hover:bg-teal-700 text-white font-medium text-base sm:text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {t('searchButton')}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
