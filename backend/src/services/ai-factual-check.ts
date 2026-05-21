/**
 * AI Factual Check Service
 * =================
 * Uses Gemini to verify claims against known facts
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FactualCheckRequest {
  claim: string;
  context?: string;
  knownFacts?: string;
  source?: string;
  sourceType?: string;
  reportedAt?: string;
  location?: string;
}

export interface FactualCheckResult {
  verdict: 'TRUE' | 'LIKELY_TRUE' | 'UNCERTAIN' | 'LIKELY_FALSE' | 'FALSE';
  confidence: number;
  evidence: FactualEvidence[];
  analysis: string;
  flags: string[];
  checked_at: Date;
}

export interface FactualEvidence {
  fact: string;
  source: string;
  type: 'supporting' | 'contradicting' | 'neutral';
}

export interface FactualCheckReport {
  report_id: string;
  request: FactualCheckRequest;
  result: FactualCheckResult;
}

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-pro';

/**
 * AI Factual Check Service
 */
class AIFactualCheckService {
  private promptTemplate: string;

  constructor() {
    // Load prompt template
    const templatePath = path.join(__dirname, '../data/factual-check-prompt.md');
    this.promptTemplate = fs.existsSync(templatePath)
      ? fs.readFileSync(templatePath, 'utf-8')
      : this.getDefaultTemplate();
  }

  /**
   * Get default template
   */
  private getDefaultTemplate(): string {
    return `You are an expert fact-checker. Analyze the claim and respond in JSON:
{
  "verdict": "TRUE|LIKELY_TRUE|UNCERTAIN|LIKELY_FALSE|FALSE",
  "confidence": 0-100,
  "evidence": [{"fact": "", "source": "", "type": "supporting|contradicting|neutral"}],
  "analysis": "",
  "flags": []
}`;
  }

  /**
   * Replace placeholders in template
   */
  private buildPrompt(request: FactualCheckRequest): string {
    let prompt = this.promptTemplate;

    prompt = prompt.replace('{claim}', request.claim);
    prompt = prompt.replace('{context}', request.context || 'No additional context');
    prompt = prompt.replace('{known_facts}', request.knownFacts || 'No known facts provided');
    prompt = prompt.replace('{source}', request.source || 'Unknown');
    prompt = prompt.replace('{source_type}', request.sourceType || 'Unknown');
    prompt = prompt.replace('{reported_at}', request.reportedAt || new Date().toISOString());
    prompt = prompt.replace('{location}', request.location || 'Unknown');

    return prompt;
  }

  /**
   * Check a claim
   */
  async checkClaim(request: FactualCheckRequest): Promise<FactualCheckReport> {
    const reportId = `factual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!GEMINI_API_KEY) {
      console.warn('[FACTUAL_CHECK] No GEMINI_API_KEY configured');
      return {
        report_id: reportId,
        request,
        result: {
          verdict: 'UNCERTAIN',
          confidence: 0,
          evidence: [],
          analysis: 'Gemini API not configured',
          flags: ['API key missing'],
          checked_at: new Date(),
        },
      };
    }

    try {
      const prompt = this.buildPrompt(request);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse response
      const result = this.parseResponse(text);

      console.log(`[FACTUAL_CHECK] ${reportId}: ${result.verdict} (${result.confidence}%)`);

      return { report_id: reportId, request, result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[FACTUAL_CHECK] Error:', errorMessage);
      return {
        report_id: reportId,
        request,
        result: {
          verdict: 'UNCERTAIN',
          confidence: 0,
          evidence: [],
          analysis: `Error: ${errorMessage}`,
          flags: ['API error'],
          checked_at: new Date(),
        },
      };
    }
  }

  /**
   * Parse Gemini response
   */
  private parseResponse(text: string): FactualCheckResult {
    const defaultResult: FactualCheckResult = {
      verdict: 'UNCERTAIN',
      confidence: 50,
      evidence: [],
      analysis: text,
      flags: [],
      checked_at: new Date(),
    };

    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { ...defaultResult, analysis: text };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        verdict: this.validateVerdict(parsed.verdict),
        confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
        evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
        analysis: parsed.analysis || text,
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        checked_at: new Date(),
      };
    } catch {
      return { ...defaultResult, analysis: text };
    }
  }

  /**
   * Validate verdict value
   */
  private validateVerdict(value: string): FactualCheckResult['verdict'] {
    const valid = ['TRUE', 'LIKELY_TRUE', 'UNCERTAIN', 'LIKELY_FALSE', 'FALSE'];
    if (valid.includes(value)) {
      return value as FactualCheckResult['verdict'];
    }
    return 'UNCERTAIN';
  }

  /**
   * Batch check multiple claims
   */
  async batchCheck(claims: FactualCheckRequest[]): Promise<FactualCheckReport[]> {
    return Promise.all(claims.map((claim) => this.checkClaim(claim)));
  }

  /**
   * Quick check (synchronous, simplified)
   */
  async quickCheck(claim: string): Promise<FactualCheckResult> {
    const report = await this.checkClaim({ claim });
    return report.result;
  }
}

// Export for CommonJS
export { AIFactualCheckService as AIFactualCheckService };