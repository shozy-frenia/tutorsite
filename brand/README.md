# Talap — brand assets

The mark is one idea at two densities.

The **wordmark** is the word lying under a highlighter: the yellow clears the
tops of the caps, enters a little before the T and follows through well past
the P — the way a stroke actually lands on a printed page rather than the way a
rectangle sits behind text.

The **icon** is that same swipe seen from close up. The yellow becomes the
field and a single letter from the wordmark's own typeface sits on it. Nothing
in the icon is redrawn; it is the wordmark compressed to 16 px.

`STRUCK-GRID.md` is the design philosophy the system was drawn from.
`talap-identity-plate.pdf` / `.png` is the one-page specification — construction,
clear space, palette, lockups, applications. That is the sheet to put in a deck.

## Files

    logo/
      wordmark-primary.svg     the wordmark. Light grounds.
      wordmark-on-dark.svg     swipe grown to a full plate, for dark grounds.
      wordmark-ink.svg         no swipe, ink. Use when the yellow is carried elsewhere.
      wordmark-canvas.svg      no swipe, light. Same, on dark.
      wordmark-cyrillic.svg    ТАЛАП.
      icon-primary.svg         yellow field, ink letter. The default.
      icon-inverse.svg         ink field, yellow letter.
      icon-ink.svg             ink field, light letter. One colour plus ground.
      icon-outline.svg         ruled, unfilled. Stamps, embossing, single-colour print.
      lockup-horizontal*.svg   icon + wordmark, one line.
      lockup-stacked*.svg      icon over wordmark over descriptor.
      png/                     raster copies, transparent, `-<width>` in the name.

Every letterform is an outline, so nothing depends on Inter being installed.

## Rules

- **The yellow appears once.** In a lockup the icon carries it and the wordmark
  is set plain. Two yellow masses a small gap apart stop reading as a mark and a
  word and start reading as one interrupted bar.
- **Clear space is a quarter of the icon's side**, on every edge.
- **Minimum icon size is 16 px.** Below that the letter closes up.
- **The wordmark needs a light ground.** Its letters are always ink; on dark,
  use `wordmark-on-dark.svg`, whose swipe grows to carry them.
- **Never** add a shadow, glow, gradient, outline or rounded corner to the mark.
  The offset shadow is a property of cards in the product, not of the logo.

## Palette

| Hex | Name | Role |
|---|---|---|
| `#151515` | Ink | Every mark, every rule, every letter. |
| `#fff824` | Highlighter | The single accent. Applied only where something matters. |
| `#f3f3f3` | Canvas | The ground. |

`#b8f000` (acid lime) exists in the product but is **semantic only** — it means
"correct" or "A*". It is never part of the logo.

## Note on the app favicon

`app/icon.svg` in the site predates these files and draws the letter a
different way. Nothing here changes it; syncing it to `logo/icon-primary.svg`
is a one-line swap whenever you want the tab to match the identity.
