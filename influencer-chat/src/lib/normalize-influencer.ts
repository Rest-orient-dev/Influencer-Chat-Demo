import { Influencer } from "@/lib/types";

export type RawInfluencer = {
  id?: string;
  name?: string;
  handle?: string;
  platform?: string;
  link?: string;
  followerBand?: string;
  avgPriceEur?: number;
  personaPrompt?: string;
};

const PLATFORMS = new Set(["instagram", "tiktok", "youtube"]);
const BANDS = new Set(["micro", "mid", "macro", "mega"]);

export function cleanHandle(raw: string) {
  let h = raw.trim().replace(/^@/, "");
  h = h.replace(/[\s(]+[\d./]+\)?\s*$/g, "");
  h = h.replace(/\s+(e|eur|€).*$/i, "");
  h = (h.split(/\s+/)[0] || "influencer").replace(/[^a-zA-Z0-9._]/g, "");
  return `@${h || "influencer"}`;
}

export function cleanDisplayName(raw: string, handle: string) {
  let n = raw.replace(/^~/, "").replace(/<3/g, "").trim();
  const paren = n.indexOf("(");
  if (paren > 0) n = n.slice(0, paren).trim();
  n = n.replace(/\s+\d+(\/\d+)?\s*$/, "").trim();
  if (n.length < 2) n = handle.replace(/^@/, "");
  return n;
}

export function instagramUrlFor(link: string | undefined, handle: string) {
  if (link && /^https?:\/\//i.test(link)) {
    return link.split("?")[0].replace(/\/+$/, "");
  }
  return `https://www.instagram.com/${handle.replace(/^@/, "")}`;
}

export function normalizeInfluencer(raw: RawInfluencer, index = 0): Influencer | null {
  if (!raw.name && !raw.handle) return null;
  const handle = cleanHandle(raw.handle || raw.name || `creator${index}`);
  const name = cleanDisplayName(raw.name || handle, handle);
  const platform = PLATFORMS.has(raw.platform || "")
    ? (raw.platform as Influencer["platform"])
    : "instagram";
  const followerBand = BANDS.has(raw.followerBand || "")
    ? (raw.followerBand as Influencer["followerBand"])
    : "micro";
  let avgPriceEur = Number(raw.avgPriceEur ?? 250);
  if (!Number.isFinite(avgPriceEur) || avgPriceEur < 30) avgPriceEur = 150;

  const instagramUrl = instagramUrlFor(raw.link, handle);
  const personaPrompt =
    (raw.personaPrompt?.trim() ||
      `Eres ${name} (${handle}). Creador/a en España. Colaboras con restaurantes. Hablas por WhatsApp, breve y natural.`) +
    `\nInstagram: ${instagramUrl}`;

  return {
    id: raw.id || `inf_${handle.replace(/\W/g, "")}_${index}`,
    name,
    handle,
    platform,
    followerBand,
    avgPriceEur,
    instagramUrl,
    personaPrompt,
  };
}

export function normalizeInfluencers(rows: RawInfluencer[]) {
  const seen = new Set<string>();
  const out: Influencer[] = [];
  rows.forEach((row, index) => {
    const inf = normalizeInfluencer(row, index);
    if (!inf) return;
    const key = inf.handle.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(inf);
  });
  return out;
}
