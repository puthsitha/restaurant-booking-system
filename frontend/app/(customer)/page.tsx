export default function HomePage() {
  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px" }}>
      <p
        className="km"
        style={{
          color: "var(--muted)",
          fontWeight: 600,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          fontSize: 12
        }}
      >
        TableSite · Cambodia
      </p>
      <h1
        className="disp"
        style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.02em", marginTop: 8 }}
      >
        Table<span style={{ color: "var(--accent)" }}>Site</span> — customer app
      </h1>
      <p style={{ marginTop: 12, color: "#4A4039", maxWidth: 560, lineHeight: 1.6 }}>
        Project scaffold. The diner-facing booking experience (home, search, restaurant
        detail, booking flow, KHQR deposit, my bookings, profile) will be built here,
        based on the design in <code>/design/TableSite.reference.html</code>.
      </p>
    </main>
  );
}
