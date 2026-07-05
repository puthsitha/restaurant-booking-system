"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { GoogleIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  prompt: () => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

interface GoogleButtonProps {
  onCredential: (idToken: string) => void;
}

// A custom-styled button (our own icon + translated label) that drives
// Google Identity Services' One Tap prompt, rather than Google's own
// server-rendered button — that widget's language follows the browser's
// locale instead of this app's, and its async render meant the button could
// take a moment (or occasionally fail) to appear at all.
export function GoogleButton({ onCredential }: GoogleButtonProps) {
  const { locale, t } = useLanguage();
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!scriptLoaded || !clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      // Read via a ref so this effect doesn't need onCredential in its
      // dependency array and re-initialize on every parent render.
      callback: (response) => onCredentialRef.current(response.credential),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded, clientId]);

  if (!clientId) {
    return null;
  }

  const ready = scriptLoaded;

  return (
    <>
      <Script
        // hl matches Google's own dialog text to this app's language rather
        // than the browser's.
        src={`https://accounts.google.com/gsi/client?hl=${locale}`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <button
        type="button"
        disabled={!ready}
        onClick={() => window.google?.accounts.id.prompt()}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border py-3 text-[15px] font-semibold text-ink transition hover:bg-bg disabled:opacity-60"
      >
        <GoogleIcon className="h-[18px] w-[18px]" />
        {t("auth.continueWithGoogle")}
      </button>
    </>
  );
}
