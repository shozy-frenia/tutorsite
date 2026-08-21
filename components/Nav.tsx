import Link from "next/link";
import BrandMark from "@/components/BrandMark";

/**
 * Identity bar. DESIGN.md originally specified a text-only wordmark here; the
 * mark now exists (see `brand/`), so the bar carries it instead. Everything
 * else about the bar is unchanged — no background, 12px bold uppercase links,
 * arrow prefixes.
 *
 * The wordmark drops away below `sm` and the square carries the header alone,
 * so a phone keeps its room for the actions on the right.
 */
export default function Nav({ variant = "canvas" }: { variant?: "canvas" | "study" }) {
  return (
    <header
      className="flex items-center justify-between gap-4 px-5 py-4 md:px-10"
      style={{ background: variant === "study" ? "var(--color-study)" : "transparent" }}
    >
      {/* Visibility lives on the wrappers, never on the mark itself: BrandMark
          sets display:block inline on its <svg>, and an inline style beats a
          `hidden` utility class — put them on the same element and both marks
          render. */}
      <Link href="/" className="no-underline shrink-0" aria-label="Talap — home">
        <span className="hidden sm:block">
          <BrandMark height={26} />
        </span>
        <span className="sm:hidden">
          <BrandMark height={24} iconOnly />
        </span>
      </Link>

      <nav className="flex items-center gap-4 md:gap-5">
        <Link href="/library" className="t-label no-underline hidden sm:inline">
          ↳ MOCKS
        </Link>
        <Link href="/dashboard" className="t-label no-underline">
          ↳ DASHBOARD
        </Link>
        <Link href="/library" className="pill pill-filled press no-underline">
          START A MOCK
        </Link>
      </nav>
    </header>
  );
}
