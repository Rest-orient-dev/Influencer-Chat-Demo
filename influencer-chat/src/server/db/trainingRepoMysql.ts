/* eslint-disable @typescript-eslint/no-explicit-any */
import { dbQuery } from "@/server/db/pool";
import { ChatMessage, ChatSession, EvaluationResult, Influencer } from "@/lib/types";
import { uid } from "@/lib/store";
import { AuthTokenPayload } from "@/server/auth/jwt";

export async function getMyBootstrap(user: AuthTokenPayload) {
  // 管理员可见所有；学员仅见自己的会话/报告
  const isAdmin = user.role === "admin";

  const influencers = (await dbQuery<Influencer>(
    `SELECT id, name, handle, platform, follower_band AS followerBand, avg_price_eur AS avgPriceEur, persona_prompt AS personaPrompt
     FROM influencers
     ORDER BY name ASC`,
  )) as any;

  const sessions = (await dbQuery<any>(
    `SELECT id, user_id AS userId, influencer_id AS influencerId, title, status, collaboration_round AS collaborationRound,
            created_at AS createdAt, updated_at AS updatedAt
     FROM influencer_sessions
     WHERE ${isAdmin ? "1=1" : "user_id = ?"}
     ORDER BY updated_at DESC
    `,
    isAdmin ? [] : [user.sub],
  )) as any as ChatSession[];

  const sessionIds = sessions.map((s) => s.id);
  const messages = sessionIds.length
    ? ((await dbQuery<ChatMessage>(
        `SELECT id, session_id AS sessionId, role, content, created_at AS createdAt
         FROM messages
         WHERE session_id IN (${sessionIds.map(() => "?").join(",")})
         ORDER BY created_at ASC`,
        sessionIds,
      )) as any)
    : [];

  const evaluations = isAdmin
    ? (await dbQuery<any>(
        `SELECT evaluation_runs.*,
                evaluation_runs.created_at AS createdAt
         FROM evaluation_runs
         ORDER BY evaluation_runs.created_at DESC`,
      )) as any
    : (await dbQuery<any>(
        `SELECT er.*,
                er.created_at AS createdAt
         FROM evaluation_runs er
         JOIN influencer_sessions s ON s.id = er.session_id
         WHERE s.user_id = ?
         ORDER BY er.created_at DESC`,
        [user.sub],
      )) as any;

  return {
    users: [{ id: user.sub, name: user.name, email: "", role: user.role }],
    influencers,
    sessions,
    messages,
    evaluations: evaluations.map((er: any) => {
      const goal = er.goal_achieved || {};
      return {
        sessionId: er.session_id,
        overallScore: er.overall_score,
        spanishGrammar: er.spanish_grammar,
        priceReasonableness: er.price_reasonableness,
        negotiationSkill: er.negotiation_skill,
        professionalism: er.professionalism,
        goalAchieved: {
          achieved: Boolean(goal.achieved),
          evidence: goal.evidence ?? [],
          missing: goal.missing ?? [],
        },
        report: goal.report,
        createdAt: er.createdAt,
      } satisfies EvaluationResult;
    }),
  };
}

export async function listSessions(user: AuthTokenPayload) {
  const isAdmin = user.role === "admin";
  const sessions = (await dbQuery<any>(
    `SELECT id, user_id AS userId, influencer_id AS influencerId, title, status, collaboration_round AS collaborationRound,
            created_at AS createdAt, updated_at AS updatedAt
     FROM influencer_sessions
     WHERE ${isAdmin ? "1=1" : "user_id = ?"}
     ORDER BY updated_at DESC`,
    isAdmin ? [] : [user.sub],
  )) as any as ChatSession[];
  return sessions;
}

