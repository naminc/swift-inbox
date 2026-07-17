import { useEffect } from "react";

export function AppReadyMarker() {
  useEffect(() => {
    const loader = document.getElementById("initial-loader");

    if (!loader) return;

    loader.classList.add("initial-loader-hidden");

    const timer = window.setTimeout(() => {
      loader.remove();
    }, 180);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
