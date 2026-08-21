"use client";

import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";

interface RevealButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  fill?: string;
  hoverFill?: string;
  textColor?: string;
  hoverTextColor?: string;
  border?: string;
  shadow?: string;
  style?: CSSProperties;
  className?: string;
  disabled?: boolean;
}

/**
 * A CTA whose fill swaps on a circular reveal grown from wherever the
 * pointer entered — the same two-face technique as OriginKit's Radial
 * Reveal Button, rebuilt on a plain CSS clip-path transition instead of
 * framer-motion. The rest of the site presses its buttons with plain CSS
 * transitions (see `.press` / `.press-swiss` in globals.css); this keeps
 * that same register rather than introducing a second animation runtime
 * for one button. Square corners and a hard offset shadow throughout —
 * no blur, no glow, matching the neo-brutalist landing register.
 */
export default function RevealButton({
  href,
  onClick,
  children,
  fill = "var(--color-ink)",
  hoverFill = "var(--color-highlighter)",
  textColor = "var(--color-canvas)",
  hoverTextColor = "var(--color-ink)",
  border = "3px solid var(--color-ink)",
  shadow = "var(--shadow-brutal)",
  style,
  className = "",
  disabled = false,
}: RevealButtonProps) {
  const overlayRef = useRef<HTMLSpanElement>(null);

  const anchor = (e: React.PointerEvent<HTMLElement>) => {
    const el = overlayRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    el.style.setProperty("--rx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--ry", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const onEnter = (e: React.PointerEvent<HTMLElement>) => {
    anchor(e);
    overlayRef.current?.style.setProperty("--rr", "150%");
  };

  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    anchor(e);
    overlayRef.current?.style.setProperty("--rr", "0%");
  };

  const sharedStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border,
    boxShadow: shadow,
    padding: "14px 26px",
    fontWeight: 700,
    fontSize: "18px",
    letterSpacing: "-0.02em",
    background: fill,
    color: textColor,
    overflow: "hidden",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const overlay = (
    <span
      ref={overlayRef}
      aria-hidden
      className="reveal-btn__overlay"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        background: hoverFill,
        color: hoverTextColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "18px",
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        className={`no-underline ${className}`}
        style={sharedStyle}
      >
        <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
        {overlay}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={className}
      style={sharedStyle}
    >
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      {overlay}
    </button>
  );
}
