// Shimmering placeholders shown while list/grid data loads — used instead of
// a spinner for content-shaped loading, per the "skeleton over spinner for
// >300ms loads" guideline.

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="ts-skeleton h-40 w-full motion-safe:animate-ts-shimmer" />
      <div className="space-y-2.5 p-4">
        <div className="ts-skeleton h-4 w-3/4 rounded motion-safe:animate-ts-shimmer" />
        <div className="ts-skeleton h-3 w-1/2 rounded motion-safe:animate-ts-shimmer" />
        <div className="flex gap-1.5 pt-1">
          <div className="ts-skeleton h-5 w-16 rounded-full motion-safe:animate-ts-shimmer" />
          <div className="ts-skeleton h-5 w-16 rounded-full motion-safe:animate-ts-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="space-y-2">
        <div className="ts-skeleton h-4 w-40 rounded motion-safe:animate-ts-shimmer" />
        <div className="ts-skeleton h-3 w-28 rounded motion-safe:animate-ts-shimmer" />
      </div>
      <div className="ts-skeleton h-6 w-16 rounded-full motion-safe:animate-ts-shimmer" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {Array.from({ length: rows }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}
