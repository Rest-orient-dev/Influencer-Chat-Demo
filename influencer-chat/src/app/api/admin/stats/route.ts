import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db-config";
import { requireAdmin } from "@/lib/require-admin";
import { store } from "@/lib/store";
import { dbQuery } from "@/server/db/pool";

export async function GET() {
  const { user, error } = await requireAdmin();
  if (error) return error;

  if (isDbConfigured()) {
    const usersCount = await dbQuery<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM users`);
    const agentsCount = await dbQuery<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM users WHERE role = 'agent'`,
    );
    const infCount = await dbQuery<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM influencers`);
    const sessionCount = await dbQuery<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM influencer_sessions`,
    );
    const completedCount = await dbQuery<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM influencer_sessions WHERE status = 'completed'`,
    );
    const avgScore = await dbQuery<{ avgScore: number | null }>(
      `SELECT AVG(overall_score) AS avgScore FROM evaluation_runs`,
    );

    return NextResponse.json({
      users: Number(usersCount[0]?.cnt ?? 0),
      agents: Number(agentsCount[0]?.cnt ?? 0),
      influencers: Number(infCount[0]?.cnt ?? 0),
      sessions: Number(sessionCount[0]?.cnt ?? 0),
      completed: Number(completedCount[0]?.cnt ?? 0),
      avgScore: Math.round(Number(avgScore[0]?.avgScore ?? 0)),
      currentUser: user,
    });
  }

  const completed = store.sessions.filter((s) => s.status === "completed").length;
  const avg =
    store.evaluations.length === 0
      ? 0
      : Math.round(
          store.evaluations.reduce((sum, e) => sum + e.overallScore, 0) /
            store.evaluations.length,
        );

  return NextResponse.json({
    users: store.users.length,
    agents: store.users.filter((u) => u.role === "agent").length,
    influencers: store.influencers.length,
    sessions: store.sessions.length,
    completed,
    avgScore: avg,
    currentUser: user,
  });
}
