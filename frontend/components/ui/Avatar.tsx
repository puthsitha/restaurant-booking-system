import { UserIcon } from "@/components/ui/icons";

interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg"
};

const ICON_SIZE_CLASS: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8"
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

// Circular avatar: shows the person's photo when available, their initials
// when they have a name, or a generic person icon when they don't (e.g. a
// guest account with no name set yet) — matches the accent→secondary
// gradient used throughout design/TableSite.reference.html for user identity.
export function Avatar({ name, imageUrl, size = "md", className }: AvatarProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name ?? ""}
        className={`${SIZE_CLASS[size]} rounded-full object-cover ${className ?? ""}`}
      />
    );
  }

  const label = initials(name?.trim() ?? "");

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZE_CLASS[size]} ${className ?? ""}`}
      style={{ background: "linear-gradient(135deg, #C2410C, #1F6F54)" }}
    >
      {label ? label : <UserIcon className={ICON_SIZE_CLASS[size]} />}
    </div>
  );
}
