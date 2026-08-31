import { DimensionScore, EvaluationReport, EvaluationResult } from "@/lib/types";

function list(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x).trim()).filter(Boolean);
}

export function normalizeDimension(raw: Partial<DimensionScore> | undefined): DimensionScore {
  const correct = list(raw?.correct);
  const incorrect = list(raw?.incorrect);
  const notes = list(raw?.notes);
  return {
    score: Math.max(0, Math.min(100, Number(raw?.score) || 0)),
    correct,
    incorrect,
    notes: notes.length ? notes : [...correct, ...incorrect],
  };
}

export function dimensionFeedback(dim: DimensionScore): { correct: string[]; incorrect: string[] } {
  const correct = list(dim.correct);
  const incorrect = list(dim.incorrect);
  if (correct.length || incorrect.length) return { correct, incorrect };

  const notes = list(dim.notes);
  const bad = notes.filter((n) =>
    /^(falta|mal|error|no |mejor|evita|incorrect)/i.test(n),
  );
  const good = notes.filter((n) => !bad.includes(n));
  return { correct: good, incorrect: bad };
}

export function reportFromEvaluation(evaluation: EvaluationResult): EvaluationReport {
  if (evaluation.report?.summary || evaluation.report?.correct?.length || evaluation.report?.incorrect?.length) {
    return {
      summary: evaluation.report.summary?.trim() || "",
      correct: list(evaluation.report.correct),
      incorrect: list(evaluation.report.incorrect),
    };
  }

  const dims = [
    evaluation.spanishGrammar,
    evaluation.priceReasonableness,
    evaluation.negotiationSkill,
    evaluation.professionalism,
  ];
  const correct = dims.flatMap((d) => dimensionFeedback(d).correct);
  const incorrect = [
    ...dims.flatMap((d) => dimensionFeedback(d).incorrect),
    ...list(evaluation.goalAchieved?.missing).map((x) => `Falta cerrar: ${x}`),
  ];
  const evidence = list(evaluation.goalAchieved?.evidence);
  return {
    summary: evaluation.goalAchieved?.achieved
      ? "Cerraste los objetivos principales. Revisa abajo los matices de idioma y negociación."
      : "La negociación avanza, pero el cierre no está completo. Mira qué falta y qué ya hiciste bien.",
    correct: correct.length ? correct : evidence,
    incorrect,
  };
}
