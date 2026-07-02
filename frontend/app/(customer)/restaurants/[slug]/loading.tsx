import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function RestaurantDetailLoading() {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 32px" }}>
      <LoadingSpinner label="Setting the table…" size="lg" />
    </main>
  );
}
