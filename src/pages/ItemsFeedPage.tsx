import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { subscribeItems, type Item } from '../services/items';
import { ItemCard } from '../components/items/ItemCard';
import { ItemFilters } from '../components/items/ItemFilters';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { ItemCardSkeleton } from '../components/ui/Skeleton';

interface ItemsFeedPageProps {
  view: 'all' | 'my';
  onStartChat: (item: Item) => void;
  onViewDetail: (item: Item) => void;
  onShowForm: () => void;
}

export const ItemsFeedPage: React.FC<ItemsFeedPageProps> = ({ view, onStartChat, onViewDetail, onShowForm }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const filter = view === 'my' ? { field: 'reportedBy', value: user._id } : undefined;
    const unsub = subscribeItems((data) => {
      setItems(data);
      setLoading(false);
    }, filter);
    return unsub;
  }, [user, view]);

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {view === 'all' ? t('allItems') : t('myItems')}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={onShowForm}
            icon={<Plus className="w-4 h-4" />}
          >
            {t('reportItem')}
          </Button>
        </div>

        {/* Filters */}
        <ItemFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
        />

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title={t('noItems')}
            description={t('noItemsDesc')}
            action={
              <Button variant="primary" onClick={onShowForm} icon={<Plus className="w-4 h-4" />}>
                {t('reportItem')}
              </Button>
            }
            className="bg-[var(--bg-surface)] rounded-2xl border border-dashed border-[var(--border-default)]"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <ItemCard key={item.id} item={item} onStartChat={onStartChat} onViewDetail={onViewDetail} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
