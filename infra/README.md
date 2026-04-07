# Infrastructure

Bicep templates for provisioning Azure resources for the show-db-import application.

## Overview

This directory contains Infrastructure as Code (IaC) templates that provision:

- **Azure Static Web Apps** – Hosts the Next.js frontend
- **Azure App Service Plan + Web App** – Hosts the ASP.NET Core backend
- **Optional**: Application Insights + Log Analytics – Monitoring and logging

## Structure

```
infra/
├── main.bicep           # Main template (entry point)
├── main.bicepparam      # Default parameters
├── modules/             # Reusable Bicep modules
└── main.json            # Generated template (do not edit)
```

## Quick Start

### Prerequisites

- Azure CLI (install from [microsoft.com](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli))
- Subscription ID for your Azure account

### Provision Locally

```bash
# Create resource group
az group create --name rg-show-db-import-dev --location eastus2

# Deploy template
az deployment group create \
  --resource-group rg-show-db-import-dev \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

### Provision via GitHub Actions

The automated workflow handles provisioning:

1. Manual trigger: Go to **Actions** → **Provision Azure infrastructure** → **Run workflow**
2. Automatic: Push to `main` branch (via deployment workflow)

The workflow:
- Derives resource names from the repository
- Creates/reuses the resource group
- Deploys `main.bicep`
- Outputs resource IDs and URLs

## Naming Convention

Resources follow a CAF-inspired pattern:

```
<prefix>-<workload>-<component>-<environment>-<region>-<instance>
```

### Examples

| Resource | Name Pattern |
|----------|--------------|
| Resource Group | `rg-show-db-import-prod` |
| Static Web App | `swa-showdbimport-prod-001-abc123` |
| App Service Plan | `plan-showdbimport-prod-eus2-001` |
| Backend Web App | `app-showdbimport-api-prod-001` |

## Template Outputs

After deployment, the template outputs:

```
resourceGroupName          # Name of created/reused resource group
staticWebAppName           # Static Web App resource name
staticWebAppUrl            # Frontend URL
backendAppServicePlanName  # App Service Plan name
backendWebAppName          # Backend Web App name
backendApiBaseUrl          # Backend API URL
resourceGroupPortalUrl     # Azure Portal link for resource group
appServicePlanPortalUrl    # Azure Portal link for App Service Plan
backendWebAppPortalUrl     # Azure Portal link for backend
staticWebAppPortalUrl      # Azure Portal link for frontend
deploymentPortalUrl        # Azure Portal link for this deployment
resourceIds                # Map of all resource IDs
deploymentSummary          # Human-readable deployment summary
```

## Parameters

Edit `main.bicepparam` to customize:

- **environment** – `dev`, `staging`, `prod`
- **location** – Azure region (default: `eastus2`)
- **instance** – Instance number for multi-instance deployments
- **deploymentDatetime** – Timestamp for unique suffixes

Example:

```bicep
param environment = 'prod'
param location = 'westus2'
param instance = '001'
```

## Key Resources

### Static Web Apps

- Automatically integrates with GitHub
- Provides free HTTPS certificates
- Built-in staging environments for pull requests
- Configured with your frontend build command

### App Service

- Hosts the ASP.NET Core backend
- CORS policy configured for your frontend URL
- Environment variables set for backend configuration
- Always-on recommended for production

## CORS Configuration

The backend is configured with CORS to allow:

1. **Local development**: `http://localhost:3000` and `http://localhost:5132`
2. **Production**: The Static Web App URL (set by Bicep)

The `FrontendUrl` environment variable on the backend controls this. Bicep automatically populates it from the Static Web App URL.

## Monitoring (Optional)

To enable Application Insights and Log Analytics:

1. Edit `main.bicep` to set `deployMonitoring = true`
2. Redeploy the template
3. Backend logs will flow to Log Analytics

## Troubleshooting

**Template validation errors?**
```bash
az deployment group validate \
  --resource-group rg-show-db-import-dev \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

**Resource already exists?**
- The template is idempotent; re-running will update existing resources
- Check resource names don't conflict with other subscriptions

**Can't find outputs?**
```bash
az deployment group show \
  --resource-group rg-show-db-import-dev \
  --name main \
  --query properties.outputs
```

## Resources

- [Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/)
- [ARM Template Reference](https://learn.microsoft.com/en-us/azure/templates/)

## Contributing

When modifying Bicep templates:

1. Validate with `az deployment group validate`
2. Test in a dev resource group first
3. Ensure outputs remain stable
4. Update this README if adding new resources or changing parameters
