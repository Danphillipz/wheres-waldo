export interface WaldoImage {
  id: string;
  src: string;
  alt: string;
  waldoLocation: {
    x: number; // Percentage (0-100) of image width
    y: number; // Percentage (0-100) of image height
    tolerance: number; // Pixels
  };
  orientation: 'landscape' | 'portrait';
}

// Helper to get base URL, works in both browser and Jest environments
function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    // In browser, check if we have a base tag
    const baseTag = document.querySelector('base');
    if (baseTag && baseTag.href) {
      return baseTag.href.replace(window.location.origin, '');
    }
  }
  // Default to root path
  return '/';
}

// Sample Where's Waldo images with Waldo coordinates
export const waldoImages: WaldoImage[] = [
  {
    id: 'image-1',
    src: `${getBaseUrl()}images/waldo-1.svg`,
    alt: 'Busy scene with many people - find Amy and Dan!',
    waldoLocation: { x: 45, y: 32, tolerance: 30 },
    orientation: 'landscape',
  },
  {
    id: 'image-2',
    src: `${getBaseUrl()}images/waldo-2.svg`,
    alt: 'Crowded scene with many people - find Amy and Dan!',
    waldoLocation: { x: 62, y: 58, tolerance: 30 },
    orientation: 'portrait',
  },
];
