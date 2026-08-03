import { NextRequest, NextResponse } from "next/server";
import { updateGrowEvent } from "@/lib/events";
import type { GoogleTokenData } from "@/lib/events";

async function refreshToken(token: GoogleTokenData): Promise<GoogleTokenData | null> {
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

export async function POST(req: NextRequest) {
  const raw = req.cookies.get("gcal_token")?.value;
  if (!raw) return NextResponse.json({ ok: false, reason: "not_connected" });

  let token: GoogleTokenData;
  try { token = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }); }

  if (Date.now() > token.expiry_date - 60_000) {
    const refreshed = await refreshToken(token);
    if (!refreshed) return NextResponse.json({ ok: false, reason: "token_expired" });
    token = refreshed;
  }

  const { eventId, title, date, time, notes } = await req.json();

  const start = time
    ? { dateTime: `${date}T${time}:00`, timeZone: "America/Sao_Paulo" }
    : { date };
  const end = time
    ? { dateTime: `${date}T${time}:00`, timeZone: "America/Sao_Paulo" }
    : { date };

  const gcalRes = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ summary: title, description: notes ?? "", start, end }),
    }
  );

  if (!gcalRes.ok) return NextResponse.json({ ok: false, reason: "gcal_error" });

  const gcalEvent = await gcalRes.json();
  if (eventId && gcalEvent.id) {
    await updateGrowEvent(eventId, { googleEventId: gcalEvent.id }).catch(() => null);
  }

  const response = NextResponse.json({ ok: true, googleEventId: gcalEvent.id });

  if (token !== JSON.parse(raw)) {
    response.cookies.set("gcal_token", JSON.stringify(token), {
      httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/",
    });
  }

  return response;
}
