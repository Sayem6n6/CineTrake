import "server-only";

import { hasTmdbEnv } from "@/lib/env";
import { Genre, MovieDetail, MovieSummary, MovieVideo } from "@/lib/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  popularity?: number;
  vote_count?: number;
  runtime?: number | null;
  videos?: { results?: MovieVideo[] };
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character?: string;
      profile_path?: string | null;
    }>;
    crew?: Array<{
      id: number;
      name: string;
      job?: string;
      profile_path?: string | null;
    }>;
  };
};

type TmdbListResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

type MovieQuery = {
  query?: string;
  genre?: string;
  month?: string;
  sort?: string;
  page?: number;
  pages?: number;
};

function tmdbAuthParams(params: URLSearchParams) {
  if (!process.env.TMDB_ACCESS_TOKEN && process.env.TMDB_API_KEY) {
    params.set("api_key", process.env.TMDB_API_KEY);
  }
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidate = 60 * 30,
): Promise<T> {
  if (!hasTmdbEnv()) {
    throw new Error(
      "Missing TMDB credentials. Add TMDB_ACCESS_TOKEN or TMDB_API_KEY to .env.local.",
    );
  }

  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  tmdbAuthParams(query);

  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (process.env.TMDB_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.TMDB_ACCESS_TOKEN}`;
  }

  const response = await fetch(`${TMDB_BASE_URL}${path}?${query.toString()}`, {
    headers,
    next: { revalidate },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`TMDB request failed (${response.status}): ${detail}`);
  }

  return response.json() as Promise<T>;
}

function getMonthRange(month?: string) {
  const range: Record<string, string> = {};
  if (!month || month === "all") return range;
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) return range;

  const start = `${year}-${String(monthIndex).padStart(2, "0")}-01`;
  const endDate = new Date(year, monthIndex, 0);
  const end = `${year}-${String(monthIndex).padStart(2, "0")}-${String(
    endDate.getDate(),
  ).padStart(2, "0")}`;

  range["primary_release_date.gte"] = start;
  range["primary_release_date.lte"] = end;

  return range;
}

function mapMovie(
  movie: TmdbMovie,
  genreMap: Map<number, string>,
  trendingRank?: number,
): MovieSummary {
  const genreIds = movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [];
  const popularity = movie.popularity ?? 0;
  const voteCount = movie.vote_count ?? 0;
  const trendingBoost = trendingRank ? Math.max(35 - trendingRank, 5) : 0;
  const hypeScore = popularity + voteCount * 0.08 + trendingBoost;

  return {
    id: movie.id,
    title: movie.title ?? movie.name ?? "Untitled",
    overview: movie.overview ?? "No overview is available yet.",
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date ?? null,
    genre_ids: genreIds,
    genre_names: genreIds.map((id) => genreMap.get(id)).filter(Boolean) as string[],
    popularity,
    vote_count: voteCount,
    hype_score: Number(hypeScore.toFixed(1)),
    trending_rank: trendingRank,
  };
}

function sortMovies(movies: MovieSummary[], sort = "hype") {
  return [...movies].sort((a, b) => {
    if (sort === "release") {
      return (a.release_date ?? "9999").localeCompare(b.release_date ?? "9999");
    }

    if (sort === "popularity") {
      return b.popularity - a.popularity;
    }

    return b.hype_score - a.hype_score;
  });
}

export async function getGenres(): Promise<Genre[]> {
  const response = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", {
    language: "en-US",
  });

  return response.genres;
}

export async function getHypedUpcomingMovies(query: MovieQuery = {}) {
  const genres = await getGenres();
  const genreMap = new Map(genres.map((genre) => [genre.id, genre.name]));
  const today = new Date().toISOString().slice(0, 10);
  const startPage = query.page ?? 1;
  const pageCount = query.pages ?? 2;

  if (query.query) {
    const search = await searchMovies(query.query, startPage);
    let movies = search.filter((movie) => !movie.release_date || movie.release_date >= today);

    if (query.genre && query.genre !== "all") {
      const genreId = Number(query.genre);
      movies = movies.filter((movie) => movie.genre_ids.includes(genreId));
    }

    const range = getMonthRange(query.month);
    if (range["primary_release_date.gte"] && range["primary_release_date.lte"]) {
      movies = movies.filter((movie) => {
        if (!movie.release_date) return false;
        return (
          movie.release_date >= range["primary_release_date.gte"] &&
          movie.release_date <= range["primary_release_date.lte"]
        );
      });
    }

    return sortMovies(movies, query.sort);
  }

  const upcomingRequests = Array.from({ length: pageCount }, (_, index) =>
    tmdbFetch<TmdbListResponse<TmdbMovie>>("/movie/upcoming", {
      language: "en-US",
      page: startPage + index,
      region: "US",
    }),
  );

  const [upcomingPages, trending] = await Promise.all([
    Promise.all(upcomingRequests),
    tmdbFetch<TmdbListResponse<TmdbMovie>>("/trending/movie/week", {
      language: "en-US",
    }),
  ]);

  const trendingRanks = new Map(
    trending.results.map((movie, index) => [movie.id, index + 1]),
  );

  let movies = upcomingPages
    .flatMap((page) => page.results)
    .map((movie) => mapMovie(movie, genreMap, trendingRanks.get(movie.id)))
    .filter((movie) => !movie.release_date || movie.release_date >= today);

  if (query.genre && query.genre !== "all") {
    const genreId = Number(query.genre);
    movies = movies.filter((movie) => movie.genre_ids.includes(genreId));
  }

  const range = getMonthRange(query.month);
  if (range["primary_release_date.gte"] && range["primary_release_date.lte"]) {
    movies = movies.filter((movie) => {
      if (!movie.release_date) return false;
      return (
        movie.release_date >= range["primary_release_date.gte"] &&
        movie.release_date <= range["primary_release_date.lte"]
      );
    });
  }

  return sortMovies(movies, query.sort);
}

export async function searchMovies(searchQuery: string, page = 1) {
  const genres = await getGenres();
  const genreMap = new Map(genres.map((genre) => [genre.id, genre.name]));
  const response = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/search/movie", {
    query: searchQuery,
    language: "en-US",
    include_adult: "false",
    page,
  });

  return sortMovies(response.results.map((movie) => mapMovie(movie, genreMap)), "hype");
}

export async function getMovieDetails(id: string): Promise<MovieDetail> {
  const genres = await getGenres();
  const genreMap = new Map(genres.map((genre) => [genre.id, genre.name]));
  const movie = await tmdbFetch<TmdbMovie>(`/movie/${id}`, {
    language: "en-US",
    append_to_response: "videos,credits",
  });

  const summary = mapMovie(movie, genreMap);
  const videos = movie.videos?.results ?? [];
  const trailer =
    videos.find(
      (video) =>
        video.site === "YouTube" &&
        video.official &&
        (video.type === "Trailer" || video.type === "Teaser"),
    ) ??
    videos.find((video) => video.site === "YouTube" && video.type === "Trailer") ??
    null;

  const director =
    movie.credits?.crew?.find((person) => person.job === "Director") ?? null;

  return {
    ...summary,
    runtime: movie.runtime ?? null,
    genres: movie.genres ?? summary.genre_ids.map((genreId) => ({
      id: genreId,
      name: genreMap.get(genreId) ?? "Unknown",
    })),
    genre_names: movie.genres?.map((genre) => genre.name) ?? summary.genre_names,
    cast: (movie.credits?.cast ?? []).slice(0, 8),
    director,
    trailer,
  };
}
