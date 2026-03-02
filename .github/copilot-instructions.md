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
| `devops` | `.github/agents/devops.md` | CI/CD pipeline, Azure deployment, GitHub Actions, secrets management |
| `api-contract` | `.github/agents/api-contract.md` | API design, endpoint contracts, AniList/MAL integration planning |
| `docs-sync` | `.github/agents/docs-sync.md` | After any change to architecture, dependencies, commands, or conventions |

## Local Development

Run both services in separate terminals:

```bash
cd src/frontend && npm run dev        # Frontend at http://localhost:3000
dotnet run --project src/backend      # Backend at http://localhost:5132
```

## Commit Conventions

Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.

## Maintaining This File

After architecture changes, invoke the `docs-sync` agent to keep this file and agent definitions in sync. Accuracy over completeness — remove stale content rather than leaving it wrong.

## Notes

- This is an early-stage project — avoid over-engineering until requirements are clear
- Establish patterns early to maintain consistency
