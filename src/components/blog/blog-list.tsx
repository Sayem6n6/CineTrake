import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/lib/types";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">No posts yet.</h2>
        <p className="mt-2 text-muted-foreground">Approved articles will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <article key={post.id} className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{post.status}</Badge>
            <span className="text-sm text-muted-foreground">by @{post.authorName}</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{post.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
          {post.status === "approved" ? (
            <Button asChild className="mt-4" variant="secondary">
              <Link href={`/blog/${post.slug}`}>Read post</Link>
            </Button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
