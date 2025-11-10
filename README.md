# Where's Waldo

An Nx monorepo with a React application, configured for spec-driven development using GitHub Spec Kit.

## Overview

This project demonstrates a modern development setup combining:
- **Nx monorepo** for efficient workspace management
- **React application** built with Vite
- **GitHub Spec Kit** for spec-driven development workflows
- **GitHub Pages** for automated deployment

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
│   └── waldo-app-e2e/      # End-to-end tests
├── .specify/               # Spec-driven development artifacts
│   ├── memory/            # Project constitution and memory
│   ├── scripts/           # Automation scripts
│   ├── templates/         # Spec, plan, and task templates
│   └── specs/             # Feature specifications (created per feature)
└── ...
```

## Spec-Driven Development

This project uses GitHub Spec Kit for structured, specification-driven development. The workflow includes:

1. **Constitution** - Establish project principles
2. **Specify** - Define feature requirements
3. **Plan** - Create technical implementation plans
4. **Tasks** - Break down into actionable tasks
5. **Implement** - Execute the implementation

### Available Commands

When working with AI coding assistants, these slash commands are available:

- `/speckit.constitution` - Create/update project governing principles
- `/speckit.specify` - Define feature requirements and user stories
- `/speckit.plan` - Create technical implementation plans
- `/speckit.tasks` - Generate actionable task breakdown
- `/speckit.implement` - Execute all tasks to build the feature

See `.specify/COPILOT.md` for detailed development guidelines.

## Technologies

- **Monorepo**: Nx 22.0.3
- **Frontend**: React 19.0.0
- **Build Tool**: Vite 7.0.0
- **Testing**: Jest 30.0.2
- **E2E Testing**: Playwright 1.36.0
- **Language**: TypeScript 5.9.2

## License

MIT