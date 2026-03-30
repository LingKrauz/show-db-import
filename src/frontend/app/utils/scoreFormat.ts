export enum ScoreFormat {
  POINT_3 = "POINT_3",
  POINT_5 = "POINT_5",
  POINT_10 = "POINT_10",
  POINT_10_DECIMAL = "POINT_10_DECIMAL",
  POINT_100 = "POINT_100",
}

export const SCORE_FORMAT_MAX: Record<ScoreFormat, number> = {
  [ScoreFormat.POINT_3]: 3,
  [ScoreFormat.POINT_5]: 5,
  [ScoreFormat.POINT_10]: 10,
  [ScoreFormat.POINT_10_DECIMAL]: 10,
  [ScoreFormat.POINT_100]: 100,
};

export function getScoreDisplay(
  score: number | null,
  format: ScoreFormat = ScoreFormat.POINT_10
): string {
  if (score === null) {
    return "";
  }

  const max = SCORE_FORMAT_MAX[format];

  // For POINT_10_DECIMAL, preserve decimal places
  if (format === ScoreFormat.POINT_10_DECIMAL && score % 1 !== 0) {
    return `${score}/${max}`;
  }

  // For integer formats or integer scores, don't show decimals
  return `${Math.round(score)}/${max}`;
}
