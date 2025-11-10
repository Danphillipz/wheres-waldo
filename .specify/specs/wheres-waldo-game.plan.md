# Where's Waldo Game - Implementation Plan

## Architecture Overview

### Component Structure
```
waldo-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── GameBoard/
│   │   │   │   ├── GameBoard.tsx          # Main game container
│   │   │   │   ├── GameBoard.module.css
│   │   │   │   └── GameBoard.spec.tsx
│   │   │   ├── ImageViewer/
│   │   │   │   ├── ImageViewer.tsx        # Zoomable/pannable image display
│   │   │   │   ├── ImageViewer.module.css
│   │   │   │   └── ImageViewer.spec.tsx
│   │   │   ├── GameControls/
│   │   │   │   ├── GameControls.tsx       # Skip, Next buttons
│   │   │   │   ├── GameControls.module.css
│   │   │   │   └── GameControls.spec.tsx
│   │   │   ├── SuccessModal/
│   │   │   │   ├── SuccessModal.tsx       # Congratulations message
│   │   │   │   ├── SuccessModal.module.css
│   │   │   │   └── SuccessModal.spec.tsx
│   │   │   └── ProgressIndicator/
│   │   │       ├── ProgressIndicator.tsx  # Shows current image number
│   │   │       ├── ProgressIndicator.module.css
│   │   │       └── ProgressIndicator.spec.tsx
│   │   ├── hooks/
│   │   │   ├── useZoomPan.ts             # Custom hook for zoom/pan logic
│   │   │   ├── useZoomPan.spec.ts
│   │   │   ├── useGameState.ts           # Custom hook for game state
│   │   │   └── useGameState.spec.ts
│   │   ├── utils/
│   │   │   ├── imageData.ts              # Image definitions and coordinates
│   │   │   ├── clickDetection.ts         # Click/touch coordinate utilities
│   │   │   └── clickDetection.spec.ts
│   │   └── app.tsx                       # Updated main app component
│   └── public/
│       └── images/
│           ├── waldo-1.jpg               # First Where's Waldo image
│           └── waldo-2.jpg               # Second Where's Waldo image
```

## Implementation Details

### 1. Data Layer (`utils/imageData.ts`)

Define the image data structure and export image configurations:

```typescript
export interface WaldoImage {
  id: string;
  src: string;
  alt: string;
  waldoLocation: {
    x: number;        // Percentage (0-100) of image width
    y: number;        // Percentage (0-100) of image height
    tolerance: number; // Pixels
  };
  orientation: 'landscape' | 'portrait';
}

export const waldoImages: WaldoImage[] = [
  {
    id: 'image-1',
    src: '/images/waldo-1.jpg',
    alt: 'Busy beach scene with many people',
    waldoLocation: { x: 45, y: 32, tolerance: 30 },
    orientation: 'landscape'
  },
  {
    id: 'image-2',
    src: '/images/waldo-2.jpg',
    alt: 'Crowded ski slope',
    waldoLocation: { x: 62, y: 58, tolerance: 30 },
    orientation: 'portrait'
  }
];
```

### 2. Click Detection Utility (`utils/clickDetection.ts`)

Handle coordinate transformation and hit detection:

```typescript
export interface ClickCoordinates {
  x: number;
  y: number;
}

export function isClickNearTarget(
  click: ClickCoordinates,
  target: ClickCoordinates,
  tolerance: number
): boolean {
  const distance = Math.sqrt(
    Math.pow(click.x - target.x, 2) + 
    Math.pow(click.y - target.y, 2)
  );
  return distance <= tolerance;
}

export function getRelativeCoordinates(
  event: MouseEvent | TouchEvent,
  element: HTMLElement
): ClickCoordinates {
  // Convert absolute click position to relative percentage
  // Handle both mouse and touch events
}
```

### 3. Game State Hook (`hooks/useGameState.ts`)

Manage game progress and state:

```typescript
interface GameState {
  currentImageIndex: number;
  foundImages: Set<string>;
  skippedImages: Set<string>;
  attempts: number;
  isComplete: boolean;
}

export function useGameState(totalImages: number) {
  const [state, setState] = useState<GameState>({...});
  
  const nextImage = () => {...};
  const skipImage = () => {...};
  const foundWaldo = () => {...};
  const reset = () => {...};
  
  return { state, nextImage, skipImage, foundWaldo, reset };
}
```

### 4. Zoom/Pan Hook (`hooks/useZoomPan.ts`)

Handle image zoom and pan interactions:

```typescript
interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
}

export function useZoomPan(minScale = 1, maxScale = 4) {
  const [transform, setTransform] = useState<ZoomPanState>({...});
  
  const handleZoom = (delta: number) => {...};
  const handlePan = (deltaX: number, deltaY: number) => {...};
  const reset = () => {...};
  
  return { transform, handleZoom, handlePan, reset };
}
```

