import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Server-side rule engine for nutrients ──────────────────────────────────
interface VisualChecklist {
  burnedEdgesTips: "SIM" | "NÃO";   // bordas/pontas queimadas, marrons, crocantes
  purpleColoring: "SIM" | "NÃO";    // coloração roxa/violeta/vinho nas folhas ou caule
  uniformYellowing: "SIM" | "NÃO";  // amarelamento uniforme da folha inteira
  interveinalChlorosis: "SIM" | "NÃO"; // nervuras verdes com miolo amarelo
  newLeavesAffected: "SIM" | "NÃO"; // sintomas predominam nas folhas novas (topo)
  newGrowthDeformed: "SIM" | "NÃO"; // folhas novas deformadas, grossas, enroladas
}

function deriveNutrientName(c: VisualChecklist): string {
  // Burned edges/tips = Potassium (hard rule — not phosphorus)
  if (c.burnedEdgesTips === "SIM" && c.purpleColoring === "NÃO") return "Deficiência de Potássio (K)";
  // Purple/violet = Phosphorus (hard rule — not potassium)
  if (c.purpleColoring === "SIM" && c.burnedEdgesTips === "NÃO") return "Deficiência de Fósforo (P)";
  // Both burned + purple = more likely K than P
  if (c.burnedEdgesTips === "SIM" && c.purpleColoring === "SIM") return "Deficiência de Potássio (K)";
  // Uniform yellowing on old leaves = Nitrogen
  if (c.uniformYellowing === "SIM" && c.newLeavesAffected === "NÃO") return "Deficiência de Nitrogênio (N)";
  // Uniform yellowing on new leaves = Sulfur
  if (c.uniformYellowing === "SIM" && c.newLeavesAffected === "SIM") return "Deficiência de Enxofre (S)";
  // Interveinal chlorosis on old leaves = Magnesium
  if (c.interveinalChlorosis === "SIM" && c.newLeavesAffected === "NÃO") return "Deficiência de Magnésio (Mg)";
  // Interveinal chlorosis on new leaves = Iron
  if (c.interveinalChlorosis === "SIM" && c.newLeavesAffected === "SIM") return "Deficiência de Ferro (Fe)";
  // Deformed new growth = Calcium or Boron
  if (c.newGrowthDeformed === "SIM") return "Deficiência de Cálcio (Ca) ou Boro (B)";
  return "Problema nutricional não identificado com clareza";
}

