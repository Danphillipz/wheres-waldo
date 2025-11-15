import { useEffect, useState, useRef } from 'react';

/**
 * Hook to preload images in the background
 * @param imageSrcs Array of image source URLs to preload
 * @returns Object with loading state and loaded count
 */
export function useImagePreloader(imageSrcs: string[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasPreloaded = useRef(false);

  useEffect(() => {
    // Prevent multiple preload attempts
    if (hasPreloaded.current) {
      return;
    }

    if (imageSrcs.length === 0) {
      setIsLoading(false);
      return;
    }

    hasPreloaded.current = true;
    let loadedImages = 0;
    const imageElements: HTMLImageElement[] = [];

    imageSrcs.forEach((src) => {
      const img = new Image();
      imageElements.push(img);

      img.onload = () => {
        loadedImages++;
        setLoadedCount(loadedImages);
        
        if (loadedImages === imageSrcs.length) {
          setIsLoading(false);
        }
      };

      img.onerror = (error) => {
        console.error('Failed to load image:', src, error);
        // Count errors as loaded to prevent infinite loading
        loadedImages++;
        setLoadedCount(loadedImages);
        
        if (loadedImages === imageSrcs.length) {
          setIsLoading(false);
        }
      };

      img.src = src;
    });

    // Cleanup function
    return () => {
      imageElements.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

  return { isLoading, loadedCount, totalCount: imageSrcs.length };
}
