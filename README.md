# show-db-import

A full-stack web application for importing and displaying anime user data from AniList and MyAnimeList (MAL). Built with Next.js, React, ASP.NET Core, and deployed to Azure.

**[Frontend README](./src/frontend/README.md) • [Backend README](./src/backend/README.md) • [Infrastructure README](./infra/README.md)**

## Project Structure

This is a **monorepo** with two independent services:

- **Frontend** (`src/frontend/`) – Next.js 16 + React 19 + TypeScript + TailwindCSS 4
- **Backend** (`src/backend/`) – ASP.NET Core 10.0 Web API
- **Infrastructure** (`infra/`) – Bicep templates for Azure provisioning

## Quick Start

### Local Development

Run both services in separate terminal windows:

```bash
# Terminal 1: Backend (runs on http://localhost:5132)
dotnet run --project src/backend

# Terminal 2: Frontend (runs on http://localhost:3000)
cd src/frontend && npm run dev
```

The frontend is configured to call `http://localhost:5132/api/` by default.

### Prerequisites

- **Node.js 18+** and npm (for frontend)
- **.NET 10.0 SDK** (for backend)
- Azure CLI (for cloud deployment)

## Deployment

This project uses **GitHub Actions** for automated deployment to Azure:

- **Frontend** → Azure Static Web Apps
- **Backend** → Azure App Service
- **Infrastructure** → Provisioned with Bicep

### Setup (First Time)

1. Add Azure service principal secrets to the repository:
   - `AZURE_CLIENT_ID`
   - `AZURE_CREDENTIALS` (JSON with clientId, clientSecret, subscriptionId, tenantId)
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_TENANT_ID`

2. Push to `main` or run the deployment workflow manually.

3. The workflow will:
   - Provision Azure resources using Bicep
   - Deploy the backend to App Service
   - Build and deploy the frontend to Static Web Apps
   - Configure CORS settings automatically

### Naming Convention

Azure resources follow a CAF-inspired pattern:

```
<prefix>-<workload>-<component>-<environment>-<region>-<instance>
```

Examples:
- `rg-show-db-import-prod` (resource group)
- `swa-showdbimport-prod-001-abc123` (Static Web App)
- `app-showdbimport-api-prod-001` (App Service)

See [infra/README.md](./infra/README.md) for more details.

## Development

### Frontend Commands

```bash
cd src/frontend
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
npm run start     # Start production server
```

### Backend Commands

```bash
cd src/backend
dotnet run        # Start dev server (http://localhost:5132)
dotnet build      # Build project
dotnet watch      # Auto-rebuild on file changes
```

## Architecture Notes

- **Frontend** uses App Router (not Pages Router) with `@/*` path aliases
- **Backend** exposes REST APIs under `/api/` with CORS enabled for localhost dev
- **CORS** is configured per environment:
  - Local: `http://localhost:3000` always allowed
  - Production: Controlled by `FrontendUrl` environment variable

## Contributing

- Frontend changes → see [src/frontend/README.md](./src/frontend/README.md)
- Backend changes → see [src/backend/README.md](./src/backend/README.md)
- Infrastructure changes → see [infra/README.md](./infra/README.md)

For detailed development conventions and patterns, refer to each component's README.

## License

See [LICENSE](./LICENSE) file.

