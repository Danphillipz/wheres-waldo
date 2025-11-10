# Where's Waldo Development Guidelines

This project is configured for spec-driven development using GitHub Spec Kit.

## Project Overview

Where's Waldo is an Nx monorepo with a React application, set up for spec-driven development workflows.

## Technologies

- **Monorepo**: Nx 22.0.3
- **Frontend**: React 19.0.0 with Vite 7.0.0
- **Testing**: Jest 30.0.2
- **E2E Testing**: Playwright 1.36.0
- **Styling**: CSS
- **Language**: TypeScript 5.9.2

## Project Structure

```text
wheres-waldo/
├── apps/
│   ├── waldo-app/          # Main React application
│   └── waldo-app-e2e/      # E2E tests
├── .specify/               # Spec-driven development artifacts
│   ├── memory/            # Project memory and constitution
│   ├── scripts/           # Automation scripts
│   ├── templates/         # Spec, plan, and task templates
│   └── specs/             # Feature specifications (created per feature)
├── nx.json                # Nx configuration
└── package.json           # Root package.json
```

## Available Slash Commands

After setting up a feature, you have access to these commands:

- `/speckit.constitution` - Create/update project governing principles
- `/speckit.specify` - Define feature requirements and user stories
- `/speckit.plan` - Create technical implementation plans
- `/speckit.tasks` - Generate actionable task breakdown
- `/speckit.implement` - Execute all tasks to build the feature
- `/speckit.clarify` - Clarify underspecified areas (use before planning)
- `/speckit.analyze` - Cross-artifact consistency analysis
- `/speckit.checklist` - Generate quality validation checklists

## Development Workflow

1. **Constitution**: Establish project principles with `/speckit.constitution`
2. **Specify**: Define what to build with `/speckit.specify`
3. **Clarify**: Use `/speckit.clarify` to resolve ambiguities
4. **Plan**: Create technical plan with `/speckit.plan`
5. **Tasks**: Break down into tasks with `/speckit.tasks`
6. **Implement**: Execute with `/speckit.implement`

## Commands

### Build
```bash
npx nx build @wheres-waldo/waldo-app
```

### Test
```bash
npx nx test @wheres-waldo/waldo-app
```

### Lint
```bash
npx nx lint @wheres-waldo/waldo-app
```

### Dev Server
```bash
npx nx dev @wheres-waldo/waldo-app
```

## Code Style

- TypeScript with strict mode
- ESLint for code quality
- Prettier for code formatting
- React hooks and functional components
- CSS modules for styling

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
