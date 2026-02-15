import { useMemo } from "react";
import { abs } from "../../utils/styles";

interface SparklePoint {
  id: number;
  x: number;
  y: number;
  s: number;
  d: number;
  dur: number;
  o: number;
}

export default function Sparkles() {
  const pts = useMemo<SparklePoint[]>(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 90,
        s: Math.random() * 2 + 0.5,
        d: Math.random() * 6,
        dur: Math.random() * 3 + 2,
        o: Math.random() * 0.4 + 0.1,
      })),
    [],
  );

  return (
    <div style={abs({ inset: 0, pointerEvents: "none", overflow: "hidden" })}>
      {pts.map((p) => (
        <div
          key={p.id}
          style={abs({
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            borderRadius: "50%",
            background: "#fff",
            opacity: p.o,
            animation: `sparkle ${p.dur}s ease-in-out ${p.d}s infinite`,
          })}
        />
      ))}
    </div>
  );
}
