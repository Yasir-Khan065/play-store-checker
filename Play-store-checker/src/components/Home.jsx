import { useState, useEffect, useMemo } from "react";
import { analyzeListing } from "../rules/shared.js";
import { useTextAnalytics } from "../hooks/useTextAnalytics.js";
import { useKeywordExtraction } from "../hooks/useKeywordExtraction.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import AnalyticsPanel from "./AnalyticsPanel.jsx";
import KeywordTabs from "./KeywordTabs.jsx";
import IntroModal from "./IntroModal.jsx";
import AboutModal from "./AboutModal.jsx";
import { buildReport } from "../utils/reportBuilder.js";

const INTRO_KEY = "plc_seen_intro_v1";

const LIMITS = { title: 30, short: 80, full: 4000 };

function barColor(val, max) {
  const p = val.length / max;
  if (p >= 1) return "#EF4444";
  if (p >= 0.85) return "#F59E0B";
  return "#6366F1";
}

function counterClass(val, max) {
  const p = val.length / max;
  if (p >= 1)
    return "font-mono text-xs font-semibold text-red-500 transition-colors";
  if (p >= 0.85)
    return "font-mono text-xs font-medium text-amber-600 transition-colors";
  return "font-mono text-xs font-medium text-zinc-400 transition-colors";
}

