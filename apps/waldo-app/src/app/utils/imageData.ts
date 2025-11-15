export enum CharacterType {
  Amy = 'Amy',
  Dan = 'Dan',
  Both = 'Both',
}

export enum Difficulty {
  Practice = 'Practice',
  Easy = 'Easy',
  Hard = 'Hard',
  ReallyHard = 'Really Hard',
}

export type DetectionType = 'circle' | 'rectangle';

export interface CircleLocation {
  x: number; // Percentage (0-100) of image width
  y: number; // Percentage (0-100) of image height
  tolerance: number; // Pixels
}

export interface RectangleLocation {
  x1: number; // Percentage (0-100) - top left x
  y1: number; // Percentage (0-100) - top left y
  x2: number; // Percentage (0-100) - bottom right x
  y2: number; // Percentage (0-100) - bottom right y
}

export interface WaldoImage {
  id: string;
  src: string;
  alt: string;
  waldoLocation: CircleLocation | RectangleLocation;
  detectionType: DetectionType;
  orientation: 'landscape' | 'portrait';
  characterType: CharacterType; // Which character(s) to find in this image
  difficulty: Difficulty; // Difficulty level of finding character(s)
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
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Practice,
  },
  {
    id: 'image-1762897138879',
    src: `${BASE_URL}images/Dan_Obvious.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 46.45, y: 49.56, tolerance: 70 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Practice,
  },
  {
    id: 'image-1762984938168',
    src: `${BASE_URL}images/Dan_ReallyHard.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 34.91, y: 54.61, tolerance: 10 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.ReallyHard,
  },
  {
    id: 'image-1762985053101',
    src: `${BASE_URL}images/Amy_2_Easy.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 92.22, y: 69.34, tolerance: 20 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Easy,
  },
  {
    id: 'image-1763239402000',
    src: `${BASE_URL}images/Amy_and_dan_petal_fields.jpg`,
    alt: 'Find Amy and Dan in this portrait scene!',
    waldoLocation: { x1: 54.8, y1: 44.32, x2: 29.45, y2: 56.37 },
    detectionType: 'rectangle',
    orientation: 'portrait',
    characterType: CharacterType.Both,
    difficulty: Difficulty.Easy,
  },
  {
    id: 'image-1763229562037',
    src: `${BASE_URL}images/Dans_head_in_bush.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 55.66, y: 64.81, tolerance: 10 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Hard,
  },
  {
    id: 'image-1763229717541',
    src: `${BASE_URL}images/Amy_in_a_bush.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 71.89, y: 48.78, tolerance: 20 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Hard,
  },
  {
    id: 'image-1763229789170',
    src: `${BASE_URL}images/Dan_peaking_round_tree.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 55.99, y: 61.75, tolerance: 10 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Hard,
  },
  {
    id: 'image-1763229918426',
    src: `${BASE_URL}images/Dan_among_the_flowers.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 60.76, y: 50.97, tolerance: 50 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Easy,
  },
  {
    id: 'image-1763230114371',
    src: `${BASE_URL}images/Amy_behind_bush.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 40.93, y: 55.21, tolerance: 50 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Easy,
  },
  {
    id: 'image-1763237848731',
    src: `${BASE_URL}images/Amy_behind_door.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x1: 77.98, y1: 36.08, x2: 88.69, y2: 71.62 },
    detectionType: 'rectangle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Easy,
  },
  {
    id: 'image-1763238651025',
    src: `${BASE_URL}images/Amy_behind_tree.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 89.78, y: 66.05, tolerance: 30 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Hard,
  },
  {
    id: 'image-1763238807306',
    src: `${BASE_URL}images/Amy_very_hard.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 78.23, y: 54.75, tolerance: 7 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.ReallyHard,
  },
  {
    id: 'image-1763238882525',
    src: `${BASE_URL}images/Amy_behind_pumpkin.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 35.64, y: 46.77, tolerance: 25 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Hard,
  },
  {
    id: 'image-1763238969519',
    src: `${BASE_URL}images/Amy_behind_flowers.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 70.62, y: 52.52, tolerance: 15 },
    detectionType: 'circle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.ReallyHard,
  },
  {
    id: 'image-1763239229679',
    src: `${BASE_URL}images/Dan_in_the_mist.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x1: 55.22, y1: 60.77, x2: 57.15, y2: 64.29 },
    detectionType: 'rectangle',
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Easy,
  },
  {
    id: 'image-1763239314229',
    src: `${BASE_URL}images/Amy_in_mist.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x1: 35.56, y1: 54.33, x2: 32.88, y2: 50.93 },
    detectionType: 'rectangle',
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Hard,
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
