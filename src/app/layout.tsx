import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ShankoFIT",
  description:
    "ShankoFIT — elite WHOOP-powered performance insights for recovery, training, and recomp.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body
        style={
          {
            ["--font-display" as string]: "var(--font-jakarta), sans-serif",
            ["--font-body" as string]: "var(--font-jakarta), sans-serif",
          } as React.CSSProperties
        }
      >
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
