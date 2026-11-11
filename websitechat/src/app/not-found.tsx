import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="font-display font-extrabold text-5xl tracking-tight">Page not found.</h1>
      <p className="mt-4 text-lg text-ink/80">There&apos;s not much here to begin with, so this is impressive.</p>
      <Link
        href="/"
        className="inline-block mt-8 rounded-lg border-2 border-ink bg-gold px-5 py-2.5 font-display font-bold shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        Back home
      </Link>
    </div>
  );
}
