function Dot({ on }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${
        on ? "bg-indigo-500" : "bg-zinc-200"
      }`}
    />
  );
}

export default function KeywordTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-center">
        <p className="text-xs font-semibold text-zinc-500">No keywords yet</p>
        <p className="text-[11px] text-zinc-400 max-w-44">
          Add text to extract top n-grams.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-[11px] tabular-nums border-collapse">
      <thead className="sticky top-0 bg-white">
        <tr className="text-zinc-400 text-[9px] uppercase tracking-wider">
          <th className="text-left font-bold py-1.5 pr-2">Keyword</th>
          <th className="text-right font-bold py-1.5 px-1">Cnt</th>
          <th className="text-right font-bold py-1.5 px-1">%</th>
          <th className="text-center font-bold py-1.5 px-1" title="Title">T</th>
          <th className="text-center font-bold py-1.5 px-1" title="Short">S</th>
          <th className="text-center font-bold py-1.5 pl-1" title="Full">F</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.keyword} className="border-t border-zinc-100">
            <td className="py-1 pr-2 text-zinc-700 truncate max-w-[160px]">
              {r.keyword}
            </td>
            <td className="py-1 px-1 text-right font-mono font-semibold text-zinc-700">
              {r.count}
            </td>
            <td className="py-1 px-1 text-right font-mono text-zinc-500">
              {r.density.toFixed(2)}
            </td>
            <td className="py-1 px-1 text-center">
              <Dot on={r.inTitle} />
            </td>
            <td className="py-1 px-1 text-center">
              <Dot on={r.inShort} />
            </td>
            <td className="py-1 pl-1 text-center">
              <Dot on={r.inFull} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
