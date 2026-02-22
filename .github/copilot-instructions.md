# Copilot Instructions for show-db-import

## Project Overview
**show-db-import** is a web application that imports and displays user data from AniList and MyAnimeList (MAL). Currently, it's in early development with a Next.js frontend bootstrap. Future work will include backend services for data fetching and integration with anime/manga database APIs.

## Architecture

### Current Structure
- **Frontend**: `src/frontend/` - Next.js 16 application with App Router
  - No backend yet; frontend is standalone
  - Will eventually connect to backend APIs for AniList/MAL data import
  - Early stage: only has boilerplate page and layout

### Tech Stack
- **Framework**: Next.js 16.1.6 with App Router (not Pages Router)
- **Runtime**: React 19.2.3, TypeScript 5 (strict mode enabled)
- **Styling**: TailwindCSS 4 with PostCSS 4
- **Linting**: ESLint 9 with `eslint-config-next`
- **Fonts**: Geist (via `next/font/google`)

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

## Development Workflows

### Starting Development
```bash
cd src/frontend
npm run dev
```
Server runs at `http://localhost:3000` with hot-reload enabled.

### Building
```bash
cd src/frontend
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Check for linting issues
```

### Common Tasks
- **Adding a new page**: Create `app/[feature]/page.tsx` in App Router structure
- **Adding a component**: Create in `app/components/` and use `@/components/Name` imports
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

## Notes
- This is an early-stage project—avoid over-engineering until requirements are clear
- When backend is added, document API contracts and service boundaries clearly
- No existing components or utilities—establish patterns early to maintain consistency
