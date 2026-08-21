/**
 * The Talap mark, inline.
 *
 * Geometry is lifted verbatim from `brand/logo/lockup-horizontal.svg` and
 * `brand/logo/icon-primary.svg`, which are generated from the outlined Inter
 * glyphs — see `brand/README.md`. Inline rather than an <img> so the three
 * fills can be driven per placement: the header sits on canvas, the phone mock
 * sits on a lighter sheet, and a dark ground needs the wordmark to flip while
 * the icon stays exactly as it is.
 *
 * Do not retype the paths by hand. If the identity moves, regenerate the brand
 * files and copy the new `d` attributes across.
 */

const GLYPH = {
  T: "M66 1202V1490H1320V1202H869V0H517V1202Z",
  A: "M47 0 544 1490H1017L1529 0H1133L926 651Q876 814 829.5 997.5Q783 1181 736 1378H815Q770 1180 728.0 996.5Q686 813 639 651L439 0ZM385 317V587H1192V317Z",
  L: "M116 0V1490H469V288H1092V0Z",
  P: "M116 0V1490H726Q894 1490 1016.0 1425.0Q1138 1360 1203.5 1244.0Q1269 1128 1269 975Q1269 821 1202.0 707.0Q1135 593 1011.0 529.0Q887 465 716 465H338V744H652Q735 744 791.0 773.0Q847 802 875.0 854.0Q903 906 903 975Q903 1045 875.0 1096.5Q847 1148 790.5 1176.0Q734 1204 651 1204H469V0Z",
} as const;

/** Pen positions after shaping, in font units — kerned, not evenly spaced. */
const WORD: ReadonlyArray<[keyof typeof GLYPH, number]> = [
  ["T", 0],
  ["A", 1119.08],
  ["L", 2613.16],
  ["A", 3689.24],
  ["P", 5183.32],
];

const LOCKUP_W = 606.47;
const LOCKUP_H = 130;
const ICON_SIDE = 100;

interface Props {
  /** Height in px. Width follows the mark's own ratio. */
  height?: number;
  /** Drop the wordmark and keep the square — for narrow rails. */
  iconOnly?: boolean;
  field?: string;
  letter?: string;
  word?: string;
  className?: string;
  title?: string;
}

export default function BrandMark({
  height = 26,
  iconOnly = false,
  field = "var(--color-highlighter)",
  letter = "var(--color-ink)",
  word = "var(--color-ink)",
  className,
  title = "Talap",
}: Props) {
  const iconGroup = (
    <>
      <rect x="0" y="0" width={ICON_SIDE} height={ICON_SIDE} fill={field} />
      <g transform="translate(23.954,76.5) scale(0.037584,-0.037584)" fill={letter}>
        <path d={GLYPH.T} />
      </g>
    </>
  );

  if (iconOnly) {
    return (
      <svg
        role="img"
        aria-label={title}
        className={className}
        height={height}
        width={height}
        viewBox={`0 0 ${ICON_SIDE} ${ICON_SIDE}`}
        style={{ display: "block" }}
      >
        {iconGroup}
      </svg>
    );
  }

  return (
    <svg
      role="img"
      aria-label={title}
      className={className}
      height={height}
      width={(height * LOCKUP_W) / LOCKUP_H}
      viewBox={`0 0 ${LOCKUP_W} ${LOCKUP_H}`}
      style={{ display: "block" }}
    >
      <g transform="scale(1.3)">{iconGroup}</g>
      <g transform="translate(169,115) scale(0.067114,-0.067114)" fill={word}>
        {WORD.map(([glyph, x], i) => (
          <path key={`${glyph}-${i}`} d={GLYPH[glyph]} transform={`translate(${x},0)`} />
        ))}
      </g>
    </svg>
  );
}
