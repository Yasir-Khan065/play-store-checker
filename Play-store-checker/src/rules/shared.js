import {
  checkTitleLength,
  checkRankingTerms,
  checkDealPromotionTerms,
  checkPlayProgramsTerms,
  checkCtaTerms,
  checkCurrency,
  checkPercentOff,
  checkLimitedTime,
  checkCashback,
  checkRankClaims,
  checkDownloadCta,
  checkAllCaps,
  checkEmoji,
  checkSpecialCharRepetition,
  checkContactInfo,
  checkDecorativeSymbols,
  checkSeparatorSpam,
  checkKeywordStuffing,
  checkShortTitle,
  checkTitleCompliance,
} from "./title.js";
import { checkShortLength } from "./short.js";
import { checkFullLength } from "./full.js";

// Helper to flatten and filter issues
function flattenIssues(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  return [result];
}

export function analyzeListing({ title, short, full }) {
  const issues = [];

  // ── TITLE RULES ──
  issues.push(...flattenIssues(checkTitleLength(title)));
  issues.push(...flattenIssues(checkRankingTerms(title)));
  issues.push(...flattenIssues(checkDealPromotionTerms(title)));
  issues.push(...flattenIssues(checkPlayProgramsTerms(title)));
  issues.push(...flattenIssues(checkCtaTerms(title)));
  issues.push(...flattenIssues(checkCurrency(title)));
  issues.push(...flattenIssues(checkPercentOff(title)));
  issues.push(...flattenIssues(checkLimitedTime(title)));
  issues.push(...flattenIssues(checkCashback(title)));
  issues.push(...flattenIssues(checkRankClaims(title)));
  issues.push(...flattenIssues(checkDownloadCta(title)));
  issues.push(...flattenIssues(checkAllCaps(title)));
  issues.push(...flattenIssues(checkEmoji(title)));
  issues.push(...flattenIssues(checkSpecialCharRepetition(title)));
  issues.push(...flattenIssues(checkContactInfo(title)));
  issues.push(...flattenIssues(checkDecorativeSymbols(title)));
  issues.push(...flattenIssues(checkSeparatorSpam(title)));
  issues.push(...flattenIssues(checkKeywordStuffing(title)));
  issues.push(...flattenIssues(checkShortTitle(title)));

  // ── SHORT DESCRIPTION RULES ──
  issues.push(...flattenIssues(checkShortLength(short)));

  // ── FULL DESCRIPTION RULES ──
  issues.push(...flattenIssues(checkFullLength(full)));

  return issues;
}

// ────────────────────────────────────────────────────────────────
// ── STRICT GOOGLE PLAY STORE TITLE COMPLIANCE CHECKER ──
// ────────────────────────────────────────────────────────────────
//
// Returns: { complianceScore: number, violations: array }
// Usage: const result = checkTitleCompliance(title);
//
export function getTitleCompliance(title) {
  return checkTitleCompliance(title);
}
