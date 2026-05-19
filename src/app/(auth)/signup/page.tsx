import Link from "next/link";
import { AuthForm } from "@/components/layout/auth-form";
import { createCaptcha } from "@/lib/auth";
import { signup } from "../actions";

type SignupPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const captcha = createCaptcha();

  return (
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl place-items-center px-4 py-20">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Start tracking
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Create your movie bucket list.
        </h1>
        <AuthForm
          action={signup}
          captcha={captcha}
          cta="Create account"
          message={params.message}
          mode="signup"
        />
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
