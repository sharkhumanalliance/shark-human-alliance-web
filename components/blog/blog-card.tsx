import Link from "next/link";
import type { BlogPost } from "@/data/blog-posts";

function getAuthorColor(author: BlogPost["author"]) {
  if (author === "finnley") return "border-sky-100 bg-sky-50/60 text-sky-800";
  if (author === "luna") return "border-cyan-100 bg-cyan-50/60 text-cyan-800";
  return "border-orange-100 bg-orange-50/60 text-orange-800";
}

function getCategoryColor(author: BlogPost["author"]) {
  if (author === "finnley") return "bg-sky-100 text-sky-800";
  if (author === "luna") return "bg-cyan-100 text-cyan-800";
  return "bg-orange-100 text-orange-800";
}

export function BlogCard({
  post,
  readMoreLabel,
}: {
  post: BlogPost;
  readMoreLabel: string;
}) {
  return (
    <article className="flex flex-col rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getCategoryColor(post.author)}`}
        >
          {post.category}
        </span>
        <span className="text-xs text-[var(--muted)]">{post.date}</span>
      </div>

      <h3 className="mt-4 text-xl font-semibold leading-snug text-[var(--brand-dark)]">
        {post.title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)]">
        {post.excerpt}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getAuthorColor(post.author)}`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {post.authorName}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
        >
          {readMoreLabel} &rarr;
        </Link>
      </div>
    </article>
  );
}
