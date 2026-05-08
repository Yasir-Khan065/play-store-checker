import { matchTerms } from "./title.js";
import { rankingTerms } from "./term-lists/ranking.js";
import { dealPromotionTerms } from "./term-lists/dealPromotion.js";
import { playProgramsTerms } from "./term-lists/playPrograms.js";
import { ctaTerms } from "./term-lists/ctas.js";

// ════════════════════════════════════════════════════════════════
// ── SHORT DESCRIPTION CHECKER (Google Play 80-char policy)
// ════════════════════════════════════════════════════════════════

// ── VIOLATION: Character Limit (>80 chars) ──
export function checkShortCharLimit(text) {
  if (!text) return null;

  if (text.length > 80) {
    return {
      field: "short",
      severity: "Violation",
      rule: "Character Limit Exceeded",
      message: `Short description exceeds 80 characters (${text.length} chars). Keep it under 80.`,
      match: text,
    };
  }

  return null;
}

// ── VIOLATION: Ranking / Performance Claims ──
export function checkRankingShort(text) {
  if (!text) return null;

  const matches = matchTerms(text, rankingTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "short",
      severity: "Violation",
      rule: "Ranking Claims Prohibited",
      message: `Detected ranking claim: "${term}". Google prohibits ranking and performance claims.`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: Deal/Promotion Terms ──
export function checkPromotionShort(text) {
  if (!text) return null;

  const matches = matchTerms(text, dealPromotionTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "short",
      severity: "Violation",
      rule: "Promotional Terms Prohibited",
      message: `Detected promotional term: "${term}". Promotional offers are not allowed.`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: Pricing Information ──
export function checkPricingShort(text) {
  if (!text) return null;

  const pricingPatterns = [
    /\$\s?\d+/,
    /\d+\s?(usd|eur|gbp|rs|inr|pkr)/i,
    /\d+\s?%\s?(off|discount|sale)/i,
    /\b(cash\s?back|refund|rebate)\b/i,
  ];

  const issues = [];

  for (const pattern of pricingPatterns) {
    const match = text.match(pattern);
    if (match) {
      issues.push({
        field: "short",
        severity: "Violation",
        rule: "Pricing Information Prohibited",
        message: `Detected pricing: "${match[0]}". Do not include prices in the short description.`,
        match: match[0],
      });
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── VIOLATION: Play Program References ──
export function checkPlayProgramShort(text) {
  if (!text) return null;

  const matches = matchTerms(text, playProgramsTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "short",
      severity: "Violation",
      rule: "Play Program References Prohibited",
      message: `Detected Play program reference: "${term}". Cannot reference Store programs.`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: CTA Terms ──
export function checkCtaShort(text) {
  if (!text) return null;

  const matches = matchTerms(text, ctaTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "short",
      severity: "Violation",
      rule: "Call-to-Action Prohibited",
      message: `Detected CTA: "${term}". CTAs are not allowed in short descriptions.`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: Repeated Special Characters ──
export function checkSpecialCharShort(text) {
  if (!text) return null;

  const patterns = [/!!!/, /\?\?\?/, /\*\*\*/];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        field: "short",
        severity: "Violation",
        rule: "Repeated Special Characters",
        message: `Detected repeated punctuation: "${match[0]}". Avoid excessive punctuation.`,
        match: match[0],
      };
    }
  }

  return null;
}

// ── VIOLATION: Unattributed Testimonial / Comparison ──
export function checkTestimonialShort(text) {
  if (!text) return null;

  const patterns = [
    /#1\s+rated/i,
    /best\s+app\s+for/i,
    /top\s+rated\s+app/i,
    /better\s+than/i,
    /unlike\s+/i,
  ];

  const issues = [];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      issues.push({
        field: "short",
        severity: "Violation",
        rule: "Ranking Claim Detected",
        message: `Detected unattributed claim: "${match[0]}". Google prohibits claims without proof.`,
        match: match[0],
      });
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── RISK: ALL CAPS Ratio (>50%) ──
export function checkAllCapsRiskShort(text) {
  if (!text || text.length < 5) return null;

  const alphaChars = text.match(/[a-z]/gi) || [];
  if (alphaChars.length === 0) return null;

  const upperChars = text.match(/[A-Z]/g) || [];
  const upperRatio = upperChars.length / alphaChars.length;

  if (upperRatio > 0.5) {
    return {
      field: "short",
      severity: "Risk",
      rule: "Excessive Capitalization",
      message: `${Math.round(upperRatio * 100)}% of letters are uppercase. Keep under 50% for readability.`,
      match: text,
    };
  }

  return null;
}

// ── RISK: Excessive Emojis (>2) ──
export function checkEmojisRiskShort(text) {
  if (!text) return null;

  const emojiRegex = /[\p{Extended_Pictographic}]/gu;
  const emoticonRegex = /:\)|:\(|:D|XD|:P|;-?\)|<3/gi;

  const emojiMatch = text.match(emojiRegex) || [];
  const emoticonMatch = text.match(emoticonRegex) || [];
  const totalEmojis = emojiMatch.length + emoticonMatch.length;

  if (totalEmojis > 2) {
    return {
      field: "short",
      severity: "Risk",
      rule: "Excessive Emojis",
      message: `Contains ${totalEmojis} emojis. Limit to 2 or fewer to avoid appearing spammy.`,
      match: totalEmojis.toString(),
    };
  }

  return null;
}

// ── RISK: Decorative Symbols ──
export function checkDecorativeShort(text) {
  if (!text) return null;

  const decorativeRegex = /[★☆♦▪♥❤💎✨🔥⭐]/g;
  const matches = text.match(decorativeRegex);

  if (matches && matches.length > 0) {
    return {
      field: "short",
      severity: "Risk",
      rule: "Decorative Symbols",
      message: `Detected ${matches.length} decorative symbol(s). Use sparingly.`,
      match: matches.join(""),
    };
  }

  return null;
}

// ── RISK: Keyword Stuffing (4+ letter word repeated 3+ times) ──
export function checkKeywordStuffingShort(text) {
  if (!text) return null;

  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordFreq = {};

  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }

  const issues = [];

  for (const [word, count] of Object.entries(wordFreq)) {
    if (count >= 3) {
      issues.push({
        field: "short",
        severity: "Risk",
        rule: "Keyword Stuffing",
        message: `Keyword "${word}" repeated ${count} times. Avoid repetition.`,
        match: word,
      });
    }
  }

  return issues.length > 0 ? issues : null;
}

// ── TIP: Underused Field (<30 chars) ──
export function checkUnderusedShort(text) {
  if (!text || text.length >= 30) return null;

  return {
    field: "short",
    severity: "Tip",
    rule: "Underused Field",
    message: `Short description is ${text.length} characters. Fill it (30+ chars recommended) — it's indexed and displayed prominently.`,
  };
}

// ── TIP: Missing Action Verb ──
export function checkActionVerbShort(text) {
  if (!text || text.length < 3) return null;

  const actionVerbs = [
    "track",
    "manage",
    "learn",
    "find",
    "build",
    "create",
    "discover",
    "organize",
    "explore",
    "connect",
    "share",
    "improve",
    "enhance",
    "get",
    "try",
    "start",
    "download",
    "install",
    "make",
  ];

  const lowerText = text.toLowerCase();
  const hasVerb = actionVerbs.some((verb) =>
    new RegExp(`\\b${verb}\\b`, "i").test(lowerText)
  );

  if (!hasVerb) {
    return {
      field: "short",
      severity: "Tip",
      rule: "Missing Action Verb",
      message:
        "Lead with an action verb (Track, Manage, Learn, etc.). Verb-led descriptions convert better.",
    };
  }

  return null;
}

// ════════════════════════════════════════════════════════════════

export function checkShortLength(text) {
  if (!text) return null;

  const issues = [];

  // VIOLATIONS
  const charLimit = checkShortCharLimit(text);
  if (charLimit) issues.push(charLimit);

  const ranking = checkRankingShort(text);
  if (ranking) issues.push(...(Array.isArray(ranking) ? ranking : [ranking]));

  const promotion = checkPromotionShort(text);
  if (promotion)
    issues.push(...(Array.isArray(promotion) ? promotion : [promotion]));

  const pricing = checkPricingShort(text);
  if (pricing) issues.push(...(Array.isArray(pricing) ? pricing : [pricing]));

  const playProgram = checkPlayProgramShort(text);
  if (playProgram)
    issues.push(...(Array.isArray(playProgram) ? playProgram : [playProgram]));

  const cta = checkCtaShort(text);
  if (cta) issues.push(...(Array.isArray(cta) ? cta : [cta]));

  const specialChar = checkSpecialCharShort(text);
  if (specialChar) issues.push(specialChar);

  const testimonial = checkTestimonialShort(text);
  if (testimonial)
    issues.push(...(Array.isArray(testimonial) ? testimonial : [testimonial]));

  // RISKS
  const allCaps = checkAllCapsRiskShort(text);
  if (allCaps) issues.push(allCaps);

  const emojis = checkEmojisRiskShort(text);
  if (emojis) issues.push(emojis);

  const decorative = checkDecorativeShort(text);
  if (decorative) issues.push(decorative);

  const stuffing = checkKeywordStuffingShort(text);
  if (stuffing) issues.push(...(Array.isArray(stuffing) ? stuffing : [stuffing]));

  // TIPS
  const underused = checkUnderusedShort(text);
  if (underused) issues.push(underused);

  const verb = checkActionVerbShort(text);
  if (verb) issues.push(verb);

  return issues.length > 0 ? issues : null;
}
