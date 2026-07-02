"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { FormField, TextField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError } from "@/lib/api";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";

interface PasswordStrength {
  label: string;
  barColor: string;
  textColor: string;
  segments: number;
}

function passwordStrength(pw: string): PasswordStrength {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "Weak", barColor: "bg-red-400", textColor: "text-red-600", segments: 1 };
  if (score <= 3)
    return { label: "Fair", barColor: "bg-amber-400", textColor: "text-amber-600", segments: 2 };
  return { label: "Strong", barColor: "bg-secondary", textColor: "text-secondary", segments: 3 };
}

export default function OwnerSignupPage() {
  const { signup } = useOwnerAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = password.length > 0 ? passwordStrength(password) : null;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // Public signup only ever creates OWNER accounts; platform ADMINs are
      // provisioned out-of-band (see backend/src/schemas/auth.schemas.ts).
      await signup({ name, email, password, role: "OWNER" });
      router.replace("/owner");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-12">
      <h1 className="disp text-2xl font-extrabold text-ink">Register your restaurant</h1>
      <p className="mt-2 text-sm text-muted">Create an owner account to list your restaurant.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <TextField
          label="Full name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField label="Password" htmlFor="owner-signup-password">
          <PasswordInput
            id="owner-signup-password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
          />
          {strength && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < strength.segments ? strength.barColor : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className={`mt-1 text-xs font-semibold ${strength.textColor}`}>
                {strength.label} password
              </p>
            </div>
          )}
        </FormField>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/owner/login" className="font-semibold text-accent">
          Sign in
        </Link>
      </p>
    </main>
  );
}
