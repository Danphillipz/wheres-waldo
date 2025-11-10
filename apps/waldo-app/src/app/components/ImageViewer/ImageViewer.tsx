import { useRef, useState } from 'react';
import { WaldoImage } from '../../utils/imageData';
import {
  getRelativeCoordinates,
  isClickNearTarget,
  percentToPixels,
  ClickCoordinates,
} from '../../utils/clickDetection';
import { useZoomPan } from '../../hooks/useZoomPan';
import styles from './ImageViewer.module.css';

interface ImageViewerProps {
  image: WaldoImage;
  onWaldoFound: () => void;
  onImageClick: (coords: ClickCoordinates) => void;
}

interface ClickMarker {
  id: number;
  x: number;
  y: number;
}

export function ImageViewer({
  image,
  onWaldoFound,
  onImageClick,
}: ImageViewerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { transform, handleZoom, handlePan, reset, setScale } = useZoomPan(1, 4);
  const [clickMarkers, setClickMarkers] = useState<ClickMarker[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const clickCounter = useRef(0);
  const touchStartTime = useRef<number>(0);

  const handleImageClick = (
    event: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>
  ) => {
    if (isDragging) return;
    
    // Don't register clicks on multi-touch gestures
    if ('touches' in event.nativeEvent && event.nativeEvent.touches.length > 1) {
      return;
    }
    
    // Check if this was a quick tap (not a drag)
    const timeSinceTouchStart = Date.now() - touchStartTime.current;
    if (timeSinceTouchStart > 300) return; // Was a drag, not a tap

    const imgElement = imageRef.current;
    if (!imgElement) return;

    // Get click coordinates as percentages
    const clickCoords = getRelativeCoordinates(event, imgElement);
    onImageClick(clickCoords);

    // Get image dimensions for pixel calculations
    const rect = imgElement.getBoundingClientRect();
    const clickPixels = percentToPixels(clickCoords, rect.width, rect.height);
    const waldoPixels = percentToPixels(
      image.waldoLocation,
      rect.width,
      rect.height
    );

    // Check if click is near Waldo
    if (
      isClickNearTarget(clickPixels, waldoPixels, image.waldoLocation.tolerance)
    ) {
      onWaldoFound();
    } else {
      // Add a marker for the missed click
      setClickMarkers((prev) => [
        ...prev,
        { id: clickCounter.current++, x: clickCoords.x, y: clickCoords.y },
      ]);
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
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = ((event.clientX - dragStart.x) / transform.scale) * 0.5;
      const deltaY = ((event.clientY - dragStart.y) / transform.scale) * 0.5;
      handlePan(deltaX, deltaY);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
    } else if (event.touches.length === 1) {
      // Single finger - allow dragging when zoomed
      setIsDragging(true);
      setDragStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
      setLastTouchDistance(null);
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
    } else if (event.touches.length === 1 && isDragging) {
      // Pan/drag
      event.preventDefault();
      const deltaX = ((event.touches[0].clientX - dragStart.x) / transform.scale) * 2;
      const deltaY = ((event.touches[0].clientY - dragStart.y) / transform.scale) * 2;
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
    } else if (event.touches.length === 1) {
      // One finger left, reset for potential drag
      setDragStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
      setLastTouchDistance(null);
    }
  };

  return (
    <div className={styles.imageViewerContainer}>
      <div className={styles.zoomControls}>
        <button
          className={styles.zoomButton}
          onClick={() => handleZoom(0.5)}
          disabled={transform.scale >= 4}
          aria-label="Zoom in"
        >
          +
        </button>
        <span className={styles.zoomLevel}>
          {Math.round(transform.scale * 100)}%
        </span>
        <button
          className={styles.zoomButton}
          onClick={() => handleZoom(-0.5)}
          disabled={transform.scale <= 1}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          className={styles.resetButton}
          onClick={reset}
          disabled={transform.scale === 1}
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>

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
        }}
      >
        <div
          className={styles.imageWrapper}
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
            onTouchEnd={handleImageClick}
            draggable={false}
          />
          {clickMarkers.map((marker) => (
            <div
              key={marker.id}
              className={styles.clickMarker}
              style={{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageViewer;
