/**
 * PageShell — Full-viewport page wrapper.
 * Background: magenta-to-purple gradient with subtle noise grain.
 */
import type { ReactNode } from "react";
import { Sparkles, BottomLeftBlobs, TopRightBlobs } from "../background";

interface PageShellProps {
  children: ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Noise grain overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.32,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><defs><filter id='n' x='0' y='0' width='100%25' height='100%25' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch' result='t'/><feColorMatrix type='saturate' values='0' in='t' result='g'/><feComponentTransfer in='g' result='a'><feFuncA type='linear' slope='0.35'/></feComponentTransfer></filter></defs><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
          backgroundSize: "200px",
          backgroundRepeat: "repeat",
          pointerEvents: "none",
        }}
      />

      <Sparkles />
      <BottomLeftBlobs />
      <TopRightBlobs />

      {/* Content layer */}
      <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