// ── Prompts ────────────────────────────────────────────────────────────────
const PROMPTS = {
  pests: `Você é um entomologista especialista em pragas de cannabis.

OBSERVE a imagem e identifique:
- Insetos visíveis (corpo, pernas, asas, ovos, excrementos)
- Padrão de dano: pontinhos brancos, teias, estrias prateadas, buracos, substância pegajosa
- Localização: face superior ou inferior das folhas, caule, solo

REFERÊNCIA:
- ÁCARO-RAJADO: pontinhos brancos/amarelos na face superior, teias finas na inferior
- PULGÃO: colônias de insetos verdes/pretos, substância pegajosa, folhas enroladas
- TRIPS: estrias prateadas, bordas com aspecto papelão, insetos minúsculos alongados
- MOSCA-BRANCA: insetos brancos que voam, ovos na face inferior, folhas amarelas
- FUNGUS GNAT: adultos voando rente ao solo, larvas nas raízes
- COCHONILHA: massa branca/algodão nos nós e caules
- LAGARTA: buracos grandes, excrementos escuros (frass)

Responda APENAS JSON válido:
{
  "identified": boolean,
  "name": string,
  "confidence": "alta" | "média" | "baixa",
  "visualObservation": string,
  "description": string,
  "urgency": "alta" | "média" | "baixa",
  "symptoms": string[],
  "treatment": string[],
  "prevention": string[],
  "additionalNotes": string
}`,

  diseases: `Você é um fitopatologista especialista em doenças de cannabis.

OBSERVE a imagem e identifique:
- Pó branco na superfície das folhas (não confunda com tricomas)
- Manchas com mofo, coloração, bordas definidas
- Tecido apodrecido, murcha, aspecto encharcado

REFERÊNCIA:
- OÍDIO: pó BRANCO circular na face SUPERIOR, se espalha facilmente
- MÍLDIO: manchas amarelas na face superior + mofo cinza/roxo na face INFERIOR
- BOTRYTIS: mofo CINZA-MARROM em flores/caules, tecido úmido e apodrecido
- FUSARIUM: murcha de um lado da planta, caule interno marrom-avermelhado
- PYTHIUM: raízes marrons/pretas, base do caule apodrecida, crescimento lento
- MANCHA BACTERIANA: manchas marrons com halo amarelo, aspecto encharcado

Responda APENAS JSON válido:
{
  "identified": boolean,
  "name": string,
  "confidence": "alta" | "média" | "baixa",
  "visualObservation": string,
  "description": string,
  "urgency": "alta" | "média" | "baixa",
  "symptoms": string[],
  "treatment": string[],
  "prevention": string[],
  "additionalNotes": string
}`,

  nutrients: `Você é um especialista em nutrição de cannabis. Sua tarefa é APENAS preencher o checklist visual abaixo com SIM ou NÃO, observando com máxima atenção a imagem.

CHECKLIST VISUAL — responda SIM ou NÃO para cada item com base no que você LITERALMENTE VÊ:

1. burnedEdgesTips: As BORDAS ou PONTAS das folhas estão MARRONS, CROCANTES ou com aspecto de queimadura? (Necrose marginal — tecido morto nas extremidades)
   ATENÇÃO: Cor marrom/torrada nas pontas = SIM. Coloração roxa = NÃO para esta pergunta.

2. purpleColoring: Há coloração ROXA, VIOLETA ou VINHO nas folhas ou no caule? (especialmente na face inferior)
   ATENÇÃO: Roxo real, não marrom. Marrom queimado = NÃO para esta pergunta.

3. uniformYellowing: As folhas estão ficando COMPLETAMENTE AMARELAS de forma uniforme (a folha toda, não só bordas)?

4. interveinalChlorosis: As NERVURAS das folhas continuam VERDES enquanto o tecido ENTRE elas está AMARELO? (padrão listrado verde-amarelo)

5. newLeavesAffected: Os sintomas aparecem PRINCIPALMENTE nas folhas NOVAS/JOVENS (topo da planta)?

6. newGrowthDeformed: As folhas NOVAS estão DEFORMADAS, GROSSAS, ENROLADAS ou com PONTAS MORTAS?

Além do checklist, descreva em "visualObservation" o que você literalmente vê (cores, padrões, localização).
Preencha "description", "symptoms", "treatment" e "prevention" para a deficiência que o checklist indicar.

Responda APENAS JSON válido:
{
  "identified": boolean,
  "visualChecklist": {
    "burnedEdgesTips": "SIM" | "NÃO",
    "purpleColoring": "SIM" | "NÃO",
    "uniformYellowing": "SIM" | "NÃO",
    "interveinalChlorosis": "SIM" | "NÃO",
    "newLeavesAffected": "SIM" | "NÃO",
    "newGrowthDeformed": "SIM" | "NÃO"
  },
  "visualObservation": string,
  "confidence": "alta" | "média" | "baixa",
  "description": string,
  "urgency": "alta" | "média" | "baixa",
  "symptoms": string[],
  "treatment": string[],
  "prevention": string[],
  "additionalNotes": string
}`,
};

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 500 });
    }

    const { imageBase64, mimeType, category } = await req.json();
    if (!imageBase64 || !category) {
      return NextResponse.json({ error: "imageBase64 e category são obrigatórios" }, { status: 400 });
    }

    const prompt = PROMPTS[category as keyof typeof PROMPTS];
    if (!prompt) {
      return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const parts = [
      { text: prompt },
      { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
    ];

    // Retry up to 3 times on 503 (transient overload)
    let result;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(parts);
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (attempt < 3 && msg.includes("503")) {
          await new Promise((r) => setTimeout(r, attempt * 1500));
          continue;
        }
        throw e;
      }
    }
    if (!result) throw new Error("Falha após 3 tentativas.");

    const raw = JSON.parse(result.response.text());

    // For nutrients: server derives name from checklist — model cannot override
    if (category === "nutrients" && raw.visualChecklist) {
      raw.name = raw.identified ? deriveNutrientName(raw.visualChecklist) : "Nenhuma deficiência identificada";
    }

    return NextResponse.json({ diagnosis: raw });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[diagnose]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
