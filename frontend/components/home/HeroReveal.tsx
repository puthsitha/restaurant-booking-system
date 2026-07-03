"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import type { CSSProperties, PointerEvent, ReactNode } from "react";

// Two hand-drawn illustrated scenes (no photo asset pipeline exists), swapped
// via a cursor-follow circular "erase" mask: the restaurant-ambience scene
// sits on top and gets a transparent hole cut out around the pointer,
// revealing the dish scene underneath.

function RestaurantScene() {
  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="restBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#241D19" />
          <stop offset="55%" stopColor="#2E2018" />
          <stop offset="100%" stopColor="#5A2E17" />
        </linearGradient>
        <radialGradient id="lampGlow" cx="50%" cy="0%" r="65%">
          <stop offset="0%" stopColor="#FFD9A0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFD9A0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#restBg)" />
      <circle cx="220" cy="10" r="130" fill="url(#lampGlow)" />
      <line x1="220" y1="0" x2="220" y2="55" stroke="#6B5F55" strokeWidth="2" />
      <ellipse cx="220" cy="60" rx="22" ry="8" fill="#C2410C" />
      <rect x="70" y="170" width="260" height="16" rx="8" fill="#3A2A1F" />
      <rect x="90" y="150" width="220" height="20" rx="10" fill="#4A3527" />
      <circle cx="150" cy="150" r="6" fill="#FFD9A0" opacity="0.85" />
      <circle cx="250" cy="150" r="6" fill="#FFD9A0" opacity="0.85" />
      <path d="M40 250 L55 140 L70 160 L60 250 Z" fill="#1F6F54" opacity="0.8" />
      <path d="M35 250 L50 150 L65 170 L52 250 Z" fill="#245F49" opacity="0.7" />
      {[...Array(10)].map((_, i) => (
        <circle
          key={i}
          cx={30 + ((i * 37) % 370)}
          cy={20 + ((i * 53) % 120)}
          r={1.4}
          fill="#FFD9A0"
          opacity={0.5}
        />
      ))}
    </svg>
  );
}

function DishScene() {
  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dishBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#15503C" />
          <stop offset="60%" stopColor="#1F6F54" />
          <stop offset="100%" stopColor="#2E2018" />
        </linearGradient>
        <radialGradient id="curry" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F4A261" />
          <stop offset="60%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#8A2E0C" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#dishBg)" />
      <rect x="60" y="205" width="280" height="10" rx="5" fill="#3A2A1F" opacity="0.6" />
      <ellipse cx="200" cy="150" rx="120" ry="45" fill="#2B4A34" />
      <ellipse cx="200" cy="145" rx="100" ry="36" fill="url(#curry)" />
      <ellipse cx="200" cy="145" rx="70" ry="24" fill="#F4A261" opacity="0.35" />
      <circle cx="170" cy="130" r="4" fill="#245F49" />
      <circle cx="225" cy="150" r="3.5" fill="#245F49" />
      <circle cx="195" cy="120" r="3" fill="#245F49" />
      <path
        d="M175 95 q6 -18 0 -32"
        stroke="#FFD9A0"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M200 90 q6 -18 0 -32"
        stroke="#FFD9A0"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M225 95 q6 -18 0 -32"
        stroke="#FFD9A0"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

interface HeroRevealProps {
  children: ReactNode;
  className?: string;
}

// Renders the hero's own <section> wrapper (rather than an inset layer)
// so pointer tracking works across the whole hero, including over the text
// content — a sibling layer behind the text would never receive pointermove
// there, since the topmost element under the cursor captures it.
export function HeroReveal({ children, className }: HeroRevealProps) {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const smoothX = useSpring(mx, { stiffness: 140, damping: 20, mass: 0.4 });
  const smoothY = useSpring(my, { stiffness: 140, damping: 20, mass: 0.4 });

  const radiusTarget = useMotionValue(0);
  const radius = useSpring(radiusTarget, { stiffness: 90, damping: 18 });

  const maskImage = useMotionTemplate`radial-gradient(circle ${radius}px at ${smoothX}% ${smoothY}%, transparent 0%, transparent 55%, black 100%)`;

  function handlePointerMove(e: PointerEvent<HTMLElement>): void {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <section
      className={className}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => radiusTarget.set(280)}
      onPointerLeave={() => radiusTarget.set(0)}
    >
      <div className="absolute inset-0 -z-20">
        <DishScene />
      </div>
      <motion.div
        className="absolute inset-0 -z-20"
        style={{ WebkitMaskImage: maskImage, maskImage } as unknown as CSSProperties}
      >
        <RestaurantScene />
      </motion.div>
      {/* Overlay for text legibility, on top of both scenes. */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/15" />

      {children}
    </section>
  );
}
