import { NextResponse } from "next/server";
import { getHypedUpcomingMovies } from "@/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");

  const movies = await getHypedUpcomingMovies({
    query: searchParams.get("q") ?? undefined,
    genre: searchParams.get("genre") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pages: 1,
  });

  return NextResponse.json({
    movies,
    nextPage: movies.length ? page + 1 : null,
  });
}
