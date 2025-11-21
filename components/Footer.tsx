import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
        <p className="mb-2">防疫小查詢 - 教育用途展示原型</p>
        <p>
          資料來源：
          <a 
            href="https://www.youtube.com/user/taiwancdc" 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-600 hover:underline"
          >
            衛生福利部疾病管制署 (Taiwan CDC)
          </a>
        </p>
        <p className="mt-4 text-xs text-gray-400">
          Powered by React & Gemini API for Semantic Search
        </p>
      </div>
    </footer>
  );
};

export default Footer;