using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Controllers;

public record RecommendationResponse(List<Recommendation> Recommendations);

[ApiController]
[Route("api/[controller]")]
public class RecommendationController : ControllerBase
{
    private readonly IAniListService _aniListService;
    private readonly IRecommendationService _recommendationService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RecommendationController> _logger;

    public RecommendationController(
        IAniListService aniListService,
        IRecommendationService recommendationService,
        IMemoryCache cache,
        ILogger<RecommendationController> logger)
    {
        _aniListService = aniListService;
        _recommendationService = recommendationService;
        _cache = cache;
        _logger = logger;
    }

    [HttpGet("{username}")]
    public async Task<IActionResult> GetRecommendations(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
            return BadRequest(new { error = "Username cannot be empty" });

        var cacheKey = $"recommendations_{username.ToLowerInvariant()}";
        if (_cache.TryGetValue(cacheKey, out RecommendationResponse? cached))
            return Ok(cached);

        var aniListResult = await _aniListService.GetCompletedShowsAsync(username);
        if (!aniListResult.IsSuccess)
            return StatusCode(aniListResult.StatusCode, new { error = aniListResult.ErrorMessage });

        var shows = aniListResult.Data!.Shows;
        if (shows.Count == 0)
            return NotFound(new { error = "No completed shows found for this user" });

        try
        {
            var recommendations = await _recommendationService.GetRecommendationsAsync(shows);
            var response = new RecommendationResponse(recommendations);
            _cache.Set(cacheKey, response, TimeSpan.FromMinutes(5));
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations for user {Username}", username);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
