import { tokenize } from "./textAnalytics.js";

function syllablesInWord(raw) {
  const w = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;

  const stripped = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");

  const groups = stripped.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

export function countSyllables(text) {
  if (!text) return 0;
  return tokenize(text).reduce((acc, w) => acc + syllablesInWord(w), 0);
}

export function fleschReadingEase(text, words, sentences) {
  if (!words || !sentences) return 0;
  const syllables = countSyllables(text);
  if (!syllables) return 0;
  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.round(score * 10) / 10;
}

export function fleschKincaidGrade(text, words, sentences) {
  if (!words || !sentences) return 0;
  const syllables = countSyllables(text);
  if (!syllables) return 0;
  const score =
    0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.round(score * 10) / 10;
}

export function readingLevelLabel(ease) {
  if (ease >= 90) return "Very Easy";
  if (ease >= 80) return "Easy";
  if (ease >= 70) return "Fairly Easy";
  if (ease >= 60) return "Standard";
  if (ease >= 50) return "Fairly Hard";
  if (ease >= 30) return "Difficult";
  if (ease > 0) return "Very Hard";
  return "—";
}
