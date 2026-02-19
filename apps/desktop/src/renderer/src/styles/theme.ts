/**
 * Centralized theme configuration — card themes, typography, and shared styles.
 * All components should import from here instead of hardcoding values.
 */
import type { CSSProperties } from "react";
import {
  FONT_HEADING,
  EASE_SPRING,
  TEXT_WHITE,
  TEXT_DIM,
  COLOR_RED_OUTER,
  COLOR_RED_INNER,
  COLOR_RED_BADGE,
  COLOR_RED_BLOB,
  COLOR_RED_CARD,
  COLOR_ORANGE_OUTER,
  COLOR_ORANGE_INNER,
  COLOR_ORANGE_BADGE,
  COLOR_PURPLE_OUTER,
  COLOR_PURPLE_INNER,
  COLOR_PURPLE_BADGE,
  COLOR_PURPLE_CARD,
  COLOR_CORAL,
  COLOR_CORAL_BLOB,
} from "../utils/tokens";

// ── Metric Card Themes ──

export type MetricTheme = "red" | "orange" | "purple";

export interface MetricThemeConfig {
  blobColor: string;
  bodyColor: string;
  /** SVG viewBox dimensions */
  viewBox: string;
  /** SVG blob path `d` attribute */
  blobPath: string;
  /** SVG card body path `d` attribute */
  bodyPath: string;
  /** Text X offset in SVG */
  textX: number;
  /** Title Y offset in SVG */
  titleY: number;
  /** Value Y offset in SVG */
  valueY: number;
  /** Optional gradient definition for blob (purple theme) */
  blobGradient?: { id: string; x1: string; y1: string; x2: string; y2: string; stopColor: string };
}

export const METRIC_THEMES: Record<MetricTheme, MetricThemeConfig> = {
  red: {
    blobColor: COLOR_RED_OUTER,
    bodyColor: COLOR_RED_INNER,
    viewBox: "0 0 437 190",
    blobPath:
      "M235.343 117.899C235.343 117.899 233.385 157.709 109.468 168.364C-14.4485 179.02 -24.8595 88.1642 74.5475 29.9597C173.955 -28.2448 281.483 27.2354 329.346 55.8117C377.208 84.3879 235.343 117.899 235.343 117.899Z",
    bodyPath:
      "M32.8477 77.2598C32.8477 36.5339 67.4922 4.53767 108.154 6.81347C192.477 11.5329 259.273 11.6778 343.604 6.92499C384.201 4.63703 418.848 36.5433 418.848 77.2039C418.848 119.372 381.713 151.974 339.733 147.998C305.573 144.762 266.131 141.823 233.848 141.603C197.307 141.352 150.93 144.669 111.934 148.269C69.9148 152.147 32.8477 119.458 32.8477 77.2598Z",
    textX: 65,
    titleY: 62,
    valueY: 108,
  },
  orange: {
    blobColor: COLOR_ORANGE_OUTER,
    bodyColor: COLOR_ORANGE_INNER,
    viewBox: "0 0 437 191",
    blobPath:
      "M235.343 118.587C235.343 118.587 233.385 158.397 109.468 169.053C-14.4485 179.708 -24.8595 88.8527 74.5475 30.6482C173.955 -27.5563 281.483 27.9239 329.346 56.5001C377.208 85.0764 235.343 118.587 235.343 118.587Z",
    bodyPath:
      "M32.8477 72.3429C32.8477 33.7697 64.1174 2.5 102.691 2.5H349.106C387.623 2.5 418.848 33.7246 418.848 72.242C418.848 116.314 378.445 149.483 334.813 143.274C300.936 138.453 262.57 134.214 231.348 134C196.773 133.763 153.884 138.347 116.828 143.527C73.1906 149.627 32.8477 116.405 32.8477 72.3429Z",
    textX: 65,
    titleY: 55,
    valueY: 103,
  },
  purple: {
    blobColor: COLOR_PURPLE_OUTER,
    bodyColor: COLOR_PURPLE_INNER,
    viewBox: "0 0 409 177",
    blobPath:
      "M227.464 128.978C149.406 99.2007 146.907 185.554 58.9049 145.554C-29.0973 105.554 94.5648 34.4039 184.41 37.8027C274.254 41.2016 360.151 30.6531 379.663 69.5414C399.175 108.43 305.523 158.756 227.464 128.978Z",
    bodyPath:
      "M7.5 65.9906C7.5 30.9257 35.9257 2.5 70.9906 2.5H333.663C349.789 2.5 366.563 7.02783 374.954 20.7994C383.36 34.5952 388.177 52.0298 390.785 69.7902C397.552 115.871 350.687 146.135 305.266 135.831C268.525 127.496 227.618 119.714 199.453 118.721C166.666 117.565 126.422 123.7 91.2671 131.047C49.2965 139.818 7.5 108.868 7.5 65.9906Z",
    textX: 40,
    titleY: 50,
    valueY: 98,
    blobGradient: {
      id: "paint0_linear_mc3",
      x1: "36.9484",
      y1: "-101.771",
      x2: "-285.999",
      y2: "152.046",
      stopColor: COLOR_PURPLE_OUTER,
    },
  },
};

