"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ana@orient.local");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        if (res.status === 403) {
          setError(
            "El servidor bloqueó el acceso desde esta IP. Reinicia npm run dev en el PC anfitrión e inténtalo de nuevo.",
          );
          return;
        }
        setError(json.error || "No se pudo iniciar sesión");
        return;
      }
      if (json.user?.role === "admin") router.push("/admin");
      else router.push("/chat");
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111b21] text-[#e9edef]">
      <header className="bg-[#00a884] px-6 py-5">
        <div className="mx-auto flex max-w-[920px] items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#00a884]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.16c-.24.68-1.4 1.25-1.93 1.33-.49.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.61-2.89-1.25-4.77-4.16-4.92-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.24-.27.64-.39 1.02-.39.12 0 .23 0 .33.01.29.01.44.03.63.49.24.58.82 2 .89 2.15.07.15.12.32.02.52-.09.19-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.56.16.27.7 1.16 1.5 1.88 1.03.93 1.9 1.22 2.17 1.36.27.14.43.12.59-.07.16-.19.69-.8.87-1.08.18-.27.37-.23.62-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.31.07.12.07.68-.17 1.36z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.18em] text-white">
              ORIENT TRAINING
            </div>
            <div className="text-xs text-white/90">
              Simulador de WhatsApp para Influencers
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[920px] gap-10 px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <div className="hidden md:block">
          <h1 className="text-4xl font-light leading-snug text-white">
            Practique negociaciones con influencers
            <br />
            en español al ritmo real de WhatsApp
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#d1d7db]">
            Los estudiantes ingresan a la interfaz de chat; los administradores
            revisan la gramática, las cotizaciones y el cumplimiento de objetivos
            en el panel. Este es un entorno de capacitación interno, no un WhatsApp
            real.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          autoComplete="off"
          className="rounded-sm bg-white p-8 text-[#111b21] shadow-[0_2px_10px_rgba(11,20,26,0.26)]"
        >
          <h2 className="text-2xl font-normal text-[#111b21]">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-[#667781]">
            Utilice la cuenta interna de la empresa para ingresar al sistema de
            capacitación
          </p>

          <label className="mt-6 block text-sm font-medium text-[#111b21]" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="orient-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-md border border-[#d1d7db] bg-white px-3 py-3 text-[#111b21] outline-none ring-[#00a884] focus:border-[#00a884] focus:ring-1"
          />

          <label className="mt-4 block text-sm font-medium text-[#111b21]" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="orient-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="off"
            className="mt-1 w-full rounded-md border border-[#d1d7db] bg-white px-3 py-3 text-[#111b21] outline-none ring-[#00a884] focus:border-[#00a884] focus:ring-1"
          />

          {error && (
            <div className="mt-3 rounded-md bg-[#fef2f2] px-3 py-2 text-sm text-[#b42318]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full cursor-pointer rounded-md bg-[#008069] py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#017561] disabled:opacity-70"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
