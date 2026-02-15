/**
 * RankRowCard — A single leaderboard row (rank #4+).
 * SVG-based organic card with blob accent, staggered slide-up animation.
 */
import type { CSSProperties } from "react";
import { slideUp } from "../../styles/theme";
import { FONT_HEADING } from "../../utils/tokens";

const ROW_COLORS = [
  { body: "#6C3CE1", blob: "#8B5CF6" },
  { body: "#9B51B8", blob: "#B06FC8" },
  { body: "#D64A48", blob: "#EF5F5E" },
  { body: "#E48831", blob: "#FAA448" },
  { body: "#763991", blob: "#9B51B8" },
  { body: "#C83B44", blob: "#D84542" },
];

interface RankRowCardProps {
  style?: CSSProperties;
  delay?: number;
  rank: number;
  address: string;
  streak: number;
  earned: string;
  habitType: string;
}

export default function RankRowCard({
  style,
  delay = 0,
  rank,
  address,
  streak,
  earned,
  habitType,
}: RankRowCardProps) {
  const colorIdx = (rank - 4) % ROW_COLORS.length;
  const colors = ROW_COLORS[colorIdx];
  const filterId = `f_row_${rank}`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 62,
        animation: slideUp(delay),
        cursor: "pointer",
        transition: "transform 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateX(6px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <svg
        width="1280"
        height="62"
        viewBox="0 0 1280 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <filter id={filterId} x="0" y="0" width="1280" height="62" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="bg" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="ha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend in2="bg" result="shadow" />
            <feBlend in="SourceGraphic" in2="shadow" result="shape" />
          </filter>
        </defs>

        {/* Small blob accent behind rank */}
        <circle cx="38" cy="31" r="28" fill={colors.blob} opacity="0.25" />

        {/* Row body */}
        <g filter={`url(#${filterId})`}>
          <rect x="8" y="6" width="1264" height="50" rx="25" fill={colors.body} fillOpacity="0.18" />
          <rect x="8.5" y="6.5" width="1263" height="49" rx="24.5" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </g>

        {/* Rank number */}
        <text x="38" y="37" fontFamily={FONT_HEADING} fontWeight="800" fontSize="18" fill="rgba(255,255,255,0.8)" textAnchor="middle">
          #{rank}
        </text>

        {/* Address */}
        <text x="110" y="37" fontFamily={FONT_HEADING} fontWeight="700" fontSize="16" fill="rgba(255,255,255,0.65)">
          {address}
        </text>

        {/* Habit type badge */}
        <rect x="310" y="16" width="90" height="28" rx="14" fill="rgba(255,255,255,0.08)" />
        <text x="355" y="35" fontFamily={FONT_HEADING} fontWeight="600" fontSize="14" fill="rgba(255,255,255,0.6)" textAnchor="middle">
          {habitType}
        </text>

        {/* Streak */}
        <text x="880" y="37" fontFamily={FONT_HEADING} fontWeight="800" fontSize="20" fill={colors.blob} textAnchor="end">
          {streak} days
        </text>

        {/* Earned BNB */}
        <text x="1240" y="37" fontFamily={FONT_HEADING} fontWeight="600" fontSize="14" fill="rgba(255,255,255,0.45)" textAnchor="end">
          {earned}
        </text>
      </svg>
    </div>
  );
}
