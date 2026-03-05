"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getPicksByGroup, type Pick } from "./data/picks";

interface Paper {
  title: string;
  url: string;
}

const CONFERENCES = [
  {
    id: "cvpr",
    name: "CVPR",
    year: 2025,
    filter: "doi_starts_with:10.1109/cvpr",
  },
  {
    id: "iccv",
    name: "ICCV",
    year: 2025,
    filter: "doi_starts_with:10.1109/iccv",
  },
  {
    id: "eccv",
    name: "ECCV",
    year: 2024,
    filter: "default.search:ECCV 2024",
  },
];

const PICK_TABS: { id: Pick["group"]; label: string }[] = [
  { id: "cvpr", label: "CVPR" },
  { id: "iccv", label: "ICCV" },
  { id: "eccv", label: "ECCV" },
  { id: "other", label: "Etc" },
];

const PER_PAGE = 100;

async function fetchPapers(
  filter: string,
  year: number,
  page: number,
  search?: string,
  signal?: AbortSignal
): Promise<{ papers: Paper[]; total: number }> {
  const params = new URLSearchParams({
    filter: `${filter},publication_year:${year}`,
    per_page: String(PER_PAGE),
    page: String(page),
    sort: "cited_by_count:desc",
    select: "id,display_name,doi,open_access",
  });
  if (search) params.set("search", search);

  const res = await fetch(`https://api.openalex.org/works?${params}`, {
    signal,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  const papers: Paper[] = (data.results || []).map(
    (w: {
      display_name: string;
      doi: string | null;
      open_access: { oa_url: string | null } | null;
      id: string;
    }) => ({
      title: w.display_name,
      url:
        w.doi ||
        w.open_access?.oa_url ||
        `https://openalex.org/works/${w.id.split("/").pop()}`,
    })
  );

  return { papers, total: data.meta?.count || 0 };
}

export default function CVStudyPage() {
  const [conf, setConf] = useState(CONFERENCES[0]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [picksOnly, setPicksOnly] = useState(false);
  const [pickTab, setPickTab] = useState<Pick["group"]>("cvpr");
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("cv-study-picks") === "1") setPicksOnly(true);
      const tab = localStorage.getItem("cv-study-pick-tab") as Pick["group"] | null;
      if (tab) setPickTab(tab);
    } catch {}
    hydrated.current = true;
  }, []);
  const fetchId = useRef(0);

  const currentPicks = getPicksByGroup(pickTab);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (picksOnly) return;
    const id = ++fetchId.current;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setInitialLoad(true);
      setError("");
      setPapers([]);
      setTotal(0);
      try {
        const result = await fetchPapers(
          conf.filter,
          conf.year,
          1,
          debouncedQuery || undefined,
          controller.signal
        );
        if (id === fetchId.current) {
          setPapers(result.papers);
          setTotal(result.total);
          setPage(1);
        }
      } catch (e: unknown) {
        const err = e as Error;
        if (err.name !== "AbortError" && id === fetchId.current) {
          setError(err.message);
        }
      } finally {
        if (id === fetchId.current) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    })();

    return () => controller.abort();
  }, [conf, debouncedQuery, picksOnly]);

  const loadMore = async () => {
    const id = fetchId.current;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const result = await fetchPapers(
        conf.filter,
        conf.year,
        nextPage,
        debouncedQuery || undefined
      );
      if (id === fetchId.current) {
        setPapers((prev) => [...prev, ...result.papers]);
        setPage(nextPage);
      }
    } catch (e: unknown) {
      const err = e as Error;
      if (id === fetchId.current) setError(err.message);
    } finally {
      if (id === fetchId.current) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-800/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="text-neutral-500 hover:text-neutral-300 transition text-sm"
          >
            &larr; Labs
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            CV Study Hub
          </h1>
          <p className="text-neutral-500 text-sm">
            컴퓨터 비전 3대 학회 논문 리스트 — CVPR · ICCV · ECCV
          </p>
        </div>

        {/* Tabs row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {picksOnly
            ? PICK_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setPickTab(t.id);
                    try { localStorage.setItem("cv-study-pick-tab", t.id); } catch {}
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    pickTab === t.id
                      ? "bg-white text-black"
                      : "bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
                  }`}
                >
                  {t.label}
                </button>
              ))
            : CONFERENCES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setConf(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    conf.id === c.id
                      ? "bg-white text-black"
                      : "bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
                  }`}
                >
                  {c.name} {c.year}
                </button>
              ))}

          <span className="w-px h-5 bg-neutral-800 mx-1" />

          <button
            onClick={() => {
              const next = !picksOnly;
              setPicksOnly(next);
              try { localStorage.setItem("cv-study-picks", next ? "1" : "0"); } catch {}
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              picksOnly
                ? "bg-blue-500 text-white"
                : "bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
            }`}
          >
            <span
              className={`inline-block w-3.5 h-3.5 rounded border transition-all ${
                picksOnly
                  ? "bg-white/90 border-white/90"
                  : "border-neutral-500"
              }`}
            >
              {picksOnly && (
                <svg
                  viewBox="0 0 16 16"
                  className="w-full h-full text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M4 8l3 3 5-5" />
                </svg>
              )}
            </span>
            Picks
          </button>
        </div>

        {/* Search (all papers mode only) */}
        {!picksOnly && (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers..."
            className="w-full bg-neutral-800 text-neutral-200 px-4 py-2.5 rounded-lg text-sm border border-neutral-700 outline-none focus:border-neutral-500 placeholder:text-neutral-600 mb-6"
          />
        )}

        {/* Count */}
        <p className="text-sm text-neutral-500 mb-4">
          {picksOnly ? (
            <>
              <span className="text-neutral-200 font-semibold">
                {currentPicks.length}
              </span>{" "}
              picks
            </>
          ) : initialLoad ? (
            <span className="inline-block h-4 w-24 bg-neutral-800 rounded animate-pulse" />
          ) : error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <>
              <span className="text-neutral-200 font-semibold">
                {total.toLocaleString()}
              </span>{" "}
              papers
            </>
          )}
        </p>

        {/* List */}
        {picksOnly ? (
          <ol className="space-y-1 list-none">
            {currentPicks.map((pick, i) => (
              <motion.li
                key={pick.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/labs/cv-study/picks/${pick.id}`}
                  className="flex items-baseline gap-3 py-2 px-3 -mx-3 rounded-md hover:bg-neutral-800/60 transition group"
                >
                  <span className="text-neutral-600 text-xs font-mono shrink-0 w-8 text-right">
                    {i + 1}
                  </span>
                  <span className="text-sm text-neutral-300 group-hover:text-blue-400 transition-colors leading-snug flex-1">
                    {pick.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-500 shrink-0">
                    {pick.tagKo}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ol>
        ) : (
          <>
            {initialLoad ? (
              <div className="space-y-1">
                {[72, 85, 60, 78, 65, 90, 68, 82, 58, 75, 88, 63, 80, 70, 77].map((w, i) => (
                  <div key={i} className="flex items-baseline gap-3 py-2 px-3">
                    <span className="shrink-0 w-8 h-3 bg-neutral-800 rounded animate-pulse" />
                    <span
                      className="h-4 bg-neutral-800 rounded animate-pulse"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ol className="space-y-1 list-none">
                {papers.map((p, i) => (
                  <motion.li
                    key={`${p.url}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.008, 0.3) }}
                  >
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-baseline gap-3 py-2 px-3 -mx-3 rounded-md hover:bg-neutral-800/60 transition group"
                    >
                      <span className="text-neutral-600 text-xs font-mono shrink-0 w-8 text-right">
                        {i + 1}
                      </span>
                      <span className="text-sm text-neutral-300 group-hover:text-blue-400 transition-colors leading-snug">
                        {p.title}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ol>
            )}

            {papers.length > 0 && papers.length < total && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-sm rounded-lg transition disabled:opacity-50"
                >
                  {loading
                    ? "Loading..."
                    : `Load More (${papers.length} / ${total.toLocaleString()})`}
                </button>
              </div>
            )}

            {!loading && papers.length === 0 && !error && (
              <p className="text-center py-16 text-neutral-600">
                No papers found
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
