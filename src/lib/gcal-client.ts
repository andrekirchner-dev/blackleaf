export interface GCalEvent {
  id: string;
  summary: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  description?: string;
  htmlLink?: string;
}

export async function pushEventToGCal(
  token: string,
  opts: { title: string; date: string; time?: string; notes?: string }
): Promise<{ id: string } | "expired" | null> {
  const start = opts.time
    ? { dateTime: `${opts.date}T${opts.time}:00`, timeZone: "America/Sao_Paulo" }
    : { date: opts.date };
  const end = opts.time
    ? { dateTime: `${opts.date}T${opts.time}:00`, timeZone: "America/Sao_Paulo" }
    : { date: opts.date };

  try {
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ summary: opts.title, description: opts.notes ?? "", start, end }),
      }
    );
    if (res.status === 401) return "expired";
    if (!res.ok) return null;
    const json = await res.json();
    return { id: json.id };
  } catch {
    return null;
  }
}

export async function fetchGCalEvents(
  token: string,
  timeMin: string,
  timeMax: string
): Promise<GCalEvent[] | "expired" | null> {
  try {
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("timeMin", new Date(timeMin).toISOString());
    url.searchParams.set("timeMax", new Date(timeMax).toISOString());
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "100");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return "expired";
    if (!res.ok) return null;
    const json = await res.json();
    return json.items ?? [];
  } catch {
    return null;
  }
}
