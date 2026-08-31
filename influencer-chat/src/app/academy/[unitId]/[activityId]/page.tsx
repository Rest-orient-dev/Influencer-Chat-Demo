"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getAcademyUnits } from "@/academy/curriculum";
import { activityKindLabel, findActivity, findUnit } from "@/academy/helpers";
import { ActivityPlayer } from "../../_components/ActivityPlayer";
import { useAcademyProgress } from "../../_components/useAcademyProgress";

export default function AcademyActivityPage() {
  const params = useParams<{ unitId: string; activityId: string }>();
  const unit = findUnit(getAcademyUnits(), params.unitId);
  const activity = unit ? findActivity(unit, params.activityId) : undefined;
  const { progress, complete } = useAcademyProgress();

  if (!unit || !activity) {
    return (
      <div className="rounded-2xl bg-white p-8 text-[#111b21]">
        Actividad no encontrada.{" "}
        <Link href="/academy" className="text-[#008069] underline">
          Volver
        </Link>
      </div>
    );
  }

  const done = progress.completedActivityIds.includes(activity.id);

  return (
    <div className="rounded-2xl bg-white p-4 text-[#111b21] shadow-[0_2px_10px_rgba(11,20,26,0.26)] md:p-8">
      <Link href={`/academy/${unit.id}`} className="text-xs text-[#008069] hover:underline">
        ← {unit.title}
      </Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#008069]">
        {activityKindLabel(activity.type)} · {activity.minutes} min
      </p>
      <h1 className="mt-1 text-2xl font-light md:text-3xl">{activity.title}</h1>
      <div className="mt-6">
        <ActivityPlayer
          unit={unit}
          activity={activity}
          alreadyDone={done}
          onComplete={(score) => complete(activity.id, score)}
        />
      </div>
    </div>
  );
}
