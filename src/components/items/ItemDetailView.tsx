import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Calendar, Tag, User, Clock, MessageSquare, CheckCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SmartMatchPanel } from './SmartMatchPanel';
import { useAuth } from '../../AuthContext';
import { useLanguage } from '../../LanguageContext';
import { cn, formatDisplayDate, CATEGORY_ICONS, timeAgo, getImageUrl } from '../../utils';
import { updateItemStatus, deleteItem, type Item } from '../../services/items';
import toast from 'react-hot-toast';

interface ItemDetailViewProps {
  item: Item;
  onBack: () => void;
  onStartChat: (item: Item) => void;
  onViewMatch: (item: Item) => void;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({ item, onBack, onStartChat, onViewMatch }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isOwner = user?._id === item.reportedBy;
  const isAdmin = user?.role === 'admin';

  const handleStatusUpdate = async () => {
    try {
      const newStatus = item.status === 'active' ? 'resolved' : 'active';
      await updateItemStatus(item.id, newStatus);
      toast.success(t('statusUpdated'));
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        await deleteItem(item.id);
        toast.success(t('deleteSuccess'));
        onBack();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto"
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-default)] px-4 md:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />} size="sm">
            {t('back')}
          </Button>
          <div className="flex items-center gap-2">
            {(isOwner || isAdmin) && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStatusUpdate}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  {item.status === 'active' ? t('markResolved') : t('active')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  {t('delete')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            {item.imageUrl && (
              <div className="rounded-2xl overflow-hidden bg-[var(--bg-input)] shadow-md">
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.title}
                  className="w-full max-h-[400px] object-cover"
                />
              </div>
            )}

            {/* Title and badges */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={item.type as 'lost' | 'found'}>{t(item.type)}</Badge>
                <Badge variant={item.status as 'active' | 'resolved'}>{t(item.status)}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
                {CATEGORY_ICONS[item.category] || '📦'} {item.title}
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Reported {timeAgo(item.createdAt)}
              </p>
            </div>

            {/* Description */}
            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] p-6">
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                {t('description')}
              </h3>
              <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <MapPin className="w-4 h-4" />, label: t('location'), value: item.location },
                { icon: <Calendar className="w-4 h-4" />, label: t('date'), value: formatDisplayDate(item.date) },
                { icon: <Tag className="w-4 h-4" />, label: t('category'), value: item.category },
                { icon: <Clock className="w-4 h-4" />, label: t('status'), value: t(item.status) },
              ].map((meta, idx) => (
                <div key={idx} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
                  <div className="flex items-center gap-2 mb-1 text-[var(--text-muted)]">
                    {meta.icon}
                    <span className="text-xs font-semibold">{meta.label}</span>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{meta.value}</p>
                </div>
              ))}
            </div>

            {/* Reporter info */}
            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] p-6">
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                {t('reportedBy')}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-lg">
                    {item.reportedByName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">{item.reportedByName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDisplayDate(item.createdAt)}</p>
                  </div>
                </div>
                {!isOwner && item.status === 'active' && (
                  <Button
                    variant="primary"
                    onClick={() => onStartChat(item)}
                    icon={<MessageSquare className="w-4 h-4" />}
                  >
                    {t('contactReporter')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact CTA */}
            {!isOwner && item.status === 'active' && (
              <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] p-5">
                <h3 className="font-bold text-[var(--text-primary)] mb-2">
                  {item.type === 'lost' ? 'Found this item?' : 'Is this yours?'}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Contact the reporter to help reunite this item with its owner.
                </p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => onStartChat(item)}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  {t('contactReporter')}
                </Button>
              </div>
            )}

            {/* AI Smart Match — only for lost items */}
            {item.type === 'lost' && item.status === 'active' && (
              <SmartMatchPanel
                item={item}
                onViewMatch={onViewMatch}
                onStartChat={onStartChat}
              />
            )}

            {/* No image placeholder */}
            {!item.imageUrl && (
              <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-[var(--bg-input)] flex items-center justify-center mb-3">
                  <ImageIcon className="w-7 h-7 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-muted)]">No image provided</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
