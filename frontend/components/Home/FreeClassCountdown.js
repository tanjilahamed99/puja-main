"use client";

import { useEffect, useState } from "react";

function diff(target) {
  return new Date(target).getTime() - Date.now();
}

function parts(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export default function FreeClassCountdown({ target, className = "" }) {
  const [now, setNow] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setNow(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (now <= 0) {
    return (
      <span className={className}>
        Starting now
      </span>
    );
  }

  const { d, h, m, s } = parts(now);

  return (
    <span className={className}>
      Starts in{" "}
      {d > 0 && `${d}d `}
      {String(h).padStart(2, "0")}:
      {String(m).padStart(2, "0")}:
      {String(s).padStart(2, "0")}
    </span>
  );
}