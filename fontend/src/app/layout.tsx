import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cholo — Kolkata Bus Timetables",
  description: "Find scheduled Kolkata buses between your stops. Explore today's departures, routes, and journey stops with Cholo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
