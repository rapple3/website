import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <p className="label mb-3">
        <span className="inline-block bg-signal text-white border-2 border-ink px-2 py-0.5 shadow-hard-sm">Service alert</span>
      </p>
      <h1 className="font-display font-extrabold text-5xl sm:text-6xl tracking-tight">This station doesn&apos;t exist.</h1>
      <p className="mt-4 text-lg text-ink/80">
        It was probably cut from the budget to widen a highway.
      </p>
      <Link
        href="/"
        className="inline-block mt-8 rounded-lg border-2 border-ink bg-gold px-5 py-2.5 font-display font-bold shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        Back to Home station
      </Link>
    </div>
  );
}
