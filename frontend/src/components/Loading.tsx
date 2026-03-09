import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  text,
  className = ''
}) => {
  // Size mappings for the spinner
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  // Size mappings for the text
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-300
          border-t-blue-500
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="loading"
      />
      {text && (
        <p className={`
          mt-2
          text-gray-600
          ${textSizes[size]}
          animate-pulse
        `}>
          {text}
        </p>
      )}
    </div>
  );
};

// Alternative Skeleton Loading Component
export const SkeletonLoading: React.FC<LoadingProps> = ({
  size = 'medium',
  className = ''
}) => {
  const skeletonSizes = {
    small: 'h-4 w-24',
    medium: 'h-6 w-32',
    large: 'h-8 w-48'
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        className={`
          ${skeletonSizes[size]}
          bg-gray-200
          rounded
          animate-pulse
        `}
      />
      <div
        className={`
          ${skeletonSizes[size]}
          bg-gray-200
          rounded
          animate-pulse
          w-3/4
        `}
      />
      <div
        className={`
          ${skeletonSizes[size]}
          bg-gray-200
          rounded
          animate-pulse
          w-1/2
        `}
      />
    </div>
  );
};

export default Loading;