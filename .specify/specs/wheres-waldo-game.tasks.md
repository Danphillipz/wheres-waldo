# Where's Waldo Game - Task Breakdown

## Phase 1: Core Structure & Data Setup

### Task 1.1: Create Image Data Configuration
**Priority:** High  
**Estimated Time:** 30 minutes

- [ ] Create `src/app/utils/imageData.ts`
- [ ] Define `WaldoImage` TypeScript interface
- [ ] Export `waldoImages` array with 2 sample image configurations
- [ ] Use placeholder image data (coordinates TBD when actual images added)

**Acceptance Criteria:**
- TypeScript types properly defined
- Image data structure matches specification
- File exports correctly

### Task 1.2: Implement Click Detection Utility
**Priority:** High  
**Estimated Time:** 1 hour

- [ ] Create `src/app/utils/clickDetection.ts`
- [ ] Implement `getRelativeCoordinates()` function
- [ ] Implement `isClickNearTarget()` function
- [ ] Create unit tests in `clickDetection.spec.ts`

**Acceptance Criteria:**
- Handles both mouse and touch events
- Converts absolute coordinates to relative percentages
- Distance calculation is accurate
- All unit tests pass

### Task 1.3: Set Up Component Directory Structure
**Priority:** Medium  
**Estimated Time:** 15 minutes

- [ ] Create component directories under `src/app/components/`
- [ ] Create placeholder files for each component
- [ ] Set up CSS module files

**Acceptance Criteria:**
- Directory structure matches plan
- All placeholder files created

## Phase 2: Game State Management

### Task 2.1: Implement Game State Hook
**Priority:** High  
**Estimated Time:** 1.5 hours

- [ ] Create `src/app/hooks/useGameState.ts`
- [ ] Implement state interface and initial state
- [ ] Implement `nextImage()` function
- [ ] Implement `skipImage()` function
- [ ] Implement `foundWaldo()` function
- [ ] Implement `reset()` function
- [ ] Create unit tests in `useGameState.spec.ts`

**Acceptance Criteria:**
- Hook manages all game state correctly
- State updates are immutable
- Functions work as expected
- Tests cover all state transitions

### Task 2.2: Implement Zoom/Pan Hook
**Priority:** High  
**Estimated Time:** 2 hours

- [ ] Create `src/app/hooks/useZoomPan.ts`
- [ ] Implement zoom state management
- [ ] Implement `handleZoom()` with min/max limits
- [ ] Implement `handlePan()` with boundary checking
- [ ] Implement `reset()` function
- [ ] Create unit tests in `useZoomPan.spec.ts`

**Acceptance Criteria:**
- Zoom constrained to min/max scale
- Pan constrained to image boundaries
- Transform calculations are accurate
- Tests verify all functionality

## Phase 3: Core Components

### Task 3.1: Implement ProgressIndicator Component
**Priority:** Low  
**Estimated Time:** 45 minutes

- [ ] Create `ProgressIndicator.tsx`
- [ ] Display current image number and total
- [ ] Add visual indicators for completed images
- [ ] Create styles in `ProgressIndicator.module.css`
- [ ] Create component tests

**Acceptance Criteria:**
- Shows "Image X of Y" format
- Updates correctly on state change
- Mobile-responsive
- Tests verify rendering

### Task 3.2: Implement GameControls Component
**Priority:** Medium  
**Estimated Time:** 1 hour

- [ ] Create `GameControls.tsx`
- [ ] Implement Skip button with click handler
- [ ] Implement Next Image button with click handler
- [ ] Create styles in `GameControls.module.css`
- [ ] Ensure touch target sizes (44x44px minimum)
- [ ] Create component tests

**Acceptance Criteria:**
- Buttons trigger correct callbacks
- Touch targets are adequately sized
- Buttons are keyboard accessible
- Mobile-responsive layout
- Tests verify interactions

### Task 3.3: Implement SuccessModal Component
**Priority:** Medium  
**Estimated Time:** 1.5 hours

