"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthUser } from "@/lib/use-auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/influencers", label: "Influencers" },
  { href: "/admin/reports", label: "Informes" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/chat");
  }, [ready, user, router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#0f172a] text-white">
        Entrando al panel…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f6f8] text-[#0f172a] md:flex-row">
      <aside className="flex flex-col bg-[#0f172a] text-white md:w-64 md:shrink-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 pt-safe md:block md:border-b md:border-white/10 md:px-5 md:py-5">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-[#00a884] md:text-xs">ORIENT</div>
            <div className="mt-0.5 text-base font-semibold md:mt-1 md:text-lg">Panel</div>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/academy"
              className="cursor-pointer rounded-md bg-white/10 px-2.5 py-1.5 text-xs text-[#86efac]"
            >
              Academy
            </Link>
            <Link
              href="/chat"
              className="cursor-pointer rounded-md bg-white/10 px-2.5 py-1.5 text-xs text-[#86efac]"
            >
              Chat
            </Link>
            <button
              onClick={logout}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-xs text-slate-300"
            >
              Salir
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:flex-1 md:overflow-visible md:p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-sm md:mb-1 md:block ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-white/10 p-4 md:block">
          <Link
            href="/academy"
            className="mb-2 block cursor-pointer rounded-md px-3 py-2 text-sm text-[#86efac] hover:bg-white/5"
          >
            Abrir Academia
          </Link>
          <Link
            href="/chat"
            className="mb-2 block cursor-pointer rounded-md px-3 py-2 text-sm text-[#86efac] hover:bg-white/5"
          >
            Abrir WhatsApp de formación
          </Link>
          <button
            onClick={logout}
            className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
          >
            Salir · {user.name}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 pb-safe md:p-8">{children}</main>
    </div>
  );
}
