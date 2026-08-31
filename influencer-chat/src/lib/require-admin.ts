import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/requireAuth";

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 }),
    };
  }
  if (user.role !== "admin") {
    return {
      user,
      error: NextResponse.json({ error: "No tienes permiso" }, { status: 403 }),
    };
  }
  return { user, error: null };
}