- [ ] Create `SuccessModal.tsx`
- [ ] Implement modal overlay and backdrop
- [ ] Add congratulations message
- [ ] Add "Next Image" button
- [ ] Implement focus management
- [ ] Create styles in `SuccessModal.module.css`
- [ ] Create component tests

**Acceptance Criteria:**
- Modal displays over game board
- Backdrop prevents interaction with background
- Focus trapped in modal when open
- Escape key closes modal
- Mobile-responsive
- Tests verify show/hide behavior

### Task 3.4: Implement ImageViewer Component
**Priority:** High  
**Estimated Time:** 3 hours

- [ ] Create `ImageViewer.tsx`
- [ ] Render image with CSS transforms
- [ ] Integrate `useZoomPan` hook
- [ ] Implement click/touch event handling
- [ ] Call `getRelativeCoordinates()` on click
- [ ] Call `isClickNearTarget()` to check for Waldo
- [ ] Display click markers for missed attempts
- [ ] Add zoom controls (buttons or wheel handling)
- [ ] Add pan handling (drag gestures)
- [ ] Create styles in `ImageViewer.module.css`
- [ ] Create component tests

**Acceptance Criteria:**
- Image scales and translates correctly
- Click coordinates calculated accurately
- Waldo detection works within tolerance
- Zoom via mouse wheel or pinch gestures
- Pan via drag or touch drag
- Click markers visible on misses
- Mobile-responsive with touch support
- Tests verify click detection and transforms

### Task 3.5: Implement GameBoard Component
**Priority:** High  
**Estimated Time:** 2 hours

- [ ] Create `GameBoard.tsx`
- [ ] Integrate `useGameState` hook
- [ ] Render `ProgressIndicator`
- [ ] Render `ImageViewer` with current image
- [ ] Render `GameControls`
- [ ] Conditionally render `SuccessModal`
- [ ] Wire up all callbacks
- [ ] Handle game completion state
- [ ] Create styles in `GameBoard.module.css`
- [ ] Create component tests

**Acceptance Criteria:**
- All components integrated correctly
- State flows properly between components
- Callbacks trigger expected behavior
- Game progression works end-to-end
- Mobile-responsive layout
- Tests verify integration

## Phase 4: Main App Integration

### Task 4.1: Update App Component
**Priority:** High  
**Estimated Time:** 30 minutes

- [ ] Update `src/app/app.tsx`
- [ ] Remove placeholder NxWelcome component
- [ ] Remove placeholder routes
- [ ] Render GameBoard component
- [ ] Update `src/styles.css` with base styles

**Acceptance Criteria:**
- App displays GameBoard on load
- No console errors
- Clean, minimal layout

## Phase 5: Assets & Styling

### Task 5.1: Add Sample Images
**Priority:** High  
**Estimated Time:** 1 hour

- [ ] Find or create 2 Where's Waldo style images
- [ ] Optimize images for web (compress, resize)
- [ ] Add images to `public/images/` directory
- [ ] Update `imageData.ts` with actual Waldo coordinates
- [ ] Test Waldo coordinates are accurate

**Acceptance Criteria:**
- Images display correctly
- File sizes optimized (< 500KB each)
- Waldo coordinates accurate within tolerance
- Both landscape and portrait orientations represented

### Task 5.2: Mobile-Responsive Styling
**Priority:** High  
**Estimated Time:** 2 hours

- [ ] Implement mobile-first CSS in all component modules
- [ ] Add media queries for tablet (768px+)
- [ ] Add media queries for desktop (1024px+)
- [ ] Test on mobile viewport sizes
- [ ] Verify touch target sizes
- [ ] Ensure zoom/pan works on mobile

**Acceptance Criteria:**
- Layout works on 320px+ width
- Touch targets minimum 44x44px
- Responsive at all breakpoints
- No horizontal scroll on mobile
- Text readable without zooming

### Task 5.3: Polish & Visual Enhancements
**Priority:** Low  
**Estimated Time:** 1 hour

