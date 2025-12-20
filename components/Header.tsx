
import React from 'react';
import { Hand, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onOpenAuth: () => void;
}

import { useAuth } from '../contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();

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

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 text-sm text-gray-700 font-medium hidden sm:flex hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
              </button>
              <button
                onClick={() => signOut()}
                className="text-gray-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-gray-900 hover:bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('login')}</span>
            </button>
          )}

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
