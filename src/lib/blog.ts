import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { BlogPost, BlogPostStatus } from "@/lib/types";

type BlogPostDocument = {
  _id: ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: BlogPostStatus;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
};

function serializePost(post: BlogPostDocument): BlogPost {
  return {
    id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    status: post.status,
    authorId: post.authorId,
    authorName: post.authorName,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return base || `post-${Date.now()}`;
}

export async function createBlogPost(input: {
  title: string;
  excerpt: string;
  body: string;
  authorId: string;
  authorName: string;
  status: BlogPostStatus;
}) {
  const db = await getDb();
  const now = new Date();
  const slugBase = slugify(input.title);
  let slug = slugBase;
  let suffix = 2;

  while (await db.collection("blog_posts").findOne({ slug })) {
    slug = `${slugBase}-${suffix}`;
    suffix += 1;
  }

  await db.collection<BlogPostDocument>("blog_posts").insertOne({
    _id: new ObjectId(),
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    status: input.status,
    authorId: input.authorId,
    authorName: input.authorName,
    slug,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getApprovedPosts() {
  const db = await getDb();
  const posts = await db
    .collection<BlogPostDocument>("blog_posts")
    .find({ status: "approved" })
    .sort({ createdAt: -1 })
    .toArray();

  return posts.map(serializePost);
}

export async function getDashboardPosts(userId: string, isAdmin: boolean) {
  const db = await getDb();
  const posts = await db
    .collection<BlogPostDocument>("blog_posts")
    .find(isAdmin ? {} : { authorId: userId })
    .sort({ createdAt: -1 })
    .toArray();

  return posts.map(serializePost);
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  const post = await db
    .collection<BlogPostDocument>("blog_posts")
    .findOne({ slug, status: "approved" });

  return post ? serializePost(post) : null;
}

export async function updateBlogPost(
  id: string,
  input: Partial<Pick<BlogPost, "title" | "excerpt" | "body" | "status">>,
) {
  const db = await getDb();
  await db.collection("blog_posts").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...input,
        updatedAt: new Date(),
      },
    },
  );
}

export async function deleteBlogPost(id: string) {
  const db = await getDb();
  await db.collection("blog_posts").deleteOne({ _id: new ObjectId(id) });
}
