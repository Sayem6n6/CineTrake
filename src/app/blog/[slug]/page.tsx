import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/ad-slot";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Badge>By @{post.authorName}</Badge>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
        {post.title}
      </h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
      <AdSlot className="my-8" label="Article ad" />
      <div className="whitespace-pre-wrap text-base leading-8 text-muted-foreground">
        {post.body}
      </div>
    </article>
  );
}
