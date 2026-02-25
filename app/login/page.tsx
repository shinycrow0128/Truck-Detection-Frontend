"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // If already authenticated, skip login page
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          router.replace("/");
        }
      } catch {
        // Ignore auth check errors here
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.replace("/");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage(
          "Sign up successful. If email confirmation is required, please check your inbox before logging in."
        );
        setMode("login");
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "login" ? "Log in" : "Sign up";
  const toggleLabel =
    mode === "login"
      ? "Don't have an account? Sign up"
      : "Already have an account? Log in";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-subtle)] transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-lg p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            {title} to Truck Monitor
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Use your email and password to{" "}
            {mode === "login" ? "access" : "create"} your account.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--color-text)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--color-text)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Enter a secure password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            {loading ? "Please wait…" : title}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setMessage(null);
            setMode((prev) => (prev === "login" ? "signup" : "login"));
          }}
          className="w-full text-center text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          {toggleLabel}
        </button>
      </div>
    </div>
  );
}
