"use client";

import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { MovieCard } from "@/components/movies/movie-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Genre, MovieSummary } from "@/lib/types";

type Filters = {
  q: string;
  genre: string;
  month: string;
  sort: string;
};

function months() {
  const base = new Date();
  return Array.from({ length: 12 }).map((_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() + index, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(date);

    return { value, label };
  });
}

export function MovieExplorer({
  genres,
  movies,
  initialFilters,
}: {
  genres: Genre[];
  movies: MovieSummary[];
  initialFilters: Filters;
}) {
  const explorerKey = `${initialFilters.q}:${initialFilters.genre}:${initialFilters.month}:${initialFilters.sort}:${movies.map((movie) => movie.id).join(",")}`;

  return (
    <MovieExplorerInner
      key={explorerKey}
      genres={genres}
      initialFilters={initialFilters}
      movies={movies}
    />
  );
}

function MovieExplorerInner({
  genres,
  movies,
  initialFilters,
}: {
  genres: Genre[];
  movies: MovieSummary[];
  initialFilters: Filters;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [visibleMovies, setVisibleMovies] = useState(movies);
  const [nextPage, setNextPage] = useState(3);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  function update(formData: FormData) {
    const params = new URLSearchParams();
    for (const key of ["q", "genre", "month", "sort"]) {
      const value = String(formData.get(key) ?? "");
      if (value && value !== "all" && !(key === "sort" && value === "hype")) {
        params.set(key, value);
      }
    }

    startTransition(() => {
      router.push(params.toString() ? `/?${params.toString()}` : "/");
    });
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (initialFilters.q) params.set("q", initialFilters.q);
    if (initialFilters.genre !== "all") params.set("genre", initialFilters.genre);
    if (initialFilters.month !== "all") params.set("month", initialFilters.month);
    if (initialFilters.sort !== "hype") params.set("sort", initialFilters.sort);

    const response = await fetch(`/api/movies?${params.toString()}`);
    const result = (await response.json()) as {
      movies: MovieSummary[];
      nextPage: number | null;
    };

    setVisibleMovies((current) => {
      const existing = new Set(current.map((movie) => movie.id));
      const fresh = result.movies.filter((movie) => !existing.has(movie.id));
      return [...current, ...fresh];
    });
    setNextPage(result.nextPage ?? nextPage + 1);
    setHasMore(Boolean(result.nextPage) && result.movies.length > 0);
    setLoadingMore(false);
  }, [hasMore, initialFilters, loadingMore, nextPage]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "700px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
            Ranked by popularity, vote count, and trend lift
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
            Upcoming movies, sorted by public heat.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Discover release dates, trailers, cast details, and build a private
            watchlist for the films you actually want to remember.
          </p>
        </div>

        <form
          action={update}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            Discovery controls
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="relative sm:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                defaultValue={initialFilters.q}
                name="q"
                placeholder="Search upcoming movies"
              />
            </div>
            <Select defaultValue={initialFilters.genre} name="genre">
              <option value="all">All genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </Select>
            <Select defaultValue={initialFilters.month} name="month">
              <option value="all">Any release month</option>
              {months().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Select>
            <Select defaultValue={initialFilters.sort} name="sort">
              <option value="hype">Sort by hype</option>
              <option value="popularity">Sort by popularity</option>
              <option value="release">Sort by release date</option>
            </Select>
            <Button disabled={pending} type="submit">
              {pending ? "Filtering..." : "Apply filters"}
            </Button>
          </div>
        </form>
      </div>

      {visibleMovies.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-lg border bg-card p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">No movies found.</h2>
          <p className="mt-2 text-muted-foreground">
            Try a broader search, another genre, or a different release month.
          </p>
        </div>
      )}

      {visibleMovies.length ? (
        <div ref={loadMoreRef} className="mt-10 flex justify-center">
          {hasMore ? (
            <Button disabled={loadingMore} onClick={loadMore} variant="secondary">
              {loadingMore ? "Loading more..." : "Load more movies"}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">You have reached the end of this reel.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
