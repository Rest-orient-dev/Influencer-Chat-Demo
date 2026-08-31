import { store } from "@/lib/store";
import { ChatMessage, ContactOrigin } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";
import {
  addMessageToSession,
  getInfluencerById,
  getSessionByIdForUser,
  listMessagesBySession,
} from "@/server/db/trainingRepoMysql";
import { generateInfluencerReplies } from "@/lib/claude";
import { appendStoreMessages } from "@/lib/append-messages";
import { isDbConfigured } from "@/lib/db-config";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 });

  const body = (await req.json()) as {
    sessionId?: string;
    content?: string;
  };

  if (!body.sessionId || !body.content?.trim()) {
    return NextResponse.json(
      { error: "sessionId y content son obligatorios" },
      { status: 400 },
    );
  }

  const originFallback: ContactOrigin = "instagram_dm";

  if (isDbConfigured()) {
    const session = await getSessionByIdForUser(user, body.sessionId);
    if (!session) {
      return NextResponse.json({ error: "La conversación no existe o no tienes permiso" }, { status: 404 });
    }

    const influencer = await getInfluencerById(session.influencerId);
    if (!influencer) {
      return NextResponse.json({ error: "El perfil del influencer no existe" }, { status: 404 });
    }

    await addMessageToSession(session.id, "user", body.content.trim());
    const history = await listMessagesBySession(session.id);
    const replies = await generateInfluencerReplies(
      influencer,
      session.contactOrigin || originFallback,
      history,
      body.content.trim(),
    );
    for (const text of replies) {
      await addMessageToSession(session.id, "assistant", text);
    }

    const newHistory = await listMessagesBySession(session.id);
    const userMsg = newHistory.filter((m) => m.role === "user").at(-1);
    const botMsgs = newHistory.slice(history.length);
    return NextResponse.json({ userMsg, botMsgs });
  }

  const session = store.sessions.find((s) => s.id === body.sessionId);
  if (!session) return NextResponse.json({ error: "La conversación no existe" }, { status: 404 });
  if (user.role !== "admin" && session.userId !== user.sub) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  const influencer = store.influencers.find((i) => i.id === session.influencerId);
  if (!influencer) return NextResponse.json({ error: "El perfil del influencer no existe" }, { status: 404 });

  const [userMsg] = appendStoreMessages(session.id, "user", [body.content.trim()]);
  const history = store.messages.filter((m) => m.sessionId === session.id);
  const replies = await generateInfluencerReplies(
    influencer,
    session.contactOrigin || originFallback,
    history,
    userMsg.content,
  );
  const botMsgs: ChatMessage[] = appendStoreMessages(session.id, "assistant", replies);

  return NextResponse.json({ userMsg, botMsgs });
}
