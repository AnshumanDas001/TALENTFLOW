import React, { useCallback, useMemo, useRef, useState } from "react";
import clsx from "clsx";

/**
 * CardSpotlight
 * A card component with a mouse-follow spotlight revealing a radial gradient background.
 * Props:
 * - children: React.ReactNode (required)
 * - radius: number = 350 (px)
 * - color: string = "#262626" (background color behind spotlight)
 * - intensity: number = 1 (multiplier for light strength)
 * - className?: string
 */
export function CardSpotlight({ children, radius = 350, color = "transparent", intensity = 1, className }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const [hovered, setHovered] = useState(false);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => {
    setHovered(false);
    setPos({ x: -1, y: -1 });
  }, []);

  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

  const mask = useMemo(() => {
    if (pos.x === -1 && pos.y === -1) return "none";
    const white = clamp(0.95 * intensity);
    return `radial-gradient(${radius}px ${radius}px at ${pos.x}px ${pos.y}px, rgba(255,255,255,${white}), transparent 80%)`;
  }, [pos, radius, intensity]);

  const bg = useMemo(() => {
    const basePrimary = hovered ? 0.7 : 0.45; // bumped defaults
    const baseSecondary = hovered ? 0.35 : 0.18;
    const primary = clamp(basePrimary * intensity);
    const secondary = clamp(baseSecondary * intensity);
    return `radial-gradient(closest-side, rgba(59,130,246,${primary}), rgba(59,130,246,${secondary}), transparent)`;
  }, [hovered, intensity]);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={clsx(
        "relative overflow-hidden rounded-2xl border border-gray-700 bg-transparent",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {/* Spotlight gradient layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[opacity,background] duration-200"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          background: bg,
          opacity: pos.x === -1 ? 0 : 1,
        }}
      />

      {/* Content */}
      <div className="relative p-6">
        {children}
      </div>
    </div>
  );
}

export default CardSpotlight;
