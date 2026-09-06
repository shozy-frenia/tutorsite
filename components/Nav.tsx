import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import AccountButton from "@/components/AccountButton";
import StickyNav from "@/components/motion/StickyNav";

/**
 * Identity bar, as a floating card.
 *
 * It used to be a flat strip flush against the top of the page with no
 * background at all, which meant that on scroll the page's content ran up
 * underneath the links and the first thing anyone saw was an edge. Twelve of
 * twenty-six pilots took a full minute to work out what the site was, and one
 * never did — a header that does not announce itself as a header is part of
 * that.
 *
 * Now it is a card: hairline frame, 16px corners, an inset from the viewport
 * on all three sides, and a very wide, very faint yellow bloom underneath so
 * it reads as sitting above the page rather than printed on it. `sticky`
 * rather than `fixed` deliberately — fixed would take the bar out of flow and
 * every page below would need a compensating pad, which is exactly the kind of
 * thing that silently breaks on one route and nobody notices.
 *
 * The wordmark drops to its square below `sm`, so a phone keeps its room for
 * the actions on the right.
 */
export default function Nav({ variant = "canvas" }: { variant?: "canvas" | "study" }) {
  return (
    <StickyNav>
      <header
        className="flex items-center justify-between gap-3 px-3 py-2.5 md:px-4 mx-auto"
        style={{
          pointerEvents: "auto",
          maxWidth: 1240,
          background: variant === "study" ? "var(--color-study)" : "var(--color-canvas)",
          border: "1px solid var(--color-rule)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-card), var(--shadow-halo)",
          /* The bar is translucent-adjacent: content scrolling under a solid
             cream card is fine, but the blur keeps the seam from reading as a
             hard cut when a 3D canvas passes behind it. */
          backdropFilter: "saturate(1.1) blur(6px)",
        }}
      >
        {/* Visibility lives on the wrappers, never on the mark itself: BrandMark
            sets display:block inline on its <svg>, and an inline style beats a
            `hidden` utility class — put them on the same element and both marks
            render. */}
        <Link href="/" className="no-underline shrink-0 pl-1" aria-label="Talap — home">
          <span className="hidden sm:block">
            <BrandMark height={24} />
          </span>
          <span className="sm:hidden">
            <BrandMark height={22} iconOnly />
          </span>
        </Link>

        {/* Everything competes for about 250px once the wordmark and the
            account control have taken theirs, and a flex row that cannot fit
            wraps rather than truncating — which is how "Start a mock" ended up
            set over three lines on a 390px phone. So the two text links are
            desktop-only, the primary action is never allowed to wrap, and on a
            phone the bar carries exactly what a phone has room for. */}
        <nav className="flex items-center gap-1 md:gap-1.5">
          <Link href="/library" className="nav-link no-underline hidden md:inline-flex">
            Mock papers
          </Link>
          <Link href="/dashboard" className="nav-link no-underline hidden md:inline-flex">
            Dashboard
          </Link>
          <Link
            href="/library"
            className="btn btn-sm btn-primary no-underline whitespace-nowrap"
          >
            Start a mock
          </Link>
          {/* Falls back to a plain link to /auth when Firebase is not
              configured, so the entry point is never simply absent. */}
          <AccountButton />
        </nav>
      </header>
    </StickyNav>
  );
}
