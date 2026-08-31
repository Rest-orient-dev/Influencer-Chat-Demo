"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getAcademyUnits } from "@/academy/curriculum";
import { activityKindLabel, findUnit, isUnitComplete } from "@/academy/helpers";
import { useAcademyProgress } from "../_components/useAcademyProgress";
import { UnitFooterCta } from "../_components/ActivityPlayer";

export default function AcademyUnitPage() {
  const params = useParams<{ unitId: string }>();
  const unit = findUnit(getAcademyUnits(), params.unitId);
  const { progress } = useAcademyProgress();

  if (!unit) {
    return (
      <div className="rounded-2xl bg-white p-8 text-[#111b21]">
        Unidad no encontrada.{" "}
        <Link href="/academy" className="text-[#008069] underline">
          Volver
        </Link>
      </div>
    );
  }

  const complete = isUnitComplete(unit, progress.completedActivityIds);

  return (
    <div className="rounded-2xl bg-white p-4 text-[#111b21] shadow-[0_2px_10px_rgba(11,20,26,0.26)] md:p-8">
      <Link href="/academy" className="text-xs text-[#008069] hover:underline">
        ← Ruta de la academia
      </Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#008069]">
        Unidad {unit.order} · {unit.minutes} min
      </p>
      <h1 className="mt-1 text-2xl font-light text-[#111b21] md:text-3xl">{unit.title}</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#3b4a54]">{unit.subtitle}</p>
      {complete && (
        <p className="mt-3 text-sm font-medium text-[#008069]">Unidad completada.</p>
      )}

      <ol className="mt-8 space-y-3">
        {unit.activities.map((activity, i) => {
          const done = progress.completedActivityIds.includes(activity.id);
          const score = progress.scores[activity.id];
          return (
            <li key={activity.id}>
              <Link
                href={`/academy/${unit.id}/${activity.id}`}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#e9edef] px-4 py-4 hover:border-[#00a884]"
              >
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[#667781]">
                    {i + 1}. {activityKindLabel(activity.type)} · {activity.minutes} min
                  </div>
                  <div className="mt-1 text-[16px] text-[#111b21]">{activity.title}</div>
                  {score && (
                    <div className="mt-1 text-xs text-[#008069]">
                      {score.correct}/{score.total} aciertos
                    </div>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                    done ? "bg-[#d9fdd3] text-[#008069]" : "bg-[#f0f2f5] text-[#54656f]"
                  }`}
                >
                  {done ? "Hecho" : "Abrir"}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <UnitFooterCta unit={unit} />
    </div>
  );
}
