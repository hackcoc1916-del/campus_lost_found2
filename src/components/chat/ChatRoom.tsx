import React, { useEffect, useState, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useLanguage } from '../../LanguageContext';
import { cn } from '../../utils';
import { subscribeChatInfo, subscribeMessages, sendMessage, type Chat, type Message } from '../../services/chat';
import { format } from 'date-fns';

interface ChatRoomProps {
  chatId: string;
  onBack: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ chatId, onBack }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub1 = subscribeChatInfo(chatId, setChatInfo);
    const unsub2 = subscribeMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => { unsub1(); unsub2(); };
  }, [chatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      await sendMessage(chatId, user._id, text);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!chatInfo || !user) return null;

  const otherUserId = chatInfo.participants.find((id) => id !== user._id) || '';
  const otherUserName = chatInfo.participantNames[otherUserId] || 'User';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-default)] flex items-center gap-3 shadow-sm z-10">
        <button
          onClick={onBack}
          className="md:hidden p-2 text-[var(--text-muted)] hover:bg-[var(--bg-input)] rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-sm">
          {otherUserName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{otherUserName}</h3>
          <p className="text-xs text-[var(--accent-primary)] font-medium truncate">{chatInfo.itemTitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user._id;
          const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
          const time = format(new Date(msg.createdAt), 'p');

          return (
            <div
              key={msg.id}
              className={cn('flex gap-2 max-w-[80%]', isMe ? 'ml-auto flex-row-reverse' : '')}
            >
              {showAvatar ? (
                <div className="w-7 h-7 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                  {isMe ? (user.name?.charAt(0) || 'U') : otherUserName.charAt(0)}
                </div>
              ) : (
                <div className="w-7 flex-shrink-0" />
              )}
              <div className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'px-3.5 py-2.5 rounded-2xl text-sm',
                    isMe
                      ? 'bg-[var(--accent-primary)] text-white rounded-tr-sm'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-tl-sm',
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1">{time}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-default)]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('typeMessage')}
            className="flex-1 bg-[var(--bg-input)] border-none rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-[var(--accent-primary)] font-medium outline-none text-[var(--text-primary)]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-white p-2.5 rounded-full transition-all shadow-sm flex-shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
