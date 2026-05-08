import BudgetBar from "./BudgetBar.jsx";

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <span className="text-[11px] text-zinc-500 truncate">{label}</span>
      <span className="font-mono text-[11px] font-semibold text-zinc-700 tabular-nums flex-shrink-0">
        {value}
      </span>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
        {title}
      </span>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export default function AnalyticsPanel({ analytics, limits }) {
  const { title, short, full, aggregate, readability } = analytics;

  return (
    <div className="flex-shrink-0 px-3 py-2.5 border-b border-zinc-100 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Analytics
        </span>
        <span className="text-[10px] text-zinc-400 font-medium">
          {aggregate.words.toLocaleString()} words ·{" "}
          {aggregate.sentences.toLocaleString()} sentences
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        <Group title="Counts">
          <Stat label="Title words" value={title.words} />
          <Stat label="Short words" value={short.words} />
          <Stat label="Full words" value={full.words.toLocaleString()} />
          <Stat
            label="Unique"
            value={aggregate.uniqueWords.toLocaleString()}
          />
        </Group>

        <Group title="Readability">
          <Stat label="Reading ease" value={readability.ease.toFixed(1)} />
          <Stat label="Grade level" value={readability.grade.toFixed(1)} />
          <Stat label="Level" value={readability.label} />
          <Stat label="Paragraphs" value={full.paragraphs} />
        </Group>

        <Group title="Density">
          <Stat label="Words/sentence" value={aggregate.avgWordsPerSentence} />
          <Stat label="Chars/word" value={aggregate.avgCharsPerWord} />
          <Stat label="Stopwords" value={`${aggregate.stopwordRatio}%`} />
        </Group>

        <Group title="Budget">
          <BudgetBar label="T" used={title.chars} limit={limits.title} />
          <BudgetBar label="S" used={short.chars} limit={limits.short} />
          <BudgetBar label="F" used={full.chars} limit={limits.full} />
        </Group>
      </div>
    </div>
  );
}
