import { useRef, useState, useEffect, useCallback } from 'react';
import { WaldoImage } from '../../utils/imageData';
import {
  isClickNearTarget,
  isClickInRectangle,
  percentToPixels,
} from '../../utils/clickDetection';
import { useZoomPan } from '../../hooks/useZoomPan';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './ImageViewer.module.css';

interface ImageViewerProps {
  image: WaldoImage;
  nextImage?: WaldoImage; // Next image to preload
  onWaldoFound: () => void;
  onImageClick: () => void;
  clearMarkers?: boolean;
  hintRequested?: boolean; // When true, triggers the hint animation
  onHintAnimationComplete?: () => void; // Called when hint animation finishes
}

interface ClickMarker {
  id: number;
  x: number;
  y: number;
}

const HINT_ZOOM_SCALE = 3;
const HINT_RESET_DELAY_MS = 600;
const HINT_ANIMATION_DURATION_MS = 2500;
const IMAGE_CENTER = 0.5;

export function ImageViewer({
  image,
  nextImage,
  onWaldoFound,
  onImageClick,
  clearMarkers = false,
  hintRequested = false,
  onHintAnimationComplete,
}: ImageViewerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { transform, handleZoom, handlePan, setScale, setTransformTo, reset } = useZoomPan(1, 8);
  const [clickMarkers, setClickMarkers] = useState<ClickMarker[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const clickCounter = useRef(0);
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageLoaded, setCurrentImageLoaded] = useState(false);
  const loadStartTimeRef = useRef<number>(0);
  const preloadedImages = useRef<Set<string>>(new Set());
  const [isHintAnimating, setIsHintAnimating] = useState(false);
  const hintAnimationRef = useRef<number | null>(null);

  // Image loading state - show spinner for minimum 1 second
  useEffect(() => {
    setIsLoading(true);
    setCurrentImageLoaded(false);
    loadStartTimeRef.current = Date.now();
  }, [image.id]);

  // Preload next image - only after current image has loaded and only once per unique src
  useEffect(() => {
    if (currentImageLoaded && nextImage && !preloadedImages.current.has(nextImage.src)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = nextImage.src;
      document.head.appendChild(link);
      
      // Track that we've preloaded this image
      preloadedImages.current.add(nextImage.src);
      
      // Cleanup: remove the link after it's loaded (optional, browser will still cache)
      link.onload = () => {
        // Keep the link in DOM for better caching
      };
    }
  }, [currentImageLoaded, nextImage]);

  // Clear markers when clearMarkers prop changes or when image changes
  useEffect(() => {
    if (clearMarkers) {
      setClickMarkers([]);
    }
  }, [clearMarkers, image.id]);

  // Reset zoom when image changes
  useEffect(() => {
    reset();
  }, [image.id, reset]);

  // Get the center coordinates of the waldo location
  const getWaldoCenter = useCallback(() => {
    if (image.detectionType === 'rectangle') {
      const rect = image.waldoLocation as { x1: number; y1: number; x2: number; y2: number };
      return { x: (rect.x1 + rect.x2) / 2, y: (rect.y1 + rect.y2) / 2 };
    }
    const circle = image.waldoLocation as { x: number; y: number; tolerance: number };
    return { x: circle.x, y: circle.y };
  }, [image.detectionType, image.waldoLocation]);

  // Hint animation: reset zoom, then slowly zoom toward waldo
  // Use refs to avoid cleanup clearing active timeouts when state changes
  const hintZoomTimeoutRef = useRef<number | null>(null);
  const isHintRunningRef = useRef(false);

  useEffect(() => {
    if (!hintRequested || isHintRunningRef.current) return;

    isHintRunningRef.current = true;
    setIsHintAnimating(true);

    // Step 1: Reset to full image view
    reset();

    // Step 2: After a brief pause, slowly zoom toward waldo location
    hintZoomTimeoutRef.current = window.setTimeout(() => {
      const waldoCenter = getWaldoCenter();
      // Calculate translation to center on waldo
      // Transform model: scale(S) translate(Tx, Ty) with origin at center
      // To center waldo at (wx%, wy%), translate so that point maps to center
      const translateX = -(waldoCenter.x / 100 - IMAGE_CENTER) * HINT_ZOOM_SCALE * 100;
      const translateY = -(waldoCenter.y / 100 - IMAGE_CENTER) * HINT_ZOOM_SCALE * 100;
      
      setTransformTo({
        scale: HINT_ZOOM_SCALE,
        translateX,
        translateY,
      });

      // Step 3: After animation completes, notify parent
      hintAnimationRef.current = window.setTimeout(() => {
        setIsHintAnimating(false);
        isHintRunningRef.current = false;
        onHintAnimationComplete?.();
      }, HINT_ANIMATION_DURATION_MS);
    }, HINT_RESET_DELAY_MS);
  }, [hintRequested, reset, getWaldoCenter, setTransformTo, onHintAnimationComplete]);

  // Reset the running ref when hintRequested is cleared
  useEffect(() => {
    if (!hintRequested) {
      isHintRunningRef.current = false;
    }
  }, [hintRequested]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hintZoomTimeoutRef.current) {
        window.clearTimeout(hintZoomTimeoutRef.current);
      }
      if (hintAnimationRef.current) {
        window.clearTimeout(hintAnimationRef.current);
      }
    };
  }, []);

  const handleImageClick = (
    event: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>
  ) => {
    // Don't register clicks during hint animation
    if (isHintAnimating) {
      return;
    }
    
    // Don't register clicks if user was dragging or pinching
    if (hasDragged || isPinching) {
      return;
    }
    
    // Don't register clicks on multi-touch gestures
    if ('touches' in event.nativeEvent && event.nativeEvent.touches.length > 1) {
      return;
    }
    
    // For touch events, check if this was a quick tap (not a drag)
    if ('touches' in event.nativeEvent) {
      const timeSinceTouchStart = Date.now() - touchStartTime.current;
      if (timeSinceTouchStart > 300) return; // Was a drag, not a tap
      
      // Check if finger moved significantly during touch
      if (touchStartPosition.current) {
        const touch = event.nativeEvent.touches[0] || event.nativeEvent.changedTouches[0];
        if (touch) {
          const dx = Math.abs(touch.clientX - touchStartPosition.current.x);
          const dy = Math.abs(touch.clientY - touchStartPosition.current.y);
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 10) return; // Moved more than 10px, not a tap
        }
      }
    }

    const imgElement = imageRef.current;
    if (!imgElement) return;

    // Get the actual position of the click relative to the container (not the scaled image)
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    let clientX: number;
    let clientY: number;

    // Handle touch events
    if ('touches' in event.nativeEvent && event.nativeEvent.touches.length > 0) {
      const touch = event.nativeEvent.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    }
    // Handle mouse events
    else if ('clientX' in event.nativeEvent) {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    } else {
      return;
    }

    // Calculate the click position relative to the image element (which is scaled)
    const imgRect = imgElement.getBoundingClientRect();
    const x = clientX - imgRect.left;
    const y = clientY - imgRect.top;

    // Convert to percentage of the actual image size (not scaled)
    const xPercent = (x / imgRect.width) * 100;
    const yPercent = (y / imgRect.height) * 100;

    const clickCoords = {
      x: Math.max(0, Math.min(100, xPercent)),
      y: Math.max(0, Math.min(100, yPercent)),
    };

    // Check if click found Waldo based on detection type
    let waldoFound = false;
    
    if (image.detectionType === 'rectangle') {
      // Rectangle detection - click coordinates are already in percentages
      waldoFound = isClickInRectangle(clickCoords, image.waldoLocation as { x1: number; y1: number; x2: number; y2: number });
    } else {
      // Circle detection - use pixel calculations
      const clickPixels = percentToPixels(clickCoords, imgRect.width, imgRect.height);
      const waldoLocation = image.waldoLocation as { x: number; y: number; tolerance: number };
      const waldoPixels = percentToPixels(
        { x: waldoLocation.x, y: waldoLocation.y },
        imgRect.width,
        imgRect.height
      );

      // Scale tolerance based on zoom level - when zoomed out, reduce tolerance
      // At scale 1 (zoomed out), use 50% of tolerance for tighter accuracy
      // At scale 4 (fully zoomed in), use 100% of tolerance
      const toleranceScale = 0.5 + (transform.scale - 1) * (0.5 / 3); // Linear scale from 0.5 to 1.0
      const scaledTolerance = waldoLocation.tolerance * toleranceScale;

      waldoFound = isClickNearTarget(clickPixels, waldoPixels, scaledTolerance);
    }

    // Check if click is near Waldo
    if (waldoFound) {
      onWaldoFound();
    } else {
      onImageClick();
      // Add a marker for the missed click - store actual pixel position relative to container
      const markerX = clientX - containerRect.left;
      const markerY = clientY - containerRect.top;
      const markerId = clickCounter.current++;
      
      setClickMarkers((prev) => [
        ...prev,
        { id: markerId, x: markerX, y: markerY },
      ]);
      
      // Remove the marker after 750ms
      setTimeout(() => {
        setClickMarkers((prev) => prev.filter((m) => m.id !== markerId));
      }, 750);
    }
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.2 : 0.2;
    handleZoom(delta);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (transform.scale > 1) {
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = (event.clientX - dragStart.x) / transform.scale;
      const deltaY = (event.clientY - dragStart.y) / transform.scale;
      
      // If user moved more than 5 pixels, consider it a drag
      const distance = Math.sqrt(Math.pow(event.clientX - dragStart.x, 2) + Math.pow(event.clientY - dragStart.y, 2));
      if (distance > 5) {
        setHasDragged(true);
      }
      
      handlePan(deltaX, deltaY);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset hasDragged after a short delay to allow click handler to check it
    setTimeout(() => setHasDragged(false), 50);
  };

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartTime.current = Date.now();
    
    if (event.touches.length === 2) {
      // Two-finger pinch gesture
      event.preventDefault();
      const distance = getTouchDistance(event.touches);
      setLastTouchDistance(distance);
      setIsDragging(false);
      setIsPinching(true);
      setHasDragged(false); // Reset for new gesture
    } else if (event.touches.length === 1) {
      // Single finger - store starting position for tap detection
      touchStartPosition.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
      setIsDragging(transform.scale > 1);
      setDragStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
      setLastTouchDistance(null);
      setIsPinching(false);
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && lastTouchDistance !== null) {
      // Pinch zoom
      event.preventDefault();
      const currentDistance = getTouchDistance(event.touches);
      const scaleDelta = (currentDistance - lastTouchDistance) * 0.01;
      
      // Apply zoom based on pinch distance change
      const newScale = transform.scale + scaleDelta;
      setScale(newScale);
      setLastTouchDistance(currentDistance);
      setHasDragged(true); // Mark as dragged to prevent click
    } else if (event.touches.length === 1 && isDragging) {
      // Pan/drag
      event.preventDefault();
      const deltaX = (event.touches[0].clientX - dragStart.x) / transform.scale;
      const deltaY = (event.touches[0].clientY - dragStart.y) / transform.scale;
      
      // Check if user has moved enough to count as dragging
      if (touchStartPosition.current) {
        const dx = Math.abs(event.touches[0].clientX - touchStartPosition.current.x);
        const dy = Math.abs(event.touches[0].clientY - touchStartPosition.current.y);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 10) {
          setHasDragged(true);
        }
      }
      
      handlePan(deltaX, deltaY);
      setDragStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (event.touches.length === 0) {
      setIsDragging(false);
      setLastTouchDistance(null);
      // Reset pinching flag after a delay to prevent immediate clicks
      setTimeout(() => {
        setIsPinching(false);
        setHasDragged(false);
        touchStartPosition.current = null;
      }, 100);
    } else if (event.touches.length === 1) {
      // One finger left after pinch, reset for potential drag
      setDragStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
      touchStartPosition.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
      setLastTouchDistance(null);
      setIsPinching(false);
    }
  };

  return (
    <div className={styles.imageViewerContainer}>
      {isLoading && <LoadingSpinner />}
      <div
        ref={containerRef}
        className={styles.imageContainer}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: transform.scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
          display: isLoading ? 'none' : 'flex',
        }}
      >
        <div
          className={`${styles.imageWrapper} ${isHintAnimating ? styles.hintAnimating : ''}`}
          style={{
            transform: `scale(${transform.scale}) translate(${transform.translateX}px, ${transform.translateY}px)`,
          }}
        >
          <img
            ref={imageRef}
            src={image.src}
            alt={image.alt}
            className={styles.waldoImage}
            onClick={handleImageClick}
            onLoad={() => {
              const elapsed = Date.now() - loadStartTimeRef.current;
              const minDisplayTime = 500; // 0.5 second minimum
              if (elapsed < minDisplayTime) {
                setTimeout(() => {
                  setIsLoading(false);
                  setCurrentImageLoaded(true);
                }, minDisplayTime - elapsed);
              } else {
                setIsLoading(false);
                setCurrentImageLoaded(true);
              }
            }}
            draggable={false}
          />
        </div>
        {clickMarkers.map((marker) => (
          <div
            key={marker.id}
            className={styles.clickMarker}
            style={{
              left: `${marker.x}px`,
              top: `${marker.y}px`,
            }}
          >
            ✕
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageViewer;
