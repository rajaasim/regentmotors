"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      setError("Enter a valid email address and password.");
      setIsPending(false);
      return;
    }

    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe: false,
    });

    if (result.error) {
      setError("The email address or password is incorrect.");
      setIsPending(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label className="form-label" htmlFor="admin-email">
          Email address
        </label>
        <input
          className="form-control mt-2"
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label className="form-label" htmlFor="admin-password">
          Password
        </label>
        <input
          className="form-control mt-2"
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          disabled={isPending}
        />
      </div>

      <p className="min-h-6 text-sm text-red-300" role="alert" aria-live="polite">
        {error}
      </p>

      <button className="button button-primary w-full" type="submit" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
