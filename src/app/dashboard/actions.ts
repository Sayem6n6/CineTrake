"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { setGlobalAdsDisabled, setUserAdsDisabled } from "@/lib/ads";
import { createBlogPost, deleteBlogPost, updateBlogPost } from "@/lib/blog";
import { BlogPostStatus } from "@/lib/types";

function requireText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

export async function createPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?message=Log in to write posts.");

  const title = requireText(formData, "title");
  const excerpt = requireText(formData, "excerpt");
  const body = requireText(formData, "body");
  const requestedStatus = String(formData.get("status") ?? "pending") as BlogPostStatus;

  await createBlogPost({
    title,
    excerpt,
    body,
    authorId: user.id,
    authorName: user.username,
    status: user.isAdmin && requestedStatus === "approved" ? "approved" : "pending",
  });

  revalidatePath("/dashboard");
  revalidatePath("/blog");
  redirect("/dashboard?message=Post saved.");
}

export async function approvePost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/dashboard?message=Admin access required.");

  await updateBlogPost(String(formData.get("id")), { status: "approved" });
  revalidatePath("/dashboard");
  revalidatePath("/blog");
}

export async function savePostEdits(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/dashboard?message=Admin access required.");

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as BlogPostStatus;

  await updateBlogPost(id, {
    title: requireText(formData, "title"),
    excerpt: requireText(formData, "excerpt"),
    body: requireText(formData, "body"),
    status: status === "approved" ? "approved" : "pending",
  });

  revalidatePath("/dashboard");
  revalidatePath("/blog");
}

export async function removePost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/dashboard?message=Admin access required.");

  await deleteBlogPost(String(formData.get("id")));
  revalidatePath("/dashboard");
  revalidatePath("/blog");
}

export async function updateGlobalAds(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/dashboard?message=Admin access required.");

  await setGlobalAdsDisabled(String(formData.get("globalAdsDisabled")) === "on");
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  redirect("/dashboard?tab=ads&message=Ad settings updated.");
}

export async function updateUserAds(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/dashboard?message=Admin access required.");

  await setUserAdsDisabled(
    String(formData.get("userId")),
    String(formData.get("adsDisabled")) === "on",
  );
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  redirect("/dashboard?tab=ads&message=User ad setting updated.");
}
