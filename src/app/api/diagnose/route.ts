import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPTS: Record<string, string> = {
  pests: `Você é um entomologista especialista em pragas de cannabis com 20 anos de experiência.

PASSO 1 — OBSERVE os detalhes visuais:
- Há insetos visíveis (corpo, pernas, asas)?
- Há teias finas (ácaros), trilhas prateadas (trips/lesmas), substância pegajosa (pulgões/cochonilhas)?
- Qual o padrão de dano: pontinhos brancos/prateados na folha, buracos, bordas comidas, mosqueado?
- Os danos estão na face superior ou inferior das folhas?
- Há ovos, exúvias ou excrementos visíveis?

PASSO 2 — REFERÊNCIA de identificação:
- ÁCARO-RAJADO: pontinhos brancos/amarelos na face superior, teias finas na inferior, invisíveis a olho nu
- PULGÃO: insetos verdes/pretos em colônias, substância pegajosa (honeydew), folhas enroladas
- TRIPS: estrias prateadas/brancas na folha, bordas com aspecto papelão, insetos alongados minúsculos
- MOSCA-BRANCA: nuvem de insetos brancos ao sacudir, ovos na face inferior, folhas amarelas
- FUNGUS GNAT: larvas no solo, adultos voando rente à terra, raízes com dano
- COCHONILHA: massa branca/algodão nos caules e nós, substância pegajosa
- LAGARTA: buracos grandes nas folhas, excrementos escuros (frass) visíveis
- LESMA/CARACOL: trilhas brilhantes secas, buracos irregulares, atividade noturna

Se não houver praga identificável, retorne "identified": false.

Responda APENAS com JSON válido, sem markdown:
{
  "identified": boolean,
  "name": string,
  "confidence": "alta" | "média" | "baixa",
  "description": string,
  "urgency": "alta" | "média" | "baixa",
  "symptoms": string[],
  "treatment": string[],
  "prevention": string[],
  "additionalNotes": string
}`,

  diseases: `Você é um fitopatologista especialista em doenças de cannabis com 20 anos de experiência.

PASSO 1 — OBSERVE os sintomas com atenção:
- Há pó branco na superfície das folhas (não confunda com tricomas)?
- Há manchas marrons/cinzas com mofo visível?
- As lesões têm bordas definidas ou são difusas?
- O problema está nas folhas, caule, raízes ou flores?
- Há odor diferente (podridão)?
- Os sintomas aparecem em pontos isolados ou se espalham em padrão?

PASSO 2 — REFERÊNCIA de identificação:
- OÍDIO (Powdery Mildew): pó BRANCO na face SUPERIOR das folhas, circular, se espalha. NÃO é removível facilmente.
- MÍLDIO (Downy Mildew): manchas amarelas na face superior, mofo cinza/roxo na face INFERIOR correspondente.
- BOTRYTIS (Mofo Cinzento): mofo CINZA-MARROM em flores/caules, tecido apodrecido, úmido.
- FUSARIUM: murcha súbita de um lado da planta, caule interno marrom-avermelhado.
- PYTHIUM (Podridão de Raiz): raízes marrons/pretas, caule na base apodrecido, crescimento lento.
- MANCHA FOLIAR BACTERIANA: manchas marrons com halo amarelo, aspecto encharcado.
- ALTAS TEMPERATURAS/QUEIMADURA: bordas secas sem patógeno visível.

Se não houver doença identificável, retorne "identified": false.

Responda APENAS com JSON válido, sem markdown:
{
  "identified": boolean,
  "name": string,
  "confidence": "alta" | "média" | "baixa",
  "description": string,
  "urgency": "alta" | "média" | "baixa",
  "symptoms": string[],
  "treatment": string[],
  "prevention": string[],
  "additionalNotes": string
}`,

  nutrients: `Você é um fitopatologista especialista em cannabis com 20 anos de experiência em diagnóstico visual de deficiências nutricionais.

PASSO 1 — OBSERVE com atenção antes de concluir:
- Onde os sintomas aparecem: folhas velhas (baixeiras) ou folhas novas (topo)?
- Qual é a cor predominante: amarelo, marrom, roxo, vermelho, manchas?
- Onde na folha: bordas/pontas, entre as nervuras, uniforme, manchas?
- As nervuras ficam verdes enquanto o restante amarela (clorose interveinal)?
- As pontas/bordas estão queimadas/marrons/crocantes?
- Há coloração roxa ou avermelhada no caule ou na face inferior das folhas?

PASSO 2 — USE esta tabela de referência para diferenciar as deficiências:

NUTRIENTES MÓVEIS (sintomas nas folhas VELHAS/baixeiras primeiro):
- NITROGÊNIO (N): amarelamento uniforme da folha inteira, começando pelas mais velhas. Folha fica completamente amarela depois pálida.
- FÓSFORO (P): coloração ROXA ou VERMELHO-ESCURA na face inferior das folhas e no caule. NÃO é queimadura de borda. A folha fica roxeada, especialmente embaixo.
- POTÁSSIO (K): BORDAS E PONTAS queimadas/marrons/crocantes (necrose marginal). A queimadura começa na ponta e avança pelas bordas. O centro da folha pode ficar amarelo depois.
- MAGNÉSIO (Mg): CLOROSE INTERVEINAL nas folhas velhas — nervuras ficam verdes enquanto o tecido entre elas amarela. Aspecto de "folha com veias verdes em fundo amarelo".
- MOLIBDÊNIO (Mo): manchas amarelas/laranja nas folhas velhas, bordas podem enrolar.

NUTRIENTES IMÓVEIS (sintomas nas folhas NOVAS/topo primeiro):
- CÁLCIO (Ca): manchas marrons irregulares nas folhas novas, pontas enrolam, crescimento deformado.
- FERRO (Fe): folhas novas amarelas com nervuras verdes (clorose interveinal no topo).
- ZINCO (Zn): folhas novas pequenas, deformadas, com clorose interveinal fina.
- MANGANÊS (Mn): manchas amarelas/marrons entre as nervuras nas folhas novas.
- BORO (B): pontas de crescimento mortas, folhas novas grossas e deformadas.
- ENXOFRE (S): amarelamento uniforme nas folhas novas (diferente do N que começa nas velhas).

TOXICIDADES:
- NITROGÊNIO (excesso): folhas verde-escuro brilhante, pontas enrolam para baixo ("garras"), caule grosso.
- POTÁSSIO (excesso): bloqueia Ca e Mg — sintomas secundários de deficiência desses.
- NUTRIENTES em geral (excesso): queimadura de ponta nas folhas, solo com alto EC.

PASSO 3 — DIFERENCIE casos similares:
- Queimadura de borda/ponta → POTÁSSIO (não confunda com fósforo que é roxo)
- Coloração roxa/violeta → FÓSFORO ou temperatura fria (não é potássio)
- Amarelamento entre nervuras em folhas velhas → MAGNÉSIO (não nitrogênio)
- Amarelamento uniforme em folhas velhas → NITROGÊNIO
- Amarelamento em folhas novas → FERRO ou ENXOFRE

PASSO 4 — Conclua com base nos sinais visuais reais da imagem, não em suposições.

Se não for possível identificar com segurança, retorne "identified": false com confidence "baixa".

Responda APENAS com JSON válido, sem markdown, no seguinte formato exato:
{
  "identified": boolean,
  "name": string,
  "confidence": "alta" | "média" | "baixa",
  "description": string,
  "urgency": "alta" | "média" | "baixa",
  "symptoms": string[],
  "treatment": string[],
  "prevention": string[],
  "additionalNotes": string
}`,
};

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

    const prompt = SYSTEM_PROMPTS[category];
    if (!prompt) {
      return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
    ]);

    const text = result.response.text();
    const diagnosis = JSON.parse(text);

    return NextResponse.json({ diagnosis });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[diagnose]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
