import Link from "next/link";
import { ideas } from "../data/ideas";
import { items } from "../data/items";

export default function IdeasPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="flex gap-4 text-xs mb-8">
          <Link href="/labs/liked" className="text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
          <Link href="/labs/liked/review" className="text-zinc-500 hover:text-zinc-300 transition-colors">Review</Link>
          <span className="text-white font-medium">Ideas</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Ideas</h1>
        <p className="text-sm text-zinc-500 mb-8">{ideas.length} ideas</p>

        {ideas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 mb-2">No ideas yet.</p>
            <p className="text-xs text-zinc-600">
              Create ideas in the{" "}
              <Link href="/labs/liked/review" className="text-zinc-400 hover:text-white transition-colors">
                Review page
              </Link>
              {" "}and link them to items.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {ideas.map((idea) => {
              const linkedCount = idea.linkedItems?.length || 0;
              return (
                <Link
                  key={idea.id}
                  href={`/labs/liked/ideas/${idea.id}`}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium text-white mb-1">{idea.title}</h2>
                      {idea.description && (
                        <p className="text-xs text-zinc-500 line-clamp-2">{idea.description}</p>
                      )}
                      {idea.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {idea.tags.map((t) => (
                            <span key={t} className="text-[10px] text-zinc-600 px-1.5 py-0.5 rounded bg-white/[0.03]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-zinc-600">{linkedCount} items</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