// ── Activity Card Themes ──

export type ActivityTheme = "purple" | "red" | "coral";

export interface ActivityThemeConfig {
  blobColor: string;
  bodyColor: string;
  viewBox: string;
  blobPath: string;
  bodyPath: string;
  /** Whether the body is a <rect> instead of <path> */
  bodyIsRect?: { x: number; y: number; width: number; height: number; rx: number };
  /** Optional background blob path (behind the main blob) */
  bgBlobPath?: string;
  bgBlobGradient?: { id: string; stops: { offset: string; color: string }[] };
  /** Text offsets */
  iconX: number;
  iconY: number;
  titleX: number;
  titleY: number;
  streakX: number;
  streakY: number;
  badgeX: number;
  badgeY: number;
  badgeWidth: number;
  badgeLabelX: number;
  badgeLabelY: number;
  /** Blob gradient definition */
  blobGradient?: { id: string; x1: string; y1: string; x2: string; y2: string; stopColor: string };
}

export const ACTIVITY_THEMES: Record<ActivityTheme, ActivityThemeConfig> = {
  purple: {
    blobColor: COLOR_PURPLE_OUTER,
    bodyColor: COLOR_PURPLE_CARD,
    viewBox: "0 0 390 200",
    blobPath:
      "M217.26 161.837C139.202 132.06 144.257 179.817 42.4255 179.28C-59.4061 178.744 84.3607 67.2627 174.205 70.6616C264.05 74.0604 349.947 63.512 369.459 102.4C388.971 141.289 295.318 191.615 217.26 161.837Z",
    bodyPath:
      "M26.6953 32.5C26.6953 15.9315 40.1268 2.5 56.6953 2.5H338.128C344.967 2.5 351.897 4.62853 356.045 10.0661C379.942 41.3909 365.052 104.967 355.255 137.05C351.638 148.897 340.532 156.5 328.145 156.5H56.6953C40.1268 156.5 26.6953 143.069 26.6953 126.5V32.5Z",
    blobGradient: {
      id: "paint0_linear_ac1",
      x1: "26.7453",
      y1: "-68.9127",
      x2: "-296.202",
      y2: "184.904",
      stopColor: COLOR_PURPLE_OUTER,
    },
    iconX: 50,
    iconY: 35,
    titleX: 50,
    titleY: 80,
    streakX: 50,
    streakY: 130,
    badgeX: 248,
    badgeY: 108,
    badgeWidth: 74,
    badgeLabelX: 285,
    badgeLabelY: 127,
  },
  red: {
    blobColor: COLOR_RED_BLOB,
    bodyColor: COLOR_RED_CARD,
    viewBox: "0 0 373 214",
    bgBlobPath:
      "M130.21 110.085C130.21 110.085 143.591 59.6981 224.139 97.6735C304.687 135.649 278.453 195.641 195.975 195.919C113.497 196.197 94.1971 204.607 74.8446 169.7C55.4921 134.793 130.21 110.085 130.21 110.085Z",
    bgBlobGradient: {
      id: "paint0_linear_ac2",
      stops: [
        { offset: "0", color: "#BD3F43" },
        { offset: "1", color: "#BC3E43" },
      ],
    },
    blobPath:
      "M235.342 141.576C235.342 141.576 233.385 181.387 109.468 192.042C-14.4491 202.697 -24.8601 111.842 74.5469 53.6373C173.954 -4.56716 242.482 -6.00012 290.345 22.5761C338.207 51.1524 235.342 141.576 235.342 141.576Z",
    bodyIsRect: { x: 32.8398, y: 25.5762, width: 322, height: 154, rx: 30 },
    bodyPath: "", // uses rect instead
    iconX: 55,
    iconY: 60,
    titleX: 55,
    titleY: 105,
    streakX: 55,
    streakY: 152,
    badgeX: 248,
    badgeY: 130,
    badgeWidth: 84,
    badgeLabelX: 290,
    badgeLabelY: 149,
  },
  coral: {
    blobColor: COLOR_CORAL_BLOB,
    bodyColor: COLOR_CORAL,
    viewBox: "0 0 371 212",
    blobPath:
      "M168.962 104.404C247.02 134.181 210.512 3.8651 312.343 4.40171C414.175 4.93832 304.185 177.801 214.34 174.402C124.496 171.003 37.8512 213.29 18.3396 174.402C-1.17205 135.514 90.9038 74.6261 168.962 104.404Z",
    bodyPath:
      "M28.8351 17.9846C63.2407 -2.14532 213.738 6.58002 296.241 13.1387C326.765 15.5652 349.285 42.1401 348.21 72.7422C346.885 110.448 346.378 156.439 350.835 171.985C357.205 194.2 149.481 181.055 64.4076 174.762C42.5683 173.146 23.752 159.009 18.0501 137.866C7.4223 98.4558 -3.05012 36.6399 28.8351 17.9846Z",
    iconX: 45,
    iconY: 50,
    titleX: 45,
    titleY: 95,
    streakX: 45,
    streakY: 145,
    badgeX: 248,
    badgeY: 128,
    badgeWidth: 83,
    badgeLabelX: 289.5,
    badgeLabelY: 147,
  },
};

