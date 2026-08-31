export type QuickReply = {
  slash: string;
  aliases: string[];
  title: string;
  hint: string;
  body: string;
};

export const QUICK_REPLIES: QuickReply[] = [
  {
    slash: "proceso",
    aliases: ["colaboracion", "collab", "proceso"],
    title: "Proceso de colaboración",
    hint: "Explica el flujo en 4 pasos",
    body: `Te cuento rápido el proceso de colaboración:

1. Grabamos en el restaurante (cena invitada)
2. Tú haces 1 reel + stories
3. Nos pasas el contenido para revisar antes de publicar
4. Publicación y pago por transferencia, con factura

¿Te encaja?`,
  },
  {
    slash: "hola",
    aliases: ["saludo", "presentacion"],
    title: "Saludo + Orient",
    hint: "Primera respuesta",
    body: "Hola! Qué tal, soy de Orient Marketing 😊",
  },
  {
    slash: "ig",
    aliases: ["instagram", "perfil"],
    title: "Pedir Instagram",
    hint: "Antes de hablar de precio",
    body: "Genial. ¿Me pasas tu Instagram para ver tu estilo?",
  },
  {
    slash: "ejemplos",
    aliases: ["reels", "reel"],
    title: "Pedir ejemplos",
    hint: "Reels de restoranes o marcas",
    body: "Perfecto. ¿Me puedes mandar un par de reels de colaboraciones con restaurantes o comida?",
  },
  {
    slash: "alcance",
    aliases: ["pack", "piezas"],
    title: "Cerrar alcance",
    hint: "Vídeos, stories y cena",
    body: "Para esta collab serían 1 reel + 3 stories, cena invitada. ¿Te encaja ese formato?",
  },
  {
    slash: "tarifa",
    aliases: ["precio", "rate"],
    title: "Preguntar tarifa",
    hint: "Nunca ofertes a ciegas",
    body: "Para 1 reel + 3 stories y cena invitada, ¿cuál es tu tarifa?",
  },
  {
    slash: "contra",
    aliases: ["contraoferta", "descuento"],
    title: "Contraoferta",
    hint: "Bajar precio justificando pack",
    body: "¿Podríamos dejarlo un poco más ajustado si lo hacemos en 1 reel + 2 stories, cena invitada igual?",
  },
  {
    slash: "restaurante",
    aliases: ["local", "sitio"],
    title: "Proponer restaurante",
    hint: "Nombre concreto del local",
    body: "El local sería Casa Paco, en Malasaña. ¿Te encaja grabar ahí?",
  },
  {
    slash: "fecha",
    aliases: ["dia", "grabacion"],
    title: "Proponer fecha",
    hint: "Día y hora",
    body: "¿Te va el jueves 12 a las 13:30 para grabar?",
  },
  {
    slash: "pago",
    aliases: ["factura", "transferencia"],
    title: "Forma de pago",
    hint: "Cerrar el cuarto objetivo",
    body: "Pago por transferencia a 7 días, con factura. ¿Te va bien?",
  },
  {
    slash: "cierre",
    aliases: ["resumen", "ok"],
    title: "Resumen de cierre",
    hint: "Repasa los 4 objetivos",
    body: `Quedamos entonces:
- Precio en EUR el que hemos acordado
- Restaurante concreto
- Fecha de grabación
- Pago por transferencia con factura

¿Lo damos por cerrado?`,
  },
];

export function slashQuery(text: string): { start: number; query: string } | null {
  const match = text.match(/(^|[\s])(\/[^\s]*)$/);
  if (!match || match.index === undefined) return null;
  const start = match.index + match[1].length;
  return { start, query: match[2].slice(1).toLowerCase() };
}

export function matchQuickReplies(query: string): QuickReply[] {
  const q = query.trim().toLowerCase();
  if (!q) return QUICK_REPLIES;
  return QUICK_REPLIES.filter((item) => {
    const hay = [item.slash, item.title, item.hint, ...item.aliases]
      .join(" ")
      .toLowerCase();
    return item.slash.startsWith(q) || item.aliases.some((a) => a.startsWith(q)) || hay.includes(q);
  });
}
