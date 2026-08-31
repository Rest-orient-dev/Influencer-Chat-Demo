"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AcademyActivity,
  AcademyUnit,
  DrillFill,
  DrillItem,
  DrillOrder,
} from "@/academy/types";
import { activityKindLabel, matchesKeywords, nextActivity, nextUnit } from "@/academy/helpers";
import { getAcademyUnits } from "@/academy/curriculum";
import { BubbleThread } from "./BubbleThread";

function shuffle<T>(arr: T[], seed: string) {
  const copy = [...arr];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  for (let i = copy.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ActivityPlayer({
  unit,
  activity,
  alreadyDone,
  onComplete,
}: {
  unit: AcademyUnit;
  activity: AcademyActivity;
  alreadyDone: boolean;
  onComplete: (score?: { correct: number; total: number }) => Promise<void>;
}) {
  if (activity.type === "tutorial") {
    return (
      <LessonFrame unit={unit} activity={activity} alreadyDone={alreadyDone} onComplete={onComplete}>
        <div className="space-y-8">
          {activity.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-lg font-semibold text-[#111b21]">{section.heading}</h3>
              {section.body && (
                <p className="mt-2 text-[15px] leading-6 text-[#3b4a54]">{section.body}</p>
              )}
              {section.bullets && (
                <ul className="mt-3 space-y-1.5 text-[15px] leading-6 text-[#3b4a54]">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00a884]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.bubbles && (
                <div className="mt-4">
                  <BubbleThread bubbles={section.bubbles} />
                </div>
              )}
            </section>
          ))}
        </div>
      </LessonFrame>
    );
  }

  if (activity.type === "case") {
    return (
      <LessonFrame unit={unit} activity={activity} alreadyDone={alreadyDone} onComplete={onComplete}>
        <div
          className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            activity.verdict === "good"
              ? "bg-[#d9fdd3] text-[#008069]"
              : "bg-[#fde8e6] text-[#b42318]"
          }`}
        >
          {activity.verdict === "good" ? "Caso modelo" : "Caso a evitar"}
        </div>
        <p className="text-[15px] leading-6 text-[#3b4a54]">{activity.setup}</p>
        <div className="mt-5">
          <BubbleThread bubbles={activity.messages} />
        </div>
        <div className="mt-6 rounded-xl bg-[#f0f2f5] p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#667781]">
            Qué te llevas
          </div>
          <ul className="mt-2 space-y-2 text-[15px] leading-6 text-[#111b21]">
            {activity.takeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </LessonFrame>
    );
  }

  if (activity.type === "guided") {
    return (
      <GuidedPlayer
        unit={unit}
        activity={activity}
        alreadyDone={alreadyDone}
        onComplete={onComplete}
      />
    );
  }

  return (
    <DrillPlayer unit={unit} activity={activity} alreadyDone={alreadyDone} onComplete={onComplete} />
  );
}

function LessonFrame({
  unit,
  activity,
  alreadyDone,
  onComplete,
  children,
}: {
  unit: AcademyUnit;
  activity: AcademyActivity;
  alreadyDone: boolean;
  onComplete: (score?: { correct: number; total: number }) => Promise<void>;
  children: ReactNode;
}) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const nxt = nextActivity(unit, activity.id);

  const finish = async () => {
    setSaving(true);
    await onComplete();
    setSaving(false);
    if (nxt) router.push(`/academy/${unit.id}/${nxt.id}`);
    else router.push(`/academy/${unit.id}`);
  };

  return (
    <div>
      {children}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={finish}
          className="cursor-pointer rounded-md bg-[#008069] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#017561] disabled:opacity-60"
        >
          {saving
            ? "Guardando…"
            : alreadyDone
              ? nxt
                ? "Siguiente"
                : "Volver a la unidad"
              : nxt
                ? "Completar y seguir"
                : "Completar unidad"}
        </button>
        {alreadyDone && (
          <span className="text-sm text-[#008069]">Ya tenías esta lección hecha.</span>
        )}
      </div>
    </div>
  );
}

function GuidedPlayer({
  unit,
  activity,
  alreadyDone,
  onComplete,
}: {
  unit: AcademyUnit;
  activity: Extract<AcademyActivity, { type: "guided" }>;
  alreadyDone: boolean;
  onComplete: (score?: { correct: number; total: number }) => Promise<void>;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [tries, setTries] = useState(0);
  const [passed, setPassed] = useState(0);
  const [saving, setSaving] = useState(false);
  const step = activity.steps[stepIndex];
  const last = stepIndex === activity.steps.length - 1;

  const check = () => {
    const ok = matchesKeywords(draft, step.keywords, {
      match: step.match,
      requireNumber: step.requireNumber,
      numberOrKeywords: step.numberOrKeywords,
    });
    setTries((t) => t + 1);
    setFeedback(ok ? "ok" : "bad");
    if (ok) setPassed((p) => p + 1);
  };

  const goNext = async () => {
    if (!last) {
      setStepIndex((i) => i + 1);
      setDraft("");
      setFeedback(null);
      setTries(0);
      return;
    }
    setSaving(true);
    await onComplete({ correct: passed, total: activity.steps.length });
    setSaving(false);
    const nxt = nextActivity(unit, activity.id);
    if (nxt) router.push(`/academy/${unit.id}/${nxt.id}`);
    else router.push(`/academy/${unit.id}`);
  };

  const finishAnyway = async () => {
    if (feedback !== "ok") setFeedback("ok");
    await goNext();
  };

  return (
    <div>
      <p className="text-[15px] leading-6 text-[#3b4a54]">{activity.intro}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e9edef]">
        <div
          className="h-full bg-[#00a884] transition-all"
          style={{ width: `${((stepIndex + 1) / activity.steps.length) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[#667781]">
        Paso {stepIndex + 1} de {activity.steps.length}
      </p>

      <div className="mt-5 rounded-xl border border-[#e9edef] bg-white p-5">
        <p className="text-sm font-medium text-[#111b21]">{step.situation}</p>
        {step.incoming && (
          <div className="mt-4">
            <BubbleThread bubbles={step.incoming} />
          </div>
        )}
        <p className="mt-4 text-[15px] leading-6 text-[#3b4a54]">{step.task}</p>
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setFeedback(null);
          }}
          rows={3}
          placeholder="Escribe aquí tu burbuja…"
          className="mt-3 w-full rounded-md border border-[#d1d7db] px-3 py-3 text-[15px] text-[#111b21] outline-none focus:border-[#00a884]"
        />
        {feedback === "bad" && (
          <div className="mt-3 rounded-md bg-[#fef2f2] px-3 py-2 text-sm text-[#b42318]">
            Casi. {step.hint}
          </div>
        )}
        {feedback === "ok" && (
          <div className="mt-3 rounded-md bg-[#d9fdd3] px-3 py-2 text-sm text-[#008069]">
            {step.explanation}
            <div className="mt-2 text-[#111b21]">
              Ejemplo: <span className="italic">{step.modelAnswer}</span>
            </div>
          </div>
        )}
        {tries >= 1 && feedback === "bad" && (
          <p className="mt-2 text-sm text-[#667781]">Ejemplo: {step.modelAnswer}</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {feedback !== "ok" && (
          <button
            type="button"
            onClick={check}
            className="cursor-pointer rounded-md bg-[#008069] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#017561]"
          >
            Comprobar
          </button>
        )}
        {feedback === "ok" && (
          <button
            type="button"
            disabled={saving}
            onClick={goNext}
            className="cursor-pointer rounded-md bg-[#008069] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#017561]"
          >
            {saving ? "Guardando…" : last ? "Completar" : "Siguiente paso"}
          </button>
        )}
        {tries >= 2 && feedback !== "ok" && (
          <button
            type="button"
            onClick={() => finishAnyway()}
            className="cursor-pointer rounded-md border border-[#d1d7db] px-5 py-2.5 text-sm text-[#111b21] hover:bg-[#f0f2f5]"
          >
            Ver ejemplo y seguir
          </button>
        )}
        {alreadyDone && (
          <span className="self-center text-sm text-[#008069]">Actividad ya completada.</span>
        )}
      </div>
    </div>
  );
}

function DrillPlayer({
  unit,
  activity,
  alreadyDone,
  onComplete,
}: {
  unit: AcademyUnit;
  activity: Extract<AcademyActivity, { type: "drill" }>;
  alreadyDone: boolean;
  onComplete: (score?: { correct: number; total: number }) => Promise<void>;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wasRight, setWasRight] = useState<boolean | null>(null);
  const [why, setWhy] = useState("");
  const [saving, setSaving] = useState(false);
  const item = activity.items[index];
  const last = index === activity.items.length - 1;

  const mark = async (ok: boolean, explanation: string) => {
    if (locked) return;
    setLocked(true);
    setWasRight(ok);
    setWhy(explanation);
    if (ok) setCorrectCount((c) => c + 1);
  };

  const next = async () => {
    if (!last) {
      setIndex((i) => i + 1);
      setLocked(false);
      setWasRight(null);
      setWhy("");
      return;
    }
    const total = activity.items.length;
    const correct = correctCount + (wasRight ? 0 : 0);
    setSaving(true);
    await onComplete({
      correct: wasRight ? correctCount : correctCount,
      total,
    });
    setSaving(false);
    const nxt = nextActivity(unit, activity.id);
    if (nxt) router.push(`/academy/${unit.id}/${nxt.id}`);
    else router.push(`/academy/${unit.id}`);
  };

  return (
    <div>
      <p className="text-[15px] leading-6 text-[#3b4a54]">{activity.intro}</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e9edef]">
          <div
            className="h-full bg-[#00a884] transition-all"
            style={{ width: `${((index + (locked ? 1 : 0)) / activity.items.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[#667781]">
          {index + 1}/{activity.items.length}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-[#e9edef] bg-white p-5">
        <ItemPrompt item={item} locked={locked} onAnswer={mark} />
        {wasRight !== null && (
          <div
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              wasRight ? "bg-[#d9fdd3] text-[#008069]" : "bg-[#fef2f2] text-[#b42318]"
            }`}
          >
            <span className="font-semibold">{wasRight ? "Correcto. " : "No es la mejor. "}</span>
            {why}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        {locked && (
          <button
            type="button"
            disabled={saving}
            onClick={next}
            className="cursor-pointer rounded-md bg-[#008069] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#017561]"
          >
            {saving ? "Guardando…" : last ? "Ver resultado" : "Continuar"}
          </button>
        )}
        {alreadyDone && (
          <span className="text-sm text-[#008069]">Ya completaste esta práctica.</span>
        )}
      </div>
    </div>
  );
}

function ItemPrompt({
  item,
  locked,
  onAnswer,
}: {
  item: DrillItem;
  locked: boolean;
  onAnswer: (ok: boolean, why: string) => void;
}) {
  if (item.kind === "choice") {
    return (
      <div>
        <p className="text-[16px] font-medium text-[#111b21]">{item.prompt}</p>
        <div className="mt-4 space-y-2">
          {item.options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              disabled={locked}
              onClick={() => onAnswer(i === item.answer, item.why)}
              className="block w-full cursor-pointer rounded-lg border border-[#e9edef] px-4 py-3 text-left text-[15px] text-[#111b21] hover:border-[#00a884] disabled:cursor-default"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (item.kind === "tap") {
    return (
      <div>
        <p className="text-sm text-[#667781]">{item.context}</p>
        <div className="mt-3">
          <BubbleThread bubbles={item.bubbles} />
        </div>
        <p className="mt-4 text-[16px] font-medium text-[#111b21]">¿Qué respondes?</p>
        <div className="mt-3 space-y-2">
          {item.options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              disabled={locked}
              onClick={() => onAnswer(i === item.answer, item.why)}
              className="block w-full cursor-pointer rounded-lg border border-[#e9edef] px-4 py-3 text-left text-[15px] text-[#111b21] hover:border-[#00a884] disabled:cursor-default"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (item.kind === "fill") {
    return <FillItem item={item} locked={locked} onAnswer={onAnswer} />;
  }

  return <OrderItem item={item} locked={locked} onAnswer={onAnswer} />;
}

function FillItem({
  item,
  locked,
  onAnswer,
}: {
  item: DrillFill;
  locked: boolean;
  onAnswer: (ok: boolean, why: string) => void;
}) {
  return (
    <div>
      <p className="text-[16px] font-medium text-[#111b21]">{item.prompt}</p>
      <p className="mt-4 text-[18px] leading-8 text-[#111b21]">
        {item.before}{" "}
        <span className="inline-block min-w-[88px] border-b-2 border-[#00a884] text-center text-[#00a884]">
          ____
        </span>{" "}
        {item.after}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            disabled={locked}
            onClick={() => onAnswer(i === item.answer, item.why)}
            className="cursor-pointer rounded-full border border-[#d1d7db] bg-[#f0f2f5] px-4 py-2 text-sm text-[#111b21] hover:border-[#00a884] disabled:cursor-default"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderItem({
  item,
  locked,
  onAnswer,
}: {
  item: DrillOrder;
  locked: boolean;
  onAnswer: (ok: boolean, why: string) => void;
}) {
  const shuffled = useMemo(() => shuffle(item.items, item.prompt), [item.items, item.prompt]);
  const [picked, setPicked] = useState<string[]>([]);

  const tap = (value: string) => {
    if (locked) return;
    if (picked.includes(value)) return;
    const next = [...picked, value];
    setPicked(next);
    if (next.length === item.items.length) {
      const ok = next.every((v, i) => v === item.items[i]);
      onAnswer(ok, item.why);
    }
  };

  return (
    <div>
      <p className="text-[16px] font-medium text-[#111b21]">{item.prompt}</p>
      <ol className="mt-4 min-h-[96px] space-y-2 rounded-lg bg-[#f0f2f5] p-3">
        {picked.length === 0 && (
          <li className="text-sm text-[#667781]">Toca las tarjetas en orden.</li>
        )}
        {picked.map((p, i) => (
          <li key={p} className="text-[15px] text-[#111b21]">
            {i + 1}. {p}
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-2">
        {shuffled.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={locked || picked.includes(opt)}
            onClick={() => tap(opt)}
            className="cursor-pointer rounded-lg border border-[#d1d7db] bg-white px-3 py-2 text-sm text-[#111b21] hover:border-[#00a884] disabled:opacity-40"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function UnitFooterCta({ unit }: { unit: AcademyUnit }) {
  const units = getAcademyUnits();
  const following = nextUnit(units, unit.id);
  if (!unit.practiceCta && !following) return null;
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {unit.practiceCta && (
        <a
          href="/chat"
          className="cursor-pointer rounded-xl bg-[#008069] px-5 py-4 text-white hover:bg-[#017561]"
        >
          <div className="text-xs uppercase tracking-wide text-white/80">Siguiente nivel</div>
          <div className="mt-1 font-semibold">Practicar en el WhatsApp de formación</div>
        </a>
      )}
      {following && (
        <a
          href={`/academy/${following.id}`}
          className="cursor-pointer rounded-xl border border-[#e9edef] bg-white px-5 py-4 text-[#111b21] hover:border-[#00a884]"
        >
          <div className="text-xs uppercase tracking-wide text-[#667781]">Continuar academia</div>
          <div className="mt-1 font-semibold">{following.title}</div>
        </a>
      )}
    </div>
  );
}

export { activityKindLabel };
