import { useState, useCallback } from 'react';

export interface GameState {
  currentImageIndex: number;
  foundImages: Set<string>;
  skippedImages: Set<string>;
  attempts: number;
  currentImageAttempts: number; // Track attempts for current image
  isComplete: boolean;
}

export function useGameState(totalImages: number) {
  const [state, setState] = useState<GameState>({
    currentImageIndex: 0,
    foundImages: new Set<string>(),
    skippedImages: new Set<string>(),
    attempts: 0,
    currentImageAttempts: 0,
    isComplete: false,
  });

  const nextImage = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentImageIndex + 1;
      return {
        ...prev,
        currentImageIndex: nextIndex,
        currentImageAttempts: 0, // Reset per-image attempts
        isComplete: nextIndex >= totalImages,
      };
    });
  }, [totalImages]);

  const skipImage = useCallback((imageId: string) => {
    setState((prev) => {
      const newSkipped = new Set(prev.skippedImages);
      newSkipped.add(imageId);
      return {
        ...prev,
        skippedImages: newSkipped,
      };
    });
    nextImage();
  }, [nextImage]);

  const foundWaldo = useCallback((imageId: string) => {
    setState((prev) => {
      const newFound = new Set(prev.foundImages);
      newFound.add(imageId);
      return {
        ...prev,
        foundImages: newFound,
      };
    });
  }, []);

  const recordAttempt = useCallback(() => {
    setState((prev) => ({
      ...prev,
      attempts: prev.attempts + 1,
      currentImageAttempts: prev.currentImageAttempts + 1,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentImageIndex: 0,
      foundImages: new Set<string>(),
      skippedImages: new Set<string>(),
      attempts: 0,
      currentImageAttempts: 0,
      isComplete: false,
    });
  }, []);

  return {
    state,
    nextImage,
    skipImage,
    foundWaldo,
    recordAttempt,
    reset,
  };
}
