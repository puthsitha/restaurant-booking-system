"use client";

import { useRef, useState } from "react";

import { Lightbox } from "@/components/ui/Lightbox";
import { QrCode } from "@/components/ui/QrCode";
import { DownloadIcon, ZoomInIcon } from "@/components/ui/icons";

interface QrCodeViewerProps {
  value: string;
  size?: number;
  className?: string;
  // Shown above the enlarged code in the lightbox and used to name the
  // downloaded file, e.g. "Check-in code" → "check-in-code-TS-4821.png".
  label: string;
  downloadName: string;
}

async function downloadQrCode(svg: SVGSVGElement, filename: string): Promise<void> {
  const width = Number(svg.getAttribute("width")) || svg.clientWidth;
  const height = Number(svg.getAttribute("height")) || svg.clientHeight;
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Couldn't render the QR code image"));
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(url);
    return;
  }
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  URL.revokeObjectURL(url);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}

// Wraps QrCode so clicking it opens a fullscreen view of the code with a
// "Download" button — used for the check-in QR (My bookings) and the KHQR
// payment/confirmation codes in the booking flow.
export function QrCodeViewer({ value, size = 180, className, label, downloadName }: QrCodeViewerProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const largeContainerRef = useRef<HTMLDivElement>(null);

  async function handleDownload(): Promise<void> {
    const svg = largeContainerRef.current?.querySelector("svg");
    if (!svg) return;
    setDownloading(true);
    try {
      await downloadQrCode(svg, `${downloadName}.png`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative inline-block"
        aria-label={`View ${label} full screen`}
      >
        <QrCode value={value} size={size} className={className} />
        <span className="absolute inset-0 flex items-center justify-center bg-scrim/0 opacity-0 transition group-hover:bg-scrim/10 group-hover:opacity-100">
          <ZoomInIcon className="h-6 w-6 text-ink drop-shadow" />
        </span>
      </button>

      <Lightbox open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col items-center rounded-2xl bg-white p-6">
          <p className="text-sm font-bold text-ink">{label}</p>
          <div ref={largeContainerRef} className="mt-4">
            <QrCode value={value} size={260} />
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="mt-5 flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            <DownloadIcon className="h-4 w-4" />
            {downloading ? "Preparing…" : "Download"}
          </button>
        </div>
      </Lightbox>
    </>
  );
}
