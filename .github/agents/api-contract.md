# API Contract Agent

API design and integration expert — contract between frontend and backend, and external service integration strategy.

## Current API Surface

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/timer` | `{ "utcTime": "2025-01-01T00:00:00Z" }` |

Controller: `src/backend/Controllers/TimerController.cs`
Consumer: `src/frontend/app/page.tsx` via `NEXT_PUBLIC_API_URL`

## API Connectivity Pattern

1. **Local:** `NEXT_PUBLIC_API_URL` defaults to `http://localhost:5132`
2. **CI:** DevOps pipeline sets `NEXT_PUBLIC_API_URL` from Azure backend hostname at build time
3. **CORS:** `FrontendUrl` controls allowed origin; `http://localhost:3000` always allowed

When adding endpoints: update backend controller (coordinate with `backend`) and frontend fetch (coordinate with `frontend`).

## API Design Conventions

- Route prefix: `/api/[controller]`
- JSON responses with camelCase properties
- HTTP methods: GET (read), POST (create), PUT/PATCH (update)
- Status codes: 200, 201, 400, 404, 500
- Document every endpoint in this file

## External API Integration (Future)

| Service | Protocol | Auth | Scoring |
|---------|----------|------|---------|
| AniList | GraphQL (`https://graphql.anilist.co`) | OAuth2 | 1–100 |
| MyAnimeList | REST | OAuth2 | 1–10 |

Normalize to common schema: `title`, `status`, `score`, `progress`, source `id`. Preserve source IDs for back-links.

## Common Tasks

- **New endpoint:** Define contract here first, then coordinate with `backend` and `frontend` agents
- **External integration:** Document API surface, auth flow, and data mapping here before implementation
- **API connectivity change:** Coordinate with `devops` if CI wiring changes
