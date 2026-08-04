import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get("gcal_token")?.value;
  if (!raw) return NextResponse.json({ connected: false });
  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json({ connected: !!parsed.access_token });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
