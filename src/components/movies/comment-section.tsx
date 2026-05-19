"use client";

import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MovieComment } from "@/lib/types";

function formatCommentDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function CommentSection({
  movieId,
  initialComments,
  isLoggedIn,
}: {
  movieId: number;
  initialComments: MovieComment[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/movies/${movieId}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setLoading(false);

    if (response.status === 401) {
      router.push("/login?message=Log in to comment on movies.");
      return;
    }

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(result?.error ?? "Could not post your comment.");
      return;
    }

    setComments((await response.json()) as MovieComment[]);
    setBody("");
    router.refresh();
  }

  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-2xl font-semibold tracking-tight">Comments</h2>
      </div>

      {isLoggedIn ? (
        <form className="mt-5" onSubmit={submit}>
          <textarea
            className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={500}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share your take on the release..."
            required
            value={body}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{body.length}/500</p>
            <Button disabled={loading || body.trim().length < 2} type="submit">
              {loading ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
          Log in to join the discussion.
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

      <div className="mt-6 space-y-3">
        {comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">@{comment.username}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCommentDate(comment.createdAt)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {comment.body}
              </p>
            </article>
          ))
        ) : (
          <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
            No comments yet. Be the first to call it.
          </p>
        )}
      </div>
    </section>
  );
}
