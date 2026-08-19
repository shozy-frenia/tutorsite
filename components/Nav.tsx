import Link from "next/link";

/**
 * Text-only identity bar, per DESIGN.md: no logo lockup, no background,
 * 12px bold uppercase, arrow-prefixed links.
 */
export default function Nav({ variant = "canvas" }: { variant?: "canvas" | "study" }) {
  return (
    <header
      className="flex items-center justify-between gap-4 px-5 py-4 md:px-10"
      style={{ background: variant === "study" ? "var(--color-study)" : "transparent" }}
    >
      <Link href="/" className="t-label no-underline" style={{ color: "var(--color-ink)" }}>
        TALAP<sup className="text-[8px]">®</sup>
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
