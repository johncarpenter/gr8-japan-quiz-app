import { useState, useEffect } from "react";
import { SparkBurst } from "./kawaii/ParticleEffects.jsx";

export default function ProgressBar({ current, total, label, streakActive = false }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const [sparkTrigger, setSparkTrigger] = useState(0);

  // Sparkle burst at 100%
  useEffect(() => {
    if (pct === 100) {
      setSparkTrigger((t) => t + 1);
    }
  }, [pct]);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-text-secondary">{label}</span>
          <span className="text-xs font-bold text-text-primary">
            {current}/{total} ({pct}%)
          </span>
        </div>
      )}
      <div className="relative w-full h-2.5 bg-sakura-100 rounded-full overflow-visible">
        {/* Paw markers at 25%, 50%, 75% */}
        {[25, 50, 75].map((mark) => (
          <span
            key={mark}
            className="absolute -top-1 text-[8px] pointer-events-none select-none"
            style={{ left: `${mark}%`, transform: "translateX(-50%)", opacity: pct >= mark ? 0.8 : 0.25 }}
          >
            🐾
          </span>
        ))}

        {/* Fill bar */}
        <div
          className={`h-full rounded-full relative ${streakActive ? "progress-rainbow" : "progress-fill"}`}
          style={{ width: `${pct}%` }}
        >
          {/* Cat face riding the fill edge */}
          {pct > 0 && pct < 100 && (
            <span
              className="absolute -right-3 -top-2.5 text-sm select-none pointer-events-none"
              style={{ lineHeight: 1 }}
            >
              😺
            </span>
          )}
          {pct === 100 && (
            <span
              className="absolute -right-3 -top-2.5 text-sm select-none pointer-events-none"
              style={{ lineHeight: 1 }}
            >
              😻
            </span>
          )}
        </div>

        {/* 100% sparkle burst */}
        {pct === 100 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <SparkBurst trigger={sparkTrigger} count={6} />
          </div>
        )}
      </div>
    </div>
  );
}
