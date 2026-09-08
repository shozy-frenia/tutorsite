"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChartLine, LogOut, Settings } from "lucide-react";
import { useT } from "@/components/i18n/LocaleProvider";

export interface ProfileMenuPerson {
  /** The student's first name, from their local profile. */
  name: string;
  /** Email when signed in; the grade line when working as a guest. */
  subtitle: string;
  /** Only a signed-in account can be signed out of. */
  canSignOut: boolean;
}

/**
 * The account menu in the header.
 *
 * Behaviour comes from Radix: roving focus, arrow keys, type-ahead, Escape,
 * outside-click and the aria-menu roles that make it a menu to a screen reader
 * rather than a div that opens. The look is this site's own — paper, forest ink
 * and a hairline — rather than the zinc-and-dark-mode surface the reference
 * component shipped with, which would have been a second design system living
 * beside globals.css.
 *
 * The avatar is a monogram, not a photograph. There is no avatar in the data
 * model and no upload; putting a stock face on a real student's account would
 * be inventing an identity for them.
 */
export function ProfileMenu({
  person,
  onSignOut,
}: {
  person: ProfileMenuPerson;
  onSignOut: () => void;
}) {
  const t = useT();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="pm__trigger" aria-label={t("nav.account")}>
          <span className="pm__avatar" aria-hidden="true">
            {initials(person.name)}
          </span>
          <span className="pm__who">
            <span className="pm__name">{person.name}</span>
            <span className="pm__sub">{person.subtitle}</span>
          </span>
          <svg
            className="pm__chevron"
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
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="pm__menu" align="end" sideOffset={8}>
          <DropdownMenu.Item asChild>
            <Link href="/dashboard" className="pm__item">
              <ChartLine className="pm__icon" aria-hidden="true" />
              {t("nav.progress")}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link href="/settings" className="pm__item">
              <Settings className="pm__icon" aria-hidden="true" />
              {t("nav.settings")}
            </Link>
          </DropdownMenu.Item>

          {person.canSignOut && (
            <>
              <DropdownMenu.Separator className="pm__rule" />
              <DropdownMenu.Item asChild>
                <button
                  type="button"
                  className="pm__item pm__item--danger"
                  onClick={onSignOut}
                >
                  <LogOut className="pm__icon" aria-hidden="true" />
                  {t("nav.signOut")}
                </button>
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/**
 * One or two letters for the monogram.
 *
 * Uses `Intl.Segmenter` where it exists so a name in any script is split by
 * grapheme rather than by UTF-16 unit — "Әсем" must start with "Ә", not with
 * half of it.
 */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) return "?";

  const firstLetter = (word: string) => {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const segmenter = new Intl.Segmenter(undefined, {
        granularity: "grapheme",
      });
      const [first] = segmenter.segment(word);
      return first?.segment ?? word.slice(0, 1);
    }
    return word.slice(0, 1);
  };

  return words.map(firstLetter).join("").toUpperCase();
}
