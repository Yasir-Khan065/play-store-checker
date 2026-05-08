import { isStopword } from "./stopwords.js";

export function makeNgrams(sentenceTokens, n) {
  const grams = [];
  for (const tokens of sentenceTokens) {
    if (tokens.length < n) continue;
    for (let i = 0; i + n <= tokens.length; i++) {
      grams.push(tokens.slice(i, i + n));
    }
  }
  return grams;
}

export function applyStopwordFilter(grams, applyToAll) {
  return grams.filter((slice) => {
    if (applyToAll) {
      return !slice.some(isStopword);
    }
    if (slice.length === 1) {
      return !isStopword(slice[0]);
    }
    return true;
  });
}
