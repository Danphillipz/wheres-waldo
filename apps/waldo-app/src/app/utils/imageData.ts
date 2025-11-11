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

// Get base URL from Vite's BASE_URL environment variable
// This is replaced at build time with the correct base path
const BASE_URL = import.meta.env.BASE_URL || '/';

// Sample Where's Waldo images with Waldo coordinates
export const waldoImages: WaldoImage[] = [
  {
    id: 'image-1',
    src: `${BASE_URL}images/waldo-1.svg`,
    alt: 'Busy scene with many people - find Amy and Dan!',
    waldoLocation: { x: 45, y: 32, tolerance: 30 },
    orientation: 'landscape',
  },
  {
    id: 'image-2',
    src: `${BASE_URL}images/waldo-2.svg`,
    alt: 'Crowded scene with many people - find Amy and Dan!',
    waldoLocation: { x: 62, y: 58, tolerance: 30 },
    orientation: 'portrait',
  },
];
