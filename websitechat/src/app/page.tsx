import Chat from "@/components/Chat";
import DepartureBoard from "@/components/DepartureBoard";

export default function Home() {
  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="label mb-3">
          <span className="inline-block bg-gold border-2 border-ink px-2 py-0.5 shadow-hard-sm">Now arriving</span>
        </p>
        <h1 className="font-display font-extrabold text-5xl sm:text-7xl leading-[0.95] tracking-tight">
          Hi, I&apos;m Russell.
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-ink/80">
          Derivatives analyst by day. The rest of the time: cabinet builder, bike-lane evangelist, dad,
          and disappointed Georgia Tech fan.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] items-start">
        <Chat />
        <div className="space-y-4">
          <DepartureBoard />
          <p className="text-sm text-ink/70 px-1">
            The chat is an AI version of me. It&apos;s about as sarcastic, and slightly better rested.
          </p>
        </div>
      </div>
    </div>
  );
}
