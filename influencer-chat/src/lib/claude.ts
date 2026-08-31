import Anthropic from "@anthropic-ai/sdk";
import { ChatMessage, EvaluationResult, Influencer } from "@/lib/types";
import { ContactOrigin, originBrief } from "@/lib/contact-origin";
import { WHATSAPP_STYLE_EXAMPLES } from "@/lib/style-examples";
import { EVALUATION_RUBRIC_ES, overallFromParts } from "@/lib/scoring-rubric";
import { evaluateConversation } from "@/lib/evaluation";
import { normalizeDimension } from "@/lib/eval-feedback";
import { mockOpeningReplies, mockInfluencerReplies } from "@/lib/mock-llm";

function client() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

function modelName() {
  return process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
}

function parseMessageList(text: string): string[] {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as { messages?: unknown } | unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { messages?: unknown }).messages)
        ? (parsed as { messages: unknown[] }).messages
        : null;
    if (list) {
      return list
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .slice(0, 3);
    }
  } catch {
    // fall through
  }
  return cleaned
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function personaBlock(influencer: Influencer) {
  return `
Identidad (privada, el alumno no debe ver este bloque):
- Nombre: ${influencer.name}
- Handle: ${influencer.handle}
- Instagram: ${influencer.instagramUrl || `https://www.instagram.com/${influencer.handle.replace(/^@/, "")}`}
- Tu tarifa interna de referencia: ${influencer.avgPriceEur} EUR por colaboración de restaurante.
- ${influencer.personaPrompt}

Reglas de precio:
- TÚ decides y dices la tarifa cuando te la pregunten. No esperes a que Orient te ofrezca un número primero.
- Puedes redondear un poco (${Math.round(influencer.avgPriceEur * 0.9)}–${Math.round(influencer.avgPriceEur * 1.15)} EUR) según el alcance.
- NO menciones el precio en el saludo ni en el primer mensaje.
- Nunca digas que eres una IA, ni "según la base de datos", ni "mi tarifa interna".

Instagram:
- Si piden perfil, insights, ejemplos o "tu cuenta", envía el enlace de Instagram en una burbuja propia.

Conversación:
- Empieza SIEMPRE de cero. No hay colaboración anterior.
- El alumno interpreta a Orient Marketing (cadena de restaurantes asiáticos en España).
- Objetivos que Orient intentará cerrar: precio, restaurante, fecha de grabación, forma de pago.
`.trim();
}

async function completeJson(system: string, user: string) {
  const anthropic = client();
  if (!anthropic) return null;
  const res = await anthropic.messages.create({
    model: modelName(),
    max_tokens: 500,
    system,
    messages: [{ role: "user", content: user }],
  });
  const text = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();
  return text || null;
}

export async function generateOpeningReplies(
  influencer: Influencer,
  origin: ContactOrigin,
): Promise<string[]> {
  try {
    const text = await completeJson(
      `Eres un influencer real hablando por WhatsApp. ${WHATSAPP_STYLE_EXAMPLES}
Responde SOLO con JSON: {"messages":["..."]}`,
      `${personaBlock(influencer)}

${originBrief(origin, influencer.name)}

Escribe 1-3 burbujas de apertura. Nada de precio todavía.`,
    );
    const msgs = text ? parseMessageList(text) : [];
    if (msgs.length) return msgs;
  } catch (err) {
    console.error("Claude opening failed", err);
  }
  return mockOpeningReplies(influencer, origin);
}

export async function generateInfluencerReplies(
  influencer: Influencer,
  origin: ContactOrigin,
  history: ChatMessage[],
  userMessage: string,
): Promise<string[]> {
  try {
    const transcript = history
      .slice(-16)
      .map((m) => `${m.role === "user" ? "Orient" : influencer.name}: ${m.content}`)
      .join("\n");
    const text = await completeJson(
      `Eres el influencer en un WhatsApp. ${WHATSAPP_STYLE_EXAMPLES}
Responde SOLO con JSON: {"messages":["..."]}`,
      `${personaBlock(influencer)}

Contexto de cómo empezó el chat:
${originBrief(origin, influencer.name)}

Historial:
${transcript || "(sin historial)"}

Último mensaje de Orient:
${userMessage}

Responde ahora en 1-3 burbujas.`,
    );
    const msgs = text ? parseMessageList(text) : [];
    if (msgs.length) return msgs;
  } catch (err) {
    console.error("Claude reply failed", err);
  }
  return mockInfluencerReplies(influencer, history, userMessage);
}

export async function evaluateWithClaude(
  sessionId: string,
  influencer: Influencer | undefined,
  messages: ChatMessage[],
): Promise<EvaluationResult> {
  const fallback = () => evaluateConversation(sessionId, messages);
  const anthropic = client();
  if (!anthropic) return fallback();

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Alumno/Orient" : "Influencer"}: ${m.content}`)
    .join("\n");

  try {
    const res = await anthropic.messages.create({
      model: modelName(),
      max_tokens: 1600,
      system: `${EVALUATION_RUBRIC_ES}

Devuelve SOLO JSON válido:
{
  "spanishGrammar": {"score":0-100,"correct":["acierto con cita"],"incorrect":["error con cita y corrección"]},
  "priceReasonableness": {"score":0-100,"correct":["..."],"incorrect":["..."]},
  "negotiationSkill": {"score":0-100,"correct":["..."],"incorrect":["..."]},
  "professionalism": {"score":0-100,"correct":["..."],"incorrect":["..."]},
  "goalAchieved": {"achieved":true/false,"evidence":["lo que sí se cerró"],"missing":["precio / restaurante / fecha / pago"]},
  "report": {
    "summary": "2-3 frases para la alumna",
    "correct": ["lo que hizo bien, concreto"],
    "incorrect": ["lo que está mal o falta, y cómo mejorarlo"]
  }
}`,
      messages: [
        {
          role: "user",
          content: `Influencer: ${influencer?.name ?? "desconocido"} (${influencer?.handle ?? ""})
Tarifa real de referencia (no la vio el alumno): ${influencer?.avgPriceEur ?? "?"} EUR

Transcripción:
${transcript}`,
        },
      ],
    });
    const text = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(text) as EvaluationResult;
    const missingCount = parsed.goalAchieved?.missing?.length ?? 0;
    const achieved = Boolean(parsed.goalAchieved?.achieved) && missingCount === 0;
    const spanishGrammar = normalizeDimension(parsed.spanishGrammar);
    const priceReasonableness = normalizeDimension(parsed.priceReasonableness);
    const negotiationSkill = normalizeDimension(parsed.negotiationSkill);
    const professionalism = normalizeDimension(parsed.professionalism);
    return {
      sessionId,
      overallScore: overallFromParts({
        spanishGrammar: spanishGrammar.score,
        priceReasonableness: priceReasonableness.score,
        negotiationSkill: negotiationSkill.score,
        professionalism: professionalism.score,
        achieved,
        missingCount,
      }),
      spanishGrammar,
      priceReasonableness,
      negotiationSkill,
      professionalism,
      goalAchieved: {
        achieved,
        evidence: parsed.goalAchieved?.evidence ?? [],
        missing: parsed.goalAchieved?.missing ?? [],
      },
      report: {
        summary: parsed.report?.summary ?? "",
        correct: parsed.report?.correct ?? [],
        incorrect: parsed.report?.incorrect ?? [],
      },
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Claude evaluation failed", err);
    return fallback();
  }
}
