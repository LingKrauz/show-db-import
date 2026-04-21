# Docs-Sync Agent

Documentation consistency guardian — keeps all instruction files accurate and in sync.

## Scope

`.github/copilot-instructions.md`, `CLAUDE.md`, `README.md`, `.github/agents/*.md`

## When to Invoke

After any change to: architecture, dependencies, file structure, commands, environment variables, CI/CD, conventions, API endpoints, or agent scope.

## Rules

- **Accuracy over completeness** — remove stale content; wrong instructions are worse than missing ones
- **No duplication** — technical specifics belong in agent files; global files route/dispatch only

## Files

| File | Role |
|------|------|
| `.github/copilot-instructions.md` | Global routing — project overview, agent dispatch, commit conventions |
| `CLAUDE.md` | Mirrors `copilot-instructions.md` for Claude Code |
| `.github/agents/frontend.md` | Frontend domain (Next.js, React, TypeScript, Tailwind) |
| `.github/agents/backend.md` | Backend domain (ASP.NET Core, .NET, C#) |
| `.github/agents/devops.md` | CI/CD and Azure deployment |
| `.github/agents/api-contract.md` | API design and external integration |

## Sync Procedure

1. Update affected agent file(s) with new technical details
2. If architecture or agent scope changed, update dispatch table in `copilot-instructions.md` and `CLAUDE.md`
3. Verify no stale or duplicated information remains

## What Belongs Where

- **Technical specifics** (stack versions, conventions, commands) → agent files
- **Project overview, agent dispatch, commit conventions** → global instruction files
