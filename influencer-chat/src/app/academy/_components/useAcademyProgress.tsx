"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AcademyProgressState = {
  completedActivityIds: string[];
  completedUnitIds: string[];
  percent: number;
  scores: Record<string, { correct: number; total: number; completedAt: string }>;
};

const empty: AcademyProgressState = {
  completedActivityIds: [],
  completedUnitIds: [],
  percent: 0,
  scores: {},
};

const AcademyProgressContext = createContext<{
  progress: AcademyProgressState;
  ready: boolean;
  complete: (activityId: string, score?: { correct: number; total: number }) => Promise<void>;
} | null>(null);

export function AcademyProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<AcademyProgressState>(empty);
  const [ready, setReady] = useState(false);

  const apply = (json: AcademyProgressState) => {
    setProgress({
      completedActivityIds: json.completedActivityIds ?? [],
      completedUnitIds: json.completedUnitIds ?? [],
      percent: json.percent ?? 0,
      scores: json.scores ?? {},
    });
  };

  const reload = useCallback(async () => {
    const res = await fetch("/api/academy/progress", { credentials: "include" });
    if (res.ok) apply((await res.json()) as AcademyProgressState);
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const complete = useCallback(
    async (activityId: string, score?: { correct: number; total: number }) => {
      const res = await fetch("/api/academy/progress", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, ...score }),
      });
      if (res.ok) apply((await res.json()) as AcademyProgressState);
    },
    [],
  );

  return (
    <AcademyProgressContext.Provider value={{ progress, ready, complete }}>
      {children}
    </AcademyProgressContext.Provider>
  );
}

export function useAcademyProgress() {
  const ctx = useContext(AcademyProgressContext);
  if (!ctx) {
    throw new Error("useAcademyProgress debe usarse dentro de AcademyProgressProvider");
  }
  return ctx;
}
