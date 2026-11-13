import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const display = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Russell Apple",
  description: "Russell Apple's corner of the internet. Ask the AI version of me anything.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
      <body className="min-h-dvh flex flex-col font-sans text-ink">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          {children}
        </main>
        <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-8 flex items-center justify-between text-sm text-ink/70">
          <span>Russell Apple</span>
          <a
            href="https://www.linkedin.com/in/russellapple/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink"
          >
            LinkedIn
          </a>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
