"use client";

import { useEffect, useState } from "react";
import { Influencer } from "@/lib/types";

export default function AdminInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [importText, setImportText] = useState(
    '[{"name":"Elena Food","handle":"@elenafood","platform":"instagram","avgPriceEur":320}]',
  );
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/influencers");
    if (res.ok) {
      const json = await res.json();
      setInfluencers(json.influencers || []);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const importInfluencers = async () => {
    setMessage(null);
    try {
      const parsed = JSON.parse(importText);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencers: parsed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || "No se pudo importar");
        return;
      }
      setMessage(
        `Se importaron ${json.imported} perfiles. Total actual: ${json.total} influencers`,
      );
      await load();
    } catch {
      setMessage("El JSON no es válido");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Influencers</h1>
      <p className="mt-1 text-sm text-slate-600">
        Importa aquí el JSON exportado de orient-marketing. La lista de chats de los
        estudiantes usará estos perfiles.
      </p>

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:p-5">
        <label className="text-sm font-medium text-slate-800">Importar array JSON</label>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          className="mt-2 h-36 w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900"
        />
        <button
          onClick={importInfluencers}
          className="btn-solid mt-3 cursor-pointer rounded-md px-4 py-2 text-sm font-medium"
        >
          Importar
        </button>
        {message && <p className="mt-2 text-sm text-slate-700">{message}</p>}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Cuenta</th>
              <th className="px-4 py-3 font-medium">Plataforma</th>
              <th className="px-4 py-3 font-medium">Nivel</th>
              <th className="px-4 py-3 font-medium">Precio de referencia</th>
            </tr>
          </thead>
          <tbody>
            {influencers.map((i) => (
              <tr key={i.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">{i.name}</td>
                <td className="px-4 py-3 text-slate-700">{i.handle}</td>
                <td className="px-4 py-3 text-slate-700">{i.platform}</td>
                <td className="px-4 py-3 text-slate-700">{i.followerBand}</td>
                <td className="px-4 py-3 text-slate-900">{i.avgPriceEur} EUR</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
