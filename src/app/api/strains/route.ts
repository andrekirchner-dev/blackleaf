import { NextRequest, NextResponse } from "next/server";

export interface StrainResult {
  strain_name: string;
  breeder_name?: string;
  bank_name?: string;
  seed_bank?: string;
  sativa_percentage?: number;
  indica_percentage?: number;
  flowering_behavior?: string;
  flowering_time_min?: number;
  flowering_time_max?: number;
  seed_gender?: string;
  about_info?: string;
  thc_min?: number;
  thc_max?: number;
  cbd_min?: number;
  cbd_max?: number;
  yield_units?: string;
  terpenes?: string;
  effects?: string;
  height_indoor?: string;
  height_outdoor?: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://api.loyal9.app/v1/search?q=${encodeURIComponent(q)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return NextResponse.json([]);
    const json = await res.json();
    const data: StrainResult[] = (json.data ?? []).slice(0, 12);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
