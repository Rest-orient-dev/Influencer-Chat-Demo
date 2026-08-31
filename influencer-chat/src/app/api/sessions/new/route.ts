import { persistStore, store, uid } from "@/lib/store";
import { ChatSession } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";
import { createSession as createMysqlSession, addMessageToSession, getInfluencerById } from "@/server/db/trainingRepoMysql";
import { pickContactOrigin } from "@/lib/contact-origin";
import { generateOpeningReplies } from "@/lib/claude";
import { appendStoreMessages } from "@/lib/append-messages";
import { isDbConfigured } from "@/lib/db-config";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Los chats los asigna el administrador" },
      { status: 403 },
    );
  }

  const body = (await req.json()) as { influencerId?: string };
  if (!body.influencerId) {
    return NextResponse.json(
      { error: "influencerId es obligatorio" },
      { status: 400 },
    );
  }

  const origin = pickContactOrigin();

  if (isDbConfigured()) {
    const influencer = await getInfluencerById(body.influencerId);
    if (!influencer) {
      return NextResponse.json({ error: "El influencer no existe" }, { status: 404 });
    }
    const session = await createMysqlSession(user, body.influencerId);
    session.contactOrigin = origin;
    const opening = await generateOpeningReplies(influencer, origin);
    for (const text of opening) {
      await addMessageToSession(session.id, "assistant", text);
    }
    return NextResponse.json({ session, openingCount: opening.length });
  }

  const influencer = store.influencers.find((i) => i.id === body.influencerId);
  if (!influencer) return NextResponse.json({ error: "El influencer no existe" }, { status: 404 });

  const lastRound =
    store.sessions
      .filter(
        (s) =>
          s.userId === user.sub && s.influencerId === body.influencerId,
      )
      .sort((a, b) => b.collaborationRound - a.collaborationRound)[0]
      ?.collaborationRound ?? 0;

  const session: ChatSession = {
    id: uid("ses"),
    userId: user.sub,
    influencerId: body.influencerId,
    title: influencer.name,
    status: "active",
    collaborationRound: lastRound + 1,
    contactOrigin: origin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.sessions.push(session);
  persistStore();
  const opening = await generateOpeningReplies(influencer, origin);
  appendStoreMessages(session.id, "assistant", opening);
  return NextResponse.json({ session, openingCount: opening.length });
}
