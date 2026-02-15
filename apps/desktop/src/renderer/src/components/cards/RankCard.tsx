/**
 * RankCard — Unified podium rank card (top 3).
 * Replaces RankCardOrange (rank 1), RankCardPurple (rank 2), RankCardRed (rank 3).
 */
import { abs } from "../../utils/styles";
import { RANK_THEMES, reveal, typography, type RankPosition } from "../../styles/theme";

interface RankCardProps {
  rank: RankPosition;
  address: string;
  earned: string;
  delay?: number;
}

export default function RankCard({
  rank,
  address,
  earned,
  delay = 0,
}: RankCardProps) {
  const t = RANK_THEMES[rank];
  const blobFilterId = `f0_rank${rank}`;
  const bodyFilterId = `f1_rank${rank}`;

  return (
    <div
      style={{
        position: "relative",
        width: t.width,
        height: t.height,
        animation: reveal(delay),
      }}
    >
      <svg
        width={t.width}
        height={t.height}
        viewBox={t.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={abs({ top: 0, left: 0, width: "100%", height: "100%" })}
      >
        {/* Background blob */}
        <g filter={`url(#${blobFilterId})`}>
          <path
            d={t.blobPath}
            fill={t.blobGradient ? `url(#${t.blobGradient.id})` : t.blobColor}
          />
        </g>
        {/* Card pill */}
        <g filter={`url(#${bodyFilterId})`}>
          <path d={t.bodyPath} fill={t.bodyColor} />
        </g>
        {/* Circle badge */}
        <circle cx={t.circleCx} cy={t.circleCy} r="50" fill={t.badgeColor} />
        <defs>
          <filter id={blobFilterId} x={t.blobFilter.x} y={t.blobFilter.y} width={t.blobFilter.width} height={t.blobFilter.height} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="8" />
            <feGaussianBlur stdDeviation="6.2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
          <filter id={bodyFilterId} x={t.bodyFilter.x} y={t.bodyFilter.y} width={t.bodyFilter.width} height={t.bodyFilter.height} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="10" />
            <feGaussianBlur stdDeviation="6.25" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
          {t.blobGradient && (
            <linearGradient
              id={t.blobGradient.id}
              x1={t.blobGradient.x1}
              y1={t.blobGradient.y1}
              x2={t.blobGradient.x2}
              y2={t.blobGradient.y2}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={t.blobGradient.stopColor} />
              <stop offset="1" stopColor={t.blobGradient.stopColor} />
            </linearGradient>
          )}
        </defs>
      </svg>

      {/* Rank number inside circle */}
      <div
        style={abs({
          top: t.rankTop,
          left: t.rankLeft,
          width: 100,
          height: 61,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <span style={typography.rankNumber}>
          {rank}
        </span>
      </div>

      {/* Address */}
      <div style={abs({ top: t.addrTop, left: t.addrLeft })}>
        <p style={typography.rankAddress}>
          {address}
        </p>
      </div>

      {/* Earned */}
      <div style={abs({ top: t.earnedTop, left: t.earnedLeft })}>
        <p style={typography.rankEarned}>
          {earned}
        </p>
      </div>
    </div>
  );
}
