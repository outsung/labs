"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getPickById } from "../../data/picks";

export default function PickDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pick = getPickById(id);

  const [terms, setTerms] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectionText, setSelectionText] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const articleRef = useRef<HTMLElement>(null);
  const hydrated = useRef(false);

  // localStorage load
  useEffect(() => {
    if (!id) return;
    try {
      const saved = localStorage.getItem(`cv-study-terms-${id}`);
      if (saved) setTerms(JSON.parse(saved));
    } catch {}
    hydrated.current = true;
  }, [id]);

  // localStorage save
  useEffect(() => {
    if (!hydrated.current || !id) return;
    try {
      localStorage.setItem(`cv-study-terms-${id}`, JSON.stringify(terms));
    } catch {}
  }, [terms, id]);

  // responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // clear tooltip on scroll
  useEffect(() => {
    const clear = () => setTooltipPos(null);
    window.addEventListener("scroll", clear, true);
    return () => window.removeEventListener("scroll", clear, true);
  }, []);

  // clear tooltip when selection changes to empty
  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.toString().trim() === "") {
        setTooltipPos(null);
        setSelectionText("");
      }
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || !sel?.anchorNode) {
      setTooltipPos(null);
      setSelectionText("");
      return;
    }
    if (articleRef.current?.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionText(text);
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    }
  }, []);

  const addTerm = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setTerms((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    },
    []
  );

  const removeTerm = useCallback((index: number) => {
    setTerms((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCopyAll = useCallback(async () => {
    const text = terms.map((t, i) => `${i + 1}. ${t}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [terms]);

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

          <article
            ref={articleRef}
            className="prose-custom"
            onMouseUp={handleTextSelect}
            onTouchEnd={handleTextSelect}
          >
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

      {/* Selection tooltip */}
      <AnimatePresence>
        {tooltipPos && selectionText && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            className="fixed z-50 px-2.5 py-1 bg-blue-500 hover:bg-blue-400 text-white text-xs font-medium rounded-md shadow-lg shadow-black/30 -translate-x-1/2 -translate-y-full"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              addTerm(selectionText);
              window.getSelection()?.removeAllRanges();
              setTooltipPos(null);
              setSelectionText("");
              if (!panelOpen) setPanelOpen(true);
            }}
          >
            + Add
          </motion.button>
        )}
      </AnimatePresence>

      {/* FAB toggle */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 flex items-center justify-center transition shadow-lg shadow-black/30"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
        {terms.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
            {terms.length > 99 ? "99" : terms.length}
          </span>
        )}
      </button>

      {/* Side panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={
                isMobile
                  ? "fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-neutral-800 rounded-t-2xl max-h-[70vh] flex flex-col"
                  : "fixed top-0 right-0 bottom-0 z-50 w-80 bg-[#111] border-l border-neutral-800 flex flex-col"
              }
            >
              {/* Drag handle (mobile) */}
              {isMobile && (
                <div className="flex justify-center py-2">
                  <div className="w-10 h-1 rounded-full bg-neutral-700" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/50">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-neutral-200">
                    Terms
                  </h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500">
                    {terms.length}
                  </span>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="text-neutral-500 hover:text-neutral-300 transition p-1"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Manual input */}
              <div className="px-4 py-3 border-b border-neutral-800/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addTerm(manualInput);
                    setManualInput("");
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Add term..."
                    className="flex-1 bg-neutral-800 text-neutral-200 px-3 py-1.5 rounded-md text-sm border border-neutral-700 outline-none focus:border-neutral-500 placeholder:text-neutral-600"
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim()}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-sm rounded-md transition disabled:opacity-30"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Term list */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {terms.length === 0 ? (
                  <p className="text-neutral-600 text-xs text-center py-8">
                    Select text from the summary or add terms manually
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {terms.map((term, i) => (
                      <motion.li
                        key={`${term}-${i}`}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2 py-1.5 px-2 -mx-2 rounded group hover:bg-neutral-800/50"
                      >
                        <span className="text-neutral-600 text-[10px] font-mono shrink-0 mt-0.5 w-4 text-right">
                          {i + 1}
                        </span>
                        <span className="text-sm text-neutral-300 flex-1 leading-snug break-all">
                          {term}
                        </span>
                        <button
                          onClick={() => removeTerm(i)}
                          className="text-neutral-700 hover:text-red-400 transition shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {terms.length > 0 && (
                <div className="px-4 py-3 border-t border-neutral-800/50 flex gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-md transition"
                  >
                    {copied ? "Copied!" : "Copy All"}
                  </button>
                  <button
                    onClick={() => setTerms([])}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-sm rounded-md transition"
                  >
                    Clear
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
