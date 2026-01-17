import React, { useState } from 'react';

interface NeonAvatarProps {
  letter?: string;
  size?: number;
  animated?: boolean;
  className?: string;
}

export function NeonAvatar({ letter = 'M', size = 512, animated = true, className = '' }: NeonAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative ${className} cursor-pointer rounded-full overflow-hidden bg-white`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-white" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="font-bold transition-transform duration-300"
          style={{
            fontSize: `${size * 0.6}px`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            filter: isHovered ? 'drop-shadow(0 0 10px rgba(0,255,255,0.5))' : 'none'
          }}
        >
          {letter}
        </span>
      </div>
    </div>
  );
}