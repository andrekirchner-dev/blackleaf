import { NextRequest, NextResponse } from "next/server";

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
}

async function refreshAccessToken(token: TokenData): Promise<TokenData | null> {
  if (!token.refresh_token) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: token.refresh_token,
    expiry_date: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
}

export async function GET(req: NextRequest) {
  const raw = req.cookies.get("gcal_token")?.value;
  if (!raw) return NextResponse.json({ events: [], connected: false });

  let token: TokenData;
  try { token = JSON.parse(raw); } catch { return NextResponse.json({ events: [] }); }

  if (Date.now() > token.expiry_date - 60_000) {
    const refreshed = await refreshAccessToken(token);
    if (!refreshed) return NextResponse.json({ events: [], expired: true });
    token = refreshed;
  }

  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get("timeMin");
  const timeMax = searchParams.get("timeMax");
  if (!timeMin || !timeMax) return NextResponse.json({ events: [] });

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", new Date(timeMin).toISOString());
  url.searchParams.set("timeMax", new Date(timeMax).toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "100");

  const gcalRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });

  if (!gcalRes.ok) return NextResponse.json({ events: [], error: true });

  const data = await gcalRes.json();
  const response = NextResponse.json({ events: data.items ?? [] });

  if (JSON.stringify(token) !== raw) {
    response.cookies.set("gcal_token", JSON.stringify(token), {
      httpOnly: true, secure: true, sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, path: "/",
    });
  }

  return response;
}
