'use client';

import React, { memo, useMemo } from 'react';
import AppIcon from './AppIcon';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string; // Image source (optional)
  iconName?: string; // Icon name when no image
  size?: number; // Size for icon/image
  width?: number;
  height?: number;
  className?: string; // Additional classes
  onClick?: () => void; // Click handler
}

const DEFAULT_LOGO_WIDTH = 905;
const DEFAULT_LOGO_HEIGHT = 227;
const DEFAULT_LOGO_RATIO = DEFAULT_LOGO_WIDTH / DEFAULT_LOGO_HEIGHT;

const AppLogo = memo(function AppLogo({
  src = '/assets/images/skybird-logo.png',
  iconName = 'SparklesIcon',
  size = 64,
  width,
  height,
  className = '',
  onClick,
}: AppLogoProps) {
  // Memoize className calculation
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  const resolvedDimensions = useMemo(() => {
    if (width && height) {
      return { width, height };
    }

    if (width) {
      return { width, height: Math.round(width / DEFAULT_LOGO_RATIO) };
    }

    if (height) {
      return { width: Math.round(height * DEFAULT_LOGO_RATIO), height };
    }

    return { width: Math.round(size * DEFAULT_LOGO_RATIO), height: size };
  }, [width, height, size]);

  return (
    <div className={containerClassName} onClick={onClick}>
      {/* Show image if src provided, otherwise show icon */}
      {src ? (
        <AppImage
          src={src}
          alt="Sky Bird"
          width={resolvedDimensions.width}
          height={resolvedDimensions.height}
          className="flex-shrink-0"
          priority={true}
          unoptimized={src.endsWith('.svg')}
          disableLoadingBg
        />
      ) : (
        <AppIcon name={iconName} size={size} className="flex-shrink-0" />
      )}
    </div>
  );
});

export default AppLogo;
