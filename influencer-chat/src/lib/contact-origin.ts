import { ContactOrigin } from "@/lib/types";

export type { ContactOrigin };

const REFERRAL_NAMES = ["Roberto", "Laura", "Diego", "Carmen", "Pablo", "María"];

export function pickContactOrigin(): ContactOrigin {
  const r = Math.random();
  if (r < 0.9) return "instagram_dm";
  if (r < 0.95) return "inbound";
  return "referral";
}

export function originBrief(origin: ContactOrigin, influencerName: string) {
  if (origin === "instagram_dm") {
    return `Origen (90% de los casos reales): el equipo de Orient Marketing te escribió primero por Instagram pidiendo WhatsApp. Tú (el influencer ${influencerName}) acabas de abrir este chat. Es el primer mensaje. No hay historial previo. No des el precio todavía.`;
  }
  if (origin === "inbound") {
    return `Origen: tú (el influencer ${influencerName}) has contactado por tu cuenta a Orient Marketing por WhatsApp para ofrecer colaboración. Es el primer mensaje. Preséntate breve y, si encaja, manda tu Instagram. No sueltes el precio en el saludo.`;
  }
  const friend = REFERRAL_NAMES[Math.floor(Math.random() * REFERRAL_NAMES.length)];
  return `Origen: un conocido (${friend}) te ha pasado el WhatsApp de Orient Marketing. Tú (el influencer ${influencerName}) escribes primero mencionando esa intro. Es el primer mensaje. No des el precio todavía.`;
}
