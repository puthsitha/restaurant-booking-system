import { LoginModal } from "@/components/auth/LoginModal";
import { CustomerHeader } from "@/components/layout/CustomerHeader";
import { AuthModalProvider } from "@/lib/auth/authModal";
import { CustomerAuthProvider } from "@/lib/auth/customerAuth";

export default function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Customer-facing shell (nav + footer) will live here. Auth is scoped to
  // this surface: an owner/admin session elsewhere doesn't leak in here.
  return (
    <CustomerAuthProvider>
      <AuthModalProvider>
        <div className="customer-shell">
          <CustomerHeader />
          {children}
          <LoginModal />
        </div>
      </AuthModalProvider>
    </CustomerAuthProvider>
  );
}
