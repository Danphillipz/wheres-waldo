export enum CharacterType {
  Amy = 'Amy',
  Dan = 'Dan',
  Both = 'Both'
}

export enum Difficulty {
  Easy = 'Easy',
  Hard = 'Hard',
  ReallyHard = 'Really Hard'
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
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Easy,
  },
    {
    id: 'image-1762897138879',
    src: `${BASE_URL}images/Dan_Obvious.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 46.45, y: 49.56, tolerance: 70 },
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Easy,
  },
    {
    id: 'image-1762984938168',
    src: `${BASE_URL}images/Dan_ReallyHard.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 34.91, y: 54.61, tolerance: 10 },
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.ReallyHard,
  },
    {
    id: 'image-1762985053101',
    src: `${BASE_URL}images/Amy_2_Easy.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 92.22, y: 69.34, tolerance: 20 },
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Easy,
  },
    {
    id: 'image-1763229405440',
    src: `${BASE_URL}images/Amy_and_Dan.jpg`,
    alt: 'Find Amy and Dan in this portrait scene!',
    waldoLocation: { x: 42.94, y: 52.89, tolerance: 150 },
    orientation: 'portrait',
    characterType: CharacterType.Both,
    difficulty: Difficulty.Easy,
  },
    {
    id: 'image-1763229562037',
    src: `${BASE_URL}images/Dans_head_in_bush.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 55.66, y: 64.81, tolerance: 10 },
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Hard,
  },
    {
    id: 'image-1763229717541',
    src: `${BASE_URL}images/Amy_in_a_bush.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 71.89, y: 48.78, tolerance: 20 },
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Hard,
  },
    {
    id: 'image-1763229789170',
    src: `${BASE_URL}images/Dan_peaking_round_tree.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 55.99, y: 61.75, tolerance: 10 },
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Hard,
  },
    {
    id: 'image-1763229918426',
    src: `${BASE_URL}images/Dan_among_the_flowers.jpg`,
    alt: 'Find Dan in this portrait scene!',
    waldoLocation: { x: 60.76, y: 50.97, tolerance: 50 },
    orientation: 'portrait',
    characterType: CharacterType.Dan,
    difficulty: Difficulty.Easy,
  },
    {
    id: 'image-1763230114371',
    src: `${BASE_URL}images/Amy_behind_bush.jpg`,
    alt: 'Find Amy in this portrait scene!',
    waldoLocation: { x: 40.93, y: 55.21, tolerance: 50 },
    orientation: 'portrait',
    characterType: CharacterType.Amy,
    difficulty: Difficulty.Easy,
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
