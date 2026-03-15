# show-db-import
Imports user data and shows from AniList/MAL

## Deployment

This repository is set up to provision and deploy the application with GitHub Actions. The main workflow is `.github/workflows/azure-static-web-apps.yml`.

### Setup Steps

1. **Set up service principal authentication** by adding these secrets to the repository:
   - `AZURE_CLIENT_ID` – from the service principal registration
   - `AZURE_CREDENTIALS` – JSON string containing `clientId`, `clientSecret`, `subscriptionId`, and `tenantId`
   - `AZURE_SUBSCRIPTION_ID` – subscription ID where the deployment runs
   - `AZURE_TENANT_ID` – Azure tenant ID
2. Commit and push to the `main` branch or run the workflow manually.
3. The workflow will:
   - derive naming from the repository name
   - create or reuse the Azure resource group
   - provision or converge infrastructure with Bicep
   - deploy the backend to Azure App Service
   - build and deploy the frontend to Azure Static Web Apps
   - update backend CORS settings
4. The workflow summary includes:
   - live frontend and backend URLs
   - Azure Portal links for the resource group and deployed resources
   - resource IDs for the provisioned environment

## Backend deployment

The repository now includes an ASP.NET Core backend that is deployed to Azure App Service.

1. **Set up service principal authentication** as described above.
2. **Push-driven deployments now provision first**. The main workflow provisions or reuses the
   Azure environment before deploying application code, so infrastructure is no longer a separate
   prerequisite.
3. **Repository-driven naming** is used for the resource group and workload naming inputs. The
   workflow derives names from the repository at runtime, for example:
   - Resource group: `rg-<repository-name>-<environment>`
   - Static Web App: `swa-<normalized-repository-name>-<environment>-<instance>-<suffix>`
   - Backend Web App: `app-<normalized-repository-name>-api-<environment>-<instance>-<suffix>`
4. **Configure CORS** on the backend by setting an application setting
   `FrontendUrl` to the production frontend's URL, e.g.
   `https://thankful-plant-0f346d30f.2.azurestaticapps.net/`. The backend also
   permits `http://localhost:3000` automatically for development. If the backend is created
   through the Bicep template, this setting is pre-populated from the Static Web App URL and the
   frontend deployment step keeps it in sync.
5. **API URL for frontend**: during the GitHub Actions build the workflow will
   insert `NEXT_PUBLIC_API_URL` pointing at the backend App Service URL. The
   frontend code reads this variable at runtime (see `src/frontend/app/page.tsx`).

## Bicep provisioning

The repository now includes Bicep infrastructure in `infra/` for the current production shape:

- Azure Static Web Apps for the frontend
- Azure App Service Plan + Web App for the backend
- Optional Application Insights + Log Analytics for baseline monitoring

### Naming approach

The Bicep template uses a simple CAF-inspired naming pattern, with the repository name used as the workload core:

`<prefix>-<workload>-<component?>-<environment>-<region?>-<instance?>`

Examples:

- `rg-show-db-import-prod`
- `swa-showdbimport-prod-001-<suffix>`
- `plan-showdbimport-prod-eus2-001`
- `app-showdbimport-api-prod-001-<suffix>`

### Provision locally

```bash
az group create --name <resource-group> --location eastus2
az deployment group create --resource-group <resource-group> --template-file infra/main.bicep --parameters infra/main.bicepparam
```

### Provision from GitHub Actions

Run the `Provision Azure infrastructure` workflow manually if you want to provision without a full
application deployment. It derives the resource group from the repository name, creates the
resource group if needed, deploys `infra/main.bicep`, and writes a summary that includes:

- resource names
- resource IDs
- the backend API base URL
- the Static Web App URL
- Azure Portal links for the deployed environment

### Important outputs

The top-level Bicep template returns operator-friendly outputs:

- `resourceGroupName`
- `staticWebAppName`
- `staticWebAppUrl`
- `backendAppServicePlanName`
- `backendWebAppName`
- `backendApiBaseUrl`
- `resourceGroupPortalUrl`
- `appServicePlanPortalUrl`
- `backendWebAppPortalUrl`
- `staticWebAppPortalUrl`
- `deploymentPortalUrl`
- `resourceIds`
- `deploymentSummary`

### Local development

Run the frontend and backend separately; both allow `localhost` origins:

```bash
# backend (runs on default 5132)
dotnet run --project src/backend
# frontend
cd src/frontend && npm run dev
```

By default the UI will call `http://localhost:5132/api/timer`.

---

