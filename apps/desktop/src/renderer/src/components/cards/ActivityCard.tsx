/**
 * ActivityCard — Unified activity/mission card with theme prop.
 * Replaces ActivityCard1 (purple), ActivityCard2 (red), ActivityCard3 (coral).
 */
import { ACTIVITY_THEMES, slideUp, type ActivityTheme } from "../../styles/theme";
import { FONT_HEADING } from "../../utils/tokens";

interface ActivityCardProps {
  theme: ActivityTheme;
  delay?: number;
  icon?: string;
  title?: string;
  streak?: number;
  status?: string;
  statusColor?: string;
}

export default function ActivityCard({
  theme,
  delay = 0,
  icon,
  title,
  streak,
  status,
  statusColor,
}: ActivityCardProps) {
  const t = ACTIVITY_THEMES[theme];
  const blobFilterId = `f_blob_act_${theme}`;
  const bodyFilterId = `f_body_act_${theme}`;

  return (
    <div
      style={{
        position: "relative",
        animation: slideUp(delay),
        cursor: "pointer",
        transition: "transform 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <svg
        viewBox={t.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: parseInt(t.viewBox.split(" ")[2]), height: parseInt(t.viewBox.split(" ")[3]), display: "block" }}
      >
        {/* Optional background blob (red theme) */}
        {t.bgBlobPath && (
          <path
            d={t.bgBlobPath}
            fill={t.bgBlobGradient ? `url(#${t.bgBlobGradient.id})` : t.blobColor}
            fillOpacity="0.8"
          />
        )}

        {/* Main blob behind card */}
        <g filter={`url(#${blobFilterId})`}>
          <path
            d={t.blobPath}
            fill={t.blobGradient ? `url(#${t.blobGradient.id})` : t.blobColor}
          />
        </g>

        {/* Card body — either rect or path depending on theme */}
        <g filter={`url(#${bodyFilterId})`}>
          {t.bodyIsRect ? (
            <rect
              x={t.bodyIsRect.x}
              y={t.bodyIsRect.y}
              width={t.bodyIsRect.width}
              height={t.bodyIsRect.height}
              rx={t.bodyIsRect.rx}
              fill={t.bodyColor}
            />
          ) : (
            <path d={t.bodyPath} fill={t.bodyColor} />
          )}
        </g>

        {/* Status badge */}
        <rect x={t.badgeX} y={t.badgeY} width={t.badgeWidth} height="28" rx="13" fill={statusColor} />

        {/* Icon */}
        <text x={t.iconX} y={t.iconY} fontSize="24" fill="white">{icon}</text>

        {/* Title */}
        <text x={t.titleX} y={t.titleY} fontFamily={FONT_HEADING} fontWeight="800" fontSize="28" fill="white">
          {title}
        </text>

        {/* Streak */}
        <text x={t.streakX} y={t.streakY} fontFamily={FONT_HEADING} fontWeight="700" fontSize="22" fill="white">
          🔥 {streak}
        </text>

        {/* Badge label */}
        <text x={t.badgeLabelX} y={t.badgeLabelY} fontFamily={FONT_HEADING} fontWeight="700" fontSize="14" fill="white" textAnchor="middle">
          {status}
        </text>

        <defs>
          <filter id={blobFilterId} x="-10" y="-10" width="420" height="250" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="8" />
            <feGaussianBlur stdDeviation="6.2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
          <filter id={bodyFilterId} x="0" y="0" width="400" height="230" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
              <stop offset="1" stopColor={t.blobGradient.stopColor} />
            </linearGradient>
          )}
          {t.bgBlobGradient && (
            <linearGradient
              id={t.bgBlobGradient.id}
              x1="19.7693"
              y1="181.019"
              x2="392.899"
              y2="128.523"
              gradientUnits="userSpaceOnUse"
            >
              {t.bgBlobGradient.stops.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          )}
        </defs>
      </svg>
    </div>
  );
}
