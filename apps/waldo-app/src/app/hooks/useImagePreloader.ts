import { useEffect, useState } from 'react';

/**
 * Hook to preload images in the background
 * @param imageSrcs Array of image source URLs to preload
 * @returns Object with loading state and loaded count
 */
export function useImagePreloader(imageSrcs: string[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageSrcs.length === 0) {
      setIsLoading(false);
      return;
    }

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

      img.onerror = () => {
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
  }, [imageSrcs]);

  return { isLoading, loadedCount, totalCount: imageSrcs.length };
}
