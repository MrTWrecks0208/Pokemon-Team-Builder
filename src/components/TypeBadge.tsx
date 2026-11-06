import React from 'react';
import { PokemonType } from '../types/pokemon';
import { TYPE_METADATA } from '../data/types';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md', className = '' }) => {
  const meta = TYPE_METADATA[type] || {
    label: type,
    badgeBg: 'bg-slate-500',
    badgeText: 'text-white',
    border: 'border-slate-400',
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] tracking-wider font-semibold rounded',
    md: 'px-2 py-0.5 text-xs font-semibold rounded-md shadow-xs',
    lg: 'px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center uppercase whitespace-nowrap border ${meta.badgeBg} ${meta.badgeText} ${meta.border} ${sizeClasses} ${className}`}
    >
      {meta.label}
    </span>
  );
};
