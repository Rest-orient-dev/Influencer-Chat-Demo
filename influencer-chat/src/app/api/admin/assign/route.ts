import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { isDbConfigured } from "@/lib/db-config";
import { store } from "@/lib/store";
import { createMemorySession, pickInfluencersForStudent } from "@/lib/assign-sessions";
import { createSessionForUserId } from "@/server/db/trainingRepoMysql";
import { dbQuery } from "@/server/db/pool";
import { Influencer } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = (await req.json()) as { userId?: string; count?: number };
  const userId = body.userId?.trim();
  const count = Number(body.count);

  if (!userId || !Number.isInteger(count) || count < 1 || count > 30) {
    return NextResponse.json(
      { error: "Indica un estudiante y un número de chats entre 1 y 30" },
      { status: 400 },
    );
  }

  if (isDbConfigured()) {
    const users = await dbQuery<{ id: string; role: string }>(
      `SELECT id, role FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );
    const target = users[0];
    if (!target) return NextResponse.json({ error: "El usuario no existe" }, { status: 404 });
    if (target.role !== "agent") {
      return NextResponse.json(
        { error: "Solo se pueden asignar chats a estudiantes" },
        { status: 400 },
      );
    }

    const influencers = await dbQuery<Influencer>(
      `SELECT id, name, handle, platform, follower_band AS followerBand, avg_price_eur AS avgPriceEur, persona_prompt AS personaPrompt
       FROM influencers`,
    );
    if (!influencers.length) {
      return NextResponse.json({ error: "No hay influencers importados" }, { status: 400 });
    }

    const existing = await dbQuery<{ influencer_id: string }>(
      `SELECT influencer_id FROM influencer_sessions WHERE user_id = ?`,
      [userId],
    );
    const already = new Set(existing.map((r) => r.influencer_id));
    const picked = pickInfluencersForStudent(influencers, already, count);
    const sessions = [];
    for (const inf of picked) {
      sessions.push(await createSessionForUserId(userId, inf.id, inf.name));
    }
    return NextResponse.json({ assigned: sessions.length, sessions });
  }

  const target = store.users.find((u) => u.id === userId);
  if (!target) return NextResponse.json({ error: "El usuario no existe" }, { status: 404 });
  if (target.role !== "agent") {
    return NextResponse.json(
      { error: "Solo se pueden asignar chats a estudiantes" },
      { status: 400 },
    );
  }
  if (!store.influencers.length) {
    return NextResponse.json({ error: "No hay influencers importados" }, { status: 400 });
  }

  const already = new Set(
    store.sessions.filter((s) => s.userId === userId).map((s) => s.influencerId),
  );
  const picked = pickInfluencersForStudent(store.influencers, already, count);
  const sessions = picked.map((inf) => createMemorySession(userId, inf));
  return NextResponse.json({ assigned: sessions.length, sessions });
}
