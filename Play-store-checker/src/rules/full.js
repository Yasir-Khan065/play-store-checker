import { matchTerms } from "./title.js";
import { rankingTerms } from "./term-lists/ranking.js";

// ════════════════════════════════════════════════════════════════
// ── FULL DESCRIPTION CHECKER (Google Play 4000-char policy)
// ════════════════════════════════════════════════════════════════

// ── STOPWORDS FOR KEYWORD DENSITY ──
const stopwords = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "are",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "what",
  "which",
  "who",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "as",
  "just",
  "your",
]);

// ── VIOLATION: Character Limit (>4000) ──
export function checkCharacterLimit(text) {
  if (!text) return null;

  if (text.length > 4000) {
    return {
      field: "full",
      severity: "Violation",
      rule: "Character Limit Exceeded",
      message: `Full description exceeds 4000 characters (${text.length} chars). Keep it under 4000.`,
      match: text,
    };
  }

  return null;
}

// ── VIOLATION: Ranking / Performance Claims ──
export function checkRankingFull(text) {
  if (!text) return null;

  const matches = matchTerms(text, rankingTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "full",
      severity: "Violation",
      rule: "Ranking Claims Prohibited",
      message: `Detected ranking claim: "${term}". Google prohibits ranking and performance claims.`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: Anonymous Testimonial (quoted 20+ chars without attribution) ──
export function checkAnonymousTestimonial(text) {
  if (!text) return null;

  const quotedPatterns = [
    /"([^"]{20,})"/g,
    /'([^']{20,})'/g,
    /[""]([^""]{20,})[""]"/g,
  ];

  const issues = [];

  for (const pattern of quotedPatterns) {
    let match;
    const patternCopy = new RegExp(pattern.source, pattern.flags);
    while ((match = patternCopy.exec(text)) !== null) {
      const quotedText = match[1];
      const afterQuote = text.substring(
        match.index + match[0].length,
        match.index + match[0].length + 50
      );

      const attributionRegex = /^\s*[-–—]\s*\w+|^\s*by\s+\w+|^\s*said\s+by|^\s*\(\w+\)/;

      if (!attributionRegex.test(afterQuote)) {
        issues.push({
          field: "full",
          severity: "Violation",
          rule: "Unattributed Testimonial",
          message: `Quoted testimonial missing attribution (e.g., " - John"). Google prohibits unattributed quotes.`,
          match: quotedText.substring(0, 40),
        });
      }
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── VIOLATION: Comparison to Other Apps ──
export function checkComparison(text) {
  if (!text) return null;

  const comparisonPatterns = [
    /better\s+than/gi,
    /unlike\s+/gi,
    /\bvs\b/gi,
    /\bvs\./gi,
    /versus/gi,
    /compared\s+to/gi,
    /superior\s+to/gi,
  ];

  const issues = [];
  const seenMatches = new Set();

  for (const pattern of comparisonPatterns) {
    let match;
    while ((match = text.match(pattern)) !== null) {
      const matchStr = match[0].toLowerCase();
      if (!seenMatches.has(matchStr)) {
        seenMatches.add(matchStr);
        issues.push({
          field: "full",
          severity: "Violation",
          rule: "Comparison to Competitor",
          message: `Detected comparison claim: "${match[0]}". Google prohibits comparisons to other apps.`,
          match: match[0],
        });
      }

      text = text.replace(pattern, "");
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── VIOLATION: Keyword Block / Word List (6+ comma-separated items with no verbs) ──
export function checkKeywordBlock(text) {
  if (!text) return null;

  const sentences = text.split(/[.!?]+/).map((s) => s.trim());
  const issues = [];

  for (const sentence of sentences) {
    if (sentence.includes(",")) {
      const items = sentence.split(",").map((s) => s.trim());

      if (items.length >= 6) {
        // Check if sentence has verbs
        const verbRegex = /\b(is|are|be|been|being|have|has|had|do|does|did|can|could|should|would|will|may|might|must|get|go|make|take|use|play|watch|track|manage|learn|find|build|create|discover|organize|explore|connect|share|improve|enhance)\b/i;

        if (!verbRegex.test(sentence)) {
          const preview = sentence.substring(0, 60);
          issues.push({
            field: "full",
            severity: "Violation",
            rule: "Keyword Block Pattern",
            message: `Detected keyword list with 6+ items and no action verb. This appears to be keyword stuffing: "${preview}..."`,
            match: sentence,
          });
          break; // Only report once per description
        }
      }
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── VIOLATION/RISK: Keyword Density (>4% = Violation, 3-4% = Risk) ──
export function checkKeywordDensity(text) {
  if (!text || text.length < 10) return null;

  const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];

  if (tokens.length === 0) return null;

  const wordFreq = {};
  for (const token of tokens) {
    if (token.length > 2 && !stopwords.has(token)) {
      wordFreq[token] = (wordFreq[token] || 0) + 1;
    }
  }

  const issues = [];

  for (const [word, count] of Object.entries(wordFreq)) {
    const density = (count / tokens.length) * 100;

    if (density > 4) {
      issues.push({
        field: "full",
        severity: "Violation",
        rule: "Severe Keyword Stuffing",
        message: `Keyword "${word}" appears ${count} times (${density.toFixed(2)}% density). Keep below 4%.`,
        match: word,
      });
    } else if (density >= 3 && density <= 4) {
      issues.push({
        field: "full",
        severity: "Risk",
        rule: "Moderate Keyword Stuffing",
        message: `Keyword "${word}" at ${density.toFixed(2)}% density (3-4% range). Consider reducing.`,
        match: word,
      });
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── RISK: ALL CAPS Sentences (>70% uppercase per sentence) ──
export function checkAllCapsSentences(text) {
  if (!text) return null;

  const sentences = text.split(/[.!?]+/).map((s) => s.trim());
  const issues = [];

  for (const sentence of sentences) {
    if (sentence.length < 5) continue;

    const alphaChars = sentence.match(/[a-z]/gi) || [];
    if (alphaChars.length === 0) continue;

    const upperChars = sentence.match(/[A-Z]/g) || [];
    const upperRatio = upperChars.length / alphaChars.length;

    if (upperRatio > 0.7) {
      issues.push({
        field: "full",
        severity: "Risk",
        rule: "ALL CAPS Sentence",
        message: `Sentence is ${Math.round(upperRatio * 100)}% uppercase. Avoid ALL CAPS for better readability.`,
        match: sentence.substring(0, 50),
      });
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── RISK: Third-party Trademarks ──
export function checkThirdPartyTrademarks(text) {
  if (!text) return null;

  const trademarks = [
    "google",
    "whatsapp",
    "facebook",
    "instagram",
    "tiktok",
    "twitter",
    "youtube",
    "spotify",
    "netflix",
    "amazon",
    "apple",
    "microsoft",
    "samsung",
    "sony",
    "lg",
    "xiaomi",
    "oneplus",
    "huawei",
    "intel",
    "amd",
    "nvidia",
    "tesla",
    "bmw",
    "mercedes",
    "uber",
    "airbnb",
    "paypal",
    "visa",
    "mastercard",
    "adobe",
    "slack",
    "zoom",
    "discord",
    "github",
    "gitlab",
    "atlassian",
  ];

  const issues = [];
  const seenBrands = new Set();

  for (const brand of trademarks) {
    const regex = new RegExp(`\\b${brand}\\b`, "gi");
    const matches = text.match(regex);

    if (matches && !seenBrands.has(brand.toLowerCase())) {
      seenBrands.add(brand.toLowerCase());
      issues.push({
        field: "full",
        severity: "Risk",
        rule: "Third-party Trademark",
        message: `Mentioned third-party brand: "${brand}". Verify you have permission to use this brand name.`,
        match: brand,
      });
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── RISK: Unsubstantiated Superlatives ──
export function checkUnsubstantiatedSuperlatives(text) {
  if (!text) return null;

  const superlatives = [
    /world'?s\s+best/gi,
    /fastest\s+ever/gi,
    /only\s+app\s+that/gi,
    /best\s+app\s+ever/gi,
    /\#1\s+app/gi,
    /number\s+one\s+app/gi,
    /top\s+app/gi,
    /greatest\s+app/gi,
    /most\s+popular\s+app/gi,
  ];

  const issues = [];

  for (const pattern of superlatives) {
    const match = text.match(pattern);
    if (match) {
      issues.push({
        field: "full",
        severity: "Risk",
        rule: "Unsubstantiated Superlative",
        message: `Detected unsubstantiated claim: "${match[0]}". Provide evidence or remove.`,
        match: match[0],
      });
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── RISK: Excessive Emojis (>20) ──
export function checkExcessiveEmojisFull(text) {
  if (!text) return null;

  const emojiRegex = /[\p{Extended_Pictographic}]/gu;
  const emoticonRegex = /:\)|:\(|:D|XD|:P|;-?\)|<3/gi;

  const emojiMatch = text.match(emojiRegex) || [];
  const emoticonMatch = text.match(emoticonRegex) || [];
  const totalEmojis = emojiMatch.length + emoticonMatch.length;

  if (totalEmojis > 20) {
    return {
      field: "full",
      severity: "Risk",
      rule: "Excessive Emojis",
      message: `Contains ${totalEmojis} emojis. Limit to 20 or fewer for professionalism.`,
      match: totalEmojis.toString(),
    };
  }

  return null;
}

// ── RISK: Excessive URLs (>3) ──
export function checkExcessiveUrls(text) {
  if (!text) return null;

  const urlRegex = /https?:\/\/[^\s]+|www\.\S+/gi;
  const matches = text.match(urlRegex) || [];

  if (matches.length > 3) {
    return {
      field: "full",
      severity: "Risk",
      rule: "Excessive URLs",
      message: `Contains ${matches.length} URLs. Limit to 3 or fewer.`,
      match: matches.length.toString(),
    };
  }

  return null;
}

// ── RISK: Repeated Special Characters ──
export function checkRepeatedPunctuation(text) {
  if (!text) return null;

  const patterns = [/!!!/, /\?\?\?/, /\*\*\*/];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        field: "full",
        severity: "Risk",
        rule: "Repeated Punctuation",
        message: `Detected repeated punctuation: "${match[0]}". Use single punctuation marks.`,
        match: match[0],
      };
    }
  }

  return null;
}

// ── TIP: Description Too Short (<250 chars) ──
export function checkTooShortFull(text) {
  if (!text || text.length >= 250) return null;

  return {
    field: "full",
    severity: "Tip",
    rule: "Description Too Short",
    message: `Full description is ${text.length} characters. Google indexes the full description — aim for 800–3000 chars.`,
  };
}

// ── TIP: Poor Paragraph Structure (>600 chars, <3 paragraphs) ──
export function checkPoorStructure(text) {
  if (!text || text.length <= 600) return null;

  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  if (paragraphs.length < 3) {
    return {
      field: "full",
      severity: "Tip",
      rule: "Poor Structure",
      message: `${text.length} characters but only ${paragraphs.length} paragraph(s). Use 3+ paragraphs for readability.`,
    };
  }

  return null;
}

// ── TIP: Key Keyword Missing from Prime Real Estate ──
export function checkKeywordPlacement(text) {
  if (!text || text.length < 180) return null;

  const firstChars = text.substring(0, 180);
  const lastChars = text.substring(Math.max(0, text.length - 180));

  const mainKeywords = [
    "app",
    "application",
    "download",
    "install",
    "free",
    "track",
    "manage",
    "learn",
    "find",
  ];

  const hasFirstKeyword = mainKeywords.some((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(firstChars)
  );
  const hasLastKeyword = mainKeywords.some((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(lastChars)
  );

  const issues = [];

  if (!hasFirstKeyword) {
    issues.push({
      field: "full",
      severity: "Tip",
      rule: "Keyword Missing from Opening",
      message:
        "Place main keywords in first 180 characters — prime indexing real estate.",
    });
  }

  if (!hasLastKeyword) {
    issues.push({
      field: "full",
      severity: "Tip",
      rule: "Keyword Missing from Closing",
      message: "Reinforce keywords in last 180 characters for better impact.",
    });
  }

  return issues.length > 0 ? issues : null;
}

// ════════════════════════════════════════════════════════════════

export function checkFullLength(text) {
  if (!text) return null;

  const issues = [];

  // VIOLATIONS
  const charLimit = checkCharacterLimit(text);
  if (charLimit) issues.push(charLimit);

  const ranking = checkRankingFull(text);
  if (ranking) issues.push(...(Array.isArray(ranking) ? ranking : [ranking]));

  const testimonial = checkAnonymousTestimonial(text);
  if (testimonial)
    issues.push(...(Array.isArray(testimonial) ? testimonial : [testimonial]));

  const comparison = checkComparison(text);
  if (comparison)
    issues.push(...(Array.isArray(comparison) ? comparison : [comparison]));

  const keywordBlock = checkKeywordBlock(text);
  if (keywordBlock)
    issues.push(...(Array.isArray(keywordBlock) ? keywordBlock : [keywordBlock]));

  const density = checkKeywordDensity(text);
  if (density) issues.push(...(Array.isArray(density) ? density : [density]));

  // RISKS
  const allCaps = checkAllCapsSentences(text);
  if (allCaps) issues.push(...(Array.isArray(allCaps) ? allCaps : [allCaps]));

  const trademarks = checkThirdPartyTrademarks(text);
  if (trademarks)
    issues.push(...(Array.isArray(trademarks) ? trademarks : [trademarks]));

  const superlatives = checkUnsubstantiatedSuperlatives(text);
  if (superlatives)
    issues.push(...(Array.isArray(superlatives) ? superlatives : [superlatives]));

  const emojis = checkExcessiveEmojisFull(text);
  if (emojis) issues.push(emojis);

  const urls = checkExcessiveUrls(text);
  if (urls) issues.push(urls);

  const punctuation = checkRepeatedPunctuation(text);
  if (punctuation) issues.push(punctuation);

  // TIPS
  const tooShort = checkTooShortFull(text);
  if (tooShort) issues.push(tooShort);

  const structure = checkPoorStructure(text);
  if (structure) issues.push(structure);

  const placement = checkKeywordPlacement(text);
  if (placement) issues.push(...(Array.isArray(placement) ? placement : [placement]));

  return issues.length > 0 ? issues : null;
}
