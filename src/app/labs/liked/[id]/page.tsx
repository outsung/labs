import Link from "next/link";
import { items, getItemById } from "../data/items";
import { clusters } from "../data/taxonomy";
import { getPostById } from "../data/posts";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return items.map((item) => ({ id: item.id }));
}

export default async function LikedItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItemById(id);
  if (!item) notFound();

  const post = getPostById(id);
  const clusterLabel = clusters.find((c) => c.id === item.cluster)?.label ?? item.cluster;
  const images = (item.platformMeta?.images as string[]) ?? [];
  const externalLinks = (item.platformMeta?.externalLinks as Array<{ display: string; url: string }>) ?? [];
  const language = item.platformMeta?.language as string | undefined;
  const starsCount = item.platformMeta?.starsCount as number | undefined;
  const topics = (item.platformMeta?.topics as string[]) ?? [];

  const sourceColor = {
    x: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    threads: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    github: "text-green-400 bg-green-500/10 border-green-500/20",
  }[item.source];

  // Simple markdown-to-html (for blog posts)
  function renderMarkdown(md: string) {
    // Remove frontmatter
    const body = md.replace(/^---[\s\S]*?---\n*/m, "");
    // Convert headers, bold, links, lists
    return body
      .split("\n\n")
      .map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="text-lg font-semibold text-white mt-6 mb-3">
              {block.replace("## ", "")}
            </h2>
          );
        }
        if (block.startsWith("- ")) {
          const listItems = block.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={i} className="list-disc list-inside space-y-1 mb-4">
              {listItems.map((li, j) => (
                <li key={j} className="text-sm text-zinc-300 leading-relaxed">
                  {li.replace("- ", "")}
                </li>
              ))}
            </ul>
          );
        }
        if (block.trim()) {
          return (
            <p key={i} className="text-sm text-zinc-300 leading-relaxed mb-4">
              {block}
            </p>
          );
        }
        return null;
      })
      .filter(Boolean);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {/* Nav */}
        <div className="flex gap-4 text-xs">
          <Link href="/labs/liked" className="text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
          <Link href="/labs/liked/review" className="text-zinc-500 hover:text-zinc-300 transition-colors">Review</Link>
          <Link href="/labs/liked/ideas" className="text-zinc-500 hover:text-zinc-300 transition-colors">Ideas</Link>
        </div>

        <article className="mt-6">
          {/* Images */}
          {images.length > 0 && (
            <div className="rounded-xl overflow-hidden mb-6 bg-white/[0.02]">
              {images.filter((img) => !img.startsWith("images/")).slice(0, 3).map((img, i) => (
                <div key={i} className="aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Meta badges */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${sourceColor}`}>
              {item.source === "x" ? "X" : item.source === "threads" ? "Threads" : "GitHub"}
            </span>
            {clusterLabel && (
              <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded bg-white/[0.03]">
                {clusterLabel}
              </span>
            )}
            {item.likeType && (
              <span className="text-[10px] text-zinc-600 px-2 py-0.5 rounded bg-white/[0.02]">
                {item.likeType}
              </span>
            )}
            {item.mediaType && (
              <span className="text-[10px] text-zinc-600">{item.mediaType}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white tracking-tight leading-snug mb-3">
            {item.title || "(untitled)"}
          </h1>

          {/* Author + Date */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
            <span>{item.author.name}</span>
            <span className="text-zinc-700">·</span>
            <span>{item.author.handle}</span>
            <span className="text-zinc-700">·</span>
            <span>{new Date(item.savedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>

          {/* Blog Post (if exists) */}
          {post && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mb-8">
              {renderMarkdown(post)}
            </div>
          )}

          {/* Original Summary (if no post, or as fallback) */}
          {!post && item.summary && (
            <div className="rounded-xl bg-white/[0.03] p-5 mb-8">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {item.summary}
              </p>
            </div>
          )}

          {/* GitHub Meta */}
          {item.source === "github" && (
            <div className="flex flex-wrap gap-2 mb-6">
              {language && (
                <span className="text-xs text-zinc-400 px-2.5 py-1 rounded-lg bg-white/[0.03]">
                  {language}
                </span>
              )}
              {starsCount !== undefined && (
                <span className="text-xs text-zinc-400 px-2.5 py-1 rounded-lg bg-white/[0.03]">
                  ⭐ {starsCount.toLocaleString()}
                </span>
              )}
              {topics.length > 0 && topics.map((t) => (
                <span key={t} className="text-[10px] text-zinc-500 px-2 py-0.5 rounded bg-white/[0.02]">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {item.tags.map((tag) => (
                <span key={tag} className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-white/[0.04]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Note */}
          {item.note && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
              <p className="text-[10px] text-amber-400 font-medium mb-1">NOTE</p>
              <p className="text-sm text-zinc-300">{item.note}</p>
            </div>
          )}

          {/* External Links */}
          {externalLinks.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Links</p>
              {externalLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-sky-400 hover:text-sky-300 truncate mb-1 transition-colors"
                >
                  {link.display || link.url}
                </a>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="pt-6 border-t border-white/[0.06]">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              원본 보기 ↗
            </a>
          </div>
        </article>

        {/* Related items */}
        {clusterLabel && (
          <section className="mt-12">
            <h2 className="text-sm font-medium text-zinc-400 mb-4">
              Related in {clusterLabel}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items
                .filter((i) => i.id !== item.id && i.cluster === item.cluster)
                .slice(0, 4)
                .map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/labs/liked/${rel.id}`}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition-all"
                  >
                    <p className="text-sm text-zinc-200 line-clamp-2">{rel.title}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">{rel.author.handle}</p>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
