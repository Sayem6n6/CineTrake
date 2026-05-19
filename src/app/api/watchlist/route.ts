import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { WatchlistMovie } from "@/lib/types";

const watchlistSchema = z.object({
  tmdb_id: z.number(),
  title: z.string(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  genre_names: z.array(z.string()).nullable().optional(),
  popularity: z.number().nullable().optional(),
  hype_score: z.number().nullable().optional(),
});

type WatchlistDocument = Omit<WatchlistMovie, "id"> & {
  _id?: unknown;
  created_at: string;
};

function serializeMovie(movie: WatchlistDocument): WatchlistMovie {
  return {
    user_id: movie.user_id,
    tmdb_id: movie.tmdb_id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    genre_names: movie.genre_names,
    popularity: movie.popularity,
    hype_score: movie.hype_score,
    created_at: movie.created_at,
    id:
      movie._id && typeof movie._id === "object" && "toString" in movie._id
        ? String(movie._id.toString())
        : `${movie.user_id}-${movie.tmdb_id}`,
  };
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const data = await db
    .collection<WatchlistDocument>("watchlist_movies")
    .find({ user_id: user.id })
    .sort({ release_date: 1, created_at: -1 })
    .toArray();

  return NextResponse.json(data.map(serializeMovie));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = watchlistSchema.parse(await request.json());
  const db = await getDb();

  await db.collection("watchlist_movies").updateOne(
    {
      user_id: user.id,
      tmdb_id: body.tmdb_id,
    },
    {
      $set: {
        ...body,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      },
      $setOnInsert: {
        created_at: new Date().toISOString(),
      },
    },
    { upsert: true },
  );

  return NextResponse.json({ ok: true });
}
