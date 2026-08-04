export function buildGCalLink(opts: {
  title: string;
  date: string;   // YYYY-MM-DD
  time?: string;  // HH:mm
  notes?: string;
}): string {
  const { title, date, time, notes } = opts;

  let dates: string;
  if (time) {
    // Timed event: format as YYYYMMDDTHHmmss/YYYYMMDDTHHmmss (1h duration)
    const [h, m] = time.split(":").map(Number);
    const endH = (h + 1) % 24;
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateCompact = date.replace(/-/g, "");
    const start = `${dateCompact}T${pad(h)}${pad(m)}00`;
    const end = `${dateCompact}T${pad(endH)}${pad(m)}00`;
    dates = `${start}/${end}`;
  } else {
    // All-day event: YYYYMMDD/YYYYMMDD (next day as end)
    const [y, mo, d] = date.split("-").map(Number);
    const next = new Date(y, mo - 1, d + 1);
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const endDate = `${next.getFullYear()}${pad2(next.getMonth() + 1)}${pad2(next.getDate())}`;
    dates = `${date.replace(/-/g, "")}/${endDate}`;
  }

  const url = new URL("https://calendar.google.com/calendar/event");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("dates", dates);
  if (notes) url.searchParams.set("details", notes);

  return url.toString();
}
