import { ChatSession, Influencer } from "@/lib/types";
import { store, uid, persistStore } from "@/lib/store";
import { pickContactOrigin } from "@/lib/contact-origin";

export function pickInfluencersForStudent(
  all: Influencer[],
  alreadyInfluencerIds: Set<string>,
  count: number,
) {
  if (count <= 0 || all.length === 0) return [];
  const unused = all.filter((i) => !alreadyInfluencerIds.has(i.id));
  const primary = unused.length ? unused : all;
  const shuffled = [...primary].sort(() => Math.random() - 0.5);
  const picked: Influencer[] = [];
  for (const inf of shuffled) {
    if (picked.length >= count) break;
    if (picked.some((p) => p.id === inf.id) && unused.length >= count) continue;
    picked.push(inf);
  }
  let i = 0;
  while (picked.length < count) {
    picked.push(all[i % all.length]);
    i += 1;
  }
  return picked.slice(0, count);
}

export function createMemorySession(userId: string, influencer: Influencer): ChatSession {
  const lastRound =
    store.sessions
      .filter((s) => s.userId === userId && s.influencerId === influencer.id)
      .sort((a, b) => b.collaborationRound - a.collaborationRound)[0]
      ?.collaborationRound ?? 0;

  const session: ChatSession = {
    id: uid("ses"),
    userId,
    influencerId: influencer.id,
    title: influencer.name,
    status: "active",
    collaborationRound: lastRound + 1,
    contactOrigin: pickContactOrigin(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.sessions.push(session);
  persistStore();
  return session;
}
