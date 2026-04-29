# DevOps Agent

CI/CD and infrastructure expert — GitHub Actions workflows, Azure deployment, secrets & variables.

## CI/CD Pipeline

**File:** `.github/workflows/azure-static-web-apps.yml` | **Trigger:** Push to `main`

### Jobs

1. **`lint`** — `npm ci && npm run lint` (runs in parallel with deploy_backend)
2. **`deploy_backend`** — `dotnet publish -c Release -o publish` → Azure App Service; outputs `backend_host`
3. **`build_and_deploy_frontend`** (needs: lint, deploy_backend) — sets `NEXT_PUBLIC_API_URL` from `backend_host`; deploys to Static Web Apps; sets backend `FrontendUrl` to SWA URL for CORS

## Azure Resources

| Resource | Service |
|----------|---------|
| Frontend | Azure Static Web Apps (`skip_app_build: true`) |
| Backend | Azure App Service (`azure/webapps-deploy@v3`) |

## Secrets & Configuration

| Name | Type | Purpose |
|------|------|---------|
| `AZURE_CLIENT_ID` | Secret | Entra app registration for OIDC |
| `AZURE_SUBSCRIPTION_ID` | Secret | Azure subscription |
| `AZURE_TENANT_ID` | Secret | Entra tenant |
| `AZURE_BACKEND_APP_NAME` | Variable | Backend App Service name |
| `AZURE_RESOURCE_GROUP` | Variable | Resource group for backend |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Secret | Static Web Apps deploy token |
| `GITHUB_TOKEN` | Auto | Static Web Apps deploy action |
| `AzureOpenAI__Endpoint` | App setting (from Bicep) | Azure OpenAI endpoint; set via `infra/modules/azure-openai.bicep` |
| `AzureOpenAI__DeploymentName` | App setting (from Bicep) | Azure OpenAI deployment name; set via `infra/modules/azure-openai.bicep` |

## Conventions

- `actions/cache@v4` for `node_modules` keyed on `package-lock.json` hash
- `actions/setup-node@v4` (Node 20.x), `actions/setup-dotnet@v4` (net10.0)
- `azure/login@v2` with OIDC (`id-token: write`); always `az logout` after Azure CLI
- Concurrency group `static-web-apps-production`, `cancel-in-progress: true`
- Validate `AZURE_BACKEND_APP_NAME` and `AZURE_RESOURCE_GROUP` early in jobs

## Common Tasks

- **Update pipeline:** `.github/workflows/azure-static-web-apps.yml`
- **Add secret:** GitHub Settings → Secrets; reference as `${{ secrets.NAME }}`
- **Add variable:** GitHub Settings → Variables; reference as `${{ vars.NAME }}`
- **Change backend name/RG:** Set `AZURE_BACKEND_APP_NAME` / `AZURE_RESOURCE_GROUP` variables
