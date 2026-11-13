import React from 'react';
import { MoveCategory } from '../types/pokemon';

interface MoveCategoryIconProps {
  category: MoveCategory;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MoveCategoryIcon: React.FC<MoveCategoryIconProps> = ({
  category,
  className = '',
  size = 'md',
}) => {
  // Proportional icon dimensions
  const containerSize = {
    sm: 'w-4 h-3.5',
    md: 'w-5 h-4',
    lg: 'w-6 h-5',
  }[size];

  switch (category) {
    case 'physical':
      // Physical: keep current icon (💥 explosion)
      return (
        <span
          title="Physical Attack"
          className={`inline-flex items-center justify-center shrink-0 leading-none select-none text-orange-500 font-bold ${containerSize} ${className}`}
        >
          <span className={size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-base' : 'text-xs'}>
            💥
          </span>
        </span>
      );

    case 'special':
      // Special: Water ripples from attached image (/assets/aistudio/image_a143f77a.png)
      return (
        <span
          title="Special Attack (Water Ripples)"
          className={`inline-flex items-center justify-center shrink-0 leading-none select-none ${containerSize} ${className}`}
        >
          <img
            src="/assets/aistudio/image_a143f77a.png"
            alt="Special"
            className="w-full h-full object-contain dark:invert"
          />
        </span>
      );

    case 'status':
      // Status: Yin-Yang symbol from user attachment (/assets/aistudio/imageedit_8_2797254726_77338e27.png)
      return (
        <span
          title="Status Move (Yin-Yang)"
          className={`inline-flex items-center justify-center shrink-0 leading-none select-none ${containerSize} ${className}`}
        >
          <img
            src="/assets/aistudio/imageedit_8_2797254726_77338e27.png"
            alt="Status"
            className="w-full h-full object-contain invert dark:invert-0"
          />
        </span>
      );
  }
};
