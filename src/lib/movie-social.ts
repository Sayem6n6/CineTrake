import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { MovieComment, MovieVoteSummary } from "@/lib/types";

type VoteDocument = {
  _id?: ObjectId;
  movieId: number;
  userId: string;
  vote: "hype" | "unhype";
  createdAt: Date;
  updatedAt: Date;
};

type CommentDocument = {
  _id: ObjectId;
  movieId: number;
  userId: string;
  username: string;
  body: string;
  createdAt: Date;
};

export async function getMovieVoteSummary(
  movieId: number,
  userId?: string,
): Promise<MovieVoteSummary> {
  const db = await getDb();
  const votes = await db
    .collection<VoteDocument>("movie_votes")
    .aggregate<{ _id: "hype" | "unhype"; count: number }>([
      { $match: { movieId } },
      { $group: { _id: "$vote", count: { $sum: 1 } } },
    ])
    .toArray();

  const userVote = userId
    ? await db.collection<VoteDocument>("movie_votes").findOne({ movieId, userId })
    : null;

  return {
    movieId,
    hype: votes.find((vote) => vote._id === "hype")?.count ?? 0,
    unhype: votes.find((vote) => vote._id === "unhype")?.count ?? 0,
    userVote: userVote?.vote ?? null,
  };
}

export async function setMovieVote(
  movieId: number,
  userId: string,
  vote: "hype" | "unhype",
) {
  const db = await getDb();
  await db.collection<VoteDocument>("movie_votes").updateOne(
    { movieId, userId },
    {
      $set: {
        movieId,
        userId,
        vote,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  return getMovieVoteSummary(movieId, userId);
}

export async function getMovieComments(movieId: number): Promise<MovieComment[]> {
  const db = await getDb();
  const comments = await db
    .collection<CommentDocument>("movie_comments")
    .find({ movieId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return comments.map((comment) => ({
    id: comment._id.toString(),
    movieId: comment.movieId,
    userId: comment.userId,
    username: comment.username,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
  }));
}

export async function addMovieComment({
  movieId,
  userId,
  username,
  body,
}: {
  movieId: number;
  userId: string;
  username: string;
  body: string;
}) {
  const db = await getDb();
  await db.collection<CommentDocument>("movie_comments").insertOne({
    _id: new ObjectId(),
    movieId,
    userId,
    username,
    body: body.trim(),
    createdAt: new Date(),
  });

  return getMovieComments(movieId);
}
