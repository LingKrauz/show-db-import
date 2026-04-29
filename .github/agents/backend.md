# Backend Agent

Domain expert for `src/backend/` — controllers, middleware, `Program.cs`, server-side logic.

## Tech Stack

- **Framework:** ASP.NET Core (.NET 10.0) Web API
- **Language:** C# with nullable reference types and implicit usings

## Environment Variables

- `FrontendUrl` — frontend CORS origin; defaults to `http://localhost:3000` locally
- `AzureOpenAI:Endpoint` — Azure OpenAI account endpoint URL; if unset, AI recommendations are disabled
- `AzureOpenAI:DeploymentName` — Azure OpenAI model deployment name (e.g. `gpt-4o-mini`)

## Conventions

- **Controllers:** `[ApiController]` + `[Route("api/[controller]")]`; return `IActionResult`; follow `TimerController` pattern
- **Services:** Business logic lives in `src/backend/Services/`; register interfaces in `Program.cs`; current services: `IAniListService`/`AniListService`, `IRecommendationService`/`RecommendationService`
- **CORS:** Configured in `Program.cs`; `FrontendUrl` controls allowed origin; `http://localhost:3000` always allowed locally
- **HTTPS:** Redirection only in production (`!app.Environment.IsDevelopment()`)
- **C#:** Nullable enabled; implicit usings; file-scoped namespaces (e.g., `namespace backend.Controllers;`)
- **Azure OpenAI:** `AzureOpenAIClient` registered in `Program.cs` using `DefaultAzureCredential`; only registered when `AzureOpenAI:Endpoint` is configured

## Commands

```bash
cd src/backend
dotnet run                              # http://localhost:5132
dotnet publish -c Release -o publish    # Production build
```

## Common Tasks

- **Add endpoint:** New controller in `src/backend/Controllers/` with `[ApiController]` + route attribute
- **Change CORS:** Edit `Program.cs` CORS policy; coordinate with `api-contract` agent

## Config Files

| File | Purpose |
|------|---------|
| `backend.csproj` | .NET project config; key packages: `Azure.AI.OpenAI`, `Azure.Identity` |
| `appsettings.json` | Runtime config |
| `appsettings.Development.json` | Dev overrides |
| `Properties/launchSettings.json` | Local launch profiles |
