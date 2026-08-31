import { AcademyUnit } from "./types";

export const ACADEMY_UNITS: AcademyUnit[] = [
  {
    id: "ritmo-whatsapp",
    order: 1,
    title: "Ritmo de WhatsApp profesional",
    subtitle: "Burbujas cortas, tuteo y español de España. No escribas un email.",
    minutes: 18,
    activities: [
      {
        type: "tutorial",
        id: "ritmo-teoria",
        title: "Cómo se escribe en este canal",
        minutes: 7,
        goal: "Imitar el ritmo real de Orient × influencers, no el de un correo corporativo.",
        sections: [
          {
            heading: "Qué evalúa esta unidad",
            body: "En la simulación te puntúan gramática, profesionalidad y negociación. Antes de hablar de precio, tienes que sonar como un comercial de Orient en WhatsApp: cercano, breve y claro.",
            bullets: [
              "Tuteo educado (tú), nunca un tuteo grosero ni un usted frío de banco.",
              "1 a 3 burbujas cortas. Si cabe en dos mensajes, no lo juntas en un párrafo.",
              "Español de España: vale, tío no; mejor «perfecto», «genial», «te parece».",
              "Emojis de vez en cuando, no en todas las burbujas.",
            ],
          },
          {
            heading: "El influencer suele escribir primero",
            body: "En muchos chats reales el influencer manda el saludo y su Instagram en una burbuja aparte. Tú no sueltas la tarifa ni el briefing de golpe.",
            bubbles: [
              {
                role: "influencer",
                text: "Hola Vicente buenas tardes qué tal ?",
                note: "Saludo informal. Responde al mismo registro.",
              },
              {
                role: "influencer",
                text: "Soy Daniela Fernández",
              },
              {
                role: "influencer",
                text: "https://www.instagram.com/danie1405",
                note: "El enlace va solo. Si pides ejemplos, también en burbuja propia.",
              },
              {
                role: "orient",
                text: "Hola Daniela, qué tal! Soy Vicente de Orient Marketing",
                note: "Preséntate con nombre + empresa en la primera respuesta.",
              },
            ],
          },
          {
            heading: "Errores que bajan profesionalidad",
            body: "No digas que es un simulador. No escribas en chino ni mezcles idiomas. No mandes un bloque de 12 líneas con precio, restaurante, fecha y pago a la vez.",
            bullets: [
              "Mal: un email con «Estimada», adjuntos imaginarios y firma larga.",
              "Mal: «can you send your rate pls».",
              "Bien: preguntas de una en una, como en un chat de verdad.",
            ],
          },
        ],
      },
      {
        type: "drill",
        id: "ritmo-practica",
        title: "Elige el mensaje correcto",
        minutes: 8,
        intro: "Marca la opción que encaja con un WhatsApp de Orient. Hay explicación después de cada respuesta.",
        items: [
          {
            kind: "choice",
            prompt: "Un influencer te saluda con «Hola qué tal?». ¿Cómo respondes?",
            options: [
              "Estimada/o, adjunto nuestra propuesta de colaboración y condiciones generales.",
              "Hola! Qué tal, soy Ana de Orient Marketing 😊",
              "Hello!! Rate please??",
            ],
            answer: 1,
            why: "Mismo registro, presentación corta y empresa. El correo formal suena a otro canal.",
          },
          {
            kind: "choice",
            prompt: "¿Cuántas ideas debería llevar cada burbuja?",
            options: [
              "Todas: precio, fecha, restaurante y pago en un solo mensaje.",
              "Una idea principal; como mucho dos si están muy ligadas.",
              "Da igual, cuanto más largo más profesional.",
            ],
            answer: 1,
            why: "El ritmo real es 1–3 burbujas cortas. El bloque largo parece email y se evalúa peor.",
          },
          {
            kind: "order",
            prompt: "Ordena el arranque correcto de un chat.",
            items: [
              "Saludar y presentarte (nombre + Orient Marketing)",
              "Pedir Instagram o ejemplos de contenido",
              "Preguntar tarifa y alcance",
              "Hablar de restaurante, fecha y pago",
            ],
            why: "La rúbrica premia este orden. Ofertar precio antes de pedir tarifa resta puntos.",
          },
          {
            kind: "fill",
            prompt: "Completa el estilo de Orient.",
            before: "En WhatsApp usamos",
            after: "educado, no un usted de oficina.",
            options: ["tuteo", "lenguaje jurídico", "inglés"],
            answer: 0,
            why: "Tuteo educado es el estándar de los chats reales de Orient.",
          },
          {
            kind: "tap",
            context: "El influencer acaba de mandar su Instagram.",
            bubbles: [
              { role: "influencer", text: "este es mi Instagram:" },
              { role: "influencer", text: "https://www.instagram.com/unvzlanoenespana" },
            ],
            options: [
              "Perfecto, te paso ya 400€ y el sábado grabamos",
              "Genial, gracias. ¿Me puedes mandar un par de reels de colaboraciones?",
              "No necesito ver nada, dime precio",
            ],
            answer: 1,
            why: "Pides ejemplos antes de dinero. Lanzar un número a ciegas penaliza «precio razonable».",
          },
          {
            kind: "choice",
            prompt: "¿Qué no debes mencionar nunca en la simulación?",
            options: [
              "Que eres de Orient Marketing",
              "Que esto es un simulador o un examen",
              "Que quieres ver su Instagram",
            ],
            answer: 1,
            why: "Romper el papel baja profesionalidad. Trabaja como si el chat fuera real.",
          },
        ],
      },
    ],
  },
  {
    id: "primer-contacto",
    order: 2,
    title: "Primer contacto y presentación",
    subtitle: "Quién eres, de qué empresa, y por qué escribes. Sin briefing de golpe.",
    minutes: 16,
    activities: [
      {
        type: "tutorial",
        id: "contacto-teoria",
        title: "Tres orígenes de chat",
        minutes: 6,
        goal: "Reconocer inbound, referido e Instagram DM, y adaptar la primera frase.",
        sections: [
          {
            heading: "Inbound: el influencer pide colaborar",
            body: "Te escribe él. Agradece, preséntate y pregunta alcance. No sueltes un precio inventado.",
            bubbles: [
              {
                role: "influencer",
                text: "Hola Vicente! Mi nombre es Rodrigo... me encantaría poder empezar a colaborar",
              },
              {
                role: "orient",
                text: "Hola Rodrigo! Encantado, soy Vicente de Orient Marketing. Cuéntame un poco qué tipo de contenido haces",
              },
            ],
          },
          {
            heading: "Referido: te lo manda un amigo",
            body: "Nombra a la persona que os ha puesto en contacto. Da confianza sin alargar.",
            bubbles: [
              {
                role: "influencer",
                text: "Buenos días Vicente, soy Eusebio, tu contacto me lo ha enviado Roberto...",
              },
              {
                role: "orient",
                text: "Hola Eusebio! Sí, Roberto me habló de ti. Encantado",
              },
            ],
          },
          {
            heading: "Qué debe quedar claro en los primeros minutos",
            body: "Nombre, empresa (Orient Marketing), que buscáis colaboración UGC / visita a restaurante, y que quieres ver su perfil. Todavía no cierras precio.",
            bullets: [
              "Bien: «buscamos creadores para grabar en un restaurante».",
              "Mal: copiar un contrato en el chat.",
            ],
          },
        ],
      },
      {
        type: "guided",
        id: "contacto-guiado",
        title: "Escribe tu primera respuesta",
        minutes: 6,
        intro: "Te llega el primer mensaje. Redacta tú la burbuja. Hace falta nombre o empresa Orient, y un saludo natural.",
        steps: [
          {
            id: "g1",
            situation: "Chat inbound. No te conoce.",
            incoming: [
              {
                role: "influencer",
                text: "Hola! Me encantaría colaborar con vosotros, soy Marta",
              },
            ],
            task: "Saluda, preséntate (nombre + Orient Marketing) y pide un dato de su contenido o Instagram.",
            hint: "Una o dos frases. Incluye «Orient».",
            keywords: ["orient", "hola"],
            modelAnswer:
              "Hola Marta! Soy Ana de Orient Marketing, encantada. ¿Me pasas tu Instagram para ver tu estilo?",
            explanation:
              "Saludo + empresa + siguiente paso (perfil). No hables de dinero todavía.",
          },
          {
            id: "g2",
            situation: "Referido. Ya han citado a un compañero.",
            incoming: [
              {
                role: "influencer",
                text: "Hola, te escribo porque Carlos me ha pasado tu WhatsApp",
              },
            ],
            task: "Reconoce el referido y preséntate sin repetir un discurso largo.",
            hint: "Nombra a Carlos y a Orient.",
            keywords: ["carlos", "orient"],
            modelAnswer:
              "Hola! Sí, Carlos me comentó. Soy Ana de Orient Marketing, encantada. ¿Qué tipo de vídeos sueles hacer?",
            explanation:
              "El referido se valida en una línea. Luego preguntas de contenido, no de tarifa aún.",
          },
        ],
      },
      {
        type: "drill",
        id: "contacto-quiz",
        title: "Primeras frases",
        minutes: 4,
        intro: "Elige la apertura más profesional.",
        items: [
          {
            kind: "choice",
            prompt: "¿Qué falta si solo dices «Hola, dime precio»?",
            options: [
              "Nada, es directo y se valora",
              "Presentación de Orient y contexto de la colaboración",
              "Un emoji obligatorio",
            ],
            answer: 1,
            why: "Sin presentación pareces un desconocido pidiendo dinero. La rúbrica mira el orden: saludo/Orient primero.",
          },
          {
            kind: "tap",
            context: "Acaban de saludarte por la tarde.",
            bubbles: [{ role: "influencer", text: "Hola buenas tardes qué tal?" }],
            options: [
              "Buenas tardes, ¿cuál es su tarifa corporativa IVA incluido?",
              "Hola! Qué tal, soy Carlos de Orient Marketing",
              "Ya te asigné un restaurante, confirma asistencia",
            ],
            answer: 1,
            why: "Mismo saludo + identidad. El usted y el IVA de entrada suenan a factura, no a WhatsApp.",
          },
        ],
      },
    ],
  },
  {
    id: "atajos-plantillas",
    order: 3,
    title: "Atajos / como en WhatsApp",
    subtitle: "Escribe / y pega plantillas: proceso de colaboración, tarifa, fecha, pago.",
    minutes: 12,
    practiceCta: true,
    activities: [
      {
        type: "tutorial",
        id: "atajos-teoria",
        title: "Cómo usar los atajos en el chat",
        minutes: 6,
        goal: "No reinventar cada burbuja: usa plantillas y luego ajústalas al influencer.",
        sections: [
          {
            heading: "Escribe / en el cuadro de mensaje",
            body: "En el WhatsApp de formación, el campo de texto funciona como WhatsApp Business: escribes una barra / y aparece la lista de atajos. Flechas para elegir, Enter para pegar, luego editas y envías.",
            bullets: [
              "/proceso — proceso de colaboración (grabación, contenido, revisión, pago)",
              "/hola — saludo + Orient Marketing",
              "/ig y /ejemplos — Instagram y reels",
              "/alcance — 1 reel + stories + cena",
              "/tarifa — preguntar precio del pack",
              "/contra — contraoferta justificada",
              "/restaurante /fecha /pago /cierre — los cuatro objetivos",
            ],
          },
          {
            heading: "El atajo no es un contrato",
            body: "Pegar /proceso está bien. Después acórtalo o cambia el número de stories si el trato es otro. Lo que puntúa es que el chat siga siendo corto y en tuteo, no un email pegado sin mirar.",
            bubbles: [
              {
                role: "orient",
                text: "Te cuento rápido el proceso de colaboración:",
                note: "Sale de /proceso. Puedes mandarlo en varias burbujas si queda largo.",
              },
              {
                role: "orient",
                text: "1. Grabamos en el restaurante (cena invitada)\n2. Tú haces 1 reel + stories\n3. Revisamos el contenido\n4. Pago por transferencia con factura",
              },
              {
                role: "influencer",
                text: "ok perfecto",
              },
            ],
          },
          {
            heading: "Orden recomendado",
            body: "No empieces por /proceso si aún no te has presentado. Primero /hola, luego /ig o /ejemplos, /alcance, /tarifa, y al final restaurante, fecha y pago.",
          },
        ],
      },
      {
        type: "drill",
        id: "atajos-quiz",
        title: "Qué atajo usas",
        minutes: 6,
        intro: "Elige el comando correcto. En el chat real lo escribes con /.",
        items: [
          {
            kind: "choice",
            prompt: "Quieres explicar grabación, contenido, revisión y pago de una vez. ¿Qué escribes?",
            options: ["/hola", "/proceso", "/contra"],
            answer: 1,
            why: "/proceso (o /colaboracion) pega la plantilla del flujo de colaboración.",
          },
          {
            kind: "choice",
            prompt: "Aún no sabes su tarifa. ¿Qué atajo NO debes usar primero?",
            options: [
              "/tarifa después de fijar el pack",
              "/cierre con precio, fecha y pago inventados",
              "/ig para ver el perfil",
            ],
            answer: 1,
            why: "El cierre va al final, cuando los cuatro objetivos son reales. Inventar un resumen resta puntos.",
          },
          {
            kind: "order",
            prompt: "Orden típico de atajos en un chat inbound.",
            items: [
              "/hola",
              "/ig o /ejemplos",
              "/alcance y /tarifa",
              "/restaurante, /fecha y /pago",
            ],
            why: "Misma cadena que la rúbrica. /proceso puedes meterlo cuando expliques el flujo, no en el segundo 1.",
          },
          {
            kind: "fill",
            prompt: "Para abrir la lista de plantillas escribes",
            before: "el símbolo",
            after: "en el cuadro de mensaje.",
            options: ["/", "#", "@"],
            answer: 0,
            why: "Igual que los atajos de WhatsApp: una barra /.",
          },
        ],
      },
    ],
  },
  {
    id: "instagram-alcance",
    order: 4,
    title: "Instagram, ejemplos y alcance",
    subtitle: "Pide perfil, reels y número de piezas antes de hablar de euros.",
    minutes: 16,
    activities: [
      {
        type: "tutorial",
        id: "ig-teoria",
        title: "Qué preguntar antes del precio",
        minutes: 6,
        goal: "Dejar cerrado el alcance: vídeos, stories, cena invitada, derechos.",
        sections: [
          {
            heading: "Por qué esto sube la nota de negociación",
            body: "La rúbrica quiere: pedir Instagram o ejemplos, y preguntar alcance (nº de vídeos, stories, cena). Si ofreces un número sin saber qué incluye, el precio no se puede defender.",
            bullets: [
              "Instagram / TikTok en burbuja aparte si te lo mandan ellos.",
              "«¿Me pasas un par de colaboraciones con restaurantes?»",
              "«¿Cuántos vídeos y cuántas stories entrarían?»",
              "«¿La cena la cubrimos nosotros, verdad?»",
            ],
          },
          {
            heading: "Ejemplo bueno",
            bubbles: [
              { role: "orient", text: "Genial el perfil. ¿Tienes algún reel de restoranes o marcas de comida?" },
              { role: "influencer", text: "Sí claro te envío enlaces" },
              { role: "influencer", text: "https://www.instagram.com/reel/ejemplo" },
              { role: "orient", text: "Perfecto. Para esta collab serían 1 reel + 3 stories, cena invitada. ¿Te encaja?" },
            ],
          },
        ],
      },
      {
        type: "case",
        id: "ig-caso-bueno",
        title: "Caso: pide ejemplos y luego alcance",
        minutes: 5,
        verdict: "good",
        setup: "Inbound. El influencer quiere colaborar. El alumno no habla de dinero hasta ver el perfil.",
        messages: [
          { role: "influencer", text: "Hola! Quiero colaborar con vuestros restaurantes" },
          { role: "orient", text: "Hola! Soy Ana de Orient Marketing. ¿Me pasas Instagram?" },
          { role: "influencer", text: "https://www.instagram.com/marta.come" },
          {
            role: "orient",
            text: "Gracias. ¿Me mandas un reel de una collab parecida?",
            note: "Pide prueba de trabajo, no asume calidad.",
          },
          { role: "influencer", text: "Sí! este:" },
          { role: "influencer", text: "https://www.instagram.com/reel/xxxx" },
          {
            role: "orient",
            text: "Muy bien. Sería 1 vídeo en el local + 2 stories. Cena por nuestra cuenta. ¿Tu tarifa para eso?",
            note: "Alcance cerrado ANTES de pedir tarifa.",
          },
        ],
        takeaways: [
          "Instagram → ejemplos → alcance → tarifa. Ese orden es el que puntúa.",
          "La cena invitada se menciona; evita sorpresas el día de grabación.",
        ],
      },
      {
        type: "drill",
        id: "ig-quiz",
        title: "Alcance antes que euros",
        minutes: 5,
        intro: "Si el alcance no está claro, cualquier precio es un disparo a ciegas.",
        items: [
          {
            kind: "choice",
            prompt: "El influencer dice «mi tarifa es 600». Aún no has hablado de piezas. ¿Qué haces?",
            options: [
              "Aceptas 600 para no perder el trato",
              "Preguntas qué incluye (reels, stories, cena, usos)",
              "Ofreces 150 sin explicar nada",
            ],
            answer: 1,
            why: "600 puede ser por un pack enorme. Sin alcance no hay precio razonable.",
          },
          {
            kind: "order",
            prompt: "Ordena estas preguntas.",
            items: [
              "Ver Instagram o ejemplos",
              "Cerrar nº de vídeos / stories / cena",
              "Preguntar tarifa para ese alcance",
              "Contraofertar si hace falta",
            ],
            why: "Tarifa y contraoferta van después del alcance.",
          },
          {
            kind: "fill",
            prompt: "Una pregunta útil de alcance:",
            before: "¿Cuántos",
            after: "entrarían en la collab?",
            options: ["emails", "vídeos", "contratos"],
            answer: 1,
            why: "El número de vídeos (y stories) define el precio.",
          },
        ],
      },
    ],
  },
  {
    id: "tarifas",
    order: 5,
    title: "Preguntar tarifa, no inventar precio",
    subtitle: "Nunca sueltes un número antes de oír el suyo o de acotar el pack.",
    minutes: 18,
    activities: [
      {
        type: "tutorial",
        id: "tarifa-teoria",
        title: "La regla de oro del precio",
        minutes: 6,
        goal: "Preguntar tarifa/alcance ANTES de ofertar. Compararás después con la tarifa interna (tú no la ves).",
        sections: [
          {
            heading: "Qué quiere la rúbrica",
            body: "90–100 en precio: preguntas tarifa y alcance antes de ofertar; la contraoferta queda cerca (±20%) o justificas un descuento (menos piezas, solo stories).",
            bullets: [
              "«¿Cuál es tu tarifa para 1 reel + 3 stories, cena incluida?»",
              "Si tira un número inflado, no aceptes en silencio.",
              "No prometas algo imposible (viajes, exclusividad eterna, 20 vídeos a 50€).",
            ],
          },
          {
            heading: "Frase modelo",
            bubbles: [
              {
                role: "orient",
                text: "Para este pack (1 vídeo + 2 stories, cena invitada), ¿cuál es tu tarifa?",
              },
            ],
          },
        ],
      },
      {
        type: "case",
        id: "tarifa-caso-malo",
        title: "Caso: ofertar a ciegas",
        minutes: 5,
        verdict: "bad",
        setup: "El alumno tiene prisa por cerrar. Lanza 80€ sin ver el perfil ni preguntar tarifa.",
        messages: [
          { role: "influencer", text: "Hola! Soy Laura, hago food content" },
          {
            role: "orient",
            text: "Hola Laura, te pago 80€ y grabamos mañana",
            note: "Error grave: número demasiado pronto y fecha sin negociar.",
          },
          { role: "influencer", text: "Mi tarifa mínima son 450€ 😅" },
          {
            role: "orient",
            text: "Ok 450",
            note: "Acepta inflado sin pelear ni recortar alcance. Baja «precio razonable».",
          },
        ],
        takeaways: [
          "El primer número del alumno ancla mal la negociación.",
          "Si te corrigen al alza, no te rindas: reduce piezas o pide desglose.",
        ],
      },
      {
        type: "guided",
        id: "tarifa-guiado",
        title: "Pide la tarifa con el pack encima de la mesa",
        minutes: 7,
        intro: "Ya viste el Instagram. Ahora tienes que preguntar dinero sin ofertar tú primero.",
        steps: [
          {
            id: "t1",
            situation: "Alcance ya propuesto: 1 reel y 3 stories, cena invitada.",
            incoming: [{ role: "influencer", text: "Sí, ese formato lo hago mucho" }],
            task: "Pregunta su tarifa para ESE pack. No ofrezcas un euro todavía.",
            hint: "Usa las palabras tarifa o precio, y menciona el pack.",
            keywords: ["tarifa"],
            modelAnswer:
              "Perfecto. Para 1 reel + 3 stories y cena invitada, ¿cuál es tu tarifa?",
            explanation:
              "El pack va en la misma pregunta para que el número sea comparable.",
          },
          {
            id: "t2",
            situation: "Te dice 500€ y te parece alto. Aún no aceptes.",
            incoming: [{ role: "influencer", text: "Para eso pido 500€" }],
            task: "Pide desglose o propone recortar piezas. Menciona un recorte o «incluye».",
            hint: "Pregunta qué incluye, o baja a 1 reel sin stories.",
            keywords: ["incluye"],
            modelAnswer:
              "¿Los 500 incluyen stories y cena, o es solo el vídeo? Si hacemos solo 1 reel sin stories igual nos encaja mejor.",
            explanation:
              "No hace falta soltar otro número aún. Primero entiendes el pack o lo reduces.",
          },
        ],
      },
    ],
  },
  {
    id: "contraoferta",
    order: 6,
    title: "Contraoferta y justificación",
    subtitle: "Muévete cerca de su tarifa o cambia el alcance. No regatees a lo loco.",
    minutes: 16,
    practiceCta: true,
    activities: [
      {
        type: "tutorial",
        id: "contra-teoria",
        title: "Cómo pelear el precio sin romper el trato",
        minutes: 6,
        goal: "Quedarte en una banda creíble (±20%) o justificar el descuento.",
        sections: [
          {
            heading: "Tres palancas",
            body: "Si no puedes pagar lo que pide, no inventes un «presupuesto máximo» agresivo sin recortar trabajo.",
            bullets: [
              "Menos piezas (solo reel, sin stories).",
              "Sin exclusividad / menos usos de marca.",
              "Fecha flexible o menú concreto a cambio de un ajuste.",
            ],
          },
          {
            heading: "Ejemplo",
            bubbles: [
              { role: "influencer", text: "Mi tarifa son 400€" },
              {
                role: "orient",
                text: "¿Podríamos dejarlo en 320€ si hacemos 1 reel y 2 stories en vez de 4?",
                note: "Hay número + justificación. 320 está cerca de 400.",
              },
            ],
          },
          {
            heading: "Lo que resta puntos",
            bullets: [
              "Aceptar un precio inflado sin una sola pregunta.",
              "Ofrecer 50€ a alguien que pidió 400 sin cambiar el briefing.",
              "No hablar de dinero en toda la conversación.",
            ],
          },
        ],
      },
      {
        type: "guided",
        id: "contra-guiado",
        title: "Haz una contraoferta justificada",
        minutes: 6,
        intro: "Su tarifa es 400€ por 1 reel + 4 stories. Tu margen interno está más cerca de 320–350.",
        steps: [
          {
            id: "c1",
            situation: "Quieres bajar sin insultar su trabajo.",
            incoming: [{ role: "influencer", text: "Para 1 reel y 4 stories serían 400€" }],
            task: "Propón un precio entre 300 y 360 y explica el recorte de alcance o el pack.",
            hint: "Incluye un número (euros) y la palabra stories o reel.",
            keywords: ["reel", "stories"],
            match: "any",
            requireNumber: true,
            modelAnswer:
              "¿Te encajaría 330€ si lo dejamos en 1 reel + 2 stories, cena invitada igual?",
            explanation:
              "Hay cifra y hay menos trabajo. Eso es una contraoferta profesional, no un «no puedo».",
          },
        ],
      },
      {
        type: "drill",
        id: "contra-quiz",
        title: "¿Esta contraoferta vale?",
        minutes: 4,
        intro: "Piensa en la banda ±20% y en justificar el descuento.",
        items: [
          {
            kind: "choice",
            prompt: "Pide 500€. Ofreces 100€ por el mismo pack. ¿Cómo se evalúa?",
            options: [
              "Bien, hay que ser duro",
              "Mal: demasiado lejos y sin recortar alcance",
              "Da igual el número",
            ],
            answer: 1,
            why: "100 vs 500 se desvía mucho más de un 20–40%. O recortas piezas o te acercas.",
          },
          {
            kind: "choice",
            prompt: "Pide 300€. Ofreces 260€ porque quitas 2 stories. ¿Cómo se evalúa?",
            options: [
              "Bien: cerca y justificado",
              "Mal: nunca se baja",
              "Mal: hay que aceptar 300 siempre",
            ],
            answer: 0,
            why: "260 está cerca de 300 y hay menos deliverables. Encaja en la rúbrica alta.",
          },
          {
            kind: "tap",
            context: "El influencer se planta.",
            bubbles: [{ role: "influencer", text: "Por menos de 400 no me sale" }],
            options: [
              "Vale 400, lo que sea, no pregunto qué incluye",
              "Entendido. Entonces cerramos 400 con 1 reel + 3 stories y cena, ¿sí?",
              "Eres muy caro, adiós",
            ],
            answer: 1,
            why: "Puedes aceptar si el pack queda claro. Aceptar a ciegas o insultar resta.",
          },
        ],
      },
    ],
  },
  {
    id: "cerrar-objetivos",
    order: 7,
    title: "Cerrar los 4 objetivos",
    subtitle: "Precio en EUR, restaurante concreto, fecha de grabación y forma de pago.",
    minutes: 20,
    practiceCta: true,
    activities: [
      {
        type: "tutorial",
        id: "objetivos-teoria",
        title: "La lista que no puedes dejar a medias",
        minutes: 7,
        goal: "Al terminar el chat, las dos partes han confirmado los cuatro puntos.",
        sections: [
          {
            heading: "Los cuatro cierres",
            body: "La evaluación resta unos 25 puntos de objetivo por cada uno que falte. «Achieved» solo si los cuatro están cerrados.",
            bullets: [
              "Precio acordado en euros (no «ya veremos», no «barato»).",
              "Restaurante concreto (nombre del local, no «un italiano del centro»).",
              "Fecha de grabación (día, no «cuando puedas»).",
              "Forma de pago: factura, transferencia, anticipo, etc.",
            ],
          },
          {
            heading: "Cómo preguntarlos en WhatsApp",
            bubbles: [
              { role: "orient", text: "Quedamos en 320€ entonces" },
              { role: "orient", text: "El local sería Casa Paco, en Malasaña" },
              { role: "orient", text: "¿Te va el jueves 12 a las 13:30?" },
              { role: "orient", text: "Pago por transferencia a 7 días con factura, ¿ok?" },
            ],
          },
          {
            heading: "Confirmación",
            body: "No basta con que lo digas tú. El influencer tiene que aceptar («perfecto», «ok», «sí»). Si duda, reformula y cierra otra vez.",
          },
        ],
      },
      {
        type: "guided",
        id: "objetivos-guiado",
        title: "Cierra restaurante, fecha y pago",
        minutes: 8,
        intro: "El precio ya está en 320€. Faltan los otros tres objetivos. Escribe mensajes cortos.",
        steps: [
          {
            id: "o1",
            situation: "Tienes que proponer un local realista en España.",
            incoming: [{ role: "influencer", text: "Genial lo de 320€" }],
            task: "Propón un restaurante con nombre propio (no solo «un sitio»).",
            hint: "Escribe un nombre de restaurante o la palabra restaurante.",
            keywords: ["restaurante", "casa", "taberna", "bar"],
            match: "any",
            modelAnswer: "Perfecto. Grabaríamos en el restaurante Casa Paco, en Malasaña. ¿Te encaja?",
            explanation: "Tiene que ser un local concreto. «Por el centro» no cuenta como objetivo cerrado.",
          },
          {
            id: "o2",
            situation: "Aceptó el local. Falta el día.",
            incoming: [{ role: "influencer", text: "Casa Paco perfecto" }],
            task: "Propón una fecha (día y, si puedes, hora).",
            hint: "Incluye un día de la semana o una fecha.",
            keywords: [
              "lunes",
              "martes",
              "miercoles",
              "jueves",
              "viernes",
              "sabado",
              "domingo",
            ],
            match: "any",
            numberOrKeywords: true,
            modelAnswer: "¿Te va el jueves 12 a las 13:30 para grabar?",
            explanation: "Fecha concreta. «Cuando puedas» deja el objetivo abierto.",
          },
          {
            id: "o3",
            situation: "Día cerrado. Falta el dinero cómo se paga.",
            incoming: [{ role: "influencer", text: "El jueves 12 ok" }],
            task: "Propón forma de pago (factura, transferencia, anticipo…).",
            hint: "Usa factura, transferencia o anticipo.",
            keywords: ["factura", "transferencia", "anticipo", "efectivo"],
            match: "any",
            modelAnswer: "Pago por transferencia a 7 días, con factura. ¿Te va bien?",
            explanation: "Sin forma de pago el objetivo 4 queda missing.",
          },
        ],
      },
      {
        type: "drill",
        id: "objetivos-quiz",
        title: "¿Qué falta por cerrar?",
        minutes: 5,
        intro: "Lee el resumen del chat y detecta huecos.",
        items: [
          {
            kind: "choice",
            prompt: "Hay precio y fecha, el local es «un restaurante italiano». ¿Objetivo restaurante cerrado?",
            options: [
              "Sí, italiano basta",
              "No: hace falta el nombre del local",
              "Solo si hay foto",
            ],
            answer: 1,
            why: "La rúbrica pide restaurante concreto.",
          },
          {
            kind: "choice",
            prompt: "Acordáis 280€ «en metálico el mismo día» y el influencer dice ok. ¿Pago cerrado?",
            options: [
              "Sí: hay forma de pago confirmada",
              "No, solo vale transferencia",
              "No, falta IVA en el chat",
            ],
            answer: 0,
            why: "Efectivo el mismo día es una forma de pago. Lo importante es que ambas partes lo confirmen.",
          },
          {
            kind: "order",
            prompt: "Orden recomendado al final del chat (después de tarifa).",
            items: [
              "Confirmar precio en EUR",
              "Confirmar restaurante concreto",
              "Confirmar fecha de grabación",
              "Confirmar forma de pago",
            ],
            why: "Puedes variar un poco el orden, pero los cuatro tienen que existir. Este es el más limpio.",
          },
        ],
      },
    ],
  },
  {
    id: "casos-reales",
    order: 8,
    title: "Casos: inbound, referido y primer mensaje",
    subtitle: "Tres patrones reales. Compara el buen hilo con el que se descarrila.",
    minutes: 18,
    practiceCta: true,
    activities: [
      {
        type: "case",
        id: "caso-inbound",
        title: "Inbound que pide tarifa demasiado pronto",
        minutes: 6,
        verdict: "good",
        setup: "El influencer quiere colaborar y pregunta tarifa antes de que tú hayas fijado el pack. El alumno no se deja llevar.",
        messages: [
          {
            role: "influencer",
            text: "Hola Vicente! Mi nombre es Rodrigo... me encantaría colaborar. También quería preguntar tu tarifa",
            note: "En la vida real a veces preguntan ellos. Tú igual fijas alcance.",
          },
          {
            role: "orient",
            text: "Hola Rodrigo! Soy Vicente de Orient Marketing. Antes de números, ¿me pasas Instagram y me dices si haces reel + stories?",
          },
          { role: "influencer", text: "claro:" },
          { role: "influencer", text: "https://www.instagram.com/rodrigo" },
          {
            role: "orient",
            text: "Genial. Pack: 1 reel + 3 stories, cena invitada en Casa Paco. ¿Tu tarifa para eso?",
          },
          { role: "influencer", text: "350€" },
          { role: "orient", text: "¿320€ si lo dejamos en 1 reel + 2 stories?" },
          { role: "influencer", text: "ok 320" },
          { role: "orient", text: "Jueves 12 a las 14h. Transferencia a 7 días con factura, ¿sí?" },
          { role: "influencer", text: "perfecto" },
        ],
        takeaways: [
          "No contestes a «tu tarifa» con un número tuyo inventado.",
          "Reconduces a alcance y luego pides SU tarifa.",
          "Al final cierras fecha y pago en burbujas cortas.",
        ],
      },
      {
        type: "case",
        id: "caso-referido",
        title: "Referido: confianza rápida, mismo método",
        minutes: 5,
        verdict: "good",
        setup: "Un amigo os ha presentado. Eso no salta los pasos de Instagram y tarifa.",
        messages: [
          {
            role: "influencer",
            text: "Buenos días Vicente, soy Eusebio, tu contacto me lo ha enviado Roberto...",
          },
          { role: "influencer", text: "este es mi Instagram:" },
          { role: "influencer", text: "https://www.instagram.com/unvzlanoenespana" },
          {
            role: "orient",
            text: "Hola Eusebio! Sí, Roberto me habló de ti. El perfil se ve muy bien. ¿Tienes algún reel de restoranes?",
          },
          { role: "influencer", text: "Sí claro te envío enlaces" },
          {
            role: "orient",
            text: "Para 1 vídeo + 2 stories en La Taberna del Puerto, ¿tu tarifa?",
          },
        ],
        takeaways: [
          "Nombra al referente en la primera respuesta.",
          "El Instagram ya llegó: no pidas el enlace otra vez, pide ejemplos.",
        ],
      },
      {
        type: "case",
        id: "caso-primero",
        title: "Caso malo: te come el ritmo del influencer",
        minutes: 5,
        verdict: "bad",
        setup: "Daniela escribe primero y manda Instagram. El alumno se pone a cotillear y nunca negocia.",
        messages: [
          { role: "influencer", text: "Hola Vicente buenas tardes qué tal ?" },
          { role: "influencer", text: "Soy Daniela Fernández" },
          { role: "influencer", text: "https://www.instagram.com/danie1405" },
          { role: "orient", text: "Holaaa qué bonito el feed 😍😍😍" },
          { role: "orient", text: "Vivo cerca jaja" },
          { role: "influencer", text: "gracias 🥰" },
          { role: "orient", text: "Bueno hablamos otro día" },
        ],
        takeaways: [
          "Simpático no es lo mismo que negociar.",
          "Tras el Instagram debes pedir alcance o tarifa, no cerrar el chat vacío.",
        ],
      },
      {
        type: "guided",
        id: "caso-guiado-cierre",
        title: "Recupera un chat que se está yendo",
        minutes: 4,
        intro: "Has sido demasiado informal. Reescribe el siguiente mensaje para volver al método.",
        steps: [
          {
            id: "r1",
            situation: "Solo habéis hablado del feed. Cero negocio.",
            incoming: [
              { role: "influencer", text: "gracias 🥰" },
              { role: "orient", text: "Vivo cerca jaja" },
            ],
            task: "Vuelve al trabajo: pack + tarifa, sin disculparte por el simulador.",
            hint: "Menciona vídeo o stories y tarifa.",
            keywords: ["tarifa"],
            modelAnswer:
              "Oye, te comento la collab: 1 reel + 2 stories en un restaurante, cena invitada. ¿Cuál es tu tarifa para eso?",
            explanation: "Una burbuja basta para reconducir. No hace falta explicar que te has despistado.",
          },
        ],
      },
    ],
  },
  {
    id: "examen-final",
    order: 9,
    title: "Repaso y salto a la práctica real",
    subtitle: "Mezcla de gramática, orden y cierres. Luego abre el WhatsApp de formación.",
    minutes: 14,
    practiceCta: true,
    activities: [
      {
        type: "tutorial",
        id: "repaso-teoria",
        title: "Chuleta de la simulación",
        minutes: 5,
        goal: "Memorizar lo que el evaluador mirará en tu chat real.",
        sections: [
          {
            heading: "Orden",
            body: "Saludo Orient → Instagram/ejemplos → alcance → tarifa → contraoferta si hace falta → restaurante → fecha → pago.",
          },
          {
            heading: "Lengua",
            bullets: [
              "Español de España, tuteo, frases cortas.",
              "Sin mezclar inglés ni chino.",
              "Sin decir que es un simulador.",
            ],
          },
          {
            heading: "Objetivos",
            body: "Si cierras solo el precio, la nota de objetivos se queda a medias. Revisa los cuatro antes de pulsar «Cerrar y evaluar».",
          },
        ],
      },
      {
        type: "drill",
        id: "repaso-mixto",
        title: "Repaso mixto",
        minutes: 8,
        intro: "Última práctica tipo Duolingo: varias formas, misma exigencia profesional.",
        items: [
          {
            kind: "choice",
            prompt: "¿Cuándo das tu primer número?",
            options: [
              "En el saludo, para ir rápido",
              "Después de alcance y de oír su tarifa, o junto a un recorte de pack",
              "Nunca, el influencer decide todo",
            ],
            answer: 1,
            why: "Ofertar demasiado pronto o no hablar de dinero son los dos extremos que restan.",
          },
          {
            kind: "tap",
            context: "Quieres pedir ejemplos.",
            bubbles: [{ role: "influencer", text: "Hago un poco de todo jaja" }],
            options: [
              "Ok. 200€ y ya está",
              "¿Me pasas un reel de una collab con restaurante o marca de comida?",
              "Envíame tu DNI y cuenta bancaria",
            ],
            answer: 1,
            why: "Ejemplos concretos. El DNI no toca en este chat de formación.",
          },
          {
            kind: "fill",
            prompt: "Los cuatro objetivos incluyen precio, restaurante, fecha y",
            before: "",
            after: ".",
            options: ["forma de pago", "número de likes", "el algoritmo"],
            answer: 0,
            why: "Factura, transferencia, anticipo, efectivo… tiene que quedar dicho y aceptado.",
          },
          {
            kind: "order",
            prompt: "Si el influencer escribe primero y manda Instagram, ¿qué haces?",
            items: [
              "Saludar y presentarte como Orient",
              "Pedir ejemplos o comentar el perfil con una pregunta de alcance",
              "Preguntar tarifa del pack",
              "Cerrar local, día y pago",
            ],
            why: "El Instagram ya está: no lo pidas otra vez. Sigue la cadena.",
          },
          {
            kind: "choice",
            prompt: "Frase más profesional para el pago:",
            options: [
              "Ya te pagaré algo",
              "Transferencia a 7 días con factura, ¿ok?",
              "PayPal friends and family sin factura",
            ],
            answer: 1,
            why: "Concreto y corporativo. «Algo» no cierra el objetivo.",
          },
          {
            kind: "choice",
            prompt: "El mejor siguiente paso cuando termines esta academy:",
            options: [
              "Abrir el WhatsApp de formación y hacer una negociación completa",
              "Memorizar precios de todos los influencers (no los ves a propósito)",
              "Escribir en inglés para que sea más fácil",
            ],
            answer: 0,
            why: "La academy enseña. La nota real sale del chat simulado.",
          },
        ],
      },
    ],
  },
];

export function getAcademyUnits() {
  return ACADEMY_UNITS;
}
