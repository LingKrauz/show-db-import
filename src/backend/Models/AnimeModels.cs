namespace backend.Models;

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

        if (scoreList.Count == 0)
            return ScoreFormat.POINT_10;

        var maxScore = scoreList.Max();

        var formats = new[] { ScoreFormat.POINT_3, ScoreFormat.POINT_5, ScoreFormat.POINT_10, ScoreFormat.POINT_10_DECIMAL, ScoreFormat.POINT_100 };

        foreach (var format in formats)
        {
            if (maxScore <= FormatRanges[format].max)
            {
                if (format == ScoreFormat.POINT_10_DECIMAL && scoreList.Any(s => s % 1 != 0))
                    return format;

                if (format == ScoreFormat.POINT_10_DECIMAL)
                    continue;

                return format;
            }
        }

        return ScoreFormat.POINT_100;
    }
}

public record AnimeShow(string Title, string Status, decimal? Score, ScoreFormat ScoreFormat, string? CoverImageUrl, int? AniListId);

public record AnimeResponse(List<AnimeShow> Shows);
