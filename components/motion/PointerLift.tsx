"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  as?: "div" | "article";
  className?: string;
  style?: CSSProperties;
  /** Forwarded to the rendered element — the library grid filters on these. */
  [key: `data-${string}`]: string | number | undefined;
}

/** The system's resting shadow offset, px — `--shadow-brutal`. */
const REST = 5;
/** How far the offset may travel either side of REST, px. */
const SWING = 5;

/**
 * A card lit from wherever your cursor is: its hard offset shadow swings to
 * the far side, so the card reads as leaning toward the pointer.
 *
 * The tracking maths is Border Glow's — pointer position resolved against the
 * card's centre, normalised per axis so a wide card and a tall one respond
 * alike — but the mark it makes is not. Border Glow blooms a soft, multi-stop
 * purple gradient through a blurred padding box, and this design system has
 * no blur, no gradient and no second accent colour; the highlighter yellow is
 * the only chromatic mark and is always a hard edge.
 *
 * The first attempt honoured that by drawing a crisp yellow ring outside the
 * border, and it failed in the browser for a reason worth recording: half the
 * cards on this site already have a highlighter-yellow header, so a yellow
 * ring against them read as a smudge rather than a signal, and on a
 * 700px-wide card the lit arc is too small a fraction of the perimeter to
 * notice. The hard offset shadow is this system's actual signature and works
 * on any fill, so that is what moves instead.
 *
 * Cards using this should not also carry `.press` — that sets its own
 * `box-shadow` on hover at a higher specificity and would freeze the swing.
 */
export default function PointerLift({
  children,
  as = "div",
  className = "",
  style,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;

    // -1 … 1 on each axis, so the response is the same shape on a wide card
    // as on a tall one.
    const nx = ((event.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((event.clientY - r.top) / r.height) * 2 - 1;

    // Swing around the resting offset rather than through it: the shadow
    // stays down-and-right, because the whole page is lit from the top left
    // and a shadow that crossed to the other side would read as a mistake.
    // Cursor at the top-left corner lifts the card to a 10px shadow; at the
    // bottom-right it flattens to 0 and the card reads as pressed.
    el.style.setProperty("--sx", `${(REST - nx * SWING).toFixed(1)}px`);
    el.style.setProperty("--sy", `${(REST - ny * SWING).toFixed(1)}px`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty("--sx");
    el.style.removeProperty("--sy");
  };

  const Tag = as;

  return (
    <Tag
      // One ref type covering both branches of the union `as` allows.
      ref={ref as React.Ref<HTMLDivElement> & React.Ref<HTMLElement>}
      className={`pointer-lift ${className}`.trim()}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}
