import { AcademyProgress, ActivityScore } from "@/academy/types";
import { isDbConfigured } from "@/lib/db-config";
import { persistStore, store } from "@/lib/store";
import { dbQuery } from "@/server/db/pool";

function emptyProgress(userId: string): AcademyProgress {
  return {
    userId,
    completedActivityIds: [],
    scores: {},
    updatedAt: new Date().toISOString(),
  };
}

function fromMemory(userId: string): AcademyProgress {
  return store.academyProgress[userId] ?? emptyProgress(userId);
}

function saveMemory(progress: AcademyProgress) {
  store.academyProgress[progress.userId] = progress;
  persistStore();
}

export async function getAcademyProgress(userId: string): Promise<AcademyProgress> {
  if (!isDbConfigured()) return fromMemory(userId);

  try {
    const rows = await dbQuery<{
      completed_json: string | string[];
      scores_json: string | Record<string, ActivityScore>;
      updated_at: string;
    }>(
      `SELECT completed_json, scores_json, updated_at
       FROM academy_progress
       WHERE user_id = ?
       LIMIT 1`,
      [userId],
    );
    const row = rows[0];
    if (!row) return emptyProgress(userId);
    const completed =
      typeof row.completed_json === "string"
        ? (JSON.parse(row.completed_json) as string[])
        : row.completed_json;
    const scores =
      typeof row.scores_json === "string"
        ? (JSON.parse(row.scores_json) as Record<string, ActivityScore>)
        : row.scores_json;
    return {
      userId,
      completedActivityIds: completed ?? [],
      scores: scores ?? {},
      updatedAt: row.updated_at,
    };
  } catch {
    return fromMemory(userId);
  }
}

export async function saveAcademyProgress(progress: AcademyProgress) {
  progress.updatedAt = new Date().toISOString();
  saveMemory(progress);
  if (!isDbConfigured()) return;

  try {
    await dbQuery(
      `INSERT INTO academy_progress (user_id, completed_json, scores_json)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         completed_json = VALUES(completed_json),
         scores_json = VALUES(scores_json)`,
      [progress.userId, JSON.stringify(progress.completedActivityIds), JSON.stringify(progress.scores)],
    );
  } catch {
    // Tabla aún no creada en MySQL local: el progreso sigue en memoria.
  }
}

export async function completeActivity(input: {
  userId: string;
  activityId: string;
  correct?: number;
  total?: number;
}) {
  const progress = await getAcademyProgress(input.userId);
  if (!progress.completedActivityIds.includes(input.activityId)) {
    progress.completedActivityIds = [...progress.completedActivityIds, input.activityId];
  }
  if (typeof input.correct === "number" && typeof input.total === "number") {
    progress.scores[input.activityId] = {
      correct: input.correct,
      total: input.total,
      completedAt: new Date().toISOString(),
    };
  }
  await saveAcademyProgress(progress);
  return progress;
}
