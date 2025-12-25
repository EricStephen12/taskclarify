import { TaskType } from '@/types';

// Keyword indicators for each task type
const PERSONAL_INDICATORS = [
  'budget', 'buy', 'shopping', 'rent', 'salary', 'savings', 'personal',
  'myself', 'i want', 'i need', 'my plan', 'spend', 'purchase', 'clothes',
  'pay', 'money', 'naira', 'dollar', 'k max', 'emergency fund', 'allowance',
  'bargain', 'market', 'location:', 'go early', 'select', 'pieces'
];

const SOFTWARE_INDICATORS = [
  'feature', 'api', 'database', 'user story', 'acceptance criteria',
  'system', 'application', 'frontend', 'backend', 'deploy', 'endpoint',
  'component', 'interface', 'module', 'function', 'class', 'method',
  'authentication', 'authorization', 'crud', 'rest', 'graphql', 'ui/ux'
];

const BUSINESS_INDICATORS = [
  'stakeholder', 'kpi', 'roi', 'revenue', 'profit', 'strategy',
  'operations', 'process', 'workflow', 'team', 'department', 'quarterly',
  'annual', 'meeting', 'presentation', 'report', 'analysis'
];

const MARKETING_INDICATORS = [
  'campaign', 'ads', 'advertisement', 'target audience', 'conversion',
  'leads', 'brand', 'social media', 'facebook', 'instagram', 'twitter',
  'content', 'seo', 'engagement', 'reach', 'impressions', 'ctr'
];

const FINANCIAL_INDICATORS = [
  'investment', 'portfolio', 'stocks', 'bonds', 'dividend', 'interest',
  'loan', 'mortgage', 'tax', 'accounting', 'balance sheet', 'cash flow',
  'assets', 'liabilities', 'equity', 'depreciation'
];

interface DetectionResult {
  detectedType: TaskType;
  confidence: number;
  scores: Record<TaskType, number>;
}

/**
 * Detects the task type from input notes using keyword analysis
 */
export function detectTaskType(notes: string): TaskType {
  const result = analyzeTaskType(notes);
  return result.detectedType;
}

/**
 * Analyzes notes and returns detailed detection result with confidence scores
 */
export function analyzeTaskType(notes: string): DetectionResult {
  const lowerNotes = notes.toLowerCase();
  
  const scores: Record<TaskType, number> = {
    auto: 0,
    personal: countMatches(lowerNotes, PERSONAL_INDICATORS),
    software: countMatches(lowerNotes, SOFTWARE_INDICATORS),
    business: countMatches(lowerNotes, BUSINESS_INDICATORS),
    marketing: countMatches(lowerNotes, MARKETING_INDICATORS),
    financial: countMatches(lowerNotes, FINANCIAL_INDICATORS)
  };
  
  // Find the type with highest score
  let maxScore = 0;
  let detectedType: TaskType = 'software'; // default
  
  for (const [type, score] of Object.entries(scores)) {
    if (type !== 'auto' && score > maxScore) {
      maxScore = score;
      detectedType = type as TaskType;
    }
  }
  
  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? maxScore / totalScore : 0;
  
  return {
    detectedType,
    confidence,
    scores
  };
}

function countMatches(text: string, indicators: string[]): number {
  return indicators.filter(indicator => text.includes(indicator)).length;
}
