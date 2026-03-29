using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace backend.Controllers;

public record AnimeShow(string Title, string Status, decimal? Score);

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
                                    }
                                }

                                shows.Add(new AnimeShow(
                                    romaji.GetString() ?? "Unknown",
                                    status,
                                    score
                                ));
                            }
                        }
                    }
                }
            }

            return Ok(new AnimeResponse(shows.OrderBy(s => s.Title).ToList()));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching anime for user {username}: {ex.Message}");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
