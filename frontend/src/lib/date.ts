export function formatDate(value: string | null | undefined, fallback = "Never") {
  if (!value) return fallback;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 60) return "now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function getTimeRemaining(target: string | null, now = Date.now()) {
  if (!target) return null;

  const targetTime = new Date(target).getTime();

  if (!Number.isFinite(targetTime)) return null;

  const ms = targetTime - now;

  if (ms <= 0) {
    return {
      isExpired: true,
      label: "Expired",
      ms: 0,
    };
  }

  const totalSeconds = Math.ceil(ms / 1000);

  if (totalSeconds < 60) {
    return {
      isExpired: false,
      label: `${totalSeconds}s`,
      ms,
    };
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (totalMinutes < 60) {
    return {
      isExpired: false,
      label: `${totalMinutes}m ${String(seconds).padStart(2, "0")}s`,
      ms,
    };
  }

  const hours = Math.floor(totalMinutes / 60);

  return {
    isExpired: false,
    label: `${hours}h`,
    ms,
  };
}
