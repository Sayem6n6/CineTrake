"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUser, signIn, signOut, validateCaptcha } from "@/lib/auth";

function getCredentials(formData: FormData) {
  return {
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export async function login(formData: FormData) {
  const { username, password } = getCredentials(formData);

  try {
    await signIn(username, password);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not log in. Try again.";
    redirect(`/login?message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const { username, password } = getCredentials(formData);
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const captcha = String(formData.get("captcha") ?? "");
  const captchaToken = String(formData.get("captchaToken") ?? "");

  if (password !== confirmPassword) {
    redirect("/signup?message=Passwords do not match.");
  }

  if (!validateCaptcha(captchaToken, captcha)) {
    redirect("/signup?message=Captcha answer was incorrect or expired.");
  }

  try {
    await createUser(username, password);
    await signIn(username, password);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create account. Try again.";
    redirect(`/signup?message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  await signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
