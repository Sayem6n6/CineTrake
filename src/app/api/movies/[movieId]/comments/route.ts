import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { addMovieComment, getMovieComments } from "@/lib/movie-social";

const commentSchema = z.object({
  body: z.string().trim().min(2).max(500),
});

type RouteProps = {
  params: Promise<{ movieId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { movieId } = await params;
  return NextResponse.json(await getMovieComments(Number(movieId)));
}

export async function POST(request: Request, { params }: RouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId } = await params;
  const { body } = commentSchema.parse(await request.json());
  const comments = await addMovieComment({
    movieId: Number(movieId),
    userId: user.id,
    username: user.username,
    body,
  });

  return NextResponse.json(comments);
}
