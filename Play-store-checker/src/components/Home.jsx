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

function counterClass(val, max) {
  const p = val.length / max;
  if (p >= 1)
    return "font-mono text-[11px] font-semibold text-red-500 transition-colors";
  if (p >= 0.85)
    return "font-mono text-[11px] font-semibold text-amber-600 transition-colors";
  return "font-mono text-[11px] font-medium text-[#8A94A6] transition-colors";
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
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#F7F8FC] text-[#1F2937] overflow-x-hidden lg:overflow-hidden">
      {/* ── HEADER ── */}
      <header className="no-print flex-shrink-0 bg-white border-b border-[#E8EAF2]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#6C63FF] to-[#8B7CFF] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_-4px_rgba(108,99,255,0.5)]">
              <span className="text-white font-extrabold text-base leading-none tracking-tight">
                P
              </span>
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[14px] font-bold tracking-tight text-[#1F2937] truncate">
                Play Listing Checker
              </span>
              <span className="hidden sm:inline text-[11px] text-[#8A94A6] font-medium truncate">
                Optimize your Google Play metadata
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#475467] bg-white border border-[#E8EAF2] px-2.5 h-8 rounded-lg hover:border-[#6C63FF]/40 hover:text-[#6C63FF] hover:bg-[#F4F3FF] transition-all duration-200"
              title="Copy plain-text audit report"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="8" y="8" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">
                {reportCopied ? "Copied!" : "Copy Report"}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#475467] bg-white border border-[#E8EAF2] px-2.5 h-8 rounded-lg hover:border-[#6C63FF]/40 hover:text-[#6C63FF] hover:bg-[#F4F3FF] transition-all duration-200"
              title="Print or save as PDF"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 9V4h10v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <rect x="5" y="9" width="14" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                <rect x="8" y="14" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#475467] bg-white border border-[#E8EAF2] px-2.5 h-8 rounded-lg hover:border-[#6C63FF]/40 hover:text-[#6C63FF] hover:bg-[#F4F3FF] transition-all duration-200"
              title="About & privacy"
              aria-label="About"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="8" r="1" fill="currentColor" />
              </svg>
              <span className="hidden sm:inline">About</span>
            </button>

            <div className="hidden sm:inline-flex live-indicator items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11.5px] font-semibold text-[#16A34A] bg-[#ECFDF3] border border-[#BBF7D0]">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-60" />
                <span className="relative inline-block w-2 h-2 rounded-full bg-[#22C55E]" />
              </span>
              Live
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 lg:min-h-0 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-3 md:py-4 grid grid-cols-1 lg:grid-cols-2 gap-3.5 min-w-0 lg:overflow-hidden">
        {/* LEFT — Input Cards */}
        <section className="flex flex-col gap-3 min-w-0 lg:min-h-0 lg:overflow-hidden">
          {/* Card 1 — Title */}
          <FormCard
            label="Title"
            counter={`${title.length} / ${LIMITS.title}`}
            counterClassName={counterClass(title, LIMITS.title)}
          >
            <input
              className="w-full text-sm leading-relaxed text-[#1F2937] bg-[#FAFBFE] border border-[#E8EAF2] rounded-lg px-3.5 py-2.5 outline-none transition-all duration-200 focus:border-[#6C63FF] focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/15 placeholder:text-[#B7BECC]"
              type="text"
              placeholder="Your app name..."
              value={title}
              onChange={(e) =>
                setTitle(e.target.value.slice(0, LIMITS.title + 5))
              }
            />
          </FormCard>

          {/* Card 2 — Short Description */}
          <FormCard
            label="Short Description"
            counter={`${shortDesc.length} / ${LIMITS.short}`}
            counterClassName={counterClass(shortDesc, LIMITS.short)}
          >
            <textarea
              className="w-full text-sm leading-relaxed text-[#1F2937] bg-[#FAFBFE] border border-[#E8EAF2] rounded-lg px-3.5 py-2 outline-none resize-none transition-all duration-200 focus:border-[#6C63FF] focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/15 placeholder:text-[#B7BECC]"
              placeholder="Brief description shown below the app name..."
              value={shortDesc}
              onChange={(e) =>
                setShortDesc(e.target.value.slice(0, LIMITS.short + 5))
              }
              rows={2}
              style={{ minHeight: 64 }}
            />
          </FormCard>

          {/* Card 3 — Full Description (grows to fill remaining height) */}
          <FormCard
            label="Full Description"
            counter={`${fullDesc.length.toLocaleString()} / ${LIMITS.full.toLocaleString()}`}
            counterClassName={counterClass(fullDesc, LIMITS.full)}
            grow
          >
            <textarea
              className="flex-1 lg:min-h-0 w-full text-sm leading-relaxed text-[#1F2937] bg-[#FAFBFE] border border-[#E8EAF2] rounded-lg px-3.5 py-2 outline-none resize-none transition-all duration-200 focus:border-[#6C63FF] focus:bg-white focus:ring-2 focus:ring-[#6C63FF]/15 placeholder:text-[#B7BECC] overflow-y-auto"
              placeholder="Full store listing description. Supports line breaks and basic formatting..."
              value={fullDesc}
              onChange={(e) =>
                setFullDesc(e.target.value.slice(0, LIMITS.full + 5))
              }
              style={{ minHeight: 120 }}
            />
          </FormCard>
        </section>

        {/* RIGHT — Issues / Keywords Panel */}
        <aside className="bg-white border border-[#E8EAF2] rounded-2xl shadow-[0_2px_12px_-8px_rgba(16,24,40,0.08)] flex flex-col min-w-0 lg:min-h-0 lg:h-full overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-2.5 gap-2">
            <div className="flex items-center gap-1 bg-[#F4F3FF] rounded-full p-1">
              <button
                type="button"
                onClick={() => setRightTab("issues")}
                className={`text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full transition-all duration-200 ${
                  rightTab === "issues"
                    ? "bg-white text-[#6C63FF] shadow-[0_2px_8px_-2px_rgba(108,99,255,0.25)]"
                    : "text-[#8A94A6] hover:text-[#475467]"
                }`}
              >
                Issues
              </button>
              <button
                type="button"
                onClick={() => setRightTab("keywords")}
                className={`text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full transition-all duration-200 ${
                  rightTab === "keywords"
                    ? "bg-white text-[#6C63FF] shadow-[0_2px_8px_-2px_rgba(108,99,255,0.25)]"
                    : "text-[#8A94A6] hover:text-[#475467]"
                }`}
              >
                Keywords
              </button>
            </div>
            <span className="text-[11px] font-semibold bg-[#F1F2F7] text-[#8A94A6] px-3 py-1 rounded-full whitespace-nowrap">
              {rightTab === "issues"
                ? `${issues.length} found`
                : `${keywordCount} terms`}
            </span>
          </div>

          {/* Compliance Score */}
          <div className="flex-shrink-0 px-4 pb-2">
            <div className="rounded-xl bg-gradient-to-br from-[#F4F3FF] to-[#FAF9FF] border border-[#E8E6FF] px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#6C63FF]">
                  Compliance Score
                </span>
                <span className="text-[17px] font-extrabold text-[#1F2937] leading-none tabular-nums">
                  {score}
                  <span className="text-[#6C63FF]">%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1 bg-white/70 rounded-full overflow-hidden ring-1 ring-[#E8E6FF]">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${score}%`,
                    background:
                      "linear-gradient(90deg,#6C63FF 0%,#8B7CFF 100%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="flex-shrink-0">
            <AnalyticsPanel analytics={analytics} limits={LIMITS} />
          </div>

          {rightTab === "keywords" ? (
            <KeywordTabs
              extraction={extraction}
              applyStopwordsToAll={stopwordsAll}
              onToggleStopwords={setStopwordsAll}
            />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-4 pb-4 pt-2 gap-2.5">
              {issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                  <div className="w-10 h-10 rounded-full bg-[#F4F3FF] flex items-center justify-center mb-0.5 ring-1 ring-[#E8E6FF]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#8B7CFF" strokeWidth="1.6" />
                      <path d="M8.5 12.5L11 15L15.5 9.5" stroke="#8B7CFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-semibold text-[#1F2937]">
                    No issues detected
                  </p>
                  <p className="text-[11px] text-[#8A94A6] text-center leading-relaxed max-w-[220px]">
                    Paste your listing above to see analysis results.
                  </p>
                </div>
              ) : (
                issues.map((issue, idx) => {
                  const severityStyle = {
                    Violation: {
                      box: "bg-[#FEF2F2] border-[#FECACA]",
                      pill: "bg-[#FEE2E2] text-[#B91C1C]",
                      title: "text-[#991B1B]",
                      body: "text-[#7F1D1D]",
                    },
                    Risk: {
                      box: "bg-[#FFFBEB] border-[#FDE68A]",
                      pill: "bg-[#FEF3C7] text-[#92400E]",
                      title: "text-[#92400E]",
                      body: "text-[#78350F]",
                    },
                    Tip: {
                      box: "bg-[#F0FDF4] border-[#BBF7D0]",
                      pill: "bg-[#DCFCE7] text-[#166534]",
                      title: "text-[#166534]",
                      body: "text-[#14532D]",
                    },
                  };
                  const s = severityStyle[issue.severity] || severityStyle.Tip;

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 border rounded-xl ${s.box} transition-shadow hover:shadow-sm`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${s.pill}`}
                        >
                          {issue.severity}
                        </span>
                        <div className="flex-1 text-xs min-w-0">
                          <p className={`font-semibold ${s.title}`}>
                            {issue.rule}
                          </p>
                          <p className={`mt-0.5 ${s.body} opacity-90`}>
                            {issue.message}
                          </p>
                          {issue.match && (
                            <p
                              className={`mt-1 italic ${s.body} opacity-70 truncate`}
                            >
                              &ldquo;{issue.match.slice(0, 80)}
                              {issue.match.length > 80 ? "…" : ""}&rdquo;
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
      <footer className="no-print flex-shrink-0 w-full max-w-[1200px] mx-auto px-4 md:px-6 pb-3 pt-1">
        <div className="border-t border-[#E8EAF2] pt-2.5 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <span className="text-[11.5px] text-[#8A94A6]">
            © {new Date().getFullYear()} Play Listing Checker
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <a
              href="https://play.google.com/about/developer-content-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11.5px] text-[#8A94A6] no-underline transition-colors hover:text-[#6C63FF]"
            >
              Google Play Policy
            </a>
            <span className="hidden md:inline-block w-px h-3 bg-[#E8EAF2]" />
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="text-[11.5px] text-[#8A94A6] transition-colors hover:text-[#6C63FF] bg-transparent border-0 p-0 cursor-pointer"
            >
              About & Privacy
            </button>
            <span className="hidden md:inline-block w-px h-3 bg-[#E8EAF2]" />
            <a
              href="mailto:feedback@example.com"
              className="text-[11.5px] text-[#8A94A6] no-underline transition-colors hover:text-[#6C63FF]"
            >
              Send Feedback
            </a>
          </div>
        </div>
      </footer>

      <IntroModal open={introOpen} onClose={handleCloseIntro} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

function FormCard({ label, counter, counterClassName, grow, children }) {
  return (
    <div
      className={`bg-white border border-[#E8EAF2] rounded-2xl p-3 flex flex-col gap-2 shadow-[0_1px_6px_-3px_rgba(16,24,40,0.06)] transition-all duration-200 focus-within:border-[#6C63FF]/40 focus-within:shadow-[0_4px_14px_-8px_rgba(108,99,255,0.25)] min-w-0 ${
        grow ? "flex-1 lg:min-h-0 overflow-hidden" : "flex-shrink-0"
      }`}
    >
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6C63FF]">
          {label}
        </span>
        <span className={counterClassName}>{counter}</span>
      </div>
      {children}
    </div>
  );
}
