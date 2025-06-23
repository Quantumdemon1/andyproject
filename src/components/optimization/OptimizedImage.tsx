
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
  quality?: number;
  blur?: boolean;
  priority?: boolean;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  fallbackSrc,
  quality = 80,
  blur = true,
  priority = false,
  onLoadStart,
  onLoadComplete,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Optimize image URL (would integrate with a CDN in production)
  const optimizeImageUrl = useCallback((url: string): string => {
    // In a real app, this would add query parameters for a CDN like Cloudinary
    // For now, we'll just return the original URL
    if (url.includes('?')) {
      return `${url}&q=${quality}`;
    }
    return `${url}?q=${quality}`;
  }, [quality]);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  useEffect(() => {
    if (isInView && !currentSrc) {
      const optimizedSrc = optimizeImageUrl(src);
      setCurrentSrc(optimizedSrc);
      onLoadStart?.();
    }
  }, [isInView, currentSrc, src, optimizeImageUrl, onLoadStart]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoaded(true);
    onError?.();
    
    // Try fallback source
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setError(false);
      setIsLoaded(false);
    }
  }, [fallbackSrc, currentSrc, onError]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <Skeleton 
          className={`absolute inset-0 ${placeholderClassName}`}
          style={{
            filter: blur ? 'blur(8px)' : 'none',
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
      
      {/* Actual image */}
      {isInView && currentSrc && !error && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}

      {/* Error state */}
      {error && (
        <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <span className="text-sm">Image unavailable</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
