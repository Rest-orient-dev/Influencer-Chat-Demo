import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db-config";
import { getAuthUser } from "@/server/auth/requireAuth";
import { store } from "@/lib/store";
import { dbQuery } from "@/server/db/pool";
import { Influencer } from "@/lib/types";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 });

  if (isDbConfigured()) {
    const influencers = await dbQuery<Influencer>(
      `SELECT id, name, handle, platform, follower_band AS followerBand, avg_price_eur AS avgPriceEur, persona_prompt AS personaPrompt
       FROM influencers
       ORDER BY name ASC`,
    );
    return NextResponse.json({ influencers });
  }

  return NextResponse.json({ influencers: store.influencers });
}
