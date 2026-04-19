import React from 'react';
import { cn } from '../../utils';

interface BadgeProps {
  variant: 'lost' | 'found' | 'active' | 'resolved';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  lost: 'bg-[var(--status-lost-soft)] text-[var(--status-lost)] border-[var(--status-lost)]',
  found: 'bg-[var(--status-found-soft)] text-[var(--status-found)] border-[var(--status-found)]',
  active: 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border-[var(--accent-primary)]',
  resolved: 'bg-[var(--status-resolved-soft)] text-[var(--status-resolved)] border-[var(--status-resolved)]',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
