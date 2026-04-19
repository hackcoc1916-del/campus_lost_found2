import React from 'react';
import { motion } from 'motion/react';
import { useGoogleLogin } from '@react-oauth/google';
import { Search, Moon, Sun, Globe } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeProvider';
import { cn } from '../utils';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      loginWithGoogle(tokenResponse.access_token);
    },
    onError: () => {
      console.error('Google login failed');
    },
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[15%] w-[60%] h-[60%] rounded-full bg-[var(--accent-primary)] opacity-[0.04] blur-[120px]" />
        <div className="absolute -bottom-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-[var(--accent-teal)] opacity-[0.04] blur-[120px]" />
        <div className="absolute top-[20%] left-[50%] w-[40%] h-[40%] rounded-full bg-[var(--status-lost)] opacity-[0.02] blur-[100px]" />
      </div>

      {/* Floating grid dots */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-[var(--bg-surface)] rounded-3xl shadow-xl border border-[var(--border-default)] overflow-hidden">
          {/* Top section with gradient */}
          <div className="bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-teal)] p-8 pb-12 text-center relative">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-white/10"
            >
              <Search className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-2">{t('appName')}</h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
              {t('campusOnly')}
            </p>
          </div>

          {/* Bottom section */}
          <div className="p-8 -mt-4">
            {/* Language toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-[var(--bg-input)] p-1 rounded-xl flex">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                    language === 'en'
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={cn(
                    'px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                    language === 'hi'
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                  )}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Login button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => googleLogin()}
              className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 text-base cursor-pointer"
            >
              <Globe className="w-5 h-5" />
              {t('login')}
            </motion.button>

            <p className="text-center text-xs text-[var(--text-muted)] mt-4">
              Sign in with your Google account to get started
            </p>
          </div>
        </div>

        {/* Attribution */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-6 opacity-60">
          Built with ❤️ for campus safety
        </p>
      </motion.div>
    </div>
  );
};
