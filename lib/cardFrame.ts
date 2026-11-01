/**
 * The collectible-card frame shared by the home player cards and the cup
 * standings cards: a bear-coloured outer shape with two cut corners, and an
 * inner surface cut 1px smaller so the frame runs evenly along the cuts.
 */

/** Two cut corners, top-right and bottom-left, like a trading card. */
export const cardClip = (corner: number) =>
  `polygon(0 0, calc(100% - ${corner}px) 0, 100% ${corner}px, 100% 100%, ${corner}px 100%, 0 calc(100% - ${corner}px))`

/** Faint diagonal stripes over the card surface; --card-stripe follows the theme. */
export const CARD_STRIPES = "repeating-linear-gradient(135deg, var(--card-stripe) 0 2px, transparent 2px 16px)"

/** Archivo's condensed cut, used for every number on the cards. */
export const ARCHIVO_CONDENSED = "'wdth' 62"
