/**
 * MainCard — The 7-day streak hero card.
 * Figma: 621x457, border-radius 85px.
 */
import { abs } from "../../utils/styles";
import { MainCardBlob } from "../blobs";
import { cardBackground, cardBackdrop, reveal, typography } from "../../styles/theme";
import { CARD_SHADOW } from "../../utils/tokens";

interface MainCardProps {
  streakCount?: number;
  nextIn?: string;
  children?: React.ReactNode;
}

export default function MainCard({
  streakCount = 7,
  nextIn = "3h 21m",
  children,
}: MainCardProps) {
  return (
    <div
      style={{
        position: "relative",
        width: 650,
        height: 500,
        animation: reveal(0.15),
      }}
    >
      <MainCardBlob />

      {/* Top-left edge glow */}
      <div
        style={abs({
          width: 250,
          height: 250,
          top: -30,
          left: -30,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,170,80,.3), transparent 60%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        })}
      />
      {/* Bottom-right corner glow */}
      <div
        style={abs({
          width: 220,
          height: 220,
          bottom: -20,
          right: -25,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,40,.4), transparent 60%)",
          filter: "blur(25px)",
          pointerEvents: "none",
        })}
      />

      {/* Card body */}
      <div
        style={{
          position: "relative",
          width: 650,
          height: 500,
          borderRadius: 85,
          overflow: "hidden",
          boxShadow: CARD_SHADOW,
        }}
      >
        <div style={abs({ inset: 0, ...cardBackground })} />
        <div style={abs({ inset: 0, ...cardBackdrop })} />
        {children}
      </div>

      {/* Streak number + label */}
      <div
        style={abs({
          top: 26,
          left: 61,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        })}
      >
        <span
          style={{
            ...typography.streakNumber,
            animation: "streakPulse 3s ease-in-out infinite",
          }}
        >
          {streakCount}
        </span>
        <div style={{ paddingTop: 42 }}>
          <p style={typography.heading2}>
            Day Streak
          </p>
          <p style={typography.subtitle}>
            Next +1 in {nextIn}
          </p>
        </div>
      </div>

    </div>
  );
}
