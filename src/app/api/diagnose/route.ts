import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPTS: Record<string, string> = {
  pests: `Você é um especialista em pragas de cannabis. Analise a imagem e identifique qualquer praga presente (ácaros, pulgões, trips, mosca-branca, fungus gnats, cochonilhas, lesmas, etc).
Se não conseguir identificar nenhuma praga visível, retorne "identified": false.
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

  diseases: `Você é um especialista em doenças de cannabis. Analise a imagem e identifique qualquer doença presente (oídio, míldio, botrytis, mancha foliar, fusarium, pythium, etc).
Se não conseguir identificar nenhuma doença, retorne "identified": false.
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

  nutrients: `Você é um especialista em nutrição de cannabis. Analise a imagem e identifique deficiências ou toxicidades de nutrientes (nitrogênio, fósforo, potássio, cálcio, magnésio, ferro, zinco, etc).
Indique se é deficiência ou toxicidade no campo "name".
Se não conseguir identificar nenhum problema nutricional, retorne "identified": false.
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
      model: "gemini-2.0-flash",
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
