"use client";

import { useState } from "react";

import { Lightbox } from "@/components/ui/Lightbox";
import { ZoomInIcon } from "@/components/ui/icons";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Wraps a normal <img> so clicking it opens a fullscreen Lightbox — used for
// restaurant cover/gallery photos and menu item photos. Kept as its own
// client component so server-rendered pages (like the restaurant detail
// page) don't have to become client components just to add this.
export function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block h-full w-full"
        aria-label={`View ${alt} full screen`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
        <span className="absolute inset-0 flex items-center justify-center bg-scrim/0 opacity-0 transition group-hover:bg-scrim/20 group-hover:opacity-100">
          <ZoomInIcon className="h-6 w-6 text-white drop-shadow" />
        </span>
      </button>

      <Lightbox open={open} onClose={() => setOpen(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
        />
      </Lightbox>
    </>
  );
}
