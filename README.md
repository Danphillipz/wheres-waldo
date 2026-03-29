# Where's Waldo

An Nx monorepo with a React application — an interactive "Where's Amy & Dan" game.

## Overview

This project demonstrates a modern development setup combining:
- **Nx monorepo** for efficient workspace management
- **React application** built with Vite
- **GitHub Pages** for automated deployment
- **Cloud-ready leaderboard** for cross-device score persistence

## Features

- 🎯 Interactive "Where's Waldo" game with Amy and Dan
- 📱 Mobile-optimized with pinch zoom and pan support
- 🏆 Leaderboard system (localStorage by default, cloud-ready)
- 🎨 Responsive design that works on all devices
- ⚡ Fast performance with Vite and React 19

## Cloud Leaderboard

By default, the leaderboard uses localStorage (device-only storage). To enable cross-device score sharing:

1. See [CLOUD_LEADERBOARD.md](./CLOUD_LEADERBOARD.md) for detailed setup instructions
2. Choose from Firebase, Supabase, or your own backend
3. Free tier options available for all platforms

Quick start with Firebase:
```bash
npm install firebase
# Follow instructions in CLOUD_LEADERBOARD.md
```

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Git

### Installation

```bash
# Install dependencies
npm install

# Build the application
npx nx build @wheres-waldo/waldo-app

# Run development server
npx nx dev @wheres-waldo/waldo-app

# Run tests
npx nx test @wheres-waldo/waldo-app

# Run linting
npx nx lint @wheres-waldo/waldo-app
```

## Deployment to GitHub Pages

The application is configured for automatic deployment to GitHub Pages on every push to the `main` branch.

### Setup GitHub Pages

1. Go to your repository Settings → Pages
2. Under "Build and deployment", select "Source: GitHub Actions"
3. Push to the `main` branch to trigger deployment

The workflow file is located at `.github/workflows/deploy.yml`.

### Manual Deployment

To manually trigger a deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

### Local Build for GitHub Pages

To build locally with the GitHub Pages base path:

```bash
VITE_BASE_PATH=/wheres-waldo/ npx nx build @wheres-waldo/waldo-app
```

## Project Structure

```
wheres-waldo/
├── apps/
│   ├── waldo-app/          # Main React application
│   ├── waldo-app-e2e/      # End-to-end tests
│   └── image-creator/      # Dev-only tool for creating image configurations
├── libs/
│   └── shared-ui/          # Shared utilities (click detection, image types)
└── ...
```

## Technologies

- **Monorepo**: Nx 22.0.3
- **Frontend**: React 19.0.0
- **Build Tool**: Vite 7.0.0
- **Testing**: Jest 30.0.2
- **E2E Testing**: Playwright 1.36.0
- **Language**: TypeScript 5.9.2

## License

MIT