"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { SessionEndedModal } from "@/components/auth/SessionEndedModal";
import { FormField, TextField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";

export default function OwnerLoginPage() {
  const { login, sessionMessage, clearSessionMessage } = useOwnerAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace("/owner");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-12">
      <h1 className="disp text-2xl font-extrabold text-ink">Restaurant owner login</h1>
      <p className="mt-2 text-sm text-muted">Sign in to manage your restaurant.</p>

      <SessionEndedModal message={sessionMessage} onDismiss={clearSessionMessage} />

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <TextField
          label="Email"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField label="Password" htmlFor="owner-password">
          <PasswordInput
            id="owner-password"
            required
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />
        </FormField>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
