# show-db-import
Imports user data and shows from AniList/MAL

## Deployment

This repository is set up to deploy the frontend to **Azure Static Web Apps** using GitHub Actions. The workflow file is located at `.github/workflows/azure-static-web-apps.yml`.

### Setup Steps

1. **Create an Azure Static Web App** in the Azure portal. During creation select GitHub as the deployment source and point it to this repository.
2. When Azure generates the deployment workflow, it will add a secret named `AZURE_STATIC_WEB_APPS_API_TOKEN` to the repository automatically. If you recreate the workflow manually, set that secret yourself under _Settings > Secrets and variables > Actions_.
3. Ensure the workflow settings match the project:
   - **App location**: `src/frontend`
   - **Output location**: `src/frontend/.next`
   - **API location**: (leave blank for now)

4. **Pipeline improvements & best practices**
   - A separate **lint/type‑check job** runs before the build; it prevents bad code from deploying.
   - Node modules are cached to reduce build time between runs.
   - The job uses a **concurrency group** (`static-web-apps-production`) so only one deployment executes at a time.
   - A GitHub **Production environment** is declared; the deployment URL is attached as the output.

5. Commit and push to the `main` branch. The GitHub Actions pipeline will install dependencies, build the front end and then upload the static assets to Azure.

Once the action completes successfully, your site will be accessible at the generated Azure static web address.

## Backend deployment

The repository now includes an ASP.NET Core backend that is deployed to Azure App Service.

1. **Set up service principal authentication** by adding these secrets to the repository:
   - `AZURE_CLIENT_ID` – from the service principal registration
   - `AZURE_CREDENTIALS` – JSON string containing `clientId`, `clientSecret`,
     `subscriptionId`, and `tenantId` for the service principal
   - `AZURE_SUBSCRIPTION_ID` – subscription ID where the App Service is deployed
   - `AZURE_TENANT_ID` – Azure tenant ID

   For help configuring a service principal, see [Microsoft's documentation](https://docs.microsoft.com/en-us/azure/developer/github/connect-from-azure).
2. **Provision infrastructure with Bicep** using `infra/main.bicep` or the manual workflow
   `.github/workflows/provision-infrastructure.yml`. The Bicep template applies tags to the
   backend App Service, and the deployment workflow now discovers the target app from Azure by
   querying those tags instead of relying on a GitHub repository variable for the app name.
3. **Configure repository variables**:
   - `AZURE_RESOURCE_GROUP` – the resource group where the Bicep deployment provisions the app
     resources
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

The Bicep template uses a simple CAF-inspired naming pattern:

`<prefix>-<workload>-<component?>-<environment>-<region?>-<instance?>`

Examples:

- `rg-showdbimport-prod`
- `swa-showdbimport-prod-001-<suffix>`
- `plan-showdbimport-prod-eus2-001`
- `app-showdbimport-api-prod-001-<suffix>`

### Provision locally

```bash
az group create --name <resource-group> --location eastus2
az deployment group create --resource-group <resource-group> --template-file infra/main.bicep --parameters infra/main.bicepparam
```

### Provision from GitHub Actions

Run the `Provision Azure infrastructure` workflow manually. It creates the resource group if
needed, deploys `infra/main.bicep`, and writes a summary that includes:

- resource names
- resource IDs
- the backend API base URL
- the Static Web App URL

### Important outputs

The top-level Bicep template returns operator-friendly outputs:

- `resourceGroupName`
- `staticWebAppName`
- `staticWebAppUrl`
- `backendAppServicePlanName`
- `backendWebAppName`
- `backendApiBaseUrl`
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

