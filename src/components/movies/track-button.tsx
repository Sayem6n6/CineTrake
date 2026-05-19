"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MovieSummary, WatchlistMovie } from "@/lib/types";

type TrackButtonProps = {
  movie:
    | MovieSummary
    | Pick<
        WatchlistMovie,
        | "tmdb_id"
        | "title"
        | "overview"
        | "poster_path"
        | "release_date"
        | "genre_names"
        | "popularity"
        | "hype_score"
      >;
  isTracked?: boolean;
  mode?: "add" | "remove";
  className?: string;
  compact?: boolean;
};

export function TrackButton({
  movie,
  isTracked = false,
  mode = "add",
  className,
  compact = false,
}: TrackButtonProps) {
  const router = useRouter();
  const [tracked, setTracked] = useState(isTracked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tmdbId = "id" in movie ? movie.id : movie.tmdb_id;

  async function handleClick() {
    setLoading(true);
    setError("");
    const method = mode === "remove" || tracked ? "DELETE" : "POST";
    const url = method === "DELETE" ? `/api/watchlist/${tmdbId}` : "/api/watchlist";

    const response = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body:
        method === "POST"
          ? JSON.stringify({
              tmdb_id: tmdbId,
              title: movie.title,
              overview: movie.overview,
              poster_path: movie.poster_path,
              release_date: movie.release_date,
              genre_names: movie.genre_names,
              popularity: movie.popularity,
              hype_score: movie.hype_score,
            })
          : undefined,
    });

    if (response.status === 401) {
      setLoading(false);
      router.push("/login?message=Log in to track movies.");
      return;
    }

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(result?.error ?? "Could not update your watchlist.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setTracked(method === "POST");
    router.refresh();
  }

  const removing = mode === "remove" || tracked;

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        className={className}
        disabled={loading}
        onClick={handleClick}
        size={compact || mode === "remove" ? "sm" : "default"}
        title={error || undefined}
        variant={removing ? "secondary" : "default"}
      >
        {mode === "remove" ? (
          <Trash2 className="h-4 w-4" />
        ) : tracked ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {loading
          ? "Saving..."
          : mode === "remove"
            ? "Remove"
            : tracked
              ? "Tracked"
              : "Track"}
      </Button>
      {error ? (
        <span className="max-w-56 text-right text-xs leading-5 text-red-500" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
