import type { CSSProperties } from "react";

/** Shorthand for `position: absolute` + additional styles. */
export function abs(s?: CSSProperties): CSSProperties {
  return { position: "absolute", ...s };
}
