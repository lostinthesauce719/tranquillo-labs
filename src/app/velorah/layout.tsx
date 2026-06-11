import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./velorah.css";

const inter = Inter({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--velorah-font-body",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--velorah-font-display",
});

export const metadata: Metadata = {
  title: "Velorah — Where dreams rise through the silence.",
  description:
    "Designing tools for deep thinkers, bold creators, and quiet rebels. Digital spaces for sharp focus and inspired work.",
};

export default function VelorahLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${instrumentSerif.variable}`}>
      {children}
    </div>
  );
}
