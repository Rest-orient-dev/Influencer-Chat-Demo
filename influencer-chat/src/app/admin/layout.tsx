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
      <div className="grid min-h-screen place-items-center bg-[#0f172a] text-white">
        Entrando al panel…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-[#0f172a]">
      <aside className="flex w-64 flex-col bg-[#0f172a] text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="text-xs tracking-[0.2em] text-[#00a884]">ORIENT</div>
          <div className="mt-1 text-lg font-semibold">Panel de formación</div>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 block cursor-pointer rounded-md px-3 py-2 text-sm ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
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
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
