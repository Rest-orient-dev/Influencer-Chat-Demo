"use client";

import { useEffect, useState } from "react";
import { ChatMessage, EvaluationResult } from "@/lib/types";
import { EvaluationReportCard } from "@/app/_components/EvaluationReportCard";
import { formatTime } from "@/lib/format";

type Report = EvaluationResult & {
  sessionTitle?: string;
  userName?: string;
  influencerName?: string;
  messages?: ChatMessage[];
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports || []);
      }
    })();
  }, []);

  const selected = reports.find((r) => r.sessionId === openId);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Informes de evaluación</h1>
      <p className="mt-1 text-sm text-slate-600">
        Haz clic en una fila para ver el chat real del estudiante y el informe de
        aciertos y errores.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Estudiante</th>
              <th className="px-4 py-3 font-medium">Influencer</th>
              <th className="px-4 py-3 font-medium">Conversación</th>
              <th className="px-4 py-3 font-medium">Msgs</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Gramática</th>
              <th className="px-4 py-3 font-medium">Negociación</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                  Aún no hay evaluaciones. Pide al estudiante que pulse «Cerrar y
                  evaluar» en WhatsApp.
                </td>
              </tr>
            )}
            {reports.map((r) => (
              <tr
                key={r.sessionId}
                onClick={() => setOpenId(r.sessionId)}
                className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${
                  openId === r.sessionId ? "bg-emerald-50" : ""
                }`}
              >
                <td className="px-4 py-3">{r.userName}</td>
                <td className="px-4 py-3">{r.influencerName}</td>
                <td className="px-4 py-3">{r.sessionTitle}</td>
                <td className="px-4 py-3 text-slate-500">{r.messages?.length ?? 0}</td>
                <td className="px-4 py-3 font-semibold">{r.overallScore}</td>
                <td className="px-4 py-3">{r.spanishGrammar.score}</td>
                <td className="px-4 py-3">{r.negotiationSkill.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <header className="border-b border-slate-100 px-4 py-3 md:px-5">
              <h2 className="text-base font-medium md:text-lg">
                Conversación · {selected.userName} × {selected.influencerName}
              </h2>
              <p className="text-xs text-slate-500">
                Verde = estudiante (Orient). Blanco = influencer.
              </p>
            </header>
            <Transcript
              messages={selected.messages ?? []}
              studentName={selected.userName ?? "Estudiante"}
              influencerName={selected.influencerName ?? "Influencer"}
            />
          </section>
          <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5">
            <EvaluationReportCard evaluation={selected} />
          </section>
        </div>
      )}
    </div>
  );
}

function Transcript({
  messages,
  studentName,
  influencerName,
}: {
  messages: ChatMessage[];
  studentName: string;
  influencerName: string;
}) {
  if (messages.length === 0) {
    return (
      <div className="px-5 py-10 text-sm text-slate-500">
        No hay mensajes guardados para esta conversación.
      </div>
    );
  }

  return (
    <div className="wa-wallpaper max-h-[70vh] overflow-y-auto px-4 py-4 scrollbar-thin">
      {messages.map((m) => {
        const fromStudent = m.role === "user";
        return (
          <div
            key={m.id}
            className={`mb-2 flex ${fromStudent ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-[9px] pb-[8px] pt-[6px] text-[13.5px] leading-[18px] text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] ${
                fromStudent ? "wa-bubble-out" : "wa-bubble-in"
              }`}
            >
              <div className="mb-0.5 text-[10px] font-medium text-[#667781]">
                {fromStudent ? studentName : influencerName}
              </div>
              <span className="whitespace-pre-wrap">{m.content}</span>
              <span className="ml-2 inline-block translate-y-[3px] float-right text-[10px] text-[#667781]">
                {formatTime(m.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