### 5. ImageViewer Component

Core component for displaying and interacting with images:

**Features:**
- Renders image with transform (scale, translate)
- Handles click/touch events for Waldo detection
- Supports zoom via wheel/pinch gestures
- Supports pan via drag gestures
- Shows click markers for incorrect attempts
- Responsive sizing

**Props:**
```typescript
interface ImageViewerProps {
  image: WaldoImage;
  onWaldoFound: () => void;
  onImageClick: (coords: ClickCoordinates) => void;
}
```

### 6. GameControls Component

Navigation and control buttons:

**Features:**
- Skip button (always available)
- Next Image button (always available)
- Proper touch target sizing (44x44px minimum)
- Clear visual feedback on interaction

### 7. SuccessModal Component

Displays congratulations message:

**Features:**
- Overlay modal with backdrop
- Congratulations message
- Button to proceed to next image
- Accessible (keyboard navigation, focus management)
- Mobile-responsive

### 8. ProgressIndicator Component

Shows current progress:

**Features:**
- Current image number (e.g., "Image 1 of 2")
- Visual indicator of completed/found images
- Compact design for mobile

### 9. GameBoard Component

Main container orchestrating all components:

**Responsibilities:**
- Manages overall game state
- Coordinates between child components
- Handles image transitions
- Displays appropriate UI based on game state

## Styling Strategy

### Mobile-First Approach
1. Base styles for mobile (320px+)
2. Tablet breakpoint (768px+)
3. Desktop breakpoint (1024px+)

### Key CSS Features
- Flexbox for layout
- CSS transforms for zoom/pan
- Touch-action properties for gesture handling
- Media queries for responsive behavior
- CSS modules for scoped styles

### Responsive Breakpoints
```css
/* Mobile: Default */
/* Tablet: min-width 768px */
/* Desktop: min-width 1024px */
```

## State Management

Using React hooks and context:
- Local component state for UI interactions
- Custom hooks for complex logic (zoom, game state)
- No external state management library needed for MVP

## Testing Strategy

### Unit Tests
- Click detection utilities
- Coordinate transformation functions
- Custom hooks (useZoomPan, useGameState)

### Component Tests
- ImageViewer click handling
- GameControls button interactions
- SuccessModal display logic
- ProgressIndicator rendering

### E2E Tests (Playwright)
- Complete game flow: start → find Waldo → next image → complete
- Skip functionality
- Zoom and pan interactions
- Mobile viewport testing

## Performance Considerations

1. **Image Optimization**
   - Compress images before deployment
   - Use appropriate image formats (WebP with JPEG fallback)
   - Consider lazy loading for multi-image scenarios

2. **Transform Performance**
   - Use CSS transforms (GPU accelerated)
   - Debounce zoom/pan calculations if needed
   - RequestAnimationFrame for smooth animations

3. **Event Handling**
   - Passive event listeners where appropriate
   - Throttle pan events if performance issues arise

## Accessibility

- Semantic HTML elements
- ARIA labels for controls
- Keyboard navigation support
- Focus management in modal
- Alt text for images
- Touch target sizes (min 44x44px)

## Browser Compatibility

- Modern browsers (ES6+ support required)
- CSS Grid and Flexbox
- Touch events API
- Pointer events API (fallback to mouse/touch)

## Development Phases

### Phase 1: Core Structure (Day 1)
- Set up component structure
- Implement imageData and clickDetection utilities
- Create basic GameBoard layout

### Phase 2: Image Interaction (Day 2)
- Implement ImageViewer with basic display
- Add click detection
- Implement useGameState hook

### Phase 3: Zoom/Pan (Day 3)
- Implement useZoomPan hook
- Add zoom controls to ImageViewer
- Add pan functionality

### Phase 4: UI Components (Day 4)
- Implement SuccessModal
- Implement GameControls
- Implement ProgressIndicator
- Wire up all components

### Phase 5: Mobile & Polish (Day 5)
- Mobile responsive CSS
- Touch gesture support
- Cross-browser testing
- Performance optimization

### Phase 6: Testing (Days 6-7)
- Write unit tests
- Write component tests
- Write E2E tests
- Fix bugs

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Image quality degradation on zoom | High | Use high-resolution source images, test zoom quality |
| Poor performance on mobile | High | Optimize transforms, test on actual devices |
| Touch gesture conflicts | Medium | Use touch-action CSS, test gesture handling |
| Coordinate calculation errors | High | Comprehensive unit tests, visual debugging tools |

## Success Criteria

- ✅ All user stories implemented
- ✅ Mobile responsive on iOS and Android
- ✅ Zoom/pan works smoothly (60fps)
- ✅ Click detection accurate within tolerance
- ✅ All tests passing
- ✅ No console errors or warnings
- ✅ Lighthouse score > 90 for performance and accessibility
