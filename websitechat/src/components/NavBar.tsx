"use client";

import { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";

// Stations on the line. `planned` stations are drawn dashed and aren't links yet.
const stations: { href: string; label: string; planned?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/notes", label: "Notes" },
  { href: "/gallery", label: "Gallery", planned: true },
];

function Bike({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6.5" cy="13.5" r="5" />
      <circle cx="25.5" cy="13.5" r="5" />
      <path d="M6.5 13.5 L12 5.5 H21 L25.5 13.5 M12 5.5 L16.5 13.5 H6.5 M16.5 13.5 L21 5.5 M21 5.5 L20 2.5 H23 M10.5 5.5 H13.5" />
    </svg>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const active = stations.findIndex((s) => !s.planned && s.href === pathname);

  // Which way the bike faces: it turns around when heading back toward Home
  const prev = useRef(active);
  const [facingLeft, setFacingLeft] = useState(false);
  useEffect(() => {
    if (active !== -1 && prev.current !== -1 && active !== prev.current) {
      setFacingLeft(active < prev.current);
    }
    prev.current = active;
  }, [active]);

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const n = stations.length;
  const center = (i: number) => `${((i + 0.5) / n) * 100}%`;
  const lastOpen = n - 2; // last station that isn't "planned"

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-20 bg-paper/90 backdrop-blur-sm border-b-2 border-ink">
        <nav className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between md:justify-center" aria-label="Main">
          <Link href="/" className="md:hidden font-display font-bold text-lg">
            Russell Apple
          </Link>

          {/* Desktop: the transit line */}
          <div className="hidden md:block relative w-[560px] h-16">
            {/* Track: solid for open stations, dashed for the planned extension */}
            <div className="absolute top-[22px] h-1 bg-ink rounded-full" style={{ left: center(0), right: `calc(100% - ${center(lastOpen)})` }} />
            <div className="absolute top-[22px] border-t-4 border-dashed border-ink/40" style={{ left: center(lastOpen), right: `calc(100% - ${center(n - 1)})` }} />

            {/* The bike rides to whichever station you're at */}
            {active !== -1 && (
              <div
                className="bike absolute -top-1 -translate-x-1/2 transition-[left] duration-700 ease-in-out pointer-events-none"
                style={{ left: center(active) }}
              >
                <Bike className={`w-8 h-5 text-ink ${facingLeft ? "-scale-x-100" : ""}`} />
              </div>
            )}

            <ul className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
              {stations.map((s, i) => {
                const isActive = i === active;
                const dot = (
                  <span
                    className={`block w-4 h-4 rounded-full border-[3px] transition-colors ${
                      s.planned
                        ? "border-ink/40 bg-paper"
                        : isActive
                        ? "border-ink bg-gold"
                        : "border-ink bg-paper group-hover:bg-gold/50"
                    }`}
                  />
                );
                const text = (
                  <span className={`label mt-1.5 ${s.planned ? "text-ink/50" : isActive ? "font-bold" : ""}`}>
                    {s.label}
                    {s.planned && <span className="block text-[0.55rem] leading-tight">planned</span>}
                  </span>
                );
                return (
                  <li key={s.href} className="relative">
                    {s.planned ? (
                      <span className="flex flex-col items-center pt-4 text-center cursor-default" title="Coming soon">
                        {dot}
                        {text}
                      </span>
                    ) : (
                      <Link
                        href={s.href}
                        aria-current={isActive ? "page" : undefined}
                        className="group flex flex-col items-center pt-4 h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        {dot}
                        {text}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg border-2 border-ink bg-paper shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile menu: the same line, drawn vertically. Tap outside to close.
          Kept outside <header> because its backdrop blur would otherwise trap
          this fixed overlay inside the header. */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-40" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-ink/30" />
          <div
            className="relative mx-4 mt-3 rounded-xl border-2 border-ink bg-paper shadow-hard p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="label mb-3 text-ink/60">Stops on this line</p>
            <ul className="relative">
              <span className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-ink/30" aria-hidden="true" />
              {stations.map((s, i) => {
                const isActive = i === active;
                const row = (
                  <>
                    <span
                      className={`relative block w-4 h-4 shrink-0 rounded-full border-[3px] ${
                        s.planned ? "border-ink/40 bg-paper" : isActive ? "border-ink bg-gold" : "border-ink bg-paper"
                      }`}
                    />
                    <span className={`font-display text-lg ${isActive ? "font-bold" : ""} ${s.planned ? "text-ink/50" : ""}`}>
                      {s.label}
                    </span>
                    {s.planned && <span className="label text-ink/50">planned</span>}
                    {isActive && <Bike className="w-7 h-4 ml-auto" />}
                  </>
                );
                return (
                  <li key={s.href}>
                    {s.planned ? (
                      <span className="flex items-center gap-4 py-3">{row}</span>
                    ) : (
                      <Link href={s.href} aria-current={isActive ? "page" : undefined} className="flex items-center gap-4 py-3">
                        {row}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
