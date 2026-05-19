import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Flame, UserRound } from "lucide-react";
import { AdSlot } from "@/components/ads/ad-slot";
import { CommentSection } from "@/components/movies/comment-section";
import { Countdown } from "@/components/movies/countdown";
import { TrackButton } from "@/components/movies/track-button";
import { VotePanel } from "@/components/movies/vote-panel";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getMovieComments, getMovieVoteSummary } from "@/lib/movie-social";
import { getMovieDetails } from "@/lib/tmdb";
import { formatDate, imageUrl, scoreLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovieDetails(id).catch(() => null);

  if (!movie) notFound();

  const user = await getCurrentUser();
  const saved = user
    ? await (await getDb())
        .collection("watchlist_movies")
        .findOne({ user_id: user.id, tmdb_id: movie.id })
    : null;
  const [voteSummary, comments] = await Promise.all([
    getMovieVoteSummary(movie.id, user?.id),
    getMovieComments(movie.id),
  ]);

  const backdrop = imageUrl(movie.backdrop_path, "w1280");
  const poster = imageUrl(movie.poster_path, "w500");

  return (
    <article>
      <section className="relative min-h-[70vh] overflow-hidden border-b">
        {backdrop ? (
          <Image
            src={backdrop}
            alt={`${movie.title} backdrop`}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30 saturate-[1.08] dark:opacity-35"
          />
        ) : null}
        <div className="cinematic-shader absolute inset-0" />
        <div className="cinematic-noise pointer-events-none absolute inset-0" />

        <div className="relative mx-auto grid min-h-[70vh] w-full max-w-7xl items-end gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
          <div className="relative aspect-[2/3] w-56 overflow-hidden rounded-lg border bg-card shadow-2xl lg:w-full">
            {poster ? (
              <Image
                src={poster}
                alt={`${movie.title} poster`}
                fill
                priority
                sizes="280px"
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="max-w-4xl pb-2">
            <div className="flex flex-wrap gap-2">
              {movie.genre_names.map((genre) => (
                <Badge key={genre}>{genre}</Badge>
              ))}
            </div>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">
              {movie.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              {movie.overview}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
              <Badge className="gap-1.5 text-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(movie.release_date)}
              </Badge>
              <Badge className="gap-1.5 text-foreground">
                <Clock className="h-3.5 w-3.5" />
                {movie.runtime ? `${movie.runtime} min` : "Runtime TBA"}
              </Badge>
              <Badge className="gap-1.5 text-foreground">
                <Flame className="h-3.5 w-3.5" />
                Hype {scoreLabel(movie.hype_score)}
              </Badge>
              {movie.director ? (
                <Badge className="gap-1.5 text-foreground">
                  <UserRound className="h-3.5 w-3.5" />
                  {movie.director.name}
                </Badge>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <TrackButton movie={movie} isTracked={Boolean(saved)} />
              <div className="text-sm">
                <Countdown date={movie.release_date} />
              </div>
            </div>
            <div className="mt-6 lg:hidden">
              <VotePanel initialSummary={voteSummary} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-8">
          {movie.trailer ? (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Trailer</h2>
              <div className="mt-4 aspect-video overflow-hidden rounded-lg border bg-card shadow-sm">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${movie.trailer.key}`}
                  title={movie.trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Top cast</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {movie.cast.map((person) => (
                <div
                  key={person.id}
                  className="grid grid-cols-[64px_1fr] gap-4 rounded-lg border bg-card p-3 shadow-sm"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                    {person.profile_path ? (
                      <Image
                        src={imageUrl(person.profile_path, "w342")!}
                        alt={`${person.name} headshot`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-muted-foreground">
                        Cast
                      </div>
                    )}
                  </div>
                  <div className="self-center">
                    <p className="font-medium">{person.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {person.character || "Cast"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit space-y-6">
          <div className="hidden lg:block">
            <VotePanel initialSummary={voteSummary} />
          </div>
          <AdSlot label="Detail sidebar ad" size="sidebar" />
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">Release profile</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4 border-b pb-3">
                <dt className="text-muted-foreground">Release date</dt>
                <dd className="font-medium">{formatDate(movie.release_date)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b pb-3">
                <dt className="text-muted-foreground">TMDB popularity</dt>
                <dd className="font-medium">{scoreLabel(movie.popularity)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b pb-3">
                <dt className="text-muted-foreground">Vote count</dt>
                <dd className="font-medium">{movie.vote_count.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Hype score</dt>
                <dd className="font-medium">{scoreLabel(movie.hype_score)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <AdSlot className="mb-8" label="Inline detail ad" size="inline" />
        <CommentSection
          initialComments={comments}
          isLoggedIn={Boolean(user)}
          movieId={movie.id}
        />
      </section>
    </article>
  );
}
