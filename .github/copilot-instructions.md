# Copilot Instructions for show-db-import

## Project Overview

**show-db-import** is a full-stack web application for importing and displaying user data from AniList and MyAnimeList (MAL). It's a monorepo with a Next.js frontend and ASP.NET Core backend, deployed to Azure.

## Architecture

**Monorepo** with two apps under `src/`:

- **Frontend** (`src/frontend/`): Next.js + React + TypeScript + TailwindCSS
- **Backend** (`src/backend/`): ASP.NET Core (.NET 10.0) Web API

## Agents

Use these agents for domain-specific work — they own all technical details for their area. Do not duplicate their content here; refer to the agent file for specifics.

| Agent | File | Trigger |
|---|---|---|
| `frontend` | `.github/agents/frontend.md` | Any work in `src/frontend/` — pages, components, styling, TypeScript, ESLint |
| `backend` | `.github/agents/backend.md` | Any work in `src/backend/` — controllers, middleware, configuration |
| `devops` | `.github/agents/devops.md` | CI/CD pipeline, Azure deployment, GitHub Actions, secrets & variables |
| `api-contract` | `.github/agents/api-contract.md` | API design, endpoint contracts, AniList/MAL integration planning |
| `docs-sync` | `.github/agents/docs-sync.md` | After any change to architecture, dependencies, commands, or conventions |

## Build & Test Commands

### Frontend (`src/frontend/`)

```bash
cd src/frontend

npm run dev                # Dev server with hot-reload (http://localhost:3000)
npm run build              # Production build
npm run start              # Start production server
npm run lint               # Run ESLint on all files
npm run lint -- path/to/file.tsx  # Lint a specific file
```

**Note:** No test runner currently configured. Tests should be added when necessary.

### Backend (`src/backend/`)

```bash
cd src/backend

dotnet run                 # Dev server (http://localhost:5132)
dotnet build               # Build project
dotnet publish -c Release -o publish  # Production build
```

**Note:** No unit test framework currently configured. Add xUnit, NUnit, or Moq when testing is needed.

## Local Development

Run both services in separate terminals:

```bash
cd src/frontend && npm run dev        # Frontend at http://localhost:3000
dotnet run --project src/backend      # Backend at http://localhost:5132
```

Both services allow `localhost` origins for CORS by default. The frontend calls `http://localhost:5132/api/timer` by default.

## Monorepo Structure

- **Root:** Bicep infrastructure, GitHub Actions workflows, licenses
- **src/frontend/:** Next.js 16 + React 19 + TypeScript + TailwindCSS 4
- **src/backend/:** ASP.NET Core 10.0 Web API in C#
- **infra/:** Bicep templates for Azure provisioning (Static Web Apps + App Service)
- **.github/agents/:** Domain-specific agent instructions for frontend, backend, DevOps, API contracts, and documentation sync

## Key Architectural Patterns

### Frontend
- **App Router** (not Pages Router) — app structure at `src/frontend/app/`
- **Path aliases** via `@/*` for clean imports (resolves to `src/frontend/`)
- **Component location:** Reusable components in `app/components/`
- **Styling:** TailwindCSS only; no CSS modules unless essential
- **Metadata:** Configured centrally in `RootLayout`

### Backend
- **Controllers** in `src/backend/Controllers/` with `[ApiController]` and `[Route("api/[controller]")]`
- **CORS** configured in `Program.cs` — `FrontendUrl` env var controls allowed origin; `http://localhost:3000` always allowed locally
- **HTTPS redirection** only enabled in production
- **File-scoped namespaces** and implicit usings enabled

### Deployment
- **Infrastructure as Code:** Bicep templates in `infra/main.bicep` with repository-driven naming
- **CI/CD:** GitHub Actions workflows in `.github/workflows/`
- **Azure targets:** Static Web Apps (frontend) + App Service (backend)
- **Naming pattern:** `<prefix>-<workload>-<component>-<environment>` (e.g., `app-showdbimport-api-prod-001`)

## MCP Servers

For enhanced AI-assisted development, consider configuring these MCP servers:

- **Playwright:** Browser automation for end-to-end testing of the Next.js frontend
- **Filesystem & Git:** Direct file and repository operations for code navigation and commit management
- **Database:** Query and manage any future database integrations (currently not used)

Configure in your `.clinerules`, `.cursorrules`, or Copilot space settings as needed.

## Commit Conventions

Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.

## Maintaining This File

After architecture changes, invoke the `docs-sync` agent to keep this file and agent definitions in sync. Accuracy over completeness — remove stale content rather than leaving it wrong.

## Notes

- This is an early-stage project — avoid over-engineering until requirements are clear
- Establish patterns early to maintain consistency
- No automated tests configured yet; add test frameworks when testing becomes a priority
