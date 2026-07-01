import { LoginModal } from "@/components/auth/LoginModal";
import { CustomerHeader } from "@/components/layout/CustomerHeader";
import { AuthModalProvider } from "@/lib/auth/authModal";

export default function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Customer-facing shell (nav + footer) will live here.
  return (
    <AuthModalProvider>
      <div className="customer-shell">
        <CustomerHeader />
        {children}
        <LoginModal />
      </div>
    </AuthModalProvider>
  );
}
