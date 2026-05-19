import { MovieExplorer } from "@/components/movies/movie-explorer";
import { getGenres, getHypedUpcomingMovies } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    month?: string;
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [genres, movies] = await Promise.all([
    getGenres(),
    getHypedUpcomingMovies({
      query: params.q,
      genre: params.genre,
      month: params.month,
      sort: params.sort,
    }),
  ]);

  return (
    <MovieExplorer
      genres={genres}
      movies={movies}
      initialFilters={{
        q: params.q ?? "",
        genre: params.genre ?? "all",
        month: params.month ?? "all",
        sort: params.sort ?? "hype",
      }}
    />
  );
}
