import { ChatMessage, Influencer } from "@/lib/types";
import { ContactOrigin } from "@/lib/contact-origin";

const hasPriceAsk = (text: string) =>
  /(tarifa|precio|cuánto|cuanto|budget|presupuesto|cobras|vale)/i.test(text);
const hasProfileAsk = (text: string) =>
  /(instagram|perfil|cuenta|enlace|link|ejemplos?|reel|insights?)/i.test(text);
const hasDate = (text: string) =>
  /(lunes|martes|miércoles|jueves|viernes|sábado|domingo|\d{1,2}\/\d{1,2}|fecha)/i.test(
    text,
  );
const hasRestaurant = (text: string) =>
  /(restaurante|local|sushitokyo|amazonia|qiqi|reino|orient)/i.test(text);
const hasPayment = (text: string) =>
  /(pago|transferencia|factura|anticipo|abono)/i.test(text);

function ig(influencer: Influencer) {
  return (
    influencer.instagramUrl ||
    `https://www.instagram.com/${influencer.handle.replace(/^@/, "")}`
  );
}

export function mockOpeningReplies(
  influencer: Influencer,
  origin: ContactOrigin,
): string[] {
  if (origin === "inbound") {
    return [
      `Holaaa 😊 soy ${influencer.name}`,
      "Vi vuestros restaurantes y me encantaría colaborar. ¿Seguimos por aquí?",
      ig(influencer),
    ];
  }
  if (origin === "referral") {
    return [
      `Hola! Soy ${influencer.name}, un compañero me pasó vuestro WhatsApp`,
      "¿Os va bien si os dejo mi Instagram?",
      ig(influencer),
    ];
  }
  return [
    "Holaaa! Me escribisteis por Instagram 😊",
    "Os paso por aquí como me pedisteis, ¿me contáis un poco la colaboración?",
  ];
}

export function mockInfluencerReplies(
  influencer: Influencer,
  history: ChatMessage[],
  userMessage: string,
): string[] {
  if (hasProfileAsk(userMessage) && !/instagram\.com/i.test(userMessage)) {
    return ["Claro, te paso mi perfil", ig(influencer)];
  }
  if (hasPriceAsk(userMessage)) {
    return [
      `Para una colaboración de restaurante suelo estar en ${influencer.avgPriceEur} EUR`,
      "Cena invitada aparte. ¿Qué restaurante y qué pedís exactamente?",
    ];
  }
  if (!hasDate(userMessage) && history.filter((m) => m.role === "user").length > 1) {
    return ["Perfecto. ¿Qué fecha os vendría bien para grabar?"];
  }
  if (!hasRestaurant(userMessage)) {
    return ["¿En qué restaurante sería y qué tipo de contenido queréis?"];
  }
  if (!hasPayment(userMessage)) {
    return ["Me cuadra. ¿Pago con factura al finalizar o hay anticipo?"];
  }
  return ["Genial, lo veo. Cuando me confirméis fecha y brief lo cerramos 🙌"];
}

/** @deprecated use generateInfluencerReplies */
export async function generateInfluencerReply(
  influencer: Influencer,
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  return mockInfluencerReplies(influencer, history, userMessage).join("\n");
}
