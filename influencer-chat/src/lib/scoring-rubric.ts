export const SCORE_WEIGHTS = {
  spanishGrammar: 0.2,
  priceReasonableness: 0.25,
  negotiationSkill: 0.25,
  professionalism: 0.15,
  goalAchieved: 0.15,
} as const;

export const TRAINING_GOALS = [
  "precio acordado (EUR)",
  "restaurante concreto",
  "fecha de grabación",
  "forma de pago",
] as const;

export const EVALUATION_RUBRIC_ES = `
Eres formador interno de Orient Marketing. Evalúa SOLO los mensajes del ALUMNO (rol Orient).
El influencer es un simulador. No penalices al alumno por lo que diga el influencer.

## Objetivos de la práctica (deben quedar cerrados al final)
1. Precio en EUR
2. Restaurante concreto
3. Fecha de grabación
4. Forma de pago (factura, transferencia, anticipo, etc.)

## Dimensiones (0-100)

### 1) Gramática en español (peso 20%)
90-100: español de España natural, casi sin errores.
70-89: comprensible, errores menores de concordancia o preposiciones.
50-69: varios errores que restan profesionalidad.
0-49: difícil de entender, mezcla de idiomas o frases rotas.

### 2) Precio razonable (peso 25%)
Compara con la tarifa interna del influencer (el alumno NO la ve).
90-100: pregunta tarifa/alcance ANTES de ofertar; contraoferta dentro de ±20% o justifica bien un descuento (menos piezas, solo stories, etc.).
70-89: hay negociación de precio, pero se desvía 20-40% o se ofreció un número demasiado pronto.
50-69: acepta un precio inflado sin pelear, o tira un precio a ciegas.
0-49: no habla de dinero, o promete algo imposible.

### 3) Negociación (peso 25%)
90-100: orden correcto — saludo/presentación Orient, pedir Instagram o ejemplos, preguntar tarifa, luego restaurante, fecha y pago. Pregunta alcance (nº de vídeos, stories, cena invitada).
70-89: cubre varios puntos pero salta etapas o se deja llevar.
50-69: conversación pobre, no empuja a cerrar.
0-49: no negocia.

### 4) Profesionalismo (peso 15%)
90-100: tuteo educado, breve estilo WhatsApp, se presenta como Orient Marketing, no insulta, no menciona que es un simulador.
70-89: correcto pero frío, largo o poco claro.
50-69: tono extraño o poco corporativo.
0-49: grosero o fuera de papel.

### 5) Objetivos (peso 15%)
100 si los 4 objetivos están confirmados por ambas partes.
Resta ~25 por cada objetivo que falte.
"achieved" = true solo si los 4 están cerrados.

## Informe para el alumno
El JSON debe servir para que la alumna vea claramente QUÉ HIZO BIEN y QUÉ ESTÁ MAL.
- "correct": aciertos concretos. Cita o parafrasea SU frase. Explica por qué está bien.
- "incorrect": errores, omisiones o frases flojas. Cita SU frase si puedes, di qué falló y cómo decirlo mejor en español de WhatsApp.
- No mezcles lo bueno y lo malo en el mismo array.
- Tú (tuteo). Español de España. 2 a 4 ítems por lista. Nada genérico tipo "mejorar la comunicación".
- "report.summary": 2-3 frases de feedback global, directo y útil.

## Notas
- goalAchieved.missing: lista en español de lo que falta (precio / restaurante / fecha / pago).
- goalAchieved.evidence: hechos que sí se cerraron.
`.trim();

export function overallFromParts(input: {
  spanishGrammar: number;
  priceReasonableness: number;
  negotiationSkill: number;
  professionalism: number;
  achieved: boolean;
  missingCount: number;
}) {
  const goalScore = input.achieved
    ? 100
    : Math.max(0, 100 - input.missingCount * 25);
  const raw =
    input.spanishGrammar * SCORE_WEIGHTS.spanishGrammar +
    input.priceReasonableness * SCORE_WEIGHTS.priceReasonableness +
    input.negotiationSkill * SCORE_WEIGHTS.negotiationSkill +
    input.professionalism * SCORE_WEIGHTS.professionalism +
    goalScore * SCORE_WEIGHTS.goalAchieved;
  return Math.max(0, Math.min(100, Math.round(raw)));
}
