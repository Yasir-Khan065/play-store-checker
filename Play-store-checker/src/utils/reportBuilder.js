function divider(label) {
  const line = "═".repeat(40);
  return `${line}\n${label}\n${line}`;
}

function pad(s, n) {
  return String(s).padEnd(n, " ");
}

function fmtIssues(issues, severity) {
  const filtered = issues.filter((i) => i.severity === severity);
  if (!filtered.length) return `(none)`;
  return filtered
    .map((i) => {
      const lines = [`- ${i.rule}`];
      if (i.message) lines.push(`  ${i.message}`);
      if (i.match) {
        const m = i.match.length > 80 ? i.match.slice(0, 80) + "…" : i.match;
        lines.push(`  match: "${m}"`);
      }
      return lines.join("\n");
    })
    .join("\n");
}

function fmtKeywords(rows, max = 10) {
  if (!rows.length) return "(none)";
  return rows
    .slice(0, max)
    .map(
      (r) =>
        `${pad(r.keyword, 22)} ${pad(r.count, 4)} ${r.density.toFixed(2)}%`,
    )
    .join("\n");
}

export function buildReport({
  title,
  shortDesc,
  fullDesc,
  issues,
  score,
  analytics,
  extraction,
}) {
  const date = new Date().toISOString().slice(0, 10);
  const counts = {
    violation: issues.filter((i) => i.severity === "Violation").length,
    risk: issues.filter((i) => i.severity === "Risk").length,
    tip: issues.filter((i) => i.severity === "Tip").length,
  };

  const verdict =
    score >= 85 ? "Clean" : score >= 60 ? "Needs Work" : "Problematic";

  const lines = [];
  lines.push("GOOGLE PLAY LISTING REPORT");
  lines.push(`Generated: ${date}`);
  lines.push("");
  lines.push(divider("COMPLIANCE"));
  lines.push(`Score:       ${score} / 100   (${verdict})`);
  lines.push(`Violations:  ${counts.violation}`);
  lines.push(`Risks:       ${counts.risk}`);
  lines.push(`Tips:        ${counts.tip}`);
  lines.push("");

  lines.push(divider("VIOLATIONS"));
  lines.push(fmtIssues(issues, "Violation"));
  lines.push("");
  lines.push(divider("RISKS"));
  lines.push(fmtIssues(issues, "Risk"));
  lines.push("");
  lines.push(divider("TIPS"));
  lines.push(fmtIssues(issues, "Tip"));
  lines.push("");

  lines.push(divider("ANALYTICS"));
  lines.push(
    `Words: ${analytics.aggregate.words}   Sentences: ${analytics.aggregate.sentences}   Paragraphs: ${analytics.full.paragraphs}`,
  );
  lines.push(
    `Reading ease: ${analytics.readability.ease.toFixed(1)} (${analytics.readability.label})`,
  );
  lines.push(`Grade level:  ${analytics.readability.grade.toFixed(1)}`);
  lines.push(
    `Avg words/sentence: ${analytics.aggregate.avgWordsPerSentence}`,
  );
  lines.push(`Avg chars/word:     ${analytics.aggregate.avgCharsPerWord}`);
  lines.push(`Stopword ratio:     ${analytics.aggregate.stopwordRatio}%`);
  lines.push("");
  lines.push(
    `Title: ${analytics.title.chars}/30 chars · ${analytics.title.words} words`,
  );
  lines.push(
    `Short: ${analytics.short.chars}/80 chars · ${analytics.short.words} words`,
  );
  lines.push(
    `Full:  ${analytics.full.chars}/4000 chars · ${analytics.full.words} words`,
  );
  lines.push("");

  lines.push(divider("TOP KEYWORDS (1-gram)"));
  lines.push(fmtKeywords(extraction.onegram));
  lines.push("");
  lines.push(divider("TOP PHRASES (2-gram)"));
  lines.push(fmtKeywords(extraction.bigram));
  lines.push("");
  lines.push(divider("TOP PHRASES (3-gram)"));
  lines.push(fmtKeywords(extraction.trigram));
  lines.push("");

  return lines.join("\n");
}
