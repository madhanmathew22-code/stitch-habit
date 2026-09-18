import React from 'react';
import { getHabitIconDefinition } from './habitIconsData';

interface HabitIconDisplayProps {
  iconId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'soft' | 'solid';
}

export default function HabitIconDisplay({
  iconId,
  size = 'md',
  className = '',
  variant = 'soft',
}: HabitIconDisplayProps) {
  const def = getHabitIconDefinition(iconId);
  const IconComponent = def.Icon;

  // Sizing configurations
  const sizeMap = {
    xs: { container: 'w-6 h-6 rounded-md', icon: 'w-3.5 h-3.5' },
    sm: { container: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4' },
    md: { container: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
    lg: { container: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6' },
    xl: { container: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const colorStyles =
    variant === 'solid'
      ? `${def.activeBg} text-white`
      : `${def.bgColor} ${def.textColor}`;

  return (
    <div
      data-purpose="habit-icon-display"
      className={`${currentSize.container} ${colorStyles} flex items-center justify-center shrink-0 transition-all ${className}`}
      title={def.label}
    >
      <IconComponent className={`${currentSize.icon} stroke-[2.2]`} />
    </div>
  );
}
