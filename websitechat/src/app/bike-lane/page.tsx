import type { Metadata } from "next";
import BikeLaneGame from "@/components/BikeLaneGame";

export const metadata: Metadata = {
  title: "Lane Closed | Russell Apple",
  description: "A small game about trying to use a bike lane.",
};

export default function BikeLanePage() {
  return (
    <div>
      <BikeLaneGame />
      <p className="mt-6 text-center text-sm text-ink/70 max-w-sm mx-auto md:hidden">
        Arrow keys or A / D to swerve. On a phone, tap the left or right side of the game.
      </p>
    </div>
  );
}
