
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="mt-24 pt-8 border-t border-zinc-200 pb-12">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-400">
        <p>Taiwan Sign Language Corpus &mdash; 2026</p>
        <p>
          {t('source')}
          {' '}
          <a
            href="https://www.youtube.com/user/taiwancdc"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 link-underline hover:text-accent transition-colors"
          >
            Taiwan CDC
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
