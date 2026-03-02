# Copilot Instructions for show-db-import

## Project Overview
**show-db-import** is a full-stack web application for importing and displaying user data from AniList and MyAnimeList (MAL). It's a monorepo with a Next.js frontend and ASP.NET Core backend, deployed to Azure. The ultimate goal is importing user anime/manga lists from AniList and MAL, normalizing data across both services.

## Architecture

### Current Structure
- **Frontend**: `src/frontend/` - Next.js 16 application with App Router
  - Client component in `app/page.tsx` fetches from the backend API
  - Uses Geist font family (sans + mono) via `next/font/google`
- **Backend**: `src/backend/` - ASP.NET Core (.NET 10.0) Web API
  - `Program.cs` configures CORS, HTTP logging, conditional HTTPS redirection
  - Single controller: `TimerController` at `/api/timer` (returns UTC time)

### Tech Stack
- **Frontend**: Next.js 16.1.6 with App Router (not Pages Router), React 19.2.3, TypeScript 5 (strict mode enabled), TailwindCSS 4 with PostCSS 4, ESLint 9 with `eslint-config-next`, Geist font (via `next/font/google`)
- **Backend**: ASP.NET Core (.NET 10.0), C# with nullable reference types and implicit usings

### Environment Variables
- **Frontend**: `NEXT_PUBLIC_API_URL` — backend base URL (set at build time in CI, defaults to `http://localhost:5132` locally)
- **Backend**: `FrontendUrl` — frontend origin for CORS (set via Azure App Service config in production)

### Project-Specific Patterns

**Module Imports:**
- Use path alias `@/*` (resolves to frontend root) for clean imports
- Example: `@/components/Header` instead of `../../../components/Header`

**Component Location & Naming:**
- No established components directory yet—create `app/components/` for reusable components
- When adding components, use PascalCase filenames (e.g., `UserImportForm.tsx`)

**Styling Conventions:**
- Use TailwindCSS utility classes (no CSS modules currently configured)
- Dark mode is responsive via `dark:` prefix (see `layout.tsx`)
- Consistent spacing scale: use `gap-*`, `px-*`, `py-*` consistently

**TypeScript:**
- TypeScript strict mode is enabled—all types must be explicitly defined
- Use `type` imports where appropriate: `import type { Metadata } from "next"`
- Avoid `any` type; use explicit types or generics

**Next.js specific:**
- Use App Router conventions: pages are `page.tsx`, layouts are `layout.tsx`
- Metadata is defined in `RootLayout` (see [layout.tsx](src/frontend/app/layout.tsx#L6))
- Use `next/image` for image optimization, not `<img>`

**Backend (.NET):**
- Controllers use `[ApiController]` and `[Route("api/[controller]")]` attributes
- CORS is configured in `Program.cs` to allow the frontend origin
- HTTPS redirection is only enabled in production (`!app.Environment.IsDevelopment()`)

**Commit Conventions:**
- Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, etc.)

## Development Workflows

### Starting Development
```bash
# Frontend
cd src/frontend
npm run dev
# Server runs at http://localhost:3000 with hot-reload

# Backend (separate terminal)
cd src/backend
dotnet run
# Server runs at http://localhost:5132
```

### Building
```bash
# Frontend
cd src/frontend
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Check for linting issues

# Backend
cd src/backend
dotnet publish -c Release -o publish   # Production build
```

### CI/CD (`.github/workflows/azure-static-web-apps.yml`)
Three-job pipeline triggered on push/PR to main:
1. **lint** — `npm ci && npm run lint` (frontend ESLint checks)
2. **deploy_backend** — `dotnet publish`, deploy to Azure App Service, output backend hostname
3. **build_and_deploy_job** — builds frontend with `NEXT_PUBLIC_API_URL` from backend hostname, deploys to Azure Static Web Apps

### Common Tasks
- **Adding a new page**: Create `app/[feature]/page.tsx` in App Router structure
- **Adding a component**: Create in `app/components/` and use `@/components/Name` imports
- **Adding a backend endpoint**: Create a new controller in `src/backend/Controllers/`, follow `TimerController` pattern
- **Updating styling**: Modify inline Tailwind classes; avoid creating new CSS files unless component-scoped is essential
- **Database/API Setup**: Not yet implemented—document decisions when backend services are added

## Critical Knowledge for Contributors

### AniList/MAL Integration (Future)
- The ultimate goal is importing user shows/anime lists from these external services
- Will require OAuth/API key authentication with external services
- Think through data schema and how to normalize AniList vs MAL differences
- Document API contracts when backend is created

### Configuration Files to Know
- [tsconfig.json](src/frontend/tsconfig.json) - TypeScript compiler options and path aliases
- [package.json](src/frontend/package.json) - Dependencies and npm scripts
- [next.config.ts](src/frontend/next.config.ts) - Next.js configuration (currently empty)
- [eslint.config.mjs](src/frontend/eslint.config.mjs) - Linting rules
- [backend.csproj](src/backend/backend.csproj) - .NET project configuration

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

Also keep `CLAUDE.md` updated with the same changes to maintain parity between AI assistant instruction files.

## Notes
- This is an early-stage project—avoid over-engineering until requirements are clear
- Document API contracts and service boundaries clearly when adding new endpoints
- Establish patterns early to maintain consistency
