"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { FormField, TextField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/context";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CredentialLoginCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}

// Shared card for the admin and owner sign-in pages: same layout,
// placeholders, and email/password validation for both portals.
export function CredentialLoginCard({ icon, title, subtitle, onSubmit }: CredentialLoginCardProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const trimmedEmail = email.trim();
    const nextEmailError = !trimmedEmail
      ? t("auth.emailRequired")
      : EMAIL_PATTERN.test(trimmedEmail)
        ? null
        : t("auth.invalidEmail");
    const nextPasswordError = password ? null : t("auth.passwordRequired");
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextEmailError && !nextPasswordError;
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("auth.somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-[22px] border border-border bg-surface p-9 shadow-xl">
      <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-accent text-2xl">
        {icon}
      </div>
      <h1 className="disp text-2xl font-extrabold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <TextField
          label={t("auth.email")}
          required
          type="email"
          autoComplete="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          error={emailError ?? undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
        />
        <FormField label={t("auth.password")} htmlFor="credential-password" error={passwordError ?? undefined}>
          <PasswordInput
            id="credential-password"
            required
            autoComplete="current-password"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (passwordError) setPasswordError(null);
            }}
          />
        </FormField>
        {formError && <p className="text-sm font-semibold text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
        </button>
      </form>
    </div>
  );
}
