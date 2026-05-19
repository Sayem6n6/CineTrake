"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton({ cta }: { cta: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-5 w-full" disabled={pending} type="submit">
      {pending ? "Working..." : cta}
    </Button>
  );
}

export function AuthForm({
  action,
  cta,
  message,
  mode = "login",
  captcha,
}: {
  action: (formData: FormData) => void | Promise<void>;
  cta: string;
  message?: string;
  mode?: "login" | "signup";
  captcha?: { question: string; token: string };
}) {
  return (
    <form action={action} className="mt-8">
      <label className="text-sm font-medium" htmlFor="username">
        Username
      </label>
      <Input
        autoComplete="username"
        className="mt-2"
        id="username"
        name="username"
        pattern="[A-Za-z0-9_]{3,24}"
        placeholder="your_username"
        required
        type="text"
      />
      <label className="mt-4 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <Input
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        className="mt-2"
        id="password"
        minLength={6}
        name="password"
        placeholder="At least 6 characters"
        required
        type="password"
      />

      {mode === "signup" ? (
        <>
          <label className="mt-4 block text-sm font-medium" htmlFor="confirmPassword">
            Confirm password
          </label>
          <Input
            autoComplete="new-password"
            className="mt-2"
            id="confirmPassword"
            minLength={6}
            name="confirmPassword"
            placeholder="Repeat your password"
            required
            type="password"
          />
          <label className="mt-4 block text-sm font-medium" htmlFor="captcha">
            Simple captcha: what is {captcha?.question}?
          </label>
          <input type="hidden" name="captchaToken" value={captcha?.token ?? ""} />
          <Input
            className="mt-2"
            id="captcha"
            inputMode="numeric"
            name="captcha"
            placeholder="Answer"
            required
            type="text"
          />
        </>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
          {message}
        </div>
      ) : null}
      <SubmitButton cta={cta} />
    </form>
  );
}
