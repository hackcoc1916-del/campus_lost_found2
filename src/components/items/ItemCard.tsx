import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Tag, MessageSquare, CheckCircle, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../AuthContext';
import { useLanguage } from '../../LanguageContext';
import { cn, formatDisplayDate, CATEGORY_ICONS, timeAgo, getImageUrl } from '../../utils';
import { updateItemStatus, deleteItem, type Item } from '../../services/items';
import toast from 'react-hot-toast';

interface ItemCardProps {
  item: Item;
  onStartChat: (item: Item) => void;
  onViewDetail: (item: Item) => void;
  index?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onStartChat, onViewDetail, index = 0 }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isOwner = user?._id === item.reportedBy;
  const isAdmin = user?.role === 'admin';

  const handleStatusUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = item.status === 'active' ? 'resolved' : 'active';
      await updateItemStatus(item.id, newStatus);
      toast.success(t('statusUpdated'));
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('confirmDelete'))) {
      try {
        await deleteItem(item.id);
        toast.success(t('deleteSuccess'));
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => onViewDetail(item)}
      className={cn(
        'bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] overflow-hidden',
        'hover:shadow-lg hover:border-[var(--accent-primary-muted)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col',
        item.status === 'resolved' && 'opacity-60',
      )}
    >
      {/* Image */}
      {item.imageUrl ? (
        <div className="h-48 w-full overflow-hidden bg-[var(--bg-input)] relative">
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={item.type as 'lost' | 'found'}>{t(item.type)}</Badge>
          </div>
        </div>
      ) : (
        <div className="px-5 pt-5 flex gap-2">
          <Badge variant={item.type as 'lost' | 'found'}>{t(item.type)}</Badge>
          <Badge variant={item.status as 'active' | 'resolved'}>{t(item.status)}</Badge>
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 flex-1">
            {CATEGORY_ICONS[item.category] || '📦'} {item.title}
          </h3>
          {item.imageUrl && (
            <Badge variant={item.status as 'active' | 'resolved'} className="flex-shrink-0">
              {t(item.status)}
            </Badge>
          )}
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 flex-1">
          {item.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatDisplayDate(item.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Tag className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{item.category}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {item.reportedByName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate block max-w-[100px]">
                {item.reportedByName}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(item.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isOwner && item.status === 'active' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartChat(item);
                }}
                className="flex items-center gap-1.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {t('contact')}
              </button>
            )}
            {(isOwner || isAdmin) && (
              <>
                <button
                  onClick={handleStatusUpdate}
                  className="p-1.5 rounded-lg hover:bg-[var(--accent-primary-soft)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
                  title={t('markResolved')}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-[var(--status-lost-soft)] text-[var(--text-muted)] hover:text-[var(--status-lost)] transition-all"
                  title={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
