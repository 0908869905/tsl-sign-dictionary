
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
        <p className="mb-2">{t('footerDesc')}</p>
        <p>
          {t('source')}：
          <a 
            href="https://www.youtube.com/user/taiwancdc" 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-600 hover:underline"
          >
            Taiwan CDC
          </a>
        </p>
        <p className="mt-4 text-xs text-gray-400">
          Powered by React
        </p>
      </div>
    </footer>
  );
};

export default Footer;
