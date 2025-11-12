export enum CharacterType {
  Amy = 'Amy',
  Dan = 'Dan',
  Both = 'Both'
}

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
  characterType: CharacterType; // Which character(s) to find in this image
}

// Get base URL from Vite's define config
// For GitHub Pages builds, set via VITE_BASE_PATH environment variable  
declare const __BASE_URL__: string;
const BASE_URL = typeof __BASE_URL__ !== 'undefined' ? __BASE_URL__ : '/';

// Sample Where's Waldo images with Waldo coordinates
export const waldoImages: WaldoImage[] = [
   {
    id: 'image-1762897033449',
    src: `${BASE_URL}images/Amy_obvious.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 54.99, y: 59.38, tolerance: 100 },
    orientation: 'portrait',
    characterType: CharacterType.Amy,
  },
    {
    id: 'image-1762897138879',
    src: `${BASE_URL}images/Dan_Obvious.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 46.45, y: 49.56, tolerance: 70 },
    orientation: 'portrait',
    characterType: CharacterType.Dan,
  },
];

/**
 * Get congratulation message based on characters found in an image
 */
export function getCongratulationMessage(image: WaldoImage): string {
  switch (image.characterType) {
    case CharacterType.Both:
      return 'Congratulations! You found both Dan and Amy!';
    case CharacterType.Dan:
      return 'Congratulations! You found Dan!';
    case CharacterType.Amy:
      return 'Congratulations! You found Amy!';
    default:
      return 'Congratulations!';
  }
}
