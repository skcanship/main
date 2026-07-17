import type { Metadata } from "next";
import { Cinzel, Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const shareTech = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Operation Killmonger — Tactical Fitness Command",
  description:
    "WHOOP-powered tactical dashboard for recovery, strain, body metrics, and a recovery-aware training split.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${rajdhani.variable} ${shareTech.variable}`}>
      <body
        style={
          {
            ["--font-display" as string]: "var(--font-cinzel), serif",
            ["--font-body" as string]: "var(--font-rajdhani), sans-serif",
            ["--font-mono" as string]: "var(--font-share-tech), monospace",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
