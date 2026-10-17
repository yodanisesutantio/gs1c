import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "San Andreas — 100% Checklist",
  description: "Track every required GTA: San Andreas 100% completion objective.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
