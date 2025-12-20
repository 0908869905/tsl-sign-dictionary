import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Lock, ArrowRight, Loader2, CheckCircle, User as UserIcon, Save } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'password_login' | 'password_register';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { signInWithPassword, signUp, user, profile, updateProfile, signOut } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<AuthMode>('password_login');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile state
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        if (profile?.full_name) {
            setFullName(profile.full_name);
        }
    }, [profile]);

    if (!isOpen) return null;

    // Reset state when closing or switching modes handled by internal state logic,
    // but here we might want to reset message on open if needed.

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            let result;
            if (mode === 'password_login') {
                result = await signInWithPassword(email, password);
                if (result.error) throw result.error;
                onClose(); // Close on success
            } else {
                result = await signUp(email, password);
                if (result.error) throw result.error;
                setMessage({ type: 'success', text: '註冊成功！請檢查信箱以驗證帳號。' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '發生錯誤，請稍後再試。' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await updateProfile({ full_name: fullName });
            if (error) throw error;
            setMessage({ type: 'success', text: '個人資料更新成功！' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '更新失敗。' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        onClose();
    };

    // Render Logic
    if (user) {
        // Logged In View: Profile Editor
        return (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-teal-600" />
                            個人資料
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {message && (
                            <div className={`text-sm p-3 rounded mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-3xl font-bold mb-3">
                                {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="text-gray-500 text-sm">{user.email}</div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">暱稱 / 顯示名稱</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    placeholder="設定您的暱稱"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                儲存變更
                            </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSignOut}
                                className="w-full text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm"
                            >
                                登出帳號
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Logged Out View: Login/Register
    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-gray-800">
                        {mode === 'password_login' ? '帳號登入' : '註冊帳號'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {message?.type === 'success' ? (
                        <div className="text-center py-8">
                            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {mode === 'password_register' ? '註冊成功' : '操作成功'}
                            </h3>
                            <p className="text-gray-600 mb-6">{message.text}</p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { setMessage(null); setMode('password_login'); }}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                    返回登入
                                </button>
                                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">
                                    關閉視窗
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-6 text-sm">
                                <button
                                    onClick={() => { setMode('password_login'); setMessage(null); }}
                                    className={`flex-1 py-1.5 rounded-md transition-all ${mode === 'password_login' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    密碼登入
                                </button>
                                <button
                                    onClick={() => { setMode('password_register'); setMessage(null); }}
                                    className={`flex-1 py-1.5 rounded-md transition-all ${mode === 'password_register' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    註冊
                                </button>
                            </div>

                            <form onSubmit={handleAuthSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {message?.type === 'error' && (
                                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {mode === 'password_login' ? '登入' : '註冊'}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-4 text-center text-xs text-gray-400">
                                密碼長度至少需 6 個字元。
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
