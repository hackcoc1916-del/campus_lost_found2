import { api } from './api';

export interface Item {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  category: string;
  location: string;
  date: string;
  reportedBy: string;
  reportedByName: string;
  reportedByPhoto?: string;
  status: 'active' | 'resolved';
  imageUrl?: string;
  createdAt: string;
}

export type NewItem = Omit<Item, 'id' | '_id'>;

export const subscribeItems = (
  callback: (items: Item[]) => void,
  filter?: { field: string; value: string },
) => {
  let active = true;

  const fetchData = async () => {
    try {
      const params = filter ? `?${filter.field}=${filter.value}` : '';
      const items = await api.get(`/api/items${params}`);
      if (active) callback(items);
    } catch (error) {
      console.error('Fetch items error:', error);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000); // Poll every 10s

  return () => {
    active = false;
    clearInterval(interval);
  };
};

export const getItem = async (itemId: string): Promise<Item | null> => {
  try {
    return await api.get(`/api/items/${itemId}`);
  } catch {
    return null;
  }
};

export const createItem = async (item: NewItem): Promise<string> => {
  const result = await api.post('/api/items', item);
  return result.id;
};

export const updateItemStatus = async (itemId: string, status: 'active' | 'resolved'): Promise<void> => {
  await api.put(`/api/items/${itemId}/status`, { status });
};

export const deleteItem = async (itemId: string): Promise<void> => {
  await api.delete(`/api/items/${itemId}`);
};
