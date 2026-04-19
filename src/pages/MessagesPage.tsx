import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { ChatList } from '../components/chat/ChatList';
import { ChatRoom } from '../components/chat/ChatRoom';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../utils';

interface MessagesPageProps {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ activeChatId, setActiveChatId }) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Chat List */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96 border-r border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col h-full',
          activeChatId ? 'hidden md:flex' : 'flex',
        )}
      >
        <ChatList activeChatId={activeChatId} onSelectChat={setActiveChatId} />
      </div>

      {/* Chat Room */}
      <div
        className={cn(
          'flex-1 flex flex-col h-full bg-[var(--bg-primary)]',
          !activeChatId ? 'hidden md:flex items-center justify-center' : 'flex',
        )}
      >
        {!activeChatId ? (
          <EmptyState
            icon={<MessageSquare className="w-8 h-8 text-[var(--text-muted)]" />}
            title={t('selectChat')}
            description={t('selectChatDesc')}
          />
        ) : (
          <ChatRoom chatId={activeChatId} onBack={() => setActiveChatId(null)} />
        )}
      </div>
    </div>
  );
};
