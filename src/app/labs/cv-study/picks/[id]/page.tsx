"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPickById } from "../../data/picks";

export default function PickDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pick = getPickById(id);

  if (!pick) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">Paper not found</p>
          <Link
            href="/labs/cv-study"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            &larr; Back to CV Study Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-800/50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/labs/cv-study"
            className="text-neutral-500 hover:text-neutral-300 transition text-sm"
          >
            &larr; CV Study Hub
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400">
                {pick.venue}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                {pick.tagKo}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2 leading-snug">
              {pick.title}
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {pick.oneLineKo}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href={pick.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg transition"
            >
              Paper &rarr;
            </a>
            {pick.codeUrl && (
              <a
                href={pick.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-lg transition"
              >
                Code &rarr;
              </a>
            )}
          </div>

          <article className="prose-custom">
            {pick.summaryKo.split("\n").map((line, i) => {
              if (line.startsWith("### ")) {
                return (
                  <h3
                    key={i}
                    className="text-lg font-semibold text-neutral-100 mt-8 mb-3"
                  >
                    {line.slice(4)}
                  </h3>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    className="text-xl font-bold text-neutral-100 mb-4"
                  >
                    {line.slice(3)}
                  </h2>
                );
              }
              if (line.startsWith("- **")) {
                const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/);
                if (match) {
                  return (
                    <div key={i} className="flex gap-2 mb-2 text-sm">
                      <span className="text-neutral-200 font-medium shrink-0">
                        {match[1]}
                      </span>
                      <span className="text-neutral-400">{match[2]}</span>
                    </div>
                  );
                }
              }
              if (line.startsWith("```")) {
                return null;
              }
              if (line.match(/^\d+\.\s/)) {
                return (
                  <p
                    key={i}
                    className="text-sm text-neutral-300 leading-relaxed pl-4 mb-1"
                  >
                    {renderBold(line)}
                  </p>
                );
              }
              if (line.trim() === "") {
                return <div key={i} className="h-2" />;
              }
              return (
                <p
                  key={i}
                  className="text-sm text-neutral-300 leading-relaxed mb-2"
                >
                  {renderBold(line)}
                </p>
              );
            })}
          </article>
        </motion.div>
      </main>
    </div>
  );
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-neutral-100 font-medium">
        {part}
      </strong>
    ) : (
      part
    )
  );
}
