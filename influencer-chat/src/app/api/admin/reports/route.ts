import { store } from "@/lib/store";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";
import { listAdminReports } from "@/server/db/trainingRepoMysql";

function isDbConfigured() {
  return Boolean(
    process.env.DB_HOST &&
      process.env.DB_USER &&
      process.env.DB_PASSWORD &&
      process.env.DB_NAME,
  );
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });

  if (isDbConfigured()) {
    const reports = await listAdminReports();
    return NextResponse.json({ reports });
  }

  const reports = store.evaluations.map((evaluation) => {
    const session = store.sessions.find((s) => s.id === evaluation.sessionId);
    const use = store.users.find((u) => u.id === session?.userId);
    const influencer = store.influencers.find((i) => i.id === session?.influencerId);

    return {
      ...evaluation,
      sessionTitle: session?.title ?? "Unknown Session",
      userName: use?.name ?? "Unknown User",
      influencerName: influencer?.name ?? "Unknown Influencer",
      messages: store.messages
        .filter((m) => m.sessionId === evaluation.sessionId)
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    };
  });

  return NextResponse.json({ reports });
}

