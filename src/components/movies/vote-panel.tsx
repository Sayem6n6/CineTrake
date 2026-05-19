"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MovieVoteSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VotePanel({ initialSummary }: { initialSummary: MovieVoteSummary }) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState<"hype" | "unhype" | null>(null);
  const [error, setError] = useState("");

  async function vote(value: "hype" | "unhype") {
    setLoading(value);
    setError("");

    const response = await fetch(`/api/movies/${summary.movieId}/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vote: value }),
    });

    setLoading(null);

    if (response.status === 401) {
      router.push("/login?message=Log in to hype movies.");
      return;
    }

    if (!response.ok) {
      setError("Could not save your vote.");
      return;
    }

    setSummary((await response.json()) as MovieVoteSummary);
    router.refresh();
  }

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight">Audience pulse</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Vote once per account. You can switch sides anytime.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          className={cn(summary.userVote === "hype" && "ring-2 ring-ring")}
          disabled={Boolean(loading)}
          onClick={() => vote("hype")}
          variant={summary.userVote === "hype" ? "default" : "secondary"}
        >
          <ThumbsUp className="h-4 w-4" />
          Hype {summary.hype}
        </Button>
        <Button
          className={cn(summary.userVote === "unhype" && "ring-2 ring-ring")}
          disabled={Boolean(loading)}
          onClick={() => vote("unhype")}
          variant={summary.userVote === "unhype" ? "default" : "secondary"}
        >
          <ThumbsDown className="h-4 w-4" />
          Unhype {summary.unhype}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
