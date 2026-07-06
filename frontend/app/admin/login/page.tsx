"use client";

import { useRouter } from "next/navigation";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { CredentialLoginCard } from "@/components/auth/CredentialLoginCard";
import { SessionEndedModal } from "@/components/auth/SessionEndedModal";
import { useAdminAuth } from "@/lib/auth/adminAuth";
import { useLanguage } from "@/lib/i18n/context";

export default function AdminLoginPage() {
  const { login, sessionMessage, clearSessionMessage } = useAdminAuth();
  const { t } = useLanguage();
  const router = useRouter();

  async function handleLogin(email: string, password: string): Promise<void> {
    await login(email, password);
    router.replace("/admin");
  }

  return (
    <AuthSplitLayout activeRole="admin">
      <SessionEndedModal message={sessionMessage} onDismiss={clearSessionMessage} />
      <CredentialLoginCard
        title={t("admin.loginTitle")}
        subtitle={t("admin.loginSubtitle")}
        demoEmail="admin.dev@tablesite.local"
        onSubmit={handleLogin}
      />
    </AuthSplitLayout>
  );
}
