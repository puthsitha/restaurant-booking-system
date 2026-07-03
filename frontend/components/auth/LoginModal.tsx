"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { ApiError } from "@/lib/api";
import { useCustomerAuth } from "@/lib/auth/customerAuth";
import { useAuthModal } from "@/lib/auth/authModal";

type Step = "phone" | "otp";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong, please try again.";
}

export function LoginModal() {
  const { isOpen, close } = useAuthModal();
  const { requestOtp, verifyOtp, loginWithGoogle } = useCustomerAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phone = `+855${phoneDigits.replace(/\D/g, "")}`;

  function reset(): void {
    setStep("phone");
    setPhoneDigits("");
    setCode("");
    setDevCode(null);
    setError(null);
  }

  function handleClose(): void {
    reset();
    close();
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleSendCode(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await requestOtp(phone);
      setDevCode(res.devCode ?? null);
      setStep("otp");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await verifyOtp(phone, code);
      handleClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(idToken: string): Promise<void> {
    setError(null);
    try {
      await loginWithGoogle(idToken);
      handleClose();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={handleClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/55 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded-[22px] bg-surface p-9 shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
          >
            <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-accent text-2xl">
              🍽️
            </div>

        {step === "phone" ? (
          <>
            <h2 className="disp text-[23px] font-extrabold text-ink">Welcome back</h2>
            <p className="mb-6 text-sm text-muted">Sign in with your phone number</p>

            <form onSubmit={handleSendCode}>
              <label className="mb-2 block text-[12.5px] font-bold text-label">
                Phone number
              </label>
              <div className="mb-4 flex gap-2.5">
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-bg px-3.5 font-bold text-ink">
                  🇰🇭 +855
                </div>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="12 345 678"
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value)}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-[15px] text-ink outline-none"
                />
              </div>
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-accent py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Send code"}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-[#C3B6A9]">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex justify-center">
              <GoogleButton onCredential={handleGoogleCredential} />
            </div>
          </>
        ) : (
          <>
            <h2 className="disp text-[23px] font-extrabold text-ink">Enter the code</h2>
            <p className="mb-6 text-sm text-muted">
              Sent to {phone}
              {devCode ? ` — dev code: ${devCode}` : ""}
            </p>

            <form onSubmit={handleVerify}>
              <input
                required
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mb-4 w-full rounded-xl border border-border px-4 py-3 text-center text-lg tracking-[0.3em] text-ink outline-none"
              />
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-accent py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Verifying…" : "Log in"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setStep("phone")}
              className="mt-3 w-full text-center text-xs text-muted"
            >
              Use a different number
            </button>
          </>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
