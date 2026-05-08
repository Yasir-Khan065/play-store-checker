import { useState } from "react";
import KeywordTable from "./KeywordTable.jsx";
import CsvExportButton from "./CsvExportButton.jsx";

const TABS = [
  { id: "onegram", label: "1-gram" },
  { id: "bigram", label: "2-gram" },
  { id: "trigram", label: "3-gram" },
];

export default function KeywordTabs({
  extraction,
  applyStopwordsToAll,
  onToggleStopwords,
}) {
  const [tab, setTab] = useState("onegram");
  const rows = extraction[tab] || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="keyword-tabs-controls flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100">
        <div className="flex items-center gap-0.5 bg-zinc-100 rounded-md p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                tab === t.id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label
            className="flex items-center gap-1 text-[10px] text-zinc-500 cursor-pointer select-none"
            title="Filter stopwords from all n-grams"
          >
            <input
              type="checkbox"
              checked={applyStopwordsToAll}
              onChange={(e) => onToggleStopwords(e.target.checked)}
              className="w-3 h-3 accent-indigo-500 cursor-pointer"
            />
            Filter all
          </label>
          <CsvExportButton rows={rows} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-1">
        <KeywordTable rows={rows} />
      </div>
    </div>
  );
}
