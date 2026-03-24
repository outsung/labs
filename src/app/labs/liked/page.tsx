"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { items, type LikedItem } from "./data/items";
import { clusters } from "./data/taxonomy";

const SOURCE_COLORS: Record<string, string> = {
  x: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  threads: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  github: "bg-green-500/10 text-green-400 border-green-500/20",
};

const SOURCE_LABELS: Record<string, string> = {
  x: "X",
  threads: "Threads",
  github: "GitHub",
};

function ItemCard({ item }: { item: LikedItem }) {
  const clusterLabel = clusters.find((c) => c.id === item.cluster)?.label;
  const firstImage = (item.platformMeta?.images as string[])?.[0];
  const isLocalImage = firstImage?.startsWith("images/");

  return (
    <Link
      href={`/labs/liked/${item.id}`}
      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200"
    >
      {firstImage && !isLocalImage && (
        <div className="aspect-video overflow-hidden bg-white/[0.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={firstImage}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${SOURCE_COLORS[item.source]}`}>
            {SOURCE_LABELS[item.source]}
          </span>
          {clusterLabel && (
            <span className="text-[10px] text-zinc-500">{clusterLabel}</span>
          )}
          {!clusterLabel && item.cluster && (
            <span className="text-[10px] text-zinc-600">{item.cluster}</span>
          )}
        </div>
        <h3 className="text-sm font-medium text-zinc-200 line-clamp-2 leading-snug mb-1.5 group-hover:text-white transition-colors">
          {item.title || "(untitled)"}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
          {item.summary?.slice(0, 120)}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-zinc-600">{item.author.handle || item.author.name}</span>
          {item.likeType && (
            <span className="text-[10px] text-zinc-600 ml-auto">{item.likeType}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function LikedHomePage() {
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [clusterFilter, setClusterFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...items];
    if (sourceFilter) result = result.filter((i) => i.source === sourceFilter);
    if (clusterFilter) result = result.filter((i) => i.cluster === clusterFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.summary?.toLowerCase().includes(q) ||
          i.tags?.some((t) => t.includes(q)) ||
          i.author.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sourceFilter, clusterFilter, search]);

  const stats = {
    total: items.length,
    x: items.filter((i) => i.source === "x").length,
    threads: items.filter((i) => i.source === "threads").length,
    github: items.filter((i) => i.source === "github").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        {/* Nav */}
        <div className="flex gap-4 text-xs mb-8">
          <Link href="/labs" className="text-zinc-600 hover:text-zinc-400 transition-colors">← labs</Link>
          <span className="text-white font-medium">Home</span>
          <Link href="/labs/liked/review" className="text-zinc-500 hover:text-zinc-300 transition-colors">Review</Link>
          <Link href="/labs/liked/ideas" className="text-zinc-500 hover:text-zinc-300 transition-colors">Ideas</Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Liked</h1>
          <p className="text-sm text-zinc-500 mt-2">
            {stats.total} items curated from X ({stats.x}), Threads ({stats.threads}), GitHub ({stats.github})
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/[0.15]"
          />

          {/* Source filter */}
          <div className="flex gap-1.5">
            {(["x", "threads", "github"] as const).map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(sourceFilter === src ? null : src)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all border ${
                  sourceFilter === src
                    ? SOURCE_COLORS[src]
                    : "border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]"
                }`}
              >
                {SOURCE_LABELS[src]}
              </button>
            ))}
          </div>
        </div>

        {/* Cluster chips */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          <button
            onClick={() => setClusterFilter(null)}
            className={`rounded-full px-3 py-1 text-xs transition-all ${
              !clusterFilter ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All
          </button>
          {clusters.map((c) => {
            const count = items.filter((i) => i.cluster === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setClusterFilter(clusterFilter === c.id ? null : c.id)}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  clusterFilter === c.id ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {c.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-xs text-zinc-600 mb-4">{filtered.length} items</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
