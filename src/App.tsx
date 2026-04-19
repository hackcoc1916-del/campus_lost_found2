import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  BarChart3, Search, LayoutDashboard, MessageSquare,
  Plus, Menu, X, Moon, Sun, LogOut,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeProvider';
import { cn } from './utils';
import { startOrGetChat } from './services/chat';
import { type Item } from './services/items';
import toast from 'react-hot-toast';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ItemsFeedPage } from './pages/ItemsFeedPage';
import { MessagesPage } from './pages/MessagesPage';

// Components
import { ItemDetailView } from './components/items/ItemDetailView';
import { ItemForm } from './components/items/ItemForm';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';

type Tab = 'dashboard' | 'items' | 'my-items' | 'messages';

export default function App() {
  const { user, loading, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Item detail state (tab-based navigation)
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'lost' | 'found' | undefined>(undefined);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)] font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Login page
  if (!user) return <LoginPage />;

  const handleStartChat = async (item: Item) => {
    if (!user || user._id === item.reportedBy) return;
    try {
      const chatId = await startOrGetChat(
        user._id,
        user.name,
        user.photoURL,
        {
          id: item.id,
          title: item.title,
          reportedBy: item.reportedBy,
          reportedByName: item.reportedByName,
          reportedByPhoto: item.reportedByPhoto,
        },
      );
      setActiveChatId(chatId);
      setActiveTab('messages');
      setDetailItem(null);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleViewDetail = (item: Item) => {
    setDetailItem(item);
  };

  const handleShowForm = (type?: 'lost' | 'found') => {
    setFormType(type);
    setShowForm(true);
  };

  const navItems = [
    { id: 'dashboard' as Tab, icon: <BarChart3 />, label: t('dashboard') },
    { id: 'items' as Tab, icon: <Search />, label: t('allItems') },
    { id: 'my-items' as Tab, icon: <LayoutDashboard />, label: t('myItems') },
    { id: 'messages' as Tab, icon: <MessageSquare />, label: t('messages') },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col md:flex-row font-sans text-[var(--text-primary)] transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-[var(--accent-primary)] p-1.5 rounded-lg">
            <Search className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">{t('appName')}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-input)] rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[var(--bg-surface)] border-r border-[var(--border-default)] flex flex-col transition-transform duration-300 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="p-5 hidden md:flex items-center gap-2.5 border-b border-[var(--border-default)]">
          <div className="bg-[var(--accent-primary)] p-2 rounded-xl shadow-sm">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">{t('appName')}</span>
        </div>

        {/* New report button */}
        <div className="p-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              handleShowForm();
              setIsMobileMenuOpen(false);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            {t('reportItem')}
          </Button>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setDetailItem(null);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                activeTab === item.id && !detailItem
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]',
              )}
            >
              {React.cloneElement(item.icon as React.ReactElement<any>, {
                className: cn('w-[18px] h-[18px]', activeTab === item.id && !detailItem ? 'text-white' : ''),
              })}
              {item.label}
            </button>
          ))}
        </div>

        {/* Bottom section */}
        <div className="p-4 border-t border-[var(--border-default)] space-y-3">
          {/* Controls */}
          <div className="flex items-center justify-between px-1">
            <div className="flex bg-[var(--bg-input)] rounded-lg p-0.5">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                  language === 'en'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm'
                    : 'text-[var(--text-muted)]',
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                  language === 'hi'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-sm'
                    : 'text-[var(--text-muted)]',
                )}
              >
                HI
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          {/* User card */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--bg-input)]">
            <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize truncate">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--status-lost)] rounded-lg transition-all"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-57px)] md:h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {detailItem ? (
            <ItemDetailView
              key="detail"
              item={detailItem}
              onBack={() => setDetailItem(null)}
              onStartChat={handleStartChat}
              onViewMatch={handleViewDetail}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  key="dashboard"
                  onNavigate={(tab) => setActiveTab(tab as Tab)}
                  onStartChat={handleStartChat}
                  onViewDetail={handleViewDetail}
                  onShowForm={handleShowForm}
                />
              )}
              {activeTab === 'items' && (
                <ItemsFeedPage
                  key="items"
                  view="all"
                  onStartChat={handleStartChat}
                  onViewDetail={handleViewDetail}
                  onShowForm={() => handleShowForm()}
                />
              )}
              {activeTab === 'my-items' && (
                <ItemsFeedPage
                  key="my-items"
                  view="my"
                  onStartChat={handleStartChat}
                  onViewDetail={handleViewDetail}
                  onShowForm={() => handleShowForm()}
                />
              )}
              {activeTab === 'messages' && (
                <MessagesPage
                  key="messages"
                  activeChatId={activeChatId}
                  setActiveChatId={setActiveChatId}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Report item modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={t('reportItem')}>
        <ItemForm onClose={() => setShowForm(false)} initialType={formType} />
      </Modal>
    </div>
  );
}
