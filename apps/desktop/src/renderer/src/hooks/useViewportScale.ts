import { useState, useEffect } from "react";

const CANVAS_W = 1441;
const CANVAS_H = 959;

/**
 * Computes a scale factor so that the 1441×959 canvas fits entirely
 * within the current viewport (object-fit: contain behaviour).
 * Re-computes on every window resize.
 */
export function useViewportScale(): number {
  const [scale, setScale] = useState(() =>
    Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H)
  );

  useEffect(() => {
    const update = () =>
      setScale(Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H));
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return scale;
}

export { CANVAS_W, CANVAS_H };
