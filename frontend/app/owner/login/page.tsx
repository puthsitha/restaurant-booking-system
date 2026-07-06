"use client";

import { useRouter } from "next/navigation";

import { CredentialLoginCard } from "@/components/auth/CredentialLoginCard";
import { SessionEndedModal } from "@/components/auth/SessionEndedModal";
import { useOwnerAuth } from "@/lib/auth/ownerAuth";
import { useLanguage } from "@/lib/i18n/context";

export default function OwnerLoginPage() {
  const { login, sessionMessage, clearSessionMessage } = useOwnerAuth();
  const { t } = useLanguage();
  const router = useRouter();

  async function handleLogin(email: string, password: string): Promise<void> {
    await login(email, password);
    router.replace("/owner");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-12">
      <SessionEndedModal message={sessionMessage} onDismiss={clearSessionMessage} />
      <CredentialLoginCard
        icon="🧑‍🍳"
        title={t("owner.loginTitle")}
        subtitle={t("owner.loginSubtitle")}
        onSubmit={handleLogin}
      />
    </main>
  );
}
