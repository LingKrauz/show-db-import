using backend.Models;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace backend.Services;

public class AniListResult
{
    public AnimeResponse? Data { get; init; }
    public bool IsSuccess => Data != null;
    public string? ErrorMessage { get; init; }
    public int StatusCode { get; init; } = 200;

    public static AniListResult Success(AnimeResponse data) => new() { Data = data, StatusCode = 200 };
    public static AniListResult Failure(string message, int statusCode) => new() { ErrorMessage = message, StatusCode = statusCode };
}

public interface IAniListService
{
    Task<AniListResult> GetCompletedShowsAsync(string username);
}

public class AniListService : IAniListService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AniListService> _logger;

    public AniListService(HttpClient httpClient, IMemoryCache cache, ILogger<AniListService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<AniListResult> GetCompletedShowsAsync(string username)
    {
        var cacheKey = $"anime_completed_{username.ToLowerInvariant()}";
        if (_cache.TryGetValue(cacheKey, out AnimeResponse? cached))
            return AniListResult.Success(cached!);

        var query = @"
            query($userName:String) {
                MediaListCollection(userName:$userName, type:ANIME, status:COMPLETED) {
                    lists {
                        entries {
                            score
                            media {
                                id
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

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.PostAsync("https://graphql.anilist.co", content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AniList API for user {Username}", username);
            return AniListResult.Failure("Internal server error", 500);
        }

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("AniList API returned status {StatusCode}", response.StatusCode);
            return AniListResult.Failure("Failed to fetch from AniList API", (int)response.StatusCode);
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var jsonDoc = JsonDocument.Parse(responseContent);

        if (jsonDoc.RootElement.TryGetProperty("errors", out var errors))
        {
            _logger.LogWarning("AniList GraphQL error for user {Username}: {Errors}", username, errors);
            return AniListResult.Failure("User not found or API error", 400);
        }

        var shows = new List<AnimeShow>();
        var scores = new List<decimal>();
        var seenIds = new HashSet<int>();
        var seenTitles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

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
                                status = mediaStatus.GetString() ?? "COMPLETED";

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

                            int? aniListId = null;
                            if (media.TryGetProperty("id", out var idElement) && idElement.TryGetInt32(out int id))
                                aniListId = id;

                            var titleStr = romaji.GetString() ?? "Unknown";

                            // Skip duplicates — can occur when users have custom lists
                            if (aniListId.HasValue ? !seenIds.Add(aniListId.Value) : !seenTitles.Add(titleStr))
                                continue;

                            shows.Add(new AnimeShow(
                                titleStr,
                                status,
                                score,
                                ScoreFormat.POINT_10, // Will be set after detection
                                coverImageUrl,
                                aniListId
                            ));
                        }
                    }
                }
            }
        }

        var detectedFormat = ScoreFormatExtensions.DetectFormat(scores);
        shows = shows.Select(s => s with { ScoreFormat = detectedFormat }).ToList();

        var animeResponse = new AnimeResponse(shows);
        _cache.Set(cacheKey, animeResponse, TimeSpan.FromMinutes(5));
        return AniListResult.Success(animeResponse);
    }
}
