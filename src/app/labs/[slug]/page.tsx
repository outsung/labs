import Link from "next/link";
import { notFound } from "next/navigation";
import { getLabById, getAllLabs } from "@/lib/labs";

export function generateStaticParams() {
  return getAllLabs()
    .filter((lab) => lab.status !== "archived")
    .map((lab) => ({ slug: lab.id }));
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = getLabById(slug);

  if (!lab || lab.status === "archived") {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="fixed top-0 z-50 w-full px-6 py-4">
        <Link
          href="/"
          className="text-xs text-muted transition-colors hover:text-foreground"
        >
          &larr; back
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">
            {lab.tags.join(" / ")}
          </p>
          <h1 className="text-3xl font-light tracking-tight">{lab.title}</h1>
          <p className="mt-3 text-sm text-muted">{lab.description}</p>
        </div>
      </main>
    </div>
  );
}
