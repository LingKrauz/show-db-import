using Azure.AI.OpenAI;
using backend.Models;
using OpenAI.Chat;
using System.Text.Json;

namespace backend.Services;

public record Recommendation(string Title, string Reason);

public interface IRecommendationService
{
    Task<List<Recommendation>> GetRecommendationsAsync(List<AnimeShow> shows);
}

public class NullRecommendationService : IRecommendationService
{
    public Task<List<Recommendation>> GetRecommendationsAsync(List<AnimeShow> shows)
        => Task.FromResult(new List<Recommendation>());
}

public class RecommendationService : IRecommendationService
{
    private readonly AzureOpenAIClient _client;
    private readonly string _deploymentName;
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(AzureOpenAIClient client, IConfiguration configuration, ILogger<RecommendationService> logger)
    {
        _client = client;
        _deploymentName = configuration["AzureOpenAI:DeploymentName"] ?? "gpt-4o-mini";
        _logger = logger;
    }

    public async Task<List<Recommendation>> GetRecommendationsAsync(List<AnimeShow> shows)
    {
        var scored = shows.Where(s => s.Score.HasValue).ToList();
        var top = scored.OrderByDescending(s => s.Score).Take(20).ToList();
        var bottom = scored.OrderBy(s => s.Score).Take(5).ToList();

        var maxScore = top.Count > 0 ? top[0].ScoreFormat.GetMaxValue() : 10;

        string FormatShow(AnimeShow s) => $"{s.Title} (score: {s.Score}/{maxScore})";

        var topStr = string.Join(", ", top.Select(FormatShow));
        var bottomStr = string.Join(", ", bottom.Select(FormatShow));

        var userMessage = $$"""
            Based on these anime I've completed:
            Top rated: {{topStr}}
            Lowest rated: {{bottomStr}}

            Recommend 8 anime I have NOT already watched. Return ONLY a valid JSON array in this format:
            [{"title": "...", "reason": "..."}]
            """;

        try
        {
            var chatClient = _client.GetChatClient(_deploymentName);
            var result = await chatClient.CompleteChatAsync([
                ChatMessage.CreateSystemMessage("You are an anime recommendation expert. Recommend anime the user has NOT already watched. Return ONLY a valid JSON array with no markdown wrapping."),
                ChatMessage.CreateUserMessage(userMessage)
            ]);

            var text = result.Value.Content[0].Text;

            // Strip markdown code fences if present
            text = text.Trim();
            if (text.StartsWith("```"))
            {
                var firstNewline = text.IndexOf('\n');
                var lastFence = text.LastIndexOf("```");
                if (firstNewline >= 0 && lastFence > firstNewline)
                    text = text[(firstNewline + 1)..lastFence].Trim();
            }

            var elements = JsonSerializer.Deserialize<JsonElement[]>(text);
            if (elements == null)
                return [];

            return elements.Select(e => new Recommendation(
                e.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
                e.TryGetProperty("reason", out var r) ? r.GetString() ?? "" : ""
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations from Azure OpenAI");
            return [];
        }
    }
}
