export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

export function calculateNextReview(
  quality: number,
  easeFactor: number = 2.5,
  interval: number = 1,
  repetitions: number = 0
): SM2Result {
  quality = Math.max(0, Math.min(5, quality));

  let newRepetitions: number;
  let newInterval: number;
  let newEaseFactor: number;

  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
  }

  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  };
}

export function qualityFromAnswer(
  isCorrect: boolean,
  hintsUsed: number
): number {
  if (!isCorrect) return hintsUsed > 0 ? 1 : 2;
  if (hintsUsed === 0) return 5;
  if (hintsUsed === 1) return 4;
  return 3;
}
