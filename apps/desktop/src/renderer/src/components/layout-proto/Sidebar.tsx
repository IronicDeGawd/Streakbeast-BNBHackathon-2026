/**
 * Sidebar — Vertical orange blob navigation bar.
 * SVG: 106x598 viewBox, two-layer organic blob (outer #E08730, inner #FBA448).
 * Positioned absolutely matching Figma: left 20px, top 79px in 1441x959 canvas.
 */
import { HiHome } from "react-icons/hi";
import { HiTrophy, HiClock, HiStar, HiChatBubbleBottomCenter, HiCog6Tooth } from "react-icons/hi2";

const NAV_ITEMS = [
  { key: "Dashboard", Icon: HiHome },
  { key: "Stake", Icon: HiClock },
  { key: "Leaderboard", Icon: HiTrophy },
  { key: "Achievements", Icon: HiStar },
  { key: "Coach", Icon: HiChatBubbleBottomCenter },
  { key: "Settings", Icon: HiCog6Tooth },
] as const;

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  delay?: number;
}

export default function Sidebar({
  activePage,
  onPageChange,
  delay = 0,
}: SidebarProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: 20,
        top: 29,
        zIndex: 100,
        width: 96,
        height: 630,
        animation: `cardSlideIn 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
      }}
    >
      {/* Two-layer orange blob SVG — stretched to fit 6 items */}
      <svg
        width="96"
        height="800"
        viewBox="0 0 106 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        {/* Outer blob */}
        <path
          d="M16.03 370C13.98 406 1 810 1.9 838C2.8 852 1.9 855 4 864C6.8 878 13.8 885 25 890C34.7 894 51.9 891 51.9 891C51.9 891 65.6 889 72.6 884C86.9 874 79.8 590 79.8 590C86.3 276 111.3 65 102.7 34C94.1 3 77.7 3 77.7 3L50.8 2C50.8 2 30.5 -4 23.8 30C17.1 64 18.1 334 16.03 370Z"
          fill="#E08730"
        />
        {/* Inner blob */}
        <path
          d="M5.07 370C5.08 419 5.06 640 5.06 686C5.06 732 6.86 802 11.22 813C16.1 824 21.5 832 32.7 836C42.4 840 59.4 836 59.4 836C59.4 836 72.9 834 79.7 829C93.6 819 88.5 564 88.5 564C87.3 283 98.2 90 88.9 63C79.6 36 63.3 36 63.3 36L36.6 36C36.6 36 16.3 32 10.5 63C4.7 94 6.2 337 5.07 370Z"
          fill="#FBA448"
        />
      </svg>

      {/* Navigation icons overlaid on blob */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          pointerEvents: "none",
        }}
      >
        {NAV_ITEMS.map(({ key, Icon }) => {
          const isActive = activePage === key;
          return (
            <button
              key={key}
              onClick={() => onPageChange(key)}
              title={key}
              style={{
                pointerEvents: "auto",
                background: isActive
                  ? "rgba(255,255,255,0.18)"
                  : "transparent",
                border: "none",
                borderRadius: 16,
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: isActive
                  ? "0 0 18px rgba(255,255,255,0.15)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.transform = "scale(1.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <Icon
                size={26}
                color={isActive ? "#fff" : "rgba(255,255,255,0.5)"}
                style={{ transition: "color 0.2s ease" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
