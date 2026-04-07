# Backend

An ASP.NET Core 10.0 Web API for managing anime data imports from AniList and MyAnimeList.

## Tech Stack

- **Framework**: ASP.NET Core 10.0
- **Language**: C#
- **HTTP Server**: Kestrel
- **Architecture**: REST API with Controllers

## Getting Started

### Prerequisites

- .NET 10.0 SDK (download from [dotnet.microsoft.com](https://dotnet.microsoft.com/download))

### Installation

```bash
cd src/backend
dotnet restore
```

### Development

```bash
dotnet run
```

The API runs at [http://localhost:5132](http://localhost:5132).

## Available Commands

```bash
dotnet run              # Start dev server
dotnet build            # Build the project
dotnet watch            # Auto-rebuild on file changes
dotnet publish -c Release -o publish  # Production build
```

## Project Structure

```
Controllers/            # API endpoints
Properties/            # Project metadata
appsettings.json       # Configuration
appsettings.Development.json  # Dev config
backend.csproj         # Project file
Program.cs             # Startup configuration
```

## API Endpoints

All endpoints are prefixed with `/api/`:

```
GET    /api/timer      # Example endpoint
```

Check the `Controllers/` directory for all available endpoints.

## Configuration

### Environment Variables

- **ASPNETCORE_ENVIRONMENT** – Set to `Development` or `Production`
- **FrontendUrl** – CORS allowed origin (e.g., `https://frontend.azurestaticapps.net`)

### CORS Policy

By default, the backend allows:
- ✅ `http://localhost:3000` (local frontend)
- ✅ `http://localhost:5132` (localhost)
- ✅ Production frontend URL (set via `FrontendUrl` env var)

See `Program.cs` for the CORS configuration.

## Development Conventions

### File-Scoped Namespaces

All files use file-scoped namespaces:

```csharp
namespace ShowDbImport.Controllers;

public class AnimeController : ControllerBase
{
    // implementation
}
```

### Implicit Usings

Common usings are enabled automatically (`System.*`, `System.Linq`, `Microsoft.AspNetCore.*`, etc.).

### Controllers

Controllers inherit from `ControllerBase` and use attribute routing:

```csharp
[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    [HttpGet("{id}")]
    public IActionResult GetAnime(int id)
    {
        return Ok(new { id = id });
    }
}
```

### Logging

Use `ILogger<T>` injected via dependency injection:

```csharp
public class AnimeService
{
    private readonly ILogger<AnimeService> _logger;
    
    public AnimeService(ILogger<AnimeService> logger)
    {
        _logger = logger;
    }
    
    public void ImportData()
    {
        _logger.LogInformation("Starting import...");
    }
}
```

## Building for Production

```bash
dotnet publish -c Release -o publish
cd publish
dotnet backend.dll
```

The production build is ready for deployment to Azure App Service.

## Troubleshooting

**Port 5132 already in use?**
```bash
dotnet run -- --urls "http://localhost:5133"
```

**Build errors?**
```bash
dotnet clean
dotnet build
```

**Need to update dependencies?**
```bash
dotnet list package --outdated
```

## Resources

- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/dotnet/core/extensions/)
- [C# Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/)
- [ASP.NET Core API Documentation](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.app)

## Contributing

For changes to the backend:
1. Ensure `dotnet build` succeeds
2. Test endpoints manually or add unit tests
3. Follow the conventions above
4. Push and let GitHub Actions deploy to Azure

## Notes

- No unit test framework is currently configured. Add xUnit or NUnit when testing becomes a priority.
- HTTPS redirection is only enabled in production (`Program.cs` checks the environment).
