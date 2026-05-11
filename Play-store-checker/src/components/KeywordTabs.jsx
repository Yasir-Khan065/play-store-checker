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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-t border-[#E8EAF2]">
      <div className="keyword-tabs-controls flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-b border-[#E8EAF2]">
        <div className="flex items-center gap-1 bg-[#F4F3FF] rounded-full p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all duration-200 ${
                tab === t.id
                  ? "bg-white text-[#6C63FF] shadow-[0_2px_8px_-2px_rgba(108,99,255,0.25)]"
                  : "text-[#8A94A6] hover:text-[#475467]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label
            className="flex items-center gap-1.5 text-[10.5px] text-[#8A94A6] cursor-pointer select-none"
            title="Filter stopwords from all n-grams"
          >
            <input
              type="checkbox"
              checked={applyStopwordsToAll}
              onChange={(e) => onToggleStopwords(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#6C63FF] cursor-pointer rounded"
            />
            Filter all
          </label>
          <CsvExportButton rows={rows} />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-1">
        <KeywordTable rows={rows} />
      </div>
    </div>
  );
}
