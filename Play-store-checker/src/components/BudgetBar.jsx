export default function BudgetBar({ label, used, limit }) {
  const ratio = limit > 0 ? used / limit : 0;
  const pct = Math.min(ratio * 100, 100);

  let barClass = "bg-emerald-500";
  if (ratio >= 0.95) barClass = "bg-red-500";
  else if (ratio >= 0.85) barClass = "bg-amber-500";

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] font-bold text-zinc-500 w-3 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden min-w-0">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-zinc-500 tabular-nums flex-shrink-0">
        {used.toLocaleString()}/{limit.toLocaleString()}
      </span>
    </div>
  );
}
