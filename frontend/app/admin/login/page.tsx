"use client";

import { useRouter } from "next/navigation";

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
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-12">
      <SessionEndedModal message={sessionMessage} onDismiss={clearSessionMessage} />
      <CredentialLoginCard
        icon="🛡️"
        title={t("admin.loginTitle")}
        subtitle={t("admin.loginSubtitle")}
        onSubmit={handleLogin}
      />
    </main>
  );
}
