const STOPWORDS = new Set([
  "the", "and", "for", "with", "this", "that", "your", "from",
  "are", "was", "were", "have", "has", "had", "will", "would",
  "can", "could", "should", "our", "their", "they", "them",
  "its", "it", "is", "of", "in", "on", "to", "a", "an", "at",
  "by", "as", "be", "or", "but", "if", "so", "not", "no",
  "do", "does", "did", "you", "we", "i", "he", "she", "what",
  "which", "when", "where", "who", "how", "up", "down", "out",
  "about", "into", "than", "then", "these", "those", "some",
  "any", "all", "each", "every", "more", "most", "other",
  "such", "only", "own", "same", "too", "very", "just", "now",
]);

const WORD_RE = /[A-Za-z0-9']+/g;

export function tokenize(text) {
  if (!text) return [];
  return text.match(WORD_RE) || [];
}

function countSentences(text) {
  if (!text || !text.trim()) return 0;
  const matches = text.match(/[^.!?]+[.!?]+/g);
  if (matches && matches.length) return matches.length;
  return text.trim() ? 1 : 0;
}

function countParagraphs(text) {
  if (!text || !text.trim()) return 0;
  const parts = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return parts.length || 1;
}

export function getMetrics(text) {
  const safe = text || "";
  const words = tokenize(safe);
  const lower = words.map((w) => w.toLowerCase());
  const stopCount = lower.filter((w) => STOPWORDS.has(w)).length;
  const sentences = countSentences(safe);
  const paragraphs = countParagraphs(safe);
  const unique = new Set(lower).size;
  const charsInWords = words.reduce((acc, w) => acc + w.length, 0);

  return {
    chars: safe.length,
    charsNoSpaces: safe.replace(/\s/g, "").length,
    words: words.length,
    sentences,
    paragraphs,
    uniqueWords: unique,
    stopCount,
    charsInWords,
    avgWordsPerSentence:
      sentences > 0 ? Math.round((words.length / sentences) * 10) / 10 : 0,
    avgCharsPerWord:
      words.length > 0 ? Math.round((charsInWords / words.length) * 10) / 10 : 0,
    stopwordRatio:
      words.length > 0 ? Math.round((stopCount / words.length) * 100) : 0,
  };
}
