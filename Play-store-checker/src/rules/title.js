import { rankingTerms } from "./term-lists/ranking.js";
import { dealPromotionTerms } from "./term-lists/dealPromotion.js";
import { playProgramsTerms } from "./term-lists/playPrograms.js";
import { ctaTerms } from "./term-lists/ctas.js";

// ── HELPER: Term Matching ──
export function matchTerms(text, termList) {
  if (!text || !termList || termList.length === 0) return [];

  const matches = [];
  const lowerText = text.toLowerCase();

  for (const term of termList) {
    const regex = new RegExp(
      `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi",
    );
    const found = lowerText.match(regex);
    if (found) {
      matches.push(...found.map((m) => m.toLowerCase()));
    }
  }

  return [...new Set(matches)]; // Remove duplicates
}

// ── VIOLATION: Title Length ──
export function checkTitleLength(text) {
  if (!text) return null;

  if (text.length > 30) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Title Length Limit",
      message: "Title must not exceed 30 characters",
      match: text,
      index: 30,
    };
  }

  return null;
}

// ── VIOLATION: Ranking Terms ──
export function checkRankingTerms(text) {
  if (!text) return null;

  const matches = matchTerms(text, rankingTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "title",
      severity: "Violation",
      rule: "Ranking Terms Prohibited",
      message: `Detected prohibited ranking term: "${term}"`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: Deal/Promotion Terms ──
export function checkDealPromotionTerms(text) {
  if (!text) return null;

  const matches = matchTerms(text, dealPromotionTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "title",
      severity: "Violation",
      rule: "Promotional Terms Prohibited",
      message: `Detected prohibited promotional term: "${term}"`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: Play Programs Terms ──
export function checkPlayProgramsTerms(text) {
  if (!text) return null;

  const matches = matchTerms(text, playProgramsTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "title",
      severity: "Violation",
      rule: "Play Programs Terms Prohibited",
      message: `Detected prohibited program reference: "${term}"`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: CTA Terms ──
export function checkCtaTerms(text) {
  if (!text) return null;

  const matches = matchTerms(text, ctaTerms);
  if (matches.length > 0) {
    return matches.map((term) => ({
      field: "title",
      severity: "Violation",
      rule: "Call-to-Action Terms Prohibited",
      message: `Detected prohibited CTA term: "${term}"`,
      match: term,
    }));
  }

  return null;
}

// ── VIOLATION: Currency Detection ──
export function checkCurrency(text) {
  if (!text) return null;

  const currencyRegex = /\$|USD|PKR|EUR|GBP|INR|CAD/gi;
  const matches = text.match(currencyRegex);

  if (matches) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Currency Mention Prohibited",
      message: "Title should not contain currency symbols or codes",
      match: matches[0],
    };
  }

  return null;
}

// ── VIOLATION: Percent-off Detection ──
export function checkPercentOff(text) {
  if (!text) return null;

  const percentRegex = /\d+%\s*off|discount/gi;
  const match = text.match(percentRegex);

  if (match) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Discount Claims Prohibited",
      message: "Title should not contain discount or percentage-off claims",
      match: match[0],
    };
  }

  return null;
}

// ── VIOLATION: Limited-time Detection ──
export function checkLimitedTime(text) {
  if (!text) return null;

  const limitedTimeRegex =
    /limited\s*time|only\s*today|exclusively|flash\s*sale/gi;
  const match = text.match(limitedTimeRegex);

  if (match) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Limited-Time Claims Prohibited",
      message: "Title should not contain time-limited offers",
      match: match[0],
    };
  }

  return null;
}

// ── VIOLATION: Cashback Detection ──
export function checkCashback(text) {
  if (!text) return null;

  const cashbackRegex = /cash\s*back|cashback/gi;
  const match = text.match(cashbackRegex);

  if (match) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Cashback Claims Prohibited",
      message: "Title should not contain cashback offers",
      match: match[0],
    };
  }

  return null;
}

// ── VIOLATION: Rank/Number Claims ──
export function checkRankClaims(text) {
  if (!text) return null;

  const rankRegex = /top\s*\d+|#\d+|no\s*\d+|number\s*\d+/gi;
  const match = text.match(rankRegex);

  if (match) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Rank Claims Prohibited",
      message: "Title should not contain ranking or numbering claims",
      match: match[0],
    };
  }

  return null;
}

// ── VIOLATION: Download/Install CTA ──
export function checkDownloadCta(text) {
  if (!text) return null;

  const downloadRegex = /download\s*now|install\s*now|get\s*it\s*now/gi;
  const match = text.match(downloadRegex);

  if (match) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Download CTA Prohibited",
      message: "Title should not contain download or install calls-to-action",
      match: match[0],
    };
  }

  return null;
}

// ── VIOLATION: All Caps Detection ──
export function checkAllCaps(text) {
  if (!text || text.length < 5) return null;

  const alphaChars = text.match(/[a-z]/gi) || [];
  const upperChars = text.match(/[A-Z]/g) || [];

  if (alphaChars.length === 0) return null;

  const upperRatio = upperChars.length / alphaChars.length;

  if (upperRatio > 0.7) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Excessive Capitalization",
      message: "Title should not be in ALL CAPS or mostly uppercase",
      match: text,
    };
  }

  return null;
}

// ── VIOLATION: Emoji Detection ──
export function checkEmoji(text) {
  if (!text) return null;

  // Unicode emoji and emoticon patterns
  const emojiRegex = /[\p{Extended_Pictographic}]/gu;
  const emoticonRegex = /:\)|:\(|:D|XD|:P|;-?\)|<3/gi;

  const emojiMatch = text.match(emojiRegex);
  const emoticonMatch = text.match(emoticonRegex);

  if (emojiMatch || emoticonMatch) {
    const foundEmoji = emojiMatch?.[0] || emoticonMatch?.[0];
    return {
      field: "title",
      severity: "Violation",
      rule: "Emoji/Emoticon Detected",
      message: "Title should not contain emojis or emoticons",
      match: foundEmoji,
    };
  }

  return null;
}

// ── VIOLATION: Special Character Repetition ──
export function checkSpecialCharRepetition(text) {
  if (!text) return null;

  const repeatRegex = /([!?*\-_.=]){3,}/;
  const match = text.match(repeatRegex);

  if (match) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Excessive Special Characters",
      message: "Title should not contain repeated special characters",
      match: match[0],
    };
  }

  return null;
}

// ── VIOLATION: Contact Information ──
export function checkContactInfo(text) {
  if (!text) return null;

  const urlRegex = /https?:\/\/|www\./gi;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\+?\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{2,4}/g;

  const urlMatch = text.match(urlRegex);
  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);

  if (urlMatch || emailMatch || phoneMatch) {
    return {
      field: "title",
      severity: "Violation",
      rule: "Contact Information Detected",
      message: "Title should not contain URLs, emails, or phone numbers",
      match: urlMatch?.[0] || emailMatch?.[0] || phoneMatch?.[0],
    };
  }

  return null;
}

// ── RISK: Decorative Symbol Overload ──
export function checkDecorativeSymbols(text) {
  if (!text) return null;

  const decorativeRegex = /[★☆♦▪♥❤💎✨]/g;
  const matches = text.match(decorativeRegex);

  if (matches && matches.length > 2) {
    return {
      field: "title",
      severity: "Risk",
      rule: "Decorative Symbol Overload",
      message: "Title contains multiple decorative symbols, reducing clarity",
      match: matches.join(""),
    };
  }

  return null;
}

// ── RISK: Separator Spam ──
export function checkSeparatorSpam(text) {
  if (!text) return null;

  const separatorRegex = /([-_]{3,}|[|]{2,}|\*{3,})/g;
  const matches = text.match(separatorRegex);

  if (matches) {
    return {
      field: "title",
      severity: "Risk",
      rule: "Separator Spam",
      message: "Title contains excessive separator patterns",
      match: matches[0],
    };
  }

  return null;
}

// ── RISK: Keyword Stuffing ──
export function checkKeywordStuffing(text) {
  if (!text) return null;

  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};

  for (const word of words) {
    if (word.length > 2) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }

  for (const [word, count] of Object.entries(wordFreq)) {
    if (count > 3) {
      return {
        field: "title",
        severity: "Risk",
        rule: "Keyword Stuffing",
        message: `Keyword "${word}" appears ${count} times. Avoid repetition.`,
        match: word,
      };
    }
  }

  return null;
}

// ── TIP: Short Title ──
export function checkShortTitle(text) {
  if (!text || text.length >= 20) return null;

  return {
    field: "title",
    severity: "Tip",
    rule: "Underutilized Title",
    message:
      "Title is too short. Consider using more space for better optimization.",
  };
}

// ════════════════════════════════════════════════════════════════
// ── STRICT GOOGLE PLAY STORE TITLE COMPLIANCE CHECKER ──
// ════════════════════════════════════════════════════════════════

export function checkTitleCompliance(title) {
  if (!title) {
    return {
      complianceScore: 0,
      violations: [
        {
          type: "Violation",
          rule: "Empty Title",
          message: "Title cannot be empty",
        },
      ],
    };
  }

  const violations = [];
  const lowerTitle = title.toLowerCase();

  // ── RULE 1: CHARACTER LIMIT ──
  if (title.length > 30) {
    violations.push({
      type: "Violation",
      rule: "Character Limit Exceeded",
      message: `Title exceeds 30 characters (${title.length} chars). Must be ≤30.`,
      matchedText: title,
    });
  }

  // ── RULE 2: RANKING / PERFORMANCE CLAIMS ──
  const rankingPatterns = [
    /\b#1\b/i,
    /\bno\.?\s?1\b/i,
    /\bnumber\s+one\b/i,
    /\bnumber\s+1\b/i,
    /\best\b/i,
    /\btop\b/i,
    /\btop\s+rated\b/i,
    /\btop-rated\b/i,
    /\bpopular\b/i,
    /\bapp\s+of\s+the\s+year\b/i,
    /\bbest\s+of\s+play\b/i,
    /\baward\s+winning\b/i,
    /\baward-winning\b/i,
    /\bwinner\b/i,
    /\b(rank|ranked|rating)\s+(#?\s?\d+|one|first)\b/i,
  ];

  for (const pattern of rankingPatterns) {
    const match = title.match(pattern);
    if (match) {
      violations.push({
        type: "Violation",
        rule: "Ranking Claim Prohibited",
        message: `Detected ranking claim: "${match[0]}". Ranking claims are not allowed.`,
        matchedText: match[0],
      });
    }
  }

  // ── RULE 3: DEAL / PROMOTION ──
  const promotionTerms = [
    "free",
    "no ads",
    "no-ads",
    "ad free",
    "ad-free",
    "ads free",
    "sale",
    "discount",
    "cheap",
    "cheapest",
    "offer",
    "deal",
    "promo",
    "promotion",
    "bonus",
    "cashback",
    "cash back",
    "reward",
    "rewards",
  ];

  for (const term of promotionTerms) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(lowerTitle)) {
      violations.push({
        type: "Violation",
        rule: "Promotional Terms Prohibited",
        message: `Detected promotional term: "${term}". Promotional claims are not allowed in titles.`,
        matchedText: term,
      });
    }
  }

  const promotionRegex = /(free|offer|deal)\s+for\s+(a\s+)?limited\s+time/i;
  const promoMatch = title.match(promotionRegex);
  if (promoMatch) {
    violations.push({
      type: "Violation",
      rule: "Promotional Terms Prohibited",
      message: `Detected limited-time promotion: "${promoMatch[0]}". Not allowed.`,
      matchedText: promoMatch[0],
    });
  }

  // ── RULE 4: PRICING INFORMATION ──
  const pricingPatterns = [
    /\$\s?\d+/,
    /\d+\s?(usd|eur|gbp|rs|inr|pkr)/i,
    /\d+\s?%\s?(off|discount|sale)/i,
    /\b(cash\s?back|refund|rebate)\b/i,
  ];

  for (const pattern of pricingPatterns) {
    const match = title.match(pattern);
    if (match) {
      violations.push({
        type: "Violation",
        rule: "Pricing Information Prohibited",
        message: `Detected pricing information: "${match[0]}". Prices cannot be in title.`,
        matchedText: match[0],
      });
    }
  }

  // ── RULE 5: GOOGLE PLAY PROGRAM REFERENCES ──
  const playProgramTerms = [
    "new",
    "editor's choice",
    "editors' choice",
    "editor choice",
    "featured",
    "staff pick",
  ];

  for (const term of playProgramTerms) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(lowerTitle)) {
      violations.push({
        type: "Violation",
        rule: "Play Program References Prohibited",
        message: `Detected Play program term: "${term}". Cannot reference Store programs.`,
        matchedText: term,
      });
    }
  }

  // ── RULE 6: CALL TO ACTION ──
  const ctaPatterns = [
    /\bdownload\b/i,
    /\bdownload\s+now\b/i,
    /\binstall\b/i,
    /\binstall\s+now\b/i,
    /\bget\s+it\s+now\b/i,
    /\btry\s+now\b/i,
    /\bupdate\s+now\b/i,
    /\bclick\s+here\b/i,
    /\btap\s+here\b/i,
    /\bbuy\s+now\b/i,
    /\b(download|install|update|get|try|click|tap)\s+now\b/i,
  ];

  for (const pattern of ctaPatterns) {
    const match = title.match(pattern);
    if (match) {
      violations.push({
        type: "Violation",
        rule: "Call-to-Action Prohibited",
        message: `Detected CTA: "${match[0]}". CTAs are not allowed in titles.`,
        matchedText: match[0],
      });
    }
  }

  // ── RULE 7: ALL CAPS ──
  if (title.length >= 5) {
    const alphaChars = (title.match(/[a-z]/gi) || []).length;
    if (alphaChars > 0) {
      const upperChars = (title.match(/[A-Z]/g) || []).length;
      const upperRatio = upperChars / alphaChars;
      if (upperRatio > 0.7) {
        violations.push({
          type: "Violation",
          rule: "Excessive Capitalization",
          message: "Title should not be in ALL CAPS or mostly uppercase.",
          matchedText: title,
        });
      }
    }
  }

  // ── RULE 8: EMOJI OR EMOTICON ──
  const emojiRegex = /[\p{Extended_Pictographic}]/gu;
  const emoticonRegex = /:\)|:-\)|:D|XD|:P|;-?\)|<3/gi;

  const emojiMatch = title.match(emojiRegex);
  const emoticonMatch = title.match(emoticonRegex);

  if (emojiMatch || emoticonMatch) {
    const found = emojiMatch?.[0] || emoticonMatch?.[0];
    violations.push({
      type: "Violation",
      rule: "Emoji/Emoticon Detected",
      message: "Title should not contain emojis or emoticons.",
      matchedText: found,
    });
  }

  // ── RULE 9: REPEATED SPECIAL CHARACTERS ──
  const specialCharPatterns = [/!!!/, /\?\?\?/, /\*\*\*/, /---/];

  for (const pattern of specialCharPatterns) {
    const match = title.match(pattern);
    if (match) {
      violations.push({
        type: "Violation",
        rule: "Repeated Special Characters",
        message: `Detected repeated special characters: "${match[0]}". Avoid excessive punctuation.`,
        matchedText: match[0],
      });
    }
  }

  // ── RULE 10: CONTACT INFORMATION ──
  const urlRegex = /https?:\/\/|www\./i;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /\+?\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{2,4}/;

  const urlMatch = title.match(urlRegex);
  const emailMatch = title.match(emailRegex);
  const phoneMatch = title.match(phoneRegex);

  if (urlMatch || emailMatch || phoneMatch) {
    const found = urlMatch?.[0] || emailMatch?.[0] || phoneMatch?.[0];
    violations.push({
      type: "Violation",
      rule: "Contact Information Detected",
      message: "Title should not contain URLs, emails, or phone numbers.",
      matchedText: found,
    });
  }

  // ── RULE 11: DECORATIVE SYMBOLS (RISK) ──
  const decorativeRegex = /[★☆♦▪♥❤💎✨🔥⭐]/g;
  const decorativeMatches = title.match(decorativeRegex);

  if (decorativeMatches && decorativeMatches.length > 0) {
    violations.push({
      type: "Risk",
      rule: "Decorative Symbols",
      message: `Detected ${decorativeMatches.length} decorative symbol(s). Use sparingly for clarity.`,
      matchedText: decorativeMatches.join(""),
    });
  }

  // ── RULE 12: SEPARATOR SPAM (RISK) ──
  const separatorMatches = title.match(/[|:]/g) || [];

  if (separatorMatches.length >= 3) {
    violations.push({
      type: "Risk",
      rule: "Separator Spam",
      message: `Detected ${separatorMatches.length} separators. Limit use of | and : characters.`,
      matchedText: separatorMatches.join(""),
    });
  }

  // ── RULE 13: KEYWORD STUFFING (RISK) ──
  const words = title.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  const wordFreq = {};

  for (const word of words) {
    if (word.length > 2) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }

  for (const [word, count] of Object.entries(wordFreq)) {
    if (count >= 2) {
      violations.push({
        type: "Risk",
        rule: "Keyword Stuffing",
        message: `Keyword "${word}" repeated ${count} times. Avoid repetition.`,
        matchedText: word,
      });
    }
  }

  // ── RULE 14: UNDERUTILIZED TITLE (TIP) ──
  if (title.length < 20) {
    violations.push({
      type: "Tip",
      rule: "Underutilized Title",
      message: `Title is ${title.length} characters. Consider using more space (20+ chars recommended).`,
    });
  }

  // ── CALCULATE COMPLIANCE SCORE ──
  let score = 100;

  for (const violation of violations) {
    if (violation.type === "Violation") {
      score -= 20;
    } else if (violation.type === "Risk") {
      score -= 10;
    }
    // Tips do not reduce score
  }

  score = Math.max(0, score);

  return {
    complianceScore: score,
    violations,
  };
}
