import { useState, useEffect } from 'react';

interface CountdownResult {
  text: string;
  isReady: boolean;
}

/**
 * Live countdown hook. Takes a Unix timestamp (seconds) for the target time.
 * Returns a ticking string like "5h 23m" and isReady when countdown reaches zero.
 * Ticks every 60 seconds.
 */
export function useCountdown(targetTimestamp: number): CountdownResult {
  const compute = (): CountdownResult => {
    if (targetTimestamp === 0) return { text: 'N/A', isReady: false };
    const nowSec = Math.floor(Date.now() / 1000);
    const remaining = targetTimestamp - nowSec;
    if (remaining <= 0) return { text: 'Now', isReady: true };
    const hours = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    return { text: `${hours}h ${mins}m`, isReady: false };
  };

  const [result, setResult] = useState<CountdownResult>(compute);

  useEffect(() => {
    setResult(compute());
    const interval = setInterval(() => setResult(compute()), 60_000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return result;
}
