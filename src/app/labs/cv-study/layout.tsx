import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV Study Hub",
  description: "Computer vision conference paper browser",
};

export default function CVStudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
