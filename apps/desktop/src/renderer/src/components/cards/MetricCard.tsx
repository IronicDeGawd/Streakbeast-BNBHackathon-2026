/**
 * MetricCard — Unified metric card with theme prop.
 * Replaces MetricCard1 (red), MetricCard2 (orange), MetricCard3 (purple).
 */
import { useRef } from "react";
import { METRIC_THEMES, slideIn, type MetricTheme } from "../../styles/theme";
import { FONT_HEADING } from "../../utils/tokens";
import { useBlobBreathing, useParallaxHover } from "../../hooks/useAnimations";

interface MetricCardProps {
  theme: MetricTheme;
  delay?: number;
  title?: string;
  value?: string;
  valueFontSize?: number;
}

export default function MetricCard({
  theme,
  delay = 0,
  title,
  value,
  valueFontSize = 22,
}: MetricCardProps) {
  const t = METRIC_THEMES[theme];
  const filterId = `f_blob_metric_${theme}`;
  const bodyFilterId = `f_body_metric_${theme}`;

  const blobRef = useRef<SVGPathElement>(null);
  const parallaxRef = useParallaxHover(8);

  useBlobBreathing(blobRef, t.blobPath, { intensity: 3, duration: 5500 });

  return (
    <div
      ref={parallaxRef}
      style={{
        position: "relative",
        animation: slideIn(delay),
        cursor: "pointer",
        transition: "transform 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <svg
        viewBox={t.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: parseInt(t.viewBox.split(" ")[2] || "0"), height: parseInt(t.viewBox.split(" ")[3] || "0"), display: "block" }}
      >
        {/* Blob behind card */}
        <g filter={`url(#${filterId})`} data-depth="blob">
          <path
            ref={blobRef}
            d={t.blobPath}
            fill={t.blobGradient ? `url(#${t.blobGradient.id})` : t.blobColor}
          />
        </g>

        {/* Card body */}
        <g filter={`url(#${bodyFilterId})`} data-depth="body">
          <path d={t.bodyPath} fill={t.bodyColor} />
        </g>

        {/* Title */}
        <text x={t.textX} y={t.titleY} fontFamily={FONT_HEADING} fontWeight="800" fontSize="28" fill="white">
          {title}
        </text>

        {/* Value */}
        <text x={t.textX} y={t.valueY} fontFamily={FONT_HEADING} fontWeight="700" fontSize={valueFontSize} fill="white">
          {value}
        </text>

        <defs>
          <filter id={filterId} x="-10" y="-10" width="400" height="220" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="8" />
            <feGaussianBlur stdDeviation="6.2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
          <filter id={bodyFilterId} x="0" y="0" width="440" height="200" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
        </defs>
      </svg>
    </div>
  );
}
