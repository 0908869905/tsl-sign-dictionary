
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Feedback } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [type, setType] = useState('new_word');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      const newFeedback: Feedback = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        type,
        content
      };

      // Save to localStorage
      const existing = localStorage.getItem('tsl_feedbacks');
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem('tsl_feedbacks', JSON.stringify([...list, newFeedback]));

      setSuccess(true);
      setContent('');
      setIsSubmitting(false);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 bg-teal-600 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">{t('feedbackTitle')}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {success ? (
             <div className="flex flex-col items-center justify-center py-8 text-teal-600 gap-3">
               <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                 <Send className="w-6 h-6" />
               </div>
               <p className="font-medium text-lg">{t('successMsg')}</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('feedbackType')}</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="new_word">{t('newWord')}</option>
                  <option value="bug">{t('bugReport')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('feedbackContent')}</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 h-32 resize-none"
                  placeholder="..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : t('submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
