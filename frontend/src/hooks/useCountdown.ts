import { useEffect, useState } from "react";

export function useCountdown(initialSeconds?: number) {
  const [seconds, setSeconds] = useState(initialSeconds ?? 0);

  useEffect(() => {
    setSeconds(initialSeconds ?? 0);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  return seconds;
}
