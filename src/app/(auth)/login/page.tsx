import Link from "next/link";
import { AuthForm } from "@/components/layout/auth-form";
import { login } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl place-items-center px-4 py-20">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Log in to open your dashboard.
        </h1>
        <AuthForm action={login} cta="Log in" message={params.message} />
        <p className="mt-6 text-sm text-muted-foreground">
          New here?{" "}
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
