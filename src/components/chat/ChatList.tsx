import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useLanguage } from '../../LanguageContext';
import { EmptyState } from '../ui/EmptyState';
import { cn, timeAgo } from '../../utils';
import { subscribeChats, type Chat } from '../../services/chat';

interface ChatListProps {
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ activeChatId, onSelectChat }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeChats(user._id, setChats);
    return unsub;
  }, [user]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-[var(--border-default)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('messages')}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-8 h-8 text-[var(--text-muted)]" />}
            title={t('noMessages')}
            description={t('noMessagesDesc')}
            className="py-10"
          />
        ) : (
          chats.map((chat) => {
            const otherUserId = chat.participants.find((id) => id !== user?._id) || '';
            const otherUserName = chat.participantNames[otherUserId] || 'User';
            const isActive = chat.id === activeChatId;

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  'w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 cursor-pointer',
                  isActive
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'hover:bg-[var(--bg-input)]',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--accent-primary)] text-white',
                  )}
                >
                  {otherUserName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className={cn('text-sm font-bold truncate', isActive ? 'text-white' : 'text-[var(--text-primary)]')}>
                      {otherUserName}
                    </h4>
                    <span className={cn('text-[10px] flex-shrink-0 ml-2', isActive ? 'text-white/70' : 'text-[var(--text-muted)]')}>
                      {timeAgo(chat.updatedAt)}
                    </span>
                  </div>
                  <p className={cn('text-xs font-medium truncate', isActive ? 'text-white/80' : 'text-[var(--accent-primary)]')}>
                    {chat.itemTitle}
                  </p>
                  <p className={cn('text-xs truncate mt-0.5', isActive ? 'text-white/60' : 'text-[var(--text-muted)]')}>
                    {chat.lastMessage || '...'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
