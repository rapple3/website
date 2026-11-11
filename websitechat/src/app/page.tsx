import Link from "next/link";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display font-extrabold text-5xl sm:text-6xl leading-[0.95] tracking-tight">
          Hi, I&apos;m Russell.
        </h1>
        <p className="mt-4 text-lg text-ink/80">
          Derivatives analyst by day. The rest of the time: cabinet builder, bike-lane evangelist, dad,
          and disappointed Georgia Tech fan.
        </p>
      </header>

      <Chat />

      <Link
        href="/bike-lane"
        className="group flex items-center justify-between gap-4 rounded-xl border-2 border-ink bg-white px-5 py-4 shadow-hard transition-transform hover:-translate-y-0.5"
      >
        <span>
          <span className="block font-display font-bold text-lg">Lane Closed</span>
          <span className="block text-sm text-ink/70">A small game about trying to use a bike lane.</span>
        </span>
        <span className="shrink-0 rounded-lg border-2 border-ink bg-gold px-3 py-1.5 font-display font-bold shadow-hard-sm">
          Play →
        </span>
      </Link>
    </div>
  );
}
