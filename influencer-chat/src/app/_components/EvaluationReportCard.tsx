import { EvaluationResult } from "@/lib/types";
import { dimensionFeedback, reportFromEvaluation } from "@/lib/eval-feedback";

const DIMENSIONS: { key: keyof Pick<
  EvaluationResult,
  "spanishGrammar" | "priceReasonableness" | "negotiationSkill" | "professionalism"
>; label: string }[] = [
  { key: "spanishGrammar", label: "Gramática" },
  { key: "priceReasonableness", label: "Precio" },
  { key: "negotiationSkill", label: "Negociación" },
  { key: "professionalism", label: "Profesionalidad" },
];

export function EvaluationReportCard({ evaluation }: { evaluation: EvaluationResult }) {
  const report = reportFromEvaluation(evaluation);

  return (
    <div className="space-y-4 text-[#111b21]">
      <div>
        <div className="text-xs uppercase tracking-wide text-[#667781]">Nota global</div>
        <div className="text-4xl font-light text-[#008069]">{evaluation.overallScore}</div>
        {report.summary && (
          <p className="mt-2 text-sm leading-6 text-[#3b4a54]">{report.summary}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {DIMENSIONS.map((d) => (
          <div key={d.key} className="rounded-md bg-[#f0f2f5] px-3 py-2">
            <div className="text-xs text-[#667781]">{d.label}</div>
            <div className="text-[#111b21]">{evaluation[d.key].score}</div>
          </div>
        ))}
      </div>

      <FeedbackList
        title="Lo que hiciste bien"
        items={report.correct}
        tone="good"
        empty="Esta ronda no dejó aciertos claros. Vuelve a la Academia y repite el orden del chat."
      />
      <FeedbackList
        title="Qué está mal o falta"
        items={report.incorrect}
        tone="bad"
        empty="No hay correcciones graves en esta ronda."
      />

      <div className="rounded-lg border border-[#e9edef] p-3">
        <div className="text-sm font-medium">
          Objetivos:{" "}
          {evaluation.goalAchieved.achieved ? (
            <span className="text-[#008069]">cerrados</span>
          ) : (
            <span className="text-[#b42318]">incompletos</span>
          )}
        </div>
        {evaluation.goalAchieved.evidence.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-[#3b4a54]">
            {evaluation.goalAchieved.evidence.map((x) => (
              <li key={x}>Bien: {x}</li>
            ))}
          </ul>
        )}
        {evaluation.goalAchieved.missing.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-[#b42318]">
            {evaluation.goalAchieved.missing.map((x) => (
              <li key={x}>Falta: {x}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        {DIMENSIONS.map((d) => {
          const fb = dimensionFeedback(evaluation[d.key]);
          if (!fb.correct.length && !fb.incorrect.length) return null;
          return (
            <div key={d.key} className="rounded-lg bg-[#f0f2f5] p-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{d.label}</span>
                <span className="text-[#008069]">{evaluation[d.key].score}</span>
              </div>
              {fb.correct.map((x) => (
                <p key={x} className="mt-1.5 text-sm text-[#008069]">
                  ✓ {x}
                </p>
              ))}
              {fb.incorrect.map((x) => (
                <p key={x} className="mt-1.5 text-sm text-[#b42318]">
                  ✕ {x}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeedbackList({
  title,
  items,
  tone,
  empty,
}: {
  title: string;
  items: string[];
  tone: "good" | "bad";
  empty: string;
}) {
  const box =
    tone === "good"
      ? "border-[#b7e4c7] bg-[#f0fff4]"
      : "border-[#f5c2c0] bg-[#fff5f5]";
  const titleColor = tone === "good" ? "text-[#008069]" : "text-[#b42318]";
  return (
    <div className={`rounded-lg border p-3 ${box}`}>
      <div className={`text-sm font-semibold ${titleColor}`}>{title}</div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[#667781]">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm leading-5 text-[#111b21]">
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
