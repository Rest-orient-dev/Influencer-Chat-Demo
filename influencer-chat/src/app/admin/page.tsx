"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  users: number;
  agents: number;
  influencers: number;
  sessions: number;
  completed: number;
  avgScore: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    })();
  }, []);

  const cards = [
    { label: "Estudiantes / usuarios", value: stats?.users ?? "—", href: "/admin/users" },
    { label: "Estudiantes de negociación", value: stats?.agents ?? "—", href: "/admin/users" },
    { label: "Perfiles de influencers", value: stats?.influencers ?? "—", href: "/admin/influencers" },
    { label: "Conversaciones", value: stats?.sessions ?? "—", href: "/admin/reports" },
    { label: "Evaluaciones completadas", value: stats?.completed ?? "—", href: "/admin/reports" },
    { label: "Puntuación media", value: stats?.avgScore ?? "—", href: "/admin/reports" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Resumen interno: cuentas, conversaciones y calidad de las evaluaciones.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="cursor-pointer rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:ring-slate-300"
          >
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{c.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
