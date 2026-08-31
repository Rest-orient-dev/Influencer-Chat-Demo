import { persistStore, store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";
import {
  completeSessionWithEvaluation,
  getInfluencerById,
  getSessionByIdForUser,
  listMessagesBySession,
} from "@/server/db/trainingRepoMysql";
import { evaluateWithClaude } from "@/lib/claude";
import { isDbConfigured } from "@/lib/db-config";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 });

  const body = (await req.json()) as { sessionId?: string };
  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId es obligatorio" }, { status: 400 });
  }

  if (isDbConfigured()) {
    const session = await getSessionByIdForUser(user, body.sessionId);
    if (!session) return NextResponse.json({ error: "La conversación no existe o no tienes permiso" }, { status: 404 });
    const transcript = await listMessagesBySession(session.id);
    const influencer = await getInfluencerById(session.influencerId);
    const evaluation = await evaluateWithClaude(session.id, influencer, transcript);
    await completeSessionWithEvaluation(user, session.id, evaluation);
    return NextResponse.json({ evaluation });
  }

  const session = store.sessions.find((s) => s.id === body.sessionId);
  if (!session) return NextResponse.json({ error: "La conversación no existe" }, { status: 404 });
  if (user.role !== "admin" && session.userId !== user.sub) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  const transcript = store.messages.filter((m) => m.sessionId === body.sessionId);
  const influencer = store.influencers.find((i) => i.id === session.influencerId);
  const evaluation = await evaluateWithClaude(body.sessionId, influencer, transcript);

  store.evaluations = [
    ...store.evaluations.filter((e) => e.sessionId !== body.sessionId),
    evaluation,
  ];
  session.status = "completed";
  session.updatedAt = new Date().toISOString();
  persistStore();

  return NextResponse.json({ evaluation });
}
