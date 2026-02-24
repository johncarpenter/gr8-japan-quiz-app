export default function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

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
      <div className="w-full h-2.5 bg-sakura-100 rounded-full overflow-hidden">
        <div
          className="progress-fill h-full rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
