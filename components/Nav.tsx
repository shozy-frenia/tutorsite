"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BrandMark from "@/components/BrandMark";
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher";
import { useSession } from "@/components/auth/SessionProvider";
import { useT } from "@/components/i18n/LocaleProvider";

interface DropItem {
  label: string;
  hint: string;
  href: string;
}

interface NavGroup {
  label: string;
  href?: string;
  items?: DropItem[];
}

/**
 * The menu, built per render because every label is a dictionary lookup.
 *
 * A module-level constant would be resolved once, in whatever language the
 * first render happened to use, and would then survive every switch — which is
 * exactly how the header used to end up in English under a Kazakh page.
 */
function menu(
  t: (key: string, vars?: Record<string, string | number>) => string
): NavGroup[] {
  return [
    {
      label: t("nav.practise"),
      items: [
        {
          label: t("nav.mockPapers"),
          hint: t("nav.mockPapersHint"),
          href: "/library",
        },
        {
          label: t("nav.dashboard"),
          hint: t("nav.dashboardHint"),
          href: "/dashboard",
        },
      ],
    },
    {
      label: t("nav.theExam"),
      items: [
        {
          label: t("nav.grade", { year: 10 }),
          hint: t("nav.grade10Hint"),
          href: "/#grades",
        },
        {
          label: t("nav.grade", { year: 11 }),
          hint: t("nav.grade11Hint"),
          href: "/#grades",
        },
        {
          label: t("nav.grade", { year: 12 }),
          hint: t("nav.grade12Hint"),
          href: "/#grades",
        },
        {
          label: t("nav.boundaryTables"),
          hint: t("nav.boundaryTablesHint"),
          href: "/#boundaries",
        },
      ],
    },
    { label: t("nav.whatItDoes"), href: "/#features" },
  ];
}



const CHEVRON = (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M2 4l3 3 3-3" />
  </svg>
);

/**
 * The identity bar: a floating pill over the paper.
 *
 * It is fixed, so a spacer of the same height follows it — every page below
 * simply starts after the spacer instead of each one having to know the bar's
 * height. On a phone the links collapse into a full-screen sheet, because
 * three dropdowns do not fit in 380px and 14 of 26 pilots were on a phone.
 *
 * The account button only exists when Supabase is configured; `useSession`
 * reports `enabled: false` without keys, and the whole platform stays in guest
 * mode with no dead sign-in affordance. That is a requirement of the patch,
 * not an optimisation.
 */
export default function Nav({
  variant = "canvas",
}: {
  /** Kept for callers that set it; both registers now share one bar. */
  variant?: "canvas" | "study";
}) {
  void variant;

  const pathname = usePathname();
  const t = useT();
  const { user, enabled, signOut } = useSession();

  const groups = menu(t);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close the sheet on navigation, or a student taps a link and lands on the
  // new page with the old page's menu still covering it.
  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    document.body.classList.toggle("is-locked", menuOpen);
    return () => {
      document.body.classList.remove("menu-open");
      document.body.classList.remove("is-locked");
    };
  }, [menuOpen]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenGroup(null);
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <header className="nav" ref={navRef}>
        <div className="nav__inner">
          <Link
            href="/"
            className="logo no-underline shrink-0"
            aria-label="Talap"
          >
            <BrandMark height={24} />
          </Link>

          <nav className="nav__links" aria-label={t("nav.menu")}>
            {groups.map((group) =>
              group.href ? (
                <Link key={group.label} href={group.href} className="nav__link">
                  {group.label}
                </Link>
              ) : (
                <div
                  key={group.label}
                  className={`nav__item${openGroup === group.label ? " is-open" : ""}`}
                  onMouseEnter={() => setOpenGroup(group.label)}
                  onMouseLeave={() => setOpenGroup(null)}
                >
                  <button
                    type="button"
                    className="nav__link"
                    aria-expanded={openGroup === group.label}
                    onClick={() =>
                      setOpenGroup((open) =>
                        open === group.label ? null : group.label
                      )
                    }
                  >
                    {group.label}
                    {CHEVRON}
                  </button>
                  <div className="nav__drop">
                    {group.items?.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setOpenGroup(null)}
                      >
                        {item.label}
                        <span>{item.hint}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}
          </nav>

          <div className="nav__right">
            <LocaleSwitcher />

            {enabled &&
              (user ? (
                <button
                  type="button"
                  className="btn btn--outline btn--sm nav__account"
                  onClick={() => void signOut()}
                >
                  {t("nav.signOut")}
                </button>
              ) : (
                <Link
                  href={`/auth?next=${encodeURIComponent(pathname ?? "/dashboard")}`}
                  className="btn btn--outline btn--sm nav__account"
                >
                  {t("nav.signIn")}
                </Link>
              ))}

            <Link className="btn btn--primary btn--sm nav__cta" href="/library">
              <span className="btn__arrow">→</span>
              {t("nav.start")}
            </Link>

            <button
              type="button"
              className="burger"
              aria-label={menuOpen ? t("common.close") : t("nav.menu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      {/* The bar is fixed; this keeps the page from starting underneath it. */}
      <div className="nav__spacer" aria-hidden="true" />

      <div className="mnav" aria-hidden={!menuOpen}>
        {groups.map((group) => (
          <div className="mnav__grp" key={group.label}>
            <h4>{group.label}</h4>
            {group.href ? (
              <Link href={group.href}>{group.label}</Link>
            ) : (
              group.items?.map((item) => (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ))
            )}
          </div>
        ))}
        <Link className="btn btn--primary btn--block" href="/library">
          <span className="btn__arrow">→</span>
          {t("nav.start")}
        </Link>
      </div>

    </>
  );
}
