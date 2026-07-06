"use client";

import { useRouter } from "next/navigation";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
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
    <AuthSplitLayout activeRole="owner">
      <SessionEndedModal message={sessionMessage} onDismiss={clearSessionMessage} />
      <CredentialLoginCard
        title={t("owner.loginTitle")}
        subtitle={t("owner.loginSubtitle")}
        demoEmail="owner.dev@tablesite.local"
        onSubmit={handleLogin}
      />
    </AuthSplitLayout>
  );
}
