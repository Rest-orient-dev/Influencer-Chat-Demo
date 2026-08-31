"use client";

import Link from "next/link";
import { getAcademyUnits } from "@/academy/curriculum";
import { activityKindLabel, isUnitComplete } from "@/academy/helpers";
import { useAcademyProgress } from "./_components/useAcademyProgress";

export default function AcademyHomePage() {
  const units = getAcademyUnits();
  const { progress, ready } = useAcademyProgress();
  const nextOpen = units.find((u) => !isUnitComplete(u, progress.completedActivityIds)) ?? units[0];

  return (
    <div className="rounded-2xl bg-white p-4 text-[#111b21] shadow-[0_2px_10px_rgba(11,20,26,0.26)] md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008069]">
        Formación interna
      </p>
      <h1 className="mt-2 text-2xl font-light leading-snug text-[#111b21] md:text-3xl">
        Aprende a negociar con influencers
        <br />
        al ritmo real de WhatsApp
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#3b4a54]">
        Tutoriales, casos reales, práctica paso a paso y ejercicios cortos. Misma rúbrica que el
        simulador: gramática, precio, negociación, profesionalidad y los cuatro cierres (euros,
        restaurante, fecha, pago).
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {nextOpen && (
          <Link
            href={`/academy/${nextOpen.id}`}
            className="cursor-pointer rounded-md bg-[#008069] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#017561]"
          >
            {progress.percent > 0 ? "Seguir donde lo dejé" : "Empezar la ruta"}
          </Link>
        )}
        <Link
          href="/chat"
          className="cursor-pointer rounded-md border border-[#d1d7db] px-5 py-2.5 text-sm font-medium text-[#111b21] hover:bg-[#f0f2f5]"
        >
          Ir al WhatsApp
        </Link>
        {ready && (
          <span className="text-sm text-[#667781]">Progreso guardado en tu cuenta · {progress.percent}%</span>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          { k: "Tutorial", d: "Reglas, errores y burbujas comentadas." },
          { k: "Caso", d: "Hilos buenos y malos, anotados." },
          { k: "Paso a paso", d: "Tú escribes la siguiente burbuja." },
          { k: "Práctica", d: "Elige, ordena y completa, con corrección inmediata." },
        ].map((x) => (
          <div key={x.k} className="rounded-xl bg-[#f0f2f5] px-4 py-3">
            <div className="text-sm font-semibold text-[#008069]">{x.k}</div>
            <div className="mt-1 text-sm text-[#3b4a54]">{x.d}</div>
          </div>
        ))}
      </div>

      <ol className="mt-10 space-y-3">
        {units.map((unit) => {
          const done = isUnitComplete(unit, progress.completedActivityIds);
          const doneN = unit.activities.filter((a) =>
            progress.completedActivityIds.includes(a.id),
          ).length;
          return (
            <li key={unit.id}>
              <Link
                href={`/academy/${unit.id}`}
                className="block cursor-pointer rounded-xl border border-[#e9edef] p-4 hover:border-[#00a884]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#008069]">
                      Unidad {unit.order} · {unit.minutes} min
                      {done ? " · Completada" : ""}
                    </div>
                    <h2 className="mt-1 text-lg text-[#111b21]">{unit.title}</h2>
                    <p className="mt-1 text-sm leading-5 text-[#667781]">{unit.subtitle}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {unit.activities.map((a) => (
                        <span
                          key={a.id}
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            progress.completedActivityIds.includes(a.id)
                              ? "bg-[#d9fdd3] text-[#008069]"
                              : "bg-[#f0f2f5] text-[#54656f]"
                          }`}
                        >
                          {activityKindLabel(a.type)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm text-[#667781]">
                    {doneN}/{unit.activities.length}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
