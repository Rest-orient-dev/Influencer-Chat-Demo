"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/lib/use-auth";

export default function Home() {
  const router = useRouter();
  const { user, ready } = useAuthUser();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(user.role === "admin" ? "/admin" : "/chat");
  }, [ready, user, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#111b21] text-[#e9edef]">
      Entrando a la formación…
    </div>
  );
}