// ── Rank Card Themes ──

export type RankPosition = 1 | 2 | 3;

export interface RankThemeConfig {
  blobColor: string;
  bodyColor: string;
  badgeColor: string;
  width: number;
  height: number;
  viewBox: string;
  blobPath: string;
  bodyPath: string;
  /** Circle badge position */
  circleCx: number;
  circleCy: number;
  /** Rank number overlay position */
  rankTop: number;
  rankLeft: number;
  /** Address text position */
  addrTop: number;
  addrLeft: number;
  /** Earned text position */
  earnedTop: number;
  earnedLeft: number;
  /** Blob gradient (for purple theme) */
  blobGradient?: { id: string; x1: string; y1: string; x2: string; y2: string; stopColor: string };
  /** Filter positions */
  blobFilter: { x: string; y: string; width: string; height: string };
  bodyFilter: { x: string; y: string; width: string; height: string };
}

export const RANK_THEMES: Record<RankPosition, RankThemeConfig> = {
  1: {
    blobColor: COLOR_ORANGE_OUTER,
    bodyColor: COLOR_ORANGE_INNER,
    badgeColor: COLOR_ORANGE_BADGE,
    width: 430,
    height: 344,
    viewBox: "0 0 430 344",
    blobPath:
      "M246.49 192.3C246.49 192.3 244.53 232.11 120.61 242.76C-3.3 253.42 -13.72 162.56 85.69 104.36C185.1 46.15 292.63 101.63 340.49 130.21C388.35 158.78 246.49 192.3 246.49 192.3Z",
    bodyPath:
      "M43.99 146.05C43.99 107.48 75.26 76.21 113.83 76.21H360.25C398.76 76.21 429.99 107.43 429.99 145.95C429.99 190.02 389.59 223.19 345.96 216.98C312.08 212.16 273.71 207.92 242.49 207.71C207.91 207.47 165.03 212.06 127.97 217.24C84.33 223.34 43.99 190.11 43.99 146.05Z",
    circleCx: 351,
    circleCy: 143,
    rankTop: 113,
    rankLeft: 301,
    addrTop: 102,
    addrLeft: 91,
    earnedTop: 143,
    earnedLeft: 91,
    blobFilter: { x: "-30", y: "30", width: "430", height: "260" },
    bodyFilter: { x: "31", y: "63", width: "412", height: "180" },
  },
  2: {
    blobColor: COLOR_PURPLE_OUTER,
    bodyColor: COLOR_PURPLE_INNER,
    badgeColor: COLOR_PURPLE_BADGE,
    width: 409,
    height: 354,
    viewBox: "0 0 409 354",
    blobPath:
      "M230.96 209.48C152.91 179.7 150.41 266.05 62.41 226.05C-25.6 186.05 98.06 114.9 187.91 118.3C277.75 121.7 363.65 111.15 383.16 150.04C402.67 188.93 309.02 239.26 230.96 209.48Z",
    bodyPath:
      "M11 146.491C11 111.426 39.426 83 74.491 83H337.163C353.29 83 370.064 87.528 378.455 101.299C386.861 115.095 391.677 132.53 394.285 150.29C401.052 196.371 354.187 226.635 308.767 216.331C272.025 207.996 231.118 200.214 202.954 199.221C170.166 198.065 129.923 204.2 94.768 211.547C52.797 220.318 11 189.368 11 146.491Z",
    circleCx: 322,
    circleCy: 155,
    rankTop: 121,
    rankLeft: 272,
    addrTop: 103,
    addrLeft: 58,
    earnedTop: 145,
    earnedLeft: 58,
    blobGradient: {
      id: "paint0_rank2",
      x1: "190",
      y1: "100",
      x2: "190",
      y2: "270",
      stopColor: COLOR_PURPLE_OUTER,
    },
    blobFilter: { x: "-42", y: "98", width: "460", height: "200" },
    bodyFilter: { x: "-2", y: "70", width: "416", height: "180" },
  },
  3: {
    blobColor: COLOR_RED_OUTER,
    bodyColor: COLOR_RED_INNER,
    badgeColor: COLOR_RED_BADGE,
    width: 430,
    height: 344,
    viewBox: "0 0 430 344",
    blobPath:
      "M246.49 192.3C246.49 192.3 244.54 232.11 120.62 242.76C-3.3 253.42 -13.71 162.56 85.7 104.36C185.1 46.15 292.63 101.63 340.5 130.21C388.36 158.79 246.49 192.3 246.49 192.3Z",
    bodyPath:
      "M43.997 151.657C43.997 110.931 78.642 78.935 119.3 81.211C203.63 85.93 270.42 86.075 354.75 81.322C395.35 79.034 430 110.941 430 151.601C430 193.77 392.86 226.372 350.88 222.395C316.72 219.159 277.28 216.221 245 216C208.46 215.75 162.08 219.067 123.08 222.666C81.06 226.544 43.997 193.855 43.997 151.657Z",
    circleCx: 352,
    circleCy: 151,
    rankTop: 117,
    rankLeft: 302,
    addrTop: 109,
    addrLeft: 87,
    earnedTop: 152,
    earnedLeft: 87,
    blobFilter: { x: "-30", y: "30", width: "430", height: "260" },
    bodyFilter: { x: "31", y: "66", width: "412", height: "180" },
  },
};

