import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";
import { importInfluencers as importMysqlInfluencers } from "@/server/db/trainingRepoMysql";
import { isDbConfigured } from "@/lib/db-config";
import { normalizeInfluencers, RawInfluencer } from "@/lib/normalize-influencer";

type ImportItem = RawInfluencer;

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });

  const body = (await req.json()) as { influencers?: ImportItem[] };
  if (!Array.isArray(body.influencers) || body.influencers.length === 0) {
    return NextResponse.json(
      { error: "Se requiere un array de influencers" },
      { status: 400 },
    );
  }

  const normalized = normalizeInfluencers(body.influencers);

  if (isDbConfigured()) {
    const res = await importMysqlInfluencers(user, normalized);
    return NextResponse.json(res);
  }

  const existingIds = new Set(store.influencers.map((i) => i.id));
  for (const inf of normalized) {
    if (existingIds.has(inf.id)) {
      store.influencers = store.influencers.map((old) =>
        old.id === inf.id ? inf : old,
      );
    } else {
      store.influencers.push(inf);
    }
  }

  return NextResponse.json({
    imported: normalized.length,
    total: store.influencers.length,
  });
}

