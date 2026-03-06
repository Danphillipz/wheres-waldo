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

        // If zooming back to minimum scale (100%), reset position
        if (newScale === minScale) {
          return {
            scale: newScale,
            translateX: 0,
            translateY: 0,
          };
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
      // Increase pan limit to allow seeing entire image
      // At higher zoom levels, we need more pan range
      const maxTranslate = (prev.scale - 1) * 100;

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

  const setScale = useCallback((newScale: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(minScale, Math.min(maxScale, newScale)),
    }));
  }, [minScale, maxScale]);

  const setTransformTo = useCallback((newTransform: ZoomPanState) => {
    setTransform({
      scale: Math.max(minScale, Math.min(maxScale, newTransform.scale)),
      translateX: newTransform.translateX,
      translateY: newTransform.translateY,
    });
  }, [minScale, maxScale]);

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
    setScale,
    setTransformTo,
    reset,
  };
}
