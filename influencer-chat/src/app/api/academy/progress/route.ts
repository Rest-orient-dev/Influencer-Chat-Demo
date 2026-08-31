import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";
import { completeActivity, getAcademyProgress } from "@/server/db/academyRepo";
import { getAcademyUnits } from "@/academy/curriculum";
import { isUnitComplete, progressPercent } from "@/academy/helpers";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const progress = await getAcademyProgress(user.sub);
  const units = getAcademyUnits();
  return NextResponse.json({
    ...progress,
    percent: progressPercent(units, progress.completedActivityIds),
    completedUnitIds: units
      .filter((u) => isUnitComplete(u, progress.completedActivityIds))
      .map((u) => u.id),
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = (await req.json()) as {
    activityId?: string;
    correct?: number;
    total?: number;
  };
  if (!body.activityId) {
    return NextResponse.json({ error: "Falta activityId" }, { status: 400 });
  }

  const known = getAcademyUnits().some((u) =>
    u.activities.some((a) => a.id === body.activityId),
  );
  if (!known) {
    return NextResponse.json({ error: "Actividad desconocida" }, { status: 400 });
  }

  const progress = await completeActivity({
    userId: user.sub,
    activityId: body.activityId,
    correct: body.correct,
    total: body.total,
  });
  const units = getAcademyUnits();
  return NextResponse.json({
    ...progress,
    percent: progressPercent(units, progress.completedActivityIds),
    completedUnitIds: units
      .filter((u) => isUnitComplete(u, progress.completedActivityIds))
      .map((u) => u.id),
  });
}
