# Where's Waldo - AI Coding Agent Instructions

## Architecture Overview

**Nx monorepo** (v22.0.3) with React 19 app built on Vite 7. Interactive "Where's Amy & Dan" game with coordinate-based click detection, responsive percentage-based positioning, and polished animations.

### Monorepo Structure
```
apps/
  waldo-app/          # Main game (React 19 + Vite)
  waldo-app-e2e/      # Playwright E2E tests (5 browsers: 3 desktop, 2 mobile)
  image-creator/      # Dev-only tool for creating image configurations
libs/
  shared-ui/          # Shared utilities (click detection, image types)
.specify/             # Spec-driven development (GitHub Spec Kit integration)
```

### Key Components & Data Flow

**Game State Architecture:**
1. **`App.tsx`** - Root state: toggles `StartScreen` ↔ `GameBoard`
2. **`GameBoard.tsx`** - Main orchestrator:
   - Shuffles images (Practice difficulty first, then randomized)
   - Manages modals (`SuccessModal`, `UnluckyModal`)
   - Tracks attempts limit (5 per image via `MAX_ATTEMPTS_PER_IMAGE`)
   - Handles completion screen with leaderboard integration
3. **`ImageViewer.tsx`** - User interaction layer:
   - Click/touch detection on images
   - Zoom/pan controls (scale 1-4x) with constrained boundaries
   - Visual feedback: success markers (exploding animation), jail bars (on max attempts)
4. **`StartScreen.tsx`** - Entry point with floating Waldo decorations

**Custom Hooks** (`apps/waldo-app/src/app/hooks/`):
- `useGameState.ts` - Game progress state using **Set-based tracking** for found/skipped images
- `useZoomPan.ts` - Transform state for image zoom with mouse/touch panning

**Shared Utilities** (`libs/shared-ui/src/lib/utils/`):
- `clickDetection.ts` - **Percentage-based coordinate system** (see below)
- Imported by both `waldo-app` and `image-creator`

**Critical Pattern - Percentage Coordinates:**
```typescript
// ALL coordinates stored as percentages (0-100) for responsive design
waldoLocation: { x: 45, y: 32, tolerance: 30 } // tolerance in pixels

// Click handling flow:
1. getRelativeCoordinates(event, imgElement) → {x: 47.3%, y: 34.1%}
2. percentToPixels(clickPercent, imgWidth, imgHeight) → {x: 567px, y: 409px}
3. isClickNearTarget(clickPixels, waldoPixels, tolerance) → boolean
```

## Development Commands

**PowerShell environment** - all commands use Windows paths:

```bash
# Primary workflows (always use project name @wheres-waldo/waldo-app)
npx nx dev @wheres-waldo/waldo-app        # Dev server → localhost:4200
npx nx build @wheres-waldo/waldo-app      # Prod build → dist/apps/waldo-app
npx nx test @wheres-waldo/waldo-app       # Jest unit tests
npx nx lint @wheres-waldo/waldo-app       # ESLint
npx nx e2e @wheres-waldo/waldo-app-e2e    # Playwright (all browsers)

# Preview production build
npx nx preview @wheres-waldo/waldo-app    # → localhost:4300

# GitHub Pages build (uses env var for base path)
VITE_BASE_PATH=/wheres-waldo/ npx nx build @wheres-waldo/waldo-app

# Dev-only image creator tool
npx nx dev @wheres-waldo/image-creator
```

**Build Pipeline** (defined in `project.json`):
1. `vite-build` - Vite compilation
2. `optimize-images` - Runs `scripts/optimize-dist-images.mjs` (Sharp-based compression)
3. `build` - Composite target (depends on both above)

**Critical**: The `build` target includes **automated image optimization** that:
- Resizes images >3840px (max dimension)
- Compresses JPEG/PNG with 80% quality
- Removes EXIF orientation metadata
- Reports size savings per file

## Project-Specific Conventions

### Component Organization
- **CSS Modules** for ALL styling (`Component.module.css` paired with `Component.tsx`)
- **Functional components only** with TypeScript (no class components)
- **Props interfaces** defined inline above component:
  ```typescript
  interface GameBoardProps {
    playerName: string;
    onExit: () => void;
  }
  ```
- **Animations via CSS** - extensive use of `@keyframes` (see `SuccessModal.module.css` for fireworks)

### State Management Patterns
- **Sets over arrays** for collections: `foundImages: Set<string>` (O(1) lookups)
- **Immutable updates**: `new Set(prev.skippedImages)` - always create new Set instances
- **useCallback optimization**: All handlers passed to children wrapped in `useCallback`
- **useMemo for expensive operations**: Image shuffling in `GameBoard` uses `useMemo(() => organizeImages(), [])`

### Testing Strategy
- **Jest** with `@testing-library/react` for unit tests
- **Playwright** for E2E across 5 browsers (Chrome, Firefox, Safari, Mobile Chrome/Safari)
- **Colocated tests**: `Component.tsx` → `Component.spec.tsx`
- **Mobile viewports**: `Pixel 5` (Android), `iPhone 12` (iOS)
- Test output: `test-output/playwright/report/index.html`

