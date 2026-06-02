import { useState } from 'react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
}

export function ImageWithLoader({ src, alt, className, fallbackSrc, containerClassName, ...props }: ImageWithLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const currentSrc = error && fallbackSrc ? fallbackSrc : src;

  return (
    <div className={cn("relative overflow-hidden w-full h-full", containerClassName)}>
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full z-10" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          className,
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!error && fallbackSrc && src !== fallbackSrc) {
            setError(true);
            setIsLoaded(false); // Restart loading state for the fallback image
          } else {
            setIsLoaded(true); // If even fallback fails, just stop the skeleton
          }
        }}
        {...props}
      />
    </div>
  );
}
