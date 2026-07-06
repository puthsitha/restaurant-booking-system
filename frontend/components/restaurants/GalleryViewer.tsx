"use client";

import { motion } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { useEffect, useState } from "react";

import { Lightbox } from "@/components/ui/Lightbox";
import { ChevronDownIcon, ZoomInIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/context";

interface GalleryViewerImage {
  id: string;
  url: string;
  caption: string | null;
}

interface GalleryViewerProps {
  images: GalleryViewerImage[];
  fallbackAlt: string;
}

const SWIPE_THRESHOLD = 80;

// Gallery grid whose thumbnails share a single Lightbox instance, so viewing
// one photo lets you swipe/arrow-key through the rest of the set instead of
// each thumbnail opening an isolated single-image `ZoomableImage`.
export function GalleryViewer({ images, fallbackAlt }: GalleryViewerProps) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasMultiple = images.length > 1;
  const activeIndex = openIndex ?? 0;
  const current = openIndex !== null ? images[openIndex] : null;

  function goTo(index: number): void {
    setOpenIndex(((index % images.length) + images.length) % images.length);
  }

  useEffect(() => {
    if (openIndex === null || !hasMultiple) return;
    const index = openIndex;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, hasMultiple]);

  function handleDragEnd(_event: unknown, info: PanInfo): void {
    if (info.offset.x > SWIPE_THRESHOLD) goTo(activeIndex - 1);
    else if (info.offset.x < -SWIPE_THRESHOLD) goTo(activeIndex + 1);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={t("common.viewFullScreen", { label: image.caption ?? fallbackAlt })}
            className="group relative block h-32 w-full overflow-hidden rounded-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.caption ?? fallbackAlt}
              className="h-32 w-full object-cover transition group-hover:opacity-90"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/20 group-hover:opacity-100">
              <ZoomInIcon className="h-6 w-6 text-white drop-shadow" />
            </span>
          </button>
        ))}
      </div>

      <Lightbox open={current !== null} onClose={() => setOpenIndex(null)}>
        {current && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <motion.img
                key={current.id}
                src={current.url}
                alt={current.caption ?? fallbackAlt}
                className="max-h-[80vh] max-w-[90vw] touch-pan-y rounded-lg object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                drag={hasMultiple ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
              />
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label={t("restaurantPage.galleryPrevious")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:left-4"
                  >
                    <ChevronDownIcon className="h-5 w-5 rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    aria-label={t("restaurantPage.galleryNext")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-4"
                  >
                    <ChevronDownIcon className="h-5 w-5 -rotate-90" />
                  </button>
                </>
              )}
            </div>
            {hasMultiple && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {t("restaurantPage.galleryCounter", { current: activeIndex + 1, total: images.length })}
              </span>
            )}
          </div>
        )}
      </Lightbox>
    </>
  );
}
