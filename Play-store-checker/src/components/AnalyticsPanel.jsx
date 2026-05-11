import BudgetBar from "./BudgetBar.jsx";

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <span className="text-[10.5px] text-[#8A94A6] truncate">{label}</span>
      <span className="font-mono text-[10.5px] font-semibold text-[#1F2937] tabular-nums flex-shrink-0">
        {value}
      </span>
    </div>
  );
}

function MetricCard({ title, accent, icon, children }) {
  return (
    <div
      className="rounded-xl border p-2 flex flex-col gap-1 min-w-0 transition-all duration-200 hover:shadow-[0_2px_10px_-6px_rgba(16,24,40,0.12)]"
      style={{
        background: accent.bg,
        borderColor: accent.border,
      }}
    >
      <div className="flex items-center gap-1.5">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: accent.iconBg, color: accent.iconFg }}
        >
          {icon}
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: accent.title }}
        >
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

const ACCENTS = {
  counts: {
    bg: "#F4F3FF",
    border: "#E8E6FF",
    iconBg: "#E0DEFF",
    iconFg: "#6C63FF",
    title: "#6C63FF",
  },
  readability: {
    bg: "#F0FDF4",
    border: "#D1FAE5",
    iconBg: "#DCFCE7",
    iconFg: "#16A34A",
    title: "#16A34A",
  },
  density: {
    bg: "#FFF7ED",
    border: "#FED7AA",
    iconBg: "#FFEDD5",
    iconFg: "#EA580C",
    title: "#EA580C",
  },
  budget: {
    bg: "#FEFCE8",
    border: "#FEF08A",
    iconBg: "#FEF9C3",
    iconFg: "#CA8A04",
    title: "#CA8A04",
  },
};

const ICONS = {
  counts: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M5 6h14M5 12h10M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  readability: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  density: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M3 18V9m6 9V5m6 13v-7m6 7V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  budget: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

export default function AnalyticsPanel({ analytics, limits }) {
  const { title, short, full, aggregate, readability } = analytics;

  return (
    <div className="px-4 pb-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1F2937]">
          Analytics
        </span>
        <span className="text-[10.5px] text-[#8A94A6] font-medium">
          {aggregate.words.toLocaleString()} words ·{" "}
          {aggregate.sentences.toLocaleString()} sentences
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard title="Counts" accent={ACCENTS.counts} icon={ICONS.counts}>
          <Stat label="Title words" value={title.words} />
          <Stat label="Short words" value={short.words} />
          <Stat label="Full words" value={full.words.toLocaleString()} />
          <Stat
            label="Unique"
            value={aggregate.uniqueWords.toLocaleString()}
          />
        </MetricCard>

        <MetricCard
          title="Readability"
          accent={ACCENTS.readability}
          icon={ICONS.readability}
        >
          <Stat label="Reading ease" value={readability.ease.toFixed(1)} />
          <Stat label="Grade level" value={readability.grade.toFixed(1)} />
          <Stat label="Level" value={readability.label} />
          <Stat label="Paragraphs" value={full.paragraphs} />
        </MetricCard>

        <MetricCard
          title="Density"
          accent={ACCENTS.density}
          icon={ICONS.density}
        >
          <Stat label="Words/sentence" value={aggregate.avgWordsPerSentence} />
          <Stat label="Chars/word" value={aggregate.avgCharsPerWord} />
          <Stat label="Stopwords" value={`${aggregate.stopwordRatio}%`} />
        </MetricCard>

        <MetricCard title="Budget" accent={ACCENTS.budget} icon={ICONS.budget}>
          <BudgetBar label="T" used={title.chars} limit={limits.title} />
          <BudgetBar label="S" used={short.chars} limit={limits.short} />
          <BudgetBar label="F" used={full.chars} limit={limits.full} />
        </MetricCard>
      </div>
    </div>
  );
}
