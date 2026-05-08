import { useMemo } from "react";
import { getMetrics } from "../utils/textAnalytics.js";
import {
  fleschReadingEase,
  fleschKincaidGrade,
  readingLevelLabel,
} from "../utils/readability.js";

export function useTextAnalytics(title, shortDesc, fullDesc) {
  return useMemo(() => {
    const t = getMetrics(title);
    const s = getMetrics(shortDesc);
    const f = getMetrics(fullDesc);

    const combinedText = `${title || ""}\n\n${shortDesc || ""}\n\n${fullDesc || ""}`;
    const totalWords = t.words + s.words + f.words;
    const totalSentences = t.sentences + s.sentences + f.sentences;
    const totalStop = t.stopCount + s.stopCount + f.stopCount;
    const totalCharsInWords = t.charsInWords + s.charsInWords + f.charsInWords;

    const ease = fleschReadingEase(combinedText, totalWords, totalSentences);
    const grade = fleschKincaidGrade(combinedText, totalWords, totalSentences);

    return {
      title: t,
      short: s,
      full: f,
      aggregate: {
        words: totalWords,
        sentences: totalSentences,
        uniqueWords: t.uniqueWords + s.uniqueWords + f.uniqueWords,
        avgWordsPerSentence:
          totalSentences > 0
            ? Math.round((totalWords / totalSentences) * 10) / 10
            : 0,
        avgCharsPerWord:
          totalWords > 0
            ? Math.round((totalCharsInWords / totalWords) * 10) / 10
            : 0,
        stopwordRatio:
          totalWords > 0 ? Math.round((totalStop / totalWords) * 100) : 0,
      },
      readability: {
        ease,
        grade,
        label: readingLevelLabel(ease),
      },
    };
  }, [title, shortDesc, fullDesc]);
}
