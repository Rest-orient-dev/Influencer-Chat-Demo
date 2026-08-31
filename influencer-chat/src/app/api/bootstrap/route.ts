import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";
import { store } from "@/lib/store";
import { getMyBootstrap } from "@/server/db/trainingRepoMysql";

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
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  if (isDbConfigured()) {
    return NextResponse.json(await getMyBootstrap(user));
  }

  const isAdmin = user.role === "admin";
  const userId = user.sub;
  const sessions = isAdmin
    ? store.sessions
    : store.sessions.filter((s) => s.userId === userId);
  const sessionIds = new Set(sessions.map((s) => s.id));
  const messages = store.messages.filter((m) => sessionIds.has(m.sessionId));
  const evaluations = store.evaluations.filter((e) =>
    isAdmin ? true : sessionIds.has(e.sessionId),
  );

  const publicInfluencers = store.influencers.map((inf) => ({
    ...inf,
    avgPriceEur: isAdmin ? inf.avgPriceEur : 0,
    personaPrompt: "",
  }));

  return NextResponse.json({
    users: store.users.filter((u) => (isAdmin ? true : u.id === userId)),
    influencers: publicInfluencers,
    sessions,
    messages,
    evaluations,
  });
}

