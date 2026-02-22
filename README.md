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

