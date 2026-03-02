# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**show-db-import** is a full-stack web application for importing and displaying user data from AniList and MyAnimeList (MAL). It has a Next.js frontend and ASP.NET Core backend, deployed to Azure. The ultimate goal is importing user anime/manga lists from AniList and MAL, normalizing data across both services.

## Build & Run Commands

### Frontend (`src/frontend/`)
```bash
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm start          # Start production server
npm run lint       # ESLint checks
```

### Backend (`src/backend/`)
```bash
dotnet run         # Dev server at http://localhost:5132
dotnet publish -c Release -o publish   # Production build
```

### Local Development (both services)
Run backend (`dotnet run --project src/backend`) and frontend (`cd src/frontend && npm run dev`) in separate terminals. The frontend calls `http://localhost:5132/api/timer` by default via the `NEXT_PUBLIC_API_URL` env var.

## Architecture

**Monorepo** with two apps under `src/`:

- **Frontend** (`src/frontend/`): Next.js 16.1.6 (App Router), React 19.2.3, TypeScript 5 (strict), TailwindCSS 4. Uses `@/*` path alias for imports. Client component in `app/page.tsx` fetches from the backend API. Geist font family (sans + mono) via `next/font/google`.
- **Backend** (`src/backend/`): ASP.NET Core (.NET 10.0) Web API. `Program.cs` configures CORS (allows `localhost:3000` + `FrontendUrl` config), HTTP logging, and conditional HTTPS redirection (production only). Single controller: `TimerController` at `/api/timer`.

### Environment Variables
- **Frontend**: `NEXT_PUBLIC_API_URL` — backend base URL (set at build time in CI, defaults to `http://localhost:5132` locally)
- **Backend**: `FrontendUrl` — frontend origin for CORS (set via Azure App Service config)

### CI/CD (`.github/workflows/azure-static-web-apps.yml`)
Three-job pipeline triggered on push/PR to main:
1. **lint** — `npm ci && npm run lint`
2. **deploy_backend** — `dotnet publish`, deploy to Azure App Service, output backend hostname
3. **build_and_deploy_job** — builds frontend with `NEXT_PUBLIC_API_URL` from backend hostname, deploys to Azure Static Web Apps

### Key Configuration Files
- `src/frontend/tsconfig.json` — TypeScript compiler options and `@/*` path alias
- `src/frontend/package.json` — Dependencies and npm scripts
- `src/frontend/next.config.ts` — Next.js configuration
- `src/frontend/eslint.config.mjs` — Linting rules
- `src/backend/backend.csproj` — .NET project configuration

## Code Conventions

- **Imports**: Use `@/*` path alias (resolves to frontend root), not relative paths
- **Components**: Place in `app/components/`, PascalCase filenames (e.g., `UserImportForm.tsx`)
- **TypeScript**: Strict mode — no `any`, use `type` imports (`import type { Metadata } from "next"`)
- **Next.js**: App Router only (`page.tsx`, `layout.tsx`). Use `next/image` for images. Metadata defined in `layout.tsx`
- **Styling**: TailwindCSS utility classes, dark mode via `dark:` prefix. Use consistent spacing (`gap-*`, `px-*`, `py-*`). No CSS modules — use inline Tailwind classes
- **Commit style**: Conventional commits (`feat:`, `fix:`, etc.)

## Common Tasks

- **Adding a page**: Create `app/[feature]/page.tsx` following App Router conventions
- **Adding a component**: Create in `app/components/` with PascalCase filename, import via `@/components/Name`
- **Adding a backend endpoint**: Create a new controller in `src/backend/Controllers/`, use `[ApiController]` and `[Route("api/[controller]")]` attributes
- **Updating styling**: Modify inline Tailwind classes; avoid creating new CSS files

## Maintaining This File

**This file must be kept in sync with the codebase at all times.** After completing any task that changes the project's architecture, dependencies, conventions, build commands, environment variables, CI/CD pipeline, or file structure, you must review this file and update it to reflect those changes. This includes:

- Adding new dependencies, frameworks, or tools
- Creating or renaming files/directories that affect project structure
- Changing build, run, lint, or test commands
- Adding or modifying environment variables
- Updating CI/CD workflows
- Establishing new code conventions or patterns
- Adding new API endpoints or controllers
- Removing or deprecating existing functionality

Remove any information that is no longer accurate. Do not leave stale documentation. If a section no longer applies, delete it. Accuracy is more important than completeness — wrong instructions are worse than missing ones.

Also keep `.github/copilot-instructions.md` updated with the same changes to maintain parity between AI assistant instruction files.
