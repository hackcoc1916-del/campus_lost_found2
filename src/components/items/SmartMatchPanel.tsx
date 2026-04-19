import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { useLanguage } from '../../LanguageContext';
import { findSmartMatches, type MatchResult } from '../../services/ai-match';
import { type Item } from '../../services/items';
import { cn, CATEGORY_ICONS } from '../../utils';

interface SmartMatchPanelProps {
  item: Item;
  onViewMatch: (item: Item) => void;
  onStartChat: (item: Item) => void;
}

export const SmartMatchPanel: React.FC<SmartMatchPanelProps> = ({ item, onViewMatch, onStartChat }) => {
  const { t } = useLanguage();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await findSmartMatches(item);
      setMatches(results);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[var(--status-found)]';
    if (score >= 50) return 'text-yellow-500';
    return 'text-[var(--text-muted)]';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-[var(--status-found)]';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-[var(--text-muted)]';
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-default)] bg-gradient-to-r from-[var(--accent-primary-soft)] to-[var(--accent-teal-soft)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">{t('possibleMatches')}</h3>
            <p className="text-xs text-[var(--text-muted)]">{t('smartMatchInfo')}</p>
          </div>
        </div>

        {!hasSearched && (
          <Button
            variant="primary"
            onClick={handleFindMatches}
            loading={loading}
            icon={<Zap className="w-4 h-4" />}
            className="w-full mt-3"
          >
            {loading ? t('findingMatches') : t('findMatches')}
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="p-4">
        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-[var(--accent-primary)] animate-spin" />
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)] absolute -top-1 -right-1" />
            </div>
            <p className="text-sm text-[var(--text-muted)] font-medium">{t('findingMatches')}</p>
            <p className="text-xs text-[var(--text-muted)]">Analyzing {item.title} against found items...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--status-lost)] font-medium">{error}</p>
            <Button variant="ghost" onClick={handleFindMatches} className="mt-2" size="sm">
              Try again
            </Button>
          </div>
        )}

        {hasSearched && !loading && matches.length === 0 && (
          <EmptyState
            title={t('noMatches')}
            description={t('noMatchesDesc')}
            action={
              <Button variant="ghost" onClick={handleFindMatches} size="sm" icon={<Zap className="w-3.5 h-3.5" />}>
                Search again
              </Button>
            }
            className="py-6"
          />
        )}

        {matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((match, idx) => (
              <motion.div
                key={match.itemId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[var(--bg-input)] rounded-xl p-4 hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {CATEGORY_ICONS[match.matchedItem?.category || ''] || '📦'}{' '}
                      {match.matchedItem?.title}
                    </h4>
                    <Badge variant="found" className="mt-1">Found</Badge>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={cn('text-lg font-bold', getScoreColor(match.score))}>
                      {match.score}%
                    </span>
                    <div className="w-16 h-1.5 bg-[var(--border-default)] rounded-full mt-1 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getScoreBg(match.score))}
                        style={{ width: `${match.score}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">{match.explanation}</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => match.matchedItem && onViewMatch(match.matchedItem)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {t('viewDetails')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => match.matchedItem && onStartChat(match.matchedItem)}
                  >
                    {t('contact')}
                  </Button>
                </div>
              </motion.div>
            ))}

            <Button
              variant="ghost"
              onClick={handleFindMatches}
              size="sm"
              className="w-full"
              icon={<Zap className="w-3.5 h-3.5" />}
            >
              Search again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
