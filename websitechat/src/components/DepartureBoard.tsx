"use client";

import { useEffect, useState } from "react";

type Status = "good" | "meh" | "bad";

// Edit these rows whenever life changes.
const rows: { what: string; status: string; tone: Status }[] = [
  { what: "Pantry cabinets", status: "In progress", tone: "meh" },
  { what: "Mudroom cabinets", status: "Also in progress", tone: "meh" },
  { what: "Atlanta bike lanes", status: "Advocating", tone: "good" },
  { what: "Georgia Tech football", status: "Disappointing", tone: "bad" },
  { what: "Full night of sleep", status: "Cancelled", tone: "bad" },
  { what: "Photo gallery", status: "Coming soon", tone: "good" },
];

const toneClass: Record<Status, string> = {
  good: "text-emerald-400",
  meh: "text-gold",
  bad: "text-red-400",
};

// Current time in Atlanta, shown only after the page loads in the browser
function useAtlantaTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function DepartureBoard() {
  const time = useAtlantaTime();

  return (
    <section className="rounded-xl border-2 border-ink bg-board text-paper shadow-hard overflow-hidden font-mono" aria-label="Status board">
      <div className="flex items-center justify-between px-4 py-3 border-b border-paper/15">
        <h2 className="label text-gold">Departures</h2>
        <span className="label text-paper/70">ATL {time ?? "--:--"}</span>
      </div>
      <ul className="divide-y divide-paper/10 [perspective:600px]">
        {rows.map((r, i) => (
          <li
            key={r.what}
            className="flip-in flex items-baseline justify-between gap-3 px-4 py-2.5 text-[0.8rem] uppercase tracking-wide"
            style={{ animationDelay: `${150 + i * 120}ms` }}
          >
            <span className="truncate">{r.what}</span>
            <span className={`shrink-0 text-right ${toneClass[r.tone]}`}>{r.status}</span>
          </li>
        ))}
      </ul>
      <p className="px-4 py-2.5 border-t border-paper/15 text-[0.65rem] uppercase tracking-widest text-paper/50">
        Updated whenever I remember
      </p>
    </section>
  );
}
