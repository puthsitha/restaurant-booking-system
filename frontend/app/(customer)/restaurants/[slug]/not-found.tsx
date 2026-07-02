import { EmptyState } from "@/components/ui/EmptyState";
import { SearchOffIcon } from "@/components/ui/icons";

export default function RestaurantNotFound() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "64px 32px" }}>
      <EmptyState
        icon={SearchOffIcon}
        title="This table isn't set"
        message="We couldn't find a restaurant at this address — it may have closed, or the link's a little off."
        actionLabel="Browse restaurants"
        actionHref="/search"
      />
    </main>
  );
}
