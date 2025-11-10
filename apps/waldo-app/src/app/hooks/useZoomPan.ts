import { useState, useCallback } from 'react';

export interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
}

export function useZoomPan(minScale = 1, maxScale = 4) {
  const [transform, setTransform] = useState<ZoomPanState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  const handleZoom = useCallback(
    (delta: number, centerX = 0.5, centerY = 0.5) => {
      setTransform((prev) => {
        // Calculate new scale
        let newScale = prev.scale + delta;
        newScale = Math.max(minScale, Math.min(maxScale, newScale));

        // If we're at the boundaries, don't change anything
        if (newScale === prev.scale) {
          return prev;
        }

        // Adjust translation to zoom toward the center point
        const scaleDiff = newScale - prev.scale;
        const newTranslateX = prev.translateX - centerX * scaleDiff * 100;
        const newTranslateY = prev.translateY - centerY * scaleDiff * 100;

        return {
          scale: newScale,
          translateX: newTranslateX,
          translateY: newTranslateY,
        };
      });
    },
    [minScale, maxScale]
  );

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setTransform((prev) => {
      // Limit pan based on scale
      const maxTranslate = (prev.scale - 1) * 50;

      return {
        ...prev,
        translateX: Math.max(
          -maxTranslate,
          Math.min(maxTranslate, prev.translateX + deltaX)
        ),
        translateY: Math.max(
          -maxTranslate,
          Math.min(maxTranslate, prev.translateY + deltaY)
        ),
      };
    });
  }, []);

  const reset = useCallback(() => {
    setTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  return {
    transform,
    handleZoom,
    handlePan,
    reset,
  };
}
