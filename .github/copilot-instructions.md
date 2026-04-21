# Copilot Instructions for show-db-import

## Response Guidelines

Be concise. Minimize output tokens while preserving accuracy:
- Prefer code over prose
- Skip obvious context and restated requirements
- Use bullet points over paragraphs
- Omit filler phrases ("sure!", "of course", "I'll now…")

## Project Overview

**show-db-import** — full-stack web app for importing/displaying user data from AniList and MyAnimeList. Monorepo with a Next.js frontend and ASP.NET Core backend, deployed to Azure.

## Architecture

- **Frontend** (`src/frontend/`): Next.js + React + TypeScript + TailwindCSS
- **Backend** (`src/backend/`): ASP.NET Core (.NET 10.0) Web API

## Agents

Use these agents for domain-specific work — they own all technical details for their area.

| Agent | File | Trigger |
|---|---|---|
| `frontend` | `.github/agents/frontend.md` | Any work in `src/frontend/` |
| `backend` | `.github/agents/backend.md` | Any work in `src/backend/` |
| `devops` | `.github/agents/devops.md` | CI/CD, Azure deployment, GitHub Actions |
| `api-contract` | `.github/agents/api-contract.md` | API design, endpoint contracts, AniList/MAL integration |
| `docs-sync` | `.github/agents/docs-sync.md` | After any change to architecture, dependencies, commands, or conventions |

## Local Development

```bash
cd src/frontend && npm run dev        # Frontend: http://localhost:3000
dotnet run --project src/backend      # Backend: http://localhost:5132
```

## Monorepo Structure

- `src/frontend/` — Next.js app (App Router)
- `src/backend/` — ASP.NET Core Web API
- `infra/` — Bicep templates for Azure
- `.github/agents/` — Domain-specific agent instructions

## Commit Conventions

Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

## Maintaining This File

After architecture changes, invoke the `docs-sync` agent. Accuracy over completeness — remove stale content.

## Notes

- Early-stage project — avoid over-engineering; no automated tests configured yet
