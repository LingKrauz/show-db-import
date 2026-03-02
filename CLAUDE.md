# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**show-db-import** is a full-stack web application for importing and displaying user data from AniList and MyAnimeList (MAL). It has a Next.js frontend and ASP.NET Core backend, deployed to Azure. The ultimate goal is importing user anime/manga lists from AniList and MAL, normalizing data across both services.

## Architecture

**Monorepo** with two apps under `src/`:

- **Frontend** (`src/frontend/`): Next.js + React + TypeScript + TailwindCSS
- **Backend** (`src/backend/`): ASP.NET Core (.NET 10.0) Web API

## Local Development

Run both services in separate terminals:

```bash
dotnet run --project src/backend     # Backend at http://localhost:5132
cd src/frontend && npm run dev        # Frontend at http://localhost:3000
```

## Agents

Use these agents for domain-specific work — they own all technical details for their area:

| Agent | Trigger |
|---|---|
| `frontend` | Any work in `src/frontend/` — pages, components, styling, TypeScript, ESLint |
| `backend` | Any work in `src/backend/` — controllers, middleware, configuration |
| `devops` | CI/CD pipeline, Azure deployment, GitHub Actions, secrets management |
| `docs-sync` | After any change to architecture, dependencies, commands, or conventions |

## Commit Style

Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.

## Maintaining This File

After architecture changes, invoke the `docs-sync` agent to keep this file and `.github/copilot-instructions.md` in sync. Accuracy over completeness — remove stale content rather than leaving it wrong.
