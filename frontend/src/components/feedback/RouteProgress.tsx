import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const FINISH_DELAY_MS = 90;
const MIN_VISIBLE_MS = 260;

export function RouteProgress() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const firstRouteRef = useRef(true);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (firstRouteRef.current) {
      firstRouteRef.current = false;
      return;
    }

    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    setIsVisible(true);
    setProgress(12);

    timersRef.current.push(
      window.setTimeout(() => setProgress(72), 30),
      window.setTimeout(() => setProgress(92), 120),
      window.setTimeout(() => {
        setProgress(100);

        timersRef.current.push(
          window.setTimeout(() => {
            setIsVisible(false);
            setProgress(0);
          }, FINISH_DELAY_MS),
        );
      }, MIN_VISIBLE_MS),
    );
  }, [location.key]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/10"
    >
      <div
        className="h-full rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.45)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
