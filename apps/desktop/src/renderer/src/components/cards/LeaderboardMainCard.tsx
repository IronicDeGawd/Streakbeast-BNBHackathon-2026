/**
 * LeaderboardMainCard — Large card with scrollable rank table.
 * Uses shared card background + backdrop from theme tokens.
 */
import { abs } from "../../utils/styles";
import RankRowCard from "./RankRowCard";
import { cardBackground, cardBackdrop, slideUp, slideIn, typography } from "../../styles/theme";
import {
  CARD_SHADOW,
  FONT_HEADING,
  TEXT_WHITE,
  TEXT_MUTED,
  COLOR_PURPLE_ACCENT,
} from "../../utils/tokens";

const TABS = ["All", "Coding", "Exercise", "Reading", "Meditation", "Language"];

interface RankEntry {
  rank: number;
  address: string;
  streak: number;
  earned: string;
  habitType: string;
}

interface LeaderboardMainCardProps {
  delay?: number;
  activeFilter: string;
  onFilterChange: (tab: string) => void;
  rankData: RankEntry[];
}

export default function LeaderboardMainCard({
  delay = 0,
  activeFilter,
  onFilterChange,
  rankData,
}: LeaderboardMainCardProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        animation: slideUp(delay),
      }}
    >
      {/* Card body */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 85,
          overflow: "hidden",
          boxShadow: CARD_SHADOW,
        }}
      >
        <div style={abs({ inset: 0, ...cardBackground })} />
        <div style={abs({ inset: 0, ...cardBackdrop })} />

        {/* Content layer */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Header: Title + Filter tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "48px 80px 16px",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                ...typography.heading1,
                whiteSpace: "nowrap",
              }}
            >
              Leaderboard
            </h2>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TABS.map((tab, i) => {
                const isActive = activeFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => onFilterChange(tab)}
                    style={{
                      position: "relative",
                      border: "none",
                      background: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      animation: slideIn(delay + 0.15 + i * 0.04),
                      transform: isActive ? "scale(1.06)" : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.transform = "scale(1.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <svg
                      width="100"
                      height="36"
                      viewBox="0 0 100 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: "block" }}
                    >
                      <path
                        d="M16 3C9.37 3 4 9.5 4 18C4 26.5 9.37 33 16 33H84C90.63 33 96 26.5 96 18C96 9.5 90.63 3 84 3H16Z"
                        fill={isActive ? COLOR_PURPLE_ACCENT : "rgba(255,255,255,0.07)"}
                        stroke={
                          isActive
                            ? "rgba(139,92,246,0.4)"
                            : "rgba(255,255,255,0.08)"
                        }
                        strokeWidth="1"
                      />
                      {isActive && (
                        <circle cx="84" cy="10" r="7" fill="#A78BFA" opacity="0.5" />
                      )}
                      <text
                        x="50"
                        y="22"
                        fontFamily={FONT_HEADING}
                        fontWeight="600"
                        fontSize="14"
                        fill={isActive ? TEXT_WHITE : TEXT_MUTED}
                        textAnchor="middle"
                      >
                        {tab}
                      </text>
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column headers */}
          <div
            style={{
              display: "flex",
              padding: "0 56px 8px",
              ...typography.columnHeader,
            }}
          >
            <span style={{ width: 70 }}>Rank</span>
            <span style={{ width: 220 }}>Address</span>
            <span style={{ width: 140 }}>Habit</span>
            <span style={{ flex: 1, textAlign: "right" }}>Streak</span>
            <span style={{ width: 160, textAlign: "right" }}>Earned</span>
          </div>

          {/* Scrollable rank rows */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "4px 40px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {rankData.length === 0 && (
              <p
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                No rankings to display
              </p>
            )}
            {rankData.map((entry, idx) => (
              <RankRowCard
                key={`${entry.rank}-${entry.address}`}
                rank={entry.rank}
                address={entry.address}
                streak={entry.streak}
                earned={entry.earned}
                habitType={entry.habitType}
                delay={delay + 0.3 + idx * 0.04}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
