import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAuthToken } from "@/server/auth/jwt";
import { store } from "@/lib/store";
import { dbQuery } from "@/server/db/pool";

function isDbConfigured() {
  return Boolean(
    process.env.DB_HOST &&
      process.env.DB_USER &&
      process.env.DB_PASSWORD &&
      process.env.DB_NAME &&
      process.env.AUTH_SECRET,
  );
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "El correo y la contraseña son obligatorios" },
      { status: 400 },
    );
  }

  // 本地/未配置 DB 的 fallback：使用内存 seed 用户（便于你继续开发 UI）
  if (!isDbConfigured()) {
    const user = store.users.find((u) => u.email.toLowerCase() === email);
    if (!user) return NextResponse.json({ error: "La cuenta no existe" }, { status: 401 });
    const expected = store.passwords?.[user.id] ?? "123456";
    if (password !== expected) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const token = signAuthToken({ sub: user.id, role: user.role, name: user.name });
    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2, // 2h
    });
    return res;
  }

  // 生产：Hostinger MySQL
  // 注意：该项目部署到 Hostinger 时需要在 hPanel 配置 auth secret + DB 连接信息
  type UserRow = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "agent";
    password_hash: string;
  };

  try {
    const rows = await dbQuery<UserRow>(
      `SELECT id, name, email, role, password_hash
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email],
    );
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "La cuenta no existe" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const token = signAuthToken({ sub: user.id, role: user.role, name: user.name });
    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2, // 2h
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de base de datos";
    console.error("login db error", err);
    return NextResponse.json(
      {
        error: `No se pudo conectar a MySQL: ${message}`,
      },
      { status: 500 },
    );
  }
}