export async function createSession(user: AuthTokenPayload, influencerId: string) {
  const existing = await dbQuery<any>(
    `SELECT COALESCE(MAX(collaboration_round), 0) AS maxRound
     FROM influencer_sessions
     WHERE user_id = ? AND influencer_id = ?`,
    [user.sub, influencerId],
  );
  const lastRound = existing[0]?.maxRound ?? 0;
  const session: ChatSession = {
    id: uid("ses"),
    userId: user.sub,
    influencerId,
    title: `Nueva colaboración - Ronda ${lastRound + 1}`,
    status: "active",
    collaborationRound: lastRound + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dbQuery(
    `INSERT INTO influencer_sessions (id, user_id, influencer_id, title, status, collaboration_round, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.userId,
      session.influencerId,
      session.title,
      session.status,
      session.collaborationRound,
      session.createdAt,
      session.updatedAt,
    ],
  );
  return session;
}

export async function createSessionForUserId(
  userId: string,
  influencerId: string,
  title: string,
) {
  const existing = await dbQuery<any>(
    `SELECT COALESCE(MAX(collaboration_round), 0) AS maxRound
     FROM influencer_sessions
     WHERE user_id = ? AND influencer_id = ?`,
    [userId, influencerId],
  );
  const lastRound = existing[0]?.maxRound ?? 0;
  const session: ChatSession = {
    id: uid("ses"),
    userId,
    influencerId,
    title,
    status: "active",
    collaborationRound: lastRound + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dbQuery(
    `INSERT INTO influencer_sessions (id, user_id, influencer_id, title, status, collaboration_round, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.userId,
      session.influencerId,
      session.title,
      session.status,
      session.collaborationRound,
      session.createdAt,
      session.updatedAt,
    ],
  );
  return session;
}

export async function getSessionByIdForUser(
  user: AuthTokenPayload,
  sessionId: string,
): Promise<ChatSession | null> {
  const rows = await dbQuery<any>(
    `SELECT id, user_id AS userId, influencer_id AS influencerId, title, status, collaboration_round AS collaborationRound,
            created_at AS createdAt, updated_at AS updatedAt
     FROM influencer_sessions
     WHERE id = ?
       AND ${user.role === "admin" ? "1=1" : "user_id = ?"}`,
    user.role === "admin" ? [sessionId] : [sessionId, user.sub],
  );
  return rows[0] || null;
}

export async function getInfluencerById(influencerId: string) {
  const rows = await dbQuery<any>(
    `SELECT id, name, handle, platform, follower_band AS followerBand, avg_price_eur AS avgPriceEur, persona_prompt AS personaPrompt
     FROM influencers
     WHERE id = ?`,
    [influencerId],
  );
  return rows[0] as Influencer | undefined;
}

export async function listMessagesBySession(sessionId: string) {
  const rows = await dbQuery<ChatMessage>(
    `SELECT id, session_id AS sessionId, role, content, created_at AS createdAt
     FROM messages
     WHERE session_id = ?
     ORDER BY created_at ASC`,
    [sessionId],
  );
  return rows;
}

export async function addMessageToSession(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
) {
  const id = uid("msg");
  await dbQuery(
    `INSERT INTO messages (id, session_id, role, content, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, sessionId, role, content, new Date().toISOString()],
  );
  return { id };
}

export async function completeSessionWithEvaluation(
  user: AuthTokenPayload,
  sessionId: string,
  evaluation: EvaluationResult,
) {
  const session = await getSessionByIdForUser(user, sessionId);
  if (!session) throw new Error("La conversación no es accesible");

  await dbQuery(
    `INSERT INTO evaluation_runs
      (id, session_id, overall_score, spanish_grammar, price_reasonableness, negotiation_skill, professionalism, goal_achieved, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      evaluation.sessionId ? uid("eval") : uid("eval"),
      sessionId,
      evaluation.overallScore,
      JSON.stringify(evaluation.spanishGrammar),
      JSON.stringify(evaluation.priceReasonableness),
      JSON.stringify(evaluation.negotiationSkill),
      JSON.stringify(evaluation.professionalism),
      JSON.stringify({
        ...evaluation.goalAchieved,
        report: evaluation.report,
      }),
      evaluation.createdAt,
    ],
  );

  await dbQuery(
    `UPDATE influencer_sessions
     SET status = 'completed', updated_at = ?
     WHERE id = ?`,
    [new Date().toISOString(), sessionId],
  );
}

export async function listAdminReports() {
  const rows = await dbQuery<any>(
    `SELECT er.*,
            er.created_at AS createdAt,
            s.title AS sessionTitle,
            u.name AS userName,
            i.name AS influencerName
     FROM evaluation_runs er
     JOIN influencer_sessions s ON s.id = er.session_id
     JOIN users u ON u.id = s.user_id
     JOIN influencers i ON i.id = s.influencer_id
     ORDER BY er.created_at DESC`,
  );

  const reports = rows.map((er) => {
    const goal = er.goal_achieved || {};
    return {
      sessionId: er.session_id,
      overallScore: er.overall_score,
      spanishGrammar: er.spanish_grammar,
      priceReasonableness: er.price_reasonableness,
      negotiationSkill: er.negotiation_skill,
      professionalism: er.professionalism,
      goalAchieved: {
        achieved: Boolean(goal.achieved),
        evidence: goal.evidence ?? [],
        missing: goal.missing ?? [],
      },
      report: goal.report,
      createdAt: er.createdAt,
      sessionTitle: er.sessionTitle,
      userName: er.userName,
      influencerName: er.influencerName,
      messages: [] as ChatMessage[],
    };
  });

  const sessionIds = [...new Set(reports.map((r) => r.sessionId))];
  if (sessionIds.length) {
    const msgs = await dbQuery<ChatMessage>(
      `SELECT id, session_id AS sessionId, role, content, created_at AS createdAt
       FROM messages
       WHERE session_id IN (${sessionIds.map(() => "?").join(",")})
       ORDER BY created_at ASC`,
      sessionIds,
    );
    const bySession = new Map<string, ChatMessage[]>();
    for (const m of msgs) {
      const list = bySession.get(m.sessionId) ?? [];
      list.push(m);
      bySession.set(m.sessionId, list);
    }
    for (const r of reports) {
      r.messages = bySession.get(r.sessionId) ?? [];
    }
  }

  return reports;
}

export async function importInfluencers(user: AuthTokenPayload, influencers: Partial<Influencer>[]) {
  if (user.role !== "admin") throw new Error("Solo el administrador puede importar");

  if (!influencers.length) return { imported: 0, total: 0 };

  // MVP：简单 upsert（按 id）
  const ids = influencers
    .map((x) => x.id)
    .filter((id): id is string => Boolean(id));
  const existing = ids.length
    ? await dbQuery<any>(`SELECT id FROM influencers WHERE id IN (${ids.map(() => "?").join(",")})`, ids)
    : [];
  const existingSet = new Set(existing.map((r) => r.id));

  let imported = 0;

  for (const raw of influencers) {
    const name = raw.name;
    const handle = raw.handle;
    if (!name || !handle) continue;

    const id = raw.id || uid("inf");
    const platform = (raw.platform as any) || "instagram";
    const followerBand = (raw.followerBand as any) || "mid";
    const avgPriceEur = Number(raw.avgPriceEur ?? 300);
    const personaPrompt =
      raw.personaPrompt ||
      `Habla como ${name} en tono profesional. Negocia precio, fecha, restaurante y pago con naturalidad.`;

    if (existingSet.has(id)) {
      await dbQuery(
        `UPDATE influencers SET name=?, handle=?, platform=?, follower_band=?, avg_price_eur=?, persona_prompt=?
         WHERE id=?`,
        [name, handle, platform, followerBand, avgPriceEur, personaPrompt, id],
      );
    } else {
      imported++;
      await dbQuery(
        `INSERT INTO influencers
          (id, name, handle, platform, follower_band, avg_price_eur, persona_prompt, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, handle, platform, followerBand, avgPriceEur, personaPrompt, new Date().toISOString()],
      );
      existingSet.add(id);
    }
  }

  const countRows = await dbQuery<any>(
    `SELECT COUNT(*) AS cnt FROM influencers`,
  );

  return { imported, total: countRows[0]?.cnt ?? 0 };
}

