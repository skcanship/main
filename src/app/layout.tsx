import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PulsePlan — WHOOP Health Dashboard",
  description:
    "Connect WHOOP via OAuth and get recovery, sleep, strain insights plus training recommendations for muscle gain and fat loss.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body
        style={
          {
            ["--font-display" as string]: "var(--font-syne), sans-serif",
            ["--font-body" as string]: "var(--font-dm-sans), sans-serif",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
