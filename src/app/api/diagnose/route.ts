import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";

const DiagnosisSchema = z.object({
  identified: z.boolean(),
  name: z.string(),
  confidence: z.enum(["alta", "média", "baixa"]),
  description: z.string(),
  urgency: z.enum(["alta", "média", "baixa"]).optional(),
  symptoms: z.array(z.string()),
  treatment: z.array(z.string()),
  prevention: z.array(z.string()),
  additionalNotes: z.string().optional(),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  pests: `Você é um especialista em pragas de cannabis. Analise a imagem e identifique qualquer praga presente (ácaros, pulgões, trips, mosca-branca, fungus gnats, cochonilhas, lesmas, etc). Responda SEMPRE em português do Brasil. Se não conseguir identificar nenhuma praga, defina "identified" como false e "name" como "Nenhuma praga identificada". Seja específico sobre espécies quando possível.`,
  diseases: `Você é um especialista em doenças de cannabis. Analise a imagem e identifique qualquer doença presente (oídio, míldio, botrytis/mofo cinzento, mancha foliar, fusarium, pythium, etc). Responda SEMPRE em português do Brasil. Se não conseguir identificar nenhuma doença, defina "identified" como false e "name" como "Nenhuma doença identificada".`,
  nutrients: `Você é um especialista em nutrição de cannabis. Analise a imagem e identifique deficiências ou toxicidades de nutrientes presentes (nitrogênio, fósforo, potássio, cálcio, magnésio, ferro, zinco, etc). Responda SEMPRE em português do Brasil. Se não conseguir identificar nenhum problema nutricional, defina "identified" como false e "name" como "Nenhuma deficiência identificada". Indique se é deficiência ou toxicidade.`,
};

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, category } = await req.json();

    if (!imageBase64 || !category) {
      return NextResponse.json({ error: "imageBase64 e category são obrigatórios" }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[category];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    }

    const { output } = await generateText({
      model: "google/gemini-2.5-flash",
      output: Output.object({ schema: DiagnosisSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: systemPrompt,
            },
            {
              type: "file",
              mediaType: mimeType || "image/jpeg",
              data: imageBase64,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ diagnosis: output });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[diagnose]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