### Animation Patterns
Component-specific `@keyframes` in CSS Modules:
- `SuccessModal`: `fireworkBurst`, `modalPopIn`, `titleBounce`
- `ImageViewer`: `markerExplode` (on Waldo found), `jailPulse` (on max attempts)
- `GameBoard`: Staggered `animation-delay` for completion stats
- `ProgressIndicator`: `dotPulse` for current image, `dotFound` for completed

## Spec-Driven Development

**GitHub Spec Kit** integration in `.specify/`:

```
.specify/
  memory/           # constitution.md (project principles)
  specs/            # Feature specs, plans, tasks (per feature)
  templates/        # Spec/plan/task templates
  scripts/          # Automation
```

**Workflow (use slash commands in order):**
1. `/speckit.constitution` → `.specify/memory/constitution.md`
2. `/speckit.specify` → `.specify/specs/{feature}.spec.md`
3. `/speckit.clarify` → Resolve ambiguities
4. `/speckit.plan` → `.specify/specs/{feature}.plan.md`
5. `/speckit.tasks` → `.specify/specs/{feature}.tasks.md`
6. `/speckit.implement` → Execute tasks

**NEVER manually create spec files** - commands auto-generate from templates.

## Critical Implementation Details

### Image Asset Management
- **Public directory**: `apps/waldo-app/public/images/` (copied to `dist/apps/waldo-app/images/`)
- **Vite base path**: `process.env.VITE_BASE_PATH` or `/` (build-time replacement)
- **Asset references**: `${import.meta.env.BASE_URL}images/filename.svg`
- **Orientation metadata**: `'landscape' | 'portrait'` in `waldoImages` for responsive layouts
- **Image creator tool**: Interactive UI for generating image configs (dev-only, not in prod build)

### Leaderboard System
**LocalStorage (default):**
```typescript
// Key: 'waldoLeaderboard'
{ name: string, score: number, foundImages: number, timestamp: number }[]
// Sorted by foundImages DESC, then score ASC (lower attempts = better)
// Limited to top 10 entries
```

**Cloud persistence**: See `CLOUD_LEADERBOARD.md` for Firebase/Supabase/custom API setup

### Game Logic - Image Progression
```typescript
// organizeImages() in GameBoard.tsx
1. Practice difficulty images first (in order)
2. Remaining images shuffled (Fisher-Yates)
3. Memoized - doesn't reshuffle on re-render
```

**Attempts system:**
- Per-image limit: `MAX_ATTEMPTS_PER_IMAGE = 5`
- Global counter: `state.attempts` (sum across all images)
- Per-image reset: `currentImageAttempts` resets to 0 on `nextImage()`

### GitHub Pages Deployment
**Automated via `.github/workflows/deploy.yml`:**
- Triggers on `push` to `main` or manual `workflow_dispatch`
- Sets `VITE_BASE_PATH=/wheres-waldo/`
- Builds to `apps/waldo-app/dist` (NOT `dist/apps/waldo-app`)
- **Build output path discrepancy**: Workflow uses `apps/waldo-app/dist`, but Nx outputs to `dist/apps/waldo-app`
  - Image optimizer script correctly uses `dist/apps/waldo-app`

## Common Pitfalls

1. **Pixel coordinates break responsive design** - ALWAYS use percentages in `imageData.ts`
2. **Zoom/pan state persists** - Reset in `ImageViewer` when `image.id` changes (useEffect dependency)
3. **Nx project names** - Must use `@wheres-waldo/waldo-app`, NOT `waldo-app` or `apps/waldo-app`
4. **Sets aren't JSON-serializable** - Convert to arrays: `Array.from(state.foundImages)` before localStorage
5. **Vite BASE_URL is build-time only** - Can't change at runtime (set via `VITE_BASE_PATH` env var)
6. **Import.meta in Jest** - Use `jest.config.cts` transform to handle Vite imports in tests
7. **Image optimization timing** - `optimize-dist-images.mjs` includes 1s delay for Windows file handles

## Key Files for Context

**Core Game Logic:**
- `apps/waldo-app/src/app/components/GameBoard/GameBoard.tsx` - Main orchestrator
- `apps/waldo-app/src/app/hooks/useGameState.ts` - Set-based state management
- `libs/shared-ui/src/lib/utils/clickDetection.ts` - Coordinate conversion utilities

**Configuration:**
- `apps/waldo-app/src/app/utils/imageData.ts` - Image definitions with percentage coords
- `apps/waldo-app/project.json` - Custom build pipeline with image optimization
- `apps/waldo-app-e2e/playwright.config.ts` - E2E test setup (5 browsers)
- `nx.json` - Nx plugins and target defaults

**Build & Deploy:**
- `apps/waldo-app/vite.config.ts` - Vite config with BASE_PATH handling
- `apps/waldo-app/scripts/optimize-dist-images.mjs` - Sharp-based image compression
- `.github/workflows/deploy.yml` - GitHub Pages CI/CD
