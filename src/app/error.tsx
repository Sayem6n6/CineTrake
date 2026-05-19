"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
        Something went sideways
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
        Could not load movies.
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        {error.message || "The TMDB request failed. Check your API key and try again."}
      </p>
      <Button className="mt-8" onClick={() => reset()}>
        Try again
      </Button>
    </section>
  );
}
