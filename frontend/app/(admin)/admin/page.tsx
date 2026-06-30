export default function AdminPage() {
  return (
    <main style={{ padding: 32 }}>
      <h1 className="disp" style={{ fontSize: 28, fontWeight: 800 }}>
        Admin panel
      </h1>
      <p style={{ marginTop: 8, color: "var(--muted)", maxWidth: 560, lineHeight: 1.6 }}>
        Project scaffold. This panel serves both <strong>restaurant owners</strong>{" "}
        (dashboard, reservations, tables, schedule, menu, reviews, settings) and{" "}
        <strong>platform admins</strong> (users, owners, requests, settings).
      </p>
    </main>
  );
}
