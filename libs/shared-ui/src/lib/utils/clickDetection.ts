import React from 'react';

export interface ClickCoordinates {
  x: number;
  y: number;
}

/**
 * Calculate if a click is near the target location within a tolerance radius
 */
export function isClickNearTarget(
  click: ClickCoordinates,
  target: ClickCoordinates,
  tolerance: number
): boolean {
  const distance = Math.sqrt(
    Math.pow(click.x - target.x, 2) + Math.pow(click.y - target.y, 2)
  );
  return distance <= tolerance;
}

/**
 * Get relative coordinates from a click/touch event on an image element
 * Returns coordinates as percentages (0-100) of the image dimensions
 */
export function getRelativeCoordinates(
  event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
  element: HTMLElement
): ClickCoordinates {
  const rect = element.getBoundingClientRect();
  
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
    return { x: 0, y: 0 };
  }

  // Calculate position relative to element
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  // Convert to percentage of element dimensions
  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;

  return {
    x: Math.max(0, Math.min(100, xPercent)),
    y: Math.max(0, Math.min(100, yPercent)),
  };
}

/**
 * Convert percentage coordinates to pixel coordinates
 */
export function percentToPixels(
  percentCoords: ClickCoordinates,
  width: number,
  height: number
): ClickCoordinates {
  return {
    x: (percentCoords.x / 100) * width,
    y: (percentCoords.y / 100) * height,
  };
}

