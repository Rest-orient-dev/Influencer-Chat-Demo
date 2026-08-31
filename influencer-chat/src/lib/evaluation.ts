import { ChatMessage, DimensionScore, EvaluationResult } from "@/lib/types";
import { overallFromParts } from "@/lib/scoring-rubric";

const scoreFrom = (value: number) => Math.max(0, Math.min(100, value));

function dim(score: number, correct: string[], incorrect: string[]): DimensionScore {
  return {
    score: scoreFrom(score),
    correct,
    incorrect,
    notes: [...correct, ...incorrect],
  };
}

export function evaluateConversation(
  sessionId: string,
  messages: ChatMessage[],
): EvaluationResult {
  const userMsgs = messages.filter((m) => m.role === "user").map((m) => m.content);
  const text = userMsgs.join("\n");
  const has = (re: RegExp) => re.test(text);

  const saidOrient = has(/orient/i);
  const greeting = has(/hola|buenas|qué tal|que tal/i);
  const askedIg = has(/instagram|reel|stories|perfil/i);
  const askedTarifa = has(/tarifa|precio|cu[aá]nto cobr|cu[aá]nto ser/i);
  const hasEuro = has(/\d[\d.,]*\s?(€|eur|euros?)/i);
  const hasRestaurant = has(/restaurante|taberna|asador|brasserie|casa [a-záéíóú]/i);
  const hasDate = has(
    /lunes|martes|mi[eé]rcoles|jueves|viernes|s[áa]bado|domingo|a las \d|\d{1,2}\s+de\s+[a-záéíóú]/i,
  );
  const hasPay = has(/factura|transferencia|anticipo|efectivo|bizum|pago/i);
  const mixedLang = has(/[\u4e00-\u9fff]|\b(please|hello|rate|ok thanks)\b/i);
  const longEmail = userMsgs.some((m) => m.length > 280);
  const rude = has(/idiota|estúpido|estupido|cállate|callate|eres caro/i);
  const simulator = has(/simulador|esto es un test|no eres real/i);

  const grammarCorrect: string[] = [];
  const grammarWrong: string[] = [];
  if (greeting && !mixedLang) {
    grammarCorrect.push("Usas un saludo natural de WhatsApp, no un correo formal.");
  }
  if (!longEmail) {
    grammarCorrect.push("Los mensajes son razonablemente cortos, al ritmo del chat.");
  } else {
    grammarWrong.push(
      "Hay burbujas demasiado largas, parecen un email. Parte en 1–3 frases.",
    );
  }
  if (mixedLang) {
    grammarWrong.push(
      "Hay mezcla de idiomas o caracteres que no son español. Escribe solo en español de España.",
    );
  }
  if (!userMsgs.length) {
    grammarWrong.push("No hay mensajes tuyos para evaluar la gramática.");
  }

  const priceCorrect: string[] = [];
  const priceWrong: string[] = [];
  if (askedTarifa) {
    priceCorrect.push("Preguntas tarifa o precio en lugar de imponer un número a ciegas.");
  } else {
    priceWrong.push(
      "No preguntas su tarifa. Antes de ofertar, pregunta: «¿Cuál es tu tarifa para 1 reel + stories?»",
    );
  }
  if (hasEuro) {
    priceCorrect.push("Dejas el dinero en euros, concreto, no un «ya veremos».");
  } else {
    priceWrong.push("No aparece un precio cerrado en euros.");
  }

  const negoCorrect: string[] = [];
  const negoWrong: string[] = [];
  if (saidOrient) {
    negoCorrect.push("Te presentas como Orient Marketing.");
  } else {
    negoWrong.push("Falta presentarte: nombre + Orient Marketing en las primeras burbujas.");
  }
  if (askedIg) {
    negoCorrect.push("Pides Instagram, reels o stories: el alcance entra en la conversación.");
  } else {
    negoWrong.push(
      "No pides perfil ni alcance (vídeos/stories). Eso debe ir antes del precio.",
    );
  }
  if (askedTarifa && askedIg) {
    negoCorrect.push("Hay un orden de negociación: contenido/alcance y luego dinero.");
  }

  const proCorrect: string[] = [];
  const proWrong: string[] = [];
  if (saidOrient && greeting) {
    proCorrect.push("El tono de apertura encaja con un chat profesional de Orient.");
  }
  if (rude) {
    proWrong.push("Hay un tono poco profesional. Mantén tuteo educado, sin descalificar.");
  }
  if (simulator) {
    proWrong.push("Mencionas que es un simulador: rompe el papel y baja profesionalidad.");
  }
  if (!rude && !simulator) {
    proCorrect.push("No hay groserías ni rupturas de papel.");
  }

  const evidence: string[] = [];
  const missing: string[] = [];
  if (hasEuro) evidence.push("Hay un importe en euros.");
  else missing.push("precio acordado en EUR");
  if (hasRestaurant) evidence.push("Se nombra un restaurante o local concreto.");
  else missing.push("restaurante concreto");
  if (hasDate) evidence.push("Hay una fecha u hora de grabación.");
  else missing.push("fecha de grabación");
  if (hasPay) evidence.push("Se menciona una forma de pago.");
  else missing.push("forma de pago");

  const achieved = missing.length === 0 && userMsgs.length > 0;
  const grammar = dim(
    mixedLang ? 48 : longEmail ? 68 : greeting ? 82 : 62,
    grammarCorrect,
    grammarWrong,
  );
  const price = dim(askedTarifa && hasEuro ? 86 : hasEuro ? 70 : askedTarifa ? 64 : 42, priceCorrect, priceWrong);
  const negotiation = dim(
    saidOrient && askedIg && askedTarifa ? 84 : saidOrient || askedIg ? 66 : 50,
    negoCorrect,
    negoWrong,
  );
  const professionalism = dim(
    rude || simulator ? 35 : saidOrient ? 84 : 62,
    proCorrect,
    proWrong,
  );

  const reportCorrect = [
    ...grammarCorrect,
    ...priceCorrect,
    ...negoCorrect,
    ...proCorrect,
    ...evidence,
  ].slice(0, 6);
  const reportIncorrect = [
    ...grammarWrong,
    ...priceWrong,
    ...negoWrong,
    ...proWrong,
    ...missing.map((x) => `Aún no está cerrado: ${x}.`),
  ].slice(0, 6);

  return {
    sessionId,
    overallScore: overallFromParts({
      spanishGrammar: grammar.score,
      priceReasonableness: price.score,
      negotiationSkill: negotiation.score,
      professionalism: professionalism.score,
      achieved,
      missingCount: missing.length,
    }),
    spanishGrammar: grammar,
    priceReasonableness: price,
    negotiationSkill: negotiation,
    professionalism: professionalism,
    goalAchieved: { achieved, evidence, missing },
    report: {
      summary: achieved
        ? "Cerraste los cuatro objetivos. Revisa abajo los matices: hay aciertos claros y puntos que aún puedes pulir."
        : "Hay cosas bien hechas, pero el cierre no está completo. Mira la lista de errores y lo que falta confirmar con el influencer.",
      correct: reportCorrect,
      incorrect: reportIncorrect,
    },
    createdAt: new Date().toISOString(),
  };
}
