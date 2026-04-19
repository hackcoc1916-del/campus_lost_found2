import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = [
  'Electronics',
  'Pets',
  'Personal Items',
  'Documents',
  'Books',
  'Clothing',
  'Keys',
  'Wallets',
  'Bags',
  'Accessories',
  'Others',
];

export const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '💻',
  Pets: '🐾',
  'Personal Items': '👤',
  Documents: '📄',
  Books: '📚',
  Clothing: '👕',
  Keys: '🔑',
  Wallets: '👛',
  Bags: '🎒',
  Accessories: '⌚',
  Others: '📦',
};

export const formatDisplayDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDisplayDate(dateString);
};
