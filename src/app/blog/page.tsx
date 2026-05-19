import { AdSlot } from "@/components/ads/ad-slot";
import { BlogList } from "@/components/blog/blog-list";
import { getApprovedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog | CineTrake",
};

export default async function BlogPage() {
  const posts = await getApprovedPosts();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Editorial
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Movie release blog
      </h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        Community posts and admin-approved articles about upcoming releases,
        trailers, casting, and public hype.
      </p>
      <AdSlot className="my-8" label="Blog ad" />
      <BlogList posts={posts} />
    </section>
  );
}
