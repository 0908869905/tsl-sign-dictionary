
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
    <div className="w-full max-w-2xl mx-auto my-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('searchPlaceholder')}
          disabled={isLoading}
          className="w-full bg-white border border-zinc-200 rounded-md py-4 pl-12 pr-4 text-lg text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
        />
      </form>
    </div>
  );
};

export default SearchBar;
