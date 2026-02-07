import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daylight — The computer, re-imagined",
  description:
    "A tablet designed for reading, writing, and focused work. Built for the way your eyes and mind actually work.",
};

export default function DaylightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
