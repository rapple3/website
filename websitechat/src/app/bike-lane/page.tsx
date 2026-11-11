import type { Metadata } from "next";
import Link from "next/link";
import BikeLaneGame from "@/components/BikeLaneGame";

export const metadata: Metadata = {
  title: "Lane Closed | Russell Apple",
  description: "A small game about trying to use a bike lane.",
};

export default function BikeLanePage() {
  return (
    <div>
      <Link href="/" className="label underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink">
        ← Back
      </Link>
      <div className="mt-6">
        <BikeLaneGame />
      </div>
      <p className="mt-6 text-center text-sm text-ink/70 max-w-sm mx-auto">
        Arrow keys or A / D to swerve. On a phone, tap the left or right side of the game.
      </p>
    </div>
  );
}
