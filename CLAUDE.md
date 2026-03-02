# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**show-db-import** is a full-stack web application for importing and displaying user data from AniList and MyAnimeList (MAL). It has a Next.js frontend and ASP.NET Core backend, deployed to Azure.

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

- **Frontend** (`src/frontend/`): Next.js 16 (App Router), React 19, TypeScript 5 (strict), TailwindCSS 4. Uses `@/*` path alias for imports. Client component in `app/page.tsx` fetches from the backend API.
- **Backend** (`src/backend/`): ASP.NET Core (.NET 10.0) Web API. `Program.cs` configures CORS (allows `localhost:3000` + `FrontendUrl` config), HTTP logging, and conditional HTTPS redirection (production only). Single controller: `TimerController` at `/api/timer`.

### Environment Variables
- **Frontend**: `NEXT_PUBLIC_API_URL` — backend base URL (set at build time in CI, defaults to `http://localhost:5132` locally)
- **Backend**: `FrontendUrl` — frontend origin for CORS (set via Azure App Service config)

### CI/CD (`.github/workflows/azure-static-web-apps.yml`)
Three-job pipeline triggered on push/PR to main:
1. **lint** — `npm ci && npm run lint`
2. **deploy_backend** — `dotnet publish`, deploy to Azure App Service, output backend hostname
3. **build_and_deploy_job** — builds frontend with `NEXT_PUBLIC_API_URL` from backend hostname, deploys to Azure Static Web Apps

## Code Conventions

- **Imports**: Use `@/*` path alias (resolves to frontend root), not relative paths
- **Components**: Place in `app/components/`, PascalCase filenames (e.g., `UserImportForm.tsx`)
- **TypeScript**: Strict mode — no `any`, use `type` imports (`import type { Metadata } from "next"`)
- **Next.js**: App Router only (`page.tsx`, `layout.tsx`). Use `next/image` for images
- **Styling**: TailwindCSS utility classes, dark mode via `dark:` prefix
- **Commit style**: Conventional commits (`feat:`, `fix:`, etc.)
