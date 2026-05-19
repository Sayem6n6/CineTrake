import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        This title is off the slate.
      </h1>
      <p className="mt-4 text-muted-foreground">
        The movie you are looking for could not be found.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Back to discovery</Link>
      </Button>
    </section>
  );
}
