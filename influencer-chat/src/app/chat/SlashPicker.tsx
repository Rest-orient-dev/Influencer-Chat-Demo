"use client";

import { QuickReply } from "@/lib/quick-replies";

export function SlashPicker({
  items,
  active,
  onHover,
  onPick,
}: {
  items: QuickReply[];
  active: number;
  onHover: (index: number) => void;
  onPick: (item: QuickReply) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-20 rounded-lg bg-white p-3 text-sm text-[#667781] shadow-[0_4px_16px_rgba(11,20,26,0.18)]">
        No hay atajos con ese nombre. Prueba /proceso /hola /tarifa
      </div>
    );
  }

  return (
    <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-20 max-h-[min(45dvh,280px)] overflow-y-auto rounded-lg bg-white py-1 shadow-[0_4px_16px_rgba(11,20,26,0.18)]">
      <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#667781]">
        Atajos · escribe / como en WhatsApp
      </div>
      {items.map((item, i) => (
        <button
          key={item.slash}
          type="button"
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(item);
          }}
          className={`flex w-full cursor-pointer items-start gap-3 px-3 py-2 text-left ${
            i === active ? "bg-[#f0f2f5]" : "bg-white"
          }`}
        >
          <span className="mt-0.5 shrink-0 rounded bg-[#e9edef] px-1.5 py-0.5 font-mono text-[12px] text-[#008069]">
            /{item.slash}
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] text-[#111b21]">{item.title}</span>
            <span className="block truncate text-[12px] text-[#667781]">{item.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
