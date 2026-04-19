# Frontend

A Next.js 16 + React 19 web application for displaying anime data from AniList.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Linting**: ESLint 9

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev       # Start dev server with hot reload (port 3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint on all files
npm run lint -- <file>  # Lint a specific file
```

## Project Structure

```
app/
├── layout.tsx           # Root layout (metadata, providers)
├── page.tsx             # Home page
├── components/          # Reusable components
└── api/                 # API routes (if needed)
```

## Key Conventions

### Path Aliases

Use `@/*` for clean imports:

```tsx
// Good
import { Component } from '@/components/Component'

// Avoid
import { Component } from '../../../components/Component'
```

### Styling

- Use TailwindCSS utility classes only
- No CSS modules unless absolutely necessary
- Component styling lives in the JSX

```tsx
export function Card() {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      {/* content */}
    </div>
  )
}
```

### Components

- Place reusable components in `app/components/`
- Keep components small and focused
- Use React hooks for state management

## Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5132
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## API Integration

The frontend makes requests to the backend API:

```tsx
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/endpoint`)
```

During CI/CD deployment, `NEXT_PUBLIC_API_URL` is set to the production backend URL.

## Building for Production

```bash
npm run build
npm run start
```

The production build is optimized and ready for deployment to Azure Static Web Apps.

## Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**ESLint errors?**
```bash
npm run lint
```

Review and fix issues in your code. Some can be auto-fixed with:
```bash
npm run lint -- --fix
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Contributing

For changes to the frontend, ensure ESLint passes and the build succeeds locally before pushing.
