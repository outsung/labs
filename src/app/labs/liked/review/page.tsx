"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { items as allItems, type LikedItem } from "../data/items";
import { clusters } from "../data/taxonomy";
import { posts } from "../data/posts";

const LIKE_TYPES = ["tech-info", "idea-tech", "reference-simple", "reference-idea"] as const;
const STORAGE_KEY = "liked-review-drafts";

interface ReviewDraft {
  likeType?: string;
  note?: string;
  ideaLinks?: string[];
  reviewedAt?: string;
}

interface IdeaDraft {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface DraftState {
  items: Record<string, ReviewDraft>;
  __ideas__: IdeaDraft[];
}

function loadDrafts(): DraftState {
  if (typeof window === "undefined") return { items: {}, __ideas__: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: {}, __ideas__: [] };
}

function saveDrafts(state: DraftState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const SOURCE_COLORS: Record<string, string> = {
  x: "text-sky-400",
  threads: "text-purple-400",
  github: "text-green-400",
};

export default function ReviewPage() {
  const [drafts, setDrafts] = useState<DraftState>({ items: {}, __ideas__: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterUnreviewed, setFilterUnreviewed] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDesc, setNewIdeaDesc] = useState("");
  const [newIdeaTags, setNewIdeaTags] = useState("");

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...allItems];
    if (sourceFilter) result = result.filter((i) => i.source === sourceFilter);
    if (filterUnreviewed) {
      result = result.filter((i) => !drafts.items[i.id]?.note && !i.note);
    }
    return result;
  }, [sourceFilter, filterUnreviewed, drafts.items]);

  const currentItem = filteredItems[currentIndex];
  const reviewedCount = allItems.filter((i) => drafts.items[i.id]?.note || i.note).length;

  const updateDraft = useCallback((id: string, update: Partial<ReviewDraft>) => {
    setDrafts((prev) => {
      const next = {
        ...prev,
        items: {
          ...prev.items,
          [id]: {
            ...prev.items[id],
            ...update,
            reviewedAt: new Date().toISOString(),
          },
        },
      };
      saveDrafts(next);
      return next;
    });
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, filteredItems.length - 1));
  }, [filteredItems.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); goNext(); }
      if (e.key === "Tab" && e.shiftKey) { e.preventDefault(); goPrev(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  function createIdea() {
    if (!newIdeaTitle.trim()) return;
    const idea: IdeaDraft = {
      id: `idea-${Date.now()}`,
      title: newIdeaTitle.trim(),
      description: newIdeaDesc.trim(),
      tags: newIdeaTags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDrafts((prev) => {
      const next = { ...prev, __ideas__: [...prev.__ideas__, idea] };
      saveDrafts(next);
      return next;
    });
    setNewIdeaTitle("");
    setNewIdeaDesc("");
    setNewIdeaTags("");
    setShowNewIdea(false);
  }

  function toggleIdeaLink(itemId: string, ideaId: string) {
    const current = drafts.items[itemId]?.ideaLinks || [];
    const updated = current.includes(ideaId)
      ? current.filter((id) => id !== ideaId)
      : [...current, ideaId];
    updateDraft(itemId, { ideaLinks: updated });
  }

  function downloadNotes() {
    const output: Record<string, unknown> = {};
    // Item reviews
    for (const [id, draft] of Object.entries(drafts.items)) {
      if (draft.note || draft.likeType || (draft.ideaLinks && draft.ideaLinks.length > 0)) {
        output[id] = draft;
      }
    }
    // Ideas
    if (drafts.__ideas__.length > 0) {
      output["__ideas__"] = drafts.__ideas__;
    }
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <Nav />
          <p className="text-zinc-500 mt-16">
            {filterUnreviewed ? "All items reviewed!" : "No items found."}
          </p>
        </div>
      </div>
    );
  }

  const draft = drafts.items[currentItem.id] || {};
  const post = posts[currentItem.id];
  const clusterLabel = clusters.find((c) => c.id === currentItem.cluster)?.label;
  const images = (currentItem.platformMeta?.images as string[]) ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <Nav />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-6">
          <div>
            <h1 className="text-xl font-bold text-white">Review</h1>
            <p className="text-xs text-zinc-500 mt-1">{reviewedCount}/{allItems.length} reviewed</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterUnreviewed(!filterUnreviewed)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                filterUnreviewed ? "bg-white text-black" : "bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              Unreviewed only
            </button>
            <button
              onClick={downloadNotes}
              className="rounded-lg bg-white text-black px-4 py-1.5 text-xs font-medium hover:bg-zinc-200 transition-colors"
            >
              Save All ↓
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/20 transition-all duration-300"
            style={{ width: `${(reviewedCount / allItems.length) * 100}%` }}
          />
        </div>

        {/* Source filter */}
        <div className="flex gap-1.5 mb-6">
          {["x", "threads", "github"].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(sourceFilter === src ? null : src)}
              className={`rounded-lg px-3 py-1 text-xs transition-all ${
                sourceFilter === src ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-zinc-600">{currentIndex + 1} / {filteredItems.length}</span>
          <div className="flex gap-2">
            <button onClick={goPrev} disabled={currentIndex === 0}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10 disabled:opacity-20">
              ← Prev
            </button>
            <button onClick={goNext} disabled={currentIndex === filteredItems.length - 1}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10 disabled:opacity-20">
              Next →
            </button>
          </div>
        </div>

        {/* Current item card */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {/* Image */}
          {images.length > 0 && !images[0]?.startsWith("images/") && (
            <div className="aspect-video overflow-hidden bg-white/[0.02]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[0]} alt="" className="w-full h-full object-cover opacity-80" />
            </div>
          )}

          <div className="p-6">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-medium ${SOURCE_COLORS[currentItem.source]}`}>
                {currentItem.source}
              </span>
              {clusterLabel && <span className="text-[10px] text-zinc-600">{clusterLabel}</span>}
              <Link href={`/labs/liked/${currentItem.id}`} className="text-[10px] text-zinc-600 hover:text-zinc-400 ml-auto">
                Detail →
              </Link>
            </div>

            <h2 className="text-lg font-semibold text-white mb-2">{currentItem.title || "(untitled)"}</h2>

            <p className="text-xs text-zinc-500 mb-1">{currentItem.author.handle} · {new Date(currentItem.savedAt).toLocaleDateString()}</p>

            {currentItem.summary && (
              <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-4">{currentItem.summary}</p>
            )}

            {/* Blog post preview */}
            {post && (
              <details className="mb-4">
                <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300">Blog post preview</summary>
                <div className="mt-2 rounded-lg bg-white/[0.03] p-3 text-xs text-zinc-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {post.replace(/^---[\s\S]*?---\n*/m, "").slice(0, 500)}
                </div>
              </details>
            )}

            {/* Editable fields */}
            <div className="space-y-4 mt-4 pt-4 border-t border-white/[0.06]">
              {/* likeType */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">Like Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {LIKE_TYPES.map((lt) => (
                    <button
                      key={lt}
                      onClick={() => updateDraft(currentItem.id, { likeType: lt })}
                      className={`rounded-lg px-3 py-1.5 text-xs transition-all border ${
                        (draft.likeType || currentItem.likeType) === lt
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {lt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">왜 좋아했는지?</label>
                <textarea
                  value={draft.note ?? currentItem.note ?? ""}
                  onChange={(e) => updateDraft(currentItem.id, { note: e.target.value })}
                  placeholder="이 항목을 좋아한 이유를 적어주세요..."
                  rows={3}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              {/* Idea links */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 block">연결된 아이디어</label>
                {drafts.__ideas__.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {drafts.__ideas__.map((idea) => {
                      const linked = (draft.ideaLinks || []).includes(idea.id);
                      return (
                        <button
                          key={idea.id}
                          onClick={() => toggleIdeaLink(currentItem.id, idea.id)}
                          className={`rounded-lg px-2.5 py-1 text-xs transition-all border ${
                            linked
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {linked ? "✓ " : ""}{idea.title}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => setShowNewIdea(!showNewIdea)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  + 새 아이디어 만들기
                </button>

                {showNewIdea && (
                  <div className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
                    <input
                      value={newIdeaTitle}
                      onChange={(e) => setNewIdeaTitle(e.target.value)}
                      placeholder="아이디어 제목"
                      className="w-full rounded-lg border border-white/[0.06] bg-transparent px-2 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
                    />
                    <textarea
                      value={newIdeaDesc}
                      onChange={(e) => setNewIdeaDesc(e.target.value)}
                      placeholder="설명 (선택)"
                      rows={2}
                      className="w-full rounded-lg border border-white/[0.06] bg-transparent px-2 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none"
                    />
                    <input
                      value={newIdeaTags}
                      onChange={(e) => setNewIdeaTags(e.target.value)}
                      placeholder="태그 (쉼표 구분)"
                      className="w-full rounded-lg border border-white/[0.06] bg-transparent px-2 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
                    />
                    <button
                      onClick={createIdea}
                      className="rounded-lg bg-white text-black px-3 py-1.5 text-xs font-medium hover:bg-zinc-200 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-zinc-700 mt-4 text-center">Tab = next · Shift+Tab = prev</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="flex gap-4 text-xs">
      <Link href="/labs/liked" className="text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
      <span className="text-white font-medium">Review</span>
      <Link href="/labs/liked/ideas" className="text-zinc-500 hover:text-zinc-300 transition-colors">Ideas</Link>
    </div>
  );
}
