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
      // Special: Water ripples (concentric horizontal ripples as in attached image)
      return (
        <span
          title="Special Attack (Water Ripples)"
          className={`inline-flex items-center justify-center shrink-0 leading-none select-none text-slate-800 dark:text-slate-100 ${containerSize} ${className}`}
        >
          <svg
            viewBox="0 0 100 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="8.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full object-contain"
          >
            {/* Outer water ripple */}
            <ellipse cx="50" cy="30" rx="46" ry="24" />
            {/* Middle water ripple */}
            <ellipse cx="50" cy="30" rx="31" ry="16" />
            {/* Inner water ripple */}
            <ellipse cx="50" cy="30" rx="16" ry="8" />
          </svg>
        </span>
      );

    case 'status':
      // Status: Pokemon Status Move Yin-Yang badge as in attached reference image
      return (
        <span
          title="Status Move (Yin Yang)"
          className={`inline-flex items-center justify-center shrink-0 leading-none select-none ${containerSize} ${className}`}
        >
          <svg
            viewBox="0 0 100 50"
            className="w-full h-full object-contain"
          >
            {/* Outer grey rectangular badge with dark rounded border */}
            <rect
              x="2"
              y="2"
              width="96"
              height="46"
              rx="4"
              fill="#94a3b8"
              stroke="#292524"
              strokeWidth="4"
            />
            {/* White outer ellipse boundary */}
            <ellipse
              cx="50"
              cy="25"
              rx="30"
              ry="17"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
            />
            {/* White Yin-Yang swirl shape */}
            {/* Upper-right circular teardrop */}
            <path
              d="M 50 8 C 65 8 76 15 76 25 C 76 34 66 41 53 41 C 41 41 38 33 46 25 C 52 19 62 19 62 14 C 62 10 56 8 50 8 Z"
              fill="#ffffff"
            />
            {/* Lower-left sweeping crescent tail */}
            <path
              d="M 23 25 C 23 15 34 8 50 8 C 42 8 34 11 28 17 C 23 22 23 25 23 25 C 23 34 32 41 48 42 C 34 41 27 34 27 26 C 27 18 38 15 44 15 C 50 15 54 11 54 9 C 50 8 40 8 32 12 C 26 15 23 20 23 25 Z"
              fill="#ffffff"
            />
          </svg>
        </span>
      );
  }
};