function pct(val, max) {
  return Math.min((val.length / max) * 100, 100).toFixed(2);
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [issues, setIssues] = useState([]);
  const [rightTab, setRightTab] = useState("issues");
  const [stopwordsAll, setStopwordsAll] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem(INTRO_KEY);
    } catch {
      return false;
    }
  });

  const debTitle = useDebouncedValue(title, 150);
  const debShort = useDebouncedValue(shortDesc, 150);
  const debFull = useDebouncedValue(fullDesc, 150);

  useEffect(() => {
    const result = analyzeListing({
      title: debTitle,
      short: debShort,
      full: debFull,
    });
    setIssues(result);
  }, [debTitle, debShort, debFull]);

  const analytics = useTextAnalytics(title, shortDesc, fullDesc);
  const extraction = useKeywordExtraction(title, shortDesc, fullDesc, {
    applyStopwordsToAll: stopwordsAll,
  });
  const keywordCount =
    extraction.onegram.length +
    extraction.bigram.length +
    extraction.trigram.length;

  const score = useMemo(() => {
    const v = issues.filter((i) => i.severity === "Violation").length;
    const r = issues.filter((i) => i.severity === "Risk").length;
    const t = issues.filter((i) => i.severity === "Tip").length;
    return Math.max(0, 100 - v * 16 - r * 5 - t * 1);
  }, [issues]);

  const handleCopyReport = async () => {
    const text = buildReport({
      title,
      shortDesc,
      fullDesc,
      issues,
      score,
      analytics,
      extraction,
    });
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
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
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 1500);
  };

  const handlePrint = () => window.print();

  const handleCloseIntro = () => {
    setIntroOpen(false);
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen md:h-screen overflow-y-auto md:overflow-hidden flex flex-col max-w-[1100px] mx-auto px-7 bg-stone-50">
      {/* ── HEADER ── */}
      <header className="flex-shrink-0 flex items-center justify-between py-3.5 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7L5.5 10.5L12 3.5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900">
            Play Listing Checker
          </span>
          <span className="hidden sm:inline text-xs text-zinc-400 font-normal">
            Optimize your Google Play metadata
          </span>
        </div>
        <div className="no-print flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyReport}
            className="text-[11px] font-semibold text-zinc-600 bg-white border border-zinc-200 px-2 py-1 rounded-md hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            title="Copy plain-text audit report"
          >
            <span className="hidden sm:inline">
              {reportCopied ? "Copied!" : "Copy Report"}
            </span>
            <span className="sm:hidden" aria-hidden="true">
              {reportCopied ? "✓" : "⧉"}
            </span>
            <span className="sr-only sm:hidden">Copy report</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="text-[11px] font-semibold text-zinc-600 bg-white border border-zinc-200 px-2 py-1 rounded-md hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            title="Print or save as PDF"
          >
            <span className="hidden sm:inline">Print</span>
            <span className="sm:hidden" aria-hidden="true">⎙</span>
            <span className="sr-only sm:hidden">Print</span>
          </button>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="text-[11px] font-semibold text-zinc-600 bg-white border border-zinc-200 w-7 h-7 sm:w-auto sm:h-auto sm:px-2 sm:py-1 rounded-md hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center"
            title="About & privacy"
            aria-label="About"
          >
            <span className="hidden sm:inline">About</span>
            <span className="sm:hidden" aria-hidden="true">i</span>
          </button>
          <div className="hidden sm:flex live-indicator items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            Live
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-3.5 py-3.5">
        {/* LEFT — Input Cards */}
        <section className="flex flex-col gap-2.5 overflow-hidden">
          {/* Card 1 — Title */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col gap-2 flex-shrink-0 shadow-sm transition-all focus-within:shadow-md focus-within:border-indigo-300">
            <div className="flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Title
              </span>
              <span className={counterClass(title, LIMITS.title)}>
                {title.length}&thinsp;/&thinsp;{LIMITS.title}
              </span>
            </div>
            <input
              className="w-full text-sm leading-relaxed text-zinc-900 bg-stone-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none transition-all focus:border-indigo-400 focus:bg-white placeholder:text-zinc-300 h-9.5"
              type="text"
              placeholder="Your app name..."
              value={title}
              onChange={(e) =>
                setTitle(e.target.value.slice(0, LIMITS.title + 5))
              }
            />
            <div className="h-0.75 bg-zinc-100 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct(title, LIMITS.title)}%`,
                  background: barColor(title, LIMITS.title),
                }}
              />
            </div>
          </div>

          {/* Card 2 — Short Description */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col gap-2 flex-shrink-0 shadow-sm transition-all focus-within:shadow-md focus-within:border-indigo-300">
            <div className="flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Short Description
              </span>
              <span className={counterClass(shortDesc, LIMITS.short)}>
                {shortDesc.length}&thinsp;/&thinsp;{LIMITS.short}
              </span>
            </div>
            <textarea
              className="w-full text-sm leading-relaxed text-zinc-900 bg-stone-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none transition-all focus:border-indigo-400 focus:bg-white placeholder:text-zinc-300"
              placeholder="Brief description shown below the app name..."
              value={shortDesc}
              onChange={(e) =>
                setShortDesc(e.target.value.slice(0, LIMITS.short + 5))
              }
              style={{ minHeight: 68, maxHeight: 90 }}
            />
            <div className="h-0.75 bg-zinc-100 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct(shortDesc, LIMITS.short)}%`,
                  background: barColor(shortDesc, LIMITS.short),
                }}
              />
            </div>
          </div>

          {/* Card 3 — Full Description (grows to fill) */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col gap-2 flex-1 overflow-hidden shadow-sm transition-all focus-within:shadow-md focus-within:border-indigo-300">
            <div className="flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Full Description
              </span>
              <span className={counterClass(fullDesc, LIMITS.full)}>
                {fullDesc.length.toLocaleString()}&thinsp;/&thinsp;
                {LIMITS.full.toLocaleString()}
              </span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <textarea
                className="flex-1 w-full text-sm leading-relaxed text-zinc-900 bg-stone-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none transition-all focus:border-indigo-400 focus:bg-white placeholder:text-zinc-300"
                placeholder="Full store listing description. Supports line breaks and basic formatting..."
                value={fullDesc}
                onChange={(e) =>
                  setFullDesc(e.target.value.slice(0, LIMITS.full + 5))
                }
              />
            </div>
            <div className="h-0.75 bg-zinc-100 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct(fullDesc, LIMITS.full)}%`,
                  background: barColor(fullDesc, LIMITS.full),
                }}
              />
            </div>
          </div>
        </section>

        {/* RIGHT — Issues Panel */}
        <aside className="bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-zinc-100 gap-2">
            <div className="flex items-center gap-0.5 bg-zinc-100 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setRightTab("issues")}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                  rightTab === "issues"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Issues
              </button>
              <button
                type="button"
                onClick={() => setRightTab("keywords")}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                  rightTab === "keywords"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Keywords
              </button>
            </div>
            <span className="text-xs font-semibold bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full whitespace-nowrap">
              {rightTab === "issues"
                ? `${issues.length} found`
                : `${keywordCount} terms`}
            </span>
          </div>

          {/* Compliance Score */}
          <div className="flex-shrink-0 px-3 py-2 border-b border-zinc-100 bg-stone-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600">
                Compliance Score
              </span>
              <span className="text-lg font-bold text-indigo-600">
                {score}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Analytics Panel — informational metrics, slots between score and issues */}
          <AnalyticsPanel analytics={analytics} limits={LIMITS} />

          {rightTab === "keywords" ? (
            <KeywordTabs
              extraction={extraction}
              applyStopwordsToAll={stopwordsAll}
              onToggleStopwords={setStopwordsAll}
            />
          ) : (
          <div className="flex-1 overflow-y-auto flex flex-col p-3 gap-2">
            {issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 py-6">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-0.5">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle
                      cx="11"
                      cy="11"
                      r="8.5"
                      stroke="#D4D4D8"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M11 7.5V11.5"
                      stroke="#D4D4D8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="11" cy="14" r="0.75" fill="#D4D4D8" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-zinc-600">
                  No issues detected
                </p>
                <p className="text-xs text-zinc-400 text-center leading-relaxed max-w-48">
                  Paste your listing to see results.
                </p>
              </div>
            ) : (
              issues.map((issue, idx) => {
                const severityColors = {
                  Violation: "bg-red-100 text-red-700 border-red-200",
                  Risk: "bg-yellow-100 text-yellow-700 border-yellow-200",
                  Tip: "bg-green-100 text-green-700 border-green-200",
                };

                return (
                  <div
                    key={idx}
                    className={`p-2.5 border rounded-lg ${
                      severityColors[issue.severity] || severityColors.Tip
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold flex-shrink-0 mt-0.5">
                        {issue.severity}
                      </span>
                      <div className="flex-1 text-xs">
                        <p className="font-semibold">{issue.rule}</p>
                        <p className="opacity-80 mt-0.5">{issue.message}</p>
                        {issue.match && (
                          <p className="mt-1 text-opacity-70">
                            "{issue.match.slice(0, 50)}"
                            {issue.match.length > 50 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          )}
        </aside>
      </main>

      {/* ── FOOTER ── */}
      <footer className="flex-shrink-0 flex items-center justify-between py-2.5 border-t border-zinc-200 gap-3 md:flex-row flex-col md:text-left text-center">
        <span className="text-xs text-zinc-400 whitespace-nowrap">
          © {new Date().getFullYear()} Play Listing Checker
        </span>
        <div className="flex items-center gap-4 md:gap-4.5">
          <a
            href="https://play.google.com/about/developer-content-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 no-underline transition-colors hover:text-indigo-600 whitespace-nowrap"
          >
            Google Play Policy
          </a>
          <div className="hidden md:block w-px h-3 bg-zinc-200" />
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="text-xs text-zinc-400 transition-colors hover:text-indigo-600 whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer"
          >
            About & Privacy
          </button>
          <div className="hidden md:block w-px h-3 bg-zinc-200" />
          <a
            href="mailto:feedback@example.com"
            className="text-xs text-zinc-400 no-underline transition-colors hover:text-indigo-600 whitespace-nowrap"
          >
            Send Feedback
          </a>
        </div>
      </footer>

      <IntroModal open={introOpen} onClose={handleCloseIntro} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
