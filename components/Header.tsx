import React from 'react';
import { APP_TITLE, APP_SUBTITLE } from '../constants';
import { Hand } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-teal-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-lg shadow-sm">
            <Hand className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 leading-none tracking-tight">{APP_TITLE}</h1>
            <span className="text-xs text-teal-600 font-medium mt-0.5">{APP_SUBTITLE}</span>
          </div>
        </div>
        <nav>
          <a 
            href="https://www.youtube.com/user/taiwancdc" 
            target="_blank" 
            rel="noreferrer"
            className="text-sm text-gray-500 hover:text-teal-700 font-medium transition-colors flex items-center gap-1"
          >
            資料來源：疾管署
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;