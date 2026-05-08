import { useState } from "react";
import { rowsToCsv } from "../utils/frequency.js";

export default function CsvExportButton({ rows }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!rows.length) return;
    const csv = rowsToCsv(rows);
    try {
      await navigator.clipboard.writeText(csv);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = csv;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!rows.length}
      className="text-[10px] font-semibold px-2 py-1 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
    >
      {copied ? "Copied!" : "Copy CSV"}
    </button>
  );
}