// ── Shared Card Styles ──

export const cardBackground: CSSProperties = {
  background: `url("./maincard.png") center / cover no-repeat`,
};

export const cardShadow: CSSProperties = {
  boxShadow: "none",
};

export const cardBackdrop: CSSProperties = {};

// ── Typography ──

export const typography = {
  streakNumber: {
    fontFamily: FONT_HEADING,
    fontWeight: 800,
    fontSize: 128,
    color: TEXT_WHITE,
    lineHeight: "155px",
  } as CSSProperties,
  heroNumber: {
    fontFamily: FONT_HEADING,
    fontWeight: 800,
    fontSize: 64,
    color: TEXT_WHITE,
  } as CSSProperties,
  heading1: {
    fontFamily: FONT_HEADING,
    fontWeight: 800,
    fontSize: 38,
    color: TEXT_WHITE,
    margin: 0,
    letterSpacing: "-0.5px",
  } as CSSProperties,
  heading2: {
    fontFamily: FONT_HEADING,
    fontWeight: 800,
    fontSize: 32,
    color: TEXT_WHITE,
    margin: 0,
  } as CSSProperties,
  heading3: {
    fontFamily: FONT_HEADING,
    fontWeight: 800,
    fontSize: 28,
    color: TEXT_WHITE,
    margin: 0,
  } as CSSProperties,
  cardTitle: {
    fontFamily: FONT_HEADING,
    fontWeight: 800,
    fontSize: 28,
    color: TEXT_WHITE,
  } as CSSProperties,
  cardValue: {
    fontFamily: FONT_HEADING,
    fontWeight: 700,
    fontSize: 22,
    color: TEXT_WHITE,
  } as CSSProperties,
  rankAddress: {
    fontFamily: FONT_HEADING,
    fontWeight: 800,
    fontSize: 28,
    lineHeight: "33px",
    color: TEXT_WHITE,
    margin: 0,
  } as CSSProperties,
  rankEarned: {
    fontFamily: FONT_HEADING,
    fontWeight: 700,
    fontSize: 22,
    lineHeight: "27px",
    color: TEXT_WHITE,
    margin: 0,
  } as CSSProperties,
  rankNumber: {
    fontFamily: FONT_HEADING,
    fontWeight: 800,
    fontSize: 50,
    color: TEXT_WHITE,
    lineHeight: "61px",
  } as CSSProperties,
  subtitle: {
    fontFamily: FONT_HEADING,
    fontWeight: 700,
    fontSize: 22,
    color: "#C9B6C9",
    margin: "8px 0 0",
  } as CSSProperties,
  bodyLarge: {
    fontFamily: FONT_HEADING,
    fontWeight: 700,
    fontSize: 16,
    color: TEXT_WHITE,
  } as CSSProperties,
  bodyText: {
    fontFamily: FONT_HEADING,
    fontWeight: 600,
    fontSize: 14,
    color: TEXT_WHITE,
  } as CSSProperties,
  caption: {
    fontFamily: FONT_HEADING,
    fontWeight: 500,
    fontSize: 12,
    color: TEXT_WHITE,
  } as CSSProperties,
  columnHeader: {
    fontFamily: FONT_HEADING,
    fontWeight: 700,
    fontSize: 12,
    color: TEXT_DIM,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  } as CSSProperties,
} as const;

// ── Animation Helpers ──

export function slideIn(delay: number) {
  return `cardSlideIn 0.7s ${EASE_SPRING} ${delay}s both`;
}

export function slideUp(delay: number) {
  return `cardSlideUp 0.7s ${EASE_SPRING} ${delay}s both`;
}

export function reveal(delay: number) {
  return `mainReveal 0.9s ${EASE_SPRING} ${delay}s both`;
}

// ── SVG Filter Definitions (shared drop shadow) ──

export const SVG_BLOB_FILTER = {
  dx: 5,
  dy: 8,
  stdDeviation: 6.2,
  opacity: 0.25,
};

export const SVG_BODY_FILTER = {
  dx: 5,
  dy: 10,
  stdDeviation: 6.25,
  opacity: 0.25,
};
