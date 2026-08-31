import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db-config";
import { requireAdmin } from "@/lib/require-admin";
import { store, uid, persistStore } from "@/lib/store";
import { dbQuery } from "@/server/db/pool";
import bcrypt from "bcryptjs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  if (isDbConfigured()) {
    const rows = await dbQuery<{
      id: string;
      name: string;
      email: string;
      role: "admin" | "agent";
      created_at: string;
    }>(`SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`);
    const counts = await dbQuery<{
      user_id: string;
      assigned: number;
      completed: number;
    }>(
      `SELECT user_id,
              COUNT(*) AS assigned,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM influencer_sessions
       GROUP BY user_id`,
    );
    const byUser = new Map(counts.map((c) => [c.user_id, c]));
    return NextResponse.json({
      users: rows.map((u) => ({
        ...u,
        assigned: Number(byUser.get(u.id)?.assigned ?? 0),
        completed: Number(byUser.get(u.id)?.completed ?? 0),
      })),
    });
  }

  return NextResponse.json({
    users: store.users.map((u) => ({
      ...u,
      assigned: store.sessions.filter((s) => s.userId === u.id).length,
      completed: store.sessions.filter((s) => s.userId === u.id && s.status === "completed").length,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "agent";
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const role = body.role === "admin" ? "admin" : "agent";

  if (!name || !email || password.length < 4) {
    return NextResponse.json(
      { error: "Nombre y correo son obligatorios. La contraseña debe tener al menos 4 caracteres" },
      { status: 400 },
    );
  }

  if (isDbConfigured()) {
    const exists = await dbQuery<{ id: string }>(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [email],
    );
    if (exists[0]) {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
    }
    const id = uid("usr");
    const hash = await bcrypt.hash(password, 10);
    await dbQuery(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      [id, name, email, hash, role],
    );
    return NextResponse.json({ user: { id, name, email, role } });
  }

  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
  }

  const user = { id: uid("usr"), name, email, role } as const;
  store.users.push(user);
  store.passwords[user.id] = password;
  persistStore();
  return NextResponse.json({ user });
}
