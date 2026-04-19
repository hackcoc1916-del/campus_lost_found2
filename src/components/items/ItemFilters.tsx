import React from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES } from '../../utils';
import { useLanguage } from '../../LanguageContext';

interface ItemFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
}

export const ItemFilters: React.FC<ItemFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border-default)] mb-6 flex flex-col lg:flex-row gap-2 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-medium outline-none"
        />
      </div>
      <div className="w-full lg:w-px h-px lg:h-8 bg-[var(--border-default)]" />
      <div className="flex gap-2 w-full lg:w-auto p-1">
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          className="flex-1 lg:w-36 py-2 px-3 bg-[var(--bg-input)] border-none rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer outline-none"
        >
          <option value="all">{t('filterByType')}</option>
          <option value="lost">{t('lost')}</option>
          <option value="found">{t('found')}</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          className="flex-1 lg:w-44 py-2 px-3 bg-[var(--bg-input)] border-none rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer outline-none"
        >
          <option value="all">{t('filterByCategory')}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
