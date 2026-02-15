/**
 * Design tokens — shared colors, backgrounds, fonts, and spacing.
 * Single source of truth for all duplicated values across components.
 */

// ── Page background ──
export const BG_PAGE =
  "radial-gradient(at 100% 50%, #522c63 0px, transparent 50%), radial-gradient(at 13% 90%, #542D4C 0px, transparent 50%), radial-gradient(at 69% 97%, #6e3147 0px, transparent 50%), radial-gradient(at 2% 23%, #522c63 0px, transparent 50%), radial-gradient(at 45% 94%, #a74f65 0px, transparent 50%), radial-gradient(at 78% 36%, #4f295e 0px, transparent 50%) #000000";

export const BG_PAGE_BASE = "#251838";

// ── Card background (MainCard / LeaderboardMainCard) ──
export const BG_CARD =
  "radial-gradient(at 4.9% 10.4%, #ec776b 0px, transparent 50%), radial-gradient(at 41% 54%, #5e2f60 0px, transparent 50%), radial-gradient(at 11.8% 91.7%, #522c63 0px, transparent 50%), radial-gradient(at 93.7% 83.6%, #a74f65 0px, transparent 50%), radial-gradient(at 96.4% 8.5%, #4f295e 0px, transparent 50%) #000000";

export const CARD_SHADOW =
  "0 20px 60px rgba(0,0,0,.38), -8px -8px 30px rgba(255,170,80,.12), 12px 12px 35px rgba(255,130,40,.1), inset 0 1px 0 rgba(255,255,255,.06)";

export const BACKDROP_BLUR =
  "blur(40px) contrast(100%) brightness(100%)";

// ── Theme colors ──
export const COLOR_ORANGE_OUTER = "#E48831";
export const COLOR_ORANGE_INNER = "#FAA448";
export const COLOR_ORANGE_BADGE = "#E58831";

export const COLOR_PURPLE_OUTER = "#67328C";
export const COLOR_PURPLE_INNER = "#763991";
export const COLOR_PURPLE_BADGE = "#66338C";
export const COLOR_PURPLE_CARD = "#9B51B8";
export const COLOR_PURPLE_ACCENT = "#8B5CF6";

export const COLOR_RED_OUTER = "#D84542";
export const COLOR_RED_INNER = "#C83B44";
export const COLOR_RED_BADGE = "#D84442";
export const COLOR_RED_CARD = "#D64A48";
export const COLOR_RED_BLOB = "#D64F4F";

export const COLOR_CORAL = "#FA6B74";
export const COLOR_CORAL_BLOB = "#EF5F5E";

// ── Sidebar colors ──
export const SIDEBAR_OUTER = "#E08730";
export const SIDEBAR_INNER = "#FBA448";

// ── Background blob colors ──
export const BLOB_DARK = "#351739";
export const BLOB_RED_LIGHT = "#D3524C";
export const BLOB_RED = "#E1615B";

// ── Status badge colors ──
export const STATUS_DONE = "#90B171";
export const STATUS_ACTIVE = "#E57953";

// ── Fonts ──
export const FONT_HEADING = "'Inter'";
export const FONT_BODY = "'Inter'";

// ── Animation easings ──
export const EASE_SPRING = "cubic-bezier(0.16,1,0.3,1)";

// ── Common text styles ──
export const TEXT_WHITE = "#fff";
export const TEXT_MUTED = "rgba(255,255,255,0.5)";
export const TEXT_DIM = "rgba(255,255,255,0.25)";
export const TEXT_SUBTLE = "rgba(210,180,205,.6)";
