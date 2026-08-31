"use client";

import { useEffect, useState } from "react";

export type AuthUser = {
  sub: string;
  role: "admin" | "agent";
  name: string;
};

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }
      const json = await res.json();
      if (!cancelled) {
        setUser(json.user);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, ready };
}
