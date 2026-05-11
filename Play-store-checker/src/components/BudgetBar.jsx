export default function BudgetBar({ label, used, limit }) {
  const ratio = limit > 0 ? used / limit : 0;
  const pct = Math.min(ratio * 100, 100);

  let barStyle = {
    background: "linear-gradient(90deg,#6C63FF 0%,#8B7CFF 100%)",
  };
  if (ratio >= 0.95) barStyle = { background: "#EF4444" };
  else if (ratio >= 0.85) barStyle = { background: "#F59E0B" };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] font-bold text-[#8A94A6] w-3 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-white/70 rounded-full overflow-hidden min-w-0 ring-1 ring-black/5">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%`, ...barStyle }}
        />
      </div>
      <span className="font-mono text-[10px] text-[#8A94A6] tabular-nums flex-shrink-0">
        {used.toLocaleString()}/{limit.toLocaleString()}
      </span>
    </div>
  );
}
