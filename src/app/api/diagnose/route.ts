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

  nutrients: `Você é um fitopatologista especialista em cannabis. Analise a imagem com MÁXIMA atenção visual antes de concluir qualquer coisa.

═══ REGRA CRÍTICA ═══
DESCREVA O QUE VOCÊ REALMENTE VÊ na imagem antes de nomear qualquer deficiência.
Nunca assuma — observe a cor real, o local real, o padrão real.

═══ GUIA DE OBSERVAÇÃO ═══
Responda mentalmente a estas perguntas antes de preencher o JSON:

1. AS FOLHAS TÊM BORDA/PONTA QUEIMADA OU MARROM CROCANTE?
   → SIM: provavelmente POTÁSSIO. Não é fósforo.

2. AS FOLHAS TÊM COR ROXA, VIOLETA OU VINHO (especialmente na face de baixo)?
   → SIM: provavelmente FÓSFORO. Não é potássio.

3. AS FOLHAS ESTÃO COMPLETAMENTE AMARELAS (uniforme)?
   → SIM nas folhas velhas: NITROGÊNIO.
   → SIM nas folhas novas: ENXOFRE ou FERRO.

4. AS NERVURAS ESTÃO VERDES ENQUANTO O MIOLO DA FOLHA ESTÁ AMARELO?
   → SIM em folhas velhas: MAGNÉSIO.
   → SIM em folhas novas: FERRO ou MANGANÊS.

5. AS FOLHAS NOVAS ESTÃO DEFORMADAS, GROSSAS OU COM PONTAS MORTAS?
   → CÁLCIO ou BORO.

═══ TABELA DE DISTINÇÃO RÁPIDA ═══
| Sintoma visual             | Deficiência CORRETA         |
|----------------------------|-----------------------------|
| Borda/ponta queimada marrom| POTÁSSIO — não fósforo      |
| Cor roxa/vinho na folha    | FÓSFORO — não potássio      |
| Amarelo uniforme fol. velha| NITROGÊNIO                  |
| Verde-veia + amarelo fol.v.| MAGNÉSIO                    |
| Verde-veia + amarelo fol.n.| FERRO                       |
| Mancha marrom fol. nova    | CÁLCIO                      |
| Fol. nova deformada/grossa | BORO                        |

═══ FORMATO DE RESPOSTA ═══
Preencha o campo "visualObservation" com o que você LITERALMENTE VÊ na imagem (cores, padrões, localização dos sintomas) ANTES de concluir o diagnóstico. Isso é obrigatório.

Responda APENAS com JSON válido, sem markdown:
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
      model: "gemini-flash-latest",
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
