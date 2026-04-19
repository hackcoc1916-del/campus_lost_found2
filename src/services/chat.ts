import { api } from './api';

export interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  itemId: string;
  itemTitle: string;
  lastMessage: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export const subscribeChats = (
  userId: string,
  callback: (chats: Chat[]) => void,
) => {
  let active = true;

  const fetchData = async () => {
    try {
      const chats = await api.get('/api/chats');
      if (active) callback(chats);
    } catch (error) {
      console.error('Fetch chats error:', error);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 5000); // Poll every 5s

  return () => {
    active = false;
    clearInterval(interval);
  };
};

export const subscribeMessages = (
  chatId: string,
  callback: (messages: Message[]) => void,
) => {
  let active = true;

  const fetchData = async () => {
    try {
      const messages = await api.get(`/api/messages/${chatId}`);
      if (active) callback(messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 2000); // Poll every 2s for near-realtime

  return () => {
    active = false;
    clearInterval(interval);
  };
};

export const subscribeChatInfo = (
  chatId: string,
  callback: (chat: Chat | null) => void,
) => {
  let active = true;

  const fetchData = async () => {
    try {
      const chats: Chat[] = await api.get('/api/chats');
      const chat = chats.find((c) => c.id === chatId) || null;
      if (active) callback(chat);
    } catch {
      if (active) callback(null);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 5000);

  return () => {
    active = false;
    clearInterval(interval);
  };
};

export const startOrGetChat = async (
  currentUserId: string,
  currentUserName: string,
  _currentUserPhoto: string | undefined,
  item: { id: string; title: string; reportedBy: string; reportedByName: string; reportedByPhoto?: string },
): Promise<string> => {
  const result = await api.post('/api/chats', {
    itemId: item.id,
    itemTitle: item.title,
    otherUserId: item.reportedBy,
    otherUserName: item.reportedByName,
    currentUserName,
  });
  return result.id;
};

export const sendMessage = async (
  chatId: string,
  _senderId: string,
  text: string,
): Promise<void> => {
  await api.post('/api/messages', { chatId, text });
};
