"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthUser } from "@/lib/use-auth";
import { getAcademyUnits } from "@/academy/curriculum";
import {
  AcademyProgressProvider,
  useAcademyProgress,
} from "./_components/useAcademyProgress";

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AcademyProgressProvider>
      <AcademyShell>{children}</AcademyShell>
    </AcademyProgressProvider>
  );
}

function AcademyShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();
  const { progress } = useAcademyProgress();
  const units = getAcademyUnits();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
  }, [ready, user, router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  if (!ready || !user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#111b21] text-white">
        Entrando a la academia…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0b141a] text-[#e9edef]">
      <header className="sticky top-0 z-20 bg-[#00a884] px-3 py-3 pt-safe md:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-2">
          <Link href="/academy" className="min-w-0 cursor-pointer">
            <div className="text-[10px] font-semibold tracking-[0.18em] text-white/90 md:text-[11px]">
              ORIENT ACADEMY
            </div>
            <div className="truncate text-sm text-white">Método WhatsApp</div>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <Link
              href="/chat"
              className="cursor-pointer rounded-full bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/25 md:px-3"
            >
              Chat
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="cursor-pointer rounded-full bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/25 md:px-3"
              >
                Panel
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer rounded-full px-2.5 py-1.5 text-xs text-white/90 hover:bg-white/10 md:px-3"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-white/10 bg-[#111b21] px-3 py-3 md:hidden">
        <div className="flex items-center justify-between text-xs text-[#8696a0]">
          <span>Tu ruta</span>
          <span className="text-white">{progress.percent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-[#00a884]" style={{ width: `${progress.percent}%` }} />
        </div>
        <nav className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
          {units.map((unit) => {
            const done = progress.completedUnitIds.includes(unit.id);
            const active = pathname.startsWith(`/academy/${unit.id}`);
            return (
              <Link
                key={unit.id}
                href={`/academy/${unit.id}`}
                className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs ${
                  active ? "bg-[#00a884] text-white" : "bg-white/10 text-[#d1d7db]"
                }`}
              >
                {unit.order}. {unit.title}
                {done ? " ✓" : ""}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto grid max-w-[1100px] gap-6 px-3 py-4 pb-safe md:grid-cols-[240px_minmax(0,1fr)] md:px-6 md:py-6">
        <nav className="hidden md:block">
          <div className="sticky top-20 rounded-xl bg-[#111b21] p-4">
            <div className="text-xs uppercase tracking-wide text-[#8696a0]">Tu ruta</div>
            <div className="mt-2 text-2xl font-light text-white">{progress.percent}%</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[#00a884]" style={{ width: `${progress.percent}%` }} />
            </div>
            <ol className="mt-4 space-y-1">
              {units.map((unit) => {
                const done = progress.completedUnitIds.includes(unit.id);
                const active = pathname.startsWith(`/academy/${unit.id}`);
                return (
                  <li key={unit.id}>
                    <Link
                      href={`/academy/${unit.id}`}
                      className={`block cursor-pointer rounded-lg px-2 py-2 text-sm ${
                        active ? "bg-white/10 text-white" : "text-[#d1d7db] hover:bg-white/5"
                      }`}
                    >
                      <span className="mr-2 text-xs text-[#00a884]">{unit.order}</span>
                      {unit.title}
                      {done ? <span className="ml-1 text-[#00a884]">✓</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
