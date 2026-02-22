
import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo - Serif 字體，無圖標 */}
        <a href="#" className="flex items-baseline gap-2 group">
          <h1 className="font-display text-xl font-semibold text-zinc-950 tracking-tight">
            手語辭典
          </h1>
          <span className="text-xs text-zinc-400 font-sans tracking-widest uppercase hidden sm:inline">
            TSL Corpus
          </span>
        </a>

        <nav className="flex items-center gap-3">
          {/* 語言切換 */}
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-sm text-zinc-500 hover:text-accent transition-colors"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? 'EN' : '中'}</span>
          </button>

          {/* 分隔線 */}
          <div className="w-px h-4 bg-zinc-200" />

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-accent transition-colors"
              >
                <div className="w-7 h-7 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="max-w-[80px] truncate hidden sm:inline">{user.email?.split('@')[0]}</span>
              </button>
              <button
                onClick={() => signOut()}
                className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-sm text-zinc-600 hover:text-accent link-underline transition-colors"
            >
              {t('login')}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
