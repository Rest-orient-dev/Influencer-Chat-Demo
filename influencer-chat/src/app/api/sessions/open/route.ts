import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";
import { isDbConfigured } from "@/lib/db-config";
import { store } from "@/lib/store";
import {
  addMessageToSession,
  getInfluencerById,
  getSessionByIdForUser,
  listMessagesBySession,
} from "@/server/db/trainingRepoMysql";
import { generateOpeningReplies } from "@/lib/claude";
import { pickContactOrigin } from "@/lib/contact-origin";
import { appendStoreMessages } from "@/lib/append-messages";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 });

  const body = (await req.json()) as { sessionId?: string };
  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId es obligatorio" }, { status: 400 });
  }

  if (isDbConfigured()) {
    const session = await getSessionByIdForUser(user, body.sessionId);
    if (!session) {
      return NextResponse.json({ error: "La conversación no existe o no tienes permiso" }, { status: 404 });
    }
    const existing = await listMessagesBySession(session.id);
    if (existing.length) return NextResponse.json({ session, alreadyOpen: true });

    const influencer = await getInfluencerById(session.influencerId);
    if (!influencer) {
      return NextResponse.json({ error: "El perfil del influencer no existe" }, { status: 404 });
    }
    const origin = session.contactOrigin || pickContactOrigin();
    const opening = await generateOpeningReplies(influencer, origin);
    for (const text of opening) {
      await addMessageToSession(session.id, "assistant", text);
    }
    return NextResponse.json({ session, openingCount: opening.length });
  }

  const session = store.sessions.find((s) => s.id === body.sessionId);
  if (!session) return NextResponse.json({ error: "La conversación no existe" }, { status: 404 });
  if (user.role !== "admin" && session.userId !== user.sub) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  const existing = store.messages.filter((m) => m.sessionId === session.id);
  if (existing.length) return NextResponse.json({ session, alreadyOpen: true });

  const influencer = store.influencers.find((i) => i.id === session.influencerId);
  if (!influencer) {
    return NextResponse.json({ error: "El perfil del influencer no existe" }, { status: 404 });
  }
  const origin = session.contactOrigin || pickContactOrigin();
  session.contactOrigin = origin;
  const opening = await generateOpeningReplies(influencer, origin);
  appendStoreMessages(session.id, "assistant", opening);
  return NextResponse.json({ session, openingCount: opening.length });
}
