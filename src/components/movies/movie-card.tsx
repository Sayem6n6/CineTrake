"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/movies/countdown";
import { TrackButton } from "@/components/movies/track-button";
import { MovieSummary } from "@/lib/types";
import { formatDate, imageUrl, scoreLabel } from "@/lib/utils";

export function MovieCard({ movie }: { movie: MovieSummary }) {
  const poster = imageUrl(movie.poster_path, "w500");

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <Link href={`/movie/${movie.id}`} className="relative block aspect-[2/3] overflow-hidden bg-muted">
        {poster ? (
          <Image
            src={poster}
            alt={`${movie.title} poster`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            No poster
          </div>
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          <Flame className="h-3.5 w-3.5" />
          {scoreLabel(movie.hype_score)}
        </div>
      </Link>

      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="line-clamp-2 text-lg font-semibold tracking-tight">
              {movie.title}
            </h2>
            <Button asChild size="icon" variant="ghost" aria-label={`View ${movie.title}`}>
              <Link href={`/movie/${movie.id}`}>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(movie.release_date)}
          </p>
        </div>

        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
          {movie.overview}
        </p>

        <div className="flex flex-wrap gap-2">
          {movie.genre_names.slice(0, 2).map((genre) => (
            <Badge key={genre}>{genre}</Badge>
          ))}
          <Badge>{Math.round(movie.popularity)} popularity</Badge>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-t pt-4 text-sm">
          <div className="min-w-0 leading-5">
            <Countdown date={movie.release_date} compact />
          </div>
          <TrackButton compact movie={movie} />
        </div>
      </div>
    </motion.article>
  );
}
