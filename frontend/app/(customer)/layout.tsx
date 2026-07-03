import { LoginModal } from "@/components/auth/LoginModal";
import { CustomerFooter } from "@/components/layout/CustomerFooter";
import { CustomerHeader } from "@/components/layout/CustomerHeader";
import { AuthModalProvider } from "@/lib/auth/authModal";
import { CustomerAuthProvider } from "@/lib/auth/customerAuth";

export default function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Auth is scoped to this surface: an owner/admin session elsewhere doesn't
  // leak in here.
  return (
    <CustomerAuthProvider>
      <AuthModalProvider>
        <div className="customer-shell flex min-h-screen flex-col">
          <CustomerHeader />
          <div className="flex-1">{children}</div>
          <CustomerFooter />
          <LoginModal />
        </div>
      </AuthModalProvider>
    </CustomerAuthProvider>
  );
}
