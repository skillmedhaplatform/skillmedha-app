export default function timeAgo(dateInteger) {
  const now = Date.now();
  const date = new Date(dateInteger);
  const seconds = Math.floor((date - now) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(seconds) / interval.seconds);
    if (count >= 1) {
      const suffix = seconds < 0 ? "ago" : "remaining";
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ${suffix}`;
    }
  }

  return "just now";
}
