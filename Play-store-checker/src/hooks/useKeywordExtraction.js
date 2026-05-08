import { useMemo } from "react";
import { tokenize, tokenizeBySentence } from "../utils/tokenizer.js";
import { makeNgrams, applyStopwordFilter } from "../utils/ngrams.js";
import { frequencyCount, topN } from "../utils/frequency.js";

const TOP = 20;

function buildPresenceChecker(text) {
  const stream = ` ${tokenize(text).join(" ")} `;
  return (keyword) => stream.includes(` ${keyword} `);
}

function buildTier(sentenceTokens, n, applyToAll, totalTokens, presence) {
  const all = makeNgrams(sentenceTokens, n);
  const filtered = applyStopwordFilter(all, applyToAll);
  const freq = frequencyCount(filtered);
  const top = topN(freq, TOP);

  return top.map(([keyword, count]) => ({
    keyword,
    count,
    density:
      totalTokens > 0
        ? Math.round((count / totalTokens) * 10000) / 100
        : 0,
    inTitle: presence.title(keyword),
    inShort: presence.short(keyword),
    inFull: presence.full(keyword),
  }));
}

export function useKeywordExtraction(title, shortDesc, fullDesc, options = {}) {
  const { applyStopwordsToAll = false } = options;

  return useMemo(() => {
    const combined = `${title || ""}\n${shortDesc || ""}\n${fullDesc || ""}`;
    const sentenceTokens = tokenizeBySentence(combined);
    const totalTokens = sentenceTokens.reduce((sum, s) => sum + s.length, 0);

    const presence = {
      title: buildPresenceChecker(title),
      short: buildPresenceChecker(shortDesc),
      full: buildPresenceChecker(fullDesc),
    };

    return {
      totalTokens,
      onegram: buildTier(sentenceTokens, 1, applyStopwordsToAll, totalTokens, presence),
      bigram: buildTier(sentenceTokens, 2, applyStopwordsToAll, totalTokens, presence),
      trigram: buildTier(sentenceTokens, 3, applyStopwordsToAll, totalTokens, presence),
    };
  }, [title, shortDesc, fullDesc, applyStopwordsToAll]);
}
