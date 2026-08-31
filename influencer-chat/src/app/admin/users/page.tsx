"use client";

import { useEffect, useState } from "react";
import { AppUser } from "@/lib/types";

type AdminUser = AppUser & { assigned?: number; completed?: number };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState<"agent" | "admin">("agent");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [assignCount, setAssignCount] = useState<Record<string, number>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const json = await res.json();
      setUsers(json.users || []);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "No se pudo crear el usuario");
      return;
    }
    setName("");
    setEmail("");
    setPassword("123456");
    await load();
  };

  const assign = async (userId: string) => {
    setError(null);
    setMessage(null);
    setAssigningId(userId);
    try {
      const count = assignCount[userId] ?? 3;
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, count }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "No se pudieron asignar los chats");
        return;
      }
      setMessage(`Se asignaron ${json.assigned} conversaciones.`);
      await load();
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <p className="mt-1 text-sm text-slate-600">
        Crea cuentas y asígnales un número de chats. El estudiante no elige influencers:
        solo ve las conversaciones que le envíes.
      </p>

      <form
        onSubmit={create}
        className="mt-6 grid grid-cols-1 gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:grid-cols-5"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "agent" | "admin")}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="agent">Estudiante</option>
          <option value="admin">Administrador</option>
        </select>
        <button
          type="submit"
          className="btn-solid cursor-pointer rounded-md px-3 py-2 text-sm font-medium"
        >
          Añadir usuario
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Chats</th>
              <th className="px-4 py-3 font-medium">Asignar</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">{u.name}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      u.role === "admin"
                        ? "bg-slate-900 text-white"
                        : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {u.role === "admin" ? "Administrador" : "Estudiante"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {u.assigned ?? 0} asignados · {u.completed ?? 0} cerrados
                </td>
                <td className="px-4 py-3">
                  {u.role === "agent" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={assignCount[u.id] ?? 3}
                        onChange={(e) =>
                          setAssignCount((prev) => ({
                            ...prev,
                            [u.id]: Number(e.target.value),
                          }))
                        }
                        className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                      />
                      <button
                        type="button"
                        disabled={assigningId === u.id}
                        onClick={() => assign(u.id)}
                        className="btn-solid cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                      >
                        {assigningId === u.id ? "…" : "Asignar"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
