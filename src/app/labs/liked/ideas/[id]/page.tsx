import Link from "next/link";
import { ideas, getIdeaById } from "../../data/ideas";
import { items, getItemById } from "../../data/items";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return ideas.map((idea) => ({ id: idea.id }));
}

const SOURCE_COLORS: Record<string, string> = {
  x: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  threads: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  github: "text-green-400 bg-green-500/10 border-green-500/20",
};

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = getIdeaById(id);
  if (!idea) notFound();

  const linkedItems = (idea.linkedItems || [])
    .map((itemId) => getItemById(itemId))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="flex gap-4 text-xs mb-8">
          <Link href="/labs/liked" className="text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
          <Link href="/labs/liked/review" className="text-zinc-500 hover:text-zinc-300 transition-colors">Review</Link>
          <Link href="/labs/liked/ideas" className="text-zinc-500 hover:text-zinc-300 transition-colors">Ideas</Link>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">{idea.title}</h1>

        {idea.description && (
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">{idea.description}</p>
        )}

        {idea.tags?.length > 0 && (
          <div className="flex gap-1.5 mb-6">
            {idea.tags.map((t) => (
              <span key={t} className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-white/[0.04]">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-white/[0.06] pt-6">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">
            Linked Items ({linkedItems.length})
          </h2>

          {linkedItems.length === 0 ? (
            <p className="text-xs text-zinc-600">No items linked yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {linkedItems.map((item) => {
                if (!item) return null;
                return (
                  <Link
                    key={item.id}
                    href={`/labs/liked/${item.id}`}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${SOURCE_COLORS[item.source]}`}>
                        {item.source}
                      </span>
                      {item.likeType && (
                        <span className="text-[10px] text-zinc-600">{item.likeType}</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-200 line-clamp-2">{item.title}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">{item.author.handle}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
