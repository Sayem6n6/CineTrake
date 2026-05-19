import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

type RouteProps = {
  params: Promise<{ movieId: string }>;
};

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { movieId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  await db.collection("watchlist_movies").deleteOne({
    user_id: user.id,
    tmdb_id: Number(movieId),
  });

  return NextResponse.json({ ok: true });
}
