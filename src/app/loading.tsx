import { MovieGridSkeleton } from "@/components/movies/movie-grid-skeleton";

export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
      <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
      <div className="mt-8 h-16 max-w-2xl animate-pulse rounded-xl bg-muted" />
      <MovieGridSkeleton />
    </section>
  );
}
