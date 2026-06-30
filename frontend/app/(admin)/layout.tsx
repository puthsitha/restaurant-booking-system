export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Admin shell (sidebar + topbar) for owners and platform admins will live here.
  return <div className="admin-shell">{children}</div>;
}
