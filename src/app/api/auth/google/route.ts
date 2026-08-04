import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID não configurado", env: Object.keys(process.env).filter(k => k.includes("GOOGLE")) }, { status: 500 });
  }

  // Derive the redirect URI from the incoming request so it always matches
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "blackleafapp.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const redirectUri = `${proto}://${host}/api/auth/google/callback`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/calendar.events");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return NextResponse.redirect(url.toString());
}
