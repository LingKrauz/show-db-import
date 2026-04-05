using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace backend.Controllers;

public enum ScoreFormat
{
    POINT_3,
    POINT_5,
    POINT_10,
    POINT_10_DECIMAL,
    POINT_100
}

public static class ScoreFormatExtensions
{
    private static readonly Dictionary<ScoreFormat, (decimal min, decimal max)> FormatRanges = new()
    {
        { ScoreFormat.POINT_3, (0, 3) },
        { ScoreFormat.POINT_5, (0, 5) },
        { ScoreFormat.POINT_10, (0, 10) },
        { ScoreFormat.POINT_10_DECIMAL, (0, 10) },
        { ScoreFormat.POINT_100, (0, 100) }
    };

    public static decimal GetMaxValue(this ScoreFormat format) =>
        FormatRanges[format].max;

    public static ScoreFormat DetectFormat(IEnumerable<decimal> scores)
    {
        var scoreList = scores.Where(s => s > 0).ToList();

        // If no scores, default to POINT_10
        if (scoreList.Count == 0)
            return ScoreFormat.POINT_10;

        var maxScore = scoreList.Max();

        // Check each format in order of preference (smallest to largest)
        var formats = new[] { ScoreFormat.POINT_3, ScoreFormat.POINT_5, ScoreFormat.POINT_10, ScoreFormat.POINT_10_DECIMAL, ScoreFormat.POINT_100 };

        foreach (var format in formats)
        {
            if (maxScore <= FormatRanges[format].max)
            {
                // For POINT_10_DECIMAL, also check if any score has decimals
                if (format == ScoreFormat.POINT_10_DECIMAL && scoreList.Any(s => s % 1 != 0))
                    return format;

                // Only return POINT_10_DECIMAL if we detected decimals
                if (format == ScoreFormat.POINT_10_DECIMAL)
                    continue;

                return format;
            }
        }

        // Fallback if somehow over 100
        return ScoreFormat.POINT_100;
    }
}

public record AnimeShow(string Title, string Status, decimal? Score, ScoreFormat ScoreFormat, string? CoverImageUrl);

public record AnimeResponse(List<AnimeShow> Shows);

[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AnimeController> _logger;

    public AnimeController(HttpClient httpClient, ILogger<AnimeController> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    [HttpGet("completed/{username}")]
    public async Task<IActionResult> GetCompleted(string username)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest(new { error = "Username cannot be empty" });

            var query = @"
                query($userName:String) {
                    MediaListCollection(userName:$userName, type:ANIME, status:COMPLETED) {
                        lists {
                            entries {
                                score
                                media {
                                    title {
                                        romaji
                                    }
                                    status
                                    coverImage {
                                        large
                                    }
                                }
                            }
                        }
                    }
                }
            ";

            var requestBody = new
            {
                query,
                variables = new { userName = username }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                System.Text.Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync("https://graphql.anilist.co", content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"AniList API returned status {response.StatusCode}");
                return StatusCode((int)response.StatusCode, new { error = "Failed to fetch from AniList API" });
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(responseContent);

            // Check for GraphQL errors
            if (jsonDoc.RootElement.TryGetProperty("errors", out var errors))
            {
                _logger.LogWarning($"AniList GraphQL error for user {username}: {errors}");
                return BadRequest(new { error = "User not found or API error" });
            }

            var shows = new List<AnimeShow>();
            var scores = new List<decimal>();

            if (jsonDoc.RootElement.TryGetProperty("data", out var data) &&
                data.TryGetProperty("MediaListCollection", out var collection) &&
                collection.TryGetProperty("lists", out var lists))
            {
                foreach (var list in lists.EnumerateArray())
                {
                    if (list.TryGetProperty("entries", out var entries))
                    {
                        foreach (var entry in entries.EnumerateArray())
                        {
                            if (entry.TryGetProperty("media", out var media) &&
                                media.TryGetProperty("title", out var title) &&
                                title.TryGetProperty("romaji", out var romaji))
                            {
                                var status = "COMPLETED";
                                if (media.TryGetProperty("status", out var mediaStatus))
                                {
                                    status = mediaStatus.GetString() ?? "COMPLETED";
                                }

                                decimal? score = null;
                                if (entry.TryGetProperty("score", out var scoreElement) && scoreElement.ValueKind != JsonValueKind.Null)
                                {
                                    if (scoreElement.TryGetDecimal(out decimal scoreValue))
                                    {
                                        score = scoreValue > 0 ? scoreValue : null;
                                        if (score > 0)
                                            scores.Add(scoreValue);
                                    }
                                }

                                string? coverImageUrl = null;
                                if (media.TryGetProperty("coverImage", out var coverImage) &&
                                    coverImage.TryGetProperty("large", out var imageUrl))
                                {
                                    coverImageUrl = imageUrl.GetString();
                                }

                                shows.Add(new AnimeShow(
                                    romaji.GetString() ?? "Unknown",
                                    status,
                                    score,
                                    ScoreFormat.POINT_10, // Will be set after detection
                                    coverImageUrl
                                ));
                            }
                        }
                    }
                }
            }

            // Detect the user's score format based on collected scores
            var detectedFormat = ScoreFormatExtensions.DetectFormat(scores);

            // Update all shows with the detected format
            shows = shows.Select(s => s with { ScoreFormat = detectedFormat }).ToList();

            return Ok(new AnimeResponse(shows.OrderBy(s => s.Title).ToList()));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching anime for user {username}: {ex.Message}");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
