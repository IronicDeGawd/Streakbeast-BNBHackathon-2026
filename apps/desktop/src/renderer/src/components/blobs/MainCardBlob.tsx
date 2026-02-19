import { useRef } from "react";
import { abs } from "../../utils/styles";
import { useBlobBreathing } from "../../hooks/useAnimations";

const MAIN_BLOB_D = "M44.5507 209.575C-40.294 90.6664 160.316 -50.523 233.816 44.5991C307.315 139.721 764.623 351.988 659.762 414.915C554.901 477.842 -23.9529 646.893 32.5684 480.736C89.0897 314.579 129.395 328.484 44.5507 209.575Z";

interface MainCardBlobProps {
  /** unique prefix to avoid SVG filter/gradient id collisions when multiple blobs exist on a page */
  idPrefix?: string;
  /** override the default top offset (-90) for the blob SVG */
  top?: number;
  /** override the default left offset (-70) for the blob SVG */
  left?: number;
  /** scale the blob (default 1) */
  scale?: number;
}

export default function MainCardBlob({ idPrefix = "main", top = -90, left = -70, scale = 1 }: MainCardBlobProps) {
  const filterId = `filter_${idPrefix}`;
  const paintId = `paint_${idPrefix}`;

  const blobRef = useRef<SVGPathElement>(null);
  useBlobBreathing(blobRef, MAIN_BLOB_D, { intensity: 6, duration: 7000 });

  return (
    <svg
      width="700"
      height="580"
      viewBox="0 0 700 580"
      fill="none"
      style={abs({
        top,
        left,
        width: 720,
        height: 600,
        pointerEvents: "none",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "center center",
      })}
    >
      <defs>
        <filter
          id={filterId}
          x="-16"
          y="-26.68"
          width="731.31"
          height="618.45"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="12" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="shadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="shadow"
            result="shape"
          />
        </filter>
        <linearGradient
          id={paintId}
          x1="731.141"
          y1="445.744"
          x2="148.945"
          y2="18.1211"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D3524C" />
          <stop offset="1" stopColor="#3A1936" />
        </linearGradient>
      </defs>
      <g filter={`url(#${filterId})`}>
        <path
          ref={blobRef}
          d={MAIN_BLOB_D}
          fill={`url(#${paintId})`}
          fillOpacity="0.6"
        />
      </g>
    </svg>
  );
}
