import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penumbra — Turn any window into light",
  description:
    "Upload a window photo or choose a preset to cast realistic shadows across your screen. Powered by WebGL Vogel Disk Sampling.",
};

export default function PenumbraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
