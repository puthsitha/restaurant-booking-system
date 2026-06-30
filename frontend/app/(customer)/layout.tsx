export default function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Customer-facing shell (nav + footer) will live here.
  return <div className="customer-shell">{children}</div>;
}
