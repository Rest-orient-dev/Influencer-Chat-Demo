import { ChatBubble } from "@/academy/types";

export function BubbleThread({ bubbles }: { bubbles: ChatBubble[] }) {
  return (
    <div className="wa-wallpaper rounded-xl px-3 py-3 md:px-4 md:py-4">
      {bubbles.map((b, i) => (
        <div key={`${b.text}-${i}`} className="mb-3">
          <div className={`flex ${b.role === "orient" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[92%] px-[9px] pb-[8px] pt-[6px] text-[15px] leading-[20px] text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] md:max-w-[85%] md:text-[14px] md:leading-[19px] ${
                b.role === "orient" ? "wa-bubble-out" : "wa-bubble-in"
              }`}
            >
              <div className="mb-0.5 text-[11px] font-medium text-[#667781]">
                {b.role === "orient" ? "Orient" : "Influencer"}
              </div>
              <span className="whitespace-pre-wrap">{b.text}</span>
            </div>
          </div>
          {b.note && (
            <p
              className={`mt-1 max-w-[85%] text-[12px] leading-4 text-[#5e6e77] ${
                b.role === "orient" ? "ml-auto text-right" : ""
              }`}
            >
              {b.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
