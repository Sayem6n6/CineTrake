import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, FilePenLine, ShieldCheck } from "lucide-react";
import { ObjectId } from "mongodb";
import { AdSlot } from "@/components/ads/ad-slot";
import { BlogList } from "@/components/blog/blog-list";
import { PostForm } from "@/components/blog/post-form";
import { Countdown } from "@/components/movies/countdown";
import { TrackButton } from "@/components/movies/track-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdSettings } from "@/lib/ads";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardPosts } from "@/lib/blog";
import { getDb } from "@/lib/mongodb";
import { BlogPost, WatchlistMovie } from "@/lib/types";
import { formatDate, imageUrl, scoreLabel } from "@/lib/utils";
import {
  approvePost,
  createPost,
  removePost,
  savePostEdits,
  updateGlobalAds,
  updateUserAds,
} from "./actions";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{ message?: string; tab?: string }>;
};

function TrackedMovieRow({ movie }: { movie: WatchlistMovie }) {
  const poster = imageUrl(movie.poster_path, "w342");

  return (
    <article
      className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[120px_1fr_auto] sm:items-center"
      key={movie.id}
    >
      <Link
        href={`/movie/${movie.tmdb_id}`}
        className="relative aspect-[2/3] w-28 overflow-hidden rounded-md bg-muted sm:w-full"
      >
        {poster ? (
          <Image
            src={poster}
            alt={`${movie.title} poster`}
            fill
            sizes="120px"
            className="object-cover"
          />
        ) : null}
      </Link>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Hype {scoreLabel(movie.hype_score)}</Badge>
          <Badge>{formatDate(movie.release_date)}</Badge>
        </div>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">
          {movie.title}
        </h3>
        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {movie.overview}
        </p>
        <div className="mt-3 text-sm">
          <Countdown date={movie.release_date} compact />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/movie/${movie.tmdb_id}`}>
            Details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
        <TrackButton movie={movie} mode="remove" />
      </div>
    </article>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) redirect("/login?message=Log in to view your dashboard.");

  const db = await getDb();
  const movies = await db
    .collection<Omit<WatchlistMovie, "id"> & { _id: ObjectId }>("watchlist_movies")
    .find({ user_id: user.id })
    .sort({ release_date: 1, created_at: -1 })
    .toArray();
  const savedMovies = movies.map((movie) => ({
    id: movie._id.toString(),
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
  })) as WatchlistMovie[];
  const posts = await getDashboardPosts(user.id, user.isAdmin);
  const pendingPosts = posts.filter((post) => post.status === "pending");
  const today = new Date().toISOString().slice(0, 10);
  const upcomingMovies = savedMovies.filter(
    (movie) => !movie.release_date || movie.release_date >= today,
  );
  const releasedMovies = savedMovies.filter(
    (movie) => movie.release_date && movie.release_date < today,
  );
  const activeTab =
    params.tab === "blog" || (params.tab === "ads" && user.isAdmin)
      ? params.tab
      : "tracked";
  const adSettings = user.isAdmin ? await getAdSettings() : null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 border-b pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
            {user.isAdmin ? <ShieldCheck className="h-4 w-4" /> : <FilePenLine className="h-4 w-4" />}
            {user.isAdmin ? "Admin dashboard" : "Personal dashboard"}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            Welcome, @{user.username}
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Track releases, write blog posts, and manage your movie activity.
          </p>
          {params.message ? (
            <div className="mt-4 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {params.message}
            </div>
          ) : null}
        </div>
        <Button asChild variant="secondary">
          <Link href="/">Discover more</Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-lg border bg-card p-1 shadow-sm">
        <Button
          asChild
          className="flex-1 sm:flex-none"
          variant={activeTab === "tracked" ? "default" : "ghost"}
        >
          <Link href="/dashboard?tab=tracked">
            Tracked movies
            <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
              {savedMovies.length}
            </span>
          </Link>
        </Button>
        <Button
          asChild
          className="flex-1 sm:flex-none"
          variant={activeTab === "blog" ? "default" : "ghost"}
        >
          <Link href="/dashboard?tab=blog">
            Blog
            <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
              {posts.length}
            </span>
          </Link>
        </Button>
        {user.isAdmin ? (
          <Button
            asChild
            className="flex-1 sm:flex-none"
            variant={activeTab === "ads" ? "default" : "ghost"}
          >
            <Link href="/dashboard?tab=ads">
              Ads
              <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
                {adSettings?.globalAdsDisabled ? "off" : "on"}
              </span>
            </Link>
          </Button>
        ) : null}
      </div>

      {activeTab === "tracked" ? (
        <div className="mt-8 space-y-8">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Tracked movies</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upcoming and released titles from your personal watchlist.
                </p>
              </div>
              <Badge>{savedMovies.length} saved</Badge>
            </div>

            {savedMovies.length ? (
              <div className="mt-6 space-y-8">
                <section>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">Upcoming</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Movies still counting down to release.
                      </p>
                    </div>
                    <Badge>{upcomingMovies.length}</Badge>
                  </div>
                  {upcomingMovies.length ? (
                    <div className="mt-4 grid gap-4">
                      {upcomingMovies.map((movie) => (
                        <TrackedMovieRow key={movie.id} movie={movie} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
                      No upcoming tracked movies yet.
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">Released</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Titles from your list that are already out.
                      </p>
                    </div>
                    <Badge>{releasedMovies.length}</Badge>
                  </div>
                  {releasedMovies.length ? (
                    <div className="mt-4 grid gap-4">
                      {releasedMovies.map((movie) => (
                        <TrackedMovieRow key={movie.id} movie={movie} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
                      No released tracked movies yet.
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border bg-card p-10 text-center shadow-sm">
                <h3 className="text-2xl font-semibold tracking-tight">
                  No tracked movies yet.
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                  Save upcoming movies from discovery and they will appear here.
                </p>
              </div>
            )}
          </section>

          <AdSlot label="Dashboard ad" size="inline" />
        </div>
      ) : activeTab === "blog" ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <section>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {user.isAdmin ? "All blog posts" : "Your blog posts"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.isAdmin
                      ? "Review, approve, edit, or remove community submissions."
                      : "Drafts you submit appear here while they wait for review."}
                  </p>
                </div>
                <Badge>
                  {pendingPosts.length} pending
                </Badge>
              </div>
              <div className="mt-4">
                <BlogList posts={posts} />
              </div>
            </section>

            <AdSlot label="Blog dashboard ad" size="inline" />
          </div>

          <aside className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                {user.isAdmin ? "Publish a blog post" : "Write a blog post"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {user.isAdmin
                  ? "Admin posts can go live immediately."
                  : "Submitted posts stay pending until an admin approves them."}
              </p>
              <div className="mt-4">
                <PostForm action={createPost} admin={user.isAdmin} />
              </div>
            </section>

            {user.isAdmin ? (
              <section className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Admin review queue
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pendingPosts.length} post{pendingPosts.length === 1 ? "" : "s"} pending.
                  </p>
                </div>
                {posts.map((post: BlogPost) => (
                  <div key={post.id} className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
                    <PostForm action={savePostEdits} admin post={post} />
                    <div className="flex flex-wrap gap-2">
                      {post.status === "pending" ? (
                        <form action={approvePost}>
                          <input type="hidden" name="id" value={post.id} />
                          <Button size="sm" type="submit">
                            Approve
                          </Button>
                        </form>
                      ) : null}
                      <form action={removePost}>
                        <input type="hidden" name="id" value={post.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </section>
            ) : null}
          </aside>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <section className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">Global ad controls</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Disable every placeholder ad across CineTrake, regardless of user.
            </p>
            <form action={updateGlobalAds} className="mt-5 space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4 text-sm font-medium">
                <span>Disable ads globally</span>
                <input
                  className="h-5 w-5 accent-current"
                  defaultChecked={adSettings?.globalAdsDisabled}
                  name="globalAdsDisabled"
                  type="checkbox"
                />
              </label>
              <Button type="submit">Save global setting</Button>
            </form>
          </section>

          <section>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">User ad controls</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Disable or enable ads for individual users.
                </p>
              </div>
              <Badge>{adSettings?.users.length ?? 0} users</Badge>
            </div>
            <div className="mt-4 grid gap-3">
              {adSettings?.users.map((targetUser) => (
                <form
                  action={updateUserAds}
                  className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
                  key={targetUser.id}
                >
                  <input type="hidden" name="userId" value={targetUser.id} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">@{targetUser.username}</p>
                      <Badge>{targetUser.role}</Badge>
                      {targetUser.adsDisabled ? <Badge>ads disabled</Badge> : <Badge>ads enabled</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Joined {new Date(targetUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        className="h-4 w-4 accent-current"
                        defaultChecked={targetUser.adsDisabled}
                        name="adsDisabled"
                        type="checkbox"
                      />
                      Disable ads
                    </label>
                    <Button size="sm" type="submit" variant="secondary">
                      Save
                    </Button>
                  </div>
                </form>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
