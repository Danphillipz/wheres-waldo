# Where's Waldo - AI Coding Agent Instructions

## Architecture Overview

**Nx monorepo** with React 19 app built on Vite. Single-page "Where's Waldo" game using coordinate-based click detection and percentage-based positioning for responsive image handling.

### Key Components & Data Flow

1. **`App.tsx`** - Root state: toggles between `StartScreen` and `GameBoard` based on game started state
2. **`GameBoard.tsx`** - Main orchestrator: manages game flow, leaderboard, completion screen
3. **`ImageViewer.tsx`** - Handles click detection, zoom/pan controls, visual feedback markers
4. **Custom Hooks** (in `apps/waldo-app/src/app/hooks/`):
   - `useGameState.ts` - Manages game progress (Set-based tracking for found/skipped images, attempts counter)
   - `useZoomPan.ts` - Transform state for image zoom (scale 1-4x) with constrained panning
5. **Utilities** (in `apps/waldo-app/src/app/utils/`):
   - `imageData.ts` - Image definitions with percentage-based Waldo coordinates
   - `clickDetection.ts` - Converts click events to percentages, compares with tolerance radius
   - `leaderboard.ts` - LocalStorage-based score persistence

**Critical Pattern**: All coordinates use **percentages (0-100)** for responsiveness. `getRelativeCoordinates()` converts pixel clicks to percentages; `percentToPixels()` converts back for tolerance calculations.

## Development Commands

```bash
# Nx-based commands (always prefix with npx nx)
npx nx dev @wheres-waldo/waldo-app        # Dev server on :4200
npx nx build @wheres-waldo/waldo-app      # Production build
npx nx test @wheres-waldo/waldo-app       # Jest unit tests
npx nx lint @wheres-waldo/waldo-app       # ESLint
npx nx e2e @wheres-waldo/waldo-app-e2e    # Playwright E2E

# GitHub Pages build (uses VITE_BASE_PATH env var)
VITE_BASE_PATH=/wheres-waldo/ npx nx build @wheres-waldo/waldo-app
```

**Import Resolution**: Vite uses `BASE_URL` for asset paths (`import.meta.env.BASE_URL`) - see `imageData.ts` for pattern.

## Project-Specific Conventions

### Component Organization
- **CSS Modules** for all styling (`.module.css` files)
- **Functional components** with TypeScript - no class components
- **Props interfaces** defined inline above component (e.g., `interface GameBoardProps`)

### State Management Patterns
- **Sets for collections**: `foundImages: Set<string>` (more efficient than arrays for membership checks)
- **Immutable state updates**: Always create new Set instances (`new Set(prev.skippedImages)`)
- **Callback optimization**: `useCallback` for all handler functions passed to children

### Testing
- **Jest** with `@testing-library/react` (see `app.spec.tsx` for patterns)
- Test files colocated: `Component.tsx` → `Component.spec.tsx`
- Coverage output: `test-output/jest/coverage/`

## Spec-Driven Development Integration

This project uses **GitHub Spec Kit** - files in `.specify/`:

### Workflow Commands
Use these slash commands in order:
1. `/speckit.constitution` - Define project principles (`.specify/memory/constitution.md`)
2. `/speckit.specify` - Write feature spec (creates `.specify/specs/{feature}.spec.md`)
3. `/speckit.clarify` - Resolve ambiguities before planning
4. `/speckit.plan` - Generate technical plan (`.specify/specs/{feature}.plan.md`)
5. `/speckit.tasks` - Break into tasks (`.specify/specs/{feature}.tasks.md`)
6. `/speckit.implement` - Execute implementation

**Do not manually create spec files** - use slash commands which auto-generate from templates in `.specify/templates/`.

## Critical Implementation Details

### Coordinate System
```typescript
// All image coordinates stored as percentages
waldoLocation: { x: 45, y: 32, tolerance: 30 } // tolerance in pixels

// Click handling flow:
1. getRelativeCoordinates(event, imageElement) → {x: 47.3%, y: 34.1%}
2. percentToPixels(clickPercent, imgWidth, imgHeight) → {x: 567px, y: 409px}
3. isClickNearTarget(clickPixels, waldoPixels, tolerance) → boolean
```

### Image Asset Management
- Images in `apps/waldo-app/public/images/` (served from `/images/` or `{BASE_URL}images/`)
- Use `${BASE_URL}images/filename.svg` pattern for all image sources
- Orientation metadata (`'landscape' | 'portrait'`) controls responsive layout

### LocalStorage Schema
```typescript
// Leaderboard entries (key: 'waldoLeaderboard')
{ playerName: string, score: number, imagesFound: number, timestamp: number }[]
// Sorted by score ASC, limited to top 10
```

## Common Pitfalls

1. **Don't use absolute pixel coordinates** - breaks on different screen sizes
2. **Always reset zoom/pan state** when advancing to next image (see `ImageViewer.tsx`)
3. **Nx commands require project scope** - use `@wheres-waldo/waldo-app`, not just `waldo-app`
4. **Sets aren't directly JSON-serializable** - convert to arrays for leaderboard storage
5. **Vite BASE_URL is build-time replacement** - can't be changed at runtime

## Key Files for Context

- **Game Logic**: `apps/waldo-app/src/app/components/GameBoard/GameBoard.tsx`
- **Click Detection**: `apps/waldo-app/src/app/utils/clickDetection.ts`
- **Image Data**: `apps/waldo-app/src/app/utils/imageData.ts`
- **Nx Config**: `nx.json` (defines build/test/lint targets)
- **Vite Config**: `apps/waldo-app/vite.config.ts` (dev server, build settings)
