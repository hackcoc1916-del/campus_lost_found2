import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, CheckCircle, Tag, ArrowRight, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { subscribeItems, type Item } from '../services/items';
import { ItemCard } from '../components/items/ItemCard';
import { StatCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { cn } from '../utils';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onStartChat: (item: Item) => void;
  onViewDetail: (item: Item) => void;
  onShowForm: (type?: 'lost' | 'found') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onStartChat, onViewDetail, onShowForm }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const totalLost = items.filter((i) => i.type === 'lost').length;
  const totalFound = items.filter((i) => i.type === 'found').length;
  const resolved = items.filter((i) => i.status === 'resolved').length;
  const recentItems = items.slice(0, 6);

  const stats = [
    { title: t('totalLost'), value: totalLost, icon: <Search className="w-6 h-6" />, color: 'var(--status-lost)', bg: 'var(--status-lost-soft)' },
    { title: t('totalFound'), value: totalFound, icon: <CheckCircle className="w-6 h-6" />, color: 'var(--status-found)', bg: 'var(--status-found-soft)' },
    { title: t('resolvedItems'), value: resolved, icon: <Tag className="w-6 h-6" />, color: 'var(--status-resolved)', bg: 'var(--status-resolved-soft)' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]"
            >
              {t('welcomeBack')}, {user?.name?.split(' ')[0] || 'User'} 👋
            </motion.h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">{t('stats')}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onShowForm('found')}
              icon={<Plus className="w-4 h-4" />}
            >
              {t('reportFound')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onShowForm('lost')}
              icon={<Plus className="w-4 h-4" />}
            >
              {t('reportLost')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            stats.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-default)] flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.bg, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">{stat.title}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('recentActivity')}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('items')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {t('allItems')}
            </Button>
          </div>

          {recentItems.length === 0 && !loading ? (
            <EmptyState
              title={t('noItems')}
              description={t('noItemsDesc')}
              action={
                <Button variant="primary" onClick={() => onShowForm()} icon={<Plus className="w-4 h-4" />}>
                  {t('reportItem')}
                </Button>
              }
              className="bg-[var(--bg-surface)] rounded-2xl border border-dashed border-[var(--border-default)]"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentItems.map((item, idx) => (
                <ItemCard key={item.id} item={item} onStartChat={onStartChat} onViewDetail={onViewDetail} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
