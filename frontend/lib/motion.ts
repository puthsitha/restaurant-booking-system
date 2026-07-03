import type { Variants } from "framer-motion";

// Shared framer-motion variants mirroring design/TableSite.reference.html's
// two motion primitives: "ts-fade" (content entrance) and "ts-pop" (modals,
// success states). Reused across pages instead of each component inventing
// its own transition.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } }
};

// Wrap a grid/list's parent with this and each child with `fadeUp` to get a
// staggered entrance (cards, table rows, nav items).
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
};
