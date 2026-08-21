
import React, { useState, useEffect } from 'react';
import { Lock, X, LogOut, Trash2 } from 'lucide-react';
import { ADMIN_PASSWORD_HASH } from '../constants';
import { Feedback } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadFeedbacks();
    }
  }, [isOpen, isAuthenticated]);

  const loadFeedbacks = () => {
    const data = localStorage.getItem('tsl_feedbacks');
    if (data) {
      try {
        setFeedbacks(JSON.parse(data).reverse()); // Newest first
      } catch (e) {
        setFeedbacks([]);
      }
    }
  };

  const clearFeedbacks = () => {
    if (confirm('確定要清空所有回饋嗎？')) {
      localStorage.removeItem('tsl_feedbacks');
      setFeedbacks([]);
    }
  };

  const deleteFeedback = (id: string) => {
    if (confirm('確定要刪除此條回饋？')) {
      const updated = feedbacks.filter(f => f.id !== id);
      setFeedbacks(updated);
      // Save back to localStorage in chronological order (reverse of display)
      localStorage.setItem('tsl_feedbacks', JSON.stringify([...updated].reverse()));
    }
  };

  // Helper: SHA-256 Hashing
  const sha256 = async (str: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Trim whitespace to prevent copy-paste errors
    const cleanPassword = password.trim(); 
    const inputHash = await sha256(cleanPassword);
    
    if (inputHash === ADMIN_PASSWORD_HASH) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setError('密碼錯誤');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-500" />
            {isAuthenticated ? 'TSL 後台管理' : t('adminLogin')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-xs mx-auto py-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  autoFocus
                  placeholder="..."
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                className="w-full bg-gray-800 hover:bg-black text-white py-2 rounded-lg font-medium transition-colors"
              >
                {t('login')}
              </button>
              {/* Hint removed as requested */}
            </form>
          ) : (
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-700">{t('feedbackList')} ({feedbacks.length})</h3>
                 <button 
                   onClick={clearFeedbacks}
                   className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"
                 >
                   <Trash2 className="w-3 h-3" />
                   Clear All
                 </button>
               </div>
               
               {feedbacks.length === 0 ? (
                 <div className="text-center text-gray-400 py-10">{t('noFeedbacks')}</div>
               ) : (
                 <div className="space-y-3">
                   {feedbacks.map((item) => (
                     <div key={item.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 group hover:border-gray-300 transition-colors">
                       <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.type === 'bug' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'
                            }`}>
                              {item.type === 'bug' ? t('bugReport') : item.type === 'new_word' ? t('newWord') : t('other')}
                            </span>
                            <span className="text-xs text-gray-400">{item.date}</span>
                         </div>
                         <button 
                           onClick={() => deleteFeedback(item.id)}
                           className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                           title="刪除"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                       <p className="text-gray-800 text-sm whitespace-pre-wrap">{item.content}</p>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
             <button 
               onClick={() => setIsAuthenticated(false)}
               className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
             >
               <LogOut className="w-4 h-4" />
               {t('logout')}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
