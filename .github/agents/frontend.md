# Frontend Agent

Domain expert for `src/frontend/` — pages, components, styling, linting, TypeScript.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, not Pages Router)
- **Runtime:** React 19.2.3, TypeScript 5 strict mode
- **Styling:** TailwindCSS 4 + PostCSS
- **Linting:** ESLint 9 (`eslint-config-next`)
- **Fonts:** Geist sans + Mono via `next/font/google`

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend base URL; defaults to `http://localhost:5132` locally

## Conventions

- **Imports:** Path alias `@/*` (resolves to `src/frontend/`)
- **Components:** `app/components/`, PascalCase filenames
- **Styling:** TailwindCSS only; no CSS modules unless essential; `dark:` prefix for dark mode
- **TypeScript:** Strict — no `any`; use `type` imports where appropriate
- **App Router:** Pages are `page.tsx`, layouts are `layout.tsx`; `"use client"` required for client components
- **Images:** `next/image` only, never raw `<img>`
- **Metadata:** Defined in `RootLayout` (`app/layout.tsx`)

## Commands

```bash
cd src/frontend
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Common Tasks

- **Add page:** `app/[feature]/page.tsx`
- **Add component:** `app/components/Name.tsx`, import via `@/components/Name`
- **Update styles:** Inline Tailwind classes only; avoid new CSS files

## Config Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript + path aliases |
| `package.json` | Dependencies and scripts |
| `next.config.ts` | Next.js config |
| `eslint.config.mjs` | ESLint rules |
| `postcss.config.mjs` | TailwindCSS pipeline |
