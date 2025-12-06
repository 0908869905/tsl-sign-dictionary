
import React from 'react';
import { Hand, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-teal-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-lg shadow-sm">
            <Hand className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 leading-none tracking-tight">
              {t('title')}
            </h1>
            <span className="text-xs text-teal-600 font-medium mt-0.5">
              {t('subtitle')}
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <button 
             onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
             className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
          >
            <Languages className="w-4 h-4" />
            <span>{language === 'zh' ? 'English' : '中文'}</span>
          </button>
          
          <a 
            href="https://www.youtube.com/user/taiwancdc" 
            target="_blank" 
            rel="noreferrer"
            className="hidden sm:flex text-sm text-gray-500 hover:text-teal-700 font-medium transition-colors items-center gap-1"
          >
            {t('source')}
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
