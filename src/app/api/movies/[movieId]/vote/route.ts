import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { setMovieVote } from "@/lib/movie-social";

const voteSchema = z.object({
  vote: z.enum(["hype", "unhype"]),
});

type RouteProps = {
  params: Promise<{ movieId: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId } = await params;
  const { vote } = voteSchema.parse(await request.json());
  const summary = await setMovieVote(Number(movieId), user.id, vote);

  return NextResponse.json(summary);
}