- [ ] Add hover states for buttons
- [ ] Add focus indicators for accessibility
- [ ] Smooth transitions for modal
- [ ] Style click markers
- [ ] Add visual feedback for zoom level

**Acceptance Criteria:**
- Interactions feel polished
- Visual feedback is clear
- Accessibility indicators present

## Phase 6: Testing

### Task 6.1: Unit Tests
**Priority:** High  
**Estimated Time:** 2 hours

- [ ] Write tests for `clickDetection.ts`
- [ ] Write tests for `useGameState.ts`
- [ ] Write tests for `useZoomPan.ts`
- [ ] Ensure 80%+ code coverage

**Acceptance Criteria:**
- All utility functions tested
- All hooks tested
- Tests cover edge cases
- All tests pass

### Task 6.2: Component Tests
**Priority:** High  
**Estimated Time:** 3 hours

- [ ] Write tests for ProgressIndicator
- [ ] Write tests for GameControls
- [ ] Write tests for SuccessModal
- [ ] Write tests for ImageViewer
- [ ] Write tests for GameBoard

**Acceptance Criteria:**
- Components render correctly
- User interactions tested
- Props handled correctly
- All tests pass

### Task 6.3: E2E Tests
**Priority:** Medium  
**Estimated Time:** 2 hours

- [ ] Create E2E test file in `waldo-app-e2e`
- [ ] Test complete game flow (start to completion)
- [ ] Test skip functionality
- [ ] Test mobile viewport
- [ ] Test zoom and pan interactions

**Acceptance Criteria:**
- Happy path works end-to-end
- Skip button works
- Mobile scenarios tested
- All E2E tests pass

### Task 6.4: Cross-Browser Testing
**Priority:** Medium  
**Estimated Time:** 1 hour

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome

**Acceptance Criteria:**
- Works in all target browsers
- No console errors
- Visual consistency across browsers

## Phase 7: Final Validation

### Task 7.1: Performance Optimization
**Priority:** Medium  
**Estimated Time:** 1 hour

- [ ] Run Lighthouse audit
- [ ] Optimize images if needed
- [ ] Check bundle size
- [ ] Test zoom/pan smoothness on low-end devices

**Acceptance Criteria:**
- Lighthouse performance > 90
- Zoom/pan feels smooth (60fps)
- Bundle size reasonable

### Task 7.2: Accessibility Audit
**Priority:** Medium  
**Estimated Time:** 1 hour

- [ ] Run Lighthouse accessibility audit
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Verify ARIA labels
- [ ] Check color contrast

**Acceptance Criteria:**
- Lighthouse accessibility > 90
- Keyboard navigation works
- Screen reader can navigate
- Color contrast meets WCAG AA

### Task 7.3: Final Code Review & Cleanup
**Priority:** High  
**Estimated Time:** 1 hour

- [ ] Remove unused imports
- [ ] Remove console.logs
- [ ] Run linter and fix issues
- [ ] Run formatter
- [ ] Review all TODO comments
- [ ] Update README if needed

**Acceptance Criteria:**
- No linting errors
- Code formatted consistently
- No debug code left
- README accurate

## Summary

**Total Estimated Time:** ~28-32 hours
**Total Tasks:** 27 tasks across 7 phases

### Critical Path:
1. Task 1.2: Click Detection Utility
2. Task 2.1: Game State Hook
3. Task 2.2: Zoom/Pan Hook
4. Task 3.4: ImageViewer Component
5. Task 3.5: GameBoard Component
6. Task 5.1: Add Sample Images
7. Task 5.2: Mobile-Responsive Styling
8. Task 6.1-6.3: Testing

### Dependencies:
- Phase 3 depends on Phase 2 (hooks must be ready)
- Phase 4 depends on Phase 3 (components must be ready)
- Phase 5.1 can be done in parallel with Phase 3
- Phase 6 can start after Phase 4
- Phase 7 must be last
