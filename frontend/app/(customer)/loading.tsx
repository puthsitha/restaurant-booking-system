import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function CustomerLoading() {
  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px" }}>
      <LoadingSpinner label="Finding your table…" size="lg" />
    </main>
  );
}
