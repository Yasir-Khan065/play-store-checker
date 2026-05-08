const WORD_RE = /[a-z0-9]+(?:'[a-z]+)?/gi;
const SENTENCE_SPLIT_RE = /[.!?]+/;

function normalize(token) {
  return token.toLowerCase();
}

export function tokenize(text) {
  if (!text) return [];
  const matches = text.match(WORD_RE);
  if (!matches) return [];
  return matches.map(normalize);
}

export function tokenizeBySentence(text) {
  if (!text) return [];
  return text
    .split(SENTENCE_SPLIT_RE)
    .map((s) => tokenize(s))
    .filter((t) => t.length > 0);
}
